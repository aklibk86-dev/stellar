// ============================================================
// 支付结果处理（单一实现，Checkout.vue 与 Orders.vue 共用）
// ============================================================
// 收敛前两个视图各有一份复制粘贴的实现，容易漂移；
// 本模块统一提供：结果归一化、错误文案、跳转/表单/blob 三态打开、
// 以及支付方式排除策略（StripeCredit 默认黑名单 + env.js 可配置名单）。
// ============================================================

import i18n from '@/i18n'
import { sanitizeHtml } from '@/utils/safe'

export interface CheckoutResult {
  type: number
  data: string | boolean | null
  redirect?: boolean
}

/**
 * 归一化结算接口返回：兼容两种形态
 * - 直接返回 { type, data, ... }
 * - 包在 res.data 里（{ data: { type, data, ... } }）
 */
export const normalizeCheckoutResult = (res: any): CheckoutResult | null => {
  if (res && typeof res.type === 'number') return res
  if (res?.data && typeof res.data.type === 'number') return res.data
  return null
}

/** 提取后端返回的错误信息；非字符串视为支付方式不可用 */
export const getCheckoutErrorMessage = (data: unknown) => {
  if (typeof data === 'string' && data.trim()) return data
  return i18n.global.t('order.paymentUnavailable')
}

export const isHttpUrl = (value: string) => /^https?:\/\//i.test(value)

/**
 * 打开支付返回内容：统一处理三种形态
 * - http(s) URL：当前页面直接跳转（避免浏览器弹窗拦截）
 * - HTML 表单 / HTML 页面：解析并自动提交第一个表单
 * - 其他内容：以 blob URL 在当前页面打开
 */
export const openPaymentData = (data: string) => {
  if (isHttpUrl(data)) {
    // 直接在当前页面跳转，避免浏览器弹窗拦截
    window.location.href = data
    return
  }

  // 部分支付网关会直接返回 HTML 表单，而不是 URL
  if (/<form[\s\S]*<\/form>/i.test(data) || /<html[\s\S]*<\/html>/i.test(data)) {
    // 创建临时容器，解析并提交表单
    const div = document.createElement('div')
    div.innerHTML = sanitizeHtml(data)
    document.body.appendChild(div)
    // 自动提交第一个表单
    const form = div.querySelector('form')
    if (form) {
      form.target = '_self'
      form.submit()
      return
    }
    // 如果没有表单，直接写入页面
    document.body.innerHTML = sanitizeHtml(data)
    return
  }

  // 其他返回内容：使用 blob URL 在当前页面打开
  const blob = new Blob([sanitizeHtml(data)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.location.href = url
}

/**
 * 前端内置支付方式黑名单。
 * StripeCredit 需要客户端侧银行卡 token 化，本主题无法安全提交，默认不展示；
 * 待后端支持可安全结算后，从黑名单移除即可放开。
 */
const BUILT_IN_EXCLUDED_PAYMENTS: string[] = ['StripeCredit']

/**
 * 判断某支付方式是否应被隐藏：
 * - 命中内置黑名单（StripeCredit）
 * - 命中 env.js 配置的 api.exclude_payment_methods（可选，默认空）
 */
export const shouldExcludePaymentMethod = (payment: string | undefined | null): boolean => {
  const value = (payment || '').trim()
  if (!value) return false
  if (BUILT_IN_EXCLUDED_PAYMENTS.includes(value)) return true
  const configured = window.settings?.api?.exclude_payment_methods
  return Array.isArray(configured) && configured.includes(value)
}

/**
 * 过滤支付方式列表（两页共用，保证行为一致）。
 * @param methods 后端返回的支付方式列表
 * @returns 过滤掉被排除支付方式后的列表
 */
export const filterPaymentMethods = <T extends { payment?: string }>(methods: T[]): T[] =>
  methods.filter(method => !shouldExcludePaymentMethod(method.payment))
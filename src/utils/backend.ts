// ============================================================
// 后端适配层：让 Stellar 主题同时兼容 cedar2025/Xboard 与
// wyx2685/v2board（及兼容的原版 v2board）两类后端。
// ============================================================

import { getApiConfig } from './apiConfig'

export type BackendType = 'xboard' | 'v2board' | 'auto'

// 运行时实际生效的后端类型，auto 模式下探测完成后会被锁定
const STORAGE_KEY = 'stellar_backend_type'
let resolvedBackend: 'xboard' | 'v2board' | null = localStorage.getItem(STORAGE_KEY) as 'xboard' | 'v2board' | null

/**
 * 从 env.js 读取用户配置的后端类型
 */
export function getConfiguredBackend(): 'xboard' | 'v2board' | 'auto' {
  const cfg = getApiConfig() as { backend_type?: BackendType }
  const t = cfg?.backend_type
  if (t === 'xboard' || t === 'v2board') return t
  return 'auto'
}

/**
 * 获取当前生效的后端类型
 * - 显式配置时直接返回
 * - auto 模式优先返回已探测结果，未探测时回退到 'xboard' 作为默认猜测
 */
export function getBackendType(): 'xboard' | 'v2board' {
  const configured = getConfiguredBackend()
  if (configured !== 'auto') return configured
  if (resolvedBackend) return resolvedBackend
  return 'xboard'
}

/**
 * 显式标记当前后端类型（用于 auto 模式探测完成后写入）
 */
export function setDetectedBackend(type: 'xboard' | 'v2board') {
  resolvedBackend = type
  localStorage.setItem(STORAGE_KEY, type)
}

/**
 * 是否为 auto 模式（需要后续探测）
 */
export function isAutoDetectMode(): boolean {
  return getConfiguredBackend() === 'auto'
}

// ============================================================
// 后端能力声明：用于 UI 层决定是否渲染某些功能入口
// ============================================================

export interface BackendCapabilities {
  /** 魔法链接登录（邮件中的一次性链接） */
  magicLinkLogin: boolean
  /** 游客获取套餐列表（无需登录即可看套餐） */
  guestPlanFetch: boolean
  /** 礼品卡：完整模块（check/redeem/history/types） */
  giftCardFull: boolean
  /** 礼礼卡：仅兑换（v2board 风格的单接口） */
  giftCardRedeemOnly: boolean
  /** 工单提现（通过工单发起佣金提现） */
  ticketWithdraw: boolean
  /** 流量提前重置（扣减到期时间换流量） */
  newPeriod: boolean
  /** 解绑 Telegram 账号 */
  unbindTelegram: boolean
  /** 订阅信息中包含 speed_limit / next_reset_at 字段 */
  subscribeSpeedLimit: boolean
  /** 订阅信息中包含 alive_ip / allow_new_period 字段 */
  subscribeAliveIp: boolean
  /** 用户信息中包含 device_limit / auto_renewal 字段 */
  userDeviceLimit: boolean
  /** guest config 含 is_captcha / captcha_type / turnstile / recaptcha_v3 */
  advancedCaptcha: boolean
  /** 节点接口使用 API Resource 转换字段（Xboard 风格） */
  nodeResource: boolean
}

const XBOARD_CAPS: BackendCapabilities = {
  magicLinkLogin: true,
  guestPlanFetch: true,
  giftCardFull: true,
  giftCardRedeemOnly: false,
  ticketWithdraw: true,
  newPeriod: false,
  unbindTelegram: false,
  subscribeSpeedLimit: true,
  subscribeAliveIp: false,
  userDeviceLimit: false,
  advancedCaptcha: true,
  nodeResource: true,
}

const V2BOARD_CAPS: BackendCapabilities = {
  magicLinkLogin: false,
  guestPlanFetch: false,
  giftCardFull: false,
  giftCardRedeemOnly: true,
  ticketWithdraw: true,
  newPeriod: true,
  unbindTelegram: true,
  subscribeSpeedLimit: false,
  subscribeAliveIp: true,
  userDeviceLimit: true,
  advancedCaptcha: false,
  nodeResource: false,
}

export function getBackendCapabilities(): BackendCapabilities {
  return getBackendType() === 'v2board' ? V2BOARD_CAPS : XBOARD_CAPS
}

/** 单一能力查询快捷函数 */
export function can(feature: keyof BackendCapabilities): boolean {
  return getBackendCapabilities()[feature]
}

// ============================================================
// API 路径表：按后端类型返回差异化的接口路径
// ============================================================

export interface ApiPaths {
  // guest
  guestConfig: string
  guestPlanFetch: string
  // passport
  login: string
  register: string
  forget: string
  token2Login: string
  getQuickLoginUrl: string
  loginWithMailLink: string
  sendEmailVerify: string
  // user
  userInfo: string
  userSubscribe: string
  userStat: string
  changePassword: string
  userUpdate: string
  userQuickLoginUrl: string
  checkLogin: string
  transfer: string
  resetSecurity: string
  getActiveSession: string
  removeActiveSession: string
  userConfig: string
  // 订单
  orderFetch: string
  orderSave: string
  orderCheckout: string
  orderCheck: string
  orderDetail: string
  orderCancel: string
  getPaymentMethod: string
  // 套餐
  planFetch: string
  // 邀请
  inviteFetch: string
  inviteDetails: string
  inviteSave: string
  // 公告
  noticeFetch: string
  // 工单
  ticketFetch: string
  ticketSave: string
  ticketReply: string
  ticketClose: string
  ticketWithdraw: string
  // 服务器
  serverFetch: string
  // 优惠券
  couponCheck: string
  // 礼品卡
  giftCardCheck: string
  giftCardRedeem: string
  giftCardHistory: string
  // Telegram
  telegramBotInfo: string
  unbindTelegram: string
  // 知识库
  knowledgeFetch: string
  knowledgeGetCategory: string
  // 流量统计
  trafficLog: string
  // Stripe
  stripePublicKey: string
  // 新增周期（流量提前重置）
  newPeriod: string
}

const XBOARD_PATHS: ApiPaths = {
  guestConfig: '/api/v1/guest/comm/config',
  guestPlanFetch: '/api/v1/guest/plan/fetch',
  login: '/api/v1/passport/auth/login',
  register: '/api/v1/passport/auth/register',
  forget: '/api/v1/passport/auth/forget',
  token2Login: '/api/v1/passport/auth/token2Login',
  getQuickLoginUrl: '/api/v1/passport/auth/getQuickLoginUrl',
  loginWithMailLink: '/api/v1/passport/auth/loginWithMailLink',
  sendEmailVerify: '/api/v1/passport/comm/sendEmailVerify',
  userInfo: '/api/v1/user/info',
  userSubscribe: '/api/v1/user/getSubscribe',
  userStat: '/api/v1/user/getStat',
  changePassword: '/api/v1/user/changePassword',
  userUpdate: '/api/v1/user/update',
  userQuickLoginUrl: '/api/v1/user/getQuickLoginUrl',
  checkLogin: '/api/v1/user/checkLogin',
  transfer: '/api/v1/user/transfer',
  resetSecurity: '/api/v1/user/resetSecurity',
  getActiveSession: '/api/v1/user/getActiveSession',
  removeActiveSession: '/api/v1/user/removeActiveSession',
  userConfig: '/api/v1/user/comm/config',
  orderFetch: '/api/v1/user/order/fetch',
  orderSave: '/api/v1/user/order/save',
  orderCheckout: '/api/v1/user/order/checkout',
  orderCheck: '/api/v1/user/order/check',
  orderDetail: '/api/v1/user/order/detail',
  orderCancel: '/api/v1/user/order/cancel',
  getPaymentMethod: '/api/v1/user/order/getPaymentMethod',
  planFetch: '/api/v1/user/plan/fetch',
  inviteFetch: '/api/v1/user/invite/fetch',
  inviteDetails: '/api/v1/user/invite/details',
  inviteSave: '/api/v1/user/invite/save',
  noticeFetch: '/api/v1/user/notice/fetch',
  ticketFetch: '/api/v1/user/ticket/fetch',
  ticketSave: '/api/v1/user/ticket/save',
  ticketReply: '/api/v1/user/ticket/reply',
  ticketClose: '/api/v1/user/ticket/close',
  ticketWithdraw: '/api/v1/user/ticket/withdraw',
  serverFetch: '/api/v1/user/server/fetch',
  couponCheck: '/api/v1/user/coupon/check',
  giftCardCheck: '/api/v1/user/gift-card/check',
  giftCardRedeem: '/api/v1/user/gift-card/redeem',
  giftCardHistory: '/api/v1/user/gift-card/history',
  telegramBotInfo: '/api/v1/user/telegram/getBotInfo',
  unbindTelegram: '/api/v1/user/unbindTelegram',
  knowledgeFetch: '/api/v1/user/knowledge/fetch',
  knowledgeGetCategory: '/api/v1/user/knowledge/getCategory',
  trafficLog: '/api/v1/user/stat/getTrafficLog',
  stripePublicKey: '/api/v1/user/comm/getStripePublicKey',
  newPeriod: '/api/v1/user/newPeriod',
}

// v2board (wyx2685) 与 xboard 共用大部分路径，差异项覆盖如下
const V2BOARD_PATHS: ApiPaths = {
  ...XBOARD_PATHS,
  // wyx2685 没有游客套餐接口与魔法链接登录
  guestPlanFetch: '',
  loginWithMailLink: '',
  // 礼品卡只有一个兑换接口（路径不同）
  giftCardCheck: '',
  giftCardRedeem: '/api/v1/user/redeemgiftcard',
  giftCardHistory: '',
  // wyx2685 没有解绑 Telegram 接口（路由表中无此条目，但实际可能支持）
  // 这里保留路径，由 can('unbindTelegram') 控制 UI 显示
}

/**
 * 获取当前后端的 API 路径表
 */
export function getApiPaths(): ApiPaths {
  return getBackendType() === 'v2board' ? V2BOARD_PATHS : XBOARD_PATHS
}

// ============================================================
// 字段适配：将不同后端的响应归一化为前端使用的统一结构
// ============================================================

import type { User, Subscribe, GuestConfig, Coupon } from '@/api/types'

/**
 * 归一化用户信息字段
 * - v2board info 中含 device_limit / auto_renewal
 * - xboard info 中无，需要从 subscribe 中取 device_limit
 */
export function normalizeUser(raw: any, subscribe?: Subscribe | null): User {
  if (!raw) return raw
  return {
    ...raw,
    // 兜底：xboard info 无 device_limit 时，从 subscribe 取
    device_limit: raw.device_limit ?? subscribe?.device_limit ?? null,
    // v2board 独有字段，xboard 下兜底为 false
    auto_renewal: raw.auto_renewal ?? false,
  } as User
}

/**
 * 归一化订阅信息字段
 * - xboard subscribe 含 speed_limit / next_reset_at
 * - v2board subscribe 含 alive_ip / allow_new_period
 */
export function normalizeSubscribe(raw: any): Subscribe {
  if (!raw) return raw
  return {
    ...raw,
    // xboard 独有字段，v2board 下兜底
    speed_limit: raw.speed_limit ?? null,
    next_reset_at: raw.next_reset_at ?? null,
    // v2board 独有字段，xboard 下兜底
    alive_ip: raw.alive_ip ?? 0,
    allow_new_period: raw.allow_new_period ?? false,
  } as Subscribe
}

/**
 * 归一化 guest config 字段
 * - xboard 使用 is_captcha / captcha_type / turnstile_site_key / recaptcha_v3_*
 * - v2board 仅使用 is_recaptcha
 * 统一输出：is_captcha 优先，回退到 is_recaptcha
 */
export function normalizeGuestConfig(raw: any): GuestConfig {
  if (!raw) return raw
  const isCaptcha = raw.is_captcha ?? raw.is_recaptcha ?? 0
  return {
    ...raw,
    is_captcha: isCaptcha,
    is_recaptcha: raw.is_recaptcha ?? isCaptcha,
    captcha_type: raw.captcha_type ?? 'recaptcha',
    turnstile_site_key: raw.turnstile_site_key ?? null,
    recaptcha_v3_site_key: raw.recaptcha_v3_site_key ?? null,
    recaptcha_v3_score_threshold: raw.recaptcha_v3_score_threshold ?? 0.5,
  } as GuestConfig
}

// ============================================================
// auto 模式：通过 guest config 接口特征自动探测后端类型
// ============================================================

/**
 * 根据 guest/comm/config 返回的字段判断后端类型
 * - 含 is_captcha / captcha_type / turnstile_site_key 任一 → xboard
 * - 仅含 is_recaptcha → v2board
 * - 含 logo 且字段极简 → v2board
 * 无法确定时保持默认（xboard）
 */
export function detectBackendFromGuestConfig(config: any): 'xboard' | 'v2board' | null {
  if (!config || typeof config !== 'object') return null
  const xboardSignals = [
    config.is_captcha !== undefined,
    config.captcha_type !== undefined,
    config.turnstile_site_key !== undefined,
    config.recaptcha_v3_site_key !== undefined,
  ]
  if (xboardSignals.some(Boolean)) return 'xboard'
  // 仅 v2board 的 is_recaptcha 字段
  if (config.is_recaptcha !== undefined && config.is_captcha === undefined) return 'v2board'
  return null
}

/**
 * 归一化优惠券字段
 * - xboard: type='fixed'|'percentage', percentage 的 value 为小数（如 0.2 表示 20%）
 * - v2board: type=1|2, percentage 的 value 为整数（如 20 表示 20%）
 * 统一输出: type 为字符串，percentage 的 value 为小数
 */
export function normalizeCoupon(raw: any): Coupon {
  if (!raw) return raw
  const backendType = getBackendType()

  // v2board: type 是数字 (1=固定金额, 2=百分比)
  if (backendType === 'v2board' || typeof raw.type === 'number') {
    const isPercentage = raw.type === 2
    return {
      ...raw,
      type: isPercentage ? 'percentage' : 'fixed',
      // v2board 的 percentage value 是整数（如 20），需要转换为小数（如 0.2）
      value: isPercentage && raw.value > 1 ? raw.value / 100 : raw.value,
    } as Coupon
  }

  // xboard: type 是字符串，percentage 的 value 已经是小数
  return {
    ...raw,
    type: raw.type === 'percentage' ? 'percentage' : 'fixed',
    value: raw.value,
  } as Coupon
}

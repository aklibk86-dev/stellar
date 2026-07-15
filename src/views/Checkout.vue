<template>
  <div class="checkout-page">
    <!-- 返回按钮 -->
    <div class="page-header">
      <n-button quaternary size="small" @click="$router.push('/plans')" class="back-btn">
        <template #icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </template>
        {{ t('order.backToPlans') }}
      </n-button>
      <h1 class="page-title">{{ t('order.orderConfirm') }}</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <n-skeleton text :repeat="8" />
    </div>

    <div v-else-if="!plan" class="empty-state">
      <p>{{ t('common.noData') }}</p>
      <n-button type="primary" @click="$router.push('/plans')">{{ t('order.backToPlans') }}</n-button>
    </div>

    <div v-else class="checkout-content">
      <!-- 左侧 -->
      <div class="checkout-left">
        <!-- 套餐信息 -->
        <div class="section-card">
          <h3 class="section-title">{{ t('plan.selectedPlan') }}</h3>
          <div class="plan-info">
            <div class="plan-info-header">
              <h4 class="plan-info-name">{{ plan.name }}</h4>
              <p v-if="plan.content" class="plan-info-desc">{{ plan.content }}</p>
            </div>
            <div class="plan-info-features">
              <div class="info-feature">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span>{{ plan.transfer_enable ? formatPlanTraffic(plan.transfer_enable) : '-' }}</span>
              </div>
              <div class="info-feature">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span>{{ plan.speed_limit ? plan.speed_limit + ' Mbps' : t('plan.noSpeedLimit') }}</span>
              </div>
              <div class="info-feature">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
                <span>{{ plan.device_limit ? plan.device_limit + ' ' + t('plan.features_devices') : t('plan.noDeviceLimit') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 计费周期选择（仅新建订单时显示） -->
        <div v-if="!existingTradeNo" class="section-card">
          <h3 class="section-title">{{ t('order.selectPeriod') }}</h3>
          <div class="period-grid">
            <div
              v-for="item in availablePeriods"
              :key="item.period"
              class="period-item"
              :class="{ active: selectedPeriod === item.period }"
              @click="selectedPeriod = item.period"
            >
              <div class="period-radio" :class="{ checked: selectedPeriod === item.period }"></div>
              <div class="period-info">
                <span class="period-label">{{ item.label }}</span>
                <span class="period-price">¥{{ formatPrice(item.value) }}</span>
              </div>
              <div v-if="item.saving" class="period-saving">{{ t('plan.saving') }} ¥{{ formatPrice(item.saving) }}</div>
            </div>
          </div>
        </div>

        <!-- 优惠码（仅新建订单时显示） -->
        <div v-if="!existingTradeNo" class="section-card">
          <h3 class="section-title">{{ t('plan.couponCode') }}</h3>
          <div class="coupon-row">
            <n-input
              v-model:value="couponCode"
              :placeholder="t('plan.couponPlaceholder')"
              :disabled="couponApplied"
              clearable
            />
            <n-button
              :type="couponApplied ? 'success' : 'primary'"
              :disabled="!couponCode || couponApplied"
              :loading="couponLoading"
              @click="applyCoupon"
            >
              {{ couponApplied ? t('plan.couponApplied') : t('plan.couponApply') }}
            </n-button>
            <n-button v-if="couponApplied" quaternary @click="resetCoupon">
              {{ t('common.cancel') }}
            </n-button>
          </div>
        </div>

        <!-- 支付方式：参考 EZ_THEME，仅订单创建后且仍需支付时显示 -->
        <div v-if="existingTradeNo && actualPayAmount > 0" class="section-card">
          <h3 class="section-title">{{ t('order.paymentMethod') }}</h3>
          <div v-if="paymentMethods.length === 0" class="no-payment">
            <span>{{ t('order.selectPayment') }}</span>
          </div>
          <div v-else class="payment-grid">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-item"
              :class="{ active: selectedPayment === method.id }"
              @click="selectedPayment = method.id; paymentError = ''"
            >
              <div class="payment-radio" :class="{ checked: selectedPayment === method.id }"></div>
              <div class="payment-info">
                <div class="payment-icon-wrapper">
                  <img v-if="method.icon" :src="method.icon" :alt="method.name" class="payment-icon" />
                  <div v-else class="payment-icon-placeholder">{{ method.name.charAt(0) }}</div>
                </div>
                <span class="payment-name">{{ method.name }}</span>
              </div>
            </div>
          </div>
          <div v-if="stripePublicKey" class="stripe-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Stripe Secured</span>
          </div>
        </div>
      </div>

      <!-- 右侧：订单摘要 -->
      <div class="checkout-right">
        <div class="section-card summary-card">
          <h3 class="section-title">{{ t('plan.orderSummary') }}</h3>
          <div class="summary-rows">
            <div class="summary-row">
              <span class="summary-label">{{ t('plan.selectedPlan') }}</span>
              <span class="summary-value highlight">{{ plan.name }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">{{ t('plan.selectedPeriod') }}</span>
              <span class="summary-value">{{ getPeriodLabel(selectedPeriod) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">{{ t('plan.originalPrice') }}</span>
              <span class="summary-value">¥{{ formatPrice(originalPrice) }}</span>
            </div>
            <div v-if="couponDiscount > 0" class="summary-row discount">
              <span class="summary-label">{{ t('plan.couponDiscount') }}</span>
              <span class="summary-value">-¥{{ formatPrice(couponDiscount) }}</span>
            </div>
            <template v-if="orderDetail">
              <div v-if="orderDetail.surplus_amount > 0" class="summary-row discount">
                <span class="summary-label">{{ t('order.surplusDiscount') }}</span>
                <span class="summary-value">-¥{{ formatPrice(orderDetail.surplus_amount) }}</span>
              </div>
              <div v-if="orderDetail.balance_amount > 0" class="summary-row discount">
                <span class="summary-label">{{ t('order.balanceDiscount') }}</span>
                <span class="summary-value">-¥{{ formatPrice(orderDetail.balance_amount) }}</span>
              </div>
            </template>
            <div class="summary-row total">
              <span class="summary-label">{{ t('plan.finalPrice') }}</span>
              <span class="summary-value price-final">¥{{ formatPrice(displayFinalPrice) }}</span>
            </div>
          </div>

          <!-- 余额/套餐折抵提示：参考 EZ_THEME，在后端订单详情返回后展示真实抵扣结果 -->
          <n-alert v-if="existingTradeNo && actualPayAmount === 0" type="success" :show-icon="true" class="payment-error">
            {{ t('order.freeOrderTip') }}
          </n-alert>

          <n-alert v-if="paymentError" type="error" :show-icon="true" class="payment-error">
            {{ paymentError }}
          </n-alert>

          <!-- 确认按钮 -->
          <n-button
            type="primary"
            block
            size="large"
            :loading="submitting"
            :disabled="!canSubmitOrder"
            @click="submitOrder"
            class="submit-btn"
          >
            {{ submitButtonText }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, NButton, NInput, NSkeleton, NAlert } from 'naive-ui'
import { userApi } from '@/api'
import type { Plan, PaymentMethod, Coupon } from '@/api/types'
import { formatPlanTraffic, formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const message = useMessage()

const plan = ref<Plan | null>(null)
const loading = ref(true)
const submitting = ref(false)
const selectedPeriod = ref('')
const selectedPayment = ref<number | string | null>(null)
const existingTradeNo = ref<string>('')  // 已创建订单的 trade_no
const orderDetail = ref<any | null>(null)
const paymentMethods = ref<PaymentMethod[]>([])
const stripePublicKey = ref('')
const paymentError = ref('')

// 优惠码
const couponCode = ref('')
const couponApplied = ref(false)
const couponLoading = ref(false)
const couponData = ref<Coupon | null>(null)

const hasSelectedPayment = computed(() => selectedPayment.value !== null && selectedPayment.value !== '')
const actualPayAmount = computed(() => orderDetail.value ? Number(orderDetail.value.total_amount || 0) : finalPrice.value)
const displayFinalPrice = computed(() => existingTradeNo.value ? actualPayAmount.value : finalPrice.value)
const canSubmitOrder = computed(() => {
  if (!selectedPeriod.value || submitting.value) return false
  if (!existingTradeNo.value) return true
  if (actualPayAmount.value <= 0) return true
  return hasSelectedPayment.value
})
const submitButtonText = computed(() => {
  if (!existingTradeNo.value) return t('order.placeOrder')
  if (actualPayAmount.value <= 0) return t('order.activateOrder')
  return `${t('order.confirmPay')} ¥${formatPrice(actualPayAmount.value)}`
})

// 价格周期配置
const periodConfig = [
  { field: 'month_price' as const, period: 'month_price', labelKey: 'plan.month' },
  { field: 'quarter_price' as const, period: 'quarter_price', labelKey: 'plan.quarter' },
  { field: 'half_year_price' as const, period: 'half_year_price', labelKey: 'plan.halfYear' },
  { field: 'year_price' as const, period: 'year_price', labelKey: 'plan.year' },
  { field: 'two_year_price' as const, period: 'two_year_price', labelKey: 'plan.twoYear' },
  { field: 'three_year_price' as const, period: 'three_year_price', labelKey: 'plan.threeYear' },
  { field: 'onetime_price' as const, period: 'onetime_price', labelKey: 'plan.onetime' },
]

// 可选周期
const availablePeriods = computed(() => {
  if (!plan.value) return []
  const monthPrice = plan.value.month_price
  return periodConfig
    .filter(p => plan.value![p.field] !== null && plan.value![p.field] !== undefined)
    .map(p => {
      const value = plan.value![p.field] as number
      // 计算节省金额（相对于月付 * 月数）
      let saving = 0
      if (monthPrice && p.period !== 'month_price' && p.period !== 'onetime_price') {
        const months = { quarter_price: 3, half_year_price: 6, year_price: 12, two_year_price: 24, three_year_price: 36 }[p.period] || 0
        if (months > 0) saving = monthPrice * months - value
      }
      return { ...p, value, label: t(p.labelKey), saving: saving > 0 ? saving : 0 }
    })
})

// 原价
const originalPrice = computed(() => {
  if (!plan.value || !selectedPeriod.value) return 0
  const config = periodConfig.find(p => p.period === selectedPeriod.value)
  if (!config) return 0
  return (plan.value[config.field] as number) || 0
})

// 优惠折扣
const couponDiscount = computed(() => {
  if (!couponData.value || !originalPrice.value) return 0
  if (couponData.value.type === 'percentage') {
    return Math.floor(originalPrice.value * couponData.value.value / 100)
  }
  return couponData.value.value
})

// 最终价格
const finalPrice = computed(() => Math.max(0, originalPrice.value - couponDiscount.value))

// 获取周期标签
const getPeriodLabel = (period: string): string => {
  const p = periodConfig.find(pp => pp.period === period)
  return p ? t(p.labelKey) : period
}

// 应用优惠码
const applyCoupon = async () => {
  if (!couponCode.value) return
  couponLoading.value = true
  try {
    const res = await userApi.checkCoupon(couponCode.value)
    couponData.value = res.data
    couponApplied.value = true
    message.success(t('plan.couponApplied'))
  } catch (err: any) {
    message.error(err?.message || t('plan.couponInvalid'))
    couponApplied.value = false
    couponData.value = null
  } finally {
    couponLoading.value = false
  }
}

const resetCoupon = () => {
  couponCode.value = ''
  couponApplied.value = false
  couponData.value = null
}

interface CheckoutResult {
  type: number
  data: string | boolean | null
  redirect?: boolean
}

const normalizeCheckoutResult = (res: any): CheckoutResult | null => {
  if (res && typeof res.type === 'number') return res
  if (res?.data && typeof res.data.type === 'number') return res.data
  return null
}

const getCheckoutErrorMessage = (data: unknown) => {
  if (typeof data === 'string' && data.trim()) return data
  return t('order.paymentUnavailable')
}

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value)

const openPaymentData = (data: string) => {
  if (isHttpUrl(data)) {
    window.location.href = data
    return
  }

  // 部分支付网关会直接返回 HTML 表单，而不是 URL
  if (/<form[\s\S]*<\/form>/i.test(data) || /<html[\s\S]*<\/html>/i.test(data)) {
    const paymentWindow = window.open('', '_blank')
    if (paymentWindow) {
      paymentWindow.document.open()
      paymentWindow.document.write(data)
      paymentWindow.document.close()
      return
    }
  }

  // 其他返回内容兜底在新窗口打开，避免破坏当前结算页
  const blob = new Blob([data], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const loadCreatedOrder = async (tradeNo: string) => {
  const detailRes = await userApi.orderDetail(tradeNo)
  orderDetail.value = detailRes.data
  existingTradeNo.value = tradeNo
  selectedPeriod.value = orderDetail.value?.period || selectedPeriod.value
  if (orderDetail.value?.plan) {
    plan.value = orderDetail.value.plan
  }
  if (actualPayAmount.value > 0 && paymentMethods.value.length === 0) {
    const payRes = await userApi.getPaymentMethod()
    paymentMethods.value = payRes.data || []
  }
  if (actualPayAmount.value > 0 && paymentMethods.value.length > 0 && selectedPayment.value === null) {
    selectedPayment.value = paymentMethods.value[0].id
  }
}

// 提交订单
const submitOrder = async () => {
  if (!plan.value || !selectedPeriod.value || !canSubmitOrder.value) return
  submitting.value = true
  paymentError.value = ''
  try {
    if (!existingTradeNo.value) {
      // 参考 EZ_THEME：第一步只创建订单，然后读取后端订单详情展示真实实付/抵扣金额
      const saveRes = await userApi.orderSave(
        plan.value.id,
        selectedPeriod.value,
        couponApplied.value ? couponCode.value : undefined
      )
      const tradeNo = typeof saveRes.data === 'string' ? saveRes.data : saveRes.data?.trade_no
      if (!tradeNo) throw new Error('No trade_no')
      await loadCreatedOrder(tradeNo)
      await router.replace({ path: route.path, query: { trade_no: tradeNo } })
      message.success(t('order.orderCreated'))
      window.dispatchEvent(new CustomEvent('refresh-pending-orders'))
      return
    }

    const tradeNo = existingTradeNo.value
    // 结算订单。0 元订单按 EZ_THEME 逻辑也调用 checkout 激活；有金额订单必须选择支付方式。
    const paymentMethod = actualPayAmount.value <= 0
      ? (selectedPayment.value ?? paymentMethods.value[0]?.id ?? 0)
      : (selectedPayment.value as number | string)
    const checkoutRes = await userApi.orderCheckout(tradeNo, paymentMethod)
    const checkoutData = normalizeCheckoutResult(checkoutRes)

    if (!checkoutData) {
      message.error(t('order.payFailed'))
      return
    }

    // 根据 Xboard 源码处理：type=-1 且 data=true 表示免费/余额订单已处理完成；type=1 表示跳转支付
    if (checkoutData.type === -1 && checkoutData.data === true) {
      message.success(t('order.paySuccess'))
      router.push('/orders')
    } else if (checkoutData.type === -1) {
      paymentError.value = getCheckoutErrorMessage(checkoutData.data)
      message.error(paymentError.value)
    } else if (checkoutData.type === 0) {
      message.success(t('order.paySuccess'))
      router.push('/orders')
    } else if (typeof checkoutData.data === 'string' && checkoutData.data) {
      message.info(t('order.redirecting'))
      openPaymentData(checkoutData.data)
    } else {
      message.error(t('order.payFailed'))
    }

    // 创建订单后刷新顶部 banner
    window.dispatchEvent(new CustomEvent('refresh-pending-orders'))
  } catch (err: any) {
    const errMsg = err?.message || t('order.payFailed')
    paymentError.value = errMsg
    message.error(errMsg)
    // 如果是"有未付款订单"的错误，也刷新 banner
    if (errMsg.includes('未付款') || errMsg.includes('unpaid')) {
      window.dispatchEvent(new CustomEvent('refresh-pending-orders'))
    }
  } finally {
    submitting.value = false
  }
}

// 加载数据
const fetchData = async () => {
  loading.value = true

  // 检查是否是支付已有订单的模式
  const tradeNo = route.query.trade_no as string
  if (tradeNo) {
    try {
      await loadCreatedOrder(tradeNo)
      if (!plan.value) {
        message.error(t('common.failed'))
        loading.value = false
        return
      }

      // 如果存在 Stripe 支付方式，获取 Stripe 公钥
      if (paymentMethods.value.some(m => m.payment === 'stripe')) {
        try {
          const keyRes = await userApi.getStripePublicKey()
          stripePublicKey.value = keyRes.data?.public_key || ''
        } catch {
          stripePublicKey.value = ''
        }
      }
    } catch {
      message.error(t('common.failed'))
    } finally {
      loading.value = false
    }
    return
  }

  // 正常购买流程
  const planId = Number(route.params.planId)
  if (!planId) {
    loading.value = false
    return
  }

  try {
    // 获取套餐列表，找到目标套餐
    const plansRes = await userApi.getPlans()
    plan.value = (plansRes.data || []).find(p => p.id === planId) || null
    if (!plan.value) {
      loading.value = false
      return
    }

    // 默认选中月付
    if (plan.value.month_price !== null) {
      selectedPeriod.value = 'month_price'
    } else if (plan.value.onetime_price !== null) {
      selectedPeriod.value = 'onetime_price'
    } else {
      // 选第一个可用周期
      const first = periodConfig.find(p => plan.value![p.field] !== null)
      if (first) selectedPeriod.value = first.period
    }

    // 支付方式参考 EZ_THEME：订单创建后按后端真实金额决定是否加载
  } catch {
    message.error(t('common.failed'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.checkout-page { display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; align-items: center; gap: 12px; }
.back-btn { padding: 4px 8px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--stellar-text); margin: 0; }

.loading-state { padding: 40px; background: var(--stellar-bg-card); border-radius: 12px; border: 1px solid var(--stellar-border); }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: var(--stellar-text-muted); }

.checkout-content { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
.checkout-left { display: flex; flex-direction: column; gap: 16px; }
.checkout-right { position: sticky; top: 20px; }

.section-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; padding: 20px; }
.section-title { font-size: 15px; font-weight: 600; color: var(--stellar-text); margin: 0 0 16px 0; }

/* 套餐信息 */
.plan-info { display: flex; flex-direction: column; gap: 12px; }
.plan-info-name { font-size: 18px; font-weight: 700; color: var(--stellar-text); margin: 0; }
.plan-info-desc { font-size: 13px; color: var(--stellar-text-muted); margin: 4px 0 0 0; }
.plan-info-features { display: flex; gap: 20px; flex-wrap: wrap; }
.info-feature { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--stellar-text-secondary); }
.info-feature svg { color: var(--stellar-primary); }

/* 计费周期 */
.period-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.period-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--stellar-border); border-radius: 10px; cursor: pointer; transition: all 0.2s; position: relative; }
.period-item:hover { border-color: var(--stellar-primary); background: var(--stellar-bg-hover); }
.period-item.active { border-color: var(--stellar-primary); background: var(--stellar-primary-light); }
.period-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--stellar-border); flex-shrink: 0; position: relative; transition: border-color 0.2s; }
.period-radio.checked { border-color: var(--stellar-primary); }
.period-radio.checked::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 9px; height: 9px; border-radius: 50%; background: var(--stellar-primary); }
.period-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.period-label { font-size: 13px; color: var(--stellar-text-secondary); }
.period-price { font-size: 16px; font-weight: 700; color: var(--stellar-text); }
.period-item.active .period-price { color: var(--stellar-primary); }
.period-saving { font-size: 11px; color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 4px; white-space: nowrap; }

/* 优惠码 */
.coupon-row { display: flex; gap: 8px; }

/* 支付方式 */
.no-payment { padding: 20px; text-align: center; color: var(--stellar-text-muted); font-size: 13px; }
.payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.payment-item { display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--stellar-border); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.payment-item:hover { border-color: var(--stellar-primary); background: var(--stellar-bg-hover); }
.payment-item.active { border-color: var(--stellar-primary); background: var(--stellar-primary-light); }
.payment-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--stellar-border); flex-shrink: 0; position: relative; transition: border-color 0.2s; }
.payment-radio.checked { border-color: var(--stellar-primary); }
.payment-radio.checked::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 9px; height: 9px; border-radius: 50%; background: var(--stellar-primary); }
.payment-info { display: flex; align-items: center; gap: 10px; }
.payment-icon-wrapper { width: 36px; height: 36px; border-radius: 8px; background: var(--stellar-bg-hover); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.payment-icon { width: 24px; height: 24px; object-fit: contain; }
.payment-icon-placeholder { font-size: 16px; font-weight: 700; color: var(--stellar-primary); }
.payment-name { font-size: 14px; font-weight: 500; color: var(--stellar-text); }

.stripe-badge { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--stellar-text-muted); margin-top: 10px; }
.stripe-badge svg { flex-shrink: 0; }

/* 订单摘要 */
.summary-card { }
.summary-rows { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; }
.summary-label { font-size: 13px; color: var(--stellar-text-secondary); }
.summary-value { font-size: 14px; font-weight: 500; color: var(--stellar-text); }
.summary-value.highlight { color: var(--stellar-primary); font-weight: 700; }
.summary-row.discount .summary-value { color: #ef4444; }
.summary-row.total { padding-top: 12px; border-top: 1px solid var(--stellar-border-light); }
.summary-row.total .summary-label { font-size: 15px; font-weight: 600; color: var(--stellar-text); }
.price-final { font-size: 22px; font-weight: 800; color: var(--stellar-primary); }

.balance-hint { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 16px; background: var(--stellar-bg-hover); color: var(--stellar-text-secondary); }
.balance-hint.insufficient { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.balance-hint svg { flex-shrink: 0; }
.payment-error { margin-bottom: 16px; }

.submit-btn { margin-top: 4px; font-size: 15px; font-weight: 600; }

/* 响应式 */
@media (max-width: 1023px) {
  .checkout-content { grid-template-columns: 1fr; }
  .checkout-right { position: static; }
}
@media (max-width: 640px) {
  .period-grid, .payment-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 18px; }
  .section-card { padding: 16px; }
}
</style>

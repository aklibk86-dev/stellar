<template>
  <div class="orders-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('order.title') }}</h2>
        <p class="page-sub">{{ t('order.subtitle') }}</p>
      </div>
    </div>

    <!-- 提示词条 -->
    <div class="tips-bar">
      <div class="tip-item" v-for="tip in orderTips" :key="tip.text">
        <div class="tip-icon" :style="tip.style">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="tip.icon"></svg>
        </div>
        <span class="tip-text">{{ tip.text }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="order-stats">
      <div class="stat-chip" v-for="stat in orderStats" :key="stat.label" :class="{ active: stat.active }">
        <span class="stat-dot" :style="stat.dotStyle"></span>
        <span class="stat-chip-label">{{ stat.label }}</span>
        <span class="stat-chip-value">{{ stat.count }}</span>
      </div>
    </div>

    <!-- 桌面端表格 -->
    <div class="orders-table-wrapper">
      <n-data-table
        :columns="columns"
        :data="orders"
        :loading="loading"
        :pagination="false"
        :bordered="false"
        :single-line="false"
        size="medium"
      />
      <div class="pagination-wrap">
        <n-pagination
          v-model:page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.total"
          show-quick-jumper
          :page-slot="7"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="orders-card-list">
      <div v-if="loading" class="card-loading">
        <span class="loading-dot"></span>
        <span>{{ t('common.loading') }}</span>
      </div>
      <div v-else-if="orders.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>{{ t('common.noData') }}</p>
      </div>
      <template v-else>
        <n-card v-for="order in orders" :key="order.trade_no" class="order-card" :bordered="false">
          <div class="card-top">
            <span class="card-trade-no">{{ order.trade_no }}</span>
            <n-tag :type="getStatusInfo(order.status).type" size="small" round>
              {{ getStatusInfo(order.status).label }}
            </n-tag>
          </div>
          <div class="card-rows">
            <div class="card-row">
              <span class="card-label">{{ t('order.plan') }}</span>
              <span class="card-value">{{ getPlanName(order) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('order.period') }}</span>
              <span class="card-value">{{ t(formatPeriod(order.period)) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('order.amount') }}</span>
              <span class="card-value amount">¥{{ formatPrice(order.total_amount) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('order.createdAt') }}</span>
              <span class="card-value">{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
          <div class="card-actions">
            <template v-if="order.status === 0">
              <n-button size="small" type="primary" @click="handlePay(order)">{{ t('order.pay') }}</n-button>
              <n-button size="small" quaternary @click="handleCancel(order)">{{ t('order.cancel') }}</n-button>
            </template>
            <n-button v-else size="small" quaternary @click="handleDetail(order)">{{ t('order.detail') }}</n-button>
          </div>
        </n-card>
      </template>
      <div v-if="!loading && orders.length > 0" class="pagination-wrap mobile-pagination">
        <n-pagination
          v-model:page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.total"
          simple
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <!-- 购买 / 支付确认弹窗 -->
    <n-modal
      v-model:show="checkoutVisible"
      preset="card"
      :title="checkoutTitle"
      style="max-width: 460px;"
      :mask-closable="false"
    >
      <div class="checkout-modal">
        <template v-if="checkoutMode === 'create'">
          <div class="checkout-row">
            <span class="checkout-label">{{ t('order.plan') }}</span>
            <span class="checkout-value">{{ checkoutPlanName }}</span>
          </div>
          <div class="checkout-row">
            <span class="checkout-label">{{ t('order.period') }}</span>
            <span class="checkout-value">{{ t(formatPeriod(checkoutPeriod)) }}</span>
          </div>
        </template>
        <template v-else>
          <div class="checkout-row">
            <span class="checkout-label">{{ t('order.orderNo') }}</span>
            <span class="checkout-value">{{ checkoutTradeNo }}</span>
          </div>
        </template>

        <div class="checkout-section-title">{{ t('order.paymentMethod') }}</div>
        <div v-if="paymentMethods.length === 0" class="empty-payment">{{ t('common.noData') }}</div>
        <div v-else class="payment-methods">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-method-item"
            :class="{ active: selectedMethod === method.id }"
            @click="selectedMethod = method.id"
          >
            <img v-if="method.icon" :src="method.icon" class="payment-icon" alt="" />
            <span class="payment-name">{{ method.name }}</span>
            <span class="payment-check">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </div>
        </div>

        <div class="checkout-footer">
          <n-button @click="checkoutVisible = false">{{ t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="checkoutLoading"
            :disabled="!hasSelectedMethod"
            @click="confirmCheckout"
          >
            {{ t('order.confirmPay') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 订单详情弹窗 -->
    <n-modal
      v-model:show="detailVisible"
      preset="card"
      :title="t('order.detail')"
      style="max-width: 520px;"
    >
      <div v-if="detailOrder" class="detail-modal">
        <div class="detail-row">
          <span class="detail-label">{{ t('order.orderNo') }}</span>
          <span class="detail-value">{{ detailOrder.trade_no }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.plan') }}</span>
          <span class="detail-value">{{ getPlanName(detailOrder) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.period') }}</span>
          <span class="detail-value">{{ t(formatPeriod(detailOrder.period)) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.amount') }}</span>
          <span class="detail-value">¥{{ formatPrice(detailOrder.total_amount) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.discount') }}</span>
          <span class="detail-value">¥{{ formatPrice(detailOrder.discount_amount) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.surplusAmount') }}</span>
          <span class="detail-value">¥{{ formatPrice(detailOrder.surplus_amount) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.status') }}</span>
          <span class="detail-value">
            <n-tag :type="getStatusInfo(detailOrder.status).type" size="small" round>
              {{ getStatusInfo(detailOrder.status).label }}
            </n-tag>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.createdAt') }}</span>
          <span class="detail-value">{{ formatDate(detailOrder.created_at) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('order.paidAt') }}</span>
          <span class="detail-value">{{ formatDate(detailOrder.paid_at) }}</span>
        </div>
        <div v-if="detailOrder.cancel_at" class="detail-row">
          <span class="detail-label">{{ t('order.cancel') }}</span>
          <span class="detail-value">{{ formatDate(detailOrder.cancel_at) }}</span>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  useMessage,
  useDialog,
  NDataTable,
  NTag,
  NButton,
  NPagination,
  NModal,
  NCard,
  type DataTableColumns,
} from 'naive-ui'
import { userApi, normalizeListData } from '@/api'
import type { Order, Plan, PaymentMethod } from '@/api/types'
import { formatDate, formatPrice, formatPeriod } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()

// ===== 状态 =====
const orders = ref<Order[]>([])
const allOrders = ref<Order[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const planMap = ref<Record<number, Plan>>({})

// ===== 支付 / 购买确认 =====
const checkoutVisible = ref(false)
const checkoutLoading = ref(false)
const checkoutMode = ref<'create' | 'pay'>('create')
const checkoutTradeNo = ref('')
const checkoutPlanId = ref<number | null>(null)
const checkoutPeriod = ref('')
const paymentMethods = ref<PaymentMethod[]>([])
const selectedMethod = ref<number | null>(null)
const hasSelectedMethod = computed(() => selectedMethod.value !== null)

// ===== 详情 =====
const detailVisible = ref(false)
const detailOrder = ref<Order | null>(null)

const checkoutTitle = computed(() =>
  checkoutMode.value === 'create' ? t('order.confirmOrder') : t('order.payOrder')
)

const checkoutPlanName = computed(() => {
  const id = checkoutPlanId.value
  if (!id) return '-'
  return planMap.value[id]?.name || `#${id}`
})

// ===== 提示词条 =====
const orderTips = computed(() => [
  {
    icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    text: t('order.tipComplete'),
    style: 'background: rgba(16,185,129,0.12); color: #10b981;',
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    text: t('order.tipPending'),
    style: 'background: rgba(245,158,11,0.12); color: #f59e0b;',
  },
  {
    icon: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    text: t('order.tipPayment'),
    style: 'background: rgba(59,130,246,0.12); color: #3b82f6;',
  },
])

// ===== 统计卡片 =====
const orderStats = computed(() => {
  const stats = allOrders.value.reduce((acc, o) => {
    switch (o.status) {
      case 0: acc.pending++; break
      case 1: acc.processing++; break
      case 2: acc.cancelled++; break
      case 3:
      case 4: acc.completed++; break
    }
    return acc
  }, { pending: 0, processing: 0, completed: 0, cancelled: 0 })
  return [
    { label: t('order.allOrders'), count: allOrders.value.length, dotStyle: 'background: #3b82f6;', active: false },
    { label: t('order.pending'), count: stats.pending, dotStyle: 'background: #f59e0b;', active: false },
    { label: t('order.processing'), count: stats.processing, dotStyle: 'background: #06b6d4;', active: false },
    { label: t('order.completed'), count: stats.completed, dotStyle: 'background: #10b981;', active: false },
    { label: t('order.cancelled'), count: stats.cancelled, dotStyle: 'background: #94a3b8;', active: false },
  ]
})

// ===== 工具函数 =====
type TagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const getStatusInfo = (status: number): { type: TagType; label: string } => {
  switch (status) {
    case 0:
      return { type: 'warning', label: t('order.pending') } // 待支付 - 橙色
    case 1:
      return { type: 'info', label: t('order.processing') } // 开通中 - 蓝色
    case 2:
      return { type: 'default', label: t('order.cancelled') } // 已取消 - 灰色
    case 3:
      return { type: 'success', label: t('order.completed') } // 已完成 - 绿色
    case 4:
      return { type: 'success', label: t('order.deducted') } // 折抵完成 - 绿色
    default:
      return { type: 'default', label: '-' }
  }
}

const getPlanName = (order: Order): string => {
  if (order.plan?.name) return order.plan.name
  return planMap.value[order.plan_id]?.name || `#${order.plan_id}`
}

// ===== 数据获取 =====
const loadPlans = async () => {
  try {
    const res = await userApi.getPlans()
    const list = res.data || []
    planMap.value = list.reduce((acc, p) => {
      acc[p.id] = p
      return acc
    }, {} as Record<number, Plan>)
  } catch {
    // ignore
  }
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await userApi.getOrderList(1, 1000)
    const payload: any = res.data
    allOrders.value = normalizeListData(payload)
    pagination.total = allOrders.value.length
    if (pagination.page > Math.ceil(pagination.total / pagination.pageSize) && pagination.page > 1) {
      pagination.page = 1
    }
    updateDisplay()
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

const updateDisplay = () => {
  const start = (pagination.page - 1) * pagination.pageSize
  orders.value = allOrders.value.slice(start, start + pagination.pageSize)
}

const handlePageChange = (page: number) => {
  pagination.page = page
  updateDisplay()
}

// ===== 表格列 =====
const renderActions = (row: Order) => {
  if (row.status === 0) {
    return h('div', { class: 'action-group' }, [
      h(
        NButton,
        { size: 'small', type: 'primary', onClick: () => handlePay(row) },
        { default: () => t('order.pay') }
      ),
      h(
        NButton,
        { size: 'small', quaternary: true, onClick: () => handleCancel(row) },
        { default: () => t('order.cancel') }
      ),
    ])
  }
  return h(
    NButton,
    { size: 'small', quaternary: true, onClick: () => handleDetail(row) },
    { default: () => t('order.detail') }
  )
}

const columns = computed<DataTableColumns<Order>>(() => [
  {
    title: t('order.orderNo'),
    key: 'trade_no',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'cell-trade-no' }, row.trade_no),
  },
  {
    title: t('order.plan'),
    key: 'plan_id',
    render: (row) => h('span', { class: 'cell-plan' }, getPlanName(row)),
  },
  {
    title: t('order.period'),
    key: 'period',
    render: (row) => t(formatPeriod(row.period)),
  },
  {
    title: t('order.amount'),
    key: 'total_amount',
    render: (row) => h('span', { class: 'cell-amount' }, `¥${formatPrice(row.total_amount)}`),
  },
  {
    title: t('order.status'),
    key: 'status',
    render: (row) => {
      const info = getStatusInfo(row.status)
      return h(NTag, { type: info.type, size: 'small', round: true }, { default: () => info.label })
    },
  },
  {
    title: t('order.createdAt'),
    key: 'created_at',
    render: (row) => formatDate(row.created_at),
  },
  {
    title: t('common.action'),
    key: 'actions',
    width: 180,
    render: (row) => renderActions(row),
  },
])

// ===== 操作 =====
const loadPaymentMethods = async () => {
  try {
    const res = await userApi.getPaymentMethod()
    paymentMethods.value = res.data || []
    if (paymentMethods.value.length > 0 && selectedMethod.value === null) {
      // 默认选中第一个支付方式(PaymentMethod 类型使用 id 字段)
      selectedMethod.value = paymentMethods.value[0].id
    }
  } catch {
    paymentMethods.value = []
  }
}

const handlePay = (order: Order) => {
  // 跳转到确认订单页面，通过 trade_no 参数传递已有订单
  router.push({ path: `/checkout/${order.plan_id}`, query: { trade_no: order.trade_no } })
}

const handleCancel = (order: Order) => {
  dialog.warning({
    title: t('order.cancelTitle'),
    content: t('order.cancelConfirm'),
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await userApi.orderCancel(order.trade_no)
        message.success(t('common.success'))
        fetchOrders()
      } catch (e: any) {
        message.error(e?.message || t('common.failed'))
      }
    },
  })
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

  if (/<form[\s\S]*<\/form>/i.test(data) || /<html[\s\S]*<\/html>/i.test(data)) {
    const paymentWindow = window.open('', '_blank')
    if (paymentWindow) {
      paymentWindow.document.open()
      paymentWindow.document.write(data)
      paymentWindow.document.close()
      return
    }
  }

  const blob = new Blob([data], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

const handleDetail = async (order: Order) => {
  detailVisible.value = true
  detailOrder.value = order
  try {
    const res = await userApi.orderDetail(order.trade_no)
    detailOrder.value = res.data
  } catch {
    // 使用列表数据兜底
  }
}

const confirmCheckout = async () => {
  if (!hasSelectedMethod.value) {
    message.warning(t('order.selectPayment'))
    return
  }
  checkoutLoading.value = true
  try {
    let tradeNo = checkoutTradeNo.value
    // 购买流程:先创建订单
    if (checkoutMode.value === 'create') {
      if (!checkoutPlanId.value || !checkoutPeriod.value) {
        checkoutLoading.value = false
        return
      }
      const saveRes = await userApi.orderSave(checkoutPlanId.value, checkoutPeriod.value)
      // saveRes.data 可能是字符串(trade_no 本身),也可能是包含 trade_no 的对象,此处兼容两种返回格式
      tradeNo = typeof saveRes.data === 'string' ? saveRes.data : (saveRes.data as any)?.trade_no
      checkoutTradeNo.value = tradeNo
    }
    // 发起支付
    const method = selectedMethod.value as number
    const checkoutRes = await userApi.orderCheckout(tradeNo, method)
    const result = normalizeCheckoutResult(checkoutRes)
    checkoutVisible.value = false

    if (!result) {
      message.error(t('order.payFailed'))
      return
    }
    // 清理 URL query
    if (route.query.plan_id || route.query.period) {
      router.replace({ query: {} })
    }
    if (result.type === -1 && result.data === true) {
      message.success(t('order.paySuccess'))
    } else if (result.type === -1) {
      message.error(getCheckoutErrorMessage(result.data))
    } else if (result.type === 0) {
      message.success(t('order.paySuccess'))
    } else if (typeof result.data === 'string' && result.data) {
      message.success(t('order.redirecting'))
      openPaymentData(result.data)
    } else {
      message.success(t('common.success'))
    }
    fetchOrders()
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    checkoutLoading.value = false
  }
}

// ===== URL query 自动购买 =====
const handleCheckoutQuery = async () => {
  const planId = route.query.plan_id
  const period = route.query.period
  if (planId && period) {
    checkoutMode.value = 'create'
    checkoutPlanId.value = Number(planId)
    checkoutPeriod.value = String(period)
    checkoutTradeNo.value = ''
    selectedMethod.value = null
    await loadPaymentMethods()
    checkoutVisible.value = true
  }
}

onMounted(async () => {
  await Promise.all([fetchOrders(), loadPlans()])
  await handleCheckoutQuery()
})
</script>

<style scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 0;
}
.page-sub {
  font-size: 13px;
  color: var(--stellar-text-muted);
  margin: 0;
}

/* 提示词条 */
.tips-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tip-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border-light);
}
.tip-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tip-text {
  font-size: 12px;
  color: var(--stellar-text-secondary);
  white-space: nowrap;
}

/* 统计卡片 */
.order-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border-light);
  transition: all 0.2s;
}
.stat-chip:hover {
  border-color: var(--stellar-border-hover, var(--stellar-primary));
  transform: translateY(-1px);
}
.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.stat-chip-label {
  font-size: 12px;
  color: var(--stellar-text-secondary);
}
.stat-chip-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--stellar-text);
}

/* 桌面端表格容器 */
.orders-table-wrapper {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.orders-table-wrapper :deep(.n-data-table) {
  --n-border-radius: 0;
}
.orders-table-wrapper :deep(.n-data-table .n-data-table-thead) {
  background: var(--stellar-bg-hover);
}
.orders-table-wrapper :deep(.n-data-table-th) {
  font-weight: 600;
  color: var(--stellar-text-secondary);
  font-size: 13px;
}
.orders-table-wrapper :deep(.n-data-table-td) {
  font-size: 13px;
  color: var(--stellar-text);
}
.orders-table-wrapper :deep(.n-data-table-tr:hover .n-data-table-td) {
  background: var(--stellar-bg-hover);
}

.cell-trade-no {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  color: var(--stellar-text-secondary);
}
.cell-plan {
  font-weight: 500;
  color: var(--stellar-text);
}
.cell-amount {
  font-weight: 600;
  color: var(--stellar-accent);
}

.action-group {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--stellar-border-light);
}
.mobile-pagination {
  border-top: none;
  justify-content: center;
}

/* 移动端卡片列表(默认隐藏) */
.orders-card-list {
  display: none;
  flex-direction: column;
  gap: 12px;
}
.order-card {
  background: var(--stellar-bg-card) !important;
  border: 1px solid var(--stellar-border) !important;
  border-radius: 12px !important;
  transition: border-color 0.2s;
}
.order-card:hover {
  border-color: var(--stellar-primary) !important;
}
.order-card :deep(.n-card__content) {
  padding: 16px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.card-trade-no {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  color: var(--stellar-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-label {
  font-size: 12px;
  color: var(--stellar-text-muted);
  flex-shrink: 0;
}
.card-value {
  font-size: 13px;
  color: var(--stellar-text);
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-value.amount {
  color: var(--stellar-accent);
  font-weight: 600;
}
.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--stellar-border-light);
}

.card-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--stellar-text-muted);
  font-size: 13px;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
}
.loading-dot {
  width: 14px;
  height: 14px;
  border: 2px solid var(--stellar-border);
  border-top-color: var(--stellar-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: var(--stellar-text-muted);
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
}
.empty-state p {
  font-size: 13px;
  margin: 0;
}

/* 购买 / 支付确认弹窗 */
.checkout-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.checkout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--stellar-bg-hover);
  border-radius: 8px;
}
.checkout-label {
  font-size: 13px;
  color: var(--stellar-text-muted);
}
.checkout-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--stellar-text);
}
.checkout-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--stellar-text-secondary);
}
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.payment-method-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--stellar-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.payment-method-item:hover {
  border-color: var(--stellar-primary);
  background: var(--stellar-bg-hover);
}
.payment-method-item.active {
  border-color: var(--stellar-primary);
  background: var(--stellar-primary-light);
}
.payment-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 4px;
}
.payment-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--stellar-text);
}
.payment-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--stellar-primary);
  color: #fff;
}
.payment-method-item:not(.active) .payment-check {
  display: none;
}
.empty-payment {
  font-size: 13px;
  color: var(--stellar-text-muted);
  padding: 16px;
  text-align: center;
  background: var(--stellar-bg-hover);
  border-radius: 8px;
}
.checkout-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

/* 详情弹窗 */
.detail-modal {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  font-size: 13px;
  color: var(--stellar-text-muted);
}
.detail-value {
  font-size: 13px;
  color: var(--stellar-text);
  font-weight: 500;
  text-align: right;
}

/* 移动端:隐藏表格,显示卡片列表 */
@media (max-width: 767px) {
  .orders-table-wrapper {
    display: none;
  }
  .orders-card-list {
    display: flex;
  }
}
</style>

<template>
  <Transition name="slide-down">
    <div v-if="visible && displayOrders.length > 0" class="pending-banner">
      <div class="banner-inner">
        <!-- 图标 -->
        <div class="banner-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <!-- 内容 -->
        <div class="banner-content">
          <span class="banner-title">{{ t('order.pendingOrder', { count: displayOrders.length }) }}</span>
          <span v-if="displayOrders.length === 1" class="banner-detail">
            {{ t('order.pendingOrderHint', { tradeNo: displayOrders[0].trade_no, amount: formatPrice(displayOrders[0].total_amount) }) }}
          </span>
          <span v-else class="banner-detail">
            {{ t('order.pendingOrderHint', { tradeNo: displayOrders[0].trade_no, amount: formatPrice(displayOrders[0].total_amount) }) }}
            <span v-if="displayOrders.length > 1" class="more-count">+{{ displayOrders.length - 1 }}</span>
          </span>
        </div>

        <!-- 操作按钮 -->
        <div class="banner-actions">
          <button class="banner-btn primary" @click="goToOrders">
            {{ t('order.payNow') }}
          </button>
          <button v-if="displayOrders.length === 1" class="banner-btn danger" :disabled="cancelling" @click="cancelOrder(displayOrders[0])">
            {{ t('order.cancelOrder') }}
          </button>
          <button v-else class="banner-btn danger" :disabled="cancelling" @click="cancelAll">
            {{ t('order.cancelOrder') }}
          </button>
          <button class="banner-btn ghost" @click="dismiss">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { userApi, normalizeListData } from '@/api'
import { formatPrice } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const message = useMessage()

const visible = ref(true)
const cancelling = ref(false)
const pendingOrders = ref<any[]>([])

// 确认订单页正在查看/支付的订单号（路由 trade_no 参数）：
// 与该订单号一致的待支付订单不再展示顶部横幅提示，避免重复打扰
const viewingTradeNo = computed(() => {
  if (route.name !== 'checkout') return ''
  const value = route.query.trade_no
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
})
const displayOrders = computed(() => {
  const tradeNo = viewingTradeNo.value
  if (!tradeNo) return pendingOrders.value
  return pendingOrders.value.filter(o => String(o.trade_no) !== tradeNo)
})
let timer: ReturnType<typeof setInterval> | null = null
// 用于在组件卸载时取消进行中的请求,避免页面切换时 net::ERR_ABORTED 错误
let abortController: AbortController | null = null

const fetchPendingOrders = async () => {
  // 取消上一次未完成的请求
  if (abortController) abortController.abort()
  abortController = new AbortController()
  try {
    const res = await userApi.getOrderList(1, 20, abortController.signal)
    const allOrders = normalizeListData<any>(res.data as any)
    pendingOrders.value = allOrders.filter(o => o.status === 0)
    // 如果有新的未支付订单，重新显示 banner
    if (pendingOrders.value.length > 0) {
      visible.value = true
    }
  } catch (err: any) {
    // 请求被取消/中止(如页面切换组件卸载),静默处理;仅对真实业务错误输出 warn
    const code = err?.code
    const status = err?.status
    if (code === 'ERR_CANCELED' || code === 'ECONNABORTED' || status === 0 || err?.name === 'CanceledError') return
    console.warn('[PendingOrderBanner] 获取待支付订单失败:', err?.status || err?.message)
  }
}

const goToOrders = () => {
  router.push('/orders')
}

const cancelOrder = async (order: any) => {
  cancelling.value = true
  try {
    await userApi.orderCancel(order.trade_no)
    pendingOrders.value = pendingOrders.value.filter(o => o.trade_no !== order.trade_no)
    message.success(t('order.cancelSuccess'))
    if (pendingOrders.value.length === 0) {
      visible.value = false
    }
  } catch (err: any) {
    message.error(err?.message || t('order.cancelFailed'))
  } finally {
    cancelling.value = false
  }
}

const cancelAll = async () => {
  cancelling.value = true
  try {
    const targets = [...displayOrders.value]
    for (const order of targets) {
      try {
        await userApi.orderCancel(order.trade_no)
      } catch (err: any) {
        console.warn('[PendingOrderBanner] 取消订单失败:', err?.status || err?.message)
      }
    }
    const cancelledNos = new Set(targets.map(o => String(o.trade_no)))
    pendingOrders.value = pendingOrders.value.filter(o => !cancelledNos.has(String(o.trade_no)))
    visible.value = false
    message.success(t('order.cancelSuccess'))
  } catch {
    message.error(t('order.cancelFailed'))
  } finally {
    cancelling.value = false
  }
}

const dismiss = () => {
  visible.value = false
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchPendingOrders()
  }
}

const handleRefreshEvent = () => {
  visible.value = true
  fetchPendingOrders()
}

// 暴露方法供外部调用（如 Checkout 页面提交后刷新）
defineExpose({
  refresh: fetchPendingOrders,
  show: () => { visible.value = true },
})

onMounted(() => {
  fetchPendingOrders()
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchPendingOrders()
    }
  }, 60000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('refresh-pending-orders', handleRefreshEvent)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (abortController) abortController.abort()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('refresh-pending-orders', handleRefreshEvent)
})
</script>

<style scoped>
.pending-banner {
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08));
  border-bottom: 1px solid rgba(245, 158, 11, 0.3);
  padding: 10px 24px;
  display: flex;
  align-items: center;
  z-index: 35;
}

.banner-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.banner-icon {
  color: #f59e0b;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.banner-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-wrap: wrap;
}

.banner-title {
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
  white-space: nowrap;
}

.banner-detail {
  font-size: 12px;
  color: var(--stellar-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-count {
  display: inline-block;
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.banner-btn {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.banner-btn.primary {
  background: #f59e0b;
  color: white;
}
.banner-btn.primary:not(:disabled):hover {
  background: #d97706;
}

.banner-btn.danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.banner-btn.danger:not(:disabled):hover {
  background: rgba(239, 68, 68, 0.1);
}

.banner-btn.ghost {
  background: transparent;
  color: var(--stellar-text-muted);
  padding: 5px;
  width: 28px;
  height: 28px;
}
.banner-btn.ghost:hover {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}

/* 动画 */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 60px;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

/* 移动端 */
@media (max-width: 640px) {
  .pending-banner {
    padding: 8px 12px;
  }
  .banner-inner {
    gap: 8px;
  }
  .banner-content {
    gap: 4px;
  }
  .banner-title {
    font-size: 12px;
  }
  .banner-detail {
    font-size: 11px;
    width: 100%;
  }
  .banner-actions {
    gap: 4px;
  }
  .banner-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>

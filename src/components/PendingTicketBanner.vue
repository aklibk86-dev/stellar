<template>
  <Transition name="slide-down">
    <div v-if="visible && pendingTickets.length > 0" class="pending-ticket-banner">
      <div class="banner-inner">
        <!-- 图标 -->
        <div class="banner-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <!-- 内容 -->
        <div class="banner-content">
          <span class="banner-title">{{ t('ticket.pendingTip', { count: pendingTickets.length }) }}</span>
          <span class="banner-detail">
            {{ latestTicket?.subject || '' }}
            <span v-if="pendingTickets.length > 1" class="more-count">+{{ pendingTickets.length - 1 }}</span>
          </span>
        </div>

        <!-- 操作按钮 -->
        <div class="banner-actions">
          <button class="banner-btn primary" @click="goToTickets">
            {{ t('ticket.viewTicket') }}
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userApi, normalizeListData } from '@/api'
import type { Ticket } from '@/api/types'

const router = useRouter()
const { t } = useI18n()

const visible = ref(true)
const tickets = ref<Ticket[]>([])
let timer: ReturnType<typeof setInterval> | null = null

const pendingTickets = computed(() => tickets.value.filter(t => t.status !== 1))

const latestTicket = computed(() => {
  if (pendingTickets.value.length === 0) return null
  return [...pendingTickets.value].sort((a, b) => b.updated_at - a.updated_at)[0]
})

const fetchTickets = async () => {
  try {
    const res = await userApi.getTicketList()
    const payload: any = res.data
    tickets.value = normalizeListData(payload)
    if (pendingTickets.value.length > 0) {
      visible.value = true
    }
  } catch (err) {
    console.error('[PendingTicketBanner] 获取待处理工单失败:', err)
  }
}

const goToTickets = () => {
  router.push('/tickets')
}

const dismiss = () => {
  visible.value = false
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchTickets()
  }
}

const handleRefreshEvent = () => {
  visible.value = true
  fetchTickets()
}

defineExpose({
  refresh: fetchTickets,
  show: () => { visible.value = true },
})

onMounted(() => {
  fetchTickets()
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchTickets()
    }
  }, 60000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('refresh-pending-tickets', handleRefreshEvent)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('refresh-pending-tickets', handleRefreshEvent)
})
</script>

<style scoped>
.pending-ticket-banner {
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
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
  color: #3b82f6;
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
  color: #3b82f6;
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
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
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

.banner-btn.primary {
  background: #3b82f6;
  color: white;
}
.banner-btn.primary:hover {
  background: #2563eb;
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
  .pending-ticket-banner {
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

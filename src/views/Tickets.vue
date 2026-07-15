<template>
  <div class="tickets-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('ticket.title') }}</h2>
        <p class="page-sub">{{ t('ticket.subtitle') }}</p>
      </div>
      <n-button type="primary" @click="openCreateModal">
        <template #icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </template>
        {{ t('ticket.newTicket') }}
      </n-button>
    </div>

    <!-- 提示词条 -->
    <div class="tips-bar">
      <div class="tip-item" v-for="tip in ticketTips" :key="tip.icon">
        <div class="tip-icon" :style="tip.style">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="tip.icon"></svg>
        </div>
        <span class="tip-text">{{ tip.text }}</span>
      </div>
    </div>

    <!-- 主体布局:左侧列表 + 右侧详情 -->
    <div class="tickets-layout">
      <!-- ===== 左侧:工单列表 ===== -->
      <div class="ticket-list-panel" :class="{ 'mobile-hidden': isMobile && selectedTicket }">
        <!-- 列表头部 -->
        <div class="list-header">
          <span class="list-title">{{ t('ticket.title') }}</span>
          <span class="list-count">{{ tickets.length }}</span>
        </div>

        <!-- 列表内容 -->
        <div class="list-body">
          <!-- 加载中 -->
          <div v-if="loading" class="list-loading">
            <span class="loading-dot"></span>
            <span>{{ t('common.loading') }}</span>
          </div>

          <!-- 空状态 -->
          <n-empty v-else-if="tickets.length === 0" :description="t('common.noData')" class="list-empty" />

          <!-- 工单列表项 -->
          <template v-else>
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              class="ticket-item"
              :class="{ active: selectedTicket?.id === ticket.id }"
              @click="selectTicket(ticket)"
            >
              <div class="ticket-item-top">
                <span class="ticket-item-subject">{{ ticket.subject }}</span>
                <n-tag :type="getStatusInfo(ticket.status, ticket.reply_status).type" size="small" round>
                  {{ getStatusInfo(ticket.status, ticket.reply_status).label }}
                </n-tag>
              </div>
              <div class="ticket-item-bottom">
                <n-tag :type="getLevelInfo(ticket.level).type" size="tiny" round>
                  {{ getLevelInfo(ticket.level).label }}
                </n-tag>
                <span class="ticket-item-time">{{ formatDate(ticket.updated_at) }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ===== 右侧:工单详情 / 对话 ===== -->
      <div class="ticket-detail-panel" :class="{ 'mobile-hidden': isMobile && !selectedTicket }">
        <!-- 未选中工单 -->
        <div v-if="!selectedTicket" class="detail-empty">
          <n-empty :description="t('common.noData')" />
        </div>

        <!-- 工单详情 -->
        <template v-else>
          <!-- 详情头部 -->
          <div class="detail-header">
            <div class="detail-header-left">
              <button v-if="isMobile" class="back-btn" @click="selectedTicket = null">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div class="detail-header-info">
                <h3 class="detail-subject">{{ selectedTicket.subject }}</h3>
                <div class="detail-meta">
                  <n-tag :type="getStatusInfo(selectedTicket.status, selectedTicket.reply_status).type" size="small" round>
                    {{ getStatusInfo(selectedTicket.status, selectedTicket.reply_status).label }}
                  </n-tag>
                  <n-tag :type="getLevelInfo(selectedTicket.level).type" size="small" round>
                    {{ getLevelInfo(selectedTicket.level).label }}
                  </n-tag>
                  <span class="detail-time">#{{ selectedTicket.id }} · {{ formatDate(selectedTicket.updated_at) }}</span>
                </div>
              </div>
            </div>
            <div class="detail-header-actions">
              <!-- 关闭工单按钮(仅在未关闭时显示) -->
              <n-button
                v-if="selectedTicket.status !== 1"
                size="small"
                type="error"
                ghost
                :loading="actionLoading"
                @click="handleCloseTicket(selectedTicket)"
              >
                {{ t('ticket.close') }}
              </n-button>
            </div>
          </div>

          <!-- 对话记录 -->
          <div ref="conversationRef" class="conversation">
            <div v-if="detailLoading" class="list-loading">
              <span class="loading-dot"></span>
              <span>{{ t('common.loading') }}</span>
            </div>
            <template v-else-if="replies.length > 0">
              <div
                v-for="item in replies"
                :key="item.id"
                class="message-row"
                :class="{ 'is-me': item.is_me === 1 || item.is_me === true }"
              >
                <div class="message-avatar">
                  <svg v-if="item.is_me === 1 || item.is_me === true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div class="message-content">
                  <div class="message-bubble">{{ item.message }}</div>
                  <div class="message-time">{{ formatDate(item.created_at) }}</div>
                </div>
              </div>
            </template>
            <n-empty v-else :description="t('common.noData')" class="conversation-empty" />
          </div>

          <!-- 回复输入区 -->
          <div class="reply-area">
            <n-input
              v-model:value="replyText"
              type="textarea"
              :placeholder="t('ticket.message')"
              :autosize="{ minRows: 1, maxRows: 4 }"
              :disabled="selectedTicket.status === 1"
              @keydown.enter.exact.prevent="handleReply"
            />
            <n-button
              type="primary"
              :loading="replyLoading"
              :disabled="!replyText.trim() || selectedTicket.status === 1"
              @click="handleReply"
            >
              {{ t('ticket.reply') }}
            </n-button>
          </div>
        </template>
      </div>
    </div>

    <!-- ===== 新建工单弹窗 ===== -->
    <n-modal
      v-model:show="createModalVisible"
      preset="card"
      :title="t('ticket.newTicket')"
      style="max-width: 480px;"
      :mask-closable="false"
    >
      <n-form ref="formRef" :model="form" label-placement="top" class="create-form">
        <n-form-item :label="t('ticket.subject')" path="subject">
          <n-input
            v-model:value="form.subject"
            :placeholder="t('ticket.subject')"
            maxlength="100"
            show-count
          />
        </n-form-item>
        <n-form-item :label="t('ticket.level')" path="level">
          <n-select
            v-model:value="form.level"
            :options="levelOptions"
            :placeholder="t('ticket.level')"
          />
        </n-form-item>
        <n-form-item :label="t('ticket.message')" path="message">
          <n-input
            v-model:value="form.message"
            type="textarea"
            :placeholder="t('ticket.message')"
            :autosize="{ minRows: 4, maxRows: 8 }"
            maxlength="1000"
            show-count
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-footer">
          <n-button @click="createModalVisible = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="createLoading" @click="submitCreateTicket">
            {{ t('common.submit') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, useDialog, NButton, NTag, NModal, NForm, NFormItem, NInput, NSelect, NEmpty } from 'naive-ui'
import { userApi } from '@/api'
import { formatDate } from '@/utils/format'
import type { Ticket } from '@/api/types'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()

// ===== 状态 =====
const tickets = ref<Ticket[]>([])
const loading = ref(false)
const selectedTicket = ref<Ticket | null>(null)
const ticketMessages = ref<any[]>([])
const detailLoading = ref(false)
const conversationRef = ref<HTMLElement | null>(null)

// 响应式:移动端判断
const isMobile = ref(false)
const updateMobileFlag = () => {
  isMobile.value = window.innerWidth < 768
}
let ticketResizeTimer: number | null = null
const debouncedUpdateMobileFlag = () => {
  if (ticketResizeTimer) clearTimeout(ticketResizeTimer)
  ticketResizeTimer = window.setTimeout(updateMobileFlag, 100)
}

// ===== 新建工单 =====
const createModalVisible = ref(false)
const createLoading = ref(false)
const formRef = ref()
const form = reactive({
  subject: '',
  level: 1,
  message: '',
})

const levelOptions = computed(() => [
  { label: t('ticket.low'), value: 0 },
  { label: t('ticket.medium'), value: 1 },
  { label: t('ticket.high'), value: 2 },
])

// ===== 回复 =====
const replyText = ref('')
const replyLoading = ref(false)

// ===== 操作加载 =====
const actionLoading = ref(false)

// ===== 工具函数:状态映射 =====
type TagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

// 状态: 0=开启(open,蓝色), 1=已关闭(closed,灰色)
// reply_status: 0=等待回复, 1=已回复
const getStatusInfo = (status: number, replyStatus?: number): { type: TagType; label: string } => {
  switch (status) {
    case 0:
      if (replyStatus === 1) {
        return { type: 'success', label: t('ticket.replied') }
      }
      return { type: 'info', label: t('ticket.open') }
    case 1:
      return { type: 'default', label: t('ticket.closed') }
    default:
      return { type: 'default', label: '-' }
  }
}

// 优先级:0=低,1=中,2=高
const getLevelInfo = (level: number): { type: TagType; label: string } => {
  switch (level) {
    case 0:
      return { type: 'default', label: t('ticket.low') }
    case 1:
      return { type: 'warning', label: t('ticket.medium') }
    case 2:
      return { type: 'error', label: t('ticket.high') }
    default:
      return { type: 'default', label: '-' }
  }
}

// 当前选中工单的回复列表
const replies = computed(() => ticketMessages.value)

// 提示词条
const ticketTips = computed(() => [
  {
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    text: t('ticket.tipReply'),
    style: 'background: rgba(59,130,246,0.12); color: #3b82f6;',
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    text: t('ticket.tipResponse'),
    style: 'background: rgba(245,158,11,0.12); color: #f59e0b;',
  },
  {
    icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    text: t('ticket.tipClose'),
    style: 'background: rgba(16,185,129,0.12); color: #10b981;',
  },
  {
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    text: t('ticket.tipPrivacy'),
    style: 'background: rgba(139,92,246,0.12); color: #8b5cf6;',
  },
])

// ===== 数据获取 =====
const fetchTickets = async () => {
  loading.value = true
  try {
    const res = await userApi.getTicketList()
    const payload: any = res.data
    if (Array.isArray(payload)) {
      tickets.value = payload
    } else if (payload && Array.isArray(payload.data)) {
      tickets.value = payload.data
    } else {
      tickets.value = []
    }
    // 若当前选中的工单仍存在,则同步更新其内容
    if (selectedTicket.value) {
      const updated = tickets.value.find(item => item.id === selectedTicket.value!.id)
      if (updated) {
        selectedTicket.value = updated
      } else {
        selectedTicket.value = null
      }
    }
    // 通知全局横幅刷新
    window.dispatchEvent(new Event('refresh-pending-tickets'))
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

// ===== 选择工单 =====
const selectTicket = async (ticket: Ticket) => {
  selectedTicket.value = ticket
  replyText.value = ''
  ticketMessages.value = []
  await fetchTicketDetail(ticket.id)
  nextTick(() => {
    scrollToBottom()
  })
}

// 获取工单详情(含对话消息)
const fetchTicketDetail = async (id: number) => {
  detailLoading.value = true
  try {
    const res = await userApi.getTicketDetail(id)
    const data = res.data
    if (data) {
      // 更新选中工单的状态等信息
      if (selectedTicket.value && selectedTicket.value.id === id) {
        selectedTicket.value = { ...selectedTicket.value, ...data }
      }
      // API 返回的 message 字段是对话消息数组
      const msgs = (data as any).message
      if (Array.isArray(msgs)) {
        ticketMessages.value = msgs
      } else {
        ticketMessages.value = []
      }
    }
  } catch (err) {
    console.error('[Tickets] 获取工单详情失败:', err)
    // 静默失败，不影响列表浏览
  } finally {
    detailLoading.value = false
  }
}

// 对话区滚动到底部
const scrollToBottom = () => {
  if (conversationRef.value) {
    conversationRef.value.scrollTop = conversationRef.value.scrollHeight
  }
}

// ===== 新建工单 =====
const openCreateModal = () => {
  form.subject = ''
  form.level = 1
  form.message = ''
  createModalVisible.value = true
}

const submitCreateTicket = async () => {
  if (!form.subject.trim()) {
    message.warning(t('ticket.subject'))
    return
  }
  if (!form.message.trim()) {
    message.warning(t('ticket.message'))
    return
  }
  createLoading.value = true
  try {
    const res = await userApi.createTicket(form.subject.trim(), form.level, form.message.trim())
    message.success(t('common.success'))
    createModalVisible.value = false
    await fetchTickets()
    // 创建后自动选中新工单
    const newId = res.data?.id
    if (newId) {
      const created = tickets.value.find(item => item.id === newId)
      if (created) {
        selectTicket(created)
      }
    }
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    createLoading.value = false
  }
}

// ===== 回复工单 =====
const handleReply = async () => {
  if (!selectedTicket.value) return
  const content = replyText.value.trim()
  if (!content) return
  if (selectedTicket.value.status === 1) {
    message.warning(t('ticket.closed'))
    return
  }
  replyLoading.value = true
  try {
    await userApi.replyTicket(selectedTicket.value.id, content)
    replyText.value = ''
    message.success(t('common.success'))
    await fetchTickets()
    // 刷新对话消息
    await fetchTicketDetail(selectedTicket.value.id)
    nextTick(() => {
      scrollToBottom()
    })
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    replyLoading.value = false
  }
}

// ===== 关闭工单 =====
const handleCloseTicket = async (ticket: Ticket) => {
  dialog.warning({
    title: t('ticket.close'),
    content: t('ticket.closeConfirm'),
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: () => {
      return doCloseTicket(ticket)
    },
  })
}

const doCloseTicket = async (ticket: Ticket) => {
  actionLoading.value = true
  try {
    await userApi.closeTicket(ticket.id)
    message.success(t('common.success'))
    await fetchTickets()
    if (selectedTicket.value && selectedTicket.value.id === ticket.id) {
      await fetchTicketDetail(ticket.id)
    }
    return true
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
    return false
  } finally {
    actionLoading.value = false
  }
}

// ===== 生命周期 =====
onMounted(() => {
  updateMobileFlag()
  window.addEventListener('resize', debouncedUpdateMobileFlag)
  fetchTickets()
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedUpdateMobileFlag)
  if (ticketResizeTimer) clearTimeout(ticketResizeTimer)
})
</script>

<style scoped>
.tickets-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
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
  gap: 4px;
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

/* 主体布局 */
.tickets-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ===== 左侧列表 ===== */
.ticket-list-panel {
  width: 340px;
  flex-shrink: 0;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--stellar-text);
}
.list-count {
  font-size: 12px;
  color: var(--stellar-text-muted);
  background: var(--stellar-bg-hover);
  padding: 2px 10px;
  border-radius: 10px;
}
.list-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* 列表加载 */
.list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: var(--stellar-text-muted);
  font-size: 13px;
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
  to {
    transform: rotate(360deg);
  }
}

/* 列表空状态 */
.list-empty {
  padding: 48px 0;
}

/* 工单列表项 */
.ticket-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  border: 1px solid transparent;
}
.ticket-item:hover {
  background: var(--stellar-bg-hover);
}
.ticket-item.active {
  background: var(--stellar-primary-light);
  border-color: var(--stellar-primary);
}
.ticket-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.ticket-item-subject {
  font-size: 13px;
  font-weight: 600;
  color: var(--stellar-text);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}
.ticket-item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ticket-item-time {
  font-size: 11px;
  color: var(--stellar-text-muted);
}

/* ===== 右侧详情 ===== */
.ticket-detail-panel {
  flex: 1;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* 详情空状态 */
.detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 详情头部 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.detail-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.back-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--stellar-bg-hover);
  border-radius: 8px;
  color: var(--stellar-text);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.back-btn:hover {
  background: var(--stellar-border);
}
.detail-header-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.detail-subject {
  font-size: 16px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.detail-time {
  font-size: 12px;
  color: var(--stellar-text-muted);
}
.detail-header-actions {
  flex-shrink: 0;
}

/* 对话记录区 */
.conversation {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.conversation-empty {
  margin: auto;
}

/* 单条消息 */
.message-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.message-row.is-me {
  flex-direction: row-reverse;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--stellar-bg-hover);
  color: var(--stellar-text-muted);
}
.message-row.is-me .message-avatar {
  background: var(--stellar-primary);
  color: #fff;
}
.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}
.message-row.is-me .message-content {
  align-items: flex-end;
}
.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--stellar-text);
  background: var(--stellar-bg-hover);
  word-break: break-word;
  white-space: pre-wrap;
}
.message-row.is-me .message-bubble {
  background: var(--stellar-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.message-row:not(.is-me) .message-bubble {
  border-bottom-left-radius: 4px;
}
.message-time {
  font-size: 11px;
  color: var(--stellar-text-muted);
}

/* 回复输入区 */
.reply-area {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--stellar-border-light);
  align-items: flex-end;
}
.reply-area :deep(.n-input) {
  flex: 1;
}

/* 新建工单表单 */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== 移动端响应式 ===== */
.mobile-hidden {
  display: none !important;
}

@media (max-width: 767px) {
  .tickets-page {
    height: auto;
    overflow: visible;
  }
  .tickets-layout {
    flex-direction: column;
    height: auto;
    min-height: 0;
  }
  .ticket-list-panel {
    width: 100%;
    height: calc(100vh - 280px);
    min-height: 300px;
  }
  .ticket-detail-panel {
    width: 100%;
    height: calc(100vh - 280px);
    min-height: 300px;
  }
  /* 移动端显示返回按钮 */
  .back-btn {
    display: flex;
  }
  .page-header {
    flex-wrap: wrap;
  }
  .page-title {
    font-size: 20px;
  }
  .message-content {
    max-width: 80%;
  }
}
</style>

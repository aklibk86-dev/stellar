<template>
  <div class="notice-bell-wrapper" ref="wrapperRef">
    <button
      class="bell-btn"
      :class="{ active: dropdownVisible }"
      @click="toggleDropdown"
      :title="t('dashboard.announcements')"
    >
      <!-- 铃铛图标 -->
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <!-- 未读红点 -->
      <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- 下拉公告面板 -->
    <Transition name="notice-dropdown">
      <div v-if="dropdownVisible" class="notice-dropdown">
        <div class="dropdown-header">
          <div class="header-left">
            <span class="dropdown-title">{{ t('dashboard.announcements') }}</span>
            <span v-if="notices.length > 0" class="dropdown-count">{{ notices.length }}</span>
          </div>
          <button
            v-if="unreadCount > 0"
            class="mark-all-read-btn"
            @click.stop="markAllRead"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{{ t('dashboard.markAllRead') }}</span>
          </button>
        </div>

        <div class="dropdown-body">
          <div v-if="loading" class="dropdown-loading">
            <span class="loading-dot"></span>
            <span>{{ t('common.loading') }}</span>
          </div>
          <div v-else-if="notices.length === 0" class="dropdown-empty">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>{{ t('common.noData') }}</p>
          </div>
          <div v-else class="notice-items">
            <div
              v-for="notice in notices"
              :key="notice.id"
              class="notice-item"
              :class="{ unread: !isNoticeRead(notice) }"
              @click="openNotice(notice)"
            >
              <div class="notice-item-main">
                <div class="notice-title-row">
                  <span class="notice-dot" v-if="!isNoticeRead(notice)"></span>
                  <h4 class="notice-title" :class="getNoticeTitleClass(notice)">{{ notice.title }}</h4>
                  <span v-if="isImportantNotice(notice)" class="pin-badge">{{ t('dashboard.pinned') }}</span>
                </div>
                <span class="notice-time">{{ formatDate(notice.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 公告详情弹窗 -->
    <n-modal :show="modalVisible" preset="card" style="max-width: 600px;" @update:show="handleModalUpdate">
      <template #header>
        <span class="notice-modal-title" :class="getNoticeTitleClass(selectedNotice)">{{ selectedNotice?.title }}</span>
      </template>
      <div v-if="selectedNotice" class="notice-detail">
        <div class="notice-meta">
          <span>{{ formatDate(selectedNotice.created_at) }}</span>
          <span v-for="tag in getNoticeTags(selectedNotice)" :key="tag" class="notice-tag">{{ tag }}</span>
        </div>
        <img v-if="selectedNotice.img_url" class="notice-image" :src="selectedNotice.img_url" :alt="selectedNotice.title" />
        <div class="notice-body" v-html="sanitizeHtml(selectedNotice.content)"></div>
      </div>
      <template v-if="selectedNotice && isPopupNotice(selectedNotice)" #footer>
        <div class="notice-modal-footer">
          <n-checkbox v-model:checked="silentToday">今天不再弹出</n-checkbox>
          <n-button type="primary" @click="closeModal">我知道了</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NButton, NCheckbox } from 'naive-ui'
import { userApi } from '@/api'
import type { Notice } from '@/api/types'
import { formatDate } from '@/utils/format'
import { sanitizeHtml } from '@/utils/safe'

const { t } = useI18n()

const notices = ref<Notice[]>([])
const loading = ref(false)
const dropdownVisible = ref(false)
const modalVisible = ref(false)
const selectedNotice = ref<Notice | null>(null)
const silentToday = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const readVersion = ref(0)

const POPUP_NOTICE_TAG = '弹窗'
const POPUP_NOTICE_STORAGE_PREFIX = 'stellar_popup_notice_silent:'
const READ_NOTICE_STORAGE_PREFIX = 'stellar_notice_read:'

const todayKey = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getNoticeTags = (notice: Notice | null) =>
  Array.isArray(notice?.tags) ? notice.tags.filter(Boolean) : []

const isImportantNotice = (notice: Notice | null) =>
  getNoticeTags(notice).some(tag => tag.trim() === '重要')

const isPopupNotice = (notice: Notice | null) =>
  getNoticeTags(notice).some(tag => tag.trim() === POPUP_NOTICE_TAG)

const getNoticeTitleClass = (notice: Notice | null) => {
  if (isImportantNotice(notice)) return 'title-important'
  if (isPopupNotice(notice)) return 'title-popup'
  return ''
}

const getPopupStorageKey = (notice: Notice) => `${POPUP_NOTICE_STORAGE_PREFIX}${notice.id}`
const getReadStorageKey = (notice: Notice) => `${READ_NOTICE_STORAGE_PREFIX}${notice.id}`

const isNoticeRead = (notice: Notice) => {
  readVersion.value
  return localStorage.getItem(getReadStorageKey(notice)) === '1'
}

const markNoticeRead = (notice: Notice) => {
  localStorage.setItem(getReadStorageKey(notice), '1')
  readVersion.value++
}

const markAllRead = () => {
  let changed = false
  notices.value.forEach((notice) => {
    if (!localStorage.getItem(getReadStorageKey(notice))) {
      localStorage.setItem(getReadStorageKey(notice), '1')
      changed = true
    }
  })
  if (changed) readVersion.value++
}

const shouldShowPopupNotice = (notice: Notice) => {
  if (!isPopupNotice(notice)) return false
  return localStorage.getItem(getPopupStorageKey(notice)) !== todayKey()
}

const unreadCount = computed(() => notices.value.filter(n => !isNoticeRead(n)).length)

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const openNotice = (notice: Notice) => {
  selectedNotice.value = notice
  silentToday.value = false
  modalVisible.value = true
  markNoticeRead(notice)
  dropdownVisible.value = false
}

const closeModal = () => {
  if (selectedNotice.value && isPopupNotice(selectedNotice.value) && silentToday.value) {
    localStorage.setItem(getPopupStorageKey(selectedNotice.value), todayKey())
  }
  modalVisible.value = false
}

const handleModalUpdate = (show: boolean) => {
  if (!show) {
    closeModal()
    return
  }
  modalVisible.value = true
}

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await userApi.getNotices()
    const all = res.data || []
    // 排除标签含"套餐"的公告(只在购买套餐页显示)
    const filtered = all.filter(n => !getNoticeTags(n).some(tag => tag.trim() === '套餐'))
    // 重要公告置顶
    notices.value = [
      ...filtered.filter(n => isImportantNotice(n)),
      ...filtered.filter(n => !isImportantNotice(n)),
    ]
    // 弹窗公告首次自动弹出
    const popupNotice = notices.value.find(shouldShowPopupNotice)
    if (popupNotice) {
      selectedNotice.value = popupNotice
      silentToday.value = false
      modalVisible.value = true
      markNoticeRead(popupNotice)
    }
  } catch (err) {
    console.error('[NoticeBell] 获取公告失败:', err)
    notices.value = []
  } finally {
    loading.value = false
  }
}

// 点击外部关闭下拉
const handleClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    dropdownVisible.value = false
  }
}

onMounted(() => {
  fetchNotices()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notice-bell-wrapper {
  position: relative;
  display: inline-flex;
}

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--stellar-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.bell-btn:hover,
.bell-btn.active {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}

.bell-btn svg {
  width: 20px;
  height: 20px;
}

/* 未读红点 */
.unread-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border: 2px solid var(--stellar-bg-card);
  box-sizing: content-box;
}

/* 下拉面板 */
.notice-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  max-width: calc(100vw - 32px);
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--stellar-border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mark-all-read-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--stellar-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.mark-all-read-btn:hover {
  background: rgba(59, 130, 246, 0.18);
}

.mark-all-read-btn svg {
  flex-shrink: 0;
}

.dropdown-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--stellar-text);
}

.dropdown-count {
  font-size: 11px;
  color: var(--stellar-text-muted);
  background: var(--stellar-bg-hover);
  padding: 2px 8px;
  border-radius: 999px;
}

.dropdown-body {
  max-height: 360px;
  overflow-y: auto;
}

.dropdown-loading,
.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--stellar-text-muted);
  font-size: 13px;
}

.dropdown-empty p {
  margin: 0;
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

.notice-items {
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.notice-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.notice-item:hover {
  background: var(--stellar-bg-hover);
}

.notice-item.unread {
  background: rgba(59, 130, 246, 0.06);
}

.notice-item.unread:hover {
  background: rgba(59, 130, 246, 0.1);
}

.notice-item-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}

.notice-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--stellar-text);
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-title.title-important {
  color: #ef4444;
  font-weight: 700;
}

.notice-title.title-popup {
  color: #f59e0b;
  font-weight: 500;
}

.pin-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.notice-time {
  font-size: 11px;
  color: var(--stellar-text-muted);
}

/* 详情弹窗 */
.notice-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--stellar-text);
}

.notice-modal-title.title-important {
  color: #ef4444;
  font-weight: 700;
}

.notice-modal-title.title-popup {
  color: #f59e0b;
  font-weight: 500;
}

.notice-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--stellar-text-muted);
}

.notice-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: var(--stellar-primary);
  font-size: 11px;
  font-weight: 600;
}

.notice-image {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--stellar-border-light);
}

.notice-body {
  font-size: 14px;
  color: var(--stellar-text);
  line-height: 1.6;
}

.notice-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* 下拉动画 */
.notice-dropdown-enter-active,
.notice-dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: top right;
}

.notice-dropdown-enter-from,
.notice-dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
}

/* 移动端 */
@media (max-width: 640px) {
  .notice-dropdown {
    width: 300px;
  }
}
</style>

<template>
  <div class="dashboard-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-glow"></div>
      <div class="banner-content">
        <div class="banner-user">
          <h2 class="banner-title">{{ t('dashboard.welcome') }}, {{ userEmail }}</h2>
          <div class="banner-tags">
            <span class="user-id-tag">UID: {{ shortUuid }}</span>
            <span class="member-badge normal">{{ t('dashboard.normalUser') }}</span>
          </div>
        </div>
        <p class="banner-sub">{{ appStore.description || 'Stellar Panel' }}</p>
      </div>
      <div class="banner-balance">
        <div class="balance-item">
          <span class="balance-label">{{ t('dashboard.balance') }}</span>
          <div class="balance-row">
            <span class="balance-amount">¥{{ formatMoney(user?.balance) }}</span>
            <button class="recharge-btn" @click="$router.push('/plans')">{{ t('dashboard.recharge') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" @click="$router.push('/plans')">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('dashboard.balance') }}</span>
          <span class="stat-value">¥{{ formatMoney(user?.balance) }}</span>
          <span class="stat-link">{{ t('dashboard.viewAll') }} →</span>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/invite')">
        <div class="stat-icon" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('dashboard.commission') }}</span>
          <span class="stat-value">¥{{ formatMoney(user?.commission_balance) }}</span>
          <span class="stat-link">{{ t('dashboard.viewAll') }} →</span>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/servers')">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('dashboard.usedTraffic') }}</span>
          <span class="stat-value">{{ formatTraffic(usedTraffic) }}</span>
          <span class="stat-link">{{ t('dashboard.viewAll') }} →</span>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/plans')">
        <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('dashboard.expireDate') }}</span>
          <span class="stat-value">{{ expireText }}</span>
          <span class="stat-link">{{ t('dashboard.viewAll') }} →</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="dashboard-main">
      <!-- 左侧 -->
      <div class="dashboard-left">
        <!-- 我的订阅卡片 -->
        <div class="content-card subscription-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.mySubscription') }}</h3>
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="card-body">
            <n-skeleton text :repeat="4" />
          </div>

          <!-- 无订阅 -->
          <div v-else-if="!hasSubscription" class="card-body empty-subscription">
            <div class="empty-icon" @click="$router.push('/plans')">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <p>{{ t('dashboard.buyPlan') }}</p>
            </div>
          </div>

          <!-- 有订阅 -->
          <div v-else class="card-body subscription-body">
            <div class="subscription-overview">
              <div class="subscription-summary">
                <div class="sub-plan-name">
                  <span class="sub-plan-kicker">{{ t('dashboard.currentPlan') }}</span>
                  <span class="sub-plan-tag">{{ subscribe?.plan?.name || `Plan #${subscribe?.plan_id}` }}</span>
                </div>

                <div class="sub-expire-info" :class="expireClass">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span>{{ expireDetailText }}</span>
                </div>

                <div class="sub-traffic-section">
                  <div class="sub-traffic-header">
                    <span>{{ t('dashboard.trafficUsage') }}</span>
                    <span class="sub-traffic-percent">{{ trafficPercent }}%</span>
                  </div>
                  <n-progress
                    type="line"
                    :percentage="trafficPercent"
                    :color="trafficColor"
                    :height="8"
                    :border-radius="4"
                    :show-indicator="false"
                  />
                  <div class="sub-traffic-detail">
                    <span>{{ formatTraffic(usedTraffic) }} {{ t('dashboard.usedTraffic') }}</span>
                    <span>{{ formatTraffic(remainingTraffic) }} {{ t('dashboard.remainingTraffic') }}</span>
                  </div>
                </div>

                <div class="sub-controls">
                  <n-button type="primary" @click="showSubscribeModal = true">
                    <template #icon><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></template>
                    {{ t('dashboard.oneClickSubscribe') }}
                  </n-button>
                  <n-button
                    v-if="isExpired || trafficPercent >= 70"
                    secondary
                    type="primary"
                    @click="handleRenewOrReset"
                    :loading="resetLoading"
                  >
                    {{ isExpired ? t('dashboard.renew') : t('dashboard.resetTraffic') }}
                  </n-button>
                </div>
              </div>

              <div class="subscription-traffic-visual">
                <div class="traffic-ring compact-ring">
                  <v-chart :option="trafficChartOption" autoresize />
                </div>
                <div class="traffic-details compact-details">
                  <div class="traffic-row">
                    <span class="traffic-dot" style="background: #3b82f6;"></span>
                    <span class="traffic-label">{{ t('dashboard.usedTraffic') }}</span>
                    <span class="traffic-value">{{ formatTraffic(usedTraffic) }}</span>
                  </div>
                  <div class="traffic-row">
                    <span class="traffic-dot" style="background: #10b981;"></span>
                    <span class="traffic-label">{{ t('dashboard.remainingTraffic') }}</span>
                    <span class="traffic-value">{{ formatTraffic(remainingTraffic) }}</span>
                  </div>
                  <div class="traffic-row total-row">
                    <span class="traffic-dot" style="background: #6b7280;"></span>
                    <span class="traffic-label">{{ t('dashboard.totalTraffic') }}</span>
                    <span class="traffic-value">{{ formatTraffic(subscribe?.transfer_enable || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 客户端下载 -->
        <div v-if="availableClients.length > 0" class="content-card client-download-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.clientDownload') }}</h3>
            <span class="card-subtitle">{{ t('dashboard.clientDownloadDesc') }}</span>
          </div>
          <div class="client-grid">
            <a
              v-for="client in availableClients"
              :key="client.key"
              :href="client.url"
              target="_blank"
              rel="noopener noreferrer"
              class="client-item"
            >
              <div class="client-icon">
                <img :src="client.icon" :alt="client.label" class="client-logo-img" />
              </div>
              <div class="client-info">
                <span class="client-name">{{ client.label }}</span>
                <span class="client-download-hint">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {{ t('dashboard.download') }}
                </span>
              </div>
            </a>
          </div>
        </div>

      </div>

      <!-- 右侧 -->
      <div class="dashboard-right">
        <!-- 捷径 -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.shortcuts') }}</h3>
          </div>
          <div class="shortcut-list">
            <div class="shortcut-item" @click="$router.push('/knowledge')">
              <div class="shortcut-icon-wrap" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div class="shortcut-info">
                <span class="shortcut-title">{{ t('dashboard.viewTutorial') }}</span>
                <span class="shortcut-desc">{{ t('dashboard.viewTutorialDesc', { title: appStore.description || 'Stellar' }) }}</span>
              </div>
              <svg class="shortcut-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="shortcut-item" @click="showSubscribeModal = true">
              <div class="shortcut-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              </div>
              <div class="shortcut-info">
                <span class="shortcut-title">{{ t('dashboard.oneClickSubscribe') }}</span>
                <span class="shortcut-desc">{{ t('dashboard.oneClickSubscribeDesc') }}</span>
              </div>
              <svg class="shortcut-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="shortcut-item" @click="$router.push('/plans')">
              <div class="shortcut-icon-wrap" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <div class="shortcut-info">
                <span class="shortcut-title">{{ t('dashboard.buySubscription') }}</span>
                <span class="shortcut-desc">{{ t('dashboard.buySubscriptionDesc') }}</span>
              </div>
              <svg class="shortcut-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="shortcut-item" @click="$router.push('/tickets')">
              <div class="shortcut-icon-wrap" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="shortcut-info">
                <span class="shortcut-title">{{ t('dashboard.encounterProblem') }}</span>
                <span class="shortcut-desc">{{ t('dashboard.encounterProblemDesc') }}</span>
              </div>
              <svg class="shortcut-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        <!-- 公告 -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.announcements') }}</h3>
          </div>
          <div class="notice-list">
            <div v-if="notices.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <p>{{ t('common.noData') }}</p>
            </div>
            <div v-for="notice in notices" :key="notice.id" class="notice-item" @click="showNotice(notice)">
              <div class="notice-content">
                <div class="notice-title-row">
                  <h4 class="notice-title" :class="getNoticeTitleClass(notice)">{{ notice.title }}</h4>
                  <span v-if="isImportantNotice(notice)" class="pin-badge">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="17" x2="12" y2="22"/>
                      <path d="M5 17h14l-1.5-3v-4l3-3H3.5l3 3v4z"/>
                    </svg>
                    {{ t('dashboard.pinned') }}
                  </span>
                </div>
                <span class="notice-time">{{ formatDate(notice.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务入口卡片 -->
    <div class="service-cards">
      <div class="service-card" @click="$router.push('/servers')">
        <div class="service-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="2" width="20" height="8" rx="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        </div>
        <div class="service-info">
          <span class="service-title">{{ t('nav.servers') }}</span>
          <span class="service-desc">{{ t('dashboard.serverDesc') }}</span>
        </div>
      </div>

      <div class="service-card" @click="$router.push('/tickets')">
        <div class="service-icon" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div class="service-info">
          <span class="service-title">{{ t('nav.tickets') }}</span>
          <span class="service-desc">{{ t('dashboard.ticketDesc') }}</span>
        </div>
      </div>

      <div class="service-card" @click="$router.push('/invite')">
        <div class="service-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="service-info">
          <span class="service-title">{{ t('nav.invite') }}</span>
          <span class="service-desc">{{ t('dashboard.inviteDesc') }}</span>
        </div>
      </div>
    </div>
    <n-modal :show="noticeModalVisible" preset="card" style="max-width: 600px;" @update:show="handleNoticeModalUpdate">
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
          <n-checkbox v-model:checked="noticeSilentToday">今天不再弹出</n-checkbox>
          <n-button type="primary" @click="closeNoticeModal">我知道了</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 一键订阅弹窗 -->
    <SubscribeImportModal v-model:show="showSubscribeModal" :subscribe-url="subscribeUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, NButton, NCheckbox, NModal, NProgress, NSkeleton, useDialog } from 'naive-ui'
import VChart from 'vue-echarts'
import '@/utils/echarts'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { userApi, normalizeListData } from '@/api'
import type { Notice, Subscribe, User } from '@/api/types'
import { formatTraffic, formatMoney, formatDate } from '@/utils/format'
import { sanitizeHtml } from '@/utils/safe'
import SubscribeImportModal from '@/components/SubscribeImportModal.vue'

const { t } = useI18n()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const appStore = useAppStore()
const userStore = useUserStore()

const user = ref<User | null>(null)
const subscribe = ref<Subscribe | null>(null)
const notices = ref<Notice[]>([])
const noticeModalVisible = ref(false)
const selectedNotice = ref<Notice | null>(null)
const noticeSilentToday = ref(false)
const showSubscribeModal = ref(false)
const loading = ref(true)
const resetLoading = ref(false)

const userEmail = computed(() => user.value?.email || 'User')
const shortUuid = computed(() => (user.value?.uuid || '').substring(0, 8).toUpperCase())
const subscribeUrl = computed(() => subscribe.value?.subscribe_url || '')

const usedTraffic = computed(() => (subscribe.value?.u || 0) + (subscribe.value?.d || 0))
const remainingTraffic = computed(() => Math.max(0, (subscribe.value?.transfer_enable || 0) - usedTraffic.value))

const hasSubscription = computed(() => !!subscribe.value?.plan_id)

const trafficPercent = computed(() => {
  const total = subscribe.value?.transfer_enable || 0
  if (!total) return 0
  return Math.min(100, Math.floor((usedTraffic.value / total) * 100))
})

const trafficColor = computed(() => {
  if (trafficPercent.value >= 100) return '#ef4444'
  if (trafficPercent.value >= 70) return '#f59e0b'
  return '#10b981'
})

const isExpired = computed(() => {
  const exp = subscribe.value?.expired_at
  if (exp === null || exp === undefined) return false
  return exp < Math.floor(Date.now() / 1000)
})

const expireText = computed(() => {
  const exp = subscribe.value?.expired_at
  if (exp === null || exp === undefined) return t('dashboard.permanent')
  if (exp === 0) return '-'
  if (isExpired.value) return t('dashboard.expired')
  return formatDate(exp)
})

const expireClass = computed(() => {
  if (isExpired.value) return 'expired'
  if (trafficPercent.value >= 70) return 'warning'
  return 'normal'
})

const POPUP_NOTICE_TAG = '弹窗'
const POPUP_NOTICE_STORAGE_PREFIX = 'stellar_popup_notice_silent:'

// ===== 客户端下载 =====
import windowsLogo from '@/assets/clients/windows.svg'
import macosLogo from '@/assets/clients/macos.svg'
import androidLogo from '@/assets/clients/android.svg'
import iosLogo from '@/assets/clients/ios.svg'
import linuxLogo from '@/assets/clients/linux.svg'
import routerLogo from '@/assets/clients/router.svg'

interface ClientItem {
  key: string
  label: string
  url: string
  icon: string
}

const allClientConfigs: ClientItem[] = [
  { key: 'windows', label: 'Windows', url: '', icon: windowsLogo },
  { key: 'macos', label: 'macOS', url: '', icon: macosLogo },
  { key: 'android', label: 'Android', url: '', icon: androidLogo },
  { key: 'ios', label: 'iOS', url: '', icon: iosLogo },
  { key: 'linux', label: 'Linux', url: '', icon: linuxLogo },
  { key: 'router', label: t('dashboard.routerOS'), url: '', icon: routerLogo },
]

const availableClients = computed<ClientItem[]>(() => {
  const downloads = window.settings?.client_downloads
  if (!downloads) return []
  return allClientConfigs
    .map(c => ({
      ...c,
      url: downloads[c.key as keyof typeof downloads] || '',
      label: c.key === 'router' ? t('dashboard.routerOS') : c.label,
    }))
    .filter(c => c.url)
})

const todayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getNoticeTags = (notice: Notice | null) => Array.isArray(notice?.tags) ? notice.tags.filter(Boolean) : []

const isImportantNotice = (notice: Notice | null) => getNoticeTags(notice).some(tag => tag.trim() === '重要')

const isPopupNotice = (notice: Notice | null) => getNoticeTags(notice).some(tag => tag.trim() === POPUP_NOTICE_TAG)

const getNoticeTitleClass = (notice: Notice | null) => {
  if (isImportantNotice(notice)) return 'title-important'
  if (isPopupNotice(notice)) return 'title-popup'
  return ''
}

const getPopupNoticeStorageKey = (notice: Notice) => `${POPUP_NOTICE_STORAGE_PREFIX}${notice.id}`

const shouldShowPopupNotice = (notice: Notice) => {
  if (!isPopupNotice(notice)) return false
  return localStorage.getItem(getPopupNoticeStorageKey(notice)) !== todayKey()
}

const expireDetailText = computed(() => {
  const exp = subscribe.value?.expired_at
  if (exp === null || exp === undefined) return t('dashboard.permanent')
  if (exp === 0) return '-'
  const now = Math.floor(Date.now() / 1000)
  if (exp < now) return t('dashboard.expired')
  const days = Math.floor((exp - now) / 86400)
  const dateStr = formatDate(exp)
  let text = t('dashboard.expireIn', { date: dateStr, days })
  // 流量重置提示
  const resetDay = subscribe.value?.reset_day
  if (resetDay !== null && resetDay !== undefined && days > resetDay) {
    text += ' ' + t('dashboard.resetTrafficHint', { days: resetDay })
  }
  return text
})

const trafficChartOption = computed(() => {
  const used = usedTraffic.value
  const total = subscribe.value?.transfer_enable || 1
  const remaining = Math.max(0, total - used)
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['60%', '85%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: used, name: t('dashboard.usedTraffic'), itemStyle: { color: '#3b82f6' } },
          { value: remaining, name: t('dashboard.remainingTraffic'), itemStyle: { color: '#10b981' } },
        ],
      },
    ],
  }
})

const fetchData = async () => {
  loading.value = true
  user.value = userStore.user
  if (!user.value) {
    user.value = await userStore.fetchUser()
  }
  try {
    const res = await userApi.getSubscribe()
    subscribe.value = res.data
  } catch (err) {
    console.error('[Dashboard] 获取订阅信息失败:', err)
  }
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
    const popupNotice = notices.value.find(shouldShowPopupNotice)
    if (popupNotice) {
      showNotice(popupNotice)
    }
  } catch (err) {
    console.error('[Dashboard] 获取公告失败:', err)
  }
  loading.value = false
}

const showNotice = (notice: Notice) => {
  selectedNotice.value = notice
  noticeSilentToday.value = false
  noticeModalVisible.value = true
}

const saveNoticeSilentToday = () => {
  if (selectedNotice.value && isPopupNotice(selectedNotice.value) && noticeSilentToday.value) {
    localStorage.setItem(getPopupNoticeStorageKey(selectedNotice.value), todayKey())
  }
}

const closeNoticeModal = () => {
  saveNoticeSilentToday()
  noticeModalVisible.value = false
}

const handleNoticeModalUpdate = (show: boolean) => {
  if (!show) {
    closeNoticeModal()
    return
  }
  noticeModalVisible.value = true
}

const handleRenewOrReset = async () => {
  if (isExpired.value) {
    // 续费 → 跳转到套餐页面
    const planId = subscribe.value?.plan_id
    if (planId) {
      router.push('/plans')
    }
    return
  }
  // 重置流量
  dialog.warning({
    title: t('dashboard.resetTraffic'),
    content: t('dashboard.resetTrafficConfirm'),
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      if (!subscribe.value?.plan_id) return
      resetLoading.value = true
      try {
        const planId = subscribe.value.plan_id
        // 先检查是否有未完成订单
        const orderRes = await userApi.getOrderList()
        const allOrders = normalizeListData<any>(orderRes.data as any)
        const pendingOrders = allOrders.filter((o: any) => o.status === 0) || []
        // 取消未完成订单
        for (const order of pendingOrders) {
          try { await userApi.orderCancel(order.trade_no) } catch (err) { console.error('[Dashboard] 取消待支付订单失败:', err) }
        }
        // 创建重置订单
        const res = await userApi.orderSave(planId, 'reset_price')
        const tradeNo = typeof res.data === 'string' ? res.data : (res.data as any)?.trade_no
        if (tradeNo) {
          message.success(t('dashboard.resetTrafficSuccess'))
          // 跳转到订单页面
          router.push('/orders')
        }
      } catch {
        message.error(t('dashboard.resetTrafficFailed'))
      } finally {
        resetLoading.value = false
      }
    },
  })
}

onMounted(fetchData)
</script>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; gap: 16px; }

/* 欢迎横幅 */
.welcome-banner { background: linear-gradient(135deg, #1e3a5f 0%, #1a1d24 50%, #0f1419 100%); border-radius: 16px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; color: white; overflow: hidden; position: relative; border: 1px solid rgba(59, 130, 246, 0.15); }
:global(html:not(.dark)) .welcome-banner { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); }
.banner-glow { position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%); pointer-events: none; }
.banner-content { z-index: 1; }
.banner-user { display: flex; flex-direction: column; gap: 8px; }
.banner-title { font-size: 22px; font-weight: 700; margin: 0; }
.banner-tags { display: flex; align-items: center; gap: 8px; }
.user-id-tag { font-size: 12px; color: rgba(255, 255, 255, 0.6); background: rgba(255, 255, 255, 0.1); padding: 2px 10px; border-radius: 10px; }
.member-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px; }
.member-badge.normal { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.member-badge.admin { background: rgba(249, 115, 22, 0.2); color: #fdba74; }
.banner-sub { font-size: 13px; opacity: 0.6; margin: 6px 0 0 0; }
.banner-balance { z-index: 1; display: flex; flex-direction: column; gap: 4px; }
.balance-item { display: flex; flex-direction: column; gap: 6px; }
.balance-label { font-size: 12px; color: rgba(255, 255, 255, 0.5); }
.balance-row { display: flex; align-items: center; gap: 12px; }
.balance-amount { font-size: 26px; font-weight: 800; color: white; }
.recharge-btn { background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.2); color: white; font-size: 12px; padding: 5px 16px; border-radius: 8px; cursor: pointer; transition: background 0.2s; font-weight: 500; }
.recharge-btn:hover { background: rgba(255, 255, 255, 0.25); }

/* 统计卡片 */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 14px; transition: all 0.2s; cursor: pointer; }
.stat-card:hover { border-color: var(--stellar-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.stat-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.stat-label { font-size: 12px; color: var(--stellar-text-muted); }
.stat-value { font-size: 19px; font-weight: 700; color: var(--stellar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat-link { font-size: 12px; color: var(--stellar-primary); margin-top: 2px; }

/* 主内容区 */
.dashboard-main { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }
.dashboard-left, .dashboard-right { display: flex; flex-direction: column; gap: 16px; }

.content-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--stellar-border-light); }
.card-title { font-size: 15px; font-weight: 600; color: var(--stellar-text); margin: 0; }

/* 我的订阅卡片 */
.subscription-card .card-body { padding: 20px; }
.empty-subscription { display: flex; align-items: center; justify-content: center; padding: 36px 20px; }
.empty-icon { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; color: var(--stellar-text-muted); transition: color 0.2s; }
.empty-icon:hover { color: var(--stellar-primary); }
.empty-icon p { font-size: 14px; margin: 0; }

.subscription-body { display: block; }
.subscription-overview { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(260px, .9fr); gap: 24px; align-items: stretch; }
.subscription-summary { min-width: 0; display: flex; flex-direction: column; gap: 14px; padding-right: 24px; border-right: 1px solid var(--stellar-border-light); }
.sub-plan-name { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
.sub-plan-kicker { color: var(--stellar-text-muted); font-size: 11px; }
.sub-plan-tag { color: var(--stellar-primary); font-size: 18px; font-weight: 700; }

.sub-expire-info { display: flex; align-items: center; gap: 7px; font-size: 12px; padding: 8px 11px; border-radius: 8px; }
.sub-expire-info svg { flex-shrink: 0; }
.sub-expire-info.normal { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.sub-expire-info.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.sub-expire-info.expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.sub-traffic-section { display: flex; flex-direction: column; gap: 8px; }
.sub-traffic-header { display: flex; justify-content: space-between; align-items: center; color: var(--stellar-text-secondary); font-size: 12px; }
.sub-traffic-percent { color: var(--stellar-text); font-weight: 700; }
.sub-traffic-detail { display: flex; justify-content: space-between; gap: 12px; color: var(--stellar-text-muted); font-size: 11px; }
.sub-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }

.subscription-traffic-visual { min-width: 0; display: grid; grid-template-columns: 140px minmax(0, 1fr); align-items: center; gap: 14px; padding: 4px 0; }
.traffic-ring { width: 180px; height: 180px; flex-shrink: 0; }
.compact-ring { width: 140px; height: 140px; }
.compact-ring :deep(> div) { width: 100% !important; height: 100% !important; }
.traffic-details { flex: 1; display: flex; flex-direction: column; gap: 14px; }
.compact-details { min-width: 0; gap: 9px; }
.traffic-row { display: flex; align-items: center; gap: 8px; }
.traffic-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.traffic-label { flex: 1; color: var(--stellar-text-secondary); font-size: 11px; white-space: nowrap; }
.traffic-value { color: var(--stellar-text); font-size: 12px; font-weight: 600; white-space: nowrap; }
.total-row { margin-top: 2px; padding-top: 9px; border-top: 1px dashed var(--stellar-border); }

/* 捷径 */
.shortcut-list { padding: 6px; }
.shortcut-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
.shortcut-item:hover { background: var(--stellar-bg-hover); }
.shortcut-icon-wrap { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.shortcut-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.shortcut-title { font-size: 13px; font-weight: 600; color: var(--stellar-text); }
.shortcut-desc { font-size: 12px; color: var(--stellar-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.shortcut-arrow { color: var(--stellar-text-muted); flex-shrink: 0; }

/* 服务入口卡片 */
.service-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.service-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s; }
.service-card:hover { border-color: var(--stellar-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.service-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.service-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.service-title { font-size: 14px; font-weight: 600; color: var(--stellar-text); }
.service-desc { font-size: 12px; color: var(--stellar-text-muted); }

/* 公告 */
.notice-list { padding: 6px; max-height: 280px; overflow-y: auto; }
.notice-item { padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.notice-item:hover { background: var(--stellar-bg-hover); }
.notice-content { display: flex; flex-direction: column; gap: 4px; }
.notice-title-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.notice-title { font-size: 13px; font-weight: 500; color: var(--stellar-text); margin: 0; }
.pin-badge { display: inline-flex; align-items: center; gap: 2px; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; background: rgba(239,68,68,0.1); color: #ef4444; flex-shrink: 0; line-height: 1.4; }
.notice-title.title-important { color: #ef4444; font-weight: 700; }
.notice-title.title-popup { color: #f59e0b; font-weight: 500; }
.notice-modal-title { font-size: 16px; font-weight: 600; color: var(--stellar-text); }
.notice-modal-title.title-important { color: #ef4444; font-weight: 700; }
.notice-modal-title.title-popup { color: #f59e0b; font-weight: 500; }
.notice-time { font-size: 11px; color: var(--stellar-text-muted); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px; color: var(--stellar-text-muted); gap: 12px; }
.empty-state p { font-size: 13px; margin: 0; }

.notice-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--stellar-text-muted); margin-bottom: 12px; }
.notice-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; background: rgba(59, 130, 246, 0.12); color: var(--stellar-primary); font-size: 11px; font-weight: 600; }
.notice-image { width: 100%; max-height: 260px; object-fit: cover; border-radius: 10px; margin-bottom: 14px; border: 1px solid var(--stellar-border-light); }
.notice-body { font-size: 14px; color: var(--stellar-text); line-height: 1.6; }
.notice-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; }

/* 客户端下载 */
.client-download-card { }
.client-download-card .card-header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.client-download-card .card-subtitle { font-size: 12px; color: var(--stellar-text-muted); font-weight: 400; }
.client-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; padding: 16px; }
.client-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 10px; background: var(--stellar-bg-hover); border: 1px solid var(--stellar-border-light); text-decoration: none; transition: all 0.2s; cursor: pointer; }
.client-item:hover { border-color: var(--stellar-primary); background: var(--stellar-bg-card); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.client-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--stellar-bg-card); border: 1px solid var(--stellar-border-light); }
.client-logo-img { width: 28px; height: 28px; object-fit: contain; }
.client-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.client-name { font-size: 14px; font-weight: 600; color: var(--stellar-text); }
.client-download-hint { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--stellar-text-muted); }

/* 移动端 */
@media (max-width: 1023px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-main { grid-template-columns: 1fr; }
  .service-cards { grid-template-columns: 1fr; }
}

@media (max-width: 700px) {
  .subscription-overview { grid-template-columns: 1fr; gap: 18px; }
  .subscription-summary { padding-right: 0; padding-bottom: 18px; border-right: 0; border-bottom: 1px solid var(--stellar-border-light); }
  .subscription-traffic-visual { grid-template-columns: 130px minmax(0, 1fr); justify-content: center; }
  .compact-ring { width: 130px; height: 130px; }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
  .welcome-banner { flex-direction: column; gap: 16px; align-items: flex-start; padding: 20px; }
  .banner-title { font-size: 18px; }
  .sub-controls :deep(.n-button) { flex: 1; }
  .balance-amount { font-size: 22px; }
}

@media (max-width: 420px) {
  .subscription-traffic-visual { grid-template-columns: 1fr; justify-items: center; }
  .compact-details { width: 100%; }
}
</style>

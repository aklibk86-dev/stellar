<template>
  <div class="plans-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('plan.subtitle') }}</h2>
        <p class="page-sub">{{ t('plan.pageSubtitle') }}</p>
      </div>
      <n-button
        v-if="planNotices.length > 0"
        size="small"
        quaternary
        @click="openNoticeManual"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </template>
        {{ t('plan.viewAnnouncements') }}
      </n-button>
    </div>

    <!-- 提示词条 -->
    <div class="tips-bar">
      <div class="tip-item" v-for="tip in planTips" :key="tip.text">
        <div class="tip-icon" :style="tip.style">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="tip.icon"></svg>
        </div>
        <span class="tip-text">{{ tip.text }}</span>
      </div>
    </div>

    <!-- 筛选与排序栏 -->
    <div class="toolbar">
      <div class="filter-group">
        <button
          v-for="f in filters"
          :key="f.key"
          class="filter-btn"
          :class="{ active: activeFilter === f.key }"
          @click="activeFilter = f.key"
        >{{ f.label }}</button>
      </div>
      <n-select
        v-model:value="sortBy"
        :options="sortOptions"
        size="small"
        :consistent-menu-width="false"
        class="sort-select"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton-grid">
        <div v-for="i in 3" :key="i" class="plan-card skeleton-card">
          <n-skeleton text :repeat="6" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredPlans.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
      <p>{{ t('plan.noPlanAvailable') }}</p>
    </div>

    <!-- 套餐卡片网格 -->
    <div v-else class="plans-grid">
      <div
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="plan-card"
      >
        <!-- 套餐名称 -->
        <div class="plan-header">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <p v-if="plan.content" class="plan-desc">{{ plan.content }}</p>
        </div>

        <!-- 月付价格 -->
        <div class="plan-price-display">
          <template v-if="plan.month_price !== null">
            <span class="price-symbol">¥</span>
            <span class="price-number">{{ formatPrice(plan.month_price) }}</span>
            <span class="price-period-label">{{ t('plan.perMonth') }}</span>
          </template>
          <template v-else-if="plan.onetime_price !== null">
            <span class="price-symbol">¥</span>
            <span class="price-number">{{ formatPrice(plan.onetime_price) }}</span>
            <span class="price-period-label">{{ t('plan.perOnetime') }}</span>
          </template>
          <template v-else>
            <span class="price-unavailable">-</span>
          </template>
        </div>

        <!-- 套餐特性列表 -->
        <div class="plan-features">
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span class="feature-label">{{ t('plan.features_traffic') }}</span>
            <span class="feature-value">{{ plan.transfer_enable ? formatPlanTraffic(plan.transfer_enable) : '-' }}</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span class="feature-label">{{ t('plan.features_speed') }}</span>
            <span class="feature-value">{{ plan.speed_limit ? plan.speed_limit + ' Mbps' : t('plan.noSpeedLimit') }}</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span class="feature-label">{{ t('plan.features_devices') }}</span>
            <span class="feature-value">{{ plan.device_limit ? plan.device_limit : t('plan.noDeviceLimit') }}</span>
          </div>
        </div>

        <!-- 购买按钮 -->
        <div class="plan-action">
          <n-button type="primary" block @click="goToCheckout(plan)">
            {{ t('plan.subscribe') }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 套餐公告弹窗 -->
    <n-modal :show="noticeModalVisible" preset="card" style="max-width: 560px;" @update:show="handleNoticeModalUpdate">
      <template #header>
        <div class="notice-modal-header">
          <span class="notice-modal-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
          <span class="notice-modal-title" :class="getNoticeTitleClass(selectedNotice)">{{ selectedNotice?.title }}</span>
        </div>
      </template>
      <div v-if="selectedNotice" class="notice-detail">
        <div class="notice-meta">
          <span class="notice-date">{{ formatDate(selectedNotice.created_at) }}</span>
          <span v-for="tag in getNoticeTags(selectedNotice)" :key="tag" class="notice-tag" :class="getNoticeTagClass(tag)">{{ tag }}</span>
        </div>
        <img v-if="selectedNotice.img_url" class="notice-image" :src="selectedNotice.img_url" :alt="selectedNotice.title" />
        <div class="notice-body" v-html="sanitizeHtml(selectedNotice.content)"></div>
      </div>
      <template #footer>
        <div class="notice-modal-footer">
          <n-checkbox v-if="isPopupNotice(selectedNotice)" v-model:checked="noticeSilentToday">{{ t('plan.dontShowToday') }}</n-checkbox>
          <span v-else></span>
          <n-button type="primary" @click="closeNoticeModal">{{ t('plan.gotIt') }}</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 公告列表选择弹窗(手动打开时) -->
    <n-modal :show="noticeListVisible" preset="card" :title="t('plan.announcementList')" style="max-width: 480px;" @update:show="(v: boolean) => noticeListVisible = v">
      <div class="notice-list-modal">
        <div
          v-for="notice in planNotices"
          :key="notice.id"
          class="notice-list-item"
          @click="showNoticeDetail(notice)"
        >
          <div class="notice-list-item-content">
            <span class="notice-list-item-title" :class="getNoticeTitleClass(notice)">{{ notice.title }}</span>
            <div class="notice-list-item-meta">
              <span class="notice-list-item-date">{{ formatDate(notice.created_at) }}</span>
              <span v-for="tag in getNoticeTags(notice)" :key="tag" class="notice-tag-sm" :class="getNoticeTagClass(tag)">{{ tag }}</span>
            </div>
          </div>
          <svg class="notice-list-item-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        <div v-if="planNotices.length === 0" class="notice-list-empty">{{ t('common.noData') }}</div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NSelect, NSkeleton, NModal, NCheckbox } from 'naive-ui'
import { userApi } from '@/api'
import type { Plan, Notice } from '@/api/types'
import { formatPlanTraffic, formatPrice, formatDate } from '@/utils/format'
import { sanitizeHtml } from '@/utils/safe'

const router = useRouter()
const { t } = useI18n()

const plans = ref<Plan[]>([])
const loading = ref(true)
const activeFilter = ref('all')
const sortBy = ref('default')

// ===== 公告 =====
const PLAN_NOTICE_TAG = '套餐'
const POPUP_NOTICE_TAG = '弹窗'
const PLAN_NOTICE_SILENT_PREFIX = 'stellar_plan_notice_silent:'

const planNotices = ref<Notice[]>([])
const noticeModalVisible = ref(false)
const noticeListVisible = ref(false)
const selectedNotice = ref<Notice | null>(null)
const noticeSilentToday = ref(false)

const filters = computed(() => [
  { key: 'all', label: t('plan.filterAll') },
  { key: 'cycle', label: t('plan.filterCycle') },
  { key: 'traffic', label: t('plan.filterTraffic') },
  { key: 'onetime', label: t('plan.filterOnetime') },
])

const sortOptions = computed(() => [
  { label: t('plan.sortDefault'), value: 'default' },
  { label: t('plan.sortPriceAsc'), value: 'priceAsc' },
  { label: t('plan.sortPriceDesc'), value: 'priceDesc' },
  { label: t('plan.sortTrafficDesc'), value: 'trafficDesc' },
])

// 提示词条
const planTips = computed(() => [
  {
    icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    text: t('plan.tipTraffic'),
    style: 'background: rgba(59,130,246,0.12); color: #3b82f6;',
  },
  {
    icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    text: t('plan.tipSpeed'),
    style: 'background: rgba(245,158,11,0.12); color: #f59e0b;',
  },
  {
    icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>',
    text: t('plan.tipDevice'),
    style: 'background: rgba(139,92,246,0.12); color: #8b5cf6;',
  },
  {
    icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    text: t('plan.tipInstant'),
    style: 'background: rgba(16,185,129,0.12); color: #10b981;',
  },
])

// ===== 公告工具函数 =====
const getNoticeTags = (notice: Notice | null) => Array.isArray(notice?.tags) ? notice.tags.filter(Boolean) : []
const isImportantNotice = (notice: Notice | null) => getNoticeTags(notice).some(tag => tag.trim() === '重要')
const isPopupNotice = (notice: Notice | null) => getNoticeTags(notice).some(tag => tag.trim() === POPUP_NOTICE_TAG)

const getNoticeTitleClass = (notice: Notice | null) => {
  if (isImportantNotice(notice)) return 'title-important'
  if (isPopupNotice(notice)) return 'title-popup'
  return ''
}

const getNoticeTagClass = (tag: string) => {
  const t = tag.trim()
  if (t === '重要') return 'tag-important'
  if (t === '弹窗') return 'tag-popup'
  if (t === '套餐') return 'tag-plan'
  return ''
}

const todayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const getPopupStorageKey = (notice: Notice) => `${PLAN_NOTICE_SILENT_PREFIX}${notice.id}`

const shouldAutoPopup = (notice: Notice) => {
  if (!isPopupNotice(notice)) return false
  return localStorage.getItem(getPopupStorageKey(notice)) !== todayKey()
}

const getMonthPrice = (plan: Plan): number | null => {
  return plan.month_price ?? plan.onetime_price
}

const filteredPlans = computed(() => {
  let result = [...plans.value].filter(p => p.show !== false && p.sell !== false)

  if (activeFilter.value === 'cycle') {
    result = result.filter(p => p.month_price !== null || p.quarter_price !== null || p.half_year_price !== null || p.year_price !== null)
  } else if (activeFilter.value === 'traffic') {
    result = result.filter(p => p.transfer_enable > 0)
  } else if (activeFilter.value === 'onetime') {
    result = result.filter(p => p.onetime_price !== null)
  }

  if (sortBy.value === 'priceAsc') {
    result.sort((a, b) => (getMonthPrice(a) || 0) - (getMonthPrice(b) || 0))
  } else if (sortBy.value === 'priceDesc') {
    result.sort((a, b) => (getMonthPrice(b) || 0) - (getMonthPrice(a) || 0))
  } else if (sortBy.value === 'trafficDesc') {
    result.sort((a, b) => (b.transfer_enable || 0) - (a.transfer_enable || 0))
  } else {
    result.sort((a, b) => (a.sort || 0) - (b.sort || 0))
  }

  return result
})

const goToCheckout = (plan: Plan) => {
  router.push({ name: 'checkout', params: { planId: String(plan.id) } })
}

// ===== 公告交互 =====
const showNoticeDetail = (notice: Notice) => {
  selectedNotice.value = notice
  noticeSilentToday.value = false
  noticeListVisible.value = false
  noticeModalVisible.value = true
}

const openNoticeManual = () => {
  if (planNotices.value.length === 1) {
    showNoticeDetail(planNotices.value[0])
  } else {
    noticeListVisible.value = true
  }
}

const closeNoticeModal = () => {
  if (selectedNotice.value && isPopupNotice(selectedNotice.value) && noticeSilentToday.value) {
    localStorage.setItem(getPopupStorageKey(selectedNotice.value), todayKey())
  }
  noticeModalVisible.value = false
}

const handleNoticeModalUpdate = (show: boolean) => {
  if (!show) closeNoticeModal()
}

// ===== 数据获取 =====
const fetchPlans = async () => {
  loading.value = true
  try {
    const res = await userApi.getPlans()
    plans.value = res.data || []
  } catch {
    plans.value = []
  } finally {
    loading.value = false
  }
}

const fetchPlanNotices = async () => {
  try {
    const res = await userApi.getNotices()
    const allNotices: Notice[] = res.data || []
    // 筛选标签包含"套餐"的公告
    planNotices.value = allNotices.filter(n =>
      Array.isArray(n.tags) && n.tags.some(tag => tag.trim() === PLAN_NOTICE_TAG)
    )
    // 自动弹窗:找到第一条需要弹窗的公告
    const popupNotice = planNotices.value.find(shouldAutoPopup)
    if (popupNotice) {
      showNoticeDetail(popupNotice)
    }
  } catch {
    planNotices.value = []
  }
}

onMounted(async () => {
  await Promise.all([fetchPlans(), fetchPlanNotices()])
})
</script>

<style scoped>
.plans-page { display: flex; flex-direction: column; gap: 16px; }

/* 页面标题 */
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.header-text { display: flex; flex-direction: column; gap: 2px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--stellar-text); margin: 0; }
.page-sub { font-size: 13px; color: var(--stellar-text-muted); margin: 0; }

/* 提示词条 */
.tips-bar { display: flex; flex-wrap: wrap; gap: 10px; }
.tip-item { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px; background: var(--stellar-bg-card); border: 1px solid var(--stellar-border-light); }
.tip-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-text { font-size: 12px; color: var(--stellar-text-secondary); white-space: nowrap; }

.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.filter-group { display: flex; gap: 4px; background: var(--stellar-bg-card); padding: 4px; border-radius: 10px; border: 1px solid var(--stellar-border); }
.filter-btn { padding: 6px 16px; font-size: 13px; color: var(--stellar-text-secondary); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.filter-btn:hover { color: var(--stellar-text); }
.filter-btn.active { background: var(--stellar-primary); color: white; font-weight: 500; }
.sort-select { width: 200px; }

.skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.skeleton-card { padding: 24px; border-radius: 12px; border: 1px solid var(--stellar-border); background: var(--stellar-bg-card); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 16px; color: var(--stellar-text-muted); }
.empty-state p { font-size: 14px; margin: 0; }

.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.plan-card { position: relative; background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 16px; transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s; }
.plan-card:hover { border-color: var(--stellar-primary); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12); transform: translateY(-2px); }
.plan-header { }
.plan-name { font-size: 20px; font-weight: 700; color: var(--stellar-text); margin: 0 0 4px 0; }
.plan-desc { font-size: 12px; color: var(--stellar-text-muted); margin: 0; line-height: 1.5; }

.plan-price-display { display: flex; align-items: baseline; gap: 2px; padding: 4px 0; }
.price-symbol { font-size: 16px; font-weight: 600; color: var(--stellar-primary); }
.price-number { font-size: 36px; font-weight: 800; color: var(--stellar-primary); line-height: 1; }
.price-period-label { font-size: 13px; color: var(--stellar-text-muted); margin-left: 4px; }
.price-unavailable { font-size: 24px; color: var(--stellar-text-muted); }

.plan-features { display: flex; flex-direction: column; gap: 10px; padding: 16px 0; border-top: 1px solid var(--stellar-border-light); border-bottom: 1px solid var(--stellar-border-light); flex: 1; }
.feature-item { display: flex; align-items: center; gap: 8px; }
.feature-icon { color: var(--stellar-primary); flex-shrink: 0; }
.feature-label { font-size: 13px; color: var(--stellar-text-secondary); flex: 1; }
.feature-value { font-size: 13px; font-weight: 600; color: var(--stellar-text); }

.plan-action { margin-top: auto; }

/* ===== 公告弹窗 ===== */
.notice-modal-header { display: flex; align-items: center; gap: 8px; }
.notice-modal-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(59,130,246,0.12); color: var(--stellar-primary); flex-shrink: 0; }
.notice-modal-title { font-size: 16px; font-weight: 600; color: var(--stellar-text); }
.notice-modal-title.title-important { color: #ef4444; font-weight: 700; }
.notice-modal-title.title-popup { color: #f59e0b; font-weight: 500; }

.notice-detail { display: flex; flex-direction: column; gap: 12px; }
.notice-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.notice-date { font-size: 12px; color: var(--stellar-text-muted); }
.notice-tag { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: rgba(59,130,246,0.12); color: var(--stellar-primary); }
.notice-tag.tag-important { background: rgba(239,68,68,0.12); color: #ef4444; }
.notice-tag.tag-popup { background: rgba(245,158,11,0.12); color: #f59e0b; }
.notice-tag.tag-plan { background: rgba(59,130,246,0.12); color: #3b82f6; }

.notice-image { width: 100%; max-height: 260px; object-fit: cover; border-radius: 10px; border: 1px solid var(--stellar-border-light); }
.notice-body { font-size: 14px; color: var(--stellar-text); line-height: 1.7; }
.notice-body :deep(h1) { font-size: 20px; font-weight: 700; margin: 16px 0 10px; }
.notice-body :deep(h2) { font-size: 17px; font-weight: 700; margin: 14px 0 8px; }
.notice-body :deep(h3) { font-size: 15px; font-weight: 600; margin: 12px 0 6px; }
.notice-body :deep(p) { margin: 0 0 12px; }
.notice-body :deep(a) { color: var(--stellar-primary); text-decoration: none; }
.notice-body :deep(a:hover) { text-decoration: underline; }
.notice-body :deep(ul), .notice-body :deep(ol) { margin: 0 0 12px; padding-left: 24px; }
.notice-body :deep(li) { margin: 4px 0; }
.notice-body :deep(code) { font-family: 'SF Mono', Consolas, monospace; font-size: 13px; padding: 2px 6px; border-radius: 4px; background: var(--stellar-bg-hover); color: var(--stellar-accent); }
.notice-body :deep(pre) { padding: 14px; border-radius: 8px; background: var(--stellar-bg); border: 1px solid var(--stellar-border); overflow-x: auto; margin: 0 0 12px; }
.notice-body :deep(pre code) { padding: 0; background: transparent; }
.notice-body :deep(blockquote) { margin: 0 0 12px; padding: 10px 16px; border-left: 3px solid var(--stellar-primary); background: var(--stellar-bg-hover); border-radius: 0 8px 8px 0; }
.notice-body :deep(img) { max-width: 100%; border-radius: 8px; }
.notice-body :deep(table) { width: 100%; border-collapse: collapse; margin: 0 0 12px; font-size: 13px; }
.notice-body :deep(th), .notice-body :deep(td) { padding: 8px 12px; border: 1px solid var(--stellar-border); text-align: left; }
.notice-body :deep(th) { background: var(--stellar-bg-hover); font-weight: 600; }

.notice-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; }

/* 公告列表弹窗 */
.notice-list-modal { display: flex; flex-direction: column; gap: 4px; max-height: 400px; overflow-y: auto; }
.notice-list-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: background 0.2s; border: 1px solid transparent; }
.notice-list-item:hover { background: var(--stellar-bg-hover); border-color: var(--stellar-border-light); }
.notice-list-item-content { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.notice-list-item-title { font-size: 14px; font-weight: 500; color: var(--stellar-text); }
.notice-list-item-title.title-important { color: #ef4444; font-weight: 700; }
.notice-list-item-title.title-popup { color: #f59e0b; font-weight: 500; }
.notice-list-item-meta { display: flex; align-items: center; gap: 8px; }
.notice-list-item-date { font-size: 11px; color: var(--stellar-text-muted); }
.notice-tag-sm { display: inline-flex; align-items: center; padding: 1px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; background: rgba(59,130,246,0.12); color: #3b82f6; }
.notice-tag-sm.tag-important { background: rgba(239,68,68,0.12); color: #ef4444; }
.notice-tag-sm.tag-popup { background: rgba(245,158,11,0.12); color: #f59e0b; }
.notice-tag-sm.tag-plan { background: rgba(59,130,246,0.12); color: #3b82f6; }
.notice-list-item-arrow { color: var(--stellar-text-muted); flex-shrink: 0; }
.notice-list-empty { padding: 40px 20px; text-align: center; color: var(--stellar-text-muted); font-size: 13px; }

@media (max-width: 1023px) {
  .plans-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .plans-grid, .skeleton-grid { grid-template-columns: 1fr; }
  .plan-card { padding: 20px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .sort-select { width: 100%; }
  .page-title { font-size: 20px; }
  .tips-bar { flex-direction: column; }
  .filter-group { overflow-x: auto; }
}
</style>

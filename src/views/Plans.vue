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
        :class="{ 'is-sold-out': isPlanSoldOut(plan) }"
      >
        <!-- 套餐名称 + 价格 -->
        <div class="plan-header">
          <div class="plan-title-row">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <span
              v-if="planStockBadge(plan)"
              class="plan-stock-badge"
              :class="{ 'is-sold-out': planStockBadge(plan)?.soldOut }"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {{ planStockBadge(plan)?.text }}
            </span>
          </div>
          <div class="plan-price-display">
            <template v-if="displayPriceInfo(plan)">
              <span class="price-symbol">¥</span>
              <span class="price-number">{{ formatPrice(displayPriceInfo(plan)!.price) }}</span>
              <span class="price-period-label">{{ displayPriceInfo(plan)!.label }}</span>
            </template>
            <template v-else>
              <span class="price-unavailable">-</span>
            </template>
          </div>
        </div>

        <!-- 套餐介绍（支持 JSON / HTML / Markdown） -->
        <div v-if="plan.content" class="plan-desc rich-content" v-html="renderRichContent(plan.content)"></div>

        <!-- 购买按钮 -->
        <div class="plan-action">
          <n-button type="primary" block :disabled="isPlanSoldOut(plan)" @click="goToCheckout(plan)">
            {{ isPlanSoldOut(plan) ? t('plan.soldOut') : t('plan.subscribe') }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 套餐公告弹窗 -->
    <n-modal :show="noticeModalVisible" preset="card" :style="{ maxWidth: '560px', width: 'calc(100vw - 24px)' }" @update:show="handleNoticeModalUpdate">
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
        <div class="notice-body" v-html="renderContent(selectedNotice.content)"></div>
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
    <n-modal :show="noticeListVisible" preset="card" :title="t('plan.announcementList')" :style="{ maxWidth: '480px', width: 'calc(100vw - 24px)' }" @update:show="(v: boolean) => noticeListVisible = v">
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
import { formatPrice, formatDate } from '@/utils/format'
import { getPlanStockBadgeInfo, isPlanSoldOut } from '@/utils/plan'
import { renderContent, renderRichContent } from '@/utils/safe'

const router = useRouter()
const { t } = useI18n()

const plans = ref<Plan[]>([])
const loading = ref(true)
const activeFilter = ref('all')
const sortBy = ref('default')

// ===== 公告 =====
// 标签关键词可配置（env.js 的 notice_tags，支持中英文，不区分大小写），
// 默认值同时兼容中文（套餐/弹窗/重要）与英文（Plan/Popup/Important）。
const PLAN_NOTICE_SILENT_PREFIX = 'stellar_plan_notice_silent:'

const noticeTags = computed(() => {
  const cfg = window.settings?.notice_tags
  const fallback = { plan: ['套餐', 'Plan'], popup: ['弹窗', 'Popup'], important: ['重要', 'Important'] }
  const pick = (list: string[] | undefined, def: string[]) => (list && list.length > 0 ? list : def)
  return {
    plan: pick(cfg?.plan, fallback.plan),
    popup: pick(cfg?.popup, fallback.popup),
    important: pick(cfg?.important, fallback.important),
  }
})

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

// 匹配标签：trim() 后不区分大小写比较，避免前后空格/大小写误判
const matchesAnyTag = (notice: Notice | null, keywords: string[]) => {
  const tags = getNoticeTags(notice)
  const lowerKeywords = keywords.map(k => k.trim().toLowerCase()).filter(Boolean)
  if (lowerKeywords.length === 0) return false
  return tags.some(tag => lowerKeywords.includes(tag.trim().toLowerCase()))
}

const isImportantNotice = (notice: Notice | null) => matchesAnyTag(notice, noticeTags.value.important)
const isPopupNotice = (notice: Notice | null) => matchesAnyTag(notice, noticeTags.value.popup)

const getNoticeTitleClass = (notice: Notice | null) => {
  if (isImportantNotice(notice)) return 'title-important'
  if (isPopupNotice(notice)) return 'title-popup'
  return ''
}

const getNoticeTagClass = (tag: string) => {
  const t = tag.trim().toLowerCase()
  if (noticeTags.value.important.some(k => k.trim().toLowerCase() === t)) return 'tag-important'
  if (noticeTags.value.popup.some(k => k.trim().toLowerCase() === t)) return 'tag-popup'
  if (noticeTags.value.plan.some(k => k.trim().toLowerCase() === t)) return 'tag-plan'
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

// 周期价格优先级（月→季→半年→年→两年→三年→一次性）
const priceFields: Array<{ field: keyof Plan, labelKey: string }> = [
  { field: 'month_price', labelKey: 'plan.perMonth' },
  { field: 'quarter_price', labelKey: 'plan.perQuarter' },
  { field: 'half_year_price', labelKey: 'plan.perHalfYear' },
  { field: 'year_price', labelKey: 'plan.perYear' },
  { field: 'two_year_price', labelKey: 'plan.perTwoYear' },
  { field: 'three_year_price', labelKey: 'plan.perThreeYear' },
  { field: 'onetime_price', labelKey: 'plan.perOnetime' },
]

// 获取套餐展示用价格信息（按优先级回退）
const displayPriceInfo = (plan: Plan): { price: number, label: string } | null => {
  for (const f of priceFields) {
    const v = plan[f.field] as number | null
    if (v !== null && v !== undefined) {
      return { price: v, label: t(f.labelKey) }
    }
  }
  return null
}

// ===== 库存 =====
// 套餐库存徽标：不限量返回 null；已售罄返回「已售罄」；
// 后端补丁提供剩余+总数时显示「剩余 X / 总 Y」，否则按后端语义显示「限量 N 份」或「仅剩 N 份」
const planStockBadge = (plan: Plan): { soldOut: boolean, text: string } | null => {
  const info = getPlanStockBadgeInfo(plan)
  if (!info) return null
  if (info.soldOut) return { soldOut: true, text: t('plan.soldOut') }
  const text = info.labelKey === 'plan.stockRemainTotal'
    ? t('plan.stockRemainTotal', { remain: info.remain ?? 0, total: info.total ?? 0 })
    : t(info.labelKey, { count: info.count ?? 0 })
  return { soldOut: false, text }
}

const getMonthPrice = (plan: Plan): number | null => {
  return displayPriceInfo(plan)?.price ?? null
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
    // 筛选标签包含"套餐"（或配置的 plan 关键词）的公告
    planNotices.value = allNotices.filter(n =>
      Array.isArray(n.tags) && n.tags.some(tag =>
        noticeTags.value.plan.some(k => k.trim().toLowerCase() === tag.trim().toLowerCase())
      )
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
.plan-header { display: flex; flex-direction: column; gap: 6px; }
.plan-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.plan-name { font-size: 20px; font-weight: 700; color: var(--stellar-text); margin: 0; }
.plan-desc { font-size: 12px; color: var(--stellar-text-muted); margin: 0; line-height: 1.5; flex: 1; }

/* 套餐库存徽标 */
.plan-stock-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 1.5; background: rgba(245, 158, 11, 0.14); color: #f59e0b; }
.plan-stock-badge.is-sold-out { background: rgba(239, 68, 68, 0.14); color: #ef4444; }
.plan-card.is-sold-out { border-color: rgba(239, 68, 68, 0.28); }
.plan-card.is-sold-out:hover { border-color: #ef4444; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.12); }

/* 套餐介绍富文本（HTML / Markdown） */
.plan-desc.rich-content { font-size: 12px; color: var(--stellar-text-muted); }
.plan-desc.rich-content :deep(p) { margin: 0 0 6px; }
.plan-desc.rich-content :deep(p:last-child) { margin-bottom: 0; }
.plan-desc.rich-content :deep(h1),
.plan-desc.rich-content :deep(h2),
.plan-desc.rich-content :deep(h3),
.plan-desc.rich-content :deep(h4) { font-size: 13px; font-weight: 700; color: var(--stellar-text); margin: 8px 0 4px; line-height: 1.4; }
.plan-desc.rich-content :deep(ul),
.plan-desc.rich-content :deep(ol) { margin: 0 0 6px; padding-left: 18px; }
.plan-desc.rich-content :deep(li) { margin: 2px 0; }
.plan-desc.rich-content :deep(li::marker) { color: var(--stellar-text-muted); }
.plan-desc.rich-content :deep(a) { color: var(--stellar-primary); text-decoration: none; }
.plan-desc.rich-content :deep(a:hover) { text-decoration: underline; }
.plan-desc.rich-content :deep(strong) { font-weight: 700; color: var(--stellar-text); }
.plan-desc.rich-content :deep(em) { font-style: italic; }
.plan-desc.rich-content :deep(code) { font-family: 'SF Mono', Consolas, monospace; font-size: 11px; padding: 1px 4px; border-radius: 3px; background: var(--stellar-bg-hover); color: var(--stellar-accent); }
.plan-desc.rich-content :deep(pre) { margin: 0 0 6px; padding: 8px 10px; border-radius: 6px; background: var(--stellar-bg); border: 1px solid var(--stellar-border); overflow-x: auto; }
.plan-desc.rich-content :deep(pre code) { padding: 0; background: transparent; color: var(--stellar-text); }
.plan-desc.rich-content :deep(blockquote) { margin: 0 0 6px; padding: 4px 10px; border-left: 2px solid var(--stellar-primary); background: var(--stellar-bg-hover); border-radius: 0 6px 6px 0; }
.plan-desc.rich-content :deep(blockquote p) { margin: 0; }
.plan-desc.rich-content :deep(img) { max-width: 100%; border-radius: 6px; }
.plan-desc.rich-content :deep(table) { width: 100%; border-collapse: collapse; margin: 0 0 6px; font-size: 11px; }
.plan-desc.rich-content :deep(th),
.plan-desc.rich-content :deep(td) { padding: 4px 8px; border: 1px solid var(--stellar-border); text-align: left; }
.plan-desc.rich-content :deep(th) { background: var(--stellar-bg-hover); font-weight: 600; }
.plan-desc.rich-content :deep(hr) { border: none; border-top: 1px solid var(--stellar-border-light); margin: 8px 0; }

/* JSON 结构化介绍（贴合 detail-row 风格） */
.plan-desc.rich-content :deep(.jt) { font-size: 12px; font-weight: 600; color: var(--stellar-text-secondary); margin: 10px 0 2px; }
.plan-desc.rich-content :deep(.jt:first-child) { margin-top: 0; }
.plan-desc.rich-content :deep(.jt-list) { list-style: none; margin: 0; padding: 0; }
/* 文本条目：勾选图标 + 文本 */
.plan-desc.rich-content :deep(.jt-text) { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--stellar-text-secondary); line-height: 1.5; padding: 4px 0; }
.plan-desc.rich-content :deep(.jt-text .ji) { color: var(--stellar-success); flex-shrink: 0; margin-top: 2px; }
.plan-desc.rich-content :deep(.jt-text span) { flex: 1; }
/* 键值对条目：label 左 / value 右，分隔线风格 */
.plan-desc.rich-content :deep(.jt-kv) { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; padding: 6px 0; border-bottom: 1px solid var(--stellar-border-light); }
.plan-desc.rich-content :deep(.jt-list .jt-kv:last-child) { border-bottom: none; }
.plan-desc.rich-content :deep(.jt-label) { color: var(--stellar-text-muted); flex-shrink: 0; }
.plan-desc.rich-content :deep(.jt-value) { color: var(--stellar-text); font-weight: 500; text-align: right; }
/* 高亮键值对 */
.plan-desc.rich-content :deep(.jt-kv.is-hl) { background: var(--stellar-primary-light); border-radius: 6px; padding: 6px 10px; margin: 2px -6px; border-bottom: none; }
.plan-desc.rich-content :deep(.jt-kv.is-hl .jt-value) { color: var(--stellar-primary); font-weight: 600; }
/* 分隔线 */
.plan-desc.rich-content :deep(.jt-divider) { height: 0; margin: 6px 0; padding: 0; border: none; border-top: 1px solid var(--stellar-border-light); list-style: none; }
/* 链接键值对 */
.plan-desc.rich-content :deep(.jt-link) { color: var(--stellar-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 2px; }
.plan-desc.rich-content :deep(.jt-link:hover) { text-decoration: underline; }
.plan-desc.rich-content :deep(.jt-link::after) { content: '↗'; font-size: 11px; opacity: 0.7; }

.plan-price-display { display: flex; align-items: baseline; gap: 2px; }
.price-symbol { font-size: 16px; font-weight: 600; color: var(--stellar-primary); }
.price-number { font-size: 36px; font-weight: 800; color: var(--stellar-primary); line-height: 1; }
.price-period-label { font-size: 13px; color: var(--stellar-text-muted); margin-left: 4px; }
.price-unavailable { font-size: 24px; color: var(--stellar-text-muted); }

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
.notice-body { font-size: 14px; color: var(--stellar-text); line-height: 1.7; overflow-wrap: break-word; word-break: break-word; overflow-x: hidden; }
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
.notice-body :deep(table) { display: block; overflow-x: auto; width: 100%; border-collapse: collapse; margin: 0 0 12px; font-size: 13px; }
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

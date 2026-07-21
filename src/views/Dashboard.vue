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
        <!-- 我的订阅卡片(跨2列) -->
        <div class="content-card subscription-card area-subscription">
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
                  <n-button secondary type="primary" @click="copySubscribeUrl">
                    <template #icon><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></template>
                    {{ t('dashboard.copyUrl') }}
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

        <!-- 快速入口(竖列列表,类似 AkileCloud 快捷操作) -->
        <div class="content-card quick-access-card area-quick">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.quickAccess') }}</h3>
          </div>
          <div class="quick-access-list">
            <div class="quick-item" @click="$router.push('/servers')">
              <div class="quick-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              </div>
              <span class="quick-label">{{ t('nav.servers') }}</span>
              <svg class="quick-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="quick-item" @click="$router.push('/knowledge')">
              <div class="quick-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <span class="quick-label">{{ t('dashboard.viewTutorial') }}</span>
              <svg class="quick-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="quick-item" @click="showSubscribeModal = true">
              <div class="quick-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              </div>
              <span class="quick-label">{{ t('dashboard.oneClickSubscribe') }}</span>
              <svg class="quick-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="quick-item" @click="$router.push('/plans')">
              <div class="quick-icon" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <span class="quick-label">{{ t('dashboard.buySubscription') }}</span>
              <svg class="quick-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="quick-item" @click="$router.push('/tickets')">
              <div class="quick-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span class="quick-label">{{ t('nav.tickets') }}</span>
              <svg class="quick-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <div class="quick-item" @click="$router.push('/invite')">
              <div class="quick-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span class="quick-label">{{ t('nav.invite') }}</span>
              <svg class="quick-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        <!-- 最近订单 -->
        <div class="content-card recent-list-card area-orders">
          <div class="card-header">
            <div class="card-header-text">
              <h3 class="card-title">{{ t('dashboard.recentOrders') }}</h3>
              <span class="card-subtitle">{{ t('dashboard.recentOrdersDesc') }}</span>
            </div>
            <button v-if="recentOrders.length > 0" class="card-link-btn" @click="$router.push('/orders')">{{ t('dashboard.viewAllOrders') }} →</button>
          </div>
          <div class="card-body-list">
            <div v-if="ordersLoading" class="list-loading">
              <span class="loading-dot"></span>
              <span>{{ t('common.loading') }}</span>
            </div>
            <div v-else-if="recentOrders.length === 0" class="list-empty" @click="$router.push('/plans')">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <p>{{ t('dashboard.noOrders') }}</p>
              <span class="empty-hint">{{ t('dashboard.noOrdersHint') }}</span>
            </div>
            <div v-else class="recent-list">
              <div v-for="order in recentOrders" :key="order.id" class="recent-item">
                <div class="recent-item-main">
                  <div class="recent-item-title">
                    <span class="recent-name">{{ order.plan?.name || `Plan #${order.plan_id}` }}</span>
                    <span class="recent-tag" :class="`order-status-${order.status}`">{{ getOrderStatusText(order.status) }}</span>
                  </div>
                  <div class="recent-item-meta">
                    <span>¥{{ formatMoney(order.total_amount) }}</span>
                    <span class="dot-sep">·</span>
                    <span>{{ formatDate(order.created_at) }}</span>
                  </div>
                </div>
                <button v-if="order.status === 0" class="mini-btn primary" @click="$router.push('/orders')">{{ t('dashboard.goPay') }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近工单 -->
        <div class="content-card recent-list-card area-tickets">
          <div class="card-header">
            <div class="card-header-text">
              <h3 class="card-title">{{ t('dashboard.recentTickets') }}</h3>
              <span class="card-subtitle">{{ t('dashboard.recentTicketsDesc') }}</span>
            </div>
            <button v-if="recentTickets.length > 0" class="card-link-btn" @click="$router.push('/tickets')">{{ t('dashboard.viewAllTickets') }} →</button>
          </div>
          <div class="card-body-list">
            <div v-if="ticketsLoading" class="list-loading">
              <span class="loading-dot"></span>
              <span>{{ t('common.loading') }}</span>
            </div>
            <div v-else-if="recentTickets.length === 0" class="list-empty" @click="$router.push('/tickets')">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p>{{ t('dashboard.noTickets') }}</p>
              <span class="empty-hint">{{ t('dashboard.noTicketsHint') }}</span>
            </div>
            <div v-else class="recent-list">
              <div v-for="ticket in recentTickets" :key="ticket.id" class="recent-item" @click="$router.push('/tickets')">
                <div class="recent-item-main">
                  <div class="recent-item-title">
                    <span class="recent-name">{{ ticket.subject }}</span>
                    <span class="recent-tag" :class="`ticket-status-${ticket.status}`">{{ getTicketStatusText(ticket.status) }}</span>
                  </div>
                  <div class="recent-item-meta">
                    <span>{{ t('dashboard.lastUpdate') }}: {{ formatDate(ticket.updated_at) }}</span>
                  </div>
                </div>
                <svg class="recent-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 流量使用热力图(跨3列) -->
        <div class="content-card traffic-heatmap-card area-heatmap">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.trafficHeatmap') }}</h3>
            <span class="card-subtitle">{{ t('dashboard.trafficHeatmapDesc') }}</span>
          </div>
          <div class="heatmap-body">
            <div v-if="heatmapLoading" class="heatmap-loading">
              <n-skeleton text :repeat="3" />
            </div>
            <div v-else-if="heatmapData.length === 0" class="heatmap-empty">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p>{{ t('dashboard.heatmapEmpty') }}</p>
            </div>
            <template v-else>
              <v-chart :option="heatmapOption" autoresize class="heatmap-chart" />
              <div class="heatmap-legend">
                <span class="legend-label">{{ t('dashboard.trafficLess') }}</span>
                <span class="legend-block" style="background: rgba(59,130,246,0.08);"></span>
                <span class="legend-block" style="background: rgba(59,130,246,0.25);"></span>
                <span class="legend-block" style="background: rgba(59,130,246,0.5);"></span>
                <span class="legend-block" style="background: rgba(59,130,246,0.75);"></span>
                <span class="legend-block" style="background: #3b82f6;"></span>
                <span class="legend-label">{{ t('dashboard.trafficMore') }}</span>
              </div>
              <div class="heatmap-stats">
                <div class="heatmap-stat">
                  <span class="stat-key">{{ t('dashboard.heatmapTotal') }}</span>
                  <span class="stat-val">{{ formatTraffic(heatmapTotal) }}</span>
                </div>
                <div class="heatmap-stat">
                  <span class="stat-key">{{ t('dashboard.heatmapAvg') }}</span>
                  <span class="stat-val">{{ formatTraffic(heatmapAvg) }}</span>
                </div>
                <div class="heatmap-stat">
                  <span class="stat-key">{{ t('dashboard.heatmapMax') }}</span>
                  <span class="stat-val">{{ formatTraffic(heatmapMax) }}</span>
                </div>
                <div class="heatmap-stat">
                  <span class="stat-key">{{ t('dashboard.heatmapDays') }}</span>
                  <span class="stat-val">{{ heatmapActiveDays }} / {{ heatmapTotalDays }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 客户端下载(跨3列) -->
        <div v-if="availableClients.length > 0" class="content-card client-download-card area-client">
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

    <!-- 一键订阅弹窗 -->
    <SubscribeImportModal v-model:show="showSubscribeModal" :subscribe-url="subscribeUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, NButton, NProgress, NSkeleton, useDialog } from 'naive-ui'
import VChart from 'vue-echarts'
import '@/utils/echarts'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { userApi, normalizeListData } from '@/api'
import http from '@/api/http'
import type { Subscribe, User, TrafficLog, Order, Ticket } from '@/api/types'
import { formatTraffic, formatMoney, formatDate } from '@/utils/format'
import SubscribeImportModal from '@/components/SubscribeImportModal.vue'

const { t } = useI18n()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const appStore = useAppStore()
const userStore = useUserStore()

const user = ref<User | null>(null)
const subscribe = ref<Subscribe | null>(null)
const showSubscribeModal = ref(false)
const loading = ref(true)
const resetLoading = ref(false)

// ===== 最近订单 =====
const recentOrders = ref<Order[]>([])
const ordersLoading = ref(false)

const fetchRecentOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await userApi.getOrderList(1, 5)
    recentOrders.value = normalizeListData<Order>(res.data as any).slice(0, 5)
  } catch (err) {
    console.warn('[Dashboard] 获取最近订单失败:', err)
    recentOrders.value = []
  } finally {
    ordersLoading.value = false
  }
}

const getOrderStatusText = (status: number) => t(`dashboard.orderStatus${status}`)
const getTicketStatusText = (status: number) => t(`dashboard.ticketStatus${status}`)

// ===== 最近工单 =====
const recentTickets = ref<Ticket[]>([])
const ticketsLoading = ref(false)

const fetchRecentTickets = async () => {
  ticketsLoading.value = true
  try {
    const res = await userApi.getTicketList(1)
    const list = normalizeListData<Ticket>(res.data as any)
    recentTickets.value = list.slice(0, 5)
  } catch (err) {
    console.warn('[Dashboard] 获取最近工单失败:', err)
    recentTickets.value = []
  } finally {
    ticketsLoading.value = false
  }
}

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

// ===== 流量使用热力图 =====
const heatmapLoading = ref(false)
const heatmapRawLogs = ref<TrafficLog[]>([])

// 时间戳转 YYYY-MM-DD(本地时区)
const toDateKey = (ts: number): string => {
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 按天聚合流量(每天 u + d 求和,单位字节)
const heatmapData = computed<[string, number][]>(() => {
  const map = new Map<string, number>()
  for (const log of heatmapRawLogs.value) {
    const key = toDateKey(log.record_at)
    const bytes = (log.u || 0) + (log.d || 0)
    map.set(key, (map.get(key) || 0) + bytes)
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
})

const heatmapTotal = computed(() => heatmapData.value.reduce((s, [, v]) => s + v, 0))
const heatmapMax = computed(() => heatmapData.value.reduce((m, [, v]) => Math.max(m, v), 0))
const heatmapAvg = computed(() => {
  const n = heatmapData.value.length
  return n > 0 ? Math.floor(heatmapTotal.value / n) : 0
})
const heatmapActiveDays = computed(() => heatmapData.value.length)

// 时间范围: 最近 6 个月(含今天),覆盖大约 26 周的网格
const heatmapRange = computed<[string, string]>(() => {
  const end = new Date()
  const start = new Date(end)
  start.setMonth(start.getMonth() - 5)
  start.setDate(1)
  return [toDateKey(Math.floor(start.getTime() / 1000)), toDateKey(Math.floor(end.getTime() / 1000))]
})

// 总天数(范围内)
const heatmapTotalDays = computed(() => {
  const [s, e] = heatmapRange.value
  const ms = new Date(e).getTime() - new Date(s).getTime()
  return Math.floor(ms / 86400000) + 1
})

// visualMap 最大值(向上取整到合理刻度)
const heatmapVMax = computed(() => {
  const mx = heatmapMax.value
  if (mx <= 0) return 1024 * 1024 * 100 // 100MB
  // 向上取整到 MB 边界,避免 1 字节和 1GB 同色
  const mb = mx / (1024 * 1024)
  if (mb < 1) return 1024 * 1024
  if (mb < 10) return 10 * 1024 * 1024
  if (mb < 100) return 100 * 1024 * 1024
  if (mb < 1024) return 1024 * 1024 * 1024
  return Math.ceil(mb / 1024) * 1024 * 1024 * 1024
})

const heatmapOption = computed(() => {
  const isDark = appStore.isDark
  return {
    tooltip: {
      formatter: (p: any) => {
        const bytes = p.value[1] as number
        return `${p.value[0]}<br/><b>${formatTraffic(bytes)}</b>`
      },
    },
    visualMap: {
      min: 0,
      max: heatmapVMax.value,
      show: false,
      inRange: {
        color: isDark
          ? ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.6)', '#3b82f6', '#2563eb']
          : ['rgba(59,130,246,0.08)', 'rgba(59,130,246,0.25)', 'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.8)', '#2563eb'],
      },
    },
    calendar: {
      top: 30,
      left: 40,
      right: 20,
      bottom: 30,
      range: heatmapRange.value,
      cellSize: ['auto', 13],
      itemStyle: {
        borderWidth: 2,
        borderColor: isDark ? 'rgba(26,29,36,0.8)' : '#fff',
        color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)',
      },
      splitLine: { show: false },
      yearLabel: { show: false },
      monthLabel: {
        nameMap: 'EN',
        color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
        fontSize: 11,
        margin: 8,
      },
      dayLabel: {
        firstDay: 1,
        nameMap: 'EN',
        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        fontSize: 10,
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: heatmapData.value,
      },
    ],
  }
})

const fetchTrafficHeatmap = async () => {
  heatmapLoading.value = true
  try {
    // 拉取最近若干页流量日志(每页 100 条,够覆盖 6 个月)
    const allLogs: TrafficLog[] = []
    let page = 1
    const maxPages = 20 // 安全上限,避免死循环
    while (page <= maxPages) {
      const res = await userApi.getTrafficLog(page, 100)
      const resp = res.data as any
      const list: TrafficLog[] = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : [])
      if (list.length === 0) break
      allLogs.push(...list)
      // 是否还有下一页
      const lastPage = resp?.last_page
      if (lastPage && page >= lastPage) break
      if (list.length < 100) break
      page++
    }
    heatmapRawLogs.value = allLogs
  } catch (err) {
    console.error('[Dashboard] 获取流量日志失败:', err)
    heatmapRawLogs.value = []
  } finally {
    heatmapLoading.value = false
  }
}

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
  loading.value = false
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

const fallbackCopyText = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

const copySubscribeUrl = async () => {
  const url = subscribeUrl.value
  if (!url) {
    message.warning(t('dashboard.noSubscribeUrl'))
    return
  }
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
    } else if (!fallbackCopyText(url)) {
      throw new Error('Copy failed')
    }
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

onMounted(() => {
  fetchData()
  fetchTrafficHeatmap()
  fetchRecentOrders()
  fetchRecentTickets()
})
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
.stat-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; padding: 18px 20px; display: flex; align-items: stretch; gap: 14px; transition: all 0.2s; cursor: pointer; min-height: 96px; box-sizing: border-box; }
.stat-card:hover { border-color: var(--stellar-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.stat-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; align-self: flex-start; }
.stat-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; height: 100%; }
.stat-label { font-size: 12px; color: var(--stellar-text-muted); line-height: 1.2; }
.stat-value { font-size: 19px; font-weight: 700; color: var(--stellar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.stat-link { font-size: 12px; color: var(--stellar-primary); margin-top: auto; padding-top: 6px; line-height: 1.2; }

/* 主内容区 - 6 列 grid,精确控制每列宽度 */
.dashboard-main {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}
/* 桌面端布局(≥1200px):
   第1行: 我的订阅(3列) | 客户端下载(2列) | 快速入口(1列)
   第2行: 流量热力图(2列) | 最近订单(2列) | 最近工单(2列)
   第二行高度以热力图为准,订单/工单自动跟随 */
.area-subscription { grid-column: 1 / 4; grid-row: 1; }
.area-client { grid-column: 4 / 6; grid-row: 1; }
.area-quick { grid-column: 6 / 7; grid-row: 1; }
.area-heatmap { grid-column: 1 / 3; grid-row: 2; }
  .area-orders { grid-column: 3 / 5; grid-row: 2; }
  .area-tickets { grid-column: 5 / 7; grid-row: 2; }
/* 最近订单/工单高度跟随热力图,不单独固定 */
.area-orders, .area-tickets { height: auto; }
/* 可选卡片不渲染时的布局补偿 */
.dashboard-main:not(:has(.area-client)) .area-subscription { grid-column: 1 / 5; }
.dashboard-main:not(:has(.area-client)) .area-quick { grid-column: 5 / 7; }
.dashboard-main:not(:has(.area-quick)) .area-client { grid-column: 4 / 7; }
.dashboard-main:not(:has(.area-client)):not(:has(.area-quick)) .area-subscription { grid-column: 1 / -1; }
.dashboard-main:not(:has(.area-orders)) .area-tickets { grid-column: 3 / 7; }
.dashboard-main:not(:has(.area-tickets)) .area-orders { grid-column: 3 / 7; }
.dashboard-main:not(:has(.area-orders)):not(:has(.area-tickets)) .area-heatmap { grid-column: 1 / -1; }

.content-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--stellar-border-light); }
.card-title { font-size: 15px; font-weight: 600; color: var(--stellar-text); margin: 0; }

/* 我的订阅卡片 */
.subscription-card .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.empty-subscription { display: flex; align-items: center; justify-content: center; padding: 36px 20px; flex: 1; }
.empty-icon { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; color: var(--stellar-text-muted); transition: color 0.2s; }
.empty-icon:hover { color: var(--stellar-primary); }
.empty-icon p { font-size: 14px; margin: 0; }

.subscription-body { flex: 1; display: flex; flex-direction: column; }
.subscription-overview { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(200px, 0.85fr); gap: 16px; align-items: stretch; flex: 1; }
.subscription-summary { min-width: 0; display: flex; flex-direction: column; gap: 14px; padding: 16px 18px; border-radius: 12px; background: var(--stellar-bg-hover); }
.sub-plan-name { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.sub-plan-kicker { color: var(--stellar-text-muted); font-size: 11px; }
.sub-plan-tag { color: var(--stellar-text); font-size: 18px; font-weight: 700; word-break: break-all; line-height: 1.25; }

.sub-expire-info { display: flex; align-items: center; gap: 7px; font-size: 12px; padding: 7px 10px; border-radius: 8px; align-self: flex-start; }
.sub-expire-info svg { flex-shrink: 0; }
.sub-expire-info.normal { background: rgba(16, 185, 129, 0.12); color: #10b981; }
.sub-expire-info.warning { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.sub-expire-info.expired { background: rgba(239, 68, 68, 0.12); color: #ef4444; }

.sub-traffic-section { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 10px; background: var(--stellar-bg-card); border: 1px solid var(--stellar-border-light); }
.sub-traffic-header { display: flex; justify-content: space-between; align-items: center; color: var(--stellar-text-secondary); font-size: 12px; }
.sub-traffic-percent { color: var(--stellar-text); font-weight: 700; font-size: 13px; }
.sub-traffic-detail { display: flex; justify-content: space-between; gap: 12px; color: var(--stellar-text-muted); font-size: 11px; }
.sub-controls { display: flex; flex-wrap: wrap; gap: 7px; margin-top: auto; }

.subscription-traffic-visual { min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 16px 14px; border-radius: 12px; background: linear-gradient(160deg, var(--stellar-primary-light), transparent 70%); border: 1px solid var(--stellar-border-light); }
.traffic-ring { width: 180px; height: 180px; flex-shrink: 0; }
.compact-ring { width: 115px; height: 115px; }
.compact-ring :deep(> div) { width: 100% !important; height: 100% !important; }
.traffic-details { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.compact-details { min-width: 0; gap: 8px; }
.traffic-row { display: flex; align-items: center; gap: 7px; }
.traffic-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.traffic-label { flex: 1; color: var(--stellar-text-secondary); font-size: 11px; white-space: nowrap; }
.traffic-value { color: var(--stellar-text); font-size: 13px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.total-row { margin-top: 2px; padding-top: 8px; border-top: 1px dashed var(--stellar-border-light); }

/* 捷径(已合并到快速入口) */

/* 快速入口卡片(单列竖排列式布局) */
.quick-access-card { }
.quick-access-list { display: flex; flex-direction: column; gap: 2px; padding: 6px; flex: 1; justify-content: center; overflow-y: auto; }
.quick-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.quick-item:hover { background: var(--stellar-bg-hover); }
.quick-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.quick-label { font-size: 12px; font-weight: 500; color: var(--stellar-text-secondary); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.quick-arrow { display: none; }
/* 快速入口占2列时改为两列网格 */
.dashboard-main:not(:has(.area-client)) .quick-access-list { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 8px; }
.dashboard-main:not(:has(.area-client)) .quick-item { flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; }
.dashboard-main:not(:has(.area-client)) .quick-label { text-align: center; font-size: 11px; }

/* 最近订单/工单列表卡片 */
.recent-list-card .card-header { align-items: flex-start; }
.card-header-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.recent-list-card .card-subtitle { font-size: 12px; color: var(--stellar-text-muted); font-weight: 400; }
.card-link-btn { background: none; border: none; font-size: 12px; color: var(--stellar-primary); cursor: pointer; padding: 4px 6px; border-radius: 6px; transition: background 0.2s; white-space: nowrap; flex-shrink: 0; }
.card-link-btn:hover { background: var(--stellar-bg-hover); }

.card-body-list { padding: 6px; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.recent-list { display: flex; flex-direction: column; gap: 2px; padding: 4px; flex: 1; overflow-y: auto; min-height: 0; }
.recent-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
.recent-item:hover { background: var(--stellar-bg-hover); }
.recent-item-main { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.recent-item-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.recent-name { font-size: 13px; font-weight: 600; color: var(--stellar-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; max-width: 100%; }
.recent-tag { font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 999px; flex-shrink: 0; line-height: 1.6; }
.recent-item-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--stellar-text-muted); }
.dot-sep { opacity: 0.5; }
.recent-arrow { color: var(--stellar-text-muted); flex-shrink: 0; }
.mini-btn { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
.mini-btn.primary { background: var(--stellar-primary); color: white; }
.mini-btn.primary:hover { filter: brightness(1.05); }

/* 订单状态颜色 */
.recent-tag.order-status-0 { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.recent-tag.order-status-1 { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.recent-tag.order-status-2 { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.recent-tag.order-status-3 { background: rgba(107, 114, 128, 0.15); color: #6b7280; }
.recent-tag.order-status-4 { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.recent-tag.order-status-5 { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }

/* 工单状态颜色 */
.recent-tag.ticket-status-0 { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.recent-tag.ticket-status-1 { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.recent-tag.ticket-status-2 { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

/* 列表加载/空状态 */
.list-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 36px 16px; color: var(--stellar-text-muted); font-size: 13px; }
.list-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 28px 20px; color: var(--stellar-text-muted); cursor: pointer; transition: color 0.2s; flex: 1; justify-content: center; }
.list-empty:hover { color: var(--stellar-primary); }
.list-empty p { font-size: 13px; margin: 0; font-weight: 500; }
.empty-hint { font-size: 11px; opacity: 0.7; }
.loading-dot { width: 14px; height: 14px; border: 2px solid var(--stellar-border); border-top-color: var(--stellar-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
.loading-dot.small { width: 12px; height: 12px; border-width: 1.5px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 客户端下载 */
.client-download-card { }
.client-download-card .card-header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.client-download-card .card-subtitle { font-size: 12px; color: var(--stellar-text-muted); font-weight: 400; }
.client-grid { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; flex: 1; justify-content: center; }
.client-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; background: var(--stellar-bg-hover); border: 1px solid transparent; text-decoration: none; transition: all 0.2s; cursor: pointer; }
.client-item:hover { border-color: var(--stellar-primary); background: var(--stellar-bg-card); transform: translateY(-1px); }
.client-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--stellar-bg-card); border: 1px solid var(--stellar-border-light); }
.client-logo-img { width: 20px; height: 20px; object-fit: contain; }
.client-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.client-name { font-size: 12px; font-weight: 600; color: var(--stellar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.client-download-hint { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; color: var(--stellar-text-muted); }

/* 流量使用热力图 */
.traffic-heatmap-card .card-header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.traffic-heatmap-card .card-subtitle { font-size: 12px; color: var(--stellar-text-muted); font-weight: 400; }
.heatmap-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.heatmap-loading { padding: 12px 0; }
.heatmap-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 20px; color: var(--stellar-text-muted); }
.heatmap-empty p { font-size: 13px; margin: 0; }
.heatmap-chart { width: 100%; height: 200px; }
.heatmap-chart :deep(.echarts) { width: 100% !important; height: 200px !important; }
.heatmap-legend { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 11px; color: var(--stellar-text-muted); }
.heatmap-legend .legend-block { display: inline-block; width: 12px; height: 12px; border-radius: 2px; }
.heatmap-legend .legend-label { margin: 0 4px; }
.heatmap-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding-top: 12px; border-top: 1px solid var(--stellar-border-light); }
.heatmap-stat { display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; padding: 8px 4px; border-radius: 8px; background: var(--stellar-bg-hover); }
.heatmap-stat .stat-key { font-size: 11px; color: var(--stellar-text-muted); line-height: 1.2; }
.heatmap-stat .stat-val { font-size: 14px; font-weight: 700; color: var(--stellar-text); font-variant-numeric: tabular-nums; line-height: 1.4; min-height: 20px; display: flex; align-items: center; }

/* 中屏(768-1199px): 2 列布局 */
@media (max-width: 1199px) {
  .dashboard-main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  /* 重置显式位置,改为自动流式排列,但保留 subscription 和 heatmap 跨列 */
  .area-subscription,
  .area-heatmap { grid-column: 1 / -1; grid-row: auto; }
  .area-quick,
  .area-orders,
  .area-tickets { grid-column: auto; grid-row: auto; }
  .area-client { grid-column: 1 / -1; grid-row: auto; }
  .area-orders, .area-tickets { height: auto; }
}

/* 小屏(<768px): 单列布局 */
@media (max-width: 767px) {
  .dashboard-main { grid-template-columns: 1fr; }
  .area-subscription,
  .area-heatmap,
  .area-client,
  .area-quick,
  .area-orders,
  .area-tickets { grid-column: auto; grid-row: auto; }
  .area-orders, .area-tickets { height: auto; }
}

/* 统计卡片响应式 */
@media (max-width: 1023px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
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
  .heatmap-stats { grid-template-columns: repeat(2, 1fr); }
  .heatmap-chart { height: 180px; }
  .heatmap-chart :deep(.echarts) { height: 180px !important; }
  .quick-access-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .heatmap-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .heatmap-stat .stat-val { font-size: 13px; }
}

@media (max-width: 420px) {
  .subscription-traffic-visual { grid-template-columns: 1fr; justify-items: center; }
  .compact-details { width: 100%; }
}
</style>

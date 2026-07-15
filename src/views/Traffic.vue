<template>
  <div class="traffic-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">{{ t('traffic.title') }}</h2>
      <p class="page-sub">{{ t('traffic.trafficUsage') }}</p>
    </div>

    <!-- 顶部统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('traffic.upload') }} · {{ t('traffic.today') }}</span>
          <span class="stat-value">{{ formatTraffic(stat?.u || 0) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><polyline points="19 12 12 19 5 12"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('traffic.download') }} · {{ t('traffic.today') }}</span>
          <span class="stat-value">{{ formatTraffic(stat?.d || 0) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('traffic.total') }} · {{ t('traffic.today') }}</span>
          <span class="stat-value">{{ formatTraffic(todayTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- 流量趋势图 -->
    <div class="chart-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('traffic.trafficUsage') }}</h3>
      </div>
      <div class="chart-wrap">
        <v-chart :option="chartOption" autoresize class="traffic-chart" />
      </div>
    </div>

    <!-- 流量日志表格 -->
    <div class="table-wrapper">
      <div class="card-header">
        <h3 class="card-title">{{ t('traffic.title') }}</h3>
      </div>

      <!-- 桌面端表格 -->
      <n-data-table
        :columns="columns"
        :data="trafficLogs"
        :loading="loading"
        :pagination="false"
        :bordered="false"
        :single-line="false"
        size="medium"
      />

      <!-- 移动端卡片列表 -->
      <div class="card-list">
        <div v-if="loading" class="card-loading">
          <span class="loading-dot"></span>
          <span>{{ t('common.loading') }}</span>
        </div>
        <div v-else-if="trafficLogs.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>
          <p>{{ t('common.noData') }}</p>
        </div>
        <n-card v-else v-for="log in trafficLogs" :key="log.id" class="log-card" :bordered="false">
          <div class="card-top">
            <span class="card-server">{{ log.server_name || '-' }}</span>
            <n-tag :type="getRateTagType(log.server_rate)" size="small" round>
              {{ log.server_rate || '1' }}x
            </n-tag>
          </div>
          <div class="card-rows">
            <div class="card-row">
              <span class="card-label">{{ t('traffic.upload') }}</span>
              <span class="card-value upload">{{ formatTraffic(log.u) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('traffic.download') }}</span>
              <span class="card-value download">{{ formatTraffic(log.d) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('traffic.total') }}</span>
              <span class="card-value total">{{ formatTraffic(log.u + log.d) }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">{{ t('common.time') }}</span>
              <span class="card-value">{{ formatDate(log.record_at) }}</span>
            </div>
          </div>
        </n-card>
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick, h } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useMessage,
  NDataTable,
  NTag,
  NPagination,
  NCard,
  type DataTableColumns,
} from 'naive-ui'
import VChart from 'vue-echarts'
import '@/utils/echarts'
import { useAppStore } from '@/stores/app'
import { userApi } from '@/api'
import type { TrafficLog, Stat } from '@/api/types'
import { formatTraffic, formatDate } from '@/utils/format'

const { t } = useI18n()
const message = useMessage()
const appStore = useAppStore()

// ===== 状态 =====
const stat = ref<Stat | null>(null)
const trafficLogs = ref<TrafficLog[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 图表数据
const chartDates = ref<string[]>([])
const chartUploadData = ref<number[]>([])
const chartDownloadData = ref<number[]>([])

// 通过 ref 传入图表文字颜色(跟随主题)
const chartTextColor = ref('#9ca3af')

// ===== 计算属性 =====
const todayTotal = computed(() => (stat.value?.u || 0) + (stat.value?.d || 0))

const chartOption = computed(() => {
  const textColor = chartTextColor.value || '#9ca3af'
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return ''
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`
        params.forEach((p: any) => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span style="margin-right:8px">${p.seriesName}</span>
            <span style="font-weight:600">${p.value} GB</span>
          </div>`
        })
        return html
      },
    },
    legend: {
      data: [t('traffic.upload'), t('traffic.download')],
      textStyle: { color: textColor, fontSize: 12 },
      top: 4,
      right: 8,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 44,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartDates.value,
      axisLine: { lineStyle: { color: textColor } },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'GB',
      nameTextStyle: { color: textColor, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(128, 128, 128, 0.12)' } },
    },
    series: [
      {
        name: t('traffic.upload'),
        type: 'bar',
        data: chartUploadData.value,
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 28,
      },
      {
        name: t('traffic.download'),
        type: 'bar',
        data: chartDownloadData.value,
        itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 28,
      },
    ],
  }
})

// ===== 工具函数 =====
type TagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

const getRateTagType = (rate: string | undefined): TagType => {
  const r = parseFloat(rate || '1')
  if (isNaN(r)) return 'default'
  if (r > 1) return 'warning'
  if (r < 1) return 'success'
  return 'default'
}

const GB = 1024 * 1024 * 1024

// 构建最近 7 天趋势数据
const buildChartData = (logs: TrafficLog[]) => {
  const now = new Date()
  const days: { key: string; label: string; upload: number; download: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    days.push({ key, label, upload: 0, download: 0 })
  }
  const dayMap = new Map(days.map((d) => [d.key, d]))
  logs.forEach((log) => {
    if (!log.record_at) return
    const date = new Date(log.record_at * 1000)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const entry = dayMap.get(key)
    if (entry) {
      entry.upload += log.u || 0
      entry.download += log.d || 0
    }
  })
  chartDates.value = days.map((d) => d.label)
  chartUploadData.value = days.map((d) => +(d.upload / GB).toFixed(2))
  chartDownloadData.value = days.map((d) => +(d.download / GB).toFixed(2))
}

// 读取主题色到 ref
const readChartTheme = () => {
  const style = getComputedStyle(document.documentElement)
  const color = style.getPropertyValue('--stellar-text-secondary').trim()
  chartTextColor.value = color || '#9ca3af'
}

// ===== 数据获取 =====
const fetchStat = async () => {
  try {
    const res = await userApi.getStat()
    stat.value = res.data
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  }
}

const fetchTrafficLogs = async () => {
  loading.value = true
  try {
    const res = await userApi.getTrafficLog(pagination.page, pagination.pageSize)
    const payload: any = res.data
    if (Array.isArray(payload)) {
      trafficLogs.value = payload
      pagination.total = payload.length
    } else if (payload && Array.isArray(payload.data)) {
      trafficLogs.value = payload.data
      pagination.total = payload.total ?? payload.data.length
    } else {
      trafficLogs.value = []
      pagination.total = 0
    }
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
    trafficLogs.value = []
  } finally {
    loading.value = false
  }
}

// 拉取较大范围的日志用于构建 7 天趋势图
const fetchChartData = async () => {
  try {
    const res = await userApi.getTrafficLog(1, 500)
    const payload: any = res.data
    const list: TrafficLog[] = Array.isArray(payload)
      ? payload
      : payload && Array.isArray(payload.data)
        ? payload.data
        : []
    buildChartData(list)
  } catch (err) {
    console.error('[Traffic] 获取流量日志失败:', err)
    buildChartData([])
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchTrafficLogs()
}

// ===== 表格列 =====
const columns = computed<DataTableColumns<TrafficLog>>(() => [
  {
    title: t('traffic.serverName'),
    key: 'server_name',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'cell-server' }, row.server_name || '-'),
  },
  {
    title: t('traffic.serverRate'),
    key: 'server_rate',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: getRateTagType(row.server_rate), size: 'small', round: true },
        { default: () => `${row.server_rate || '1'}x` },
      ),
  },
  {
    title: t('traffic.upload'),
    key: 'u',
    render: (row) => h('span', { class: 'cell-upload' }, formatTraffic(row.u)),
  },
  {
    title: t('traffic.download'),
    key: 'd',
    render: (row) => h('span', { class: 'cell-download' }, formatTraffic(row.d)),
  },
  {
    title: t('traffic.total'),
    key: 'total',
    render: (row) => h('span', { class: 'cell-total' }, formatTraffic(row.u + row.d)),
  },
  {
    title: t('common.time'),
    key: 'record_at',
    render: (row) => formatDate(row.record_at),
  },
])

// 主题切换时重新读取颜色,触发图表重绘
watch(
  () => appStore.isDark,
  () => {
    nextTick(readChartTheme)
  },
)

onMounted(async () => {
  readChartTheme()
  await Promise.all([fetchStat(), fetchTrafficLogs(), fetchChartData()])
})
</script>

<style scoped>
.traffic-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 页面标题 */
.page-header {
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

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat-card {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.2s;
}
.stat-card:hover {
  border-color: var(--stellar-primary);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.stat-label {
  font-size: 12px;
  color: var(--stellar-text-muted);
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--stellar-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图表卡片 */
.chart-card {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 0;
}
.chart-wrap {
  padding: 12px 16px 16px;
}
.traffic-chart {
  height: 320px;
  width: 100%;
}

/* 表格容器 */
.table-wrapper {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.table-wrapper :deep(.n-data-table) {
  --n-border-radius: 0;
}
.table-wrapper :deep(.n-data-table .n-data-table-thead) {
  background: var(--stellar-bg-hover);
}
.table-wrapper :deep(.n-data-table-th) {
  font-weight: 600;
  color: var(--stellar-text-secondary);
  font-size: 13px;
}
.table-wrapper :deep(.n-data-table-td) {
  font-size: 13px;
  color: var(--stellar-text);
}
.table-wrapper :deep(.n-data-table-tr:hover .n-data-table-td) {
  background: var(--stellar-bg-hover);
}

.cell-server {
  font-weight: 500;
  color: var(--stellar-text);
}
.cell-upload {
  color: #3b82f6;
  font-weight: 500;
}
.cell-download {
  color: #10b981;
  font-weight: 500;
}
.cell-total {
  font-weight: 600;
  color: var(--stellar-text);
}

/* 分页 */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--stellar-border-light);
}

/* 移动端卡片列表(默认隐藏) */
.card-list {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}
.log-card {
  background: var(--stellar-bg-card) !important;
  border: 1px solid var(--stellar-border) !important;
  border-radius: 12px !important;
  transition: border-color 0.2s;
}
.log-card:hover {
  border-color: var(--stellar-primary) !important;
}
.log-card :deep(.n-card__content) {
  padding: 16px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.card-server {
  font-size: 14px;
  font-weight: 600;
  color: var(--stellar-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}
.card-value.upload {
  color: #3b82f6;
}
.card-value.download {
  color: #10b981;
}
.card-value.total {
  font-weight: 600;
}

.card-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
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

/* 移动端适配 */
@media (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .table-wrapper :deep(.n-data-table) {
    display: none;
  }
  .card-list {
    display: flex;
  }
  .pagination-wrap {
    justify-content: center;
  }
  .traffic-chart {
    height: 200px;
  }
}
</style>

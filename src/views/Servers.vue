<template>
  <div class="servers-page">
    <!-- 页面头部:标题 + 搜索 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('server.title') }}</h2>
        <p class="page-sub">{{ t('server.subtitle') }}</p>
      </div>
      <div class="header-right">
        <n-input
          v-model:value="searchKeyword"
          :placeholder="t('common.search')"
          clearable
          class="search-input"
        >
          <template #prefix>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </template>
        </n-input>
      </div>
    </div>

    <!-- 提示词条 -->
    <div class="tips-bar">
      <div class="tip-item" v-for="tip in serverTips" :key="tip.text">
        <div class="tip-icon" :style="tip.style">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="tip.icon"></svg>
        </div>
        <span class="tip-text">{{ tip.text }}</span>
      </div>
      <!-- 线路统计 -->
      <div class="tip-item stat-tip">
        <div class="tip-icon" style="background: rgba(59,130,246,0.12); color: #3b82f6;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        </div>
        <span class="tip-text">{{ t('server.totalCount', { count: totalCount }) }}</span>
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="server-grid">
      <div v-for="i in 6" :key="i" class="server-card skeleton-card">
        <div class="skeleton-line sk-w-60" />
        <div class="skeleton-line sk-w-40" />
        <div class="skeleton-line sk-w-80" />
        <div class="skeleton-line sk-w-50" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredServers.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="3" width="20" height="8" rx="2" />
        <rect x="2" y="13" width="20" height="8" rx="2" />
      </svg>
      <p>{{ t('common.noData') }}</p>
    </div>

    <!-- 线路卡片网格 -->
    <div v-else class="server-grid">
      <div
        v-for="server in filteredServers"
        :key="`${server.type}-${server.id}`"
        class="server-card"
        :class="{ 'is-offline': !server.is_available }"
      >
        <!-- 卡片头部：图标 + 名称 + 状态 -->
        <div class="card-header-area">
          <div class="server-icon" :style="typeIconStyle(server.type)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <div class="server-info">
            <h3 class="server-name" :title="server.name">{{ server.name }}</h3>
            <span class="server-type-label">{{ tpLabel(server.type) }}</span>
          </div>
          <span class="status-badge" :class="server.is_available ? 'online' : 'offline'">
            <span class="status-pill" />
            {{ server.is_available ? t('server.online') : t('server.offline') }}
          </span>
        </div>

        <!-- 倍率信息 -->
        <div class="card-stats">
          <div class="stat-block">
            <span class="stat-label">{{ t('server.rate') }}</span>
            <span class="stat-value rate-value">x{{ server.rate }}</span>
          </div>
          <div class="stat-block">
            <span class="stat-label">{{ t('server.type') }}</span>
            <span class="stat-value">{{ tpLabel(server.type) }}</span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="server.tags && server.tags.length" class="card-tags">
          <span v-for="tag in server.tags" :key="tag" class="server-tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, NInput } from 'naive-ui'
import { userApi, normalizeServers } from '@/api'
import type { Server } from '@/api/types'

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const searchKeyword = ref('')
const serversByType = ref<Record<string, Server[]>>({})

const serverStats = computed(() => {
  const all: Server[] = []
  let online = 0
  for (const [type, servers] of Object.entries(serversByType.value)) {
    for (const s of servers) {
      const item = { ...s, type }
      all.push(item)
      if (s.is_available) online++
    }
  }
  return { all, total: all.length, online }
})

const totalCount = computed(() => serverStats.value.total)
const onlineCount = computed(() => serverStats.value.online)
const allServers = computed(() => serverStats.value.all)

const filteredServers = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allServers.value
  return allServers.value.filter(
    s =>
      s.name.toLowerCase().includes(kw) ||
      s.type.toLowerCase().includes(kw) ||
      (s.tags && s.tags.some(tag => tag.toLowerCase().includes(kw)))
  )
})

// 提示词条
const serverTips = computed(() => [
  {
    icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    text: t('server.tipSearch'),
    style: 'background: rgba(59,130,246,0.12); color: #3b82f6;',
  },
  {
    icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    text: `${t('server.online')} ${onlineCount.value}`,
    style: 'background: rgba(16,185,129,0.12); color: #10b981;',
  },
  {
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    text: t('server.tipStable'),
    style: 'background: rgba(139,92,246,0.12); color: #8b5cf6;',
  },
])

// 类型标签文案
const tpLabel = (tp: string) => tp.toUpperCase()

// 不同类型对应不同的图标颜色
const typeIconStyle = (tp: string) => {
  const map: Record<string, string> = {
    shadowsocks: 'background: rgba(59,130,246,0.15); color: #3b82f6;',
    vmess: 'background: rgba(16,185,129,0.15); color: #10b981;',
    vless: 'background: rgba(245,158,11,0.15); color: #f59e0b;',
    trojan: 'background: rgba(239,68,68,0.15); color: #ef4444;',
    hysteria: 'background: rgba(56,163,247,0.15); color: #38a3f7;',
    hysteria2: 'background: rgba(139,92,246,0.15); color: #8b5cf6;',
  }
  return map[tp] || 'background: rgba(148,163,184,0.15); color: #94a3b8;'
}

const fetchData = async () => {
  loading.value = true
  try {
    const serverRes = await userApi.getServers()
    serversByType.value = normalizeServers(serverRes)
  } catch {
    message.error(t('common.failed'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.servers-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 页面头部 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-input {
  width: 260px;
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

/* ===== 类型筛选标签页 ===== */
.type-tabs {
  --n-tab-padding: 6px 12px;
}

/* ===== 线路卡片网格 ===== */
.server-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.server-card {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}
.server-card:hover {
  border-color: var(--stellar-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.server-card.is-offline {
  opacity: 0.65;
}

/* 卡片头部 */
.card-header-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.server-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.server-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.server-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}
.server-type-label {
  font-size: 11px;
  color: var(--stellar-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.status-badge .status-pill {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-badge.online {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.status-badge.online .status-pill {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}
.status-badge.offline {
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
}
.status-badge.offline .status-pill {
  background: #94a3b8;
}

/* 统计区 */
.card-stats {
  display: flex;
  padding: 14px 18px;
  gap: 16px;
}
.stat-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.stat-label {
  font-size: 11px;
  color: var(--stellar-text-muted);
}
.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--stellar-text);
}
.rate-value {
  color: var(--stellar-primary);
}

/* 标签 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 18px 16px;
}
.server-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--stellar-bg-hover);
  color: var(--stellar-text-secondary);
  border: 1px solid var(--stellar-border-light);
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--stellar-text-muted);
  gap: 12px;
}
.empty-state p {
  font-size: 13px;
  margin: 0;
}

/* ===== 加载骨架 ===== */
.skeleton-card {
  gap: 12px;
}
.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--stellar-bg-hover) 25%,
    var(--stellar-border) 37%,
    var(--stellar-bg-hover) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}
.sk-w-40 { width: 40%; }
.sk-w-50 { width: 50%; }
.sk-w-60 { width: 60%; }
.sk-w-80 { width: 80%; }
@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* ===== 响应式:平板 2 列 ===== */
@media (max-width: 1023px) {
  .server-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .search-input {
    width: 220px;
  }
}

/* ===== 响应式:手机 1 列 ===== */
@media (max-width: 640px) {
  .server-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-right {
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
  .page-title {
    font-size: 20px;
  }
}
</style>

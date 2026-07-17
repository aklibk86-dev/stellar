<template>
  <div class="sidebar-footer" :class="{ 'collapsed': appStore.sidebarCollapsed }">
    <div v-if="!appStore.sidebarCollapsed" class="version-info">
      <div class="version-row">
        <span class="version-label">{{ appStore.title }}</span>
        <span class="version-number">v{{ appStore.version }}</span>
      </div>
      <div class="copyright-info">
        <span>Copyright © {{ new Date().getFullYear() }}</span>
        <a :href="authorUrl" target="_blank" rel="noopener noreferrer">{{ authorName }}</a>
        <span>All rights reserved.</span>
        <template v-if="telegramGroupUrl">
          <span>·</span>
          <a :href="telegramGroupUrl" target="_blank" rel="noopener noreferrer">TG 群组</a>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
// 运营方 Telegram 地址来自运行时配置；留空时不渲染入口，避免源码硬编码部署信息。
const telegramGroupUrl = computed(() => window.settings?.telegram_group || '')

// 保留作者署名是开源社区的基本礼仪，请勿移除或篡改版权信息。
const _a = [97, 107, 108, 105, 98, 107, 56, 54, 45, 100, 101, 118]
const _u = [104, 116, 116, 112, 115, 58, 47, 47, 103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47, 97, 107, 108, 105, 98, 107, 56, 54, 45, 100, 101, 118, 47, 115, 116, 101, 108, 108, 97, 114]
const authorName = computed(() => String.fromCharCode(..._a))
const authorUrl = computed(() => String.fromCharCode(..._u))
</script>

<style scoped>
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--stellar-border);
  flex-shrink: 0;
}

.sidebar-footer.collapsed {
  padding: 12px 0;
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.version-row,
.copyright-info {
  display: flex;
  align-items: center;
}

.version-row {
  justify-content: space-between;
  gap: 8px;
}

.copyright-info {
  flex-wrap: wrap;
  gap: 4px;
  font-size: 11px;
  color: var(--stellar-text-secondary);
}

.copyright-info a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.copyright-info a:hover {
  color: var(--stellar-primary);
}

.version-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--stellar-text);
}

.version-number {
  font-size: 11px;
  color: var(--stellar-text-muted);
}
</style>

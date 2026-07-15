<template>
  <div class="sidebar-menu">
    <template v-for="item in menuItems" :key="item.name">
      <!-- 分组标题 -->
      <div v-if="item.group && !appStore.sidebarCollapsed" class="menu-group-title">
        {{ t(`nav.${item.group}`) }}
      </div>
      <!-- 菜单项 -->
      <router-link
        v-if="!item.group && item.path"
        :to="`/${item.path}`"
        class="menu-item"
        :class="{ 'active': isActive(item.path) }"
        @click="appStore.closeMobileSidebar()"
      >
        <span class="menu-icon">
          <StellarIcon :name="item.icon || 'file'" :size="20" :stroke-width="2" />
        </span>
        <span v-if="!appStore.sidebarCollapsed" class="menu-text">{{ t(`nav.${item.name}`) }}</span>
        <span v-if="item.badge && !appStore.sidebarCollapsed" class="menu-badge">{{ item.badge }}</span>
      </router-link>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import StellarIcon from '@/components/StellarIcon.vue'

interface MenuItem {
  name?: string
  path?: string
  icon?: string
  group?: string
  badge?: string
}

const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()

const isActive = (path: string) => {
  return route.path === `/${path}` || route.path.startsWith(`/${path}/`)
}

const menuItems: MenuItem[] = [
  { name: 'dashboard', path: 'dashboard', icon: 'dashboard' },
  { group: 'products' },
  { name: 'servers', path: 'servers', icon: 'server' },
  { name: 'plans', path: 'plans', icon: 'shop' },
  { group: 'account' },
  { name: 'orders', path: 'orders', icon: 'receipt' },
  { name: 'tickets', path: 'tickets', icon: 'ticket' },
  { name: 'invite', path: 'invite', icon: 'users' },
  { name: 'traffic', path: 'traffic', icon: 'chart' },
  { group: 'support' },
  { name: 'knowledge', path: 'knowledge', icon: 'book' },
  { name: 'profile', path: 'profile', icon: 'user' },
]
</script>

<style scoped>
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-group-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--stellar-text-muted);
  padding: 16px 12px 6px;
  user-select: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--stellar-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  text-decoration: none;
}

.menu-item:hover {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}

.menu-item.active {
  background: var(--stellar-primary-light);
  color: var(--stellar-primary);
  font-weight: 600;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--stellar-primary);
  border-radius: 0 3px 3px 0;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-icon :deep(svg) {
  width: 20px;
  height: 20px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-badge {
  margin-left: auto;
  background: var(--stellar-accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* 折叠模式 */
:global(.collapsed) .menu-item {
  justify-content: center;
  padding: 10px;
}

:global(.collapsed) .menu-group-title {
  display: none;
}
</style>

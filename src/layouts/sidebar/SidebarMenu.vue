<template>
  <div class="sidebar-menu">
    <template v-for="(item, index) in menuItems" :key="`${item.type}-${item.label}-${index}`">
      <!-- 分组标题 -->
      <div v-if="item.type === 'group' && !appStore.sidebarCollapsed" class="menu-group-title">
        {{ item.label }}
      </div>
      <!-- 站内菜单项 -->
      <router-link
        v-else-if="item.to"
        :to="item.to"
        class="menu-item"
        :class="{ 'active': isActive(item.to) }"
        :title="appStore.sidebarCollapsed ? item.label : undefined"
        :aria-label="item.label"
        @pointerenter="preloadRoute(item.to)"
        @focus="preloadRoute(item.to)"
        @click="appStore.closeMobileSidebar()"
      >
        <span class="menu-icon">
          <StellarIcon :name="item.icon" :size="20" :stroke-width="2" />
        </span>
        <span v-if="!appStore.sidebarCollapsed" class="menu-text">{{ item.label }}</span>
        <span v-if="item.badge && !appStore.sidebarCollapsed" class="menu-badge">{{ item.badge }}</span>
      </router-link>
      <!-- 外部菜单项 -->
      <a
        v-else-if="item.href"
        :href="item.href"
        class="menu-item"
        :target="item.newTab ? '_blank' : undefined"
        :rel="item.newTab ? 'noopener noreferrer' : undefined"
        :title="appStore.sidebarCollapsed ? item.label : undefined"
        :aria-label="item.label"
        @click="appStore.closeMobileSidebar()"
      >
        <span class="menu-icon">
          <StellarIcon :name="item.icon" :size="20" :stroke-width="2" />
        </span>
        <span v-if="!appStore.sidebarCollapsed" class="menu-text">{{ item.label }}</span>
        <span v-if="item.badge && !appStore.sidebarCollapsed" class="menu-badge">{{ item.badge }}</span>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import StellarIcon from '@/components/StellarIcon.vue'
import { normalizeSidebarNavigation, type SidebarNavigationItem } from '@/utils/sidebarNavigation'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const preloadedRoutes = new Set<string>()

const preloadRoute = (path: string) => {
  if (preloadedRoutes.has(path)) return
  preloadedRoutes.add(path)
  try {
    const loaders = router.resolve(path).matched.flatMap((record) => Object.values(record.components || {}))
    void Promise.allSettled(loaders.map((component) => (
      typeof component === 'function' ? Promise.resolve((component as () => unknown)()) : Promise.resolve()
    )))
  } catch {
    // Invalid custom navigation entries should remain clickable without affecting the app.
    preloadedRoutes.delete(path)
  }
}

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const defaultMenuItems = computed<SidebarNavigationItem[]>(() => [
  { type: 'link', label: t('nav.dashboard'), to: '/dashboard', icon: 'dashboard', newTab: false },
  { type: 'group', label: t('nav.products'), icon: '', newTab: false },
  { type: 'link', label: t('nav.servers'), to: '/servers', icon: 'server', newTab: false },
  { type: 'link', label: t('nav.plans'), to: '/plans', icon: 'shop', newTab: false },
  { type: 'group', label: t('nav.account'), icon: '', newTab: false },
  { type: 'link', label: t('nav.orders'), to: '/orders', icon: 'receipt', newTab: false },
  { type: 'link', label: t('nav.tickets'), to: '/tickets', icon: 'ticket', newTab: false },
  { type: 'link', label: t('nav.invite'), to: '/invite', icon: 'users', newTab: false },
  { type: 'link', label: t('nav.traffic'), to: '/traffic', icon: 'chart', newTab: false },
  { type: 'group', label: t('nav.support'), icon: '', newTab: false },
  { type: 'link', label: t('nav.knowledge'), to: '/knowledge', icon: 'book', newTab: false },
  { type: 'link', label: t('nav.profile'), to: '/profile', icon: 'user', newTab: false },
])

const menuItems = computed(() => {
  const configuredItems = window.settings?.sidebar_navigation?.items
  return Array.isArray(configuredItems)
    ? normalizeSidebarNavigation(configuredItems, String(locale.value))
    : defaultMenuItems.value
})
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
  transition: background-color 0.16s ease, color 0.16s ease, transform 0.12s ease;
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

.menu-item:focus-visible {
  outline: 2px solid var(--stellar-primary);
  outline-offset: -2px;
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

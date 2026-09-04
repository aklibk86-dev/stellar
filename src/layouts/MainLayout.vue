<template>
  <div class="stellar-layout" :class="{ 'dark': appStore.isDark }">
    <!-- 移动端遮罩 -->
    <Transition name="fade">
      <div
        v-if="appStore.mobileSidebarOpen"
        class="mobile-overlay lg:hidden"
        @click="appStore.closeMobileSidebar()"
      />
    </Transition>

    <!-- 侧边栏 -->
    <aside
      class="stellar-sidebar"
      :class="{
        'collapsed': appStore.sidebarCollapsed && !appStore.mobileSidebarOpen,
        'mobile-open': appStore.mobileSidebarOpen,
      }"
      :aria-hidden="!isDesktop && !appStore.mobileSidebarOpen"
    >
      <SidebarHeader />
      <nav class="stellar-nav">
        <SidebarMenu />
      </nav>
      <SidebarFooter />
    </aside>

    <!-- 主内容区 -->
    <div
      class="stellar-main"
      :class="{ 'expanded': appStore.sidebarCollapsed }"
    >
      <!-- 顶部栏 -->
      <header class="stellar-header">
        <HeaderBar />
      </header>

      <!-- 未支付订单提示 -->
      <PendingOrderBanner ref="pendingOrderRef" />

      <!-- 处理中工单提示 -->
      <PendingTicketBanner ref="pendingTicketRef" />

      <!-- 路由内容 -->
      <main class="stellar-content">
        <router-view v-slot="{ Component }">
          <Transition name="stellar-view" mode="out-in">
            <component :is="Component" :key="$route.name || $route.path" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import SidebarHeader from './sidebar/SidebarHeader.vue'
import SidebarMenu from './sidebar/SidebarMenu.vue'
import SidebarFooter from './sidebar/SidebarFooter.vue'
import HeaderBar from './header/HeaderBar.vue'
import PendingOrderBanner from '@/components/PendingOrderBanner.vue'
import PendingTicketBanner from '@/components/PendingTicketBanner.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const pendingOrderRef = ref<InstanceType<typeof PendingOrderBanner> | null>(null)
const pendingTicketRef = ref<InstanceType<typeof PendingTicketBanner> | null>(null)
const isDesktop = ref(window.innerWidth >= 1024)

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
  if (isDesktop.value) {
    appStore.closeMobileSidebar()
  }
}

let resizeTimer: number | null = null
const debouncedHandleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(handleResize, 100)
}

onMounted(async () => {
  window.addEventListener('resize', debouncedHandleResize)
  await userStore.fetchGuestConfig()
  if (!userStore.user) {
    await userStore.fetchUser()
  }
})

watch(() => appStore.mobileSidebarOpen, (open) => {
  document.body.classList.toggle('stellar-sidebar-open', open)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedHandleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  document.body.classList.remove('stellar-sidebar-open')
})
</script>

<style scoped>
.stellar-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--stellar-bg);
}

.stellar-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--stellar-bg-sidebar);
  border-right: 1px solid var(--stellar-border);
  display: flex;
  flex-direction: column;
  transition: width 0.22s cubic-bezier(0.22, 1, 0.36, 1), transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 50;
}

.stellar-sidebar.collapsed {
  width: 72px;
}

.stellar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px;
}

.stellar-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stellar-header {
  height: 64px;
  flex-shrink: 0;
  background: var(--stellar-bg-card);
  border-bottom: 1px solid var(--stellar-border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 40;
}

.stellar-content {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.stellar-content > :deep(*) {
  flex-shrink: 0;
}
.stellar-content > :deep(.tickets-page) {
  flex: 1;
  min-height: 0;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.46);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  z-index: 49;
  display: none;
}

/* 移动端样式 */
@media (max-width: 1023px) {
  .stellar-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
  }

  .stellar-sidebar.mobile-open {
    transform: translateX(0);
  }

  .stellar-sidebar.collapsed {
    width: 240px;
  }

  .mobile-overlay {
    display: block;
  }

  .stellar-content {
    padding: 16px;
  }

  .stellar-header {
    padding: 0 16px;
  }
}

@media (max-width: 640px) {
  .stellar-content {
    padding: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stellar-sidebar {
    transition: none;
  }
}
</style>

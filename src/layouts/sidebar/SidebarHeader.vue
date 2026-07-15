<template>
  <div class="sidebar-header" :class="{ 'collapsed': appStore.sidebarCollapsed }">
    <div class="logo-wrap" @click="goHome">
      <img v-if="appStore.logo" :src="appStore.logo" alt="logo" class="logo-img" />
      <div v-else class="logo-placeholder">
        <svg viewBox="0 0 32 32" class="logo-icon">
          <path d="M16 2L2 9v14l14 7 14-7V9L16 2zm0 3.3L26.5 10 16 15.7 5.5 10 16 5.3zM5 12.5l9 4.5v9.2l-9-4.5v-9.2zm11 13.7v-9.2l9-4.5v9.2l-9 4.5z" fill="currentColor"/>
        </svg>
      </div>
      <span v-if="!appStore.sidebarCollapsed" class="logo-text">{{ appStore.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

const goHome = () => {
  if (window.settings?.landing_page_enabled === false) {
    router.push('/dashboard')
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--stellar-border);
  flex-shrink: 0;
}

.sidebar-header.collapsed {
  justify-content: center;
  padding: 0;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo-wrap:hover {
  opacity: 0.8;
}

.logo-img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  object-fit: contain;
}

.logo-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.logo-icon {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  color: var(--stellar-text);
}

.sidebar-header.collapsed .logo-text {
  display: none;
}
</style>

<template>
  <div class="header-bar">
    <!-- 左侧:菜单按钮 + 页面标题 -->
    <div class="header-left">
      <button class="menu-toggle-btn" @click="toggleSidebar">
        <StellarIcon name="menu" :size="22" />
      </button>
      <h1 class="page-title">{{ currentTitle }}</h1>
    </div>

    <!-- 右侧:工具区 -->
    <div class="header-right">
      <!-- 主题切换 -->
      <button class="header-btn" @click="appStore.toggleDark()" :title="appStore.isDark ? t('common.toggleLight') : t('common.toggleDark')">
        <StellarIcon :name="appStore.isDark ? 'sun' : 'moon'" :size="20" />
      </button>

      <!-- 语言切换 -->
      <n-dropdown :options="localeOptions" @select="handleLocaleChange">
        <button class="header-btn">
          <StellarIcon name="language" :size="20" />
        </button>
      </n-dropdown>

      <!-- 用户头像/菜单 -->
      <n-dropdown :options="userMenuOptions" @select="handleUserMenu">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="userStore.user?.avatar_url" :src="userStore.user.avatar_url" alt="avatar" />
            <span v-else>{{ userStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
          </div>
          <span class="user-email hidden md:block">{{ userStore.user?.email || 'User' }}</span>
        </div>
      </n-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NDropdown } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import StellarIcon from '@/components/StellarIcon.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()

const currentTitle = computed(() => {
  const name = route.name as string
  if (!name) return ''
  return t(`nav.${name}`)
})

// 根据屏幕尺寸选择侧边栏切换方式
const toggleSidebar = () => {
  if (window.innerWidth < 1024) {
    appStore.toggleMobileSidebar()
  } else {
    appStore.toggleSidebar()
  }
}

const localeOptions = [
  { label: '简体中文', key: 'zh-CN' },
  { label: 'English', key: 'en-US' },
]

const renderMenuIcon = (name: string) => () => h(StellarIcon, { name, size: 16 })

const userMenuOptions = computed(() => [
  { label: t('nav.profile'), key: 'profile', icon: renderMenuIcon('user') },
  { type: 'divider', key: 'd1' },
  { label: t('common.logout'), key: 'logout', icon: renderMenuIcon('logout') },
])

const handleLocaleChange = (key: string) => {
  appStore.setLocale(key)
  locale.value = key
}

const handleUserMenu = (key: string) => {
  if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 0;
}

.menu-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--stellar-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-toggle-btn:hover {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}

.menu-toggle-btn svg {
  width: 22px;
  height: 22px;
}

.header-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--stellar-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.header-btn:hover {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}

.header-btn svg {
  width: 20px;
  height: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--stellar-bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-email {
  font-size: 13px;
  color: var(--stellar-text-secondary);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .page-title {
    font-size: 16px;
  }
}
</style>

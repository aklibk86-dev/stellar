<template>
  <div class="header-bar">
    <!-- 左侧:菜单按钮 + 页面标题 -->
    <div class="header-left">
      <button
        class="menu-toggle-btn"
        type="button"
        :aria-label="t('common.openNavigation')"
        :aria-expanded="appStore.mobileSidebarOpen"
        @click="toggleSidebar"
      >
        <StellarIcon name="menu" :size="22" />
      </button>
      <h1 class="page-title">{{ currentTitle }}</h1>
    </div>

    <!-- 右侧:工具区 -->
    <div class="header-right">
      <!-- 公告铃铛 -->
      <NoticeBell />

      <!-- 主题切换 -->
      <button class="header-btn" type="button" @click="appStore.toggleDark()" :title="appStore.isDark ? t('common.toggleLight') : t('common.toggleDark')" :aria-label="appStore.isDark ? t('common.toggleLight') : t('common.toggleDark')">
        <StellarIcon :name="appStore.isDark ? 'sun' : 'moon'" :size="20" />
      </button>

      <!-- 语言切换 -->
      <StellarDropdown :options="localeOptions" @select="handleLocaleChange">
        <template #trigger>
          <button class="header-btn" type="button" :aria-label="locale === 'zh-CN' ? '简体中文 / English' : 'English / 简体中文'">
            <StellarIcon name="language" :size="20" />
          </button>
        </template>
      </StellarDropdown>

      <!-- 用户头像/菜单 -->
      <StellarDropdown :options="userMenuOptions" @select="handleUserMenu">
        <template #trigger>
          <button type="button" class="user-info" :aria-label="userStore.user?.email || 'User'">
            <div class="user-avatar">
              <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
              <span v-else>{{ userStore.user?.email?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <span class="user-email hidden md:block">{{ userStore.user?.email || 'User' }}</span>
          </button>
        </template>
      </StellarDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import StellarIcon from '@/components/StellarIcon.vue'
import NoticeBell from '@/components/NoticeBell.vue'
import StellarDropdown from '@/components/StellarDropdown.vue'
import { resolveAvatarUrl } from '@/utils/avatar'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()

const avatarUrl = computed(() => resolveAvatarUrl(userStore.user))

const currentTitle = computed(() => {
  // 优先使用 meta.title (子路由可继承父路由标题,如 knowledge-detail -> knowledge)
  // 回退到 route.name
  const titleKey = (route.meta.title as string) || (route.name as string)
  if (!titleKey) return ''
  const translated = t(`nav.${titleKey}`)
  // 翻译失败时(返回值等于 key 本身)回退到空字符串,避免显示 "nav.xxx"
  return translated === `nav.${titleKey}` ? '' : translated
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

const userMenuOptions = computed(() => [
  { label: t('nav.profile'), key: 'profile' },
  { type: 'divider' as const, key: 'd1' },
  { label: t('common.logout'), key: 'logout' },
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
  min-width: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  transition: background-color 0.16s ease, color 0.16s ease, transform 0.12s ease;
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
  transition: background-color 0.16s ease, color 0.16s ease, transform 0.12s ease;
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
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
}

.user-info:hover {
  background: var(--stellar-bg-hover);
}

.menu-toggle-btn:focus-visible,
.header-btn:focus-visible,
.user-info:focus-visible {
  outline: 2px solid var(--stellar-primary);
  outline-offset: 2px;
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

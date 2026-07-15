<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <AppContent />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import {
  NConfigProvider, NLoadingBarProvider, NMessageProvider,
  NDialogProvider, NNotificationProvider,
  darkTheme, zhCN, dateZhCN, enUS, dateEnUS,
  type GlobalThemeOverrides,
} from 'naive-ui'
import { useAppStore } from '@/stores/app'
import i18n from '@/i18n'
import AppContent from './AppContent.vue'

const appStore = useAppStore()

const theme = computed(() => (appStore.isDark ? darkTheme : null))

const naiveLocale = computed(() => (appStore.locale === 'zh-CN' ? zhCN : enUS))
const naiveDateLocale = computed(() => (appStore.locale === 'zh-CN' ? dateZhCN : dateEnUS))

const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: '#3b82f6',
    primaryColorHover: '#60a5fa',
    primaryColorPressed: '#2563eb',
    primaryColorSuppl: '#3b82f6',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    fontFamilyMono: '"SF Mono", "Fira Code", Consolas, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", monospace',
  },
}))

onMounted(() => {
  // 清理旧版 localStorage 键
  const oldToken = localStorage.getItem('stellar_token')
  if (oldToken && !localStorage.getItem('stellar_auth_token')) {
    localStorage.removeItem('stellar_token')
  }
  appStore.init()
  i18n.global.locale.value = appStore.locale as 'zh-CN' | 'en-US'
})

// 监听 appStore.locale 变化，同步到 i18n 全局
watch(() => appStore.locale, (newLocale) => {
  i18n.global.locale.value = newLocale as 'zh-CN' | 'en-US'
})
</script>

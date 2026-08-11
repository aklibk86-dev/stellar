<template>
  <!-- 全站背景（图片/视频），固定铺满视口；放在所有内容之前，z-index: 0
       落地页除外：落地页有独立背景与样式，不受全局背景图设置影响 -->
  <GlobalBackground v-if="!isLandingRoute" />
  <!-- 内容层：通过 #app 的 z-index: 1 保持在背景之上 -->
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <AppContent />
            <!-- 页头页脚自定义代码注入 -->
            <CodeInjector v-if="hasCustomCode" />
            <ThirdPartyChat v-if="hasThirdPartyChat" />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  NConfigProvider, NLoadingBarProvider, NMessageProvider,
  NDialogProvider, NNotificationProvider,
  darkTheme, zhCN, dateZhCN, enUS, dateEnUS,
  type GlobalThemeOverrides,
} from 'naive-ui'
import { useAppStore } from '@/stores/app'
import i18n from '@/i18n'
import AppContent from './AppContent.vue'
import GlobalBackground from './components/GlobalBackground.vue'

const CodeInjector = defineAsyncComponent(() => import('./components/CodeInjector.vue'))
const ThirdPartyChat = defineAsyncComponent(() => import('./components/ThirdPartyChat.vue'))

const appStore = useAppStore()
const route = useRoute()
const hasCustomCode = Boolean(window.settings?.header_code || window.settings?.footer_code)
const hasThirdPartyChat = Boolean(window.settings?.customer_service?.enabled)

// 落地页：跳过全局背景组件渲染，并在 <html> 上加 stellar-route-landing 类
// 供 main.css 中的覆盖样式使用，让落地页彻底脱离全局背景图与毛玻璃设置
const isLandingRoute = computed(() => route.name === 'landing')
watch(isLandingRoute, (v) => {
  const root = document.documentElement
  root.classList.toggle('stellar-route-landing', v)
}, { immediate: true })

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

<style>
/* #app 作为内容根容器，在背景启用时保持高于背景的层叠层级 */
#app {
  position: relative;
  z-index: 1;
}
</style>

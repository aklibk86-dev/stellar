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
            <div v-if="isRestrictedWebView" class="browser-only-gate">
              <div class="browser-only-panel">
                <h1>{{ browserGateTitle }}</h1>
                <p>{{ browserGateDescription }}</p>
                <p class="browser-only-hint">{{ browserGateHint }}</p>
              </div>
            </div>
            <template v-else>
              <AppContent />
              <!-- 页头页脚自定义代码注入 -->
              <CodeInjector v-if="hasCustomCode" />
              <ThirdPartyChat v-if="hasThirdPartyChat" />
            </template>
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NConfigProvider, NLoadingBarProvider, NMessageProvider,
  NDialogProvider, NNotificationProvider,
  darkTheme, zhCN, dateZhCN, enUS, dateEnUS,
  type GlobalThemeOverrides,
} from 'naive-ui'
import { useAppStore } from '@/stores/app'
import i18n from '@/i18n'
import { useUserStore } from '@/stores/user'
import { isRestrictedWebView as detectRestrictedWebView } from '@/utils/browserGuard'
import AppContent from './AppContent.vue'
import GlobalBackground from './components/GlobalBackground.vue'

const CodeInjector = defineAsyncComponent(() => import('./components/CodeInjector.vue'))
const ThirdPartyChat = defineAsyncComponent(() => import('./components/ThirdPartyChat.vue'))

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const hasCustomCode = Boolean(window.settings?.header_code || window.settings?.footer_code)
const hasThirdPartyChat = Boolean(window.settings?.customer_service?.enabled)
const isRestrictedWebView = detectRestrictedWebView()
const browserGateTitle = computed(() => appStore.locale === 'zh-CN' ? '请使用浏览器打开' : 'Open this site in a browser')
const browserGateDescription = computed(() => appStore.locale === 'zh-CN'
  ? '微信、QQ、支付宝等应用内暂不支持访问此网站。'
  : 'This site cannot be used inside WeChat, QQ, Alipay, or other in-app browsers.')
const browserGateHint = computed(() => appStore.locale === 'zh-CN'
  ? '请点击右上角菜单，选择“在浏览器中打开”。'
  : 'Use the menu in the top-right corner and choose “Open in browser”.')

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

let sessionCheckTimer: number | undefined
let lastSessionTouch = 0
const handleUserActivity = () => {
  const now = Date.now()
  if (now - lastSessionTouch < 60_000) return
  lastSessionTouch = now
  userStore.touchSession()
}

onMounted(() => {
  // 清理旧版 localStorage 键
  const oldToken = localStorage.getItem('stellar_token')
  if (oldToken && !localStorage.getItem('stellar_auth_token')) {
    localStorage.removeItem('stellar_token')
  }
  appStore.init()
  i18n.global.locale.value = appStore.locale as 'zh-CN' | 'en-US'
  if (!isRestrictedWebView) {
    userStore.ensureSessionValid()
    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach((event) => window.addEventListener(event, handleUserActivity, { passive: true }))
    sessionCheckTimer = window.setInterval(() => {
      if (userStore.isLoggedIn && !userStore.ensureSessionValid()) {
        void router.replace({ name: 'login', query: { reason: 'session_expired' } })
      }
    }, 60_000)
  }
})

onBeforeUnmount(() => {
  if (sessionCheckTimer) window.clearInterval(sessionCheckTimer)
  ;['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((event) => window.removeEventListener(event, handleUserActivity))
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

.browser-only-gate {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f5f7fb;
  color: #1f2937;
}
.browser-only-panel {
  width: min(440px, 100%);
  padding: 36px 28px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  text-align: center;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.1);
}
.browser-only-panel h1 { margin: 0 0 14px; font-size: 22px; }
.browser-only-panel p { margin: 8px 0; line-height: 1.7; }
.browser-only-hint { color: #6b7280; font-size: 13px; }
</style>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type ThemeColor = 'default' | 'blue' | 'black' | 'darkblue'
type ThemeMode = 'dark' | 'light'

export const useAppStore = defineStore('app', () => {
  const isDark = ref(true)
  const defaultThemeMode = ref<ThemeMode>('dark')
  const locale = ref('zh-CN')
  const sidebarCollapsed = ref(false)
  const mobileSidebarOpen = ref(false)
  const themeColor = ref<ThemeColor>('default')
  const title = ref('Stellar')
  const logo = ref('')
  const version = ref('1.0.0')
  const backgroundUrl = ref('')
  const description = ref('')

  const init = () => {
    // 从 window.settings 读取配置
    if (window.settings) {
      title.value = window.settings.title || 'Stellar'
      logo.value = window.settings.logo || ''
      version.value = window.settings.version || '1.0.0'
      backgroundUrl.value = window.settings.background_url || ''
      description.value = window.settings.description || ''
      defaultThemeMode.value = window.settings.landing_theme_mode === 'light' ? 'light' : 'dark'
      isDark.value = defaultThemeMode.value === 'dark'
      if (window.settings.theme?.color) {
        themeColor.value = window.settings.theme.color as ThemeColor
      }
    }

    // 从 localStorage 读取主题偏好
    const savedDark = localStorage.getItem('stellar_dark')
    if (savedDark !== null) {
      isDark.value = savedDark === 'true'
    }

    const savedLocale = localStorage.getItem('stellar_locale')
    if (savedLocale) {
      locale.value = savedLocale
    }

    applyTheme()
  }

  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem('stellar_dark', String(isDark.value))
    applyTheme()
  }

  const setLocale = (l: string) => {
    locale.value = l
    localStorage.setItem('stellar_locale', l)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleMobileSidebar = () => {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  }

  const closeMobileSidebar = () => {
    mobileSidebarOpen.value = false
  }

  const applyTheme = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  return {
    isDark,
    defaultThemeMode,
    locale,
    sidebarCollapsed,
    mobileSidebarOpen,
    themeColor,
    title,
    logo,
    version,
    backgroundUrl,
    description,
    init,
    toggleDark,
    setLocale,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    applyTheme,
  }
})

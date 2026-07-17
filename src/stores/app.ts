import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type ThemeColor = 'default' | 'blue' | 'black' | 'darkblue'
type ThemeMode = 'dark' | 'light'

interface BackgroundConfig {
  enabled: boolean
  type: 'image' | 'video'
  url: string
  poster?: string
  overlay_opacity: number
  overlay_color: string
  video_autoplay: boolean
  video_loop: boolean
  video_muted: boolean
}

interface GlassmorphismConfig {
  enabled: boolean
  blur: number
  opacity: number
  border_style: 'none' | 'solid' | 'light'
  border_color: string
  border_width: number
  radius: number
}

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

  // 全站背景配置
  const background = ref<BackgroundConfig>({
    enabled: false,
    type: 'image',
    url: '',
    poster: '',
    overlay_opacity: 0.35,
    overlay_color: '#000000',
    video_autoplay: true,
    video_loop: true,
    video_muted: true,
  })

  // 毛玻璃卡片效果配置
  const glassmorphism = ref<GlassmorphismConfig>({
    enabled: false,
    blur: 12,
    opacity: 0.65,
    border_style: 'light',
    border_color: 'rgba(255, 255, 255, 0.18)',
    border_width: 1,
    radius: 12,
  })

  // 背景是否启用（兼容旧版 background_url：若新配置未启用但旧字段有值，则 auth 页面仍可用）
  const backgroundEnabled = computed(() => {
    const bg = background.value
    return bg.enabled && !!bg.url
  })

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
      // 读取全站背景配置
      if (window.settings.background) {
        background.value = { ...background.value, ...window.settings.background }
      }
      // 读取毛玻璃配置
      if (window.settings.glassmorphism) {
        glassmorphism.value = { ...glassmorphism.value, ...window.settings.glassmorphism }
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
    applyGlassmorphism()
    applyBackground()
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

  // 背景启用时在 <html> 添加标记类，使布局容器背景透明以露出底层背景
  const applyBackground = () => {
    const root = document.documentElement
    if (backgroundEnabled.value) {
      root.classList.add('stellar-bg-on')
    } else {
      root.classList.remove('stellar-bg-on')
    }
  }

  // 将毛玻璃配置写入 CSS 变量，供 .stellar-glass / .stellar-card 使用
  const applyGlassmorphism = () => {
    const root = document.documentElement
    const g = glassmorphism.value
    if (g.enabled) {
      root.classList.add('stellar-glass-on')
      root.style.setProperty('--stellar-glass-blur', `${g.blur}px`)
      root.style.setProperty('--stellar-glass-opacity', String(g.opacity))
      root.style.setProperty('--stellar-glass-radius', `${g.radius}px`)
      root.style.setProperty('--stellar-glass-border-color', g.border_color)
      root.style.setProperty('--stellar-glass-border-width', `${g.border_width}px`)
      root.style.setProperty('--stellar-glass-border-style', g.border_style === 'none' ? 'none' : 'solid')
      // light 样式使用更细的半透明线，由 CSS 层处理
      root.style.setProperty('--stellar-glass-border-light', g.border_style === 'light' ? '1' : '0')
    } else {
      root.classList.remove('stellar-glass-on')
      root.style.removeProperty('--stellar-glass-blur')
      root.style.removeProperty('--stellar-glass-opacity')
      root.style.removeProperty('--stellar-glass-radius')
      root.style.removeProperty('--stellar-glass-border-color')
      root.style.removeProperty('--stellar-glass-border-width')
      root.style.removeProperty('--stellar-glass-border-style')
      root.style.removeProperty('--stellar-glass-border-light')
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
    background,
    glassmorphism,
    backgroundEnabled,
    init,
    toggleDark,
    setLocale,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    applyTheme,
    applyGlassmorphism,
    applyBackground,
  }
})

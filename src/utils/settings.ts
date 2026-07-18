const defaultSettings = {
  title: 'Stellar',
  description: 'Stellar Panel',
  assets_path: '/assets',
  theme: {
    color: 'default',
  },
  version: '1.0.0',
  background_url: '',
  logo: '',
  header_code: '',
  footer_code: '',
  landing_theme_mode: 'dark' as const,
  landing_page_enabled: true,
  telegram_group: '',
  api_error_contact: '',
  client_downloads: {
    windows: '',
    macos: '',
    android: '',
    ios: '',
    linux: '',
    router: '',
  },
  api: {
    url_mode: 'auto' as const,
    static_base_urls: [] as string[],
    auto: {
      use_same_protocol: true,
      host: '',
      append_path: '',
    },
    check_enabled: false,
    check_path: '/api/v1/guest/comm/config',
    proxy_enabled: false,
    proxy_url: '',
    proxy_path: '/api-proxy',
    proxy_mode: 'base64Path' as const,
    // 后端类型：'xboard' | 'v2board' | 'auto'（自动探测）
    backend_type: 'auto' as const,
  },
  // 全站背景配置（支持静态图片 / 视频两种媒体类型）
  background: {
    enabled: false,
    type: 'image' as const,
    url: '',
    poster: '',
    overlay_opacity: 0.35,
    overlay_color: '#000000',
    video_autoplay: true,
    video_loop: true,
    video_muted: true,
  },
  // 全局毛玻璃（Glassmorphism）卡片效果配置
  glassmorphism: {
    enabled: false,
    blur: 12,
    opacity: 0.65,
    border_style: 'light' as const,
    border_color: 'rgba(255, 255, 255, 0.18)',
    border_width: 1,
    radius: 12,
  },
}

let initialized = false

export function initRuntimeSettings() {
  if (typeof window === 'undefined') return
  if (initialized) return
  initialized = true

  if (!window.routerBase) {
    window.routerBase = '/'
  }

  if (!window.settings) {
    window.settings = defaultSettings as unknown as Window['settings']
    console.warn('[settings] env.js not loaded, using default settings')
    return
  }

  const s = window.settings
  window.settings = {
    ...defaultSettings,
    ...s,
    theme: {
      ...defaultSettings.theme,
      ...s.theme,
    },
    api: {
      ...defaultSettings.api,
      ...(s.api || {}),
      auto: {
        ...defaultSettings.api.auto,
        ...(s.api?.auto || {}),
      },
    },
    client_downloads: {
      ...defaultSettings.client_downloads,
      ...(s.client_downloads || {}),
    },
    background: {
      ...defaultSettings.background,
      ...(s.background || {}),
    },
    glassmorphism: {
      ...defaultSettings.glassmorphism,
      ...(s.glassmorphism || {}),
    },
  } as unknown as Window['settings']
}

initRuntimeSettings()

export function getRouterBase(): string {
  const base = window.routerBase || '/'
  return base.endsWith('/') ? base : base + '/'
}

export function getAssetsPath(): string {
  const base = getRouterBase()
  const assetsPath = window.settings?.assets_path || 'assets'
  const cleanAssetsPath = assetsPath.replace(/^\/+|\/+$/g, '')
  return `${base}${cleanAssetsPath}/`
}

export function getPublicPath(path: string): string {
  const base = getRouterBase()
  const cleanPath = path.replace(/^\/+/, '')
  return `${base}${cleanPath}`
}

export function resolveUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const cleanPath = path.startsWith('/') ? path : '/' + path
  return `${cleanBase}${cleanPath}`
}

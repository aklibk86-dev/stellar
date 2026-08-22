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
  // 用户头像源 URL；支持 {email}、{username}、{seed} 占位符
  avatar_source: '',
  header_code: '',
  footer_code: '',
  landing_theme_mode: 'dark' as const,
  landing_page_enabled: true,
  landing_hero: {
    badge: '',
    badge_en: '',
    title: '',
    title_en: '',
    title_suffix: '',
    title_suffix_en: '',
    subtitle: '',
    subtitle_en: '',
    features: [] as Array<string | { label: string; label_en?: string }>,
  },
  landing_navigation: {
    items: null,
  },
  sidebar_navigation: {
    items: null,
  },
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
  client_imports: {
    enabled: true,
    clients: [] as string[],
  },
  social_sharing: {
    enabled: true,
    platforms: ['wechat', 'qq', 'weibo', 'twitter', 'telegram', 'facebook', 'copy'] as string[],
    title: '',
    description: '',
  },
  customer_service: {
    enabled: false,
    provider: 'tawk' as const,
    load_delay: 800,
    load_on_idle: true,
    identify_user: true,
    track_page_views: true,
    show_on_routes: [] as string[],
    hide_on_routes: [] as string[],
    show_on_auth_routes: true,
    hide_on_mobile: false,
    attributes: {} as Record<string, string | number | boolean>,
    tags: [] as string[],
    allow_insecure_http: false,
    tawk_property_id: '',
    tawk_widget_id: 'default',
    tawk_auto_start: true,
    tawk_secure_hash: '',
    tawk_custom_style: {} as Record<string, unknown>,
    crisp_website_id: '',
    chatwoot_base_url: '',
    chatwoot_website_token: '',
    chatwoot_locale: 'auto',
    chatwoot_position: 'right' as const,
    intercom_app_id: '',
    intercom_api_base: 'https://api-iam.intercom.io',
    script_url: '',
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
    desktop_url: '',
    mobile_url: '',
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
  knowledge_require_subscription: true,
}

let initialized = false

const pickConfiguredList = (runtimeValue: unknown, fallback: string[]) => {
  if (Array.isArray(runtimeValue)) return runtimeValue
  return fallback
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function filterPrototypeKeys(val: unknown): unknown {
  if (isPlainObject(val)) {
    const sanitized: Record<string, unknown> = {}
    for (const k of Object.keys(val)) {
      if (k === '__proto__' || k === 'constructor') continue
      sanitized[k] = filterPrototypeKeys(val[k])
    }
    return sanitized
  }
  return val
}

export function initRuntimeSettings() {
  if (typeof window === 'undefined') return
  if (initialized) return
  initialized = true

  if (!window.routerBase) {
    window.routerBase = '/'
  }

  if (!window.settings) {
    console.warn('[settings] env.js not loaded, using default settings')
  }

  const s = filterPrototypeKeys(window.settings || {}) as Record<string, any>
  const runtimeClientImports = (s.client_imports || {}) as Record<string, unknown>
  const runtimeSocialSharing = (s.social_sharing || {}) as Record<string, unknown>
  window.settings = {
    ...defaultSettings,
    ...s,
    theme: {
      ...defaultSettings.theme,
      ...(s.theme as Record<string, unknown> || {}),
    },
    api: {
      ...defaultSettings.api,
      ...((s.api || {}) as Record<string, unknown>),
      auto: {
        ...defaultSettings.api.auto,
        ...((s.api as Record<string, unknown>)?.auto as Record<string, unknown> || {}),
      },
    },
    client_downloads: {
      ...defaultSettings.client_downloads,
      ...((s.client_downloads || {}) as Record<string, unknown>),
    },
    client_imports: {
      ...defaultSettings.client_imports,
      ...runtimeClientImports,
      clients: pickConfiguredList(
        runtimeClientImports.clients,
        defaultSettings.client_imports.clients,
      ),
    },
    social_sharing: {
      ...defaultSettings.social_sharing,
      ...runtimeSocialSharing,
      platforms: pickConfiguredList(
        runtimeSocialSharing.platforms,
        defaultSettings.social_sharing.platforms,
      ),
    },
    landing_navigation: {
      ...defaultSettings.landing_navigation,
      ...((s.landing_navigation || {}) as Record<string, unknown>),
    },
    landing_hero: {
      ...defaultSettings.landing_hero,
      ...((s.landing_hero || {}) as Record<string, unknown>),
      features: Array.isArray((s.landing_hero as Record<string, unknown>)?.features)
        ? (s.landing_hero as Record<string, unknown>).features
        : defaultSettings.landing_hero.features,
    },
    sidebar_navigation: {
      ...defaultSettings.sidebar_navigation,
      ...((s.sidebar_navigation || {}) as Record<string, unknown>),
    },
    customer_service: {
      ...defaultSettings.customer_service,
      ...((s.customer_service || {}) as Record<string, unknown>),
    },
    background: {
      ...defaultSettings.background,
      ...((s.background || {}) as Record<string, unknown>),
    },
    glassmorphism: {
      ...defaultSettings.glassmorphism,
      ...((s.glassmorphism || {}) as Record<string, unknown>),
    },
  } as unknown as Window['settings']

  try {
    Object.freeze(window.settings)
  } catch {
  }
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

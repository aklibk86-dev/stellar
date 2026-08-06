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
    tawk_property_id: '',
    tawk_widget_id: 'default',
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

const parseBuildList = (value: unknown) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

const hasBuildEnv = (key: string) => Object.prototype.hasOwnProperty.call(import.meta.env, key)
const pickConfiguredList = (buildValue: unknown, runtimeValue: unknown, fallback: string[]) => {
  if (Array.isArray(buildValue)) return buildValue
  if (Array.isArray(runtimeValue)) return runtimeValue
  return fallback
}

const buildSettings = (): Record<string, any> => {
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').trim()
  const clients = parseBuildList(import.meta.env.VITE_CLIENT_IMPORTS)
  const socialPlatforms = parseBuildList(import.meta.env.VITE_SOCIAL_SHARE_PLATFORMS)
  const settings: Record<string, any> = {}

  if (hasBuildEnv('VITE_SITE_TITLE')) settings.title = import.meta.env.VITE_SITE_TITLE
  if (hasBuildEnv('VITE_SITE_DESCRIPTION')) settings.description = import.meta.env.VITE_SITE_DESCRIPTION

  if (hasBuildEnv('VITE_CLIENT_IMPORTS_ENABLED') || hasBuildEnv('VITE_CLIENT_IMPORTS')) {
    settings.client_imports = {
      ...(hasBuildEnv('VITE_CLIENT_IMPORTS_ENABLED')
        ? { enabled: import.meta.env.VITE_CLIENT_IMPORTS_ENABLED !== 'false' }
        : {}),
      ...(hasBuildEnv('VITE_CLIENT_IMPORTS') ? { clients } : {}),
    }
  }

  if (hasBuildEnv('VITE_SOCIAL_SHARE_ENABLED') || hasBuildEnv('VITE_SOCIAL_SHARE_PLATFORMS')) {
    settings.social_sharing = {
      ...(hasBuildEnv('VITE_SOCIAL_SHARE_ENABLED')
        ? { enabled: import.meta.env.VITE_SOCIAL_SHARE_ENABLED !== 'false' }
        : {}),
      ...(hasBuildEnv('VITE_SOCIAL_SHARE_PLATFORMS') ? { platforms: socialPlatforms } : {}),
    }
  }

  if ([
    'VITE_CUSTOMER_SERVICE_ENABLED',
    'VITE_CUSTOMER_SERVICE_PROVIDER',
    'VITE_TAWK_PROPERTY_ID',
    'VITE_TAWK_WIDGET_ID',
    'VITE_CUSTOMER_SERVICE_SCRIPT_URL',
  ].some(hasBuildEnv)) {
    settings.customer_service = {
      ...(hasBuildEnv('VITE_CUSTOMER_SERVICE_ENABLED')
        ? { enabled: import.meta.env.VITE_CUSTOMER_SERVICE_ENABLED === 'true' }
        : {}),
      ...(hasBuildEnv('VITE_CUSTOMER_SERVICE_PROVIDER')
        ? { provider: import.meta.env.VITE_CUSTOMER_SERVICE_PROVIDER }
        : {}),
      ...(hasBuildEnv('VITE_TAWK_PROPERTY_ID') ? { tawk_property_id: import.meta.env.VITE_TAWK_PROPERTY_ID } : {}),
      ...(hasBuildEnv('VITE_TAWK_WIDGET_ID') ? { tawk_widget_id: import.meta.env.VITE_TAWK_WIDGET_ID } : {}),
      ...(hasBuildEnv('VITE_CUSTOMER_SERVICE_SCRIPT_URL')
        ? { script_url: import.meta.env.VITE_CUSTOMER_SERVICE_SCRIPT_URL }
        : {}),
    }
  }

  if (hasBuildEnv('VITE_API_BASE_URL') || hasBuildEnv('VITE_BACKEND_TYPE')) {
    settings.api = {
      ...(apiBase ? { url_mode: 'static', static_base_urls: [apiBase] } : {}),
      ...(hasBuildEnv('VITE_BACKEND_TYPE') ? { backend_type: import.meta.env.VITE_BACKEND_TYPE } : {}),
    }
  }

  return settings
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
  const b = buildSettings()
  const runtimeClientImports = (s.client_imports || {}) as Record<string, unknown>
  const buildClientImports = (b.client_imports || {}) as Record<string, unknown>
  const runtimeSocialSharing = (s.social_sharing || {}) as Record<string, unknown>
  const buildSocialSharing = (b.social_sharing || {}) as Record<string, unknown>
  window.settings = {
    ...defaultSettings,
    ...s,
    ...b,
    theme: {
      ...defaultSettings.theme,
      ...(s.theme as Record<string, unknown> || {}),
    },
    api: {
      ...defaultSettings.api,
      ...((s.api || {}) as Record<string, unknown>),
      ...((b.api || {}) as Record<string, unknown>),
      auto: {
        ...defaultSettings.api.auto,
        ...((s.api as Record<string, unknown>)?.auto as Record<string, unknown> || {}),
        ...((b.api as Record<string, unknown>)?.auto as Record<string, unknown> || {}),
      },
    },
    client_downloads: {
      ...defaultSettings.client_downloads,
      ...((s.client_downloads || {}) as Record<string, unknown>),
    },
    client_imports: {
      ...defaultSettings.client_imports,
      ...runtimeClientImports,
      ...buildClientImports,
      clients: pickConfiguredList(
        buildClientImports.clients,
        runtimeClientImports.clients,
        defaultSettings.client_imports.clients,
      ),
    },
    social_sharing: {
      ...defaultSettings.social_sharing,
      ...runtimeSocialSharing,
      ...buildSocialSharing,
      platforms: pickConfiguredList(
        buildSocialSharing.platforms,
        runtimeSocialSharing.platforms,
        defaultSettings.social_sharing.platforms,
      ),
    },
    customer_service: {
      ...defaultSettings.customer_service,
      ...((s.customer_service || {}) as Record<string, unknown>),
      ...((b.customer_service || {}) as Record<string, unknown>),
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

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

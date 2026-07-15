export type ApiUrlMode = 'static' | 'auto'
export type ApiProxyMode = 'base64Path' | 'query' | 'plainPath'

export interface ApiRuntimeConfig {
  url_mode?: ApiUrlMode
  static_base_urls?: string | string[]
  auto?: {
    use_same_protocol?: boolean
    host?: string
    append_path?: string
  }
  check_enabled?: boolean
  check_path?: string
  proxy_enabled?: boolean
  proxy_url?: string
  proxy_path?: string
  proxy_mode?: ApiProxyMode
}

const STORAGE_KEY = 'stellar_available_api_url'
const DEFAULT_CHECK_PATH = '/api/v1/guest/comm/config'

const trimEndSlash = (url: string) => url.replace(/\/+$/, '')
const ensureStartSlash = (path: string) => path.startsWith('/') ? path : `/${path}`

export const getApiConfig = (): ApiRuntimeConfig => window.settings?.api || {}

export const normalizeApiBaseUrl = (url = '') => {
  const value = url.trim()
  if (!value) return ''
  return trimEndSlash(value)
}

export const getAutoApiBaseUrl = () => {
  const config = getApiConfig().auto || {}
  const protocol = config.use_same_protocol === false ? 'https:' : window.location.protocol
  const host = config.host?.trim() || window.location.host
  const path = config.append_path ? ensureStartSlash(config.append_path) : ''
  return normalizeApiBaseUrl(`${protocol}//${host}${path}`)
}

export const getStaticApiBaseUrls = () => {
  const urls = getApiConfig().static_base_urls
  if (Array.isArray(urls)) return urls.map(normalizeApiBaseUrl).filter(Boolean)
  if (typeof urls === 'string') {
    return urls.split(',').map(normalizeApiBaseUrl).filter(Boolean)
  }
  return []
}

export const shouldCheckApiAvailability = () => {
  const config = getApiConfig()
  if (config.proxy_enabled) return false
  if (config.check_enabled === false) return false
  if (config.url_mode !== 'static') return false
  if (sessionStorage.getItem(STORAGE_KEY)) return false
  const urls = getStaticApiBaseUrls()
  return urls.length > 1 && urls.some(url => /^https?:\/\//i.test(url))
}

export const getAvailableApiUrl = () => {
  if (typeof window === 'undefined') return ''
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (stored) return stored
  return getStaticApiBaseUrls()[0] || ''
}

export const setAvailableApiUrl = (url: string) => {
  sessionStorage.setItem(STORAGE_KEY, normalizeApiBaseUrl(url))
}

export const clearAvailableApiUrl = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}

export const getApiBaseUrl = () => {
  const config = getApiConfig()
  if (config.proxy_enabled && config.proxy_url) return normalizeApiBaseUrl(config.proxy_url)
  if (config.url_mode === 'static') return getAvailableApiUrl()
  if (config.url_mode === 'auto') return getAutoApiBaseUrl()
  return window.routerBase || '/'
}

export const getApiCheckPath = () => ensureStartSlash(getApiConfig().check_path || DEFAULT_CHECK_PATH)

export const buildApiCheckUrl = (baseUrl: string) => `${normalizeApiBaseUrl(baseUrl)}${getApiCheckPath()}`

export const checkSingleApi = async (baseUrl: string, timeout = 6000) => {
  const startedAt = performance.now()
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(buildApiCheckUrl(baseUrl), {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    const latency = Math.round(performance.now() - startedAt)
    return { url: normalizeApiBaseUrl(baseUrl), ok: response.ok, status: response.status, latency }
  } catch (error) {
    const latency = Math.round(performance.now() - startedAt)
    return { url: normalizeApiBaseUrl(baseUrl), ok: false, status: 0, latency, message: error instanceof Error ? error.message : '检测失败' }
  } finally {
    window.clearTimeout(timer)
  }
}

export const buildProxyUrl = (apiPath = '') => {
  const config = getApiConfig()
  if (!config.proxy_enabled) return apiPath
  const proxyPath = ensureStartSlash(config.proxy_path || '/api-proxy')
  const targetBase = config.url_mode === 'static' ? (getAvailableApiUrl() || getStaticApiBaseUrls()[0] || window.location.origin) : getAutoApiBaseUrl()
  const target = `${normalizeApiBaseUrl(targetBase)}${ensureStartSlash(apiPath)}`
  const mode = config.proxy_mode || 'base64Path'

  if (mode === 'query') return `${proxyPath}?target=${encodeURIComponent(target)}`
  if (mode === 'plainPath') return `${proxyPath}${ensureStartSlash(apiPath)}`
  return `${proxyPath}/${btoa(unescape(encodeURIComponent(target)))}`
}

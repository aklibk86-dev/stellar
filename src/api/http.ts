import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import { buildProxyUrl, getApiBaseUrl, getApiConfig } from '@/utils/apiConfig'
import router from '@/router'

// 扩展 axios 配置,支持 silent 选项(静默失败,不输出 console.error)
declare module 'axios' {
  interface AxiosRequestConfig {
    silent?: boolean
  }
}

export interface ApiError {
  status: number
  message: string
  data?: any
  code?: number | string
}

const http: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有访问权限',
  404: '请求资源不存在',
  405: '请求方法不允许',
  422: '请求参数验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂不可用',
  504: '网关超时',
}

http.interceptors.request.use((config) => {
  const apiConfig = getApiConfig()
  config.baseURL = getApiBaseUrl()
  if (apiConfig.proxy_enabled && config.url) {
    config.url = buildProxyUrl(config.url)
  }

  const userStore = useUserStore()
  if (userStore.authToken) {
    config.headers['Authorization'] = `Bearer ${userStore.authToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && typeof res === 'object' && res.status === 'fail') {
      const error: ApiError = {
        status: response.status,
        message: res.message || '请求失败',
        data: res.data,
        code: res.code,
      }
      console.error('[API] Business error:', error.message, error)
      return Promise.reject(error)
    }
    return res
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      const silent = error.config?.silent
      let message = ERROR_MESSAGES[status] || `请求失败 (${status})`
      if (data?.message && typeof data.message === 'string') {
        message = data.message
      }

      if (status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }

      const apiError: ApiError = {
        status,
        message,
        data: data?.data,
        code: data?.code,
      }
      if (!silent) {
        console.error(`[API] HTTP ${status}:`, message)
      }
      return Promise.reject(apiError)
    }
    if (error.code === 'ECONNABORTED') {
      const apiError: ApiError = {
        status: 0,
        message: '请求超时，请检查网络连接',
      }
      if (!error.config?.silent) {
        console.error('[API] Request timeout')
      }
      return Promise.reject(apiError)
    }
    // 请求被取消(AbortController) — 页面切换/组件卸载时常见,静默处理不输出 console.error
    if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      const apiError: ApiError = {
        status: 0,
        message: '请求已取消',
        code: 'ERR_CANCELED',
      }
      return Promise.reject(apiError)
    }
    const apiError: ApiError = {
      status: 0,
      message: '网络错误，请检查网络连接',
    }
    if (!error.config?.silent) {
      console.error('[API] Network error:', error.message)
    }
    return Promise.reject(apiError)
  }
)

export default http

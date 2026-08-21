import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi, passportApi, guestApi } from '@/api'
import type { User, GuestConfig } from '@/api/types'
import {
  isAutoDetectMode,
  setDetectedBackend,
  detectBackendFromGuestConfig,
  normalizeUser,
  normalizeGuestConfig,
} from '@/utils/backend'

const USER_CACHE_KEY = 'stellar_user_cache'
const USER_CACHE_TTL = 5 * 60 * 1000
const SESSION_STARTED_KEY = 'stellar_session_started_at'
const SESSION_ACTIVITY_KEY = 'stellar_session_activity_at'
const SESSION_IDLE_LIMIT = 12 * 60 * 60 * 1000
const SESSION_MAX_LIMIT = 24 * 60 * 60 * 1000

const readCachedUser = (): User | null => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(USER_CACHE_KEY) || 'null')
    if (!cached?.user || Date.now() - Number(cached.cachedAt) > USER_CACHE_TTL) {
      sessionStorage.removeItem(USER_CACHE_KEY)
      return null
    }
    return cached.user as User
  } catch {
    sessionStorage.removeItem(USER_CACHE_KEY)
    return null
  }
}

const cacheUser = (user: User) => {
  try {
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({
      cachedAt: Date.now(),
      user,
    }))
  } catch {
  }
}

export const useUserStore = defineStore('user', () => {
  const cachedUser = readCachedUser()
  const authToken = ref<string>(
    localStorage.getItem('stellar_auth_token')?.trim()
      || sessionStorage.getItem('stellar_auth_token')?.trim()
      || '',
  )
  const subscribeToken = ref<string>(
    localStorage.getItem('stellar_subscribe_token')?.trim()
      || sessionStorage.getItem('stellar_subscribe_token')?.trim()
      || '',
  )
  const user = ref<User | null>(cachedUser)
  const userLoadedFromCache = ref(Boolean(cachedUser))
  const guestConfig = ref<GuestConfig | null>(null)

  let fetchUserPromise: Promise<User | null> | null = null
  let fetchGuestConfigPromise: Promise<GuestConfig | null> | null = null

  const isLoggedIn = computed(() => !!authToken.value)
  const balance = computed(() => user.value?.balance || 0)
  const commissionBalance = computed(() => user.value?.commission_balance || 0)

  const token = computed(() => authToken.value)

  const setAuthData = (authData: string, subToken: string, remember = true) => {
    authToken.value = authData
    subscribeToken.value = subToken
    const storage = remember ? localStorage : sessionStorage
    const otherStorage = remember ? sessionStorage : localStorage
    storage.setItem('stellar_auth_token', authData)
    storage.setItem('stellar_subscribe_token', subToken)
    otherStorage.removeItem('stellar_auth_token')
    otherStorage.removeItem('stellar_subscribe_token')
    otherStorage.removeItem(SESSION_STARTED_KEY)
    otherStorage.removeItem(SESSION_ACTIVITY_KEY)
    const now = String(Date.now())
    storage.setItem(SESSION_STARTED_KEY, now)
    storage.setItem(SESSION_ACTIVITY_KEY, now)
  }

  /** Enforce both an idle timeout and an absolute maximum session lifetime. */
  const ensureSessionValid = (): boolean => {
    if (!authToken.value) return false
    const storage = localStorage.getItem('stellar_auth_token')?.trim()
      ? localStorage
      : sessionStorage
    const now = Date.now()
    const startedAt = Number(storage.getItem(SESSION_STARTED_KEY) || now)
    const activityAt = Number(storage.getItem(SESSION_ACTIVITY_KEY) || now)
    // Backfill timestamps for sessions created by older versions.
    if (!storage.getItem(SESSION_STARTED_KEY)) storage.setItem(SESSION_STARTED_KEY, String(startedAt))
    if (!storage.getItem(SESSION_ACTIVITY_KEY)) storage.setItem(SESSION_ACTIVITY_KEY, String(activityAt))
    if (now - startedAt >= SESSION_MAX_LIMIT || now - activityAt >= SESSION_IDLE_LIMIT) {
      logout()
      return false
    }
    return true
  }

  const touchSession = () => {
    if (!authToken.value || !ensureSessionValid()) return
    const storage = localStorage.getItem('stellar_auth_token')?.trim()
      ? localStorage
      : sessionStorage
    storage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()))
  }

  const fetchUser = async (force = false): Promise<User | null> => {
    if (!authToken.value) return null
    if (fetchUserPromise) return fetchUserPromise
    if (user.value && !force) return user.value

    fetchUserPromise = (async () => {
      try {
        const res = await userApi.getInfo()
        user.value = normalizeUser(res.data)
        userLoadedFromCache.value = false
        cacheUser(user.value)
        return res.data
      } catch (err: any) {
        // 仅当明确返回 401 时才登出，其他错误不清除登录状态
        if (err?.status === 401) {
          logout()
        }
        return null
      } finally {
        fetchUserPromise = null
      }
    })()
    return fetchUserPromise
  }

  const fetchGuestConfig = async (force = false): Promise<GuestConfig | null> => {
    if (!force && fetchGuestConfigPromise) return fetchGuestConfigPromise
    if (guestConfig.value && !force) return guestConfig.value

    fetchGuestConfigPromise = (async () => {
      try {
        const res = await guestApi.getConfig()
        const raw = res.data
        // auto 模式下：根据 guest config 字段特征探测后端类型
        if (isAutoDetectMode()) {
          const detected = detectBackendFromGuestConfig(raw)
          if (detected) setDetectedBackend(detected)
        }
        guestConfig.value = normalizeGuestConfig(raw)
        return guestConfig.value
      } catch {
        return null
      } finally {
        fetchGuestConfigPromise = null
      }
    })()
    return fetchGuestConfigPromise
  }

  const login = async (email: string, password: string, remember = true) => {
    const res = await passportApi.login(email, password)
    setAuthData(res.data.auth_data, res.data.token, remember)
    await fetchUser(true)
    return res.data
  }

  const register = async (email: string, password: string, invite_code?: string, email_code?: string) => {
    const res = await passportApi.register(email, password, invite_code, email_code)
    setAuthData(res.data.auth_data, res.data.token)
    await fetchUser(true)
    return res.data
  }

  const logout = () => {
    authToken.value = ''
    subscribeToken.value = ''
    user.value = null
    userLoadedFromCache.value = false
    fetchUserPromise = null
    localStorage.removeItem('stellar_auth_token')
    localStorage.removeItem('stellar_subscribe_token')
    localStorage.removeItem(SESSION_STARTED_KEY)
    localStorage.removeItem(SESSION_ACTIVITY_KEY)
    sessionStorage.removeItem('stellar_auth_token')
    sessionStorage.removeItem('stellar_subscribe_token')
    sessionStorage.removeItem(SESSION_STARTED_KEY)
    sessionStorage.removeItem(SESSION_ACTIVITY_KEY)
    sessionStorage.removeItem(USER_CACHE_KEY)
  }

  const checkLogin = async () => {
    if (!ensureSessionValid()) return false
    try {
      await userApi.checkLogin()
      return true
    } catch (err: any) {
      // 仅当明确返回 401 时才登出，其他错误（如网络问题、后端探测未完成导致的 404）不清除登录状态
      if (err?.status === 401) {
        logout()
        return false
      }
      // 其他错误不自动登出，保留 token 以便后续重试
      return true
    }
  }

  return {
    authToken,
    subscribeToken,
    token,
    user,
    userLoadedFromCache,
    guestConfig,
    isLoggedIn,
    balance,
    commissionBalance,
    setAuthData,
    ensureSessionValid,
    touchSession,
    fetchUser,
    fetchGuestConfig,
    login,
    register,
    logout,
    checkLogin,
  }
})

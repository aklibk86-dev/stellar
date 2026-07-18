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

export const useUserStore = defineStore('user', () => {
  const authToken = ref<string>(localStorage.getItem('stellar_auth_token') || '')
  const subscribeToken = ref<string>(localStorage.getItem('stellar_subscribe_token') || '')
  const user = ref<User | null>(null)
  const guestConfig = ref<GuestConfig | null>(null)

  let fetchUserPromise: Promise<User | null> | null = null
  let fetchGuestConfigPromise: Promise<GuestConfig | null> | null = null

  const isLoggedIn = computed(() => !!authToken.value)
  const balance = computed(() => user.value?.balance || 0)
  const commissionBalance = computed(() => user.value?.commission_balance || 0)

  const token = computed(() => authToken.value)

  const setAuthData = (authData: string, subToken: string) => {
    authToken.value = authData
    subscribeToken.value = subToken
    localStorage.setItem('stellar_auth_token', authData)
    localStorage.setItem('stellar_subscribe_token', subToken)
  }

  const fetchUser = async (force = false): Promise<User | null> => {
    if (!authToken.value) return null
    if (!force && fetchUserPromise) return fetchUserPromise
    if (user.value && !force) return user.value

    fetchUserPromise = (async () => {
      try {
        const res = await userApi.getInfo()
        user.value = normalizeUser(res.data)
        return res.data
      } catch {
        logout()
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

  const login = async (email: string, password: string) => {
    const res = await passportApi.login(email, password)
    setAuthData(res.data.auth_data, res.data.token)
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
    fetchUserPromise = null
    localStorage.removeItem('stellar_auth_token')
    localStorage.removeItem('stellar_subscribe_token')
  }

  const checkLogin = async () => {
    if (!authToken.value) return false
    try {
      await userApi.checkLogin()
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    authToken,
    subscribeToken,
    token,
    user,
    guestConfig,
    isLoggedIn,
    balance,
    commissionBalance,
    setAuthData,
    fetchUser,
    fetchGuestConfig,
    login,
    register,
    logout,
    checkLogin,
  }
})

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import type { Subscribe } from '@/api/types'
import { formatTraffic, formatDate } from '@/utils/format'
import {
  createCustomerService,
  matchesCustomerServiceRoute,
  type CustomerServiceConfig,
  type CustomerServiceVisitor,
} from '@/utils/customerService'

const config = window.settings.customer_service as CustomerServiceConfig
const controller = createCustomerService(config)
const route = useRoute()
const userStore = useUserStore()
const mobileMedia = window.matchMedia('(max-width: 767px)')
const isMobile = ref(mobileMedia.matches)
const loaded = ref(false)

let loadPromise: Promise<void> | null = null
let loadTimer: number | null = null
let idleHandle: number | null = null
let tawkDomObserver: MutationObserver | null = null

// ===== 套餐与 IP 信息（用于第三方客服展示完整订阅状态）=====
const subscribe = ref<Subscribe | null>(null)
const currentIp = ref<string>('')

const planName = computed(() => {
  const sub = subscribe.value
  if (!sub) return ''
  return sub.plan?.name || (sub.plan_id ? `Plan #${sub.plan_id}` : '')
})

const usedTraffic = computed(() => {
  const sub = subscribe.value
  return formatTraffic((sub?.u || 0) + (sub?.d || 0))
})

const totalTraffic = computed(() => {
  const total = subscribe.value?.transfer_enable || 0
  return formatTraffic(total)
})

const expireText = computed(() => {
  const exp = subscribe.value?.expired_at
  if (exp === null || exp === undefined) return '永久有效'
  if (exp === 0) return '-'
  return formatDate(exp)
})

const fetchSubscriptionInfo = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const [subRes, sessionRes] = await Promise.allSettled([
      userApi.getSubscribe(),
      userApi.getActiveSession(),
    ])
    if (subRes.status === 'fulfilled') {
      subscribe.value = subRes.value.data
    }
    if (sessionRes.status === 'fulfilled') {
      const sessions = sessionRes.value.data
      const first = Array.isArray(sessions) ? sessions[0] : null
      currentIp.value = first?.ip || first?.name || ''
    }
  } catch (err) {
    console.warn('[CustomerService] 获取套餐信息失败:', err)
  }
}

const visitor = computed<CustomerServiceVisitor | undefined>(() => {
  if (config.identify_user === false) return undefined
  const user = userStore.user
  const runtimeIdentity = window.customerServiceIdentity
  if (!user && !runtimeIdentity) return undefined

  const email = runtimeIdentity?.email || user?.email || ''
  const attributes: Record<string, string | number | boolean> = {
    ...(runtimeIdentity?.attributes || {}),
    ...(user?.plan_id ? { plan_id: user.plan_id } : {}),
  }
  // 注入完整套餐信息，便于客服侧直接看到用户当前订阅状态
  if (planName.value) attributes.plan_name = planName.value
  if (subscribe.value) {
    attributes.used_traffic = usedTraffic.value
    attributes.total_traffic = totalTraffic.value
    attributes.expired_at = expireText.value
  }
  if (currentIp.value) attributes.current_ip = currentIp.value
  return {
    id: runtimeIdentity?.user_id || user?.uuid || email,
    hash: runtimeIdentity?.hash || config.tawk_secure_hash,
    name: runtimeIdentity?.name || email,
    email,
    avatar: runtimeIdentity?.avatar || user?.avatar_url || '',
    attributes,
  }
})

const routeAllowsWidget = computed(() => {
  if (config.hide_on_mobile && isMobile.value) return false
  const path = route.path
  // The landing page is a public entry point and should always keep chat available.
  if (path === '/' || path === '/landing') return true
  const authRoute = ['/login', '/register', '/forget', '/email-login'].includes(path)
  const showOnAuthRoute = config.show_on_auth_routes !== false
  if (authRoute && showOnAuthRoute) return true
  if (matchesCustomerServiceRoute(path, config.hide_on_routes) && !(authRoute && showOnAuthRoute)) return false
  const showRoutes = config.show_on_routes || []
  return showRoutes.length === 0 || matchesCustomerServiceRoute(path, showRoutes)
})

const emitError = (error: unknown) => {
  console.warn('[CustomerService] Failed to initialize:', error)
  window.dispatchEvent(new CustomEvent('stellar:customer-service', {
    detail: { provider: config.provider || 'tawk', event: 'error', payload: error },
  }))
}

const cancelScheduledLoad = () => {
  if (loadTimer !== null) {
    window.clearTimeout(loadTimer)
    loadTimer = null
  }
  if (idleHandle !== null) {
    const target = window as Window & { cancelIdleCallback?: (handle: number) => void }
    target.cancelIdleCallback?.(idleHandle)
    idleHandle = null
  }
}

const syncTawkDomVisibility = () => {
  const launcher = Array.from(document.body.children).find((element) => {
    if (!(element instanceof HTMLElement) || element.id === 'app') return false
    return Boolean(element.querySelector('iframe[style*="position: fixed"][width="64px"]'))
  }) as HTMLElement | undefined
  if (!launcher) return
  const visible = routeAllowsWidget.value
  const expected = visible ? 'block' : 'none'
  if (getComputedStyle(launcher).display !== expected) {
    launcher.style.setProperty('display', expected, 'important')
  }
}

const ensureLoaded = async () => {
  if (loaded.value) return
  if (loadPromise) return loadPromise

  loadPromise = controller.load(visitor.value)
    .then(() => {
      loaded.value = true
      controller.setVisible(routeAllowsWidget.value)
      if (config.track_page_views !== false) {
        controller.track('page_view', { path: route.fullPath })
      }
    })
    .catch((error) => {
      loadPromise = null
      emitError(error)
    })

  return loadPromise
}

const scheduleLoad = () => {
  if (loaded.value || loadPromise || loadTimer !== null || idleHandle !== null) return
  if (!routeAllowsWidget.value) return

  const startTimer = () => {
    idleHandle = null
    loadTimer = window.setTimeout(() => {
      loadTimer = null
      void ensureLoaded()
    }, Math.max(0, Number(config.load_delay) || 0))
  }

  const target = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  }
  if (config.load_on_idle !== false && target.requestIdleCallback) {
    idleHandle = target.requestIdleCallback(startTimer, { timeout: 2000 })
  } else {
    startTimer()
  }
}

const publicApi = {
  open: async () => {
    cancelScheduledLoad()
    await ensureLoaded()
    controller.open()
  },
  close: () => controller.close(),
  toggle: async () => {
    cancelScheduledLoad()
    await ensureLoaded()
    controller.toggle()
  },
  show: async () => {
    cancelScheduledLoad()
    await ensureLoaded()
    controller.setVisible(true)
  },
  hide: () => controller.setVisible(false),
  track: (event: string, metadata?: Record<string, string | number | boolean>) => {
    controller.track(event, metadata)
  },
}

const handleMobileChange = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches
}

watch(visitor, (nextVisitor) => {
  if (loaded.value) controller.setVisitor(nextVisitor)
}, { deep: true })

// 登录态变化时（如未登录先访问后登录）重新拉取套餐/IP 信息
watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) void fetchSubscriptionInfo()
})

watch(() => route.fullPath, (path) => {
  if (routeAllowsWidget.value) scheduleLoad()
  if (!loaded.value) return
  controller.setVisible(routeAllowsWidget.value)
  if (config.track_page_views !== false) controller.track('page_view', { path })
})

watch(routeAllowsWidget, (visible) => {
  if (visible) scheduleLoad()
  else cancelScheduledLoad()
  if (loaded.value) controller.setVisible(visible)
  syncTawkDomVisibility()
})

onMounted(() => {
  window.stellarCustomerService = publicApi
  mobileMedia.addEventListener('change', handleMobileChange)
  tawkDomObserver = new MutationObserver(() => syncTawkDomVisibility())
  tawkDomObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
  scheduleLoad()
  syncTawkDomVisibility()
  // 拉取套餐/IP 信息，加载后 visitor 重新计算并同步到客服侧
  void fetchSubscriptionInfo()
})

onBeforeUnmount(() => {
  cancelScheduledLoad()
  tawkDomObserver?.disconnect()
  tawkDomObserver = null
  mobileMedia.removeEventListener('change', handleMobileChange)
  controller.destroy()
  if (window.stellarCustomerService === publicApi) {
    delete window.stellarCustomerService
  }
})
</script>

<template>
  <span class="third-party-chat" aria-hidden="true" />
</template>

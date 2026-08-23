<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import type { Subscribe } from '@/api/types'
import { formatTraffic, formatDate, formatMoney } from '@/utils/format'
import { resolveAvatarUrl } from '@/utils/avatar'
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

// ===== 用户订阅信息（仅向第三方客服提供白名单字段）=====
const subscribe = ref<Subscribe | null>(null)

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
  const exp = subscribe.value?.expired_at ?? userStore.user?.expired_at
  if (exp === null || exp === undefined) return '永久有效'
  if (exp === 0) return '-'
  return formatDate(exp)
})

const fetchSubscriptionInfo = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const [subRes] = await Promise.allSettled([userApi.getSubscribe()])
    if (subRes.status === 'fulfilled') {
      subscribe.value = subRes.value.data
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
  const sub = subscribe.value
  const attributes: Record<string, string | number | boolean> = {
    email,
    // 服务端注入的运行时身份属性（最终仍受白名单过滤）
    ...(runtimeIdentity?.attributes || {}),
  }

  if (user) {
    if (user.uuid) attributes.user_id = user.uuid
    attributes.balance = formatMoney(user.balance)
    attributes.commission_balance = formatMoney(user.commission_balance)
    attributes.account_status = user.banned ? '已封禁' : '正常'
    attributes.telegram = user.telegram_id ? '已绑定' : '未绑定'
    if (user.created_at) attributes.registered_at = formatDate(user.created_at)
    if (user.last_login_at) attributes.last_login_at = formatDate(user.last_login_at)
    if (user.plan_id !== null && user.plan_id !== undefined) attributes.plan_id = user.plan_id
    if (user.discount !== null && user.discount !== undefined) attributes.discount = user.discount
    if (user.commission_rate !== null && user.commission_rate !== undefined) {
      attributes.commission_rate = user.commission_rate
    }
    if (user.auto_renewal !== undefined) attributes.auto_renewal = user.auto_renewal ? '是' : '否'
    if (user.device_limit !== null && user.device_limit !== undefined) {
      attributes.device_limit = user.device_limit
    }
  }

  if (planName.value) attributes.plan_name = planName.value
  if (sub?.plan_id !== null && sub?.plan_id !== undefined) attributes.plan_id = sub.plan_id
  if (user || sub) attributes.expired_at = expireText.value
  if (sub) {
    attributes.used_traffic = usedTraffic.value
    attributes.total_traffic = totalTraffic.value
    if (sub.device_limit !== null && sub.device_limit !== undefined) {
      attributes.device_limit = sub.device_limit
    }
    if (sub.speed_limit !== null && sub.speed_limit !== undefined) {
      attributes.speed_limit = sub.speed_limit > 0 ? `${sub.speed_limit} Mbps` : '不限速'
    }
    if (sub.next_reset_at) attributes.next_reset_at = formatDate(sub.next_reset_at)
    if (sub.reset_day !== null && sub.reset_day !== undefined) attributes.reset_day = sub.reset_day
    if (sub.alive_ip !== null && sub.alive_ip !== undefined) attributes.online_devices = sub.alive_ip
    if (sub.allow_new_period !== undefined) attributes.reset_allowed = sub.allow_new_period ? '是' : '否'
  }

  return {
    id: runtimeIdentity?.user_id || user?.uuid || email,
    hash: runtimeIdentity?.hash || config.tawk_secure_hash,
    name: runtimeIdentity?.name || (user?.email ? user.email.split('@')[0] : undefined),
    email,
    avatar: runtimeIdentity?.avatar || resolveAvatarUrl(user) || undefined,
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
  // 拉取套餐信息，加载后 visitor 重新计算并同步到客服侧
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

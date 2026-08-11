<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
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

const visitor = computed<CustomerServiceVisitor | undefined>(() => {
  if (config.identify_user === false) return undefined
  const user = userStore.user
  const runtimeIdentity = window.customerServiceIdentity
  if (!user && !runtimeIdentity) return undefined

  const email = runtimeIdentity?.email || user?.email || ''
  return {
    id: runtimeIdentity?.user_id || user?.uuid || email,
    hash: runtimeIdentity?.hash || config.tawk_secure_hash,
    name: runtimeIdentity?.name || email,
    email,
    avatar: runtimeIdentity?.avatar || user?.avatar_url || '',
    attributes: {
      ...(runtimeIdentity?.attributes || {}),
      ...(user?.plan_id ? { plan_id: user.plan_id } : {}),
    },
  }
})

const routeAllowsWidget = computed(() => {
  if (config.hide_on_mobile && isMobile.value) return false
  const path = route.path
  if (matchesCustomerServiceRoute(path, config.hide_on_routes)) return false
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
})

onMounted(() => {
  window.stellarCustomerService = publicApi
  mobileMedia.addEventListener('change', handleMobileChange)
  scheduleLoad()
})

onBeforeUnmount(() => {
  cancelScheduledLoad()
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

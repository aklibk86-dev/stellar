<template>
  <router-view />
  <Transition name="stellar-page-loader-fade">
    <div
      v-if="showInitialLoader"
      class="stellar-page-loader"
      role="status"
      :aria-label="t('common.loading')"
    >
      <span class="stellar-page-loader__spinner" aria-hidden="true"></span>
    </div>
  </Transition>
  <Transition name="stellar-route-progress-fade">
    <div
      v-if="showRouteProgress"
      class="stellar-route-progress"
      role="progressbar"
      :aria-label="t('common.loading')"
    >
      <span class="stellar-route-progress__bar"></span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isRouteLoading } from '@/router'

const route = useRoute()
const { t, locale } = useI18n()
const showInitialLoader = ref(isRouteLoading.value)
const showRouteProgress = ref(false)
let routeProgressTimer: number | undefined

watch(isRouteLoading, (loading) => {
  if (showInitialLoader.value) {
    if (!loading) showInitialLoader.value = false
    return
  }

  if (routeProgressTimer) window.clearTimeout(routeProgressTimer)
  if (loading) {
    // Fast navigations should feel instant instead of flashing a blocking overlay.
    routeProgressTimer = window.setTimeout(() => {
      showRouteProgress.value = true
    }, 120)
  } else {
    showRouteProgress.value = false
  }
})

function updateDocumentTitle() {
  const titleKey = route.meta.title as string
  let pageTitle = titleKey || ''
  if (titleKey && /^[a-z_]+$/.test(titleKey)) {
    pageTitle = t(`nav.${titleKey}`)
  }
  document.title = `${pageTitle} - ${window.settings?.title || 'Stellar'}`
}

watch(locale, updateDocumentTitle)

onBeforeUnmount(() => {
  if (routeProgressTimer) window.clearTimeout(routeProgressTimer)
})
</script>

<style scoped>
.stellar-route-progress {
  position: fixed;
  inset: 0 0 auto;
  height: 2px;
  z-index: 10000;
  pointer-events: none;
  overflow: hidden;
}

.stellar-route-progress__bar {
  display: block;
  width: 38%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--stellar-primary), #60a5fa);
  box-shadow: 0 0 12px var(--stellar-primary);
  animation: stellar-route-progress 1.1s ease-in-out infinite;
}

.stellar-route-progress-fade-enter-active,
.stellar-route-progress-fade-leave-active { transition: opacity .16s ease; }
.stellar-route-progress-fade-enter-from,
.stellar-route-progress-fade-leave-to { opacity: 0; }

@keyframes stellar-route-progress {
  from { transform: translateX(-110%); }
  to { transform: translateX(285%); }
}
</style>

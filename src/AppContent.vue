<template>
  <router-view />
  <Transition name="stellar-page-loader-fade">
    <div
      v-if="isRouteLoading"
      class="stellar-page-loader"
      role="status"
      :aria-label="t('common.loading')"
    >
      <span class="stellar-page-loader__spinner" aria-hidden="true"></span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isRouteLoading } from '@/router'

const route = useRoute()
const { t, locale } = useI18n()

function updateDocumentTitle() {
  const titleKey = route.meta.title as string
  let pageTitle = titleKey || ''
  if (titleKey && /^[a-z_]+$/.test(titleKey)) {
    pageTitle = t(`nav.${titleKey}`)
  }
  document.title = `${pageTitle} - ${window.settings?.title || 'Stellar'}`
}

watch(locale, updateDocumentTitle)
</script>

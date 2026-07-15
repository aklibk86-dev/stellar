<template>
  <router-view />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

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

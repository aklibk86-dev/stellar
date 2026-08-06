<script setup lang="ts">
import { onMounted } from 'vue'

const loadScript = (src: string, provider: string) => {
  if (!src || !/^https?:\/\//i.test(src)) return
  if (document.querySelector(`script[data-stellar-customer-service="${provider}"]`)) return

  const script = document.createElement('script')
  script.async = true
  script.src = src
  script.dataset.stellarCustomerService = provider
  document.head.appendChild(script)
}

onMounted(() => {
  const config = window.settings?.customer_service
  if (!config?.enabled) return

  if (config.provider === 'tawk') {
    const propertyId = config.tawk_property_id?.trim()
    const widgetId = config.tawk_widget_id?.trim() || 'default'
    if (!propertyId) return
    loadScript(`https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`, 'tawk')
    return
  }

  loadScript(config.script_url?.trim() || '', 'custom')
})
</script>

<template>
  <span class="third-party-chat" aria-hidden="true" />
</template>

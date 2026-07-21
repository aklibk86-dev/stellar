<template>
  <!-- 页脚代码注入（非脚本内容通过 v-html 渲染） -->
  <div v-if="footerHtml" key="footer-code" class="stellar-footer-code" v-html="footerHtml" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import DOMPurify from 'dompurify'

const headerCode = computed(() => window.settings?.header_code || '')
const footerCode = computed(() => window.settings?.footer_code || '')
const footerHtml = ref('')

function sanitizeCode(code: string): string {
  return DOMPurify.sanitize(code, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    ADD_ATTR: ['target'],
  })
}

function injectHeaderCode(code: string) {
  if (!code) return
  const clean = sanitizeCode(code)
  if (clean) {
    document.head.insertAdjacentHTML('beforeend', clean)
  }
}

function setupFooterCode(code: string) {
  if (!code) return
  const clean = sanitizeCode(code)
  footerHtml.value = clean
}

onMounted(() => {
  injectHeaderCode(headerCode.value)
  setupFooterCode(footerCode.value)
})
</script>

<style scoped>
.stellar-footer-code {
  /* 页脚代码保持可见，由用户自定义样式控制 */
}
</style>

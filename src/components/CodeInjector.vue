<template>
  <!-- 页脚代码注入（非脚本内容通过 v-html 渲染） -->
  <div v-if="footerHtml" key="footer-code" class="stellar-footer-code" v-html="footerHtml" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const headerCode = computed(() => window.settings?.header_code || '')
const footerCode = computed(() => window.settings?.footer_code || '')
const footerHtml = ref('')

/**
 * 解析 HTML 字符串，分离脚本和非脚本内容。
 * 返回 { scripts: HTMLScriptElement[], html: string }
 */
function parseCode(code: string) {
  const container = document.createElement('div')
  container.innerHTML = code
  const scripts: HTMLScriptElement[] = []
  const htmlParts: string[] = []

  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.tagName === 'SCRIPT') {
        scripts.push(el as HTMLScriptElement)
      } else {
        htmlParts.push(el.outerHTML)
      }
    } else if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) {
      htmlParts.push((node as Text | Comment).textContent || '')
    }
  })

  return { scripts, html: htmlParts.join('') }
}

/**
 * 注入一组 <script> 元素到指定容器末尾，确保脚本能正确执行。
 */
function injectScripts(scripts: HTMLScriptElement[], parent: HTMLElement) {
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value)
    })
    if (oldScript.textContent) {
      newScript.textContent = oldScript.textContent
    }
    parent.appendChild(newScript)
  })
}

/**
 * 将自定义代码注入到 <head> 中。
 * 支持 <script>、<style>、<link>、<meta> 等标签。
 */
function injectHeaderCode(code: string) {
  if (!code) return
  const { scripts, html } = parseCode(code)

  // 注入非脚本内容到 <head>
  if (html) {
    document.head.insertAdjacentHTML('beforeend', html)
  }
  // 注入脚本到 <head>
  if (scripts.length > 0) {
    injectScripts(scripts, document.head)
  }
}

/**
 * 处理页脚代码：非脚本部分通过 v-html 渲染，脚本部分注入到页面底部。
 */
function setupFooterCode(code: string) {
  if (!code) return
  const { scripts, html } = parseCode(code)

  // 非脚本部分给模板 v-html 渲染
  footerHtml.value = html

  // 脚本部分注入到 <body> 末尾
  if (scripts.length > 0) {
    // 使用 nextTick 确保 DOM 已渲染
    nextTick(() => {
      injectScripts(scripts, document.body)
    })
  }
}

onMounted(() => {
  // 注入页头代码到 <head>
  injectHeaderCode(headerCode.value)
  // 处理页脚代码
  setupFooterCode(footerCode.value)
})
</script>

<style scoped>
.stellar-footer-code {
  /* 页脚代码保持可见，由用户自定义样式控制 */
}
</style>

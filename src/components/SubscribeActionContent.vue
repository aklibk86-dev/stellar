<template>
  <div ref="contentRef" class="prose" v-html="renderedContent"></div>
  <SubscribeImportModal v-model:show="showImportModal" :subscribe-url="effectiveSubscribeUrl" />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDialog, useMessage } from 'naive-ui'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Subscribe } from '@/api/types'
import { renderContent } from '@/utils/safe'
import { STELLAR_COPY_TAG, STELLAR_IMPORT_TAG } from '@/utils/sanitize'
import SubscribeImportModal from '@/components/SubscribeImportModal.vue'

const props = defineProps<{
  content: string | null | undefined
  subscribeUrl?: string
  hasSubscription?: boolean
}>()

const router = useRouter()
const { t } = useI18n()
const dialog = useDialog()
const message = useMessage()
const userStore = useUserStore()

const contentRef = ref<HTMLElement | null>(null)
const showImportModal = ref(false)
const localSubscribe = ref<Subscribe | null>(null)

// HTML 没有真正的自闭合自定义元素；先规范化简写，避免浏览器把后续正文
// 解析成 stellar-* 元素的子节点，替换按钮时误删尾部内容。
const normalizeSelfClosingMarkers = (html: string) =>
  html.replace(/<\s*(stellar-import|stellar-copy)\s*\/>/gi, '<$1></$1>')

const renderedContent = computed(() => normalizeSelfClosingMarkers(renderContent(props.content)))
const effectiveSubscribeUrl = computed(() => props.subscribeUrl ?? localSubscribe.value?.subscribe_url ?? '')
const localHasSubscription = computed(() => {
  const currentUser = userStore.user
  if (!currentUser?.plan_id) return false
  const expiresAt = currentUser.expired_at
  return expiresAt === null || expiresAt === undefined || expiresAt === 0
    || expiresAt >= Math.floor(Date.now() / 1000)
})
const effectiveHasSubscription = computed(() => props.hasSubscription ?? localHasSubscription.value)

const fetchSubscribe = async () => {
  try {
    const res = await userApi.getSubscribe()
    localSubscribe.value = res.data
  } catch (error: any) {
    localSubscribe.value = null
    console.warn('[SubscribeActionContent] Failed to load subscription:', error?.status || error?.message)
  }
}

const goToPlans = () => {
  router.push({ name: 'plans' })
}

const showSubscriptionDialog = () => {
  dialog.warning({
    title: t('knowledge.subscriptionDialogTitle'),
    content: t('knowledge.subscriptionDialogContent'),
    positiveText: t('knowledge.purchasePlan'),
    negativeText: t('common.cancel'),
    onPositiveClick: goToPlans,
  })
}

const handleImportClick = () => {
  if (!effectiveSubscribeUrl.value) {
    if (!effectiveHasSubscription.value) {
      showSubscriptionDialog()
    } else {
      message.warning(t('knowledge.importFailedTip'))
    }
    return
  }
  showImportModal.value = true
}

const fallbackCopyText = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

const handleCopySubscribe = async () => {
  const url = effectiveSubscribeUrl.value
  if (!url) {
    if (!effectiveHasSubscription.value) {
      showSubscriptionDialog()
    } else {
      message.warning(t('dashboard.noSubscribeUrl'))
    }
    return
  }
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
    } else if (!fallbackCopyText(url)) {
      throw new Error('Copy failed')
    }
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

const createActionButton = (label: string, handler: () => void): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'sii-btn'
  button.textContent = label
  button.addEventListener('click', handler)
  return button
}

const createImportButton = () => {
  const button = createActionButton(t('knowledge.oneClickImportAction'), handleImportClick)
  button.dataset.siiAction = 'import'
  return button
}

const createCopyButton = () => {
  const button = createActionButton(t('knowledge.copySubscribe'), handleCopySubscribe)
  button.dataset.siiAction = 'copy'
  return button
}

const markerDefinitions = [
  {
    tag: STELLAR_IMPORT_TAG,
    open: `<${STELLAR_IMPORT_TAG}>`,
    close: `</${STELLAR_IMPORT_TAG}>`,
    selfClosing: `<${STELLAR_IMPORT_TAG} />`,
    createButton: createImportButton,
  },
  {
    tag: STELLAR_COPY_TAG,
    open: `<${STELLAR_COPY_TAG}>`,
    close: `</${STELLAR_COPY_TAG}>`,
    selfClosing: `<${STELLAR_COPY_TAG} />`,
    createButton: createCopyButton,
  },
]

const enhanceMarkers = () => {
  const content = contentRef.value
  if (!content) return
  let guard = 0
  let needsRescan = true
  while (needsRescan && guard++ < 8) {
    needsRescan = false
    markerDefinitions.forEach((definition) => {
      content.querySelectorAll(definition.tag).forEach((marker) => {
        marker.replaceWith(definition.createButton())
      })
    })

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text)
    let splitTail = false
    for (const node of textNodes) {
      let match: { definition: (typeof markerDefinitions)[number]; start: number; end: number } | null = null
      for (const candidate of markerDefinitions) {
        const pairedOpen = node.data.indexOf(candidate.open)
        if (pairedOpen !== -1) {
          const pairedClose = node.data.indexOf(candidate.close, pairedOpen + candidate.open.length)
          if (pairedClose !== -1) {
            const candidateMatch = {
              definition: candidate,
              start: pairedOpen,
              end: pairedClose + candidate.close.length,
            }
            if (!match || candidateMatch.start < match.start) match = candidateMatch
          }
        }
        const selfClosing = node.data.indexOf(candidate.selfClosing)
        if (selfClosing !== -1) {
          const candidateMatch = {
            definition: candidate,
            start: selfClosing,
            end: selfClosing + candidate.selfClosing.length,
          }
          if (!match || candidateMatch.start < match.start) match = candidateMatch
        }
      }
      if (!match) continue
      const { definition, start, end } = match
      const parent = node.parentNode
      if (!parent) continue
      const fragment = document.createDocumentFragment()
      const before = node.data.slice(0, start)
      const tail = node.data.slice(end)
      if (before) fragment.appendChild(document.createTextNode(before))
      fragment.appendChild(definition.createButton())
      if (tail) fragment.appendChild(document.createTextNode(tail))
      parent.replaceChild(fragment, node)
      if (tail) splitTail = true
    }
    needsRescan = splitTail
  }
}

let observer: MutationObserver | null = null
const attachObserver = () => {
  observer?.disconnect()
  observer = null
  if (!contentRef.value) return
  observer = new MutationObserver(enhanceMarkers)
  observer.observe(contentRef.value, { childList: true, subtree: true })
}

watch(contentRef, (content, previous) => {
  if (previous && previous !== content) observer?.disconnect()
  if (content) {
    void nextTick(() => {
      enhanceMarkers()
      attachObserver()
    })
  }
})
watch(renderedContent, () => {
  void nextTick(() => {
    enhanceMarkers()
    attachObserver()
  })
})
watch(() => t('knowledge.oneClickImportAction'), () => void nextTick(enhanceMarkers))

onMounted(async () => {
  if (props.subscribeUrl === undefined) {
    await userStore.fetchUser()
    await fetchSubscribe()
  }
  await nextTick(() => {
    enhanceMarkers()
    attachObserver()
  })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

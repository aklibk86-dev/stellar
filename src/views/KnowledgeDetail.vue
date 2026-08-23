<template>
  <div class="knowledge-detail-page">
    <!-- 顶部导航条 -->
    <div class="detail-nav">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>{{ t('knowledge.backToList') }}</span>
      </button>

      <!-- 文档内导航: 上一篇 / 下一篇 -->
      <div class="doc-nav" v-if="doc">
        <button
          class="doc-nav-btn"
          :class="{ disabled: !prevDoc }"
          :disabled="!prevDoc"
          @click="goDoc(prevDoc!.id)"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span class="doc-nav-label">{{ t('knowledge.prevDoc') }}</span>
          <span class="doc-nav-name">{{ prevDoc ? prevDoc.title : '—' }}</span>
        </button>
        <button
          class="doc-nav-btn doc-nav-btn--next"
          :class="{ disabled: !nextDoc }"
          :disabled="!nextDoc"
          @click="goDoc(nextDoc!.id)"
        >
          <span class="doc-nav-name">{{ nextDoc ? nextDoc.title : '—' }}</span>
          <span class="doc-nav-label">{{ t('knowledge.nextDoc') }}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="subscriptionLoading" class="state-box">
      <span class="loading-dot"></span>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="!canViewKnowledge" class="state-box subscription-required">
      <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M8 15h3" />
      </svg>
      <p>{{ t('knowledge.subscriptionRequired') }}</p>
      <button class="back-list-btn" type="button" @click="goToPlans">{{ t('knowledge.purchasePlan') }}</button>
    </div>

    <div v-else-if="loading" class="state-box">
      <span class="loading-dot"></span>
      <span>{{ t('common.loading') }}</span>
    </div>

    <!-- 未找到 -->
    <div v-else-if="!doc" class="state-box state-box--empty">
      <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      <p>{{ allDocs.length === 0 ? t('knowledge.noDocs') : t('knowledge.docNotFound') }}</p>
      <button class="back-list-btn" @click="goBack">{{ t('knowledge.backToList') }}</button>
    </div>

    <!-- 文档内容 -->
    <article v-else class="doc-article">
      <!-- 文章头部 -->
      <header class="article-header">
        <div class="article-header-top">
          <n-tag size="small" round :bordered="false" class="article-category">
            {{ getCategoryName(doc.category) }}
          </n-tag>
          <span class="article-date">
            {{ t('knowledge.lastUpdate') }}: {{ formatDate(doc.updated_at) }}
          </span>
        </div>
        <h1 class="article-title">{{ doc.title }}</h1>
      </header>

      <!-- 文章正文（正文中的 <stellar-import> 标记会在渲染后被替换为一键导入组件） -->
      <div ref="articleRef" class="prose" v-html="renderContent(doc.body)"></div>

      <!-- 底部翻页 -->
      <footer class="article-footer">
        <button
          class="footer-nav"
          :class="{ disabled: !prevDoc }"
          :disabled="!prevDoc"
          @click="goDoc(prevDoc!.id)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span class="footer-nav-text">
            <span class="footer-nav-label">{{ t('knowledge.prevDoc') }}</span>
            <span class="footer-nav-name">{{ prevDoc ? prevDoc.title : '—' }}</span>
          </span>
        </button>
        <button
          class="footer-nav footer-nav--next"
          :class="{ disabled: !nextDoc }"
          :disabled="!nextDoc"
          @click="goDoc(nextDoc!.id)"
        >
          <span class="footer-nav-text">
            <span class="footer-nav-label">{{ t('knowledge.nextDoc') }}</span>
            <span class="footer-nav-name">{{ nextDoc ? nextDoc.title : '—' }}</span>
          </span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </footer>
    </article>

    <!-- 正文内嵌"一键导入"标记触发的导入弹窗（复用仪表盘同款，30+ 客户端 + 二维码） -->
    <SubscribeImportModal v-model:show="showImportModal" :subscribe-url="subscribeUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NTag, useDialog, useMessage } from 'naive-ui'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Knowledge, KnowledgeCategory, Subscribe } from '@/api/types'
import { formatDate } from '@/utils/format'
import { renderContent } from '@/utils/safe'
import { STELLAR_IMPORT_TAG } from '@/utils/sanitize'
import SubscribeImportModal from '@/components/SubscribeImportModal.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const dialog = useDialog()
const message = useMessage()

const allDocs = ref<Knowledge[]>([])
const categories = ref<KnowledgeCategory[]>([])
const loading = ref(true)
const subscriptionLoading = ref(true)
const userStore = useUserStore()
const requiresSubscription = computed(() => window.settings?.knowledge_require_subscription !== false)

const hasSubscription = computed(() => {
  const currentUser = userStore.user
  if (!currentUser?.plan_id) return false
  const expiresAt = currentUser.expired_at
  return expiresAt === null || expiresAt === undefined || expiresAt === 0
    || expiresAt >= Math.floor(Date.now() / 1000)
})
const canViewKnowledge = computed(() => !requiresSubscription.value || hasSubscription.value)

// 当前文档 ID (统一转为字符串进行比较,避免后端返回 number/string 不一致)
const docId = computed(() => String(route.params.id ?? ''))

// 当前文档
const doc = computed(() => allDocs.value.find(d => String(d.id) === docId.value) || null)

// 当前文档在所属分类中的索引(用于上下篇计算)
const currentDocList = computed(() => {
  if (!doc.value) return [] as Knowledge[]
  // 同分类文档列表
  return allDocs.value.filter(d => d.category === doc.value!.category)
})

const currentDocIndex = computed(() =>
  currentDocList.value.findIndex(d => String(d.id) === docId.value),
)

const prevDoc = computed(() => {
  const idx = currentDocIndex.value
  if (idx <= 0) return null
  return currentDocList.value[idx - 1]
})

const nextDoc = computed(() => {
  const idx = currentDocIndex.value
  if (idx < 0 || idx >= currentDocList.value.length - 1) return null
  return currentDocList.value[idx + 1]
})

// 获取分类名
const getCategoryName = (category: string): string => {
  const cat = categories.value.find(c => c.category === category)
  return cat?.name || category
}

// ===== 正文内嵌"一键导入"标记 =====
// 写文档时在正文任意位置放 <stellar-import></stellar-import>，
// 渲染后自动替换为"一键导入订阅"组件，点击弹出 SubscribeImportModal。
const articleRef = ref<HTMLElement | null>(null)
const showImportModal = ref(false)
const subscribe = ref<Subscribe | null>(null)
const subscribeUrl = computed(() => subscribe.value?.subscribe_url || '')
const MARKER_OPEN = `<${STELLAR_IMPORT_TAG}>`
const MARKER_CLOSE = `</${STELLAR_IMPORT_TAG}>`

// 获取用户订阅信息（用于拼接导入弹窗的订阅地址）
const fetchSubscribe = async () => {
  try {
    const res = await userApi.getSubscribe()
    subscribe.value = res.data
  } catch (e: any) {
    // 静默失败：不影响文档阅读，仅导入按钮在无订阅地址时引导购买
    console.warn('[KnowledgeDetail] 获取订阅信息失败:', e?.status || e?.message)
    subscribe.value = null
  }
}

// 一键导入按钮点击：有订阅地址 → 打开导入弹窗；否则引导购买套餐
const handleImportClick = () => {
  if (!subscribeUrl.value) {
    if (!hasSubscription.value) {
      showSubscriptionDialog()
    } else {
      message.warning(t('knowledge.importFailedTip'))
    }
    return
  }
  showImportModal.value = true
}

// 构建替换 <stellar-import> 的组件 HTML（文案为 i18n 静态字符串，安全）
const buildImportWidgetHtml = (): string => `
  <span class="sii-icon">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  </span>
  <span class="sii-copy">
    <strong class="sii-title">${t('knowledge.oneClickImport')}</strong>
    <span class="sii-desc">${t('knowledge.oneClickImportDesc')}</span>
  </span>
  <button type="button" class="sii-btn">${t('knowledge.oneClickImportAction')}</button>
`

// 创建导入组件 DOM（样式由 .prose :deep(.stellar-import-widget) 控制）
const createImportWidget = (): HTMLDivElement => {
  const host = document.createElement('div')
  host.className = 'stellar-import-widget'
  host.innerHTML = buildImportWidgetHtml()
  host.querySelector('button')?.addEventListener('click', handleImportClick)
  return host
}

// 把正文中的 <stellar-import> 标记逐个替换为导入组件。
// 兼容两种后端存储形态：
// 1) 标记以真实元素到达（内容未转义）→ querySelectorAll 直接替换；
// 2) 标记被后端 HTML 转义为纯文本（&lt;stellar-import&gt;…）→ 扫描文本节点替换。
// 文本替换会拆分出新的尾段文本节点（可能仍含标记），因此循环重扫直到没有标记为止；
// 每次循环至少消耗一个标记、不产生新标记，必然收敛（guard 防呆）。
const enhanceImportWidgets = () => {
  const article = articleRef.value
  if (!article) return
  let guard = 0
  let needsRescan = true
  while (needsRescan && guard++ < 8) {
    needsRescan = false
    // 1) 真实元素标记（一次处理全部）
    article.querySelectorAll(STELLAR_IMPORT_TAG).forEach((marker) => {
      marker.replaceWith(createImportWidget())
    })
    // 2) 文本标记（转义形态：渲染后是字面 <stellar-import>…</stellar-import>，
    //    一次处理全部；拆分出的 tail 若仍含标记则下一轮重扫）
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text)
    let splitTail = false
    for (const node of textNodes) {
      const open = node.data.indexOf(MARKER_OPEN)
      if (open === -1) continue
      const close = node.data.indexOf(MARKER_CLOSE, open + MARKER_OPEN.length)
      if (close === -1) continue
      const before = node.data.slice(0, open)
      const tail = node.data.slice(close + MARKER_CLOSE.length)
      const parent = node.parentNode
      if (!parent) continue
      const frag = document.createDocumentFragment()
      if (before) frag.appendChild(document.createTextNode(before))
      frag.appendChild(createImportWidget())
      if (tail) frag.appendChild(document.createTextNode(tail))
      parent.replaceChild(frag, node)
      if (tail) splitTail = true
    }
    needsRescan = splitTail
  }
}

// MutationObserver 兜底：v-html 重渲染、路由复用等任何时序差异都会触发重新增强。
// 幂等：正文没有标记时不做任何 DOM 修改，不会死循环。
let articleObserver: MutationObserver | null = null
const attachArticleObserver = () => {
  articleObserver?.disconnect()
  articleObserver = null
  const article = articleRef.value
  if (!article) return
  articleObserver = new MutationObserver(() => enhanceImportWidgets())
  articleObserver.observe(article, { childList: true, subtree: true })
}

// 文章元素真正挂载时（ref 从 null → 元素）注入组件并挂上观察者。
// 关键：页面加载期间 subscriptionLoading 先为 true，文章要到最后才渲染，
// 仅监听 doc.body 会在文章尚未存在时提前空跑、且观察者挂不上去，
// 导致文章渲染出来后没有任何触发点（表现为：标记留在 DOM、组件永远不出现）。
watch(articleRef, (article, prev) => {
  if (prev && prev !== article) articleObserver?.disconnect()
  if (article) {
    void nextTick(() => {
      enhanceImportWidgets()
      attachArticleObserver()
    })
  }
})

// v-html 重渲染 / 语言切换 / 文档切换后重新注入组件
watch(() => doc.value?.body, () => {
  void nextTick(() => {
    enhanceImportWidgets()
    attachArticleObserver()
  })
})
watch(() => locale.value, () => void nextTick(enhanceImportWidgets))
watch(() => route.params.id, () => void nextTick(enhanceImportWidgets))
onBeforeUnmount(() => articleObserver?.disconnect())

// 加载所有文档(API 无单文档接口,从列表接口筛选)
const fetchAll = async () => {
  loading.value = true
  try {
    // 获取文档列表(关键) - 传 language=zh-CN 才能返回对应语言文档
    const docRes = await userApi.getKnowledge(undefined, locale.value)
    const rawData = docRes.data
    let docs: Knowledge[] = []
    if (Array.isArray(rawData)) {
      docs = rawData
    } else if (rawData && typeof rawData === 'object') {
      for (const [, groupDocs] of Object.entries(rawData)) {
        if (Array.isArray(groupDocs)) docs.push(...groupDocs)
      }
    }
    allDocs.value = docs

    // 从文章数据中提取分类
    if (docs.length > 0) {
      const catMap: Record<string, string> = {}
      for (const d of docs) {
        if (d.category && !catMap[d.category]) catMap[d.category] = d.category
      }
      categories.value = Object.keys(catMap).map((cat, i) => ({
        id: i + 1,
        category: cat,
        name: cat,
      }))
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    // 后端接口异常(500/404 等): 静默处理,allDocs 保持为空,页面显示"暂无文档"
    console.warn('[KnowledgeDetail] 加载文档失败:', e?.status || e?.message)
    allDocs.value = []
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push({ name: 'knowledge' })
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

// 跳转到另一篇文档
const goDoc = (id: number) => {
  router.push({ name: 'knowledge-detail', params: { id } })
}

// 监听路由参数变化(同一组件复用时)
watch(() => route.params.id, (newId) => {
  if (newId && !loading.value) {
    // 数据已加载,只滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

onMounted(async () => {
  try {
    await userStore.fetchUser(true)
    if (canViewKnowledge.value) {
      await Promise.all([fetchAll(), fetchSubscribe()])
    } else {
      showSubscriptionDialog()
    }
  } finally {
    subscriptionLoading.value = false
    if (!hasSubscription.value) loading.value = false
  }
})
</script>

<style scoped>
.knowledge-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部导航条 */
.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--stellar-border);
  background: var(--stellar-bg-card);
  color: var(--stellar-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
}
.back-btn:hover {
  background: var(--stellar-bg-hover);
  border-color: var(--stellar-primary);
  color: var(--stellar-primary);
}

/* 文档内导航: 上一篇 / 下一篇 */
.doc-nav {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.doc-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--stellar-border);
  background: var(--stellar-bg-card);
  color: var(--stellar-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  max-width: 280px;
}
.doc-nav-btn:hover:not(.disabled) {
  background: var(--stellar-bg-hover);
  border-color: var(--stellar-primary);
  color: var(--stellar-primary);
}
.doc-nav-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.doc-nav-btn--next {
  text-align: right;
}
.doc-nav-label {
  font-size: 10.5px;
  color: var(--stellar-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.doc-nav-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--stellar-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
.doc-nav-btn:hover:not(.disabled) .doc-nav-name {
  color: var(--stellar-primary);
}

/* 加载/空状态 */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--stellar-text-muted);
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  text-align: center;
}
.state-box--empty svg {
  opacity: 0.4;
}
.state-box p {
  font-size: 14px;
  margin: 0;
}
.subscription-required svg {
  color: var(--stellar-primary);
  opacity: 0.8;
}
.loading-dot {
  width: 16px;
  height: 16px;
  border: 2px solid var(--stellar-border);
  border-top-color: var(--stellar-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.back-list-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--stellar-primary);
  background: var(--stellar-primary);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.back-list-btn:hover {
  opacity: 0.85;
}

/* 文档文章 */
.doc-article {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 32px 40px 40px;
}

/* 文章头部 */
.article-header {
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.article-header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.article-category {
  font-weight: 600;
}
.article-date {
  font-size: 12.5px;
  color: var(--stellar-text-muted);
}
.article-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 0;
  line-height: 1.35;
  word-break: break-word;
}

/* 文档正文 prose */
.prose {
  color: var(--stellar-text);
  line-height: 1.75;
  font-size: 14.5px;
  word-break: break-word;
}
.prose :deep(h1) {
  font-size: 26px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 28px 0 16px;
  line-height: 1.3;
}
.prose :deep(h2) {
  font-size: 22px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 26px 0 14px;
  line-height: 1.3;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.prose :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 22px 0 12px;
}
.prose :deep(h4) {
  font-size: 16px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 20px 0 10px;
}
.prose :deep(p) {
  margin: 0 0 14px;
  color: var(--stellar-text);
}
.prose :deep(a) {
  color: var(--stellar-primary);
  text-decoration: none;
  transition: opacity 0.2s;
}
.prose :deep(a:hover) {
  text-decoration: underline;
  opacity: 0.85;
}
.prose :deep(ul),
.prose :deep(ol) {
  margin: 0 0 14px;
  padding-left: 24px;
  color: var(--stellar-text);
}
.prose :deep(li) {
  margin: 4px 0;
}
.prose :deep(li::marker) {
  color: var(--stellar-text-muted);
}
.prose :deep(blockquote) {
  margin: 0 0 14px;
  padding: 12px 16px;
  border-left: 3px solid var(--stellar-primary);
  background: var(--stellar-bg-hover);
  border-radius: 0 8px 8px 0;
  color: var(--stellar-text-secondary);
}
.prose :deep(blockquote p) {
  margin: 0;
}
.prose :deep(code) {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--stellar-bg-hover);
  color: var(--stellar-accent);
}
.prose :deep(pre) {
  margin: 0 0 14px;
  padding: 16px;
  border-radius: 8px;
  background: var(--stellar-bg);
  border: 1px solid var(--stellar-border);
  overflow-x: auto;
}
.prose :deep(pre code) {
  padding: 0;
  background: transparent;
  color: var(--stellar-text);
  font-size: 13px;
  line-height: 1.6;
}
.prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}
.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 14px;
  font-size: 13px;
}
.prose :deep(th),
.prose :deep(td) {
  padding: 10px 12px;
  border: 1px solid var(--stellar-border);
  text-align: left;
}
.prose :deep(th) {
  background: var(--stellar-bg-hover);
  font-weight: 600;
  color: var(--stellar-text);
}
.prose :deep(td) {
  color: var(--stellar-text);
}
.prose :deep(hr) {
  border: none;
  border-top: 1px solid var(--stellar-border-light);
  margin: 20px 0;
}
.prose :deep(strong) {
  font-weight: 700;
  color: var(--stellar-text);
}

/* 正文内嵌"一键导入"组件（替换 <stellar-import> 标记生成） */
.prose :deep(.stellar-import-widget) {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 18px 0;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--stellar-primary) 32%, var(--stellar-border));
  border-radius: 12px;
  background: linear-gradient(135deg, var(--stellar-primary-light) 0%, var(--stellar-bg-card) 70%);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}
.prose :deep(.sii-icon) {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: var(--stellar-primary);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--stellar-primary) 26%, transparent);
}
.prose :deep(.sii-copy) {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.prose :deep(.sii-title) {
  color: var(--stellar-text);
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.4;
}
.prose :deep(.sii-desc) {
  color: var(--stellar-text-muted);
  font-size: 12px;
  line-height: 1.55;
}
.prose :deep(.sii-btn) {
  flex-shrink: 0;
  padding: 9px 16px;
  border: 0;
  border-radius: 8px;
  background: var(--stellar-primary);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.prose :deep(.sii-btn:hover) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.prose :deep(.sii-btn:focus-visible) {
  outline: 2px solid var(--stellar-primary);
  outline-offset: 2px;
}

/* 底部翻页 */
.article-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--stellar-border-light);
}
.footer-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--stellar-border);
  background: var(--stellar-bg-card);
  color: var(--stellar-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  flex: 1;
  max-width: calc(50% - 6px);
  text-align: left;
}
.footer-nav--next {
  text-align: right;
  justify-content: flex-end;
}
.footer-nav:hover:not(.disabled) {
  background: var(--stellar-bg-hover);
  border-color: var(--stellar-primary);
  color: var(--stellar-primary);
  transform: translateY(-1px);
}
.footer-nav.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.footer-nav-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.footer-nav-label {
  font-size: 10.5px;
  color: var(--stellar-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.footer-nav-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--stellar-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.footer-nav:hover:not(.disabled) .footer-nav-name {
  color: var(--stellar-primary);
}

/* 移动端 */
@media (max-width: 767px) {
  .detail-nav {
    flex-direction: column;
    align-items: stretch;
  }
  .doc-nav {
    justify-content: stretch;
  }
  .doc-nav-btn {
    flex: 1;
    max-width: none;
  }
  .doc-nav-name {
    max-width: 100px;
  }

  .doc-article {
    padding: 20px 18px 24px;
  }
  .article-title {
    font-size: 22px;
  }

  /* 底部翻页: 移动端垂直堆叠 */
  .article-footer {
    flex-direction: column;
    gap: 8px;
  }
  .footer-nav {
    max-width: none;
  }
  .footer-nav--next {
    text-align: left;
    justify-content: flex-start;
  }

  /* 移动端: 一键导入组件垂直堆叠 */
  .prose :deep(.stellar-import-widget) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    padding: 14px;
  }
  .prose :deep(.sii-icon) {
    margin: 0 auto;
  }
  .prose :deep(.sii-desc) {
    padding: 0 4px;
  }
  .prose :deep(.sii-btn) {
    width: 100%;
    margin-top: 4px;
  }
}
</style>

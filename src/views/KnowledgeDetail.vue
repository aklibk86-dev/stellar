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

      <!-- 文章正文（正文中的 <stellar-import> 标记会在渲染后被替换为一键导入按钮） -->
      <SubscribeActionContent
        :content="doc.body"
        :subscribe-url="subscribeUrl"
        :has-subscription="hasSubscription"
      />

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NTag, useDialog } from 'naive-ui'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Knowledge, KnowledgeCategory, Subscribe } from '@/api/types'
import { formatDate } from '@/utils/format'
import SubscribeActionContent from '@/components/SubscribeActionContent.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const dialog = useDialog()

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

// ===== 正文内嵌订阅操作标记 =====
// <stellar-import> 保留一键导入语义，<stellar-copy> 仅生成复制订阅按钮。
const subscribe = ref<Subscribe | null>(null)
const subscribeUrl = computed(() => subscribe.value?.subscribe_url || '')

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

}
</style>

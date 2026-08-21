<template>
  <div class="knowledge-page">
    <!-- 页面标题 + 搜索框 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('knowledge.title') }}</h2>
        <p class="page-sub">{{ t('knowledge.subtitle') }}</p>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <n-input
        v-model:value="keyword"
        :placeholder="t('knowledge.search')"
        clearable
        size="large"
        class="search-input"
      >
        <template #prefix>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </template>
      </n-input>
    </div>

    <!-- 无数据时全页空状态 -->
    <div v-if="subscriptionLoading" class="list-loading">
      <span class="loading-dot"></span>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="!hasSubscription" class="subscription-required">
      <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.4">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M8 15h3" />
      </svg>
      <p>{{ t('knowledge.subscriptionRequired') }}</p>
      <button class="buy-plan-btn" type="button" @click="goToPlans">{{ t('knowledge.purchasePlan') }}</button>
    </div>

    <div v-else-if="!loading && categoryGroups.length === 0" class="full-empty-state">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      <p>{{ t('knowledge.noDocs') }}</p>
    </div>

    <!-- 主体:按分类分组的文档列表 -->
    <div v-else class="knowledge-body">
      <div v-if="loading" class="list-loading">
        <span class="loading-dot"></span>
        <span>{{ t('common.loading') }}</span>
      </div>
      <template v-else>
        <div
          v-for="cat in categoryGroups"
          :key="cat.category"
          class="category-card"
        >
          <div class="card-header">
            <div class="card-header-text">
              <h3 class="card-title">{{ cat.name }}</h3>
              <span class="card-subtitle">{{ cat.docs.length }} {{ t('knowledge.docsUnit') }}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="doc-grid">
              <div
                v-for="doc in cat.docs"
                :key="doc.id"
                class="doc-item"
                @click="goToDoc(doc.id)"
              >
                <div class="doc-item-top">
                  <svg class="doc-item-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span class="doc-item-title">{{ doc.title }}</span>
                </div>
                <div class="doc-item-bottom">
                  <span class="doc-item-date">{{ formatDate(doc.updated_at) }}</span>
                  <svg class="doc-item-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NInput } from 'naive-ui'
import { userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Knowledge, KnowledgeCategory } from '@/api/types'
import { formatDate } from '@/utils/format'

const router = useRouter()
const { t, locale } = useI18n()

const categories = ref<KnowledgeCategory[]>([])
const allDocs = ref<Knowledge[]>([])
const loading = ref(false)
const subscriptionLoading = ref(true)
const keyword = ref('')
const userStore = useUserStore()

const hasSubscription = computed(() => {
  const currentUser = userStore.user
  if (!currentUser?.plan_id) return false
  const expiresAt = currentUser.expired_at
  return expiresAt === null || expiresAt === undefined || expiresAt === 0
    || expiresAt >= Math.floor(Date.now() / 1000)
})

const categoryGroups = computed(() => {
  const result: { category: string; name: string; docs: Knowledge[] }[] = []
  const order = categories.value.map(c => c.category)
  const added = new Set<string>()
  for (const cat of categories.value) {
    const docs = allDocs.value.filter(d => d.category === cat.category)
    if (docs.length > 0) {
      result.push({ category: cat.category, name: cat.name, docs })
      added.add(cat.category)
    }
  }
  for (const doc of allDocs.value) {
    if (!added.has(doc.category)) {
      const docs = allDocs.value.filter(d => d.category === doc.category)
      result.push({ category: doc.category, name: doc.category, docs })
      added.add(doc.category)
    }
  }
  return result
})

const getCategoryName = (category: string): string => {
  const cat = categories.value.find(c => c.category === category)
  return cat?.name || category
}

const fetchKnowledge = async () => {
  loading.value = true
  try {
    const res = await userApi.getKnowledge(keyword.value || undefined, locale.value)
    const rawData = res.data

    let docs: Knowledge[] = []
    if (Array.isArray(rawData)) {
      docs = rawData
    } else if (rawData && typeof rawData === 'object') {
      for (const [, groupDocs] of Object.entries(rawData)) {
        if (Array.isArray(groupDocs)) {
          docs.push(...groupDocs)
        }
      }
    }

    allDocs.value = docs

    // 从文章数据中提取分类
    if (docs.length > 0) {
      const catMap: Record<string, string> = {}
      for (const doc of docs) {
        if (doc.category && !catMap[doc.category]) {
          catMap[doc.category] = doc.category
        }
      }
      categories.value = Object.keys(catMap).map((cat, i) => ({
        id: i + 1,
        category: cat,
        name: cat,
      }))
    }
  } catch (e: any) {
    console.warn('[Knowledge] 获取文档失败:', e?.status || e?.message)
    allDocs.value = []
  } finally {
    loading.value = false
  }
}

const goToDoc = (id: number) => {
  router.push({ name: 'knowledge-detail', params: { id } })
}

const goToPlans = () => {
  router.push({ name: 'plans' })
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(keyword, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (hasSubscription.value) fetchKnowledge()
  }, 350)
})

onMounted(async () => {
  try {
    await userStore.fetchUser(true)
    if (hasSubscription.value) await fetchKnowledge()
  } finally {
    subscriptionLoading.value = false
  }
})
</script>

<style scoped>
.knowledge-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 0;
}
.page-sub {
  font-size: 13px;
  color: var(--stellar-text-muted);
  margin: 0;
}

.search-section {
  width: 100%;
}
.search-input {
  width: 100%;
  --n-color: var(--stellar-bg-card) !important;
  --n-color-focus: var(--stellar-bg-card) !important;
  --n-border: 1px solid var(--stellar-border) !important;
  --n-border-hover: 1px solid var(--stellar-primary) !important;
  --n-border-focus: 1px solid var(--stellar-primary) !important;
}

.knowledge-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
  color: var(--stellar-text-muted);
  font-size: 13px;
}
.loading-dot {
  width: 14px;
  height: 14px;
  border: 2px solid var(--stellar-border);
  border-top-color: var(--stellar-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.category-card {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.card-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 0;
}
.card-subtitle {
  font-size: 12px;
  color: var(--stellar-text-muted);
  font-weight: 400;
}

.card-body {
  padding: 16px 20px;
}

.doc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.doc-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--stellar-bg-hover);
  border: 1px solid transparent;
  min-width: 0;
}
.doc-item:hover {
  background: var(--stellar-primary-light);
  border-color: rgba(59, 130, 246, 0.2);
}

.doc-item-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.doc-item-icon {
  color: var(--stellar-primary);
  flex-shrink: 0;
  opacity: 0.8;
  margin-top: 1px;
}

.doc-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--stellar-text);
  flex: 1;
  min-width: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}
.doc-item:hover .doc-item-title {
  color: var(--stellar-primary);
}

.doc-item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.doc-item-date {
  font-size: 11px;
  color: var(--stellar-text-muted);
  white-space: nowrap;
}

.doc-item-arrow {
  color: var(--stellar-text-muted);
  opacity: 0.4;
  transition: all 0.2s;
  flex-shrink: 0;
}
.doc-item:hover .doc-item-arrow {
  opacity: 1;
  transform: translateX(2px);
  color: var(--stellar-primary);
}

.full-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 100px 20px;
  color: var(--stellar-text-muted);
  text-align: center;
}

.subscription-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 88px 20px;
  color: var(--stellar-text-muted);
  text-align: center;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
}
.subscription-required svg { color: var(--stellar-primary); opacity: 0.8; }
.subscription-required p { margin: 0; font-size: 14px; }
.buy-plan-btn {
  border: 0;
  border-radius: 8px;
  padding: 9px 18px;
  background: var(--stellar-primary);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.buy-plan-btn:hover { filter: brightness(1.08); }
.full-empty-state svg {
  color: var(--stellar-text-muted);
  opacity: 0.4;
}
.full-empty-state p {
  font-size: 14px;
  margin: 0;
}

@media (max-width: 1024px) {
  .doc-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .card-body {
    padding: 12px 16px;
  }
  .doc-grid {
    grid-template-columns: 1fr;
  }
}
</style>

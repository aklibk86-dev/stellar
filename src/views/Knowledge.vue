<template>
  <div class="knowledge-page">
    <!-- 页面标题 + 搜索框 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('knowledge.title') }}</h2>
        <p class="page-sub">{{ t('knowledge.subtitle') }}</p>
      </div>
      <div class="header-right">
        <n-input
          v-model:value="keyword"
          :placeholder="t('knowledge.search')"
          clearable
          class="search-input"
        >
          <template #prefix>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </template>
        </n-input>
      </div>
    </div>

    <!-- 提示词条 -->
    <div class="tips-bar">
      <div class="tip-item" v-for="tip in knowledgeTips" :key="tip.text">
        <div class="tip-icon" :style="tip.style">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="tip.icon"></svg>
        </div>
        <span class="tip-text">{{ tip.text }}</span>
      </div>
    </div>

    <!-- 移动端:分类水平滚动标签 -->
    <div class="category-tabs">
      <div class="category-tabs-scroll">
        <div
          v-for="cat in categoryList"
          :key="cat.category"
          class="category-tab"
          :class="{ active: selectedCategory === cat.category }"
          @click="selectCategory(cat.category)"
        >
          {{ cat.name }}
        </div>
      </div>
    </div>

    <!-- 无数据时全页空状态 -->
    <div v-if="!loading && allDocs.length === 0" class="full-empty-state">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      <p>{{ t('knowledge.noDocs') }}</p>
    </div>

    <!-- 主体:左侧分类 + 右侧列表/内容 -->
    <div v-else class="knowledge-body">
      <!-- 桌面端:分类侧边栏 -->
      <aside class="category-sidebar">
        <div class="sidebar-title">{{ t('knowledge.categories') }}</div>
        <ul class="category-list">
          <li
            v-for="cat in categoryList"
            :key="cat.category"
            class="category-item"
            :class="{ active: selectedCategory === cat.category }"
            @click="selectCategory(cat.category)"
          >
            <span class="category-icon">
              <svg v-if="cat.category === 'all'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ getCategoryCount(cat.category) }}</span>
          </li>
        </ul>
      </aside>

      <!-- 文档列表 -->
      <div class="doc-list">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>
        <n-empty
          v-else-if="filteredDocs.length === 0"
          :description="t('common.noData')"
          class="doc-empty"
        />
        <template v-else>
          <div
            v-for="doc in filteredDocs"
            :key="doc.id"
            class="doc-item"
            :class="{ active: selectedDoc?.id === doc.id }"
            @click="selectDoc(doc)"
          >
            <div class="doc-item-title">{{ doc.title }}</div>
            <div class="doc-item-meta">
              <n-tag size="tiny" round :bordered="false">
                {{ getCategoryName(doc.category) }}
              </n-tag>
              <span class="doc-item-date">{{ formatDate(doc.updated_at) }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- 文档内容 -->
      <div ref="docContentRef" class="doc-content">
        <template v-if="selectedDoc">
          <div class="doc-content-header">
            <h3 class="doc-content-title">{{ selectedDoc.title }}</h3>
            <div class="doc-content-meta">
              <n-tag size="small" round :bordered="false">
                {{ getCategoryName(selectedDoc.category) }}
              </n-tag>
              <span class="doc-content-date">
                {{ t('knowledge.lastUpdate') }}: {{ formatDate(selectedDoc.updated_at) }}
              </span>
            </div>
          </div>
          <div class="prose" v-html="sanitizeHtml(selectedDoc.body)"></div>
        </template>
        <n-empty
          v-else
          :description="t('common.noData')"
          class="doc-empty"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, NInput, NEmpty, NTag } from 'naive-ui'
import { userApi } from '@/api'
import type { Knowledge, KnowledgeCategory } from '@/api/types'
import { formatDate } from '@/utils/format'
import { sanitizeHtml } from '@/utils/safe'

const { t, locale } = useI18n()
const message = useMessage()

// ===== 状态 =====
const categories = ref<KnowledgeCategory[]>([])
const allDocs = ref<Knowledge[]>([])
const loading = ref(false)
const selectedCategory = ref<string>('all')
const keyword = ref('')
const selectedDoc = ref<Knowledge | null>(null)
const docContentRef = ref<HTMLElement | null>(null)

// ===== 计算属性 =====
// 分类列表(含"全部")
const categoryList = computed(() => {
  return [
    { category: 'all', name: t('knowledge.all') },
    ...categories.value.map(c => ({ category: c.category, name: c.name })),
  ]
})

// 按分类筛选后的文档列表
const filteredDocs = computed(() => {
  if (selectedCategory.value === 'all') return allDocs.value
  return allDocs.value.filter(d => d.category === selectedCategory.value)
})

// 提示词条
const knowledgeTips = computed(() => [
  {
    icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    text: t('knowledge.tipSearch'),
    style: 'background: rgba(59,130,246,0.12); color: #3b82f6;',
  },
  {
    icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    text: t('knowledge.tipBrowse'),
    style: 'background: rgba(139,92,246,0.12); color: #8b5cf6;',
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    text: t('knowledge.tipHelp'),
    style: 'background: rgba(16,185,129,0.12); color: #10b981;',
  },
])

// ===== 工具函数 =====
// 根据分类标识获取分类名称
const getCategoryName = (category: string): string => {
  const cat = categories.value.find(c => c.category === category)
  return cat?.name || category
}

// 获取分类下的文档数量
const getCategoryCount = (category: string): number => {
  if (category === 'all') return allDocs.value.length
  return allDocs.value.filter(d => d.category === category).length
}

// ===== 数据获取 =====
const fetchCategories = async () => {
  try {
    const res = await userApi.getKnowledgeCategories()
    const cats = res.data || []
    // 仅在接口返回了分类数据时才更新，避免覆盖 fetchKnowledge 提取的分类
    if (cats.length > 0) {
      categories.value = cats
    }
  } catch (err) {
    console.warn('[Knowledge] 获取分类失败，将从文章中提取:', err)
  }
}

const fetchKnowledge = async () => {
  loading.value = true
  try {
    const res = await userApi.getKnowledge(keyword.value || undefined, locale.value)
    const rawData = res.data

    // API 可能返回两种格式:
    // 1. 数组: [{ id, category, title, ... }]
    // 2. 按分类分组的对象: { "分类名": [{ id, category, title, ... }] }
    let docs: Knowledge[] = []
    if (Array.isArray(rawData)) {
      docs = rawData
    } else if (rawData && typeof rawData === 'object') {
      // 拍平分组对象
      for (const [, groupDocs] of Object.entries(rawData)) {
        if (Array.isArray(groupDocs)) {
          docs.push(...groupDocs)
        }
      }
    }

    allDocs.value = docs

    // 若分类接口失败或返回空，从文章中自动提取分类
    if (categories.value.length === 0 && docs.length > 0) {
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

    // 若当前选中的文档已不在结果中,则清除选中
    if (selectedDoc.value && !docs.some(d => d.id === selectedDoc.value!.id)) {
      selectedDoc.value = docs[0] || null
    }
    // 默认选中第一篇
    if (!selectedDoc.value && docs.length > 0) {
      selectedDoc.value = docs[0]
    }
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

// ===== 交互 =====
// 选择分类
const selectCategory = (category: string) => {
  selectedCategory.value = category
}

// 选择文档(移动端选中后滚动至内容区)
const selectDoc = (doc: Knowledge) => {
  selectedDoc.value = doc
  if (window.innerWidth < 768) {
    setTimeout(() => {
      docContentRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }
}

// 关键词搜索(防抖)
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(keyword, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchKnowledge()
  }, 350)
})

// ===== 初始化 =====
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchKnowledge()])
})
</script>

<style scoped>
.knowledge-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 页面标题 + 搜索 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.header-text {
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
.search-input {
  width: 320px;
}
.search-input :deep(.n-input__input-el) {
  font-size: 13px;
}

/* 提示词条 */
.tips-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tip-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border-light);
}
.tip-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tip-text {
  font-size: 12px;
  color: var(--stellar-text-secondary);
  white-space: nowrap;
}

/* 移动端分类水平滚动(默认隐藏) */
.category-tabs {
  display: none;
}
.category-tabs-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.category-tabs-scroll::-webkit-scrollbar {
  display: none;
}
.category-tab {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 20px;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  font-size: 13px;
  color: var(--stellar-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.category-tab:hover {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}
.category-tab.active {
  background: var(--stellar-primary);
  border-color: var(--stellar-primary);
  color: #fff;
  font-weight: 600;
}

/* 主体布局 */
.knowledge-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* 桌面端:分类侧边栏 */
.category-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 16px 12px;
  position: sticky;
  top: 20px;
}
.sidebar-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--stellar-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 8px 12px;
}
.category-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--stellar-text-secondary);
  transition: background 0.2s, color 0.2s;
}
.category-item:hover {
  background: var(--stellar-bg-hover);
  color: var(--stellar-text);
}
.category-item.active {
  background: var(--stellar-primary-light);
  color: var(--stellar-primary);
  font-weight: 600;
}
.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.8;
}
.category-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.category-count {
  font-size: 12px;
  color: var(--stellar-text-muted);
  background: var(--stellar-bg-hover);
  padding: 1px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}
.category-item.active .category-count {
  color: var(--stellar-primary);
  background: rgba(59, 130, 246, 0.12);
}

/* 文档列表 */
.doc-list {
  width: 340px;
  flex-shrink: 0;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 8px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}
.doc-item {
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
}
.doc-item:hover {
  background: var(--stellar-bg-hover);
}
.doc-item.active {
  background: var(--stellar-primary-light);
  border-color: var(--stellar-primary);
}
.doc-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--stellar-text);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.doc-item.active .doc-item-title {
  color: var(--stellar-primary);
  font-weight: 600;
}
.doc-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.doc-item-date {
  font-size: 12px;
  color: var(--stellar-text-muted);
}

/* 文档内容 */
.doc-content {
  flex: 1;
  min-width: 0;
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 28px 32px;
  min-height: 400px;
}
.doc-content-header {
  padding-bottom: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.doc-content-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 0 0 12px;
  line-height: 1.4;
}
.doc-content-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.doc-content-date {
  font-size: 13px;
  color: var(--stellar-text-muted);
}

/* 文档正文 prose 样式 */
.prose {
  color: var(--stellar-text);
  line-height: 1.7;
  font-size: 14px;
  word-break: break-word;
}
.prose :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 24px 0 16px;
  line-height: 1.3;
}
.prose :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  color: var(--stellar-text);
  margin: 22px 0 14px;
  line-height: 1.3;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.prose :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 20px 0 12px;
}
.prose :deep(h4) {
  font-size: 15px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 18px 0 10px;
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

/* 全页空状态 */
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
.full-empty-state svg {
  color: var(--stellar-text-muted);
  opacity: 0.4;
}
.full-empty-state p {
  font-size: 14px;
  margin: 0;
}

/* 加载 / 空状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--stellar-text-muted);
}
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--stellar-border);
  border-top-color: var(--stellar-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-state p {
  font-size: 13px;
  margin: 0;
}
.doc-empty {
  padding: 60px 20px;
  justify-content: center;
}

/* ===== 移动端 (<768px) ===== */
@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .search-input {
    width: 100%;
  }
  /* 显示水平滚动分类 */
  .category-tabs {
    display: block;
  }
  /* 隐藏桌面端侧边栏 */
  .category-sidebar {
    display: none;
  }
  /* 主体改为上下堆叠 */
  .knowledge-body {
    flex-direction: column;
    gap: 16px;
  }
  .doc-list {
    width: 100%;
    max-height: none;
  }
  .doc-content {
    width: 100%;
    padding: 20px;
  }
  .doc-content-title {
    font-size: 18px;
  }
}
</style>

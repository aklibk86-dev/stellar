<template>
  <div class="api-loading-page">
    <!-- 加载中 -->
    <div v-if="status === 'loading'" class="loading-container">
      <div class="loading-logo">
        <div class="logo-spinner">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      </div>
      <p class="loading-text">{{ t('apiValidation.connecting') }}</p>
    </div>

    <!-- 检测失败 -->
    <div v-else class="error-container">
      <div class="error-card">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 class="error-title">{{ t('apiValidation.errorTitle') }}</h1>
        <p class="error-desc">{{ t('apiValidation.errorDesc') }}</p>
        <div class="error-actions">
          <button class="action-btn primary" @click="runCheck">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {{ t('apiValidation.retry') }}
          </button>
          <button class="action-btn" @click="showContactModal = true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {{ t('apiValidation.contact') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 联系方式弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showContactModal" class="modal-overlay" @click.self="showContactModal = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3 class="modal-title">{{ t('apiValidation.contactTitle') }}</h3>
              <button class="modal-close" @click="showContactModal = false">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="modal-body" v-html="sanitizeHtml(contactContent)"></div>
            <div class="modal-footer">
              <button class="modal-ok-btn" @click="showContactModal = false">{{ t('common.confirm') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { checkSingleApi, getStaticApiBaseUrls, setAvailableApiUrl } from '@/utils/apiConfig'
import { sanitizeHtml, getSafeRedirect } from '@/utils/safe'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

type Status = 'loading' | 'failed'
const status = ref<Status>('loading')
const retryCount = ref(0)
const showContactModal = ref(false)

const contactContent = computed(() => {
  return window.settings?.api_error_contact || ''
})

const targetPath = computed(() => {
  const redirect = route.query.redirect
  return getSafeRedirect(typeof redirect === 'string' ? redirect : '', '/')
})

const goTarget = () => {
  router.replace(targetPath.value)
}

const runCheck = async () => {
  status.value = 'loading'
  retryCount.value = 0
  await doCheck()
}

const doCheck = async () => {
  const urls = getStaticApiBaseUrls()

  if (urls.length === 0) {
    router.replace(targetPath.value)
    return
  }

  const checks = await Promise.all(urls.map(url => checkSingleApi(url)))
  const available = checks.filter(item => item.ok).sort((a, b) => a.latency - b.latency)

  if (available[0]) {
    setAvailableApiUrl(available[0].url)
    window.setTimeout(goTarget, 300)
  } else {
    if (retryCount.value < 1) {
      retryCount.value++
      window.setTimeout(doCheck, 1500)
    } else {
      status.value = 'failed'
    }
  }
}

onMounted(runCheck)
</script>

<style scoped>
.api-loading-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 40%), var(--stellar-bg, #0f172a);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.loading-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-spinner {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1));
  border: 1px solid rgba(59,130,246,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  animation: spin 1.2s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  margin: 0;
  font-size: 15px;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.02em;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 失败卡片 */
.error-container {
  width: 100%;
  max-width: 420px;
}
.error-card {
  background: var(--stellar-bg-card, rgba(30,41,59,0.8));
  border: 1px solid var(--stellar-border, rgba(255,255,255,0.1));
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  backdrop-filter: blur(12px);
}
.error-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
}
.error-title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
  color: var(--stellar-text, #f1f5f9);
}
.error-desc {
  margin: 0 0 28px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--stellar-text-muted, rgba(255,255,255,0.5));
}
.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid rgba(59,130,246,0.3);
  background: rgba(59,130,246,0.1);
  color: #60a5fa;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(59,130,246,0.2);
  border-color: rgba(59,130,246,0.5);
}
.action-btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.action-btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
}
.modal-card {
  width: 100%;
  max-width: 460px;
  background: var(--stellar-bg-card, #1e293b);
  border: 1px solid var(--stellar-border, rgba(255,255,255,0.1));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--stellar-border, rgba(255,255,255,0.08));
}
.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--stellar-text, #f1f5f9);
}
.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--stellar-text-muted, rgba(255,255,255,0.5));
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover {
  background: rgba(255,255,255,0.08);
  color: var(--stellar-text, #f1f5f9);
}
.modal-body {
  padding: 24px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--stellar-text-secondary, rgba(255,255,255,0.7));
  max-height: 50vh;
  overflow-y: auto;
  word-break: break-word;
}
.modal-body :deep(a) {
  color: #60a5fa;
  text-decoration: none;
}
.modal-body :deep(a:hover) {
  text-decoration: underline;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--stellar-border, rgba(255,255,255,0.08));
}
.modal-ok-btn {
  padding: 8px 24px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-ok-btn:hover {
  background: #2563eb;
}

/* 弹窗过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

/* 浅色模式适配 */
:global(html:not(.dark)) .loading-text {
  color: rgba(15,23,42,0.6);
}
:global(html:not(.dark)) .error-card {
  background: rgba(255,255,255,0.9);
  border-color: rgba(0,0,0,0.08);
}
:global(html:not(.dark)) .error-title {
  color: #1e293b;
}
:global(html:not(.dark)) .error-desc {
  color: rgba(15,23,42,0.5);
}
:global(html:not(.dark)) .modal-card {
  background: #fff;
  border-color: rgba(0,0,0,0.08);
}
:global(html:not(.dark)) .modal-title {
  color: #1e293b;
}
:global(html:not(.dark)) .modal-close {
  color: rgba(15,23,42,0.4);
}
:global(html:not(.dark)) .modal-close:hover {
  background: rgba(0,0,0,0.06);
  color: #1e293b;
}
:global(html:not(.dark)) .modal-body {
  color: rgba(15,23,42,0.7);
}
:global(html:not(.dark)) .modal-header {
  border-color: rgba(0,0,0,0.06);
}
:global(html:not(.dark)) .modal-footer {
  border-color: rgba(0,0,0,0.06);
}
</style>

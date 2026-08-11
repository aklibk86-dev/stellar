<template>
  <div class="not-found">
    <div class="nf-content">
      <h1 class="nf-code">404</h1>
      <h2 class="nf-title">{{ title }}</h2>
      <p class="nf-text">{{ description }}</p>
      <div class="nf-actions">
        <n-button type="primary" @click="handlePrimaryAction">
          {{ primaryActionText }}
        </n-button>
        <n-button v-if="isLoggedIn" secondary @click="$router.back()">
          {{ t('common.back') }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const isLoadFailure = computed(() => route.name === 'route-fallback')
const title = computed(() => t(isLoadFailure.value ? 'notFound.loadFailedTitle' : 'notFound.title'))
const description = computed(() => t(isLoadFailure.value ? 'notFound.loadFailedDesc' : 'notFound.description'))
const primaryActionText = computed(() => t(isLoggedIn.value ? 'notFound.backDashboard' : 'notFound.goLogin'))

const handlePrimaryAction = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'dashboard' })
    return
  }
  router.push({
    name: 'login',
    query: {
      redirect: typeof route.query.from === 'string' ? route.query.from : '/dashboard',
      reason: 'login_required',
    },
  })
}
</script>

<style scoped>
.not-found { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--stellar-bg); }
.nf-content { width: min(560px, calc(100vw - 40px)); text-align: center; }
.nf-code { font-size: 96px; font-weight: 800; color: var(--stellar-primary); margin: 0; line-height: 1; }
.nf-title { margin: 20px 0 8px; color: var(--stellar-text); font-size: 24px; }
.nf-text { font-size: 15px; line-height: 1.7; color: var(--stellar-text-muted); margin: 0 auto 28px; }
.nf-actions { display: flex; align-items: center; justify-content: center; gap: 10px; }

@media (max-width: 480px) {
  .nf-code { font-size: 72px; }
  .nf-title { font-size: 20px; }
}
</style>

<template>
  <div class="auth-page" :class="{ 'has-bg': !!backgroundUrl }">
    <div v-if="backgroundUrl" class="auth-bg" :style="{ backgroundImage: `url(${backgroundUrl})` }"></div>
    <div v-if="backgroundUrl" class="auth-overlay"></div>

    <div class="auth-container">
      <div class="auth-brand hidden lg:flex">
        <div class="brand-content">
          <div class="brand-logo">
            <img v-if="logo" :src="logo" alt="logo" />
            <div v-else class="logo-placeholder">
              <svg viewBox="0 0 32 32"><path d="M16 2L2 9v14l14 7 14-7V9L16 2zm0 3.3L26.5 10 16 15.7 5.5 10 16 5.3zM5 12.5l9 4.5v9.2l-9-4.5v-9.2zm11 13.7v-9.2l9-4.5v9.2l-9 4.5z" fill="currentColor"/></svg>
            </div>
          </div>
          <h1 class="brand-title">{{ title }}</h1>
          <p class="brand-desc">{{ description || 'Stellar Panel' }}</p>
        </div>
      </div>

      <div class="auth-form-wrap">
        <div class="auth-form-inner">
          <div class="auth-top-actions">
            <button class="header-btn" @click="appStore.toggleDark()">
              <svg v-if="appStore.isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>

          <div class="auth-mobile-brand">
            <h1 class="auth-mobile-brand-title">{{ title }}</h1>
            <p class="auth-mobile-brand-desc">{{ description || 'Stellar Panel' }}</p>
          </div>

          <h2 class="auth-title">{{ t('auth.registerTitle') }}</h2>
          <p class="auth-subtitle">{{ t('auth.registerSubtitle') }}</p>

          <n-alert v-if="emailWhitelistEnabled" class="email-whitelist-alert" type="info" :show-icon="false">
            {{ t('auth.emailWhitelistHint', { suffixes: emailWhitelistSuffixes.join(', ') }) }}
          </n-alert>

          <n-form ref="formRef" class="auth-register-form" :model="formData" :rules="rules" size="medium" @submit.prevent="handleRegister">
            <n-form-item path="email" :label="t('auth.email')">
              <n-input-group v-if="emailWhitelistEnabled" class="email-input-group">
                <n-input v-model:value="emailLocalPart" class="email-prefix-input" :placeholder="t('auth.email')" />
                <n-select
                  v-model:value="selectedEmailSuffix"
                  class="email-suffix-select"
                  :options="emailSuffixOptions"
                  :consistent-menu-width="false"
                  aria-label="Email domain"
                />
              </n-input-group>
              <n-input v-else v-model:value="formData.email" :placeholder="t('auth.email')" clearable />
            </n-form-item>

            <n-form-item path="password" :label="t('auth.password')">
              <n-input v-model:value="formData.password" type="password" :placeholder="t('auth.password')" show-password-on="click" />
            </n-form-item>

            <n-form-item path="confirmPassword" :label="t('auth.confirmPassword')">
              <n-input v-model:value="formData.confirmPassword" type="password" :placeholder="t('auth.confirmPassword')" show-password-on="click" />
            </n-form-item>

            <n-form-item v-if="emailVerificationEnabled" path="email_code" :label="t('auth.emailCode')">
              <n-input-group>
                <n-input v-model:value="formData.email_code" :placeholder="t('auth.emailCode')" />
                <n-button :loading="codeLoading" :disabled="countdown > 0" @click="sendEmailCode">
                  {{ countdown > 0 ? `${countdown}${t('auth.resendTime')}` : t('auth.sendCode') }}
                </n-button>
              </n-input-group>
            </n-form-item>

            <n-form-item path="invite_code" :label="t('auth.inviteCode')">
              <n-input v-model:value="formData.invite_code" :placeholder="t('auth.inviteCode')" clearable />
            </n-form-item>

            <n-button type="primary" block size="medium" :loading="loading" @click="handleRegister" style="margin-top: 8px;">
              {{ t('auth.register') }}
            </n-button>
          </n-form>

          <div class="auth-footer">
            <router-link to="/login" class="auth-link">
              <span class="desktop-login-label">{{ t('auth.hasAccount') }} {{ t('auth.goLogin') }}</span>
              <span class="mobile-login-label">{{ t('auth.backToLogin') }}</span>
            </router-link>
            <StellarDropdown :options="localeOptions" @select="handleLocaleChange">
              <template #trigger>
                <button type="button" class="language-toggle">
                  <StellarIcon name="language" :size="18" />
                  <span>{{ locale === 'zh-CN' ? '简体中文' : 'English' }}</span>
                </button>
              </template>
            </StellarDropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, useDialog, NAlert, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { passportApi } from '@/api'
import { getEmailWhitelistSuffixes, isEmailAllowedByWhitelist } from '@/utils/emailWhitelist'
import StellarDropdown from '@/components/StellarDropdown.vue'
import StellarIcon from '@/components/StellarIcon.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()
const appStore = useAppStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const codeLoading = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const title = computed(() => appStore.title)
const logo = computed(() => appStore.logo)
const description = computed(() => appStore.description)
// 向后兼容：当新的全站背景（background）启用时，由全局组件统一渲染，
// 此处不再重复渲染 auth 专属背景；仅在新背景未启用且旧 background_url 有值时保留原行为。
const backgroundUrl = computed(() => (appStore.backgroundEnabled ? '' : appStore.backgroundUrl))
const guestConfig = computed(() => userStore.guestConfig)
const emailVerificationEnabled = computed(() => guestConfig.value?.is_email_verify === 1)
const emailWhitelistSuffixes = computed(() => getEmailWhitelistSuffixes(guestConfig.value?.email_whitelist_suffix))
const emailWhitelistEnabled = computed(() => emailWhitelistSuffixes.value.length > 0)
const emailSuffixOptions = computed(() => emailWhitelistSuffixes.value.map((suffix) => ({
  label: `@${suffix}`,
  value: suffix,
})))

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  email_code: '',
  invite_code: '',
})

const emailLocalPart = ref('')
const selectedEmailSuffix = ref('')

const syncEmailFromParts = () => {
  if (!emailWhitelistEnabled.value) return
  const localPart = emailLocalPart.value.trim()
  formData.email = localPart && selectedEmailSuffix.value ? `${localPart}@${selectedEmailSuffix.value}` : ''
}

watch(emailWhitelistSuffixes, (suffixes, previousSuffixes) => {
  if (!previousSuffixes?.length && suffixes.length && formData.email && !emailLocalPart.value) {
    const at = formData.email.lastIndexOf('@')
    emailLocalPart.value = at > 0 ? formData.email.slice(0, at) : formData.email
  }

  if (suffixes.length && !selectedEmailSuffix.value) {
    selectedEmailSuffix.value = suffixes[0]
  } else if (selectedEmailSuffix.value && !suffixes.includes(selectedEmailSuffix.value)) {
    selectedEmailSuffix.value = suffixes[0] || ''
  }
  syncEmailFromParts()
}, { immediate: true })

watch(emailLocalPart, syncEmailFromParts)
watch(selectedEmailSuffix, syncEmailFromParts)

const localeOptions = [
  { label: '简体中文', key: 'zh-CN' },
  { label: 'English', key: 'en-US' },
]

const handleLocaleChange = (key: string) => {
  appStore.setLocale(key)
  locale.value = key
}

const getInviteCodeFromQuery = () => {
  const inviteCode = route.query.invite_code || route.query.code
  return Array.isArray(inviteCode) ? (inviteCode[0] || '') : (inviteCode || '')
}

const fillInviteCodeFromQuery = () => {
  const inviteCode = getInviteCodeFromQuery().trim()
  if (inviteCode) {
    formData.invite_code = inviteCode
  }
}

const rules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('auth.email'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailFormatError'), trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (!emailWhitelistEnabled.value || !value || isEmailAllowedByWhitelist(String(value), emailWhitelistSuffixes.value)) return true
        return new Error(t('auth.emailWhitelistError', { suffixes: emailWhitelistSuffixes.value.join(', ') }))
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: t('auth.password'), trigger: 'blur' },
    { min: 8, message: t('auth.passwordMinLength'), trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: t('auth.confirmPassword'), trigger: 'blur' },
    {
      validator: (_rule, value) => value === formData.password,
      message: t('auth.passwordsDoNotMatch'),
      trigger: 'blur',
    },
  ],
  email_code: [
    { required: emailVerificationEnabled.value, message: t('auth.emailCode'), trigger: 'blur' },
  ],
  invite_code: [
    { required: guestConfig.value?.is_invite_force === 1, message: t('auth.inviteCode'), trigger: 'blur' },
  ],
}))

const sendEmailCode = async () => {
  if (!formData.email) {
    message.warning(t('auth.email'))
    return
  }
  codeLoading.value = true
  try {
    await passportApi.sendEmailVerify(formData.email)
    dialog.success({
      title: t('auth.registerCodeSentTitle'),
      content: t('auth.registerCodeSentContent'),
      positiveText: t('auth.registerCodeSentConfirm'),
      closable: false,
      maskClosable: false,
      closeOnEsc: false,
    })
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (err: any) {
    message.error(err.message || t('common.failed'))
  } finally {
    codeLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await userStore.register(formData.email, formData.password, formData.invite_code, formData.email_code)
    message.success(t('common.success'))
    router.push('/dashboard')
  } catch (err: any) {
    message.error(err.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fillInviteCodeFromQuery()
  // 注册页面不在 MainLayout 下,需主动获取站点配置
  if (!userStore.guestConfig) {
    userStore.fetchGuestConfig()
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: var(--stellar-bg); }
.auth-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
.auth-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); z-index: 1; }
.auth-container { position: relative; z-index: 2; display: flex; width: 100%; max-width: 960px; min-height: 560px; margin: 20px; background: var(--stellar-bg-card); border-radius: 16px; overflow: hidden; border: 1px solid var(--stellar-border); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); }
.auth-brand { flex: 1; background: linear-gradient(135deg, #1a1d24, #0f1419); align-items: center; justify-content: center; padding: 48px; }
.brand-content { text-align: center; color: white; }
.brand-logo { display: flex; justify-content: center; margin-bottom: 24px; }
.brand-logo img { width: 64px; height: 64px; border-radius: 16px; }
.logo-placeholder { width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; color: white; }
.logo-placeholder svg { width: 40px; height: 40px; }
.brand-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.brand-desc { font-size: 14px; opacity: 0.7; }
.auth-form-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 40px; overflow-y: auto; max-height: 100vh; }
.auth-form-inner { width: 100%; max-width: 400px; }
.auth-top-actions { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.header-btn { background: var(--stellar-bg-hover); border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: var(--stellar-text-secondary); display: flex; align-items: center; justify-content: center; }
.header-btn:hover { color: var(--stellar-text); }
.header-btn svg { width: 20px; height: 20px; }
.auth-mobile-brand { display: none; }
.auth-title { font-size: 24px; font-weight: 700; color: var(--stellar-text); margin-bottom: 8px; }
.auth-subtitle { font-size: 14px; color: var(--stellar-text-muted); margin-bottom: 32px; }
.email-input-group { width: 100%; }
.email-prefix-input { flex: 1; min-width: 0; }
.email-suffix-select { width: 124px; flex: 0 0 124px; }
.email-suffix-select :deep(.n-base-selection) { border-radius: 0 4px 4px 0; }
.email-whitelist-alert { margin: -12px 0 20px; }
.auth-register-form :deep(.n-input-group) { display: flex; }
.auth-link { color: var(--stellar-primary); font-size: 13px; font-weight: 500; cursor: pointer; }
.auth-link:hover { text-decoration: underline; }
.auth-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 24px; font-size: 13px; color: var(--stellar-text-muted); }
.language-toggle { display: inline-flex; align-items: center; gap: 6px; border: 0; padding: 0; background: transparent; color: var(--stellar-text-muted); cursor: pointer; font-size: 13px; white-space: nowrap; }
.language-toggle:hover { color: var(--stellar-text); }
.mobile-login-label { display: none; }

@media (max-width: 1023px) {
  .auth-page { align-items: stretch; }
  .auth-container { margin: 0; min-height: 100vh; border: none; border-radius: 0; background: transparent; box-shadow: none; }
  .auth-form-wrap { align-items: flex-start; padding: 30px 17px 20px; }
  .auth-form-inner { max-width: 400px; margin: 0 auto; }
  .auth-top-actions { display: none; }
  .auth-mobile-brand { display: block; text-align: center; margin: 0 0 26px; }
  .auth-mobile-brand-title { color: var(--stellar-text); font-size: 36px; font-weight: 500; line-height: 1.1; letter-spacing: 0.5px; opacity: 0.8; }
  .auth-mobile-brand-desc { color: var(--stellar-text-muted); font-size: 14px; margin-top: 18px; }
  .auth-title, .auth-subtitle { display: none; }
  .auth-register-form :deep(.n-form-item-label) { display: none; }
  .auth-register-form :deep(.n-form-item) { grid-template-rows: 0 auto auto; margin-bottom: 20px; }
  .auth-register-form :deep(.n-form-item-blank) { min-height: 34px; }
  .auth-register-form :deep(.n-form-item-feedback-wrapper) { min-height: 0; }
  .auth-register-form :deep(.n-input),
  .auth-register-form :deep(.n-base-selection) { min-height: 34px; }
  .auth-register-form :deep(.n-input__input-el) { height: 32px; }
  .auth-register-form :deep(.n-button) { height: 36px; margin-top: 2px !important; }
  .auth-footer { margin-top: 42px; }
  .desktop-login-label { display: none; }
  .mobile-login-label { display: inline; }
}

@media (max-width: 420px) {
  .auth-form-wrap { padding-left: 16px; padding-right: 16px; }
  .email-suffix-select { width: 118px; flex-basis: 118px; }
}
</style>

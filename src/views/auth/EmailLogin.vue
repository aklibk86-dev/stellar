<template>
  <div class="auth-page" :class="{ 'has-bg': !!backgroundUrl }">
    <div v-if="backgroundUrl" class="auth-bg" :style="{ backgroundImage: `url(${backgroundUrl})` }"></div>
    <div class="auth-overlay"></div>
    <div class="auth-container">
      <div class="auth-brand hidden lg:flex">
        <div class="brand-content">
          <div class="brand-logo">
            <img v-if="logo" :src="logo" alt="logo" />
            <div v-else class="logo-placeholder"><svg viewBox="0 0 32 32"><path d="M16 2L2 9v14l14 7 14-7V9L16 2zm0 3.3L26.5 10 16 15.7 5.5 10 16 5.3zM5 12.5l9 4.5v9.2l-9-4.5v-9.2zm11 13.7v-9.2l9-4.5v9.2l-9 4.5z" fill="currentColor"/></svg></div>
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

          <!-- 步骤指示器 -->
          <div class="step-indicator">
            <div class="step" :class="{ active: step >= 1, done: step > 1 }">
              <span class="step-num">1</span>
              <span class="step-label">{{ t('auth.emailLoginStep1') }}</span>
            </div>
            <div class="step-line" :class="{ active: step > 1 }"></div>
            <div class="step" :class="{ active: step >= 2 }">
              <span class="step-num">2</span>
              <span class="step-label">{{ t('auth.emailLoginStep2') }}</span>
            </div>
          </div>

          <h2 class="auth-title">{{ step === 1 ? t('auth.emailLoginTitle') : t('auth.emailVerifyTitle') }}</h2>
          <p class="auth-subtitle">{{ step === 1 ? t('auth.emailLoginSubtitle') : t('auth.emailVerifySubtitle') }}</p>

          <!-- 步骤 1: 输入邮箱 -->
          <n-form v-if="step === 1" ref="emailFormRef" :model="emailForm" :rules="emailRules" size="large" @submit.prevent="handleSendCode">
            <n-form-item path="email" :label="t('auth.email')">
              <n-input v-model:value="emailForm.email" :placeholder="t('auth.emailPlaceholder')" clearable>
                <template #prefix>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </template>
              </n-input>
            </n-form-item>
            <n-button type="primary" block size="large" :loading="sendingCode" @click="handleSendCode">
              {{ t('auth.sendVerifyCode') }}
            </n-button>
          </n-form>

          <!-- 步骤 2: 输入验证码 -->
          <n-form v-else ref="codeFormRef" :model="codeForm" :rules="codeRules" size="large" @submit.prevent="handleLogin">
            <div class="email-display">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>{{ emailForm.email }}</span>
              <button type="button" class="change-email-btn" @click="step = 1">{{ t('auth.changeEmail') }}</button>
            </div>
            <n-form-item path="email_code" :label="t('auth.emailCode')">
              <n-input-group>
                <n-input
                  v-model:value="codeForm.email_code"
                  :placeholder="t('auth.emailCodePlaceholder')"
                  maxlength="6"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
                  </template>
                </n-input>
                <n-button :loading="resendingCode" :disabled="countdown > 0" @click="handleResendCode">
                  {{ countdown > 0 ? `${countdown}${t('auth.resendTime')}` : t('auth.resendCode') }}
                </n-button>
              </n-input-group>
            </n-form-item>
            <n-button type="primary" block size="large" :loading="loading" @click="handleLogin">
              {{ t('auth.login') }}
            </n-button>
          </n-form>

          <div class="auth-footer">
            <router-link to="/login" class="auth-link">{{ t('auth.backToLogin') }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { passportApi } from '@/api'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const message = useMessage()
const appStore = useAppStore()
const userStore = useUserStore()

const title = computed(() => appStore.title)
const logo = computed(() => appStore.logo)
const description = computed(() => appStore.description)
const backgroundUrl = computed(() => appStore.backgroundUrl)

const step = ref(1)
const emailFormRef = ref<FormInst | null>(null)
const codeFormRef = ref<FormInst | null>(null)
const sendingCode = ref(false)
const resendingCode = ref(false)
const loading = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const emailForm = reactive({
  email: (route.query.email as string) || '',
})

const codeForm = reactive({
  email_code: '',
})

const emailRules: FormRules = {
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailFormatError'), trigger: 'blur' },
  ],
}

const codeRules: FormRules = {
  email_code: [{ required: true, message: t('auth.emailCodeRequired'), trigger: 'blur' }],
}

// 发送验证码
const sendCode = async (email: string) => {
  await passportApi.sendEmailVerify(email)
  message.success(t('auth.emailCodeSent'))
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

// 步骤 1: 发送验证码
const handleSendCode = async () => {
  try {
    await emailFormRef.value?.validate()
  } catch {
    return
  }
  sendingCode.value = true
  try {
    await sendCode(emailForm.email)
    step.value = 2
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    sendingCode.value = false
  }
}

// 重新发送验证码
const handleResendCode = async () => {
  resendingCode.value = true
  try {
    await sendCode(emailForm.email)
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    resendingCode.value = false
  }
}

// 步骤 2: 通过验证码登录
const handleLogin = async () => {
  try {
    await codeFormRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    const res = await passportApi.loginWithMailLink(emailForm.email, codeForm.email_code)
    // auth_data 是认证令牌(Bearer token), token 是订阅令牌
    userStore.setAuthData(res.data.auth_data as unknown as string, res.data.token)
    message.success(t('auth.loginSuccess'))
    router.push('/dashboard')
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

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
.auth-form-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
.auth-form-inner { width: 100%; max-width: 340px; }
.auth-top-actions { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.header-btn { background: var(--stellar-bg-hover); border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: var(--stellar-text-secondary); display: flex; align-items: center; justify-content: center; }
.header-btn:hover { color: var(--stellar-text); }
.header-btn svg { width: 20px; height: 20px; }

/* 步骤指示器 */
.step-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
.step { display: flex; align-items: center; gap: 6px; }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--stellar-border); color: var(--stellar-text-muted); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.step.active .step-num { background: var(--stellar-primary); color: white; }
.step.done .step-num { background: #10b981; color: white; }
.step-label { font-size: 12px; color: var(--stellar-text-muted); transition: color 0.2s; }
.step.active .step-label { color: var(--stellar-text); font-weight: 500; }
.step-line { flex: 1; height: 2px; background: var(--stellar-border); border-radius: 1px; transition: background 0.2s; }
.step-line.active { background: #10b981; }

.auth-title { font-size: 24px; font-weight: 700; color: var(--stellar-text); margin-bottom: 8px; }
.auth-subtitle { font-size: 14px; color: var(--stellar-text-muted); margin-bottom: 28px; }

/* 邮箱显示 */
.email-display { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--stellar-bg-hover); border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
.email-display svg { color: var(--stellar-text-muted); flex-shrink: 0; }
.email-display span { flex: 1; color: var(--stellar-text); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.change-email-btn { background: none; border: none; color: var(--stellar-primary); font-size: 12px; cursor: pointer; white-space: nowrap; padding: 0; }
.change-email-btn:hover { text-decoration: underline; }

.auth-link { color: var(--stellar-primary); font-size: 13px; font-weight: 500; cursor: pointer; }
.auth-link:hover { text-decoration: underline; }
.auth-footer { text-align: center; margin-top: 24px; font-size: 13px; color: var(--stellar-text-muted); }

@media (max-width: 640px) {
  .auth-container { margin: 0; border-radius: 0; border: none; min-height: 100vh; }
  .auth-form-wrap { padding: 24px 20px; }
}
</style>

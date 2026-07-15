<template>
  <div class="auth-page" :class="{ 'has-bg': !!backgroundUrl }">
    <div v-if="backgroundUrl" class="auth-bg" :style="{ backgroundImage: `url(${backgroundUrl})` }"></div>
    <div class="auth-overlay"></div>

    <div class="auth-container">
      <!-- 左侧品牌信息 (桌面端) -->
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

      <!-- 右侧表单 -->
      <div class="auth-form-wrap">
        <div class="auth-form-inner">
          <!-- 顶部主题切换 -->
          <div class="auth-top-actions">
            <button class="header-btn" @click="appStore.toggleDark()">
              <svg v-if="appStore.isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>

          <h2 class="auth-title">{{ t('auth.loginTitle') }}</h2>
          <p class="auth-subtitle">{{ t('auth.loginSubtitle') }}</p>

          <n-form ref="formRef" :model="formData" :rules="rules" size="large" @submit.prevent="handleLogin">
            <n-form-item path="email" :label="t('auth.email')">
              <n-input v-model:value="formData.email" :placeholder="t('auth.email')" clearable>
                <template #prefix>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </template>
              </n-input>
            </n-form-item>

            <n-form-item path="password" :label="t('auth.password')">
              <n-input v-model:value="formData.password" type="password" :placeholder="t('auth.password')" show-password-on="click" @keyup.enter="handleLogin">
                <template #prefix>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </template>
              </n-input>
            </n-form-item>

            <div class="auth-actions">
              <n-checkbox v-model:checked="rememberMe">{{ t('auth.rememberMe') }}</n-checkbox>
              <router-link to="/forget" class="auth-link">{{ t('auth.goForget') }}</router-link>
            </div>

            <n-button type="primary" block size="large" :loading="loading" @click="handleLogin">
              {{ t('auth.login') }}
            </n-button>
          </n-form>

          <!-- 分隔线 -->
          <div class="auth-divider">
            <span>{{ t('auth.or') }}</span>
          </div>

          <!-- 邮件链接登录 -->
          <div class="email-link-login">
            <n-button block size="large" quaternary :loading="emailLinkLoading" @click="handleEmailLinkLogin">
              <template #icon>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </template>
              {{ t('auth.emailLinkLogin') }}
            </n-button>
          </div>

          <div class="auth-footer">
            <span>{{ t('auth.noAccount') }}</span>
            <router-link to="/register" class="auth-link">{{ t('auth.goRegister') }}</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { passportApi } from '@/api'
import { NButton } from 'naive-ui'
import { getSafeRedirect } from '@/utils/safe'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const message = useMessage()
const userStore = useUserStore()
const appStore = useAppStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const rememberMe = ref(true)
const emailLinkLoading = ref(false)

const title = computed(() => appStore.title)
const logo = computed(() => appStore.logo)
const description = computed(() => appStore.description)
const backgroundUrl = computed(() => appStore.backgroundUrl)

const formData = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: t('auth.email'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailFormatError'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('auth.password'), trigger: 'blur' },
    { min: 8, message: t('auth.passwordMinLength'), trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await userStore.login(formData.email, formData.password)
    message.success(t('common.success'))
    const redirect = getSafeRedirect(route.query.redirect as string, '/dashboard')
    router.push(redirect)
  } catch (err: any) {
    message.error(err.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

// 邮件链接登录
const handleEmailLinkLogin = async () => {
  if (!formData.email) {
    message.warning(t('auth.emailRequired'))
    return
  }
  emailLinkLoading.value = true
  try {
    // 先发送验证码
    await passportApi.sendEmailVerify(formData.email)
    message.success(t('auth.emailCodeSent'))
    // 跳转到邮箱验证码登录页面
    router.push({ path: '/email-login', query: { email: formData.email } })
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    emailLinkLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--stellar-bg);
}

.auth-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.auth-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.auth-container {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  max-width: 960px;
  min-height: 560px;
  margin: 20px;
  background: var(--stellar-bg-card);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--stellar-border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.auth-brand {
  flex: 1;
  background: linear-gradient(135deg, #1a1d24, #0f1419);
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
}

.brand-content {
  text-align: center;
  color: white;
}

.brand-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.brand-logo img {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.logo-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-placeholder svg {
  width: 40px;
  height: 40px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.brand-desc {
  font-size: 14px;
  opacity: 0.7;
}

.auth-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.auth-form-inner {
  width: 100%;
  max-width: 340px;
}

.auth-top-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.header-btn {
  background: var(--stellar-bg-hover);
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--stellar-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-btn:hover {
  color: var(--stellar-text);
}

.header-btn svg {
  width: 20px;
  height: 20px;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--stellar-text);
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--stellar-text-muted);
  margin-bottom: 32px;
}

.auth-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.auth-link {
  color: var(--stellar-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.auth-link:hover {
  text-decoration: underline;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: var(--stellar-text-muted);
}

.auth-footer .auth-link {
  margin-left: 6px;
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--stellar-border);
}
.auth-divider span {
  padding: 0 12px;
  font-size: 12px;
  color: var(--stellar-text-muted);
}

.email-link-login {
  margin-bottom: 8px;
}

@media (max-width: 640px) {
  .auth-container {
    margin: 0;
    border-radius: 0;
    border: none;
    min-height: 100vh;
  }

  .auth-form-wrap {
    padding: 24px 20px;
  }
}
</style>

<template>
  <div class="profile-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">{{ t('profile.title') }}</h2>
      <p class="page-sub">{{ t('profile.basicInfo') }} · {{ t('profile.changePassword') }} · {{ t('profile.security') }}</p>
    </div>

    <!-- 双栏网格 -->
    <div class="profile-grid">
      <!-- 左栏：表单类 -->
      <div class="grid-col">
        <!-- 基本信息 -->
        <div class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="section-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <h3 class="card-title">{{ t('profile.basicInfo') }}</h3>
            </div>
          </div>
          <div class="card-body">
            <n-form
              :model="basicForm"
              :label-placement="isMobile ? 'top' : 'left'"
              :label-width="isMobile ? undefined : '90px'"
            >
              <n-form-item :label="t('profile.email')">
                <n-input :value="basicForm.email" readonly />
              </n-form-item>
              <n-form-item :label="t('profile.avatar')">
                <div class="avatar-field">
                  <n-avatar round :size="40" :src="basicForm.avatar_url">
                    {{ avatarFallback }}
                  </n-avatar>
                  <n-input
                    v-model:value="basicForm.avatar_url"
                    :placeholder="t('profile.avatar')"
                    clearable
                  />
                </div>
              </n-form-item>
              <n-form-item :label="t('profile.sign')">
                <n-input
                  v-model:value="basicForm.sign"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  :placeholder="t('profile.sign')"
                />
              </n-form-item>
              <div class="form-footer">
                <n-button type="primary" :loading="savingBasic" @click="handleSaveBasic">
                  {{ t('common.save') }}
                </n-button>
              </div>
            </n-form>
          </div>
        </div>

        <!-- 修改密码 -->
        <div class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="section-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <h3 class="card-title">{{ t('profile.changePassword') }}</h3>
            </div>
          </div>
          <div class="card-body">
            <n-form
              :model="passwordForm"
              :label-placement="isMobile ? 'top' : 'left'"
              :label-width="isMobile ? undefined : '90px'"
            >
              <n-form-item :label="t('profile.oldPassword')">
                <n-input
                  v-model:value="passwordForm.oldpwd"
                  type="password"
                  show-password-on="click"
                  :placeholder="t('profile.oldPassword')"
                />
              </n-form-item>
              <n-form-item :label="t('profile.newPassword')">
                <n-input
                  v-model:value="passwordForm.newpwd"
                  type="password"
                  show-password-on="click"
                  :placeholder="t('profile.newPassword')"
                />
              </n-form-item>
              <n-form-item :label="t('profile.confirmPassword')">
                <n-input
                  v-model:value="passwordForm.confirmpwd"
                  type="password"
                  show-password-on="click"
                  :placeholder="t('profile.confirmPassword')"
                  @keyup.enter="handleChangePassword"
                />
              </n-form-item>
              <div class="form-footer">
                <n-button type="primary" :loading="savingPassword" @click="handleChangePassword">
                  {{ t('profile.changePassword') }}
                </n-button>
              </div>
            </n-form>
          </div>
        </div>
      </div>

      <!-- 右栏：开关/操作类 -->
      <div class="grid-col">
        <!-- 通知设置 -->
        <div class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="section-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </span>
              <h3 class="card-title">{{ t('profile.notification') }}</h3>
            </div>
          </div>
          <div class="card-body">
            <div class="notify-list">
              <div class="notify-item">
                <div class="notify-info">
                  <span class="notify-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <span class="notify-label">{{ t('profile.remindExpire') }}</span>
                </div>
                <n-switch
                  :value="!!notifyForm.remind_expire"
                  :loading="savingNotify"
                  @update:value="(v: boolean) => handleToggleNotify('remind_expire', v)"
                />
              </div>
              <div class="notify-item">
                <div class="notify-info">
                  <span class="notify-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </span>
                  <span class="notify-label">{{ t('profile.remindTraffic') }}</span>
                </div>
                <n-switch
                  :value="!!notifyForm.remind_traffic"
                  :loading="savingNotify"
                  @update:value="(v: boolean) => handleToggleNotify('remind_traffic', v)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Telegram 绑定 -->
        <div v-if="telegramBotUsername || telegramGroupUrl" class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="section-icon" style="background: rgba(56, 163, 247, 0.15); color: #38a3f7;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
              </span>
              <h3 class="card-title">{{ t('profile.telegram') }}</h3>
            </div>
          </div>
          <div class="card-body">
            <div class="telegram-actions">
              <div v-if="telegramBotUsername" class="telegram-item">
                <div class="telegram-info">
                  <span class="telegram-label">{{ t('profile.telegramBot') }}</span>
                  <span class="telegram-desc">@{{ telegramBotUsername }}</span>
                </div>
                <n-button type="info" @click="showBindModal = true">
                  {{ t('profile.bindTelegram') }}
                </n-button>
              </div>
              <div v-if="telegramGroupUrl" class="telegram-item">
                <div class="telegram-info">
                  <span class="telegram-label">{{ t('profile.telegramGroup') }}</span>
                  <span class="telegram-desc">{{ t('profile.telegramGroupDesc') }}</span>
                </div>
                <n-button tag="a" :href="telegramGroupUrl" target="_blank">
                  {{ t('profile.joinGroup') }}
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 安全设置 -->
        <div class="content-card">
          <div class="card-header">
            <div class="card-title-group">
              <span class="section-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <h3 class="card-title">{{ t('profile.security') }}</h3>
            </div>
          </div>
          <div class="card-body">
            <n-alert type="warning" :show-icon="true" class="security-alert">
              {{ t('profile.resetTokenWarning') }}
            </n-alert>
            <div class="security-actions">
              <n-button type="error" :loading="resetting" @click="handleResetToken">
                {{ t('profile.resetToken') }}
              </n-button>
            </div>
            <n-alert v-if="newToken" type="success" :show-icon="true" class="token-alert">
              <template #header>
                <span class="token-header">{{ t('profile.newToken') }}</span>
              </template>
              <div class="token-display">
                <code class="token-value">{{ newToken }}</code>
                <n-button size="small" @click="copyToken">{{ t('common.copy') }}</n-button>
              </div>
            </n-alert>
          </div>
        </div>
      </div>
    </div>

    <!-- 在线会话（全宽） -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="section-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11V7a3 3 0 0 1 6 0v4"/><rect x="5" y="11" width="14" height="10" rx="2"/></svg>
          </span>
          <h3 class="card-title">{{ t('profile.activeSessions') }}</h3>
        </div>
      </div>
      <div class="card-body">
        <!-- 加载中 -->
        <div v-if="sessionsLoading" class="session-loading">
          <span class="loading-dot"></span>
          <span>{{ t('common.loading') }}</span>
        </div>
        <!-- 空状态 -->
        <div v-else-if="sessions.length === 0" class="session-empty">
          {{ t('profile.noSessions') }}
        </div>
        <!-- 会话列表(最多显示10条) -->
        <div v-else class="session-list">
          <div
            v-for="session in sessions.slice(0, 10)"
            :key="session.id"
            class="session-item"
          >
            <div class="session-info">
              <span class="session-ip">
                {{ session.name || `Session #${session.id}` }}
                <span v-if="session.id === sessions[0]?.id" class="session-current">
                  {{ t('profile.currentSession') }}
                </span>
              </span>
              <span class="session-time">
                {{ session.last_used_at ? formatDate(new Date(session.last_used_at).getTime() / 1000) : formatDate(new Date(session.created_at).getTime() / 1000) }}
              </span>
            </div>
            <n-button
              v-if="sessions.length > 1 && session.id !== sessions[0]?.id"
              size="small"
              type="error"
              ghost
              :loading="removingSession === session.id"
              @click="handleRemoveSession(session.id)"
            >
              {{ t('profile.removeSession') }}
            </n-button>
          </div>
          <div v-if="sessions.length > 10" class="session-more">
            {{ t('profile.moreSessions', { count: sessions.length - 10 }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Telegram 绑定弹窗 -->
    <n-modal v-model:show="showBindModal" preset="dialog" :title="t('profile.bindTelegram')" :show-icon="false">
      <div class="bind-modal-body">
        <div class="bind-step">
          <span class="step-num">1</span>
          <div class="step-content">
            <p class="step-title">{{ t('profile.bindStep1Title') }}</p>
            <p class="step-desc">{{ t('profile.bindStep1Desc') }}</p>
            <n-button tag="a" :href="`https://t.me/${telegramBotUsername}`" target="_blank" type="info" size="small">
              @{{ telegramBotUsername }}
            </n-button>
          </div>
        </div>
        <div class="bind-step">
          <span class="step-num">2</span>
          <div class="step-content">
            <p class="step-title">{{ t('profile.bindStep2Title') }}</p>
            <p class="step-desc">{{ t('profile.bindStep2Desc') }}</p>
            <div class="bind-command">
              <code>{{ bindCommand }}</code>
              <n-button size="tiny" @click="copyBindCommand">{{ t('common.copy') }}</n-button>
            </div>
          </div>
        </div>
      </div>
      <template #action>
        <n-button @click="showBindModal = false">{{ t('profile.gotIt') }}</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, NForm, NFormItem, NInput, NButton, NSwitch, NAvatar, NAlert, NModal } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import { formatDate } from '@/utils/format'
import { isValidHttpUrl, truncate } from '@/utils/safe'

const { t } = useI18n()
const message = useMessage()
const userStore = useUserStore()

// ===== 响应式布局检测 =====
const isMobile = ref(false)
const mediaQuery = window.matchMedia('(max-width: 768px)')

const handleMediaChange = (e: MediaQueryListEvent) => {
  isMobile.value = e.matches
}

// ===== 基本信息 =====
const basicForm = reactive({
  email: '',
  avatar_url: '',
  sign: '',
})
const savingBasic = ref(false)

const avatarFallback = computed(() => {
  return basicForm.email ? basicForm.email.charAt(0).toUpperCase() : 'U'
})

// ===== 修改密码 =====
const passwordForm = reactive({
  oldpwd: '',
  newpwd: '',
  confirmpwd: '',
})
const savingPassword = ref(false)

// ===== 通知设置 =====
const notifyForm = reactive({
  remind_expire: 0,
  remind_traffic: 0,
})
const savingNotify = ref(false)

// ===== 安全设置 =====
const resetting = ref(false)
const newToken = ref('')

// ===== 在线会话 =====
const sessions = ref<any[]>([])
const sessionsLoading = ref(false)
const removingSession = ref<any>(null)

// ===== Telegram 绑定 =====
const telegramBotUsername = ref('')
const telegramGroupUrl = ref('')
const showBindModal = ref(false)
const subscribeUrl = ref('')

const bindCommand = computed(() => {
  if (!subscribeUrl.value) return '/bind'
  return `/bind ${subscribeUrl.value}`
})

const fetchTelegramInfo = async () => {
  try {
    const [botRes, subRes] = await Promise.allSettled([
      userApi.getTelegramBotInfo(),
      userApi.getSubscribe(),
    ])
    if (botRes.status === 'fulfilled') {
      const res = botRes.value as any
      const username = res.data?.username
      if (username && !String(res.message || '').includes('Not Found')) {
        telegramBotUsername.value = username
      }
    }
    if (subRes.status === 'fulfilled') {
      subscribeUrl.value = subRes.value.data?.subscribe_url || ''
    }
    telegramGroupUrl.value = window.settings?.telegram_group || ''
  } catch {
    // 静默失败
  }
}

const copyBindCommand = async () => {
  try {
    await navigator.clipboard.writeText(bindCommand.value)
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

// ===== 初始化表单 =====
const initForm = () => {
  const user = userStore.user
  if (user) {
    basicForm.email = user.email || ''
    basicForm.avatar_url = user.avatar_url || ''
    basicForm.sign = user.sign || ''
    notifyForm.remind_expire = user.remind_expire ? 1 : 0
    notifyForm.remind_traffic = user.remind_traffic ? 1 : 0
  }
}

// ===== 保存基本信息 =====
const handleSaveBasic = async () => {
  if (basicForm.avatar_url && !isValidHttpUrl(basicForm.avatar_url)) {
    message.warning(t('profile.avatarUrlInvalid'))
    return
  }
  const sign = truncate(basicForm.sign, 200)
  savingBasic.value = true
  try {
    await userApi.update({
      avatar_url: basicForm.avatar_url,
      sign,
    })
    message.success(t('common.success'))
    await userStore.fetchUser()
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    savingBasic.value = false
  }
}

// ===== 修改密码 =====
const handleChangePassword = async () => {
  if (!passwordForm.oldpwd || !passwordForm.newpwd) {
    message.warning(t('profile.passwordEmpty'))
    return
  }
  if (passwordForm.newpwd !== passwordForm.confirmpwd) {
    message.error(t('profile.passwordMismatch'))
    return
  }
  savingPassword.value = true
  try {
    await userApi.changePassword(passwordForm.oldpwd, passwordForm.newpwd)
    message.success(t('common.success'))
    passwordForm.oldpwd = ''
    passwordForm.newpwd = ''
    passwordForm.confirmpwd = ''
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    savingPassword.value = false
  }
}

// ===== 通知设置开关 =====
const handleToggleNotify = async (key: 'remind_expire' | 'remind_traffic', value: boolean) => {
  const oldValue = notifyForm[key]
  notifyForm[key] = value ? 1 : 0
  savingNotify.value = true
  try {
    await userApi.update({
      remind_expire: !!notifyForm.remind_expire,
      remind_traffic: !!notifyForm.remind_traffic,
    } as any)
    message.success(t('common.success'))
    await userStore.fetchUser()
  } catch (err: any) {
    notifyForm[key] = oldValue
    message.error(err?.message || t('common.failed'))
  } finally {
    savingNotify.value = false
  }
}

// ===== 重置令牌 =====
const handleResetToken = async () => {
  resetting.value = true
  newToken.value = ''
  try {
    const res = await userApi.resetSecurity()
    newToken.value = res.data.token
    message.success(t('profile.resetTokenSuccess'))
    await userStore.fetchUser()
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    resetting.value = false
  }
}

// ===== 复制令牌 =====
const copyToken = async () => {
  if (!newToken.value) return
  try {
    await navigator.clipboard.writeText(newToken.value)
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

// ===== 获取在线会话列表 =====
const fetchSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await userApi.getActiveSession()
    sessions.value = res.data || []
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    sessionsLoading.value = false
  }
}

// ===== 移除在线会话 =====
const handleRemoveSession = async (id: any) => {
  removingSession.value = id
  try {
    await userApi.removeActiveSession(id)
    message.success(t('common.success'))
    await fetchSessions()
  } catch (err: any) {
    message.error(err?.message || t('common.failed'))
  } finally {
    removingSession.value = null
  }
}

// ===== 生命周期 =====
onMounted(async () => {
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMediaChange)

  if (!userStore.user) {
    await userStore.fetchUser()
  }
  initForm()
  // 拉取在线会话列表
  fetchSessions()
  // 拉取 Telegram 绑定信息
  fetchTelegramInfo()
})

onBeforeUnmount(() => {
  mediaQuery.removeEventListener('change', handleMediaChange)
})
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 页面标题 */
.page-header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: var(--stellar-text); margin: 0; }
.page-sub { font-size: 13px; color: var(--stellar-text-muted); margin: 0; }

/* 双栏网格 */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.grid-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* 卡片区块 */
.content-card { background: var(--stellar-bg-card); border: 1px solid var(--stellar-border); border-radius: 12px; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--stellar-border-light); }
.card-title-group { display: flex; align-items: center; gap: 10px; }
.section-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-title { font-size: 15px; font-weight: 600; color: var(--stellar-text); margin: 0; }
.card-body { padding: 20px; }

/* 表单底部按钮 */
.form-footer { display: flex; justify-content: flex-end; padding-top: 4px; }

/* 头像输入字段 */
.avatar-field { display: flex; align-items: center; gap: 12px; width: 100%; }
.avatar-field :deep(.n-input) { flex: 1; }

/* 通知设置列表 */
.notify-list { display: flex; flex-direction: column; }
.notify-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--stellar-border-light); }
.notify-item:last-child { border-bottom: none; }
.notify-info { display: flex; align-items: center; gap: 12px; }
.notify-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notify-label { font-size: 14px; color: var(--stellar-text); font-weight: 500; }

/* 安全设置 */
.security-alert { margin-bottom: 16px; }
.security-actions { display: flex; gap: 12px; }
.token-alert { margin-top: 16px; }
.token-header { font-weight: 600; }
.token-display { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.token-value { flex: 1; min-width: 0; font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 13px; color: var(--stellar-text); background: var(--stellar-bg-hover); padding: 8px 12px; border-radius: 6px; word-break: break-all; }

/* Telegram 绑定 */
.telegram-actions { display: flex; flex-direction: column; }
.telegram-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--stellar-border-light); }
.telegram-item:last-child { border-bottom: none; }
.telegram-info { display: flex; flex-direction: column; gap: 4px; }
.telegram-label { font-size: 14px; font-weight: 500; color: var(--stellar-text); }
.telegram-desc { font-size: 12px; color: var(--stellar-text-muted); }

/* Telegram 绑定弹窗 */
.bind-modal-body { display: flex; flex-direction: column; gap: 20px; padding: 8px 0; }
.bind-step { display: flex; gap: 14px; }
.step-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--stellar-primary); color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.step-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.step-title { font-size: 14px; font-weight: 600; color: var(--stellar-text); margin: 0; }
.step-desc { font-size: 13px; color: var(--stellar-text-muted); margin: 0; }
.bind-command { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.bind-command code { flex: 1; min-width: 0; font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 12px; color: var(--stellar-text); background: var(--stellar-bg-hover); padding: 8px 12px; border-radius: 6px; word-break: break-all; }

/* 在线会话列表 */
.session-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 48px 0; color: var(--stellar-text-muted); font-size: 13px; }
.session-empty { display: flex; align-items: center; justify-content: center; padding: 48px 0; color: var(--stellar-text-muted); font-size: 13px; }
.session-more { text-align: center; padding: 10px; font-size: 12px; color: var(--stellar-text-muted); }
.session-list { display: flex; flex-direction: column; }
.session-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--stellar-border-light); }
.session-item:last-child { border-bottom: none; }
.session-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.session-ip { font-size: 14px; font-weight: 500; color: var(--stellar-text); display: flex; align-items: center; gap: 8px; }
.session-current { font-size: 12px; font-weight: 400; color: var(--stellar-primary); background: var(--stellar-bg-hover); padding: 1px 6px; border-radius: 4px; }
.session-time { font-size: 12px; color: var(--stellar-text-muted); }
.loading-dot { width: 14px; height: 14px; border: 2px solid var(--stellar-border); border-top-color: var(--stellar-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 移动端适配 */
@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 18px; }
  .form-footer { justify-content: stretch; }
  .form-footer :deep(.n-button) { width: 100%; }
  .security-actions :deep(.n-button) { width: 100%; }
  .avatar-field { flex-direction: column; align-items: stretch; gap: 10px; }
  .session-item { flex-direction: column; align-items: stretch; gap: 10px; }
  .session-item :deep(.n-button) { width: 100%; }
}
</style>

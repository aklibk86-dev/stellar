<template>
  <div class="invite-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-text">
        <h2 class="page-title">{{ t('invite.title') }}</h2>
        <p class="page-sub">{{ t('invite.subtitle') }}</p>
      </div>
      <n-button type="primary" @click="generateCode" :loading="generating">
        <template #icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </template>
        {{ t('invite.generateNew') }}
      </n-button>
    </div>

    <!-- 提示词条 -->
    <div class="tips-bar">
      <div class="tip-item" v-for="tip in inviteTips" :key="tip.text">
        <div class="tip-icon" :style="tip.style">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="tip.icon"></svg>
        </div>
        <span class="tip-text">{{ tip.text }}</span>
      </div>
    </div>

    <!-- 统计卡片网格 -->
    <div class="stats-grid">
      <!-- 可提现佣金（突出显示） -->
      <div class="stat-card highlight-card">
        <div class="stat-icon" style="background: rgba(245,158,11,0.15); color: #f59e0b;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">{{ t('invite.availableCommission') }}</span>
          <span class="stat-value">¥{{ formatMoney(availableCommission) }}</span>
          <div class="stat-actions">
            <n-button size="tiny" quaternary :disabled="availableCommission <= 0" @click="openTransfer">
              {{ t('invite.transfer') }}
            </n-button>
            <n-button size="tiny" type="primary" :disabled="availableCommission <= 0" @click="openCashWithdrawal">
              {{ t('invite.cashWithdraw') }}
            </n-button>
          </div>
        </div>
      </div>

      <!-- 已注册用户 -->
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59,130,246,0.15); color: #3b82f6;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">{{ t('invite.invitedUsers') }}</span>
          <span class="stat-value">{{ inviteCount }} <span class="stat-unit">{{ t('invite.people') }}</span></span>
        </div>
      </div>

      <!-- 佣金比例 -->
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(139,92,246,0.15); color: #8b5cf6;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">{{ t('invite.commissionRate') }}</span>
          <span class="stat-value">{{ commissionRate }}<span class="stat-unit">%</span></span>
        </div>
      </div>

      <!-- 确认中佣金 -->
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(249,115,22,0.15); color: #f97316;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">{{ t('invite.pendingCommission') }}</span>
          <span class="stat-value">¥{{ formatMoney(pendingCommission) }}</span>
        </div>
      </div>

      <!-- 累计佣金 -->
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: #10b981;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 6l-9.5 9.5-5-5L1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">{{ t('invite.totalCommission') }}</span>
          <span class="stat-value">¥{{ formatMoney(totalCommission) }}</span>
        </div>
      </div>
    </div>

    <!-- 邀请码管理 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('invite.inviteCodeManage') }}</h3>
        <n-button size="small" type="primary" @click="generateCode" :loading="generating">
          {{ t('invite.generateNew') }}
        </n-button>
      </div>
      <div class="table-wrapper">
        <div v-if="loading" class="table-loading">
          <span class="loading-dot"></span>
          <span>{{ t('common.loading') }}</span>
        </div>
        <div v-else-if="inviteCodes.length === 0" class="table-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
          <p>{{ t('common.noData') }}</p>
        </div>
        <table v-else class="custom-table">
          <thead>
            <tr>
              <th>{{ t('invite.inviteCode') }}</th>
              <th style="text-align: right;">{{ t('common.time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inviteCodes" :key="item.code">
              <td>
                <div class="code-cell">
                  <span class="code-text">{{ item.code }}</span>
                  <button class="copy-link-btn" @click="copyInviteLink(item.code)">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {{ t('invite.copyInvite') }}
                  </button>
                </div>
              </td>
              <td style="text-align: right;" class="time-cell">{{ formatDate(item.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 佣金发放记录 -->
    <div class="content-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('invite.commissionLog') }}</h3>
      </div>
      <div class="table-wrapper">
        <div v-if="logLoading" class="table-loading">
          <span class="loading-dot"></span>
          <span>{{ t('common.loading') }}</span>
        </div>
        <div v-else-if="commissionLogs.length === 0" class="table-empty">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p>{{ t('common.noData') }}</p>
        </div>
        <template v-else>
          <table class="custom-table">
            <thead>
              <tr>
                <th>{{ t('invite.recordTime') }}</th>
                <th style="text-align: right;">{{ t('invite.commissionAmount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, idx) in pagedLogs" :key="idx">
                <td class="time-cell">{{ formatDate(log.created_at) }}</td>
                <td style="text-align: right;" class="amount-cell">¥{{ formatMoney(log.amount || log.get_amount) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="table-pagination">
            <n-pagination
              v-model:page="logPage"
              :page-count="logTotalPages"
              :page-size="logPageSize"
              size="small"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- 划转佣金弹窗 -->
    <n-modal
      v-model:show="transferVisible"
      preset="card"
      :title="t('invite.transfer')"
      style="max-width: 460px;"
      :mask-closable="false"
    >
      <div class="withdraw-modal">
        <div class="withdraw-info">
          <span class="withdraw-info-label">{{ t('invite.availableCommission') }}</span>
          <span class="withdraw-info-amount">¥{{ formatMoney(availableCommission) }}</span>
        </div>
        <n-form label-placement="top">
          <n-form-item :label="t('invite.transferAmount')">
            <n-input-number
              v-model:value="transferAmount"
              :min="0"
              :max="availableCommission / 100"
              :precision="2"
              :step="0.01"
              placeholder="0.00"
              style="width: 100%;"
            />
          </n-form-item>
        </n-form>
        <div class="withdraw-footer">
          <n-button @click="transferVisible = false">{{ t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="transferring"
            :disabled="!transferAmount || transferAmount <= 0"
            @click="confirmTransfer"
          >
            {{ t('common.confirm') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- 提现弹窗 -->
    <n-modal
      v-model:show="cashWithdrawVisible"
      preset="card"
      :title="t('invite.cashWithdraw')"
      style="max-width: 460px;"
      :mask-closable="false"
    >
      <div class="withdraw-modal">
        <div class="withdraw-info">
          <span class="withdraw-info-label">{{ t('invite.availableCommission') }}</span>
          <span class="withdraw-info-amount">¥{{ formatMoney(availableCommission) }}</span>
        </div>
        <n-form label-placement="top">
          <n-form-item :label="t('invite.withdrawAmount')">
            <n-input-number
              v-model:value="cashWithdrawAmount"
              :min="0"
              :max="availableCommission / 100"
              :precision="2"
              :step="0.01"
              placeholder="0.00"
              style="width: 100%;"
            />
          </n-form-item>
          <n-form-item :label="t('invite.withdrawAccount')">
            <n-input
              v-model:value="withdrawAccount"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              :placeholder="t('invite.withdrawAccountPlaceholder')"
            />
          </n-form-item>
        </n-form>
        <div class="withdraw-footer">
          <n-button @click="cashWithdrawVisible = false">{{ t('common.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="cashWithdrawing"
            :disabled="!cashWithdrawAmount || cashWithdrawAmount <= 0 || !withdrawAccount"
            @click="confirmCashWithdraw"
          >
            {{ t('common.confirm') }}
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, NButton, NModal, NForm, NFormItem, NInputNumber, NInput, NPagination } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import { formatDate, formatMoney, copyToClipboard } from '@/utils/format'

const { t } = useI18n()
const message = useMessage()
const userStore = useUserStore()

// ===== 邀请码列表 =====
interface InviteCode {
  user_id: number
  code: string
  pv: number
  status: boolean
  created_at: number
  updated_at: number
}
const inviteCodes = ref<InviteCode[]>([])
const loading = ref(false)

// ===== 统计数据 =====
const stat = ref<number[]>([0, 0, 0, 0, 0])

const inviteCount = computed(() => stat.value[0] || 0)
const pendingCommission = computed(() => stat.value[1] || 0)
const totalCommission = computed(() => stat.value[2] || 0)
const commissionRate = computed(() => stat.value[3] || 0)
const availableCommission = computed(() => stat.value[4] || userStore.commissionBalance || 0)

// ===== 提示词条 =====
const inviteTips = computed(() => [
  {
    icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',
    text: t('invite.tipShare'),
    style: 'background: rgba(59,130,246,0.12); color: #3b82f6;',
  },
  {
    icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    text: t('invite.tipCommission'),
    style: 'background: rgba(245,158,11,0.12); color: #f59e0b;',
  },
  {
    icon: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><polyline points="17 6 23 6 23 12"/>',
    text: t('invite.tipWithdraw'),
    style: 'background: rgba(16,185,129,0.12); color: #10b981;',
  },
])

// ===== 佣金记录 =====
interface CommissionLog {
  id?: number
  created_at: number
  amount?: number
  get_amount?: number
}
const commissionLogs = ref<CommissionLog[]>([])
const logLoading = ref(false)
const logPage = ref(1)
const logPageSize = 10
const logTotalPages = computed(() =>
  Math.max(1, Math.ceil(commissionLogs.value.length / logPageSize)),
)
const pagedLogs = computed(() => {
  const start = (logPage.value - 1) * logPageSize
  return commissionLogs.value.slice(start, start + logPageSize)
})

// ===== 生成新邀请码 =====
const generating = ref(false)

// ===== 划转佣金 =====
const transferVisible = ref(false)
const transferAmount = ref<number | null>(null)
const transferring = ref(false)

// ===== 提现佣金 =====
const cashWithdrawVisible = ref(false)
const cashWithdrawAmount = ref<number | null>(null)
const withdrawAccount = ref('')
const cashWithdrawing = ref(false)

// ===== 数据获取 =====
const fetchInviteData = async () => {
  loading.value = true
  try {
    const res = await userApi.getInviteList()
    const payload: any = res.data
    if (payload && Array.isArray(payload.codes)) {
      inviteCodes.value = payload.codes
    } else if (Array.isArray(payload)) {
      inviteCodes.value = payload
    } else {
      inviteCodes.value = []
    }
    if (payload && Array.isArray(payload.stat)) {
      stat.value = payload.stat
    }
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    loading.value = false
  }
}

const fetchInviteDetails = async () => {
  logLoading.value = true
  try {
    const res = await userApi.getInviteDetails()
    const payload: any = res.data
    if (Array.isArray(payload)) {
      commissionLogs.value = payload
        .filter((item: any) => item.commission_amount || item.get_amount)
        .map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          amount: item.commission_amount || item.get_amount || 0,
        }))
    } else if (payload && Array.isArray(payload.data)) {
      commissionLogs.value = payload.data
        .filter((item: any) => item.commission_amount || item.get_amount)
        .map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          amount: item.commission_amount || item.get_amount || 0,
        }))
    } else {
      commissionLogs.value = []
    }
  } catch {
    commissionLogs.value = []
  } finally {
    logLoading.value = false
  }
}

// ===== 复制邀请链接 =====
const copyInviteLink = async (code: string) => {
  if (!code) return
  const base = window.routerBase || '/'
  const url = `${window.location.origin}${base}register?invite_code=${code}`
  try {
    await copyToClipboard(url)
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

// ===== 生成新邀请码 =====
const generateCode = async () => {
  generating.value = true
  try {
    await userApi.saveInvite()
    message.success(t('common.success'))
    await fetchInviteData()
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    generating.value = false
  }
}

// ===== 划转佣金 =====
const openTransfer = () => {
  transferAmount.value = availableCommission.value > 0 ? Number((availableCommission.value / 100).toFixed(2)) : 0
  transferVisible.value = true
}

const confirmTransfer = async () => {
  if (!transferAmount.value || transferAmount.value <= 0) return
  const amountInCents = Math.round(transferAmount.value * 100)
  if (amountInCents > availableCommission.value) {
    message.error(t('invite.amountExceed'))
    return
  }
  transferring.value = true
  try {
    await userApi.transfer(amountInCents)
    message.success(t('common.success'))
    transferVisible.value = false
    transferAmount.value = null
    await Promise.all([userStore.fetchUser(), fetchInviteData(), fetchInviteDetails()])
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    transferring.value = false
  }
}

// ===== 提现佣金(通过工单) =====
const openCashWithdrawal = () => {
  cashWithdrawAmount.value = availableCommission.value > 0 ? Number((availableCommission.value / 100).toFixed(2)) : 0
  withdrawAccount.value = ''
  cashWithdrawVisible.value = true
}

const confirmCashWithdraw = async () => {
  if (!cashWithdrawAmount.value || cashWithdrawAmount.value <= 0) return
  if (!withdrawAccount.value.trim()) {
    message.error(t('invite.withdrawAccountRequired'))
    return
  }
  const amountInCents = Math.round(cashWithdrawAmount.value * 100)
  if (amountInCents > availableCommission.value) {
    message.error(t('invite.amountExceed'))
    return
  }
  cashWithdrawing.value = true
  try {
    const subject = t('invite.cashWithdrawSubject', { amount: cashWithdrawAmount.value })
    const messageText = t('invite.cashWithdrawBody', {
      amount: cashWithdrawAmount.value,
      account: withdrawAccount.value,
    })
    await userApi.createTicket(subject, 1, messageText)
    message.success(t('invite.cashWithdrawSubmitted'))
    cashWithdrawVisible.value = false
    cashWithdrawAmount.value = null
    withdrawAccount.value = ''
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    cashWithdrawing.value = false
  }
}

// ===== 初始化 =====
onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  await Promise.all([fetchInviteData(), fetchInviteDetails()])
})
</script>

<style scoped>
.invite-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.stat-card {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: all 0.2s;
}
.stat-card:hover {
  border-color: var(--stellar-border-hover, var(--stellar-primary));
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.highlight-card {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02));
  border-color: rgba(245,158,11,0.3);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.stat-label {
  font-size: 12px;
  color: var(--stellar-text-muted);
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--stellar-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat-unit {
  font-size: 14px;
  font-weight: 500;
  color: var(--stellar-text-muted);
}
.stat-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

/* 内容卡片 */
.content-card {
  background: var(--stellar-bg-card);
  border: 1px solid var(--stellar-border);
  border-radius: 12px;
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--stellar-border-light);
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--stellar-text);
  margin: 0;
}

/* 表格容器 */
.table-wrapper {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

/* 自定义表格 */
.custom-table {
  width: 100%;
  border-collapse: collapse;
}
.custom-table thead tr {
  background: var(--stellar-bg-hover);
}
.custom-table th {
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--stellar-text-secondary);
  text-align: left;
  white-space: nowrap;
}
.custom-table td {
  padding: 14px 20px;
  font-size: 13px;
  color: var(--stellar-text);
  border-top: 1px solid var(--stellar-border-light);
}
.custom-table tbody tr:hover {
  background: var(--stellar-bg-hover);
}

/* 邀请码单元格 */
.code-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.code-text {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  color: var(--stellar-text);
  font-weight: 500;
}
.copy-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--stellar-primary);
  padding: 3px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}
.copy-link-btn:hover {
  background: var(--stellar-primary-light, rgba(59,130,246,0.1));
}

.time-cell {
  color: var(--stellar-text-muted);
  font-size: 12px;
  white-space: nowrap;
}
.amount-cell {
  font-weight: 600;
  color: var(--stellar-primary);
}

/* 表格加载/空状态 */
.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
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
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: var(--stellar-text-muted);
}
.table-empty p {
  font-size: 13px;
  margin: 0;
}

/* 分页 */
.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--stellar-border-light);
}

/* 提现弹窗 */
.withdraw-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.withdraw-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--stellar-bg-hover);
  border-radius: 8px;
}
.withdraw-info-label {
  font-size: 13px;
  color: var(--stellar-text-muted);
}
.withdraw-info-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--stellar-primary);
}
.withdraw-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .highlight-card {
    grid-column: span 1;
  }
  .stat-actions {
    width: 100%;
  }
  .stat-actions :deep(.n-button) {
    flex: 1;
  }
  .custom-table th,
  .custom-table td {
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

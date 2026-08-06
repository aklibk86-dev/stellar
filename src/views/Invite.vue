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
            <n-button size="tiny" type="primary" :disabled="availableCommission <= 0 || withdrawUnavailable" @click="openCashWithdrawal">
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

    <!-- 分享到社交媒体 -->
    <div v-if="socialSharingEnabled" class="content-card share-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('invite.shareToSocial') }}</h3>
      </div>
      <div class="share-content">
        <p class="share-desc">{{ t('invite.shareDesc') }}</p>
        <div class="share-body">
          <div class="qr-section">
            <div class="qr-code-wrapper" v-if="qrCodeUrl">
              <img :src="qrCodeUrl" alt="QR Code" class="qr-code-img" />
            </div>
            <div v-else class="qr-placeholder">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h3v3h-3z"/>
                <path d="M20 14h1v1h-1z"/>
                <path d="M14 20h1v1h-1z"/>
                <path d="M20 20h1v1h-1z"/>
              </svg>
              <span>{{ t('invite.generatingQr') }}</span>
            </div>
            <button class="save-qr-btn" @click="saveQrCode" :disabled="!qrCodeUrl">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ t('invite.saveQrCode') }}
            </button>
          </div>
          <div class="platforms-section">
            <span class="platforms-title">{{ t('invite.shareToPlatform') }}</span>
            <div class="share-platforms">
              <button v-if="isSharePlatformEnabled('wechat')" class="share-btn share-wechat" @click="shareToWeChat">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.406-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg>
                <span>{{ t('invite.wechat') }}</span>
              </button>
              <button v-if="isSharePlatformEnabled('qq')" class="share-btn share-qq" @click="shareToQQ">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .573-.432.573-.432s-.058.19-.058.665c0 .432.259 1.01.758 1.01.366 0 .743-.257.743-.257s.374.257.876.257c.502 0 1.437-.347 1.937-1.054.343.207 1.148.345 1.939.345.789 0 1.592-.138 1.935-.345.5 1.054 1.435 1.054 1.937 1.054.502 0 .876-.257.876-.257s.377.257.743.257c.499 0 .758-.578.758-1.01 0-.475-.058-.665-.058-.665s.459.432.573.432c.111 0 .281-.36.281-1.025 0-2.514-2.164-6.954-2.164-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
                </svg>
                <span>{{ t('invite.qq') }}</span>
              </button>
              <button v-if="isSharePlatformEnabled('weibo')" class="share-btn share-weibo" @click="shareToWeibo">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.381-1.017.42-1.894-.003-2.519-.789-1.16-2.947-1.108-5.388-.034 0 0-.778.345-.58-.271.381-1.216.324-2.232-.27-2.824-1.346-1.34-4.912.051-7.953 3.1C1.389 10.703 0 12.782 0 14.572c0 3.487 4.534 5.67 8.926 5.67 5.776 0 9.649-3.478 9.649-6.228 0-1.66-1.396-2.607-2.516-2.865zm2.298-6.748c-.768-.927-1.9-1.391-3.003-1.391v-.002c-.391 0-.783.05-1.164.15-.505.132-.804.652-.672 1.158.132.505.652.804 1.158.672.252-.066.51-.098.769-.098.628 0 1.236.253 1.656.709.445.472.657 1.097.646 1.754v.008c0 .379.064.765.207 1.142.186.49.723.739 1.213.553.49-.186.739-.723.553-1.213-.229-.604-.353-1.189-.365-1.748.001-.644-.2-1.278-.598-1.794zm-2.172 2.781c-.138-.184-.315-.338-.52-.452-.406-.226-.877-.288-1.327-.164-.478.131-.804.564-.827 1.066v.026c-.046.52.25 1.058.76 1.31.473.233 1.016.226 1.503-.023.48-.245.811-.739.866-1.305v-.032c.043-.468-.142-.93-.455-1.426z"/>
                </svg>
                <span>{{ t('invite.weibo') }}</span>
              </button>
              <button v-if="isSharePlatformEnabled('twitter')" class="share-btn share-twitter" @click="shareToTwitter">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>{{ t('invite.twitter') }}</span>
              </button>
              <button v-if="isSharePlatformEnabled('telegram')" class="share-btn share-telegram" @click="shareToTelegram">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>{{ t('invite.telegram') }}</span>
              </button>
              <button v-if="isSharePlatformEnabled('facebook')" class="share-btn share-facebook" @click="shareToFacebook">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{{ t('invite.facebook') }}</span>
              </button>
              <button v-if="isSharePlatformEnabled('copy')" class="share-btn share-link" @click="copyCurrentInviteLink">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span>{{ t('invite.copyLink') }}</span>
              </button>
            </div>
            <div class="share-link-box" v-if="defaultInviteCode">
              <span class="share-link-label">{{ t('invite.inviteLink') }}</span>
              <div class="share-link-row">
                <span class="share-link-url">{{ getInviteLink(defaultInviteCode) }}</span>
                <button class="share-copy-btn" @click="copyCurrentInviteLink">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
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
          <n-form-item :label="t('invite.withdrawMethod')">
            <n-select
              v-model:value="withdrawMethod"
              :options="withdrawMethodOptions"
              :placeholder="t('invite.withdrawMethodPlaceholder')"
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
            :disabled="!withdrawMethod || !withdrawAccount.trim()"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'
import { formatDate, formatMoney, copyToClipboard } from '@/utils/format'
import QRCode from 'qrcode'

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
const stat = ref<number[]>([])

const inviteCount = computed(() => stat.value[0] || 0)
const pendingCommission = computed(() => stat.value[2] || 0)
const totalCommission = computed(() => stat.value[1] || 0)
const commissionRate = computed(() => stat.value[3] || 0)
const availableCommission = computed(() => stat.value[4] ?? userStore.commissionBalance ?? 0)

const defaultInviteCode = computed(() => {
  return inviteCodes.value.length > 0 ? inviteCodes.value[0].code : ''
})

const getInviteLink = (code: string) => {
  if (!code) return ''
  const base = window.routerBase || '/'
  return `${window.location.origin}${base}register?invite_code=${code}`
}

const qrCodeUrl = ref('')

const generateQrCode = async (code: string) => {
  if (!code) {
    qrCodeUrl.value = ''
    return
  }
  try {
    const url = getInviteLink(code)
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
    qrCodeUrl.value = dataUrl
  } catch (e) {
    console.error('QR code generation failed:', e)
    qrCodeUrl.value = ''
  }
}

watch(defaultInviteCode, (newCode) => {
  generateQrCode(newCode)
}, { immediate: true })

const saveQrCode = () => {
  if (!qrCodeUrl.value) return
  const link = document.createElement('a')
  link.href = qrCodeUrl.value
  link.download = `invite-qrcode-${defaultInviteCode.value || 'code'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success(t('invite.qrSaved'))
}

const socialSharingConfig = computed(() => window.settings?.social_sharing || {})
const socialSharingEnabled = computed(() => socialSharingConfig.value.enabled !== false)
const enabledSharePlatforms = computed(() => new Set(
  (socialSharingConfig.value.platforms || []).map((platform) => String(platform).trim().toLowerCase()),
))
const isSharePlatformEnabled = (platform: string) => (
  enabledSharePlatforms.value.size === 0 || enabledSharePlatforms.value.has(platform)
)
const shareTitle = computed(() => socialSharingConfig.value.title?.trim() || t('invite.shareTitle'))
const shareDesc = computed(() => socialSharingConfig.value.description?.trim() || t('invite.shareDescription'))

const shareToWeChat = () => {
  message.info(t('invite.wechatShareTip'))
}

const shareToQQ = () => {
  if (!defaultInviteCode.value) return
  const url = encodeURIComponent(getInviteLink(defaultInviteCode.value))
  const title = encodeURIComponent(shareTitle.value)
  const desc = encodeURIComponent(shareDesc.value)
  window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&desc=${desc}`, '_blank')
}

const shareToWeibo = () => {
  if (!defaultInviteCode.value) return
  const url = encodeURIComponent(getInviteLink(defaultInviteCode.value))
  const title = encodeURIComponent(shareTitle.value)
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank')
}

const shareToTwitter = () => {
  if (!defaultInviteCode.value) return
  const url = encodeURIComponent(getInviteLink(defaultInviteCode.value))
  const text = encodeURIComponent(shareTitle.value)
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
}

const shareToTelegram = () => {
  if (!defaultInviteCode.value) return
  const url = encodeURIComponent(getInviteLink(defaultInviteCode.value))
  const text = encodeURIComponent(shareTitle.value)
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
}

const shareToFacebook = () => {
  if (!defaultInviteCode.value) return
  const url = encodeURIComponent(getInviteLink(defaultInviteCode.value))
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const copyCurrentInviteLink = async () => {
  if (!defaultInviteCode.value) return
  try {
    await copyToClipboard(getInviteLink(defaultInviteCode.value))
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

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
const withdrawMethods = ref<string[]>([])
const withdrawMethod = ref<string | null>(null)
const withdrawClosed = ref(false)
const withdrawAccount = ref('')
const cashWithdrawing = ref(false)
const withdrawMethodOptions = computed(() => withdrawMethods.value.map(value => ({ label: value, value })))
const withdrawUnavailable = computed(() => withdrawClosed.value || withdrawMethods.value.length === 0)

// ===== 数据获取 =====
const fetchInviteData = async () => {
  loading.value = true
  try {
    const res = await userApi.getInviteList()
    const payload: any = res.data
    // 兼容多种后端响应格式:
    // 1) { data: [...], total } 标准分页格式
    // 2) { codes: [...], stat: [...] } 老格式
    // 3) [...] 直接数组
    if (payload && Array.isArray(payload.data)) {
      inviteCodes.value = payload.data
    } else if (payload && Array.isArray(payload.codes)) {
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

const fetchUserConfig = async () => {
  try {
    const res = await userApi.getConfig()
    withdrawClosed.value = res.data?.withdraw_close === 1
    withdrawMethods.value = Array.isArray(res.data?.withdraw_methods) ? res.data.withdraw_methods : []
    withdrawMethod.value = withdrawMethods.value[0] || null
  } catch {
    withdrawClosed.value = true
    withdrawMethods.value = []
    withdrawMethod.value = null
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
    await Promise.all([userStore.fetchUser(true), fetchInviteData(), fetchInviteDetails()])
  } catch (e: any) {
    message.error(e?.message || t('common.failed'))
  } finally {
    transferring.value = false
  }
}

// ===== 提现佣金(通过工单) =====
const openCashWithdrawal = () => {
  if (withdrawClosed.value || withdrawMethods.value.length === 0) {
    message.warning(t('invite.withdrawUnavailable'))
    return
  }
  withdrawMethod.value = withdrawMethod.value || withdrawMethods.value[0] || null
  withdrawAccount.value = ''
  cashWithdrawVisible.value = true
}

const confirmCashWithdraw = async () => {
  if (!withdrawMethod.value) {
    message.error(t('invite.withdrawMethodRequired'))
    return
  }
  if (!withdrawAccount.value.trim()) {
    message.error(t('invite.withdrawAccountRequired'))
    return
  }
  cashWithdrawing.value = true
  try {
    await userApi.withdrawTicket(withdrawMethod.value, withdrawAccount.value.trim())
    message.success(t('invite.cashWithdrawSubmitted'))
    cashWithdrawVisible.value = false
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
  await Promise.all([fetchInviteData(), fetchInviteDetails(), fetchUserConfig()])
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

/* 分享卡片 */
.share-card .share-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.share-desc {
  margin: 0;
  font-size: 13px;
  color: var(--stellar-text-muted);
  line-height: 1.6;
}
.share-body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.qr-section {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.qr-code-wrapper {
  width: 200px;
  height: 200px;
  padding: 8px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--stellar-border-light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.qr-code-img {
  width: 100%;
  height: 100%;
  display: block;
}
.qr-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  border: 1px dashed var(--stellar-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--stellar-text-muted);
  background: var(--stellar-bg-hover);
}
.qr-placeholder span {
  font-size: 13px;
}
.save-qr-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--stellar-primary);
  border-radius: 10px;
  background: var(--stellar-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.save-qr-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.save-qr-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.platforms-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.platforms-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--stellar-text-secondary);
}
.share-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 80px;
  padding: 14px 8px;
  border: 1px solid var(--stellar-border-light);
  border-radius: 12px;
  background: var(--stellar-bg-card);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--stellar-text-secondary);
}
.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: var(--stellar-border-hover, var(--stellar-primary));
}
.share-btn span {
  font-size: 12px;
  font-weight: 500;
}
.share-wechat {
  color: #07c160;
}
.share-wechat:hover {
  background: rgba(7, 193, 96, 0.06);
  border-color: rgba(7, 193, 96, 0.3);
}
.share-qq {
  color: #12b7f5;
}
.share-qq:hover {
  background: rgba(18, 183, 245, 0.06);
  border-color: rgba(18, 183, 245, 0.3);
}
.share-weibo {
  color: #e6162d;
}
.share-weibo:hover {
  background: rgba(230, 22, 45, 0.06);
  border-color: rgba(230, 22, 45, 0.3);
}
.share-twitter {
  color: #1da1f2;
}
.share-twitter:hover {
  background: rgba(29, 161, 242, 0.06);
  border-color: rgba(29, 161, 242, 0.3);
}
.share-telegram {
  color: #0088cc;
}
.share-telegram:hover {
  background: rgba(0, 136, 204, 0.06);
  border-color: rgba(0, 136, 204, 0.3);
}
.share-facebook {
  color: #1877f2;
}
.share-facebook:hover {
  background: rgba(24, 119, 242, 0.06);
  border-color: rgba(24, 119, 242, 0.3);
}
.share-link {
  color: var(--stellar-primary);
}
.share-link:hover {
  background: var(--stellar-primary-light, rgba(59,130,246,0.06));
  border-color: rgba(59, 130, 246, 0.3);
}
.share-link-box {
  margin-top: 4px;
  padding: 14px 16px;
  background: var(--stellar-bg-hover);
  border-radius: 10px;
  border: 1px solid var(--stellar-border-light);
}
.share-link-label {
  display: block;
  font-size: 12px;
  color: var(--stellar-text-muted);
  margin-bottom: 8px;
}
.share-link-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.share-link-url {
  flex: 1;
  font-size: 13px;
  color: var(--stellar-text);
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  word-break: break-all;
  line-height: 1.4;
}
.share-copy-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--stellar-border-light);
  border-radius: 8px;
  background: var(--stellar-bg-card);
  color: var(--stellar-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.share-copy-btn:hover {
  background: var(--stellar-primary-light, rgba(59,130,246,0.1));
  border-color: var(--stellar-primary);
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
  .share-body {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .qr-section {
    width: 100%;
    max-width: 200px;
  }
  .platforms-section {
    width: 100%;
  }
  .share-btn {
    width: calc(25% - 9px);
    min-width: 64px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .share-btn {
    width: calc(33.33% - 8px);
  }
}
</style>

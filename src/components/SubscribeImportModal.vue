<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :bordered="false"
    :auto-focus="false"
    class="subscribe-modal"
    style="width: min(920px, calc(100vw - 32px))"
  >
    <template #header>
      <div class="modal-heading">
        <div class="heading-icon">
          <StellarIcon name="download" :size="22" />
        </div>
        <div>
          <h2>{{ t('dashboard.oneClickSubscribe') }}</h2>
          <p>{{ t('dashboard.oneClickSubscribeDesc') }}</p>
        </div>
      </div>
    </template>

    <div class="subscribe-import">
      <section class="url-card">
        <div class="url-card-copy">
          <span class="eyebrow">{{ t('dashboard.copyUrl') }}</span>
          <p>{{ t('dashboard.copyUrlDesc') }}</p>
        </div>
        <div class="url-input-wrap">
          <n-input :value="normalizedSubscribeUrl" readonly size="large" class="url-input" />
          <n-button type="primary" size="large" :disabled="!normalizedSubscribeUrl" @click="copySubscribeUrl">
            {{ t('common.copy') }}
          </n-button>
        </div>
      </section>

      <div class="content-grid">
        <section class="client-panel">
          <div class="panel-header">
            <div>
              <h3>{{ t('dashboard.importTo') }}</h3>
              <p>{{ t('dashboard.importToDesc') }}</p>
            </div>
            <span class="detected-badge">{{ getPlatformLabel(detectedPlatform) }}</span>
          </div>

          <div class="platform-tabs" role="tablist">
            <button
              v-for="platform in platformTabs"
              :key="platform.key"
              class="platform-tab"
              :class="{ active: activePlatform === platform.key }"
              type="button"
              role="tab"
              :aria-selected="activePlatform === platform.key"
              @click="activePlatform = platform.key"
            >
              {{ platform.label }}
              <span>{{ countClients(platform.key) }}</span>
            </button>
          </div>

          <div class="client-list">
            <button
              v-for="client in filteredClients"
              :key="client.id"
              class="client-item"
              type="button"
              @click="importToClient(client)"
            >
              <span class="client-icon">
                <img :src="client.logo" :alt="client.name" class="client-logo" loading="lazy" />
              </span>
              <span class="client-info">
                <strong>{{ client.name }}</strong>
                <small>{{ getPlatformLabel(client.platform) }}</small>
              </span>
              <span class="import-action">
                <StellarIcon name="chevron-forward" :size="17" />
              </span>
            </button>
          </div>
        </section>

        <aside class="qr-panel">
          <div class="qr-copy">
            <h3>{{ t('dashboard.scanQRCode') }}</h3>
            <p>{{ t('dashboard.scanQRCodeDesc') }}</p>
          </div>
          <div class="qr-frame" :class="{ disabled: !normalizedSubscribeUrl }">
            <img v-if="normalizedSubscribeUrl" :src="qrCodeUrl" :alt="t('dashboard.scanQRCode')" class="qr-img" />
            <StellarIcon v-else name="qr-code" :size="64" />
          </div>
          <div class="security-tip">
            <span class="tip-dot"></span>
            {{ t('dashboard.permanent') }}
          </div>
        </aside>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, NModal, NInput, NButton } from 'naive-ui'
import StellarIcon from '@/components/StellarIcon.vue'
import { getPublicPath } from '@/utils/settings'

const props = defineProps<{
  show: boolean
  subscribeUrl: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const { t } = useI18n()
const message = useMessage()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const normalizedSubscribeUrl = computed(() => (props.subscribeUrl || '').trim())
const encodedUrl = computed(() => encodeURIComponent(normalizedSubscribeUrl.value))
const siteName = computed(() => window.settings?.title || 'Stellar')
const encodedName = computed(() => encodeURIComponent(siteName.value))
const urlSafeBase64 = computed(() => {
  try {
    return window
      .btoa(unescape(encodeURIComponent(normalizedSubscribeUrl.value)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch {
    return normalizedSubscribeUrl.value
  }
})

const qrCodeUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodedUrl.value}`,
)

type Platform = 'ios' | 'android' | 'windows' | 'mac'

interface Client {
  id: string
  name: string
  platform: Platform
  logo: string
  buildUrl: () => string
}

const detectPlatformByUA = (): Platform => {
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Mac/i.test(platform) && navigator.maxTouchPoints > 1) return 'ios'
  if (/Macintosh|Mac OS X/i.test(ua) || /Mac/i.test(platform)) return 'mac'
  return 'windows'
}

const platformTabs: Array<{ key: Platform; label: string }> = [
  { key: 'ios', label: 'iOS' },
  { key: 'android', label: 'Android' },
  { key: 'windows', label: 'Windows' },
  { key: 'mac', label: 'macOS' },
]

const detectedPlatform = ref<Platform>(detectPlatformByUA())
const activePlatform = ref<Platform>(detectedPlatform.value)

watch(
  () => props.show,
  (show) => {
    if (!show) return
    detectedPlatform.value = detectPlatformByUA()
    activePlatform.value = detectedPlatform.value
  },
)

const logoPath = (platform: string, file: string) =>
  getPublicPath(`client-logos/client-img-${platform}/${file}`)

const clashUrl = () =>
  `clash://install-config?url=${encodedUrl.value}&name=${encodedName.value}`
const surgeUrl = () =>
  `surge:///install-config?url=${encodedUrl.value}&name=${encodedName.value}`
const stashUrl = () =>
  `stash://install-config?url=${encodedUrl.value}&name=${encodedName.value}`
const quantumultXUrl = () =>
  `quantumult-x:///update-configuration?remote-resource=${encodeURI(
    JSON.stringify({ server_remote: [`${normalizedSubscribeUrl.value}, tag=${siteName.value}`] }),
  )}`
const singBoxUrl = () =>
  `sing-box://import-remote-profile?url=${encodedUrl.value}#${encodedName.value}`
const hiddifyUrl = () =>
  `hiddify://import/${normalizedSubscribeUrl.value}#${encodedName.value}`

const allClients = computed<Client[]>(() => [
  { id: 'ios-shadowrocket', name: 'Shadowrocket', platform: 'ios', logo: logoPath('ios', 'shadowrocket.png'), buildUrl: () => `shadowrocket://add/sub://${urlSafeBase64.value}?remark=${encodedName.value}` },
  { id: 'ios-surge', name: 'Surge', platform: 'ios', logo: logoPath('ios', 'Surge.png'), buildUrl: surgeUrl },
  { id: 'ios-stash', name: 'Stash', platform: 'ios', logo: logoPath('ios', 'stash.png'), buildUrl: stashUrl },
  { id: 'ios-quantumultx', name: 'Quantumult X', platform: 'ios', logo: logoPath('ios', 'quantumultx.png'), buildUrl: quantumultXUrl },
  { id: 'ios-hiddify', name: 'Hiddify', platform: 'ios', logo: logoPath('macos', 'hiddify.png'), buildUrl: hiddifyUrl },
  { id: 'ios-singbox', name: 'Sing-box', platform: 'ios', logo: logoPath('ios', 'singbox.png'), buildUrl: singBoxUrl },
  { id: 'ios-loon', name: 'Loon', platform: 'ios', logo: logoPath('ios', 'loon.png'), buildUrl: () => `loon://import?nodelist=${encodedUrl.value}&name=${encodedName.value}` },

  { id: 'android-flclash', name: 'FlClash', platform: 'android', logo: logoPath('windows', 'flclash.png'), buildUrl: clashUrl },
  { id: 'android-v2rayng', name: 'V2rayNG', platform: 'android', logo: logoPath('android', 'v2rayng.png'), buildUrl: () => `v2rayng://install-sub?url=${encodedUrl.value}#${encodedName.value}` },
  { id: 'android-clash', name: 'Clash', platform: 'android', logo: logoPath('android', 'clash.png'), buildUrl: clashUrl },
  { id: 'android-surfboard', name: 'Surfboard', platform: 'android', logo: logoPath('android', 'surfboard.png'), buildUrl: () => `surfboard:///install-config?url=${encodedUrl.value}&name=${encodedName.value}` },
  { id: 'android-clashmeta', name: 'Clash Meta', platform: 'android', logo: logoPath('android', 'clashmeta.png'), buildUrl: clashUrl },
  { id: 'android-nekobox', name: 'NekoBox', platform: 'android', logo: logoPath('android', 'nekobox.png'), buildUrl: clashUrl },
  { id: 'android-singbox', name: 'Sing-box', platform: 'android', logo: logoPath('android', 'singbox.png'), buildUrl: singBoxUrl },
  { id: 'android-hiddify', name: 'Hiddify', platform: 'android', logo: logoPath('android', 'hiddify.png'), buildUrl: hiddifyUrl },

  { id: 'windows-flclash', name: 'FlClash', platform: 'windows', logo: logoPath('windows', 'flclash.png'), buildUrl: clashUrl },
  { id: 'windows-clashverge', name: 'Clash Verge', platform: 'windows', logo: logoPath('windows', 'clashverge.png'), buildUrl: clashUrl },
  { id: 'windows-clash', name: 'Clash', platform: 'windows', logo: logoPath('windows', 'clash.png'), buildUrl: clashUrl },
  { id: 'windows-nekoray', name: 'NekoRay', platform: 'windows', logo: logoPath('windows', 'nekoray.png'), buildUrl: clashUrl },
  { id: 'windows-singbox', name: 'Sing-box', platform: 'windows', logo: logoPath('windows', 'singbox.png'), buildUrl: singBoxUrl },
  { id: 'windows-hiddify', name: 'Hiddify', platform: 'windows', logo: logoPath('windows', 'hiddify.png'), buildUrl: hiddifyUrl },

  { id: 'mac-flclash', name: 'FlClash', platform: 'mac', logo: logoPath('windows', 'flclash.png'), buildUrl: clashUrl },
  { id: 'mac-clashverge', name: 'Clash Verge', platform: 'mac', logo: logoPath('windows', 'clashverge.png'), buildUrl: clashUrl },
  { id: 'mac-clashx', name: 'ClashX', platform: 'mac', logo: logoPath('macos', 'clashx.png'), buildUrl: clashUrl },
  { id: 'mac-clashmetax', name: 'ClashX Meta', platform: 'mac', logo: logoPath('macos', 'clashmetax.png'), buildUrl: clashUrl },
  { id: 'mac-surge', name: 'Surge', platform: 'mac', logo: logoPath('macos', 'Surge.png'), buildUrl: surgeUrl },
  { id: 'mac-stash', name: 'Stash', platform: 'mac', logo: logoPath('macos', 'stash.png'), buildUrl: stashUrl },
  { id: 'mac-quantumultx', name: 'Quantumult X', platform: 'mac', logo: logoPath('macos', 'quantumultx.png'), buildUrl: quantumultXUrl },
  { id: 'mac-singbox', name: 'Sing-box', platform: 'mac', logo: logoPath('macos', 'singbox.png'), buildUrl: singBoxUrl },
  { id: 'mac-hiddify', name: 'Hiddify', platform: 'mac', logo: logoPath('macos', 'hiddify.png'), buildUrl: hiddifyUrl },
])

const filteredClients = computed(() =>
  allClients.value.filter((client) => client.platform === activePlatform.value),
)

const countClients = (platform: Platform) =>
  allClients.value.filter((client) => client.platform === platform).length

const getPlatformLabel = (platform: Platform) =>
  platformTabs.find((item) => item.key === platform)?.label || platform

const fallbackCopyText = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

const copyUrl = async (url: string) => {
  if (!url) {
    message.warning(t('dashboard.noSubscribeUrl'))
    return
  }
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
    } else if (!fallbackCopyText(url)) {
      throw new Error('Copy failed')
    }
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.failed'))
  }
}

const copySubscribeUrl = () => copyUrl(normalizedSubscribeUrl.value)

const importToClient = (client: Client) => {
  if (!normalizedSubscribeUrl.value) {
    message.warning(t('dashboard.noSubscribeUrl'))
    return
  }
  window.location.href = client.buildUrl()
}
</script>

<style scoped>
:global(.subscribe-modal.n-card) {
  border-radius: 24px;
  overflow: hidden;
  background: var(--stellar-bg-card);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
}

:global(.subscribe-modal .n-card-header) {
  padding: 24px 26px 18px;
  border-bottom: 1px solid var(--stellar-border-light);
}

:global(.subscribe-modal .n-card__content) {
  padding: 22px 26px 26px;
}

.modal-heading { display: flex; align-items: center; gap: 13px; }
.heading-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 14px; color: #fff; background: linear-gradient(135deg, var(--stellar-primary), #6366f1); box-shadow: 0 8px 18px rgba(59, 130, 246, 0.24); }
.modal-heading h2 { margin: 0; color: var(--stellar-text); font-size: 18px; line-height: 1.35; }
.modal-heading p { margin: 3px 0 0; color: var(--stellar-text-muted); font-size: 12px; font-weight: 400; }

.subscribe-import { display: flex; flex-direction: column; gap: 20px; }
.url-card { display: grid; grid-template-columns: minmax(170px, .75fr) minmax(320px, 1.6fr); align-items: center; gap: 20px; padding: 18px; border: 1px solid var(--stellar-border-light); border-radius: 16px; background: linear-gradient(135deg, var(--stellar-primary-light), var(--stellar-bg-card)); }
.eyebrow { display: block; color: var(--stellar-primary); font-size: 13px; font-weight: 700; }
.url-card-copy p, .panel-header p, .qr-copy p { margin: 4px 0 0; color: var(--stellar-text-muted); font-size: 12px; line-height: 1.55; }
.url-input-wrap { display: flex; gap: 10px; min-width: 0; }
.url-input { min-width: 0; }

.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 230px; gap: 20px; }
.client-panel, .qr-panel { min-width: 0; border: 1px solid var(--stellar-border-light); border-radius: 18px; background: var(--stellar-bg-card); }
.client-panel { padding: 18px; }
.panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.panel-header h3, .qr-copy h3 { margin: 0; color: var(--stellar-text); font-size: 15px; }
.detected-badge { flex-shrink: 0; padding: 5px 9px; border-radius: 999px; color: var(--stellar-primary); background: var(--stellar-primary-light); font-size: 11px; font-weight: 700; }

.platform-tabs { display: flex; gap: 6px; margin: 16px 0; padding: 4px; overflow-x: auto; border-radius: 12px; background: var(--stellar-bg-hover); }
.platform-tab { flex: 1; min-width: max-content; display: flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 9px; padding: 8px 10px; color: var(--stellar-text-secondary); background: transparent; font-size: 12px; cursor: pointer; transition: .2s ease; }
.platform-tab span { min-width: 18px; padding: 1px 5px; border-radius: 999px; color: var(--stellar-text-muted); background: var(--stellar-bg-card); font-size: 10px; }
.platform-tab:hover { color: var(--stellar-primary); }
.platform-tab.active { color: var(--stellar-primary); background: var(--stellar-bg-card); box-shadow: 0 3px 10px rgba(15, 23, 42, .07); font-weight: 700; }
.platform-tab.active span { color: #fff; background: var(--stellar-primary); }

.client-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; max-height: 330px; padding: 1px 4px 1px 1px; overflow-y: auto; }
.client-item { min-width: 0; display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--stellar-border-light); border-radius: 13px; color: inherit; background: var(--stellar-bg-card); text-align: left; cursor: pointer; transition: border-color .2s, background .2s, transform .2s, box-shadow .2s; }
.client-item:hover { border-color: color-mix(in srgb, var(--stellar-primary) 45%, var(--stellar-border)); background: var(--stellar-primary-light); transform: translateY(-1px); box-shadow: 0 7px 18px rgba(15, 23, 42, .07); }
.client-icon { width: 42px; height: 42px; flex-shrink: 0; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--stellar-border-light); border-radius: 11px; background: #fff; }
.client-logo { width: 34px; height: 34px; object-fit: contain; }
.client-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.client-info strong { overflow: hidden; color: var(--stellar-text); font-size: 12px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.client-info small { color: var(--stellar-text-muted); font-size: 10px; }
.import-action { width: 26px; height: 26px; flex-shrink: 0; display: grid; place-items: center; border-radius: 8px; color: var(--stellar-text-muted); background: var(--stellar-bg-hover); transition: .2s; }
.client-item:hover .import-action { color: #fff; background: var(--stellar-primary); }

.qr-panel { display: flex; flex-direction: column; align-items: center; padding: 18px; text-align: center; background: linear-gradient(180deg, var(--stellar-bg-card), var(--stellar-primary-light)); }
.qr-copy { width: 100%; }
.qr-frame { width: 174px; height: 174px; display: grid; place-items: center; margin: 18px 0 14px; padding: 9px; border: 1px solid var(--stellar-border-light); border-radius: 16px; color: var(--stellar-text-muted); background: #fff; box-shadow: 0 10px 30px rgba(15, 23, 42, .1); }
.qr-frame.disabled { opacity: .5; }
.qr-img { width: 100%; height: 100%; display: block; border-radius: 8px; object-fit: contain; }
.security-tip { display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--stellar-text-muted); font-size: 10px; }
.tip-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--stellar-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--stellar-success) 18%, transparent); }

@media (max-width: 760px) {
  :global(.subscribe-modal .n-card-header) { padding: 20px 18px 16px; }
  :global(.subscribe-modal .n-card__content) { padding: 16px 18px 20px; }
  .url-card { grid-template-columns: 1fr; gap: 12px; }
  .content-grid { grid-template-columns: 1fr; }
  .qr-panel { display: none; }
}

@media (max-width: 520px) {
  :global(.subscribe-modal.n-card) { border-radius: 18px; }
  .modal-heading p { display: none; }
  .url-input-wrap { flex-direction: column; }
  .url-input-wrap :deep(.n-button) { width: 100%; }
  .client-panel { padding: 14px; }
  .client-list { grid-template-columns: 1fr; max-height: 360px; }
  .detected-badge { display: none; }
}
</style>

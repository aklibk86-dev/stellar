<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :bordered="false"
    :auto-focus="false"
    class="subscribe-modal"
    style="width: min(860px, calc(100vw - 32px))"
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
      <div class="content-grid">
        <section v-if="clientImportEnabled" class="client-panel">
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
            </button>
            <p v-if="filteredClients.length === 0" class="client-empty">
              {{ t('dashboard.noClientsConfigured') }}
            </p>
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
import { useMessage, NModal } from 'naive-ui'
import StellarIcon from '@/components/StellarIcon.vue'
import { getPublicPath } from '@/utils/settings'
import QRCode from 'qrcode'

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

const qrCodeUrl = ref('')

watch(normalizedSubscribeUrl, async (url) => {
  if (!url) {
    qrCodeUrl.value = ''
    return
  }
  try {
    qrCodeUrl.value = await QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
    })
  } catch {
    qrCodeUrl.value = ''
  }
}, { immediate: true })

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

const clientImportConfig = computed(() => window.settings?.client_imports || {})
const clientImportEnabled = computed(() => clientImportConfig.value.enabled !== false)
const configuredClientIds = computed(() => new Set(
  (clientImportConfig.value.clients || []).map((id) => String(id).trim().toLowerCase()).filter(Boolean),
))
const enabledClients = computed(() => {
  if (!clientImportEnabled.value) return []
  if (!configuredClientIds.value.size) return allClients.value
  return allClients.value.filter((client) => (
    configuredClientIds.value.has(client.id.toLowerCase())
    || configuredClientIds.value.has(client.name.toLowerCase())
  ))
})

const filteredClients = computed(() =>
  enabledClients.value.filter((client) => client.platform === activePlatform.value),
)

const getPlatformLabel = (platform: Platform) =>
  platformTabs.find((item) => item.key === platform)?.label || platform

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
  border: 1px solid var(--stellar-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--stellar-bg-card);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.18);
}

:global(.subscribe-modal .n-card-header) {
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--stellar-border-light);
}

:global(.subscribe-modal .n-card__content) {
  padding: 20px 24px 24px;
  background: color-mix(in srgb, var(--stellar-bg-hover) 42%, var(--stellar-bg-card));
}

.modal-heading { display: flex; align-items: center; gap: 12px; }
.heading-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 10px; color: #fff; background: var(--stellar-primary); box-shadow: 0 6px 14px color-mix(in srgb, var(--stellar-primary) 24%, transparent); }
.modal-heading h2 { margin: 0; color: var(--stellar-text); font-size: 17px; line-height: 1.35; }
.modal-heading p { margin: 3px 0 0; color: var(--stellar-text-muted); font-size: 12px; font-weight: 400; }

.subscribe-import { min-width: 0; }
.panel-header p, .qr-copy p { margin: 4px 0 0; color: var(--stellar-text-muted); font-size: 12px; line-height: 1.55; }

.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 14px; align-items: stretch; }
.client-panel, .qr-panel { min-width: 0; border: 1px solid var(--stellar-border); border-radius: 8px; background: var(--stellar-bg-card); }
.client-panel { padding: 18px 18px 16px; }
.panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.panel-header h3, .qr-copy h3 { margin: 0; color: var(--stellar-text); font-size: 15px; }
.detected-badge { flex-shrink: 0; padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--stellar-primary) 20%, transparent); border-radius: 6px; color: var(--stellar-primary); background: var(--stellar-primary-light); font-size: 11px; font-weight: 700; }

.platform-tabs { display: grid; grid-template-columns: repeat(4, minmax(max-content, 1fr)); gap: 3px; margin: 16px 0 14px; padding: 3px; overflow-x: auto; border: 1px solid var(--stellar-border-light); border-radius: 8px; background: var(--stellar-bg-hover); }
.platform-tab { min-width: max-content; border: 0; border-radius: 6px; padding: 8px 12px; color: var(--stellar-text-secondary); background: transparent; font-size: 12px; line-height: 1.35; cursor: pointer; transition: color .18s ease, background .18s ease, box-shadow .18s ease; }
.platform-tab:hover { color: var(--stellar-primary); }
.platform-tab.active { color: var(--stellar-primary); background: var(--stellar-bg-card); box-shadow: 0 1px 4px rgba(15, 23, 42, .1); font-weight: 700; }
.platform-tab:focus-visible, .client-item:focus-visible { outline: 2px solid var(--stellar-primary); outline-offset: 2px; }

.client-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; max-height: 320px; padding: 1px 4px 1px 1px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--stellar-border) transparent; }
.client-empty { grid-column: 1 / -1; margin: 12px 0; color: var(--stellar-text-muted); font-size: 13px; text-align: center; }
.client-item { min-width: 0; min-height: 58px; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--stellar-border-light); border-radius: 8px; color: inherit; background: var(--stellar-bg-card); text-align: left; cursor: pointer; transition: border-color .18s ease, background .18s ease, box-shadow .18s ease; }
.client-item:hover { border-color: color-mix(in srgb, var(--stellar-primary) 42%, var(--stellar-border)); background: var(--stellar-primary-light); box-shadow: 0 3px 10px rgba(15, 23, 42, .06); }
.client-icon { width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--stellar-border-light); border-radius: 8px; background: #fff; }
.client-logo { width: 30px; height: 30px; object-fit: contain; }
.client-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.client-info strong { overflow: hidden; color: var(--stellar-text); font-size: 13px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.client-info small { color: var(--stellar-text-muted); font-size: 10px; }

.qr-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 18px; text-align: center; }
.qr-copy { width: 100%; }
.qr-frame { width: 168px; height: 168px; display: grid; place-items: center; margin: 18px 0 14px; padding: 8px; border: 1px solid var(--stellar-border); border-radius: 8px; color: var(--stellar-text-muted); background: #fff; box-shadow: 0 6px 18px rgba(15, 23, 42, .08); }
.qr-frame.disabled { opacity: .5; }
.qr-img { width: 100%; height: 100%; display: block; border-radius: 4px; object-fit: contain; }
.security-tip { display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--stellar-text-muted); font-size: 10px; }
.tip-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--stellar-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--stellar-success) 18%, transparent); }

@media (max-width: 760px) {
  :global(.subscribe-modal .n-card-header) { padding: 20px 18px 16px; }
  :global(.subscribe-modal .n-card__content) { padding: 16px 18px 20px; }
  .content-grid { grid-template-columns: 1fr; }
  .qr-panel { display: none; }
}

@media (max-width: 520px) {
  :global(.subscribe-modal.n-card) { border-radius: 12px; }
  .modal-heading p { display: none; }
  .client-panel { padding: 14px; }
  .client-list { grid-template-columns: 1fr; max-height: 360px; }
  .detected-badge { display: none; }
  .platform-tab { padding-inline: 10px; }
}
</style>

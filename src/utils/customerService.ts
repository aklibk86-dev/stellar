export type CustomerServiceProvider = 'tawk' | 'crisp' | 'chatwoot' | 'intercom' | 'custom'

type CustomerServiceValue = string | number | boolean

export interface CustomerServiceConfig {
  enabled?: boolean
  provider?: CustomerServiceProvider
  load_delay?: number
  load_on_idle?: boolean
  identify_user?: boolean
  track_page_views?: boolean
  show_on_routes?: string[]
  hide_on_routes?: string[]
  /** Keep the widget visible on authentication pages even when hide_on_routes contains them. */
  show_on_auth_routes?: boolean
  hide_on_mobile?: boolean
  attributes?: Record<string, CustomerServiceValue>
  tags?: string[]
  allow_insecure_http?: boolean
  script_url?: string
  tawk_property_id?: string
  tawk_widget_id?: string
  tawk_auto_start?: boolean
  tawk_secure_hash?: string
  tawk_custom_style?: Record<string, unknown>
  crisp_website_id?: string
  chatwoot_base_url?: string
  chatwoot_website_token?: string
  chatwoot_locale?: string
  chatwoot_position?: 'left' | 'right'
  intercom_app_id?: string
  intercom_api_base?: string
}

export interface CustomerServiceVisitor {
  id?: string
  hash?: string
  name?: string
  email?: string
  avatar?: string
  attributes?: Record<string, CustomerServiceValue>
}

export interface CustomerServiceController {
  load(visitor?: CustomerServiceVisitor): Promise<void>
  setVisitor(visitor?: CustomerServiceVisitor): void
  setVisible(visible: boolean): void
  open(): void
  close(): void
  toggle(): void
  track(event: string, metadata?: Record<string, CustomerServiceValue>): void
  destroy(): void
}

export interface CustomerServicePublicApi {
  open(): Promise<void>
  close(): void
  toggle(): Promise<void>
  show(): Promise<void>
  hide(): void
  track(event: string, metadata?: Record<string, CustomerServiceValue>): void
}

type ChatWindow = Window & Record<string, any>

const chatWindow = () => window as ChatWindow

const emit = (provider: CustomerServiceProvider, event: string, payload?: unknown) => {
  window.dispatchEvent(new CustomEvent('stellar:customer-service', {
    detail: { provider, event, payload },
  }))
}

const safeCallback = (provider: CustomerServiceProvider, action: string) => (error?: unknown) => {
  if (error) emit(provider, 'error', { action, error })
}

// 仅允许以下白名单字段透传给第三方客服平台，防止 token / 订阅链接等敏感信息外泄。
// ip 用于接收服务端注入的访客真实 IP（window.customerServiceIdentity.attributes.ip），
// 以纠正客服平台因访客挂 VPN/代理而误判的出口 IP。
const customerProfileAttributeKeys = [
  'email',
  'ip',
  'user_id',
  'registered_at',
  'last_login_at',
  'account_status',
  'telegram',
  'balance',
  'commission_balance',
  'discount',
  'commission_rate',
  'plan_id',
  'plan_name',
  'expired_at',
  'used_traffic',
  'total_traffic',
  'device_limit',
  'speed_limit',
  'next_reset_at',
  'reset_day',
  'online_devices',
  'reset_allowed',
  'auto_renewal',
] as const

// Keep every provider on the same customer profile payload.
const normalizeAttributes = (
  config: CustomerServiceConfig,
  visitor?: CustomerServiceVisitor,
): Record<string, CustomerServiceValue> => {
  const source = {
    ...(config.attributes || {}),
    ...(visitor?.attributes || {}),
  }
  const attributes: Record<string, CustomerServiceValue> = {}
  for (const key of customerProfileAttributeKeys) {
    const value = source[key]
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      attributes[key] = value
    }
  }
  return attributes
}

const publicCustomerProfile = (
  config: CustomerServiceConfig,
  visitor?: CustomerServiceVisitor,
) => visitor ? normalizeAttributes(config, visitor) : undefined

const isAllowedScriptUrl = (src: string, allowInsecureHttp = false) => {
  try {
    const url = new URL(src, window.location.href)
    if (url.protocol === 'https:') return true
    if (url.protocol !== 'http:') return false
    return allowInsecureHttp
      || url.hostname === 'localhost'
      || url.hostname === '127.0.0.1'
      || url.hostname === '[::1]'
  } catch {
    return false
  }
}

const loadScript = (
  src: string,
  provider: CustomerServiceProvider,
  allowInsecureHttp = false,
): Promise<void> => {
  if (!isAllowedScriptUrl(src, allowInsecureHttp)) {
    return Promise.reject(new Error(`Invalid ${provider} script URL`))
  }

  const selector = `script[data-stellar-customer-service="${provider}"]`
  const existing = document.querySelector<HTMLScriptElement>(selector)
  if (existing?.dataset.loaded === 'true') return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = existing || document.createElement('script')
    const handleLoad = () => {
      script.dataset.loaded = 'true'
      emit(provider, 'script-loaded')
      resolve()
    }
    const handleError = () => {
      emit(provider, 'error', { action: 'load-script', src })
      reject(new Error(`Failed to load ${provider} customer service`))
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
    if (!existing) {
      script.async = true
      script.src = src
      script.dataset.stellarCustomerService = provider
      script.referrerPolicy = 'strict-origin-when-cross-origin'
      document.head.appendChild(script)
    }
  })
}

const createTawkAdapter = (config: CustomerServiceConfig): CustomerServiceController => {
  const provider = 'tawk' as const
  let ready = false
  let visitor: CustomerServiceVisitor | undefined
  let visible = true
  let pendingAction: 'open' | 'close' | 'toggle' | null = null
  const pendingEvents: Array<{ event: string; metadata: Record<string, CustomerServiceValue> }> = []

  const getApi = () => {
    const target = chatWindow()
    target.Tawk_API = target.Tawk_API || {}
    return target.Tawk_API
  }

  const applyVisible = () => {
    if (!ready) return
    const api = getApi()
    if (visible) api.showWidget?.()
    else api.hideWidget?.()

    // Tawk may keep the generated outer container hidden even after showWidget().
    // Restore only its launcher container; the widget iframe keeps Tawk's own sizing.
    const launcher = Array.from(document.body.children).find((element) => {
      if (!(element instanceof HTMLElement) || element.id === 'app') return false
      return Boolean(element.querySelector('iframe[style*="position: fixed"][width="64px"]'))
    }) as HTMLElement | undefined
    launcher?.style.setProperty('display', visible ? 'block' : 'none', 'important')
  }

  const applyVisitor = () => {
    const api = getApi()
    if (!visitor) {
      if (ready) api.logout?.(safeCallback(provider, 'logout'))
      return
    }
    const attributes = normalizeAttributes(config, visitor)
    const identity = {
      ...(visitor.name ? { name: visitor.name } : {}),
      ...(visitor.email ? { email: visitor.email } : {}),
      ...attributes,
    }

    if (!ready) {
      api.visitor = identity
      return
    }

    const hash = visitor.hash || config.tawk_secure_hash
    if (hash && visitor.id && typeof api.login === 'function') {
      api.login({ hash, userId: visitor.id, ...identity }, safeCallback(provider, 'login'))
    } else if (Object.keys(identity).length > 0) {
      api.setAttributes?.(identity, safeCallback(provider, 'set-attributes'))
    }

    const tags = (config.tags || []).filter(Boolean)
    if (tags.length) api.addTags?.(tags, safeCallback(provider, 'add-tags'))
  }

  const bindEvent = (name: string) => {
    const api = getApi()
    const previous = api[name]
    api[name] = (...args: unknown[]) => {
      if (typeof previous === 'function') previous(...args)
      emit(provider, name, args.length <= 1 ? args[0] : args)
    }
  }

  const runAction = (action: 'open' | 'close' | 'toggle') => {
    if (!ready) {
      pendingAction = action
      return
    }
    const api = getApi()
    if (action === 'open') {
      if (config.tawk_auto_start === false) api.start?.({ showWidget: true })
      api.maximize?.()
    }
    else if (action === 'close') api.minimize?.()
    else api.toggle?.()
  }

  return {
    async load(initialVisitor) {
      visitor = initialVisitor
      const propertyId = config.tawk_property_id?.trim()
      const widgetId = config.tawk_widget_id?.trim() || 'default'
      if (!propertyId) throw new Error('Missing Tawk property ID')

      const target = chatWindow()
      target.Tawk_LoadStart = new Date()
      const api = getApi()
      api.autoStart = config.tawk_auto_start !== false
      if (config.tawk_custom_style) api.customStyle = config.tawk_custom_style
      applyVisitor()

      const previousOnLoad = api.onLoad
      api.onLoad = () => {
        ready = true
        if (typeof previousOnLoad === 'function') previousOnLoad()
        applyVisitor()
        applyVisible()
        if (pendingAction) {
          const action = pendingAction
          pendingAction = null
          runAction(action)
        }
        pendingEvents.splice(0).forEach(({ event, metadata }) => {
          api.addEvent?.(event, metadata, safeCallback(provider, 'add-event'))
        })
        emit(provider, 'ready')
      }

      ;[
        'onStatusChange',
        'onChatMaximized',
        'onChatMinimized',
        'onChatHidden',
        'onChatStarted',
        'onChatEnded',
        'onPrechatSubmit',
        'onOfflineSubmit',
        'onChatMessageVisitor',
        'onChatMessageAgent',
        'onAgentJoinChat',
        'onAgentLeaveChat',
        'onChatSatisfaction',
        'onFileUpload',
        'onTagsUpdated',
      ].forEach(bindEvent)

      await loadScript(
        `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`,
        provider,
      )
    },
    setVisitor(nextVisitor) {
      visitor = nextVisitor
      applyVisitor()
    },
    setVisible(nextVisible) {
      visible = nextVisible
      applyVisible()
    },
    open() {
      runAction('open')
    },
    close() {
      runAction('close')
    },
    toggle() {
      runAction('toggle')
    },
    track(event, metadata = {}) {
      if (!ready) {
        pendingEvents.push({ event, metadata })
        return
      }
      getApi().addEvent?.(event, metadata, safeCallback(provider, 'add-event'))
    },
    destroy() {
      const api = getApi()
      pendingAction = null
      pendingEvents.length = 0
      api.hideWidget?.()
      api.shutdown?.()
    },
  }
}

const createCrispAdapter = (config: CustomerServiceConfig): CustomerServiceController => {
  const provider = 'crisp' as const
  const command = (...args: unknown[]) => {
    const target = chatWindow()
    target.$crisp = target.$crisp || []
    target.$crisp.push(args)
  }
  const applyVisitor = (visitor?: CustomerServiceVisitor) => {
    if (!visitor) {
      command('do', 'session:reset')
      return
    }
    if (visitor.email) command('set', 'user:email', [visitor.email])
    if (visitor.name) command('set', 'user:nickname', [visitor.name])
    if (visitor.avatar) command('set', 'user:avatar', [visitor.avatar])
    const attributes = Object.entries(normalizeAttributes(config, visitor))
    if (attributes.length) command('set', 'session:data', [attributes])
    if (config.tags?.length) command('set', 'session:segments', [config.tags, true])
  }

  return {
    async load(visitor) {
      const websiteId = config.crisp_website_id?.trim()
      if (!websiteId) throw new Error('Missing Crisp website ID')
      const target = chatWindow()
      target.CRISP_WEBSITE_ID = websiteId
      target.$crisp = target.$crisp || []
      command('on', 'session:loaded', () => emit(provider, 'ready'))
      command('on', 'chat:opened', () => emit(provider, 'chat-opened'))
      command('on', 'chat:closed', () => emit(provider, 'chat-closed'))
      applyVisitor(visitor)
      await loadScript('https://client.crisp.chat/l.js', provider)
    },
    setVisitor: applyVisitor,
    setVisible(visible) {
      command('do', visible ? 'chat:show' : 'chat:hide')
    },
    open() {
      command('do', 'chat:open')
    },
    close() {
      command('do', 'chat:close')
    },
    toggle() {
      command('do', 'chat:toggle')
    },
    track(event, metadata = {}) {
      command('set', 'session:event', [[[event, metadata, 'blue']]])
    },
    destroy() {
      command('do', 'chat:hide')
    },
  }
}

const createChatwootAdapter = (config: CustomerServiceConfig): CustomerServiceController => {
  const provider = 'chatwoot' as const
  let visitor: CustomerServiceVisitor | undefined
  let ready = false

  const getApi = () => chatWindow().$chatwoot
  const applyVisitor = () => {
    const api = getApi()
    if (!ready || !api) return
    if (!visitor?.id) {
      api.reset?.()
      return
    }
    api.setUser?.(visitor.id, {
      ...(visitor.email ? { email: visitor.email } : {}),
      ...(visitor.name ? { name: visitor.name } : {}),
      ...(visitor.avatar ? { avatar_url: visitor.avatar } : {}),
    })
    const attributes = normalizeAttributes(config, visitor)
    if (Object.keys(attributes).length) api.setCustomAttributes?.(attributes)
    config.tags?.filter(Boolean).forEach((tag) => api.setLabel?.(tag))
  }

  return {
    async load(initialVisitor) {
      visitor = initialVisitor
      const baseUrl = config.chatwoot_base_url?.trim().replace(/\/$/, '')
      const websiteToken = config.chatwoot_website_token?.trim()
      if (!baseUrl || !websiteToken) throw new Error('Missing Chatwoot base URL or website token')
      if (!isAllowedScriptUrl(baseUrl, config.allow_insecure_http)) {
        throw new Error('Invalid Chatwoot base URL')
      }

      const target = chatWindow()
      target.chatwootSettings = {
        ...(target.chatwootSettings || {}),
        position: config.chatwoot_position || 'right',
        locale: config.chatwoot_locale || 'auto',
      }
      window.addEventListener('chatwoot:ready', () => {
        ready = true
        applyVisitor()
        emit(provider, 'ready')
      }, { once: true })
      await loadScript(`${baseUrl}/packs/js/sdk.js`, provider, config.allow_insecure_http)
      target.chatwootSDK?.run({ websiteToken, baseUrl })
    },
    setVisitor(nextVisitor) {
      visitor = nextVisitor
      applyVisitor()
    },
    setVisible(visible) {
      getApi()?.toggleBubbleVisibility?.(visible ? 'show' : 'hide')
    },
    open() {
      getApi()?.toggle?.('open')
    },
    close() {
      getApi()?.toggle?.('close')
    },
    toggle() {
      getApi()?.toggle?.()
    },
    track(event, metadata = {}) {
      getApi()?.setCustomAttributes?.({ [`event_${event}`]: JSON.stringify(metadata) })
    },
    destroy() {
      getApi()?.toggleBubbleVisibility?.('hide')
    },
  }
}

const createIntercomAdapter = (config: CustomerServiceConfig): CustomerServiceController => {
  const provider = 'intercom' as const
  const call = (...args: unknown[]) => chatWindow().Intercom?.(...args)
  const settingsFor = (visitor?: CustomerServiceVisitor) => ({
    app_id: config.intercom_app_id,
    api_base: config.intercom_api_base || 'https://api-iam.intercom.io',
    ...(visitor?.id ? { user_id: visitor.id } : {}),
    ...(visitor?.email ? { email: visitor.email } : {}),
    ...(visitor?.name ? { name: visitor.name } : {}),
    ...(visitor?.avatar ? { avatar: visitor.avatar } : {}),
    ...normalizeAttributes(config, visitor),
  })

  return {
    async load(visitor) {
      const appId = config.intercom_app_id?.trim()
      if (!appId) throw new Error('Missing Intercom app ID')
      const target = chatWindow()
      if (typeof target.Intercom !== 'function') {
        const queue: IArguments[] = []
        target.Intercom = function () { queue.push(arguments) }
        target.Intercom.q = queue
      }
      target.intercomSettings = settingsFor(visitor)
      call('boot', target.intercomSettings)
      await loadScript(`https://widget.intercom.io/widget/${encodeURIComponent(appId)}`, provider)
      emit(provider, 'ready')
    },
    setVisitor(visitor) {
      if (visitor) {
        call('update', settingsFor(visitor))
      } else {
        call('shutdown')
        call('boot', settingsFor())
      }
    },
    setVisible(visible) {
      call(visible ? 'show' : 'hide')
    },
    open() {
      call('show')
    },
    close() {
      call('hide')
    },
    toggle() {
      call('show')
    },
    track(event, metadata = {}) {
      call('trackEvent', event, metadata)
    },
    destroy() {
      call('shutdown')
    },
  }
}

const createCustomAdapter = (config: CustomerServiceConfig): CustomerServiceController => {
  const provider = 'custom' as const
  const command = (action: string, payload?: unknown) => emit(provider, `command:${action}`, payload)
  return {
    async load(visitor) {
      const src = config.script_url?.trim()
      if (!src) throw new Error('Missing custom customer service script URL')
      await loadScript(src, provider, config.allow_insecure_http)
      command('visitor', publicCustomerProfile(config, visitor))
      emit(provider, 'ready')
    },
    setVisitor(visitor) {
      command('visitor', publicCustomerProfile(config, visitor))
    },
    setVisible(visible) {
      command('visibility', { visible })
    },
    open() {
      command('open')
    },
    close() {
      command('close')
    },
    toggle() {
      command('toggle')
    },
    track(event, metadata = {}) {
      command('track', { event, metadata })
    },
    destroy() {
      command('destroy')
    },
  }
}

export function createCustomerService(config: CustomerServiceConfig): CustomerServiceController {
  switch (config.provider) {
    case 'crisp': return createCrispAdapter(config)
    case 'chatwoot': return createChatwootAdapter(config)
    case 'intercom': return createIntercomAdapter(config)
    case 'custom': return createCustomAdapter(config)
    case 'tawk':
    default: return createTawkAdapter(config)
  }
}

export function matchesCustomerServiceRoute(path: string, patterns: string[] = []): boolean {
  return patterns.some((pattern) => {
    const normalized = pattern.trim()
    if (!normalized) return false
    if (normalized === '*') return true
    if (normalized.endsWith('*')) return path.startsWith(normalized.slice(0, -1))
    return path === normalized
  })
}

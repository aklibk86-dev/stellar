export interface LandingNavigationItemConfig {
  label: string
  label_en?: string
  url: string
  new_tab?: boolean
  visible?: boolean
}

export interface LandingNavigationItem {
  label: string
  url: string
  newTab: boolean
}

const HASH_TARGET_RE = /^#[A-Za-z][\w:-]*$/
const INTERNAL_TARGET_RE = /^\/(?!\/)[^\s\u0000-\u001f]*$/
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export function isSafeNavigationTarget(target: string): boolean {
  if (HASH_TARGET_RE.test(target) || INTERNAL_TARGET_RE.test(target)) return true

  try {
    return SAFE_PROTOCOLS.has(new URL(target).protocol)
  } catch {
    return false
  }
}

export function normalizeLandingNavigation(
  items: LandingNavigationItemConfig[],
  locale: string,
): LandingNavigationItem[] {
  return items.flatMap((item) => {
    if (!item || item.visible === false) return []

    const url = typeof item.url === 'string' ? item.url.trim() : ''
    const localizedLabel = locale.startsWith('en') ? item.label_en : item.label
    const fallbackLabel = locale.startsWith('en') ? item.label : item.label_en
    const label = typeof localizedLabel === 'string' && localizedLabel.trim()
      ? localizedLabel.trim()
      : typeof fallbackLabel === 'string'
        ? fallbackLabel.trim()
        : ''

    if (!label || !isSafeNavigationTarget(url)) return []

    return [{
      label,
      url,
      newTab: item.new_tab === true,
    }]
  })
}

export function isInternalNavigationTarget(target: string): boolean {
  return INTERNAL_TARGET_RE.test(target)
}

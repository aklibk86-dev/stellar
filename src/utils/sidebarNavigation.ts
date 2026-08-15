import { isInternalNavigationTarget, isSafeNavigationTarget } from './landingNavigation'

export interface SidebarNavigationItemConfig {
  type?: 'link' | 'group'
  label: string
  label_en?: string
  path?: string
  url?: string
  icon?: string
  badge?: string | number
  new_tab?: boolean
  visible?: boolean
}

export interface SidebarNavigationItem {
  type: 'link' | 'group'
  label: string
  to?: string
  href?: string
  icon: string
  badge?: string
  newTab: boolean
}

function localizedLabel(item: SidebarNavigationItemConfig, locale: string): string {
  const preferred = locale.startsWith('en') ? item.label_en : item.label
  const fallback = locale.startsWith('en') ? item.label : item.label_en
  if (typeof preferred === 'string' && preferred.trim()) return preferred.trim()
  return typeof fallback === 'string' ? fallback.trim() : ''
}

function internalPath(path: unknown): string {
  if (typeof path !== 'string' || !path.trim()) return ''
  const normalized = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`
  return isInternalNavigationTarget(normalized) ? normalized : ''
}

export function normalizeSidebarNavigation(
  items: SidebarNavigationItemConfig[],
  locale: string,
): SidebarNavigationItem[] {
  return items.flatMap<SidebarNavigationItem>((item) => {
    if (!item || item.visible === false) return []

    const label = localizedLabel(item, locale)
    if (!label) return []

    if (item.type === 'group') {
      return [{
        type: 'group' as const,
        label,
        icon: '',
        newTab: false,
      }]
    }

    const to = internalPath(item.path || item.url)
    const rawUrl = typeof item.url === 'string' ? item.url.trim() : ''
    const href = !to && isSafeNavigationTarget(rawUrl) ? rawUrl : ''
    if (!to && !href) return []

    return [{
      type: 'link' as const,
      label,
      ...(to ? { to } : { href }),
      icon: typeof item.icon === 'string' && item.icon.trim() ? item.icon.trim() : 'file',
      badge: item.badge === undefined || item.badge === null ? undefined : String(item.badge),
      newTab: item.new_tab === true,
    }]
  })
}

export interface AvatarSourceUser {
  avatar_url?: string | null
  email?: string | null
  uuid?: string | null
  username?: string | null
  name?: string | null
}

/** Resolve a configured avatar template, falling back to the backend avatar. */
export function resolveAvatarUrl(user?: AvatarSourceUser | null, source?: string): string {
  const configuredSource = source ?? (typeof window !== 'undefined' ? window.settings?.avatar_source : '')
  const template = typeof configuredSource === 'string' ? configuredSource.trim() : ''

  if (template) {
    const email = String(user?.email || '').trim()
    const username = String(user?.username || user?.name || email.split('@')[0] || '').trim()
    const seed = String(user?.uuid || email || username || 'user').trim()
    const values: Record<string, string> = { email, username, seed }

    return template.replace(/\{(email|username|seed)\}/gi, (_, key: string) => {
      return encodeURIComponent(values[key.toLowerCase()] || '')
    })
  }

  return String(user?.avatar_url || '').trim()
}

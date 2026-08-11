export function isSafeRedirect(path: string): boolean {
  if (!path) return false
  try {
    const decoded = decodeURIComponent(path).replace(/\\/g, '/')
    return decoded.startsWith('/') && !decoded.startsWith('//')
  } catch {
    return false
  }
}

export function getSafeRedirect(path: string | undefined | null, fallback = '/dashboard'): string {
  return path && isSafeRedirect(path) ? path : fallback
}

export function isValidHttpUrl(url: string): boolean {
  if (!url) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str || str.length <= maxLen) return str || ''
  return str.slice(0, maxLen)
}

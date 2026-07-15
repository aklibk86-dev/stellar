import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target'],
  })
}

export function isSafeRedirect(path: string): boolean {
  if (!path) return false
  if (path.startsWith('/') && !path.startsWith('//')) return true
  return false
}

export function getSafeRedirect(path: string | undefined | null, fallback = '/dashboard'): string {
  if (!path) return fallback
  if (isSafeRedirect(path)) return path
  return fallback
}

export function isValidHttpUrl(url: string): boolean {
  if (!url) return true
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen)
}

/** Normalize the backend's email whitelist setting into comparable suffixes. */
export const getEmailWhitelistSuffixes = (value: unknown): string[] => {
  if (value === 0 || value === false || value === null || value === undefined) return []

  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\s,，、;；]+/)
      : []

  return values
    .map((suffix) => String(suffix).trim().toLowerCase().replace(/^@+/, ''))
    .filter(Boolean)
}

export const isEmailAllowedByWhitelist = (email: string, suffixes: string[]) => {
  const normalizedEmail = email.trim().toLowerCase()
  const at = normalizedEmail.lastIndexOf('@')
  if (at < 0) return false
  const domain = normalizedEmail.slice(at + 1)
  return suffixes.some((suffix) => domain === suffix || domain.endsWith(`.${suffix}`))
}

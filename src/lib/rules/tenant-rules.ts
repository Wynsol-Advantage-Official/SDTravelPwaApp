// ---------------------------------------------------------------------------
// Tenant Rules — Pure validation for tenant slugs / subdomains
// ---------------------------------------------------------------------------
// No async, no external imports — safe for Edge Runtime & middleware.
// ---------------------------------------------------------------------------

/** Valid subdomain: 1-63 lowercase alphanumeric + hyphens, cannot start/end with hyphen. */
const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

/** Detects UUID-shaped strings (e.g. Wix siteId accidentally used as tenantId). */
const UUID_PREFIX_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-/i

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "auth",
  "mail",
  "smtp",
  "ftp",
  "staging",
  "dev",
  "test",
  "demo",
])

/**
 * Returns true when `value` is a valid tenant slug (subdomain-safe).
 * Rejects UUIDs, reserved names, and non-conforming strings.
 */
export function isValidTenantSlug(value: string): boolean {
  if (!value) return false
  const slug = value.trim().toLowerCase()
  if (!SUBDOMAIN_REGEX.test(slug)) return false
  if (UUID_PREFIX_REGEX.test(slug)) return false
  if (RESERVED_SUBDOMAINS.has(slug)) return false
  return true
}

/** Returns true when `value` is in the reserved subdomain list. */
export function isReservedSubdomain(value: string): boolean {
  return RESERVED_SUBDOMAINS.has(value.trim().toLowerCase())
}

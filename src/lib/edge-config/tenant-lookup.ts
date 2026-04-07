import type { TenantConfig } from "@/types/tenant"

// ---------------------------------------------------------------------------
// Edge Config — Tenant Lookup
// ---------------------------------------------------------------------------
// Reads tenant mapping from Vercel Edge Config at the network edge.
// In development (no EDGE_CONFIG), falls back to the default "www" tenant
// using environment variables.
// ---------------------------------------------------------------------------

const DEFAULT_TENANT: TenantConfig = {
  tenantId: "www",
  siteId: process.env.WIX_META_SITE_ID ?? process.env.WIX_SITE_ID ?? "",
  name: "Sand Diamonds Travel",
}

/**
 * Resolve a subdomain to its tenant config.
 *
 * Reads from Vercel Edge Config (SDK or HTTP API fallback) in all
 * environments so that local dev reflects the same tenant→siteId mappings
 * as production. Falls back to a synthetic tenant in dev when no Edge Config
 * credentials are present or the key is not found.
 */
export async function lookupTenant(
  subdomain: string,
): Promise<TenantConfig | null> {
  // "www" or apex domain always resolves to the primary tenant
  if (!subdomain || subdomain === "www") {
    return DEFAULT_TENANT
  }

  // ── Edge Config SDK ──────────────────────────────────────────────────────
  if (process.env.EDGE_CONFIG) {
    try {
      const { get } = await import("@vercel/edge-config")
      const config = await get<TenantConfig>(subdomain)
      if (config) return config
      // Key simply not found — fall through to next source
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isAuthError = msg.includes("Unauthorized") || msg.includes("401")
      if (isAuthError) {
        console.warn(`[Edge Config] SDK unauthorized for "${subdomain}" — trying Vercel API fallback`)
      } else {
        console.error(`[Edge Config] Lookup failed for "${subdomain}":`, err)
        // Fall through — try API fallback before giving up
      }
    }
  }

  // ── Vercel Edge Config HTTP API fallback ─────────────────────────────────
  // Used in all environments when EDGE_CONFIG_STORE_ID + VERCEL_TOKEN are set.
  if (process.env.EDGE_CONFIG_STORE_ID && process.env.VERCEL_TOKEN) {
    try {
      const storeId = process.env.EDGE_CONFIG_STORE_ID
      const candidateKeys = [subdomain, `tenant:${subdomain}`]
      const teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""

      const listRes = await fetch(
        `https://api.vercel.com/v1/edge-config/${storeId}/items${teamQuery}`,
        { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } },
      )

      if (listRes.ok) {
        const items = await listRes.json()
        for (const k of candidateKeys) {
          const found = items.find((it: any) => it.key === k)
          if (found) return (found.value as TenantConfig) ?? null
        }
        // Key not in items — fall through to dev synthetic fallback
      } else {
        const body = await listRes.text()
        console.error(`[Edge Config] Vercel API list failed (${listRes.status}): ${body}`)
      }
    } catch (err) {
      console.error(`[Edge Config] Vercel API lookup error for "${subdomain}":`, err)
    }
  }

  // ── Dev synthetic fallback ───────────────────────────────────────────────
  // In development only: if no Edge Config credentials are available (or the
  // key was not found), synthesize a tenant so the app still renders locally.
  // In production, return null so middleware can redirect to /lost.
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[Edge Config] No entry for "${subdomain}" — using synthetic tenant in dev`)
    return { tenantId: subdomain, siteId: DEFAULT_TENANT.siteId, name: subdomain }
  }

  return null
}

export { DEFAULT_TENANT }

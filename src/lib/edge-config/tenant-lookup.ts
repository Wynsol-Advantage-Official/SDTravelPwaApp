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
 * - In production, reads from Vercel Edge Config (< 1 ms).
 * - In development or when Edge Config is unavailable, returns the default
 *   "www" tenant so the app still works without Vercel infrastructure.
 */
export async function lookupTenant(
  subdomain: string,
): Promise<TenantConfig | null> {
  // "www" or apex domain always resolves to the primary tenant
  if (!subdomain || subdomain === "www") {
    return DEFAULT_TENANT
  }

  // Try Edge Config SDK (fast path when EDGE_CONFIG is set).
  // Falls through to the API fallback when the key is missing OR on auth
  // errors (e.g. EDGE_CONFIG URL token lacks read permissions).
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

  // Vercel Edge Config HTTP API fallback — works whenever EDGE_CONFIG_STORE_ID
  // + VERCEL_TOKEN are present, useful for local dev and as a fallback when
  // the EDGE_CONFIG URL token lacks read permissions.
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
        // Key not in items — fall through to dev fallback
      } else {
        const body = await listRes.text()
        console.error(`[Edge Config] Vercel API list failed (${listRes.status}): ${body}`)
        // Fall through to dev fallback
      }
    } catch (err) {
      console.error(`[Edge Config] Vercel API lookup error for "${subdomain}":`, err)
      // Fall through to dev fallback
    }
  }

  // ── Dev fallback ─────────────────────────────────────────────────────────
  // In non-production, synthesise a minimal tenant so local subdomains
  // (e.g. solnica.localhost:3000) work without provisioning every tenant
  // into Vercel Edge Config. Reuses the default Wix site ID so pages load.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[Edge Config] "${subdomain}" not found in any source — resolving as synthetic dev tenant.`,
    )
    return { tenantId: subdomain, siteId: DEFAULT_TENANT.siteId, name: subdomain }
  }

  return null
}

export { DEFAULT_TENANT }

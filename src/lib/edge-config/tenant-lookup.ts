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
  // On auth errors (e.g. EDGE_CONFIG URL uses a full API token instead of a
  // read-only Edge Config token) we fall through to the HTTP API fallback so
  // local dev still works without a dedicated Edge Config read token.
  if (process.env.EDGE_CONFIG) {
    try {
      const { get } = await import("@vercel/edge-config")
      const config = await get<TenantConfig>(subdomain)
      return config ?? null
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isAuthError = msg.includes("Unauthorized") || msg.includes("401")
      if (isAuthError) {
        // Fall through to the Vercel API fallback below
        console.warn(`[Edge Config] SDK unauthorized for "${subdomain}" — trying Vercel API fallback`)
      } else {
        console.error(`[Edge Config] Lookup failed for "${subdomain}":`, err)
        return null
      }
    }
  }

  // Vercel Edge Config HTTP API fallback — works whenever EDGE_CONFIG_STORE_ID
  // + VERCEL_TOKEN are present, useful for local dev and as a fallback when
  // the EDGE_CONFIG URL token lacks read permissions.
  if (process.env.EDGE_CONFIG_STORE_ID && process.env.VERCEL_TOKEN) {
    try {
      const storeId = process.env.EDGE_CONFIG_STORE_ID
      // The Edge Config key may be stored as either the raw subdomain
      // (e.g. "solnica") or namespaced as "tenant:solnica" depending on
      // how it was upserted. Try raw key first, then the namespaced key.
      const candidateKeys = [subdomain, `tenant:${subdomain}`]
      const teamQuery = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""

      // Fetch the store's items and try to find our key. Listing is used
      // because the single-item GET endpoint may not be available for the
      // token/permissions used in some projects.
      const listRes = await fetch(
        `https://api.vercel.com/v1/edge-config/${storeId}/items${teamQuery}`,
        { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } },
      )

      if (!listRes.ok) {
        const body = await listRes.text()
        console.error(`[Edge Config] Vercel API list failed (${listRes.status}): ${body}`)
        return null
      }

      const items = await listRes.json()
      for (const k of candidateKeys) {
        const found = items.find((it: any) => it.key === k)
        if (found) return (found.value as TenantConfig) ?? null
      }

      return null
    } catch (err) {
      console.error(`[Edge Config] Vercel API lookup error for "${subdomain}":`, err)
      return null
    }
  }

  // Development fallback — no Edge Config available and no Vercel API creds.
  // Allow local dev subdomains (e.g. tenant-a.localhost) to resolve as www.
  console.warn(
    `[Edge Config] EDGE_CONFIG not set — resolving "${subdomain}" as default tenant (dev mode).`,
  )
  return DEFAULT_TENANT
}

export { DEFAULT_TENANT }

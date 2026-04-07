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

  // ── Dev fast-path ────────────────────────────────────────────────────────
  // In development, skip all external API calls (Edge Config SDK + Vercel API)
  // and immediately return a synthetic tenant. This avoids:
  //   1. Auth errors from EDGE_CONFIG using a vcp_ token instead of a read token
  //   2. 400 ms+ latency per middleware invocation from the Vercel API fallback
  //   3. Flaky dev experience when network / tokens change
  if (process.env.NODE_ENV !== "production") {
    return { tenantId: subdomain, siteId: DEFAULT_TENANT.siteId, name: subdomain }
  }

  // ── Production: Edge Config SDK (fast path) ──────────────────────────────
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
        // Key not in items — unknown tenant in production
      } else {
        const body = await listRes.text()
        console.error(`[Edge Config] Vercel API list failed (${listRes.status}): ${body}`)
      }
    } catch (err) {
      console.error(`[Edge Config] Vercel API lookup error for "${subdomain}":`, err)
    }
  }

  // Production: tenant genuinely not found in any source
  return null
}

export { DEFAULT_TENANT }

// Static import required — dynamic imports do not bundle in the Edge Runtime.
import { get } from "@vercel/edge-config"
import type { TenantConfig } from "@/types/tenant"

// ---------------------------------------------------------------------------
// Edge Config — Tenant Lookup
// ---------------------------------------------------------------------------
// Resolves a subdomain to its TenantConfig via Vercel Edge Config.
// Works in both the Edge Runtime (production middleware) and Node.js (dev).
//
// Resolution order:
//   1. @vercel/edge-config SDK — fast (<1 ms at edge) when EDGE_CONFIG is set
//   2. Edge Config HTTP API — direct per-key fetch; works when SDK is not
//      available but EDGE_CONFIG connection string is present
//   3. Dev synthetic fallback — only in non-production; avoids /lost in dev
// ---------------------------------------------------------------------------

const DEFAULT_TENANT: TenantConfig = {
  tenantId: "www",
  siteId: process.env.WIX_META_SITE_ID ?? process.env.WIX_SITE_ID ?? "",
  name: "Sand Diamonds Travel",
}

export async function lookupTenant(
  subdomain: string,
): Promise<TenantConfig | null> {
  // "www" or apex always resolves to the primary tenant
  if (!subdomain || subdomain === "www") {
    return DEFAULT_TENANT
  }

  // ── 1. Edge Config SDK (static import — Edge-Runtime safe) ───────────────
  if (process.env.EDGE_CONFIG) {
    try {
      const config = await get<TenantConfig>(subdomain)
      if (config) return config
      // Key not found — fall through
    } catch (err) {
      console.error(`[Edge Config] SDK lookup failed for "${subdomain}":`, err)
      // Fall through to direct HTTP fetch
    }
  }

  // ── 2. Edge Config item HTTP fetch (per-key, no credentials needed) ──────
  // The EDGE_CONFIG connection string encodes the store ID and read token so
  // we can build the per-item REST URL directly without VERCEL_TOKEN.
  if (process.env.EDGE_CONFIG) {
    try {
      // Connection string format:
      //   https://edge-config.vercel.com/<storeId>?token=<readToken>
      const connUrl = new URL(process.env.EDGE_CONFIG)
      const storeId = connUrl.pathname.replace(/^\//, "")
      const token   = connUrl.searchParams.get("token")
      if (storeId && token) {
        const itemUrl = `https://edge-config.vercel.com/${storeId}/item/${encodeURIComponent(subdomain)}?version=1`
        const res = await fetch(itemUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const config = await res.json() as TenantConfig
          if (config) return config
        } else if (res.status !== 404) {
          console.error(`[Edge Config] HTTP item fetch failed (${res.status}) for "${subdomain}"`)
        }
      }
    } catch (err) {
      console.error(`[Edge Config] HTTP fetch error for "${subdomain}":`, err)
    }
  }

  // ── 3. Not found ──────────────────────────────────────────────────────────
  // In production, returning null causes middleware to redirect to /lost.
  // In dev, the same behaviour applies — Edge Config must contain the tenant.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[Edge Config] No entry for "${subdomain}" — redirecting to /lost.\n` +
      `  To register this tenant in dev, run:\n` +
      `  node scripts/provision-tenant-edge-config.mjs ${subdomain} <wixSiteId> "<Display Name>"`,
    )
  }

  return null
}

export { DEFAULT_TENANT }

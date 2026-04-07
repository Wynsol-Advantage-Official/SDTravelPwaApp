import { createClient, OAuthStrategy } from "@wix/sdk"
import { products } from "@wix/stores"

// ---------------------------------------------------------------------------
// Wix Headless SDK — Browser-safe Client (SOW §6.2)
// ---------------------------------------------------------------------------
// This client is safe to import from Client Components and hooks.
// It uses NEXT_PUBLIC_WIX_CLIENT_ID (exposed to the browser) and
// OAuthStrategy for client-side authentication.
//
// In multi-tenant mode, pass the tenant's siteId from useTenant() context
// to get tenant-specific product data. Without siteId, uses the default
// (www) site for backward compatibility.
// ---------------------------------------------------------------------------

function buildBrowserClient(siteId?: string) {
  const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID

  if (!clientId) {
    console.warn("[Wix Browser Client] NEXT_PUBLIC_WIX_CLIENT_ID is not set")
    return null
  }

  return createClient({
    modules: { products },
    auth: OAuthStrategy({ clientId, ...(siteId ? { siteId } : {}) }),
  })
}

// Default (www) singleton
let _defaultBrowserClient: ReturnType<typeof buildBrowserClient> | undefined

// Per-tenant cache
const _tenantBrowserClients = new Map<string, ReturnType<typeof buildBrowserClient>>()

/**
 * Get a browser-safe Wix client. Pass `siteId` for tenant-specific data.
 * Without `siteId`, returns the default (www) singleton.
 */
export function wixBrowserClient(siteId?: string) {
  if (!siteId) {
    if (_defaultBrowserClient === undefined) {
      _defaultBrowserClient = buildBrowserClient()
    }
    return _defaultBrowserClient
  }

  if (!_tenantBrowserClients.has(siteId)) {
    _tenantBrowserClients.set(siteId, buildBrowserClient(siteId))
  }
  return _tenantBrowserClients.get(siteId)!
}

export type WixBrowserClient = NonNullable<ReturnType<typeof wixBrowserClient>>

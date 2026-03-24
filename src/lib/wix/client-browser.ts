import { createClient, OAuthStrategy } from "@wix/sdk"
import { products } from "@wix/stores"

// ---------------------------------------------------------------------------
// Wix Headless SDK — Browser-safe Client
// ---------------------------------------------------------------------------
// This client is safe to import from Client Components and hooks.
// It uses NEXT_PUBLIC_WIX_CLIENT_ID (exposed to the browser) and
// OAuthStrategy for client-side authentication.
//
// Use this to fetch product details, prices, and availability
// directly from the frontend for display purposes.
//
// IMPORTANT: Never trust client-fetched prices for writes.
// The server API route re-verifies the price before saving to Firestore.
// ---------------------------------------------------------------------------

function createBrowserWixClient() {
  const clientId = process.env.NEXT_PUBLIC_WIX_CLIENT_ID

  if (!clientId) {
    console.warn("[Wix Browser Client] NEXT_PUBLIC_WIX_CLIENT_ID is not set")
    return null
  }

  return createClient({
    modules: { products },
    auth: OAuthStrategy({ clientId }),
  })
}

// Singleton — one client instance per browser session
let _browserClient: ReturnType<typeof createBrowserWixClient> | undefined

export function wixBrowserClient() {
  if (_browserClient === undefined) {
    _browserClient = createBrowserWixClient()
  }
  return _browserClient
}

export type WixBrowserClient = NonNullable<ReturnType<typeof wixBrowserClient>>

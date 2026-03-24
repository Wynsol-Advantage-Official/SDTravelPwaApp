import "server-only";
import { createClient, OAuthStrategy, ApiKeyStrategy } from "@wix/sdk";
import { bookings } from "@wix/bookings";
import { availabilityCalendar } from "@wix/bookings";
import { items } from "@wix/data";
import { members } from "@wix/members";
import { products } from "@wix/stores";
import { submissions, forms } from "@wix/forms";
import { contacts, submittedContact } from "@wix/crm";
import { conversations, messages } from "@wix/inbox";

// ---------------------------------------------------------------------------
// Wix Headless SDK — Singleton Clients
// ---------------------------------------------------------------------------
// wixClient()      → OAuth-based client for CMS, bookings, members (public data)
// wixAdminClient() → API-key-based client for CRM, Inbox (requires elevated perms)
//
// IMPORTANT: These modules must only be imported in server contexts.
// ---------------------------------------------------------------------------

function getWixClient() {
  const clientId = process.env.WIX_CLIENT_ID;
  const clientSecret = process.env.WIX_CLIENT_SECRET;
  const siteId = process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID;

  if (!clientId || !clientSecret) {
    console.warn(
      "[Wix Client] Missing WIX_CLIENT_ID or WIX_CLIENT_SECRET — Wix Headless client will not be initialized",
    );
    return null;
  }

  const authConfig: Record<string, string> = { clientId, clientSecret };
  if (siteId) authConfig.siteId = siteId;

  return createClient({
    modules: {
      bookings,
      availabilityCalendar,
      items,
      members,
      products,
      submissions,
      forms,
      contacts,
      submittedContact,
      conversations,
      messages,
    },
    auth: OAuthStrategy(authConfig as any),
  });
}

// Admin client uses ApiKeyStrategy for elevated permissions (Inbox, CRM write)
function getWixAdminClient() {
  const apiKey = process.env.WIX_API_KEY;
  const accountId = process.env.WIX_ACCOUNT_ID;
  // Use WIX_META_SITE_ID when it differs from WIX_CLIENT_ID (they're different things).
  // Fall back to WIX_SITE_ID only if WIX_META_SITE_ID is not set.
  const metaSiteId = process.env.WIX_META_SITE_ID || undefined;

  if (!apiKey || !accountId) {
    return null;
  }

  return createClient({
    modules: {
      contacts,
      submittedContact,
      conversations,
      messages,
    },
    auth: ApiKeyStrategy({
      apiKey,
      accountId,
      ...(metaSiteId ? { siteId: metaSiteId } : {}),
    }),
  });
}

// Singleton — one client instance per server lifecycle
let _client: ReturnType<typeof getWixClient> | undefined;

export function wixClient() {
  if (_client === undefined) {
    _client = getWixClient();
  }
  console.log("[Wix Client] Initialized:", !!_client);
  return _client;
}

let _adminClient: ReturnType<typeof getWixAdminClient> | undefined;

export function wixAdminClient() {
  if (_adminClient === undefined) {
    _adminClient = getWixAdminClient();
  }
  return _adminClient;
}

export type WixClient = NonNullable<ReturnType<typeof wixClient>>;
export type WixAdminClient = NonNullable<ReturnType<typeof wixAdminClient>>;

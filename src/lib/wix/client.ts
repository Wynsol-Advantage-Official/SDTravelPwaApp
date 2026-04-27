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
// Wix Headless SDK — Multi-Tenant Client Factory (SOW §6.2)
// ---------------------------------------------------------------------------
// wixClient(siteId?)    → OAuth client; per-tenant when siteId provided
// wixAdminClient(siteId?) → API-key client; per-tenant when siteId provided
//
// IMPORTANT: These modules must only be imported in server contexts.
// ---------------------------------------------------------------------------

/** Standard CMS modules shared by all tenant clients. */
const CMS_MODULES = {
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
} as const;

/** Admin-only modules (CRM, Inbox). */
const ADMIN_MODULES = {
  contacts,
  submittedContact,
  conversations,
  messages,
} as const;

function buildOAuthClient(siteId: string | undefined) {
  const clientId = process.env.WIX_CLIENT_ID;
  const clientSecret = process.env.WIX_CLIENT_SECRET;

  // Fall back to env-based siteId when none provided (backward compat / www)
  const resolvedSiteId =
    siteId ||
    process.env.WIX_META_SITE_ID ||
    process.env.WIX_SITE_ID ||
    process.env.NEXT_PUBLIC_WIX_SITE_ID;

  if (!clientId) {
    console.warn(
      "[Wix Client] Missing WIX_CLIENT_ID — Wix Headless client will not be initialized",
    );
    return null;
  }

  if (!clientSecret) {
    console.warn(
      "[Wix Client] WIX_CLIENT_SECRET is not set — OAuth may fail for protected collections",
    );
  }

  if (resolvedSiteId && resolvedSiteId === clientId) {
    console.warn(
      "[Wix Client] siteId equals WIX_CLIENT_ID — these should be different values.",
    );
  }

  const authConfig: Record<string, string> = { clientId };
  if (clientSecret) authConfig.clientSecret = clientSecret;
  if (resolvedSiteId && resolvedSiteId !== clientId) authConfig.siteId = resolvedSiteId;

  return createClient({
    modules: CMS_MODULES,
    auth: OAuthStrategy(authConfig as any),
  });
}

function buildAdminClient(siteId: string | undefined) {
  const apiKey = process.env.WIX_API_KEY;
  const accountId = process.env.WIX_ACCOUNT_ID;
  const resolvedSiteId = siteId || process.env.WIX_META_SITE_ID || undefined;

  if (!apiKey || !accountId) {
    return null;
  }

  return createClient({
    modules: ADMIN_MODULES,
    auth: ApiKeyStrategy({
      apiKey,
      accountId,
      ...(resolvedSiteId ? { siteId: resolvedSiteId } : {}),
    }),
  });
}

/**
 * Build an API-key client with full CMS modules for a specific tenant site.
 * Used when the siteId differs from the default/www site because OAuthStrategy
 * is bound to a single site while ApiKeyStrategy is account-scoped.
 */
function buildTenantCmsClient(siteId: string) {
  const apiKey = process.env.WIX_API_KEY;
  const accountId = process.env.WIX_ACCOUNT_ID;

  if (!apiKey || !accountId) {
    console.warn(
      "[Wix Client] WIX_API_KEY or WIX_ACCOUNT_ID missing — cannot create tenant CMS client",
    );
    return null;
  }

  return createClient({
    modules: CMS_MODULES,
    auth: ApiKeyStrategy({ apiKey, accountId, siteId }),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- OAuth & ApiKey clients share the same runtime shape
type AnyWixClient = ReturnType<typeof buildOAuthClient> | ReturnType<typeof buildTenantCmsClient>;

// ── Singleton cache for the default (www) tenant ───────────────────────────
let _defaultClient: ReturnType<typeof buildOAuthClient> | undefined;
let _defaultAdminClient: ReturnType<typeof buildAdminClient> | undefined;

// ── Per-tenant client cache (avoids re-creating on every request) ──────────
const _tenantClients = new Map<string, AnyWixClient>();
const _tenantAdminClients = new Map<string, ReturnType<typeof buildAdminClient>>();

/**
 * Get a Wix CMS client. When `siteId` is provided AND differs from the
 * default site, returns a tenant-specific API-key client (account-scoped).
 * Without `siteId` (or when it matches the default site), returns the
 * OAuth-based singleton for the www/home site.
 */
export function wixClient(siteId?: string) {
  const defaultSiteId =
    process.env.WIX_META_SITE_ID ||
    process.env.WIX_SITE_ID ||
    process.env.NEXT_PUBLIC_WIX_SITE_ID;

  // No siteId or matches default → use the OAuth client (backward compat)
  if (!siteId || siteId === defaultSiteId) {
    if (_defaultClient === undefined) {
      _defaultClient = buildOAuthClient(undefined);
    }
    return _defaultClient;
  }

  // Non-default tenant → use an API-key client so the siteId is respected.
  // If WIX_API_KEY / WIX_ACCOUNT_ID are not configured (e.g. missing on a
  // Vercel environment), buildTenantCmsClient returns null. Fall back to the
  // default OAuth client so the tenant always serves www content rather than
  // empty states. Add WIX_API_KEY + WIX_ACCOUNT_ID to Vercel env vars to
  // enable per-tenant Wix CMS isolation.
  if (!_tenantClients.has(siteId)) {
    const tenantClient = buildTenantCmsClient(siteId);
    if (!tenantClient) {
      console.warn(
        `[Wix Client] buildTenantCmsClient returned null for siteId "${siteId}" ` +
        "(WIX_API_KEY or WIX_ACCOUNT_ID missing). Falling back to default OAuth client.",
      );
    }
    _tenantClients.set(siteId, tenantClient ?? buildOAuthClient(undefined));
  }
  return _tenantClients.get(siteId)!;
}

/**
 * Get a Wix Admin client. When `siteId` is provided, returns a tenant-specific
 * client (cached). Without `siteId`, returns the default singleton (www).
 */
export function wixAdminClient(siteId?: string) {
  if (!siteId) {
    if (_defaultAdminClient === undefined) {
      _defaultAdminClient = buildAdminClient(undefined);
    }
    return _defaultAdminClient;
  }

  if (!_tenantAdminClients.has(siteId)) {
    _tenantAdminClients.set(siteId, buildAdminClient(siteId));
  }
  return _tenantAdminClients.get(siteId)!;
}

export type WixClient = NonNullable<ReturnType<typeof wixClient>>;
export type WixAdminClient = NonNullable<ReturnType<typeof wixAdminClient>>;

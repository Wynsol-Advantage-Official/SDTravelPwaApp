# Multi-Tenant Architecture — SD Travel PWA

> **SOW Reference**: SDTravel-WixHeadless-MultiTenant_ScopeOfWork v1.0  
> **Domain**: `sanddiamondstravel.com` (Vercel)  
> **Principle**: Isolate the experience, share the infrastructure.

---

## User Tier Model (SOW §2)

| Tier | Identity | Access Scope |
|------|----------|--------------|
| **T1** | Public Visitor | Browse www + all subdomains. No auth required. Cannot access `/booking`, `/profile`, `/chat`, `/dashboard`. |
| **T2** | Authenticated End User | Global identity. One session cookie on `.sanddiamondstravel.com` → recognised on all subdomains. |
| **T3A** | Tenant Admin | Scoped to own subdomain. Middleware blocks cross-tenant admin access. |
| **T3B** | Super Admin | Unrestricted. Operates from `www.sanddiamondstravel.com`. No tenantId constraint. |

---

## Access Control Matrix (SOW §9)

| User | Public Pages | Booking / Profile / Chat | Own Tenant Admin | Other Tenant Admin | Super Admin Panel | Cross-Tenant Data |
|------|-------------|-------------------------|-----------------|-------------------|------------------|------------------|
| Public Visitor | ✓ | ✗ → Login | ✗ | ✗ | ✗ | ✗ |
| End User | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Tenant Admin | ✓ | ✓ | ✓ | ✗ → Redirect | ✗ | ✗ |
| Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Infrastructure Layers

```
┌─────────────────────────────────────────────────────────┐
│  Browser (any subdomain)                                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  Vercel Edge Middleware  (src/middleware.ts)             │
│  • Route classification (public / protected)            │
│  • Tenant resolution via Edge Config (<1ms)             │
│  • Session cookie verification                          │
│  • Inject x-tenant-id + x-wix-site-id headers          │
│  • Tenant Admin cross-domain enforcement                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  Next.js App Router  (src/app/)                         │
│  • Server Components read headers for tenant context    │
│  • Client Components read useTenant() context           │
│  • ISR with tenant-scoped cache keys                    │
└───────┬──────────────────────┬──────────────────────────┘
        │                      │
┌───────▼──────────┐  ┌───────▼──────────────────────────┐
│  Firebase         │  │  Wix Headless                    │
│  • Auth (global)  │  │  • 1 Client ID, N Site IDs       │
│  • Firestore      │  │  • Per-tenant SDK initialisation  │
│    (single DB,    │  │  • CMS + eCommerce per affiliate  │
│     tenantId      │  │                                   │
│     partitioned)  │  │                                   │
└──────────────────┘  └───────────────────────────────────┘
```

---

## Phase 1: Edge Middleware & Tenant Resolution

**SOW §3.1–3.2 · No dependencies**

### New Files
- `src/middleware.ts` — Next.js Edge Middleware
- `src/lib/edge-config/tenant-lookup.ts` — Typed Edge Config utilities
- `src/lib/edge-config/index.ts` — Barrel export

### Modified Files
- `next.config.ts` — Dev subdomain handling
- `package.json` — Add `@vercel/edge-config`

### Middleware Flow
```
Request → Extract hostname
        → Is protected route? → Yes → Check session cookie → Missing → Redirect /auth/sign-in
        → Resolve tenant:
            ├─ www / apex → x-tenant-id: www, x-wix-site-id: <default env>
            └─ subdomain → Edge Config lookup → inject x-tenant-id + x-wix-site-id
        → Tenant Admin? → Check tenantId matches subdomain → Mismatch → Redirect
        → NextResponse.next() with injected headers
```

### Route Classification
```typescript
const PUBLIC_ROUTES = ['/', '/about', '/destinations', '/tours', '/contact', '/affiliates']
const PROTECTED_ROUTES = ['/booking', '/profile', '/chat', '/dashboard']
```

---

## Phase 2: Authentication — Session Cookies & JWT Claims

**SOW §4.1–4.2 · Depends on Phase 1**

### New Files
- `src/app/api/auth/session/route.ts` — Session cookie endpoint (POST/DELETE)
- `src/lib/auth/session.ts` — `verifySessionCookie()` server utility
- `scripts/grant-role.mjs` — Replaces `grant-admin.mjs`

### Modified Files
- `src/hooks/useAuth.tsx` — POST token to session endpoint after `onAuthStateChanged`
- `src/lib/firebase/auth.ts` — Add `setUserRole(uid, role, tenantId?)`
- `src/lib/firebase/admin.ts` — Session cookie verification methods

### JWT Claims Schema
```typescript
// End User (global)
{ role: 'user', tenantId: null }

// Tenant Admin (scoped)
{ role: 'tenant_admin', tenantId: 'tenant-a' }

// Super Admin (unrestricted)
{ role: 'super_admin', tenantId: null }
```

### Session Cookie
```typescript
{ domain: '.sanddiamondstravel.com', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 604800 }
```

---

## Phase 3: Firestore Multi-Tenancy

**SOW §5.1–5.3 · Depends on Phase 2**

### New Files
- `src/types/tenant.ts` — `Tenant`, `TenantBranding` types
- `src/lib/services/tenant.service.ts` — Tenant CRUD
- `src/hooks/useTenant.tsx` — TenantProvider context
- `scripts/backfill-tenant-ids.mjs` — Migration script

### Modified Files
- `src/types/booking.ts` — Add `tenantId: string`
- `src/types/user.ts` — Add `tenantId: string | null`
- `src/types/chat.ts` — Add `tenantId: string`
- `src/lib/services/bookings.service.ts` — Tenant-scoped queries
- `src/lib/services/chat.service.ts` — Tenant-scoped queries
- `src/lib/services/profile.service.ts` — Include tenantId in writes
- `src/lib/services/ads.service.ts` — Tenant filter with www fallback
- `firestore.rules` — Full rewrite with `isSuperAdmin()`, `isTenantAdmin()`, `belongsToTenant()`
- `src/app/layout.tsx` — Add `<TenantProvider>`

### Firestore Schema
```
/tenants/{tenantId}     → { name, wixSiteId, domain, status, branding, createdAt }
/bookings/{bookingId}   → { ...existing, tenantId: string }
/users/{uid}            → { ...existing, tenantId: string | null }
/chatRooms/{roomId}     → { ...existing, tenantId: string }
```

### Migration
All existing documents get `tenantId: 'www'`. Initial `tenants/www` document created.

---

## Phase 4: Wix Dynamic SDK Initialization

**SOW §6.1–6.2 · Depends on Phase 1**

### Modified Files
- `src/lib/wix/client.ts` — Singleton → `createTenantWixClient(siteId)`
- `src/lib/wix/client-browser.ts` — Accept dynamic siteId from context
- `src/lib/wix/tours.ts` — Accept siteId parameter
- `src/lib/wix/bookings.ts` — Accept siteId parameter
- `src/lib/wix/ads.ts` — Accept siteId parameter
- `src/lib/services/tours.service.ts` — Pass tenant siteId through

### Pattern
```typescript
// Server Component
const siteId = (await headers()).get('x-wix-site-id')
const wix = createTenantWixClient(siteId!)

// Client Component
const { wixSiteId } = useTenant()
const wix = createTenantWixClient(wixSiteId)
```

---

## Phase 5: Automated Affiliate Onboarding

**SOW §8 · Depends on Phases 1–4**

### New Files
- `src/app/api/tenants/provision/route.ts` — Provisioning endpoint
- `src/app/affiliates/register/page.tsx` — Registration form
- `src/lib/services/provisioning.service.ts` — Orchestrator
- `src/lib/api/vercel.ts` — Vercel Domain + Edge Config API helpers

### Flow (< 30 seconds)
```
1. Affiliate submits form → POST /api/tenants/provision
2. Wix API → Create site → receive wixSiteId
3. Firestore → Create /tenants/{tenantId} document
4. Firebase Auth → Create admin user + set custom claims
5. Vercel API → Register subdomain domain
6. Edge Config → Add mapping { siteId, tenantId }
7. Subdomain resolves immediately
```

---

## Phase 6: Admin Dashboards & Role-Based UI

**Depends on Phases 2–3**

### New Files
- `src/app/dashboard/admin/page.tsx` — Tenant Admin (own-tenant scoped)
- `src/app/dashboard/super/page.tsx` — Super Admin (cross-tenant)

### Modified Files
- `src/components/auth/AuthGuard.tsx` — Add `requiredRole` prop
- `src/components/layout/desktop-shell/Sidebar.tsx` — Role-based nav items
- `src/components/layout/MobileBottomNav.tsx` — Role-based nav items

---

## Phase 7: White-Label Theming

**Parallel with Phase 6 · Depends on Phase 3**

### New Files
- `src/lib/config/brand.ts` — Default brand + per-tenant overrides

### Modified Files
- `src/types/tenant.ts` — Add `TenantBranding` fields
- `src/app/layout.tsx` — Inject tenant CSS custom properties

### Brand Config
```typescript
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Sand Diamonds Travel',
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? 'Where Every Journey Becomes a Diamond',
  logo: process.env.NEXT_PUBLIC_BRAND_LOGO ?? '/logos/brand/sd-logo.svg',
  supportEmail: process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL ?? 'concierge@sanddiamondstravel.com',
} as const
```

---

## Success Criteria (SOW §10)

| Criterion | Definition of Done |
|-----------|-------------------|
| **Scalability** | 1,000+ tenants, zero manual DNS changes per affiliate |
| **Data Isolation** | Firestore rules enforce absolute tenant isolation |
| **Session Continuity** | One login → recognised on all subdomains |
| **Tenant Admin Containment** | Middleware + Firestore rules block cross-tenant access |
| **Onboarding Speed** | Form → live subdomain in < 30 seconds |
| **Routing Overhead** | Tenant resolution < 50ms at edge |
| **Super Admin Visibility** | Cross-tenant dashboard, no per-tenant login |

---

## Decisions

- **Default tenant**: Existing data backfilled with `tenantId: 'www'`
- **Auth migration**: Session cookies layered alongside Firebase client auth (not a replacement)
- **Single Firestore**: tenantId field + rules = isolation (no separate projects)
- **Shared Wix Client ID**: One developer account, per-tenant Site IDs
- **Excluded**: Payment processing, email delivery, audit logging, rate limiting (future work)

## Environment Variables (new)

```env
# Vercel Edge Config
EDGE_CONFIG=                          # Edge Config connection string

# Session cookie domain
SESSION_COOKIE_DOMAIN=.sanddiamondstravel.com

# Vercel API (for provisioning)
VERCEL_API_TOKEN=                     # Vercel API token
VERCEL_PROJECT_ID=                    # Vercel project ID
VERCEL_TEAM_ID=                       # Vercel team ID (if applicable)
```

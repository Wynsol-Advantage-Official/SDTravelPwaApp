# SD Travel PWA — Project Conventions

## Project
SD Travel PWA ("Where Every Journey Becomes a Diamond") — luxury concierge travel booking platform with multi-tenant affiliate support.

## Tech Stack
- **Framework**: Next.js 15 App Router (React 19, TypeScript strict mode)
- **UI**: Tailwind CSS v4 + DaisyUI — **NOTE**: Tailwind v4 has breaking changes from v3; read `node_modules/next/dist/docs/` and `node_modules/tailwindcss/` docs before writing CSS; do not assume v3 API
- **Backend**: Firebase (Auth + Firestore with offline persistence), Wix SDK (CMS + eCommerce)
- **Multi-Tenant**: Vercel Edge Config for tenant resolution, subdomain-based routing
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **PWA**: `@ducanh2912/next-pwa` + Workbox

## Architecture layers (strict — no skipping)
```
src/app/            → Next.js App Router pages and layouts (Server/Client components)
src/pages/api/      → Next.js Pages API routes (Node.js runtime — used for booking/admin endpoints)
src/middleware.ts    → Edge Middleware — tenant resolution, auth gating, header injection
src/hooks/          → React state layer (Client components only) — imports from services only
src/lib/services/   → Service layer — orchestrates operations, wraps Firebase/Wix
src/lib/rules/      → Pure business logic — no async, no external imports
src/lib/edge-config/→ Vercel Edge Config tenant lookup utilities
src/lib/firebase/   → Firebase client + admin SDK setup
src/lib/wix/        → Wix SDK wrappers (client, tours, booking-fetch, media)
src/components/     → Reusable UI components
src/types/          → Shared TypeScript types
src/mocks/          → Mock data for development/testing
scripts/            → Node.js admin/migration scripts (grant-role, backfill, provisioning)
```

**Rule**: Hooks MUST NOT import directly from `src/lib/firebase/` or `src/lib/wix/`. All data access goes through `src/lib/services/`.

**Hybrid routing**: The project uses **both** App Router (`src/app/`) and Pages API routes (`src/pages/api/`). Booking and admin endpoints live in `src/pages/api/bookings/` because they need Node.js runtime features. Do not mix — keep API routes in `src/pages/api/` and page components in `src/app/`.

## File/naming conventions
- Files: `kebab-case` (e.g., `booking-form.tsx`, `chat.service.ts`)
- Components: `PascalCase` (e.g., `BookingForm`, `ChatBubble`)
- Each `src/lib/` subdirectory exports via a barrel `index.ts`
- Each `src/components/` group exports via a barrel `index.ts`

## TypeScript
- Strict mode (`"strict": true` in tsconfig.json)
- No `any` unless unavoidable — add a comment explaining why
- Use types from `src/types/` for domain objects (`Tour`, `Booking`, `ChatMessage`, `UserProfile`)

## Next.js App Router patterns
- **ISR**: use `export const revalidate = 300` + `export const dynamicParams = true`
- **generateStaticParams**: MUST be fault-tolerant with try/catch, returning `[]` on failure — never let it throw
- **Server Components**: default; add `"use client"` only when needed (hooks, events, browser APIs)
- Reference: `src/app/booking/[tourSlug]/page.tsx` for the canonical ISR + generateStaticParams pattern

## Service layer pattern
- Reference: `src/lib/services/chat.service.ts` for the canonical service module structure
- Services wrap Firebase/Wix calls and handle errors at the boundary
- Reference: `src/lib/rules/chat-rules.ts` for the canonical pure-rules module structure

## Firebase
- Auth: `getAuth()`, `onAuthStateChanged()` from `src/lib/firebase/`
- Firestore: offline persistence enabled — always handle cache-vs-server states
- Never call Firebase directly from hooks — only through services
- Custom claims on auth tokens: `role` ("user" | "tenant_admin" | "super_admin"), `tenantId` (slug or null), `admin` (boolean)
- Composite indexes defined in `firestore.indexes.json` — deploy with `firebase deploy --only firestore:indexes`

## Wix SDK
- For CMS (tours, destinations) and eCommerce (bookings)
- Accessed only through `src/lib/wix/` and exposed via `src/lib/services/`
- **Multi-tenant**: `wixClient(siteId?)` accepts an optional Wix Meta Site ID. When omitted, uses `WIX_META_SITE_ID` env var (www default). Tenant-specific site IDs come from Edge Config via `useTenant()` or request hostname resolution.
- Client-side: hooks call `useTenant()` to get `wixSiteId`, pass it through service/fetch layers
- Server-side (Pages API): resolve from `req.headers.host` via `lookupTenant()` since middleware skips `/api` routes

## Multi-Tenant Architecture
- Subdomains resolve to tenants via Vercel Edge Config (`src/lib/edge-config/tenant-lookup.ts`)
- Middleware (`src/middleware.ts`) injects `x-tenant-id`, `x-wix-site-id`, `x-tenant-name` headers on page requests
- Middleware **skips** `/api`, `/_next`, and static asset routes — Pages API routes must resolve tenant from `req.headers.host` independently
- `useTenant()` hook provides `{ tenantId, wixSiteId, tenantName }` to client components
- All Firestore documents include a `tenantId` field for data isolation
- **Booking scoping rule**: `/dashboard/admin/bookings` (admin-list API) ALWAYS scopes by the current portal's `tenantId` — this applies to ALL roles including super_admin. There is no cross-tenant bypass for booking lists.

## Dashboard Navigation
- Navigation rules defined in `src/lib/rules/navigation-rules.ts`
- `getDashboardNavGroupsForRole(role)` returns groups: Portal (all users) + Tenant Admin + Super Admin (by role rank)
- Dashboard sidebar rendered by `src/components/dashboard/DashboardAside.tsx`
- Reference: `src/lib/rules/navigation-rules.ts` for nav group definitions and role gating
- Dashboard routes:
  - `/dashboard` — User overview
  - `/dashboard/bookings` — User's own bookings (scoped by uid + tenantId)
  - `/dashboard/admin` — Tenant admin dashboard
  - `/dashboard/admin/bookings` — All bookings for the current tenant (admin-list API)
  - `/dashboard/super` — Platform overview (super_admin only)
  - `/dashboard/super/tenants` — Tenant management

## Build verification
Run `npm run build` to verify no TypeScript or compilation errors after changes.

## Test runner
`npm test` (Jest — check `package.json` for exact script)

## Key reference files
- `src/lib/rules/chat-rules.ts` — pure rules module example
- `src/lib/services/chat.service.ts` — service layer example
- `src/app/booking/[tourSlug]/page.tsx` — ISR + generateStaticParams example
- `src/hooks/useChat.ts` — hook-to-service import example
- `src/lib/rules/navigation-rules.ts` — dashboard nav groups + role-gated navigation
- `src/lib/edge-config/tenant-lookup.ts` — Edge Config tenant resolution
- `src/middleware.ts` — Edge Middleware (tenant resolution, auth gating, header injection)
- `src/pages/api/bookings/initiate.ts` — booking creation with multi-tenant Wix + Firestore
- `src/pages/api/bookings/admin-list.ts` — tenant-scoped admin booking list (hostname-based)
- `src/app/dashboard/admin/bookings/page.tsx` — admin bookings management page
- `src/hooks/useTenant.tsx` — TenantProvider context (tenantId, wixSiteId, tenantName)

## Mock mode
`src/hooks/useMockMode.tsx` — toggle for using mock data vs live Firebase/Wix data. Check this when writing tests.

## PWA
- Service worker at `public/sw.js` (generated by next-pwa)
- Manifest at `public/manifest.json`
- Do not edit `public/sw.js` or `public/workbox-*.js` directly — they are generated

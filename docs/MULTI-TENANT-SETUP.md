# Multi-Tenant Setup Guide

> A step-by-step guide to setting up and using the multi-tenant features of the SD Travel PWA.  
> Written for developers who are new to the project.

---

## Table of Contents

1. [What is Multi-Tenancy?](#1-what-is-multi-tenancy)
2. [Prerequisites](#2-prerequisites)
3. [Environment Variables](#3-environment-variables)
4. [Migrating Existing Data](#4-migrating-existing-data)
5. [Setting Up Vercel Edge Config](#5-setting-up-vercel-edge-config)
6. [User Roles Explained](#6-user-roles-explained)
7. [Assigning Roles to Users](#7-assigning-roles-to-users)
8. [Creating a New Tenant (Affiliate)](#8-creating-a-new-tenant-affiliate)
9. [Testing Locally with Subdomains](#9-testing-locally-with-subdomains)
10. [How It Works Under the Hood](#10-how-it-works-under-the-hood)
11. [Tenant Branding (White-Label)](#11-tenant-branding-white-label)
12. [Admin Dashboards](#12-admin-dashboards)
13. [Firestore Security Rules](#13-firestore-security-rules)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. What is Multi-Tenancy?

Multi-tenancy lets multiple affiliate travel businesses share the same application while each getting their own branded portal on a unique subdomain.

**Example:**

| Subdomain | Who uses it |
|-----------|-------------|
| `www.sanddiamonds.travel` | The main Sand Diamonds Travel site |
| `acme.sanddiamonds.travel` | Acme Travel Co. (an affiliate partner) |
| `luxe.sanddiamonds.travel` | Luxe Vacations (another affiliate) |

Each affiliate (called a **tenant**) gets:
- Their own subdomain
- Their own Wix CMS site for tours and products
- Their own customer bookings and chat rooms (isolated from other tenants)
- Optional custom branding (logo, colors, tagline)

All tenants share the same deployed application, the same Firebase project, and the same Firestore database. Data is kept separate using a `tenantId` field on every document.

---

## 2. Prerequisites

Before starting, make sure you have:

- **Node.js 18+** installed
- **Firebase project** with Authentication and Firestore enabled
- **Firebase service account credentials** (Project Settings → Service Accounts → Generate new private key)
- **Wix Headless site** with a Client ID and Site ID
- **Vercel account** with the project deployed
- Access to the project's `.env.local` file

---

## 3. Environment Variables

Create or update your `.env.local` file in the project root with these variables:

```env
# ─── Firebase (you should already have these) ────────────────────────
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ─── Wix (you should already have these) ─────────────────────────────
NEXT_PUBLIC_WIX_CLIENT_ID=your-wix-client-id
WIX_CLIENT_SECRET=your-wix-client-secret
WIX_META_SITE_ID=your-default-wix-meta-site-id

# ─── NEW: Multi-Tenant Variables ─────────────────────────────────────

# Vercel Edge Config connection string (see Section 5)
EDGE_CONFIG=https://edge-config.vercel.com/ecfg_xxxxx?token=xxxxx

# Session cookie domain — the dot prefix is important!
# This makes the cookie available on ALL subdomains.
SESSION_COOKIE_DOMAIN=.sanddiamonds.travel

# Vercel API access (needed for automated tenant provisioning)
VERCEL_TOKEN=your-vercel-api-token
VERCEL_PROJECT_ID=your-vercel-project-id
VERCEL_TEAM_ID=your-vercel-team-id          # optional, only if you use Vercel Teams
```

### Where to find these values

| Variable | Where to find it |
|----------|-----------------|
| `EDGE_CONFIG` | Vercel Dashboard → Storage → Edge Config → your store → Connect → copy the connection string |
| `SESSION_COOKIE_DOMAIN` | Always `.sanddiamonds.travel` (with the leading dot) for production |
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_PROJECT_ID` | Vercel Dashboard → your project → Settings → General → Project ID |
| `VERCEL_TEAM_ID` | Vercel Dashboard → Settings → General → Team ID (only for team accounts) |

---

## 4. Migrating Existing Data

If you already have data in Firestore from before the multi-tenant update, you need to run the migration script **once**. This script:

1. Creates a `/tenants/www` document (the default tenant for the main site)
2. Adds `tenantId: "www"` to all existing bookings and chat rooms
3. Sets `role: "user"` on all Firebase Auth users who don't have a role yet
4. Preserves existing admin users by upgrading them to `super_admin`

### Dry run first (safe — changes nothing)

```bash
node scripts/backfill-tenant-ids.mjs --dry-run
```

This prints what _would_ change without actually modifying anything. Review the output carefully.

### Run the actual migration

```bash
node scripts/backfill-tenant-ids.mjs
```

You will see output like:

```
Multi-tenant migration

Step 1: Ensure /tenants/www document
  ✓ Created /tenants/www

Step 2: Backfill bookings
  bookings: 42 updated, 0 already had tenantId

Step 3: Backfill chatRooms
  chatRooms: 15 updated, 0 already had tenantId

Step 4: Backfill user auth claims
  Users: 28 updated, 0 already had role claim

✓ Migration complete.
```

> **Note:** This script is idempotent — running it again will skip documents and users that have already been migrated.

---

## 5. Setting Up Vercel Edge Config

Edge Config is what allows the app to resolve which subdomain belongs to which tenant in under 1 millisecond. Here's how to set it up:

### Step 1: Create an Edge Config store

1. Go to Vercel Dashboard → **Storage** → **Create** → **Edge Config**
2. Give it a name like `sd-travel-tenants`
3. Click **Create**

### Step 2: Add the default tenant entry

In the Edge Config store, add this item:

- **Key:** `tenant:www`
- **Value:**
  ```json
  {
    "tenantId": "www",
    "siteId": "your-default-wix-meta-site-id",
    "name": "Sand Diamonds Travel"
  }
  ```

Replace `your-default-wix-meta-site-id` with your actual `WIX_META_SITE_ID` value.

### Step 3: Connect it to your project

1. In the Edge Config store page, click **Connect to Project**
2. Select your SD Travel project
3. This automatically sets the `EDGE_CONFIG` environment variable on Vercel

### Step 4: Copy the connection string to `.env.local`

Click the **Connection String** tab and copy the full URL into your local `.env.local` as the `EDGE_CONFIG` value.

> **Development shortcut:** If `EDGE_CONFIG` is not set locally, the middleware falls back to using the `WIX_META_SITE_ID` env var and treats all requests as the `www` tenant. So local development works even without Edge Config.

---

## 6. User Roles Explained

The app has four levels of access:

| Role | What they can do |
|------|-----------------|
| **Public Visitor** (no account) | Browse tours, destinations, and public pages on any subdomain |
| **User** (`role: "user"`) | Everything above, plus: book tours, chat with concierge, manage profile |
| **Tenant Admin** (`role: "tenant_admin"`) | Everything above for their own tenant, plus: view all bookings and users in their portal, manage tenant settings |
| **Super Admin** (`role: "super_admin"`) | Full access to everything across all tenants: create tenants, manage affiliates, view all data platform-wide |

### How roles are stored

Roles are stored as **Firebase Auth custom claims** on each user:

```json
// Regular user
{ "role": "user", "tenantId": null }

// Tenant admin for the "acme" portal
{ "role": "tenant_admin", "tenantId": "acme" }

// Super admin (unrestricted)
{ "role": "super_admin", "tenantId": null }
```

---

## 7. Assigning Roles to Users

Use the `grant-role.mjs` script to assign roles. The user must already have a Firebase Auth account (they need to have signed up first).

### Make someone a Super Admin

```bash
node scripts/grant-role.mjs <firebase-uid> super_admin
```

### Make someone a Tenant Admin

```bash
node scripts/grant-role.mjs <firebase-uid> tenant_admin <tenant-id>
```

For example, to make user `abc123` the admin of the `acme` tenant:

```bash
node scripts/grant-role.mjs abc123 tenant_admin acme
```

### Reset someone to a regular user

```bash
node scripts/grant-role.mjs <firebase-uid> user
```

### Finding a user's Firebase UID

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Users**
3. Find the user by email
4. Copy the **User UID** column value

> **Important:** After changing a user's role, they need to **sign out and sign back in** for the new role to take effect. This is because Firebase Auth tokens are cached on the client and only refresh periodically.

---

## 8. Creating a New Tenant (Affiliate)

There are two ways to create a new tenant:

### Option A: Through the Super Admin API (programmatic)

Send a POST request to `/api/tenants/provision` with a super admin session cookie:

```json
{
  "subdomain": "acme",
  "tenantName": "Acme Travel Co.",
  "wixSiteId": "the-wix-site-id-for-acme",
  "adminUid": "firebase-uid-of-the-tenant-admin"
}
```

This automatically:
1. Creates a `/tenants/acme` document in Firestore
2. Sets `tenant_admin` role on the specified user
3. Registers `acme.sanddiamonds.travel` with Vercel
4. Adds the tenant to Edge Config for instant resolution

### Option B: Through the Affiliate Application form

1. The affiliate visits `/affiliates/register` and fills out the application
2. The application is saved to the `affiliateApplications` collection in Firestore
3. A Super Admin reviews the application in the Super Admin dashboard
4. Once approved, the Super Admin triggers provisioning via the API above

### What the affiliate needs to provide

- **Business Name** — display name for their portal
- **Desired Subdomain** — e.g., `acme` (becomes `acme.sanddiamonds.travel`)
- **Contact Info** — name, email, phone
- **Wix Site ID** — they need their own Wix Headless site. Found in Wix Dashboard → Headless Settings → Site ID

### Reserved subdomains

The following subdomains are reserved and cannot be used by affiliates:

`www`, `api`, `admin`, `app`, `mail`, `smtp`, `ftp`, `staging`, `dev`, `test`, `demo`

---

## 9. Testing Locally with Subdomains

During development, you can simulate subdomains using `localhost`.

### How it works

The middleware recognizes `*.localhost:3000` patterns:

| URL | Resolved Tenant |
|-----|----------------|
| `http://localhost:3000` | `www` (default) |
| `http://acme.localhost:3000` | `acme` |
| `http://luxe.localhost:3000` | `luxe` |

Most modern browsers resolve `*.localhost` automatically. If yours doesn't, add entries to your hosts file:

**Windows** — edit `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1   acme.localhost
127.0.0.1   luxe.localhost
```

**macOS/Linux** — edit `/etc/hosts`:
```
127.0.0.1   acme.localhost
127.0.0.1   luxe.localhost
```

### Local session cookies

On localhost, the session cookie omits the domain attribute (since `.localhost` cookies behave differently across browsers). This means each `*.localhost` subdomain gets its own cookie, which is fine for testing.

In production, the cookie is set on `.sanddiamonds.travel` so a single login works across all subdomains.

---

## 10. How It Works Under the Hood

Here's what happens when a user visits `acme.sanddiamonds.travel/tours`:

```
1. Browser sends request to Vercel
          ↓
2. Edge Middleware (src/middleware.ts) runs:
   a. Extracts hostname → "acme.sanddiamonds.travel"
   b. Extracts subdomain → "acme"
   c. Looks up "tenant:acme" in Edge Config → { tenantId: "acme", siteId: "wix-456", name: "Acme Travel" }
   d. Checks route: /tours is PUBLIC → no auth required
   e. Injects headers into the request:
      - x-tenant-id: acme
      - x-wix-site-id: wix-456
      - x-tenant-name: Acme Travel
          ↓
3. Next.js App Router receives the request:
   a. Root layout reads headers → creates TenantContext
   b. Fetches branding for "acme" from Firestore → injects CSS custom properties
   c. Wraps page in <TenantProvider>
          ↓
4. Page component renders:
   a. Server Components read headers directly
   b. Client Components call useTenant() → { tenantId: "acme", wixSiteId: "wix-456" }
   c. Wix SDK initialized with "wix-456" site ID → fetches Acme's tours
          ↓
5. User sees Acme Travel's branded tour listing
```

For **protected routes** (e.g., `/dashboard`), step 2d also checks for a valid `session` cookie and verifies the user is authenticated.

For **Tenant Admin routes**, step 2 additionally verifies that the admin's `tenantId` claim matches the subdomain they are visiting.

---

## 11. Tenant Branding (White-Label)

Each tenant can have custom branding stored in their Firestore document at `/tenants/{tenantId}`:

```json
{
  "tenantId": "acme",
  "name": "Acme Travel Co.",
  "wixSiteId": "...",
  "domain": "acme.sanddiamonds.travel",
  "status": "active",
  "branding": {
    "logo": "/uploads/acme-logo.svg",
    "primaryColor": "#1a365d",
    "accentColor": "#e53e3e",
    "tagline": "Adventure Awaits",
    "supportEmail": "help@acmetravel.com"
  }
}
```

### What gets customized

| Field | What it affects |
|-------|----------------|
| `logo` | URL to the tenant's logo image |
| `primaryColor` | Sets the `--brand-primary` CSS custom property |
| `accentColor` | Sets the `--brand-accent` CSS custom property |
| `tagline` | Displayed in hero sections and metadata |
| `supportEmail` | Used in contact links and support references |

If a tenant has no branding configured, the default Sand Diamonds Travel branding is used.

### Using brand colors in CSS

The branding colors are injected as CSS custom properties on the `:root` element. You can reference them in your styles:

```css
.my-button {
  background-color: var(--brand-primary);
  border-color: var(--brand-accent);
}
```

---

## 12. Admin Dashboards

### Tenant Admin Dashboard (`/dashboard/admin`)

Accessible to users with `tenant_admin` role. Shows:
- Bookings, users, and activity scoped to their own tenant
- Portal configuration and settings
- Tenant-specific metrics

A Tenant Admin visiting `acme.sanddiamonds.travel/dashboard/admin` sees only Acme's data.

### Super Admin Dashboard (`/dashboard/super`)

Accessible only to users with `super_admin` role. Shows:
- Platform-wide overview across all tenants
- Tenant management (create, suspend, configure)
- Affiliate application review and approval
- Cross-tenant data access

### Navigation

The sidebar automatically shows different navigation items based on the user's role:

- **Regular users** see: Discover + Account groups
- **Tenant Admins** additionally see: Tenant Admin group (Dashboard, All Bookings, Users, Settings)
- **Super Admins** additionally see: Super Admin group (Platform Overview, Tenants, Applications)

---

## 13. Firestore Security Rules

The security rules enforce tenant isolation at the database level. Even if the middleware were bypassed, Firestore itself prevents unauthorized access.

Key rules:
- **Users** can only read/write their own profile
- **Bookings** are filtered by `tenantId` — a Tenant Admin can only query bookings where `tenantId` matches their claim
- **Chat rooms** follow the same pattern as bookings
- **Tenant documents** are readable by the owning Tenant Admin, writable only by Super Admins
- **Super Admins** have unrestricted read/write access

After modifying `firestore.rules`, deploy them with:

```bash
firebase deploy --only firestore:rules
```

---

## 14. Troubleshooting

### "I changed a user's role but they still see the old permissions"

The user needs to sign out and sign back in. Firebase Auth tokens are cached and only refresh when a new token is fetched.

### "Subdomains aren't resolving in development"

Make sure `*.localhost` resolves on your machine. Try visiting `http://test.localhost:3000` in your browser. If it doesn't work, add entries to your hosts file (see Section 9).

### "Edge Config lookup returns null for a tenant"

1. Check that the key in Edge Config follows the format `tenant:<subdomain>` (e.g., `tenant:acme`)
2. Verify the value is valid JSON with `tenantId`, `siteId`, and `name` fields
3. Make sure `EDGE_CONFIG` is set in your environment

### "Session cookie not working across subdomains"

- Verify `SESSION_COOKIE_DOMAIN` is set to `.sanddiamonds.travel` (with the leading dot)
- Check that the cookie is being set as `httpOnly`, `secure`, and `sameSite: lax`
- In development on localhost, cross-subdomain cookies won't work — this is expected

### "Tenant admin can access another tenant's subdomain"

The middleware should redirect them. Check that:
1. The user's custom claims have the correct `tenantId`
2. The middleware is running (check Vercel function logs)
3. The session cookie contains the up-to-date token (sign out and back in)

### "Provisioning fails with VERCEL_TOKEN error"

Make sure `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and optionally `VERCEL_TEAM_ID` are all set in `.env.local`. The token needs the "Create Project Domain" permission.

### "TypeScript errors after pulling multi-tenant changes"

Run `npm install` first — the `@vercel/edge-config` package was added as a new dependency.

---

## Quick Reference: Common Commands

```bash
# Run the data migration (do dry run first!)
node scripts/backfill-tenant-ids.mjs --dry-run
node scripts/backfill-tenant-ids.mjs

# Assign roles
node scripts/grant-role.mjs <uid> super_admin
node scripts/grant-role.mjs <uid> tenant_admin <tenant-id>
node scripts/grant-role.mjs <uid> user

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Verify build
npm run build

# Run type checker
npx tsc --noEmit

# Start dev server
npm run dev
```

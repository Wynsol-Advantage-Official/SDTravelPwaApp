// ---------------------------------------------------------------------------
// Tenant types — maps to Firestore `tenants/` collection + Edge Config
// ---------------------------------------------------------------------------

export type UserRole = "user" | "tenant_admin" | "super_admin"

/** Stored in Vercel Edge Config for sub-millisecond lookup at the edge. */
export interface TenantConfig {
  tenantId: string
  siteId: string
  name: string
}

/** Social media profile URLs for a tenant. */
export interface TenantSocialLinks {
  instagram?: string
  facebook?: string
  x?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
}

/** Branding overrides stored in Firestore `tenants/{tenantId}` doc. */
export interface TenantBranding {
  logo?: string
  primaryColor?: string
  accentColor?: string
  tagline?: string
  supportEmail?: string
  phone?: string
  social?: TenantSocialLinks
}

/** Full tenant record stored in Firestore `tenants/{tenantId}`. */
export interface Tenant {
  tenantId: string
  name: string
  wixSiteId: string
  domain: string
  status: "active" | "provisioning" | "suspended"
  branding?: TenantBranding
  createdAt: Date
  updatedAt: Date
}

/** Resolved tenant context available to components at runtime. */
export interface TenantContext {
  tenantId: string
  wixSiteId: string
  tenantName: string
  branding?: TenantBranding
}

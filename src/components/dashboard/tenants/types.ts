export interface TenantRecord {
  tenantId: string
  name: string
  domain: string
  wixSiteId: string | null
  status: "active" | "suspended" | "provisioning"
  branding?: Partial<TenantBrandingDraft> | null
  createdAt: string | null
  updatedAt: string | null
}

export interface TenantBrandingDraft {
  logo: string
  primaryColor: string
  accentColor: string
  tagline: string
  supportEmail: string
  phone: string
}

export interface ProvisionedTenantSummary {
  tenantId: string
  domain: string
  status: "active"
}

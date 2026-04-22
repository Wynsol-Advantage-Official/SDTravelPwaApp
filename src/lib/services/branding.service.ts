// ---------------------------------------------------------------------------
// Tenant Branding Service — Server-side (SOW §9)
// ---------------------------------------------------------------------------
// Fetches tenant branding overrides from Firestore and merges with defaults.
// Used by the root layout to inject CSS custom properties and brand values.
// ---------------------------------------------------------------------------

import { adminDb } from "@/lib/firebase/admin"
import type { TenantBranding } from "@/types/tenant"

/** Default branding for the www (root) tenant. */
export const DEFAULT_BRANDING: Required<TenantBranding> = {
  logo: "/logos/brand/full_colour.svg",
  primaryColor: "#043750",   // ocean-deep
  accentColor: "#1282a5",    // ocean
  tagline: "Where Every Journey Becomes a Diamond",
  supportEmail: "support@sanddiamondstravel.com",
  phone: "+1 876 276-7352",
}

/**
 * Fetch branding overrides for a tenant and merge with defaults.
 * Returns the default branding for "www" or unknown tenants.
 */
export async function getTenantBranding(
  tenantId: string
): Promise<Required<TenantBranding>> {
  if (tenantId === "www") return DEFAULT_BRANDING

  try {
    const doc = await adminDb.collection("tenants").doc(tenantId).get()
    if (!doc.exists) return DEFAULT_BRANDING

    const data = doc.data()
    const branding = data?.branding as TenantBranding | undefined

    return {
      logo: branding?.logo || DEFAULT_BRANDING.logo,
      primaryColor: branding?.primaryColor || DEFAULT_BRANDING.primaryColor,
      accentColor: branding?.accentColor || DEFAULT_BRANDING.accentColor,
      tagline: branding?.tagline || DEFAULT_BRANDING.tagline,
      supportEmail: branding?.supportEmail || DEFAULT_BRANDING.supportEmail,
      phone: branding?.phone || DEFAULT_BRANDING.phone,
    }
  } catch (err) {
    console.error(`[Branding] Failed to fetch branding for tenant ${tenantId}:`, err)
    return DEFAULT_BRANDING
  }
}

/**
 * Generate CSS custom property declarations for a tenant's branding.
 * Applied to the <html> element via style attribute in the root layout.
 */
export function brandingToCssVars(branding: Required<TenantBranding>): string {
  return [
    `--brand-primary: ${branding.primaryColor}`,
    `--brand-accent: ${branding.accentColor}`,
  ].join("; ")
}

// ---------------------------------------------------------------------------
// API Route: /api/tenant/branding
// ---------------------------------------------------------------------------
// Public GET — returns safe branding fields for the current tenant resolved
// from the request hostname. No auth required (branding is public data).
// ---------------------------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next"
import { adminDb } from "@/lib/firebase/admin"
import { lookupTenant } from "@/lib/edge-config/tenant-lookup"
import type { TenantBranding, TenantSocialLinks } from "@/types/tenant"

export interface TenantBrandingResponse {
  tenantId: string
  name: string
  tagline: string | null
  logo: string | null
  primaryColor: string | null
  accentColor: string | null
  supportEmail: string | null
  phone: string | null
  social: TenantSocialLinks | null
}

interface ErrorData {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TenantBrandingResponse | ErrorData>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  // Resolve tenant from hostname
  let tenantId = "www"
  try {
    const host = (req.headers.host ?? "").split(":")[0]
    const subdomain = host.includes(".") ? host.split(".")[0] : ""
    const tenantConfig = await lookupTenant(subdomain)
    if (tenantConfig?.tenantId) tenantId = tenantConfig.tenantId
  } catch {
    // fall through — use "www"
  }

  try {
    const snap = await adminDb.collection("tenants").doc(tenantId).get()
    if (!snap.exists) {
      return res.status(404).json({ error: "Tenant not found" })
    }
    const data = snap.data() as { name?: string; branding?: TenantBranding }
    const branding = data.branding ?? {}

    // Cache for 60 seconds at CDN edge; stale-while-revalidate for 5 min
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")

    return res.status(200).json({
      tenantId,
      name: data.name ?? tenantId,
      tagline: branding.tagline ?? null,
      logo: branding.logo ?? null,
      primaryColor: branding.primaryColor ?? null,
      accentColor: branding.accentColor ?? null,
      supportEmail: branding.supportEmail ?? null,
      phone: branding.phone ?? null,
      social: branding.social ?? null,
    })
  } catch (err) {
    console.error("[tenant/branding GET]", err)
    return res.status(500).json({ error: "Failed to fetch branding" })
  }
}

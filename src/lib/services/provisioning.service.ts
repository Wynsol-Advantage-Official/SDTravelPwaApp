// ---------------------------------------------------------------------------
// Provisioning Service — Affiliate Onboarding (SOW §7)
// ---------------------------------------------------------------------------
// Orchestrates tenant creation: Firestore doc → Firebase Auth claims →
// Vercel domain registration → Edge Config update.
//
// Server-only: imports firebase-admin SDK.
// ---------------------------------------------------------------------------

import { adminDb, adminAuth } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { addDomainToProject, upsertTenantEdgeConfig } from "@/lib/api/vercel"
import type { Tenant } from "@/types/tenant"

const BASE_DOMAIN = "sanddiamondstravel.com"

export interface ProvisionRequest {
  /** Desired subdomain (e.g. "acme") — will be validated & lower-cased */
  subdomain: string
  /** Display name for the tenant */
  tenantName: string
  /** Wix site ID for the tenant's headless CMS */
  wixSiteId: string
  /** Firebase UID of the user who will become tenant_admin */
  adminUid: string
}

export interface ProvisionResult {
  tenantId: string
  domain: string
  status: "active"
}

// ── Validation ─────────────────────────────────────────────────────────────

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "smtp",
  "ftp",
  "staging",
  "dev",
  "test",
  "demo",
])

function validateSubdomain(raw: string): string {
  const subdomain = raw.trim().toLowerCase()
  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    throw new ProvisionError(
      "INVALID_SUBDOMAIN",
      "Subdomain must be 1-63 chars of lowercase letters, digits, and hyphens."
    )
  }
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    throw new ProvisionError("RESERVED_SUBDOMAIN", `"${subdomain}" is reserved.`)
  }
  return subdomain
}

// ── Error class ────────────────────────────────────────────────────────────

export type ProvisionErrorCode =
  | "INVALID_SUBDOMAIN"
  | "RESERVED_SUBDOMAIN"
  | "SUBDOMAIN_TAKEN"
  | "VERCEL_DOMAIN_FAILED"
  | "EDGE_CONFIG_FAILED"
  | "FIRESTORE_FAILED"
  | "AUTH_CLAIMS_FAILED"

export class ProvisionError extends Error {
  code: ProvisionErrorCode
  constructor(code: ProvisionErrorCode, message: string) {
    super(message)
    this.name = "ProvisionError"
    this.code = code
  }
}

// ── Main provisioning flow ─────────────────────────────────────────────────

export async function provisionTenant(
  req: ProvisionRequest
): Promise<ProvisionResult> {
  const subdomain = validateSubdomain(req.subdomain)
  const domain = `${subdomain}.${BASE_DOMAIN}`
  const tenantId = subdomain // subdomain IS the tenantId

  // 1. Check Firestore for existing tenant
  const existingDoc = await adminDb.collection("tenants").doc(tenantId).get()
  if (existingDoc.exists) {
    throw new ProvisionError("SUBDOMAIN_TAKEN", `Tenant "${tenantId}" already exists.`)
  }

  // 2. Create Firestore tenant document
  const tenantData: Omit<Tenant, "createdAt" | "updatedAt"> = {
    tenantId,
    name: req.tenantName,
    wixSiteId: req.wixSiteId,
    domain,
    status: "provisioning",
  }

  try {
    await adminDb
      .collection("tenants")
      .doc(tenantId)
      .set({
        ...tenantData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
  } catch (err) {
    throw new ProvisionError(
      "FIRESTORE_FAILED",
      `Failed to create tenant doc: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  // 3. Set Firebase Auth custom claims for the admin user
  try {
    await adminAuth.setCustomUserClaims(req.adminUid, {
      role: "tenant_admin",
      tenantId,
    })
  } catch (err) {
    // Rollback: delete tenant doc
    await adminDb.collection("tenants").doc(tenantId).delete().catch(() => {})
    throw new ProvisionError(
      "AUTH_CLAIMS_FAILED",
      `Failed to set admin claims: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  // 4. Register domain with Vercel
  try {
    await addDomainToProject(domain)
  } catch (err) {
    // Non-fatal: log but continue — DNS may need manual config
    console.error(`[Provisioning] Vercel domain registration failed for ${domain}:`, err)
  }

  // 5. Update Edge Config for tenant resolution
  try {
    await upsertTenantEdgeConfig(subdomain, {
      tenantId,
      siteId: req.wixSiteId,
      name: req.tenantName,
    })
  } catch (err) {
    console.error(`[Provisioning] Edge Config update failed for ${subdomain}:`, err)
  }

  // 6. Mark tenant as active
  try {
    await adminDb.collection("tenants").doc(tenantId).update({
      status: "active",
      updatedAt: FieldValue.serverTimestamp(),
    })
  } catch {
    // Non-fatal: tenant doc already exists with provisioning status
    console.error(`[Provisioning] Failed to mark tenant ${tenantId} as active`)
  }

  return { tenantId, domain, status: "active" }
}

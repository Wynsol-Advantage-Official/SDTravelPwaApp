// ---------------------------------------------------------------------------
// API Route: /api/admin/tenant-settings
// ---------------------------------------------------------------------------
// GET  — return the current tenant's settings from Firestore
// PUT  — update allowed fields (name, branding, contact)
//
// Auth: Bearer ID token required; role must be tenant_admin or super_admin.
// Tenant is resolved from the token's tenantId claim (or hostname fallback).
// ---------------------------------------------------------------------------

import type { NextApiRequest, NextApiResponse } from "next"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { lookupTenant } from "@/lib/edge-config/tenant-lookup"
import { upsertTenantEdgeConfig } from "@/lib/api/vercel"
import { FieldValue } from "firebase-admin/firestore"
import type { Tenant, TenantBranding } from "@/types/tenant"

// Fields a tenant_admin is NOT allowed to update.
const RESTRICTED_FIELDS = new Set(["tenantId", "domain", "wixSiteId", "status", "createdAt"])

interface SettingsData {
  tenant: Tenant
}

interface ErrorData {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettingsData | ErrorData>,
) {
  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT")
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" })
  }

  const idToken = authHeader.split(" ")[1]
  let callerRole: string | undefined
  let callerTenantId: string | undefined
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    callerRole = (decoded.role as string) ?? undefined
    callerTenantId = (decoded.tenantId as string) ?? undefined
    const isAdmin =
      decoded.admin === true ||
      callerRole === "tenant_admin" ||
      callerRole === "super_admin"
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" })
    }
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  // ── Resolve tenantId from hostname (same logic as admin-list) ────────────
  let effectiveTenantId: string = callerTenantId ?? "www"
  try {
    const host = (req.headers.host ?? "").split(":")[0]
    const subdomain = host.includes(".") ? host.split(".")[0] : ""
    const tenantConfig = await lookupTenant(subdomain)
    if (tenantConfig?.tenantId) effectiveTenantId = tenantConfig.tenantId
  } catch {
    // fall through — use callerTenantId or "www"
  }

  // ── Enforce tenant_admin can only access their own tenant ────────────────
  if (callerRole === "tenant_admin" && callerTenantId !== effectiveTenantId) {
    return res.status(403).json({ error: "Access denied for this tenant" })
  }

  const tenantRef = adminDb.collection("tenants").doc(effectiveTenantId)

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const snap = await tenantRef.get()
      if (!snap.exists) {
        return res.status(404).json({ error: "Tenant not found" })
      }
      const data = snap.data() as Omit<Tenant, "createdAt" | "updatedAt"> & {
        createdAt: { toDate?: () => Date } | Date
        updatedAt: { toDate?: () => Date } | Date
      }
      const tenant: Tenant = {
        tenantId: data.tenantId,
        name: data.name,
        wixSiteId: data.wixSiteId,
        domain: data.domain,
        status: data.status,
        branding: data.branding,
        createdAt:
          typeof (data.createdAt as { toDate?: () => Date }).toDate === "function"
            ? (data.createdAt as { toDate: () => Date }).toDate()
            : (data.createdAt as Date),
        updatedAt:
          typeof (data.updatedAt as { toDate?: () => Date }).toDate === "function"
            ? (data.updatedAt as { toDate: () => Date }).toDate()
            : (data.updatedAt as Date),
      }
      return res.status(200).json({ tenant })
    } catch (err) {
      console.error("[tenant-settings GET]", err)
      return res.status(500).json({ error: "Failed to fetch tenant settings" })
    }
  }

  // ── PUT ──────────────────────────────────────────────────────────────────
  const body = req.body as Record<string, unknown>

  // Strip any restricted fields from the incoming payload
  const safeUpdate: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (!RESTRICTED_FIELDS.has(key)) {
      safeUpdate[key] = value
    }
  }

  // Validate branding sub-object if present
  if ("branding" in safeUpdate) {
    const branding = safeUpdate.branding as Partial<TenantBranding>
    const allowedBrandingKeys: Array<keyof TenantBranding> = [
      "logo",
      "primaryColor",
      "accentColor",
      "tagline",
      "supportEmail",
      "phone",
    ]
    const filteredBranding: Partial<TenantBranding> = {}
    for (const k of allowedBrandingKeys) {
      if (k in branding) {
        filteredBranding[k] = branding[k] as string
      }
    }
    safeUpdate.branding = filteredBranding
  }

  if (Object.keys(safeUpdate).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" })
  }

  safeUpdate.updatedAt = FieldValue.serverTimestamp()

  try {
    await tenantRef.update(safeUpdate)
    const updated = await tenantRef.get()
    const data = updated.data() as Omit<Tenant, "createdAt" | "updatedAt"> & {
      createdAt: { toDate?: () => Date } | Date
      updatedAt: { toDate?: () => Date } | Date
    }
    const tenant: Tenant = {
      tenantId: data.tenantId,
      name: data.name,
      wixSiteId: data.wixSiteId,
      domain: data.domain,
      status: data.status,
      branding: data.branding,
      createdAt:
        typeof (data.createdAt as { toDate?: () => Date }).toDate === "function"
          ? (data.createdAt as { toDate: () => Date }).toDate()
          : (data.createdAt as Date),
      updatedAt:
        typeof (data.updatedAt as { toDate?: () => Date }).toDate === "function"
          ? (data.updatedAt as { toDate: () => Date }).toDate()
          : (data.updatedAt as Date),
    }
    // ── Sync name change to Vercel Edge Config ────────────────────────────
    // Edge Config drives the x-tenant-name header injected by proxy.ts on every
    // request. Without this sync, the subtitle and other consumers of
    // useTenant().tenantName will show the stale name until a manual redeploy.
    // Failure here is non-fatal — Firestore is source of truth.
    if (typeof safeUpdate.name === "string") {
      try {
        // tenantId IS the subdomain (e.g. "lljwent")
        await upsertTenantEdgeConfig(effectiveTenantId, {
          tenantId: tenant.tenantId,
          siteId: tenant.wixSiteId,
          name: tenant.name,
        })
      } catch (ecErr) {
        console.warn("[tenant-settings PUT] Edge Config sync failed (non-fatal):", ecErr)
      }
    }

    return res.status(200).json({ tenant })
  } catch (err) {
    console.error("[tenant-settings PUT]", err)
    return res.status(500).json({ error: "Failed to update tenant settings" })
  }
}

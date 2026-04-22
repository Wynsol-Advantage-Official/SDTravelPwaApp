import { NextResponse, type NextRequest } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { upsertTenantEdgeConfig } from "@/lib/api/vercel"

// ---------------------------------------------------------------------------
// /api/admin/tenants/[tenantId] — Single tenant operations (super_admin)
// ---------------------------------------------------------------------------
// PATCH  — update fields (wixSiteId, name, status)
// DELETE — delete tenant doc
// ---------------------------------------------------------------------------

// Use Node.js runtime because this route imports `firebase-admin` (server-only)
export const runtime = 'nodejs'

async function requireSuperAdmin(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) throw new AuthError("Unauthorized", 401)

  try {
    const decoded = await adminAuth.verifyIdToken(session)
    if (decoded.role !== "super_admin") {
      throw new AuthError("Forbidden — requires super_admin", 403)
    }
    return decoded
  } catch (err) {
    if (err instanceof AuthError) throw err
    throw new AuthError("Invalid session", 401)
  }
}

class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

interface RouteContext {
  params: Promise<{ tenantId: string }>
}

interface TenantBrandingInput {
  logo?: string
  primaryColor?: string
  accentColor?: string
  tagline?: string
  supportEmail?: string
  phone?: string
}

function sanitizeBrandingUpdate(branding?: TenantBrandingInput) {
  if (!branding || typeof branding !== "object") return null

  const entries = Object.entries(branding)
  if (entries.length === 0) return null

  const update: Record<string, unknown> = {}

  for (const [key, value] of entries) {
    if (typeof value !== "string") continue

    const trimmed = value.trim()
    update[`branding.${key}`] = trimmed ? trimmed : FieldValue.delete()
  }

  return Object.keys(update).length > 0 ? update : null
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/tenants/[tenantId]
// Body: { name?, wixSiteId?, status?, branding? }
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireSuperAdmin(request)
    const { tenantId } = await context.params

    const docRef = adminDb.collection("tenants").doc(tenantId)
    const doc = await docRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, wixSiteId, status, branding } = body as {
      name?: string
      wixSiteId?: string
      status?: string
      branding?: TenantBrandingInput
    }

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (typeof name === "string" && name.trim()) update.name = name.trim()
    if (typeof wixSiteId === "string") update.wixSiteId = wixSiteId.trim()
    if (status && ["active", "suspended", "provisioning"].includes(status)) {
      update.status = status
    }

    const brandingUpdate = sanitizeBrandingUpdate(branding)
    if (brandingUpdate) {
      Object.assign(update, brandingUpdate)
    }

    await docRef.update(update)

    const updated = await docRef.get()
    const d = updated.data()!

    if (typeof d.wixSiteId === "string" && d.wixSiteId.trim()) {
      try {
        await upsertTenantEdgeConfig(tenantId, {
          tenantId,
          siteId: d.wixSiteId,
          name: typeof d.name === "string" && d.name.trim() ? d.name.trim() : tenantId,
        })
      } catch (syncErr) {
        console.error(`[Admin Tenants PATCH] Edge Config sync failed for ${tenantId}:`, syncErr)
      }
    }

    return NextResponse.json({
      tenantId: updated.id,
      name: d.name,
      domain: d.domain,
      wixSiteId: d.wixSiteId ?? null,
      status: d.status,
      branding: d.branding ?? null,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[Admin Tenants PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/tenants/[tenantId]
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireSuperAdmin(request)
    const { tenantId } = await context.params

    // Prevent deleting "www"
    if (tenantId === "www") {
      return NextResponse.json(
        { error: "Cannot delete the primary tenant" },
        { status: 400 },
      )
    }

    const docRef = adminDb.collection("tenants").doc(tenantId)
    const doc = await docRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    await docRef.delete()
    return NextResponse.json({ ok: true, deleted: tenantId })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[Admin Tenants DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

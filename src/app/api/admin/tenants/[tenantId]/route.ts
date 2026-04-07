import { NextResponse, type NextRequest } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"

// ---------------------------------------------------------------------------
// /api/admin/tenants/[tenantId] — Single tenant operations (super_admin)
// ---------------------------------------------------------------------------
// PATCH  — update fields (wixSiteId, name, status)
// DELETE — delete tenant doc
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// PATCH /api/admin/tenants/[tenantId]
// Body: { name?, wixSiteId?, status? }
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
    const { name, wixSiteId, status } = body as {
      name?: string
      wixSiteId?: string
      status?: string
    }

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (typeof name === "string" && name.trim()) update.name = name.trim()
    if (typeof wixSiteId === "string") update.wixSiteId = wixSiteId.trim()
    if (status && ["active", "suspended", "provisioning"].includes(status)) {
      update.status = status
    }

    await docRef.update(update)

    const updated = await docRef.get()
    const d = updated.data()!

    return NextResponse.json({
      tenantId: updated.id,
      name: d.name,
      domain: d.domain,
      wixSiteId: d.wixSiteId ?? null,
      status: d.status,
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

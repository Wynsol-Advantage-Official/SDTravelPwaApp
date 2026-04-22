import { NextResponse, type NextRequest } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"

// ---------------------------------------------------------------------------
// /api/admin/tenants — Super-admin tenant management
// ---------------------------------------------------------------------------
// GET — list all tenants from Firestore
// All endpoints require super_admin role via session cookie.
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

// ---------------------------------------------------------------------------
// GET /api/admin/tenants
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request)

    const snap = await adminDb.collection("tenants").orderBy("name").get()

    const tenants = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        tenantId: doc.id,
        name: d.name ?? doc.id,
        domain: d.domain ?? `${doc.id}.sanddiamonds.travel`,
        wixSiteId: d.wixSiteId ?? null,
        status: d.status ?? "active",
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    })

    return NextResponse.json({ tenants })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[Admin Tenants GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

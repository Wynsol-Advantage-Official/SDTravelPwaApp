import { NextResponse, type NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import {
  provisionTenant,
  ProvisionError,
} from "@/lib/services/provisioning.service"

// ---------------------------------------------------------------------------
// POST /api/tenants/provision — Create a new tenant (SOW §7.1)
// ---------------------------------------------------------------------------
// Requires super_admin role. Creates Firestore tenant doc, sets admin claims,
// registers Vercel domain, and updates Edge Config.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // ── Auth: require super_admin ────────────────────────────────────────
    const session = request.cookies.get("session")?.value
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let claims: { uid: string; role?: string }
    try {
      const decoded = await adminAuth.verifyIdToken(session)
      claims = { uid: decoded.uid, role: decoded.role as string | undefined }
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    if (claims.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden — requires super_admin" }, { status: 403 })
    }

    // ── Parse body ──────────────────────────────────────────────────────
    const body = await request.json()
    const { subdomain, tenantName, wixSiteId, adminUid } = body as {
      subdomain?: string
      tenantName?: string
      wixSiteId?: string
      adminUid?: string
    }

    if (!subdomain || !tenantName || !wixSiteId || !adminUid) {
      return NextResponse.json(
        { error: "Missing required fields: subdomain, tenantName, wixSiteId, adminUid" },
        { status: 400 }
      )
    }

    // ── Provision ───────────────────────────────────────────────────────
    const result = await provisionTenant({
      subdomain,
      tenantName,
      wixSiteId,
      adminUid,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof ProvisionError) {
      const statusMap: Record<string, number> = {
        INVALID_SUBDOMAIN: 400,
        RESERVED_SUBDOMAIN: 400,
        SUBDOMAIN_TAKEN: 409,
        VERCEL_DOMAIN_FAILED: 502,
        EDGE_CONFIG_FAILED: 502,
        FIRESTORE_FAILED: 500,
        AUTH_CLAIMS_FAILED: 500,
      }
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: statusMap[err.code] ?? 500 }
      )
    }

    console.error("[Provision API] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

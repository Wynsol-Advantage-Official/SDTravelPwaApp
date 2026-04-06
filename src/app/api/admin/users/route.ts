import { NextResponse, type NextRequest } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"

// ---------------------------------------------------------------------------
// /api/admin/users — Super-admin user management
// ---------------------------------------------------------------------------
// GET  — list all Firebase Auth users (paginated)
// POST — create a new user
// All endpoints require super_admin role via session cookie.
// ---------------------------------------------------------------------------

/** Verify session cookie and enforce super_admin role. */
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
// GET /api/admin/users?pageToken=xxx&limit=100
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request)

    const { searchParams } = new URL(request.url)
    const pageToken = searchParams.get("pageToken") ?? undefined
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 1000)

    const result = await adminAuth.listUsers(limit, pageToken)

    // Fetch tenant names from Firestore (for display)
    const tenantIds = new Set<string>()
    for (const user of result.users) {
      const tid = user.customClaims?.tenantId as string | undefined
      if (tid) tenantIds.add(tid)
    }

    const tenantNames: Record<string, string> = {}
    if (tenantIds.size > 0) {
      const snaps = await Promise.all(
        [...tenantIds].map((tid) =>
          adminDb.collection("tenants").doc(tid).get(),
        ),
      )
      for (const snap of snaps) {
        if (snap.exists) {
          tenantNames[snap.id] = (snap.data()?.name as string) ?? snap.id
        }
      }
    }

    const users = result.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? null,
      displayName: u.displayName ?? null,
      photoURL: u.photoURL ?? null,
      disabled: u.disabled,
      emailVerified: u.emailVerified,
      providerIds: u.providerData.map((p) => p.providerId),
      createdAt: u.metadata.creationTime ?? null,
      lastSignIn: u.metadata.lastSignInTime ?? null,
      customClaims: u.customClaims ?? {},
      tenantName: tenantNames[(u.customClaims?.tenantId as string) ?? ""] ?? null,
    }))

    return NextResponse.json({
      users,
      pageToken: result.pageToken ?? null,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error("[Admin Users GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/users — Create a user
// Body: { email, password, displayName?, role?, tenantId? }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin(request)

    const body = await request.json()
    const { email, password, displayName, role, tenantId } = body as {
      email?: string
      password?: string
      displayName?: string
      role?: string
      tenantId?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, password" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      )
    }

    const validRoles = ["user", "tenant_admin", "super_admin"]
    const userRole = validRoles.includes(role ?? "") ? role! : "user"

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || undefined,
    })

    // Set custom claims
    const claims: Record<string, unknown> = { role: userRole }
    if (tenantId) claims.tenantId = tenantId
    if (userRole === "super_admin" || userRole === "tenant_admin") {
      claims.admin = true
    }
    await adminAuth.setCustomUserClaims(userRecord.uid, claims)

    return NextResponse.json(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        customClaims: claims,
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("email-already-exists")) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }
    console.error("[Admin Users POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

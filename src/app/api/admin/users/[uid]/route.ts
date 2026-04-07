import { NextResponse, type NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { isValidTenantSlug } from "@/lib/rules/tenant-rules"

// ---------------------------------------------------------------------------
// /api/admin/users/[uid] — Single user operations (super_admin only)
// ---------------------------------------------------------------------------
// GET    — get user details + claims
// PATCH  — update claims / disable / enable / displayName
// DELETE — delete user
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
  params: Promise<{ uid: string }>
}

// ---------------------------------------------------------------------------
// GET /api/admin/users/[uid]
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireSuperAdmin(request)
    const { uid } = await context.params

    const user = await adminAuth.getUser(uid)

    return NextResponse.json({
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      providerIds: user.providerData.map((p) => p.providerId),
      createdAt: user.metadata.creationTime ?? null,
      lastSignIn: user.metadata.lastSignInTime ?? null,
      customClaims: user.customClaims ?? {},
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("user-not-found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("[Admin Users GET uid]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/[uid]
// Body: { role?, tenantId?, disabled?, displayName? }
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const caller = await requireSuperAdmin(request)
    const { uid } = await context.params

    const body = await request.json()
    const { role, tenantId, disabled, displayName } = body as {
      role?: string
      tenantId?: string | null
      disabled?: boolean
      displayName?: string
    }

    // Prevent super_admin from removing their own super_admin role
    if (uid === caller.uid && role && role !== "super_admin") {
      return NextResponse.json(
        { error: "Cannot remove your own super_admin role" },
        { status: 400 },
      )
    }

    // ── Update profile fields ─────────────────────────────────────────
    const profileUpdate: Record<string, unknown> = {}
    if (typeof displayName === "string") profileUpdate.displayName = displayName
    if (typeof disabled === "boolean") profileUpdate.disabled = disabled
    if (Object.keys(profileUpdate).length > 0) {
      await adminAuth.updateUser(uid, profileUpdate)
    }

    // ── Update custom claims ──────────────────────────────────────────
    if (role !== undefined || tenantId !== undefined) {
      const existingUser = await adminAuth.getUser(uid)
      const existingClaims = existingUser.customClaims ?? {}

      const validRoles = ["user", "tenant_admin", "super_admin"]
      const newRole = validRoles.includes(role ?? "") ? role! : (existingClaims.role as string) ?? "user"
      const newTenantId = tenantId !== undefined ? tenantId : (existingClaims.tenantId as string | null) ?? null

      // Validate tenantId is a slug, not a UUID or siteId
      if (newTenantId && !isValidTenantSlug(newTenantId)) {
        return NextResponse.json(
          { error: "tenantId must be a valid subdomain slug (not a UUID or siteId)" },
          { status: 400 },
        )
      }

      const newClaims: Record<string, unknown> = {
        role: newRole,
      }
      if (newTenantId) newClaims.tenantId = newTenantId
      if (newRole === "super_admin" || newRole === "tenant_admin") {
        newClaims.admin = true
      }

      await adminAuth.setCustomUserClaims(uid, newClaims)
    }

    // Fetch updated user
    const updated = await adminAuth.getUser(uid)

    return NextResponse.json({
      uid: updated.uid,
      email: updated.email ?? null,
      displayName: updated.displayName ?? null,
      disabled: updated.disabled,
      customClaims: updated.customClaims ?? {},
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("user-not-found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("[Admin Users PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/users/[uid]
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const caller = await requireSuperAdmin(request)
    const { uid } = await context.params

    // Prevent self-deletion
    if (uid === caller.uid) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      )
    }

    await adminAuth.deleteUser(uid)

    return NextResponse.json({ ok: true, deleted: uid })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("user-not-found")) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("[Admin Users DELETE]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

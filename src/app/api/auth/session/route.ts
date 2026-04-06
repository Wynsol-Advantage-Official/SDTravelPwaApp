import { NextResponse, type NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"

// ---------------------------------------------------------------------------
// POST /api/auth/session — Set cross-subdomain session cookie (SOW §4.1)
// ---------------------------------------------------------------------------
// Called by the client after Firebase onAuthStateChanged fires with a valid
// user. The client sends the Firebase ID token; this endpoint verifies it
// and sets a httpOnly session cookie scoped to the parent domain so it is
// transmitted automatically to all subdomains.
// ---------------------------------------------------------------------------

const COOKIE_NAME = "session"
const SEVEN_DAYS = 60 * 60 * 24 * 7
const SESSION_COOKIE_DOMAIN =
  process.env.SESSION_COOKIE_DOMAIN ?? ".sanddiamonds.travel"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const idToken: string | undefined = body.idToken

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 })
    }

    // Verify the ID token with Firebase Admin — full cryptographic check
    const decoded = await adminAuth.verifyIdToken(idToken)

    const response = NextResponse.json({ status: "ok", uid: decoded.uid })

    // Set the session cookie on the parent domain (SOW §4.1)
    // In development (.localhost), omit the domain so the browser defaults
    // to the current host.
    const isLocalhost = request.headers.get("host")?.includes("localhost")

    response.cookies.set(COOKIE_NAME, idToken, {
      httpOnly: true,
      secure: !isLocalhost,
      sameSite: "lax",
      maxAge: SEVEN_DAYS,
      path: "/",
      ...(isLocalhost ? {} : { domain: SESSION_COOKIE_DOMAIN }),
    })

    return response
  } catch (err) {
    console.error("[Session API] Failed to verify ID token:", err)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/auth/session — Clear session cookie (logout)
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const isLocalhost = request.headers.get("host")?.includes("localhost")

  const response = NextResponse.json({ status: "ok" })

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    ...(isLocalhost ? {} : { domain: SESSION_COOKIE_DOMAIN }),
  })

  return response
}

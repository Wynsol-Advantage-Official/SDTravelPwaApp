import { NextResponse, type NextRequest } from "next/server"
import { lookupTenant, DEFAULT_TENANT } from "@/lib/edge-config"
import { decodeSessionCookie, type SessionPayload } from "@/lib/auth/session"
import { isValidTenantSlug } from "@/lib/rules/tenant-rules"

// ---------------------------------------------------------------------------
// Route classification (SOW §3.1.1)
// ---------------------------------------------------------------------------

const PROTECTED_PREFIXES = ["/booking", "/profile", "/chat", "/dashboard", "/my-bookings"]
const STATIC_PREFIXES = ["/_next", "/api", "/icons", "/logos", "/media", "/fonts", "/sw.js", "/workbox-", "/manifest.json", "/lost"]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}

function isStaticOrApi(pathname: string): boolean {
  return STATIC_PREFIXES.some((p) => pathname.startsWith(p))
}

// ---------------------------------------------------------------------------
// Subdomain extraction
// ---------------------------------------------------------------------------

const PRODUCTION_DOMAIN = "sanddiamonds.travel"

function extractSubdomain(hostname: string): string {
  // localhost development: tenant-a.localhost → "tenant-a"
  if (hostname.endsWith(".localhost") || hostname.includes(".localhost:")) {
    const sub = hostname.split(".localhost")[0]
    return sub === "localhost" ? "www" : sub
  }

  // Production: tenant-a.sanddiamonds.travel → "tenant-a"
  if (hostname.endsWith(`.${PRODUCTION_DOMAIN}`)) {
    const sub = hostname.replace(`.${PRODUCTION_DOMAIN}`, "")
    return sub || "www"
  }

  // Apex domain or www
  if (hostname === PRODUCTION_DOMAIN || hostname.startsWith("www.")) {
    return "www"
  }

  // Vercel preview deployments or unknown hosts — treat as www
  return "www"
}

// ---------------------------------------------------------------------------
// Middleware (SOW §3.1)
// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") ?? request.nextUrl.hostname

  // Skip static assets and API routes — they don't need tenant resolution
  if (isStaticOrApi(pathname)) {
    return NextResponse.next()
  }

  // ── 1. Resolve tenant from hostname ─────────────────────────────────────
  const subdomain = extractSubdomain(hostname)
  const tenant = await lookupTenant(subdomain)

  if (!tenant) {
    // Unknown subdomain — send the visitor to a friendly "you might be lost" page
    // on the main www portal rather than a bare root redirect.
    const url = request.nextUrl.clone()
    if (process.env.NODE_ENV === "development") {
      url.hostname = "localhost"
    } else {
      url.hostname = `www.${PRODUCTION_DOMAIN}`
      url.port = ""
    }
    url.pathname = "/lost"
    url.search = ""
    return NextResponse.redirect(url)
  }

  // ── 2. Auth gate for protected routes (SOW §3.1.1) ─────────────────────
  let session: SessionPayload | null = null
  const sessionCookie = request.cookies.get("session")?.value

  if (sessionCookie) {
    session = decodeSessionCookie(sessionCookie)
  }

  if (isProtectedRoute(pathname) && !session) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = "/auth/sign-in"
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // ── 3. Tenant Admin cross-domain enforcement (SOW §3.1.3) ──────────────
  if (session?.role === "tenant_admin" && session.tenantId) {
    // Guard: only redirect when tenantId is a valid slug. If it looks like a
    // UUID (corrupted claim data), skip the redirect to avoid constructing an
    // invalid hostname that would loop to /lost.
    if (!isValidTenantSlug(session.tenantId)) {
      console.warn(
        `[Proxy] session.tenantId "${session.tenantId}" is not a valid slug — skipping cross-domain redirect`,
      )
    } else if (tenant.tenantId !== "www" && tenant.tenantId !== session.tenantId) {
      // Redirect tenant admin back to their own subdomain
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.hostname = `${session.tenantId}.${PRODUCTION_DOMAIN}`
      redirectUrl.pathname = "/dashboard"
      redirectUrl.port = ""
      return NextResponse.redirect(redirectUrl)
    }
  }
  // Super Admins bypass this check entirely (SOW §3.1.3)

  // ── 4. Inject tenant headers for downstream consumption ──────────────
  // Set on REQUEST headers so server components can read them via headers().
  // Also set on RESPONSE headers so browser DevTools / curl can inspect them.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-tenant-id", tenant.tenantId)
  requestHeaders.set("x-wix-site-id", tenant.siteId)
  requestHeaders.set("x-tenant-name", tenant.name)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set("x-tenant-id", tenant.tenantId)
  response.headers.set("x-wix-site-id", tenant.siteId)
  response.headers.set("x-tenant-name", tenant.name)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
}

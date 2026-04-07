import { NextResponse, type NextRequest } from "next/server"
import { adminDb } from "@/lib/firebase/admin"

// ---------------------------------------------------------------------------
// POST /api/affiliates/apply — Submit affiliate application (SOW §7.2)
// ---------------------------------------------------------------------------
// Public endpoint. Writes to Firestore `affiliateApplications/` for
// super_admin review. Once approved, a super_admin calls POST
// /api/tenants/provision to create the tenant.
// ---------------------------------------------------------------------------

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, subdomain, contactName, email, phone, wixSiteId } =
      body as {
        businessName?: string
        subdomain?: string
        contactName?: string
        email?: string
        phone?: string
        wixSiteId?: string
      }

    // ── Validation ────────────────────────────────────────────────────
    if (!businessName || !subdomain || !contactName || !email || !wixSiteId) {
      return NextResponse.json(
        { error: "Missing required fields: businessName, subdomain, contactName, email, wixSiteId" },
        { status: 400 }
      )
    }

    const cleanSubdomain = subdomain.trim().toLowerCase()
    if (!SUBDOMAIN_REGEX.test(cleanSubdomain)) {
      return NextResponse.json(
        { error: "Invalid subdomain format" },
        { status: 400 }
      )
    }

    // Basic email format check
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // ── Check for existing tenant or pending application ──────────────
    const existingTenant = await adminDb
      .collection("tenants")
      .doc(cleanSubdomain)
      .get()

    if (existingTenant.exists) {
      return NextResponse.json(
        { error: "This subdomain is already taken" },
        { status: 409 }
      )
    }

    // ── Store application ─────────────────────────────────────────────
    await adminDb.collection("affiliateApplications").add({
      businessName: businessName.trim(),
      subdomain: cleanSubdomain,
      contactName: contactName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      wixSiteId: wixSiteId.trim(),
      status: "pending",
      createdAt: new Date(),
    })

    return NextResponse.json({ status: "ok" }, { status: 201 })
  } catch (err) {
    console.error("[Affiliate Apply] Error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

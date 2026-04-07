import type { NextApiRequest, NextApiResponse } from "next"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { wixClient } from "@/lib/wix/client"
import { getWixImageUrl } from "@/lib/wix/media"
import { getItineraryDayCount } from "@/lib/wix/tours"
import { lookupTenant } from "@/lib/edge-config"
import type { Firestore, Query, DocumentData } from "firebase-admin/firestore"

// Booking shape returned to the client (Timestamps serialised to ISO strings)
type SerializedBooking = Record<string, unknown> & { _id: string }

type Data = { bookings: SerializedBooking[] } | { error: string }

// ---------------------------------------------------------------------------
// Recursively convert Firestore Timestamps → ISO strings so the response
// is safely JSON-serialisable.
// ---------------------------------------------------------------------------
function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value

  // Firestore Timestamp (Admin SDK shape)
  if (
    typeof value === "object" &&
    "_seconds" in (value as object) &&
    "_nanoseconds" in (value as object)
  ) {
    const ts = value as { _seconds: number; _nanoseconds: number }
    return new Date(ts._seconds * 1000 + ts._nanoseconds / 1e6).toISOString()
  }

  // Firestore Timestamp via .toDate()
  if (typeof value === "object" && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  if (Array.isArray(value)) return value.map(serializeValue)

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serializeValue(v)]),
    )
  }

  return value
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ── Auth + admin claim check ────────────────────────────────────────────
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" })
  }

  const idToken = authHeader.split(" ")[1]
  let callerRole: string | undefined
  let callerTenantId: string | undefined
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (!decoded.admin) {
      return res.status(403).json({ error: "Admin access required" })
    }
    callerRole = (decoded.role as string) ?? undefined
    callerTenantId = (decoded.tenantId as string) ?? undefined
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }

  // ── Fetch bookings scoped by tenant ─────────────────────────────────────
  // Always scope to the current portal's tenantId — resolved from the request
  // hostname via Edge Config. This applies to ALL roles including super_admin.
  // super_admin on www sees www-tenant bookings; on solnica sees solnica bookings.
  let effectiveTenantId: string = callerTenantId ?? "www"
  try {
    const host = (req.headers.host ?? "").split(":")[0]
    const subdomain = host.includes(".") ? host.split(".")[0] : ""
    const tenantConfig = await lookupTenant(subdomain)
    if (tenantConfig?.tenantId) effectiveTenantId = tenantConfig.tenantId
  } catch {
    // fall through — use callerTenantId or "www"
  }

  try {
    const db: Firestore = adminDb
    let q: Query<DocumentData> = db.collection("bookings").orderBy("createdAt", "desc")

    // Always apply tenant filter — no role bypasses it
    q = q.where("tenantId", "==", effectiveTenantId)

    const snap = await q.get()

    const bookings: SerializedBooking[] = snap.docs.map((d) => ({
      _id: d.id,
      ...(serializeValue(d.data()) as Record<string, unknown>),
    }))

    // ── Enrich bookings with user profile data ────────────────────────────
    const uniqueUids = [...new Set(bookings.map((b) => b.uid as string).filter(Boolean))]

    // Batch-fetch user records from Firebase Auth (max 100 per call)
    const userMap = new Map<string, { displayName?: string; email?: string; photoURL?: string; phoneNumber?: string }>()

    for (let i = 0; i < uniqueUids.length; i += 100) {
      const batch = uniqueUids.slice(i, i + 100)
      const identifiers = batch.map((uid) => ({ uid }))
      try {
        const result = await adminAuth.getUsers(identifiers)
        for (const user of result.users) {
          userMap.set(user.uid, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
          })
        }
      } catch {
        // If batch user fetch fails, continue without enrichment
      }
    }

    // Also try Firestore user profiles for richer data (country, etc.)
    for (const uid of uniqueUids) {
      try {
        const profileDoc = await db.doc(`users/${uid}`).get()
        if (profileDoc.exists) {
          const profile = profileDoc.data() as Record<string, unknown>
          const existing = userMap.get(uid) ?? {}
          userMap.set(uid, {
            ...existing,
            displayName: (profile.displayName as string) ?? existing.displayName,
            email: (profile.email as string) ?? existing.email,
            photoURL: (profile.avatar as string) ?? existing.photoURL,
            phoneNumber: (profile.phone as string) ?? existing.phoneNumber,
          })
        }
      } catch {
        // Skip if profile fetch fails
      }
    }

    // Merge user data into bookings
    let enriched: SerializedBooking[] = bookings.map((b) => {
      const uid = b.uid as string
      const user = uid ? userMap.get(uid) : undefined
      return {
        ...b,
        userName: user?.displayName ?? undefined,
        userEmail: user?.email ?? undefined,
        userAvatar: user?.photoURL ?? undefined,
        userPhone: user?.phoneNumber ?? undefined,
      }
    })

    // ── Enrich with tour hero images from Wix (Stores → CMS fallback)
    try {
      const client = wixClient()
      const TOURS_COLLECTION = "Tours"

      if (client) {
        const uniqueTourIds = [...new Set(enriched.map((b) => (b.tourId as string) || (b.tourSlug as string)).filter(Boolean))]

        const tourImageMap = new Map<string, string>()

        await Promise.all(uniqueTourIds.map(async (id) => {
          try {
            // Try Stores product first (may be a product id)
            try {
              // @ts-ignore — product shape varies, defensive access
              const { product } = await client.products.getProduct(id)
              if (product) {
                // Attempt common image fields
                const p = product as any
                const candidate =
                  p?.media?.uri ||
                  p?.image?.uri ||
                  p?.imageData?.url ||
                  (p?.gallery?.[0]?.uri || p?.gallery?.[0]?.url) ||
                  undefined

                if (candidate) {
                  tourImageMap.set(id, getWixImageUrl(String(candidate), { width: 1400, quality: 80 }))
                  return
                }
              }
            } catch (storeErr) {
              // continue to CMS fallback
            }

            // CMS fallback: try items collection (match by _id or slug)
            try {
              const byId = await client.items.query(TOURS_COLLECTION).eq("_id", id).find()
              const item = byId.items?.[0] as Record<string, any> | undefined
              const found = item
                ?? (await client.items.query(TOURS_COLLECTION).eq("slug", id).find()).items?.[0]

              if (found) {
                const candidate = found.heroImage || found.coverImage || found.image || (found.gallery && found.gallery[0]) || undefined
                if (candidate) {
                  // candidate may be an object or a wix:image:// string
                  const src = typeof candidate === "string" ? candidate : (candidate.src || candidate.url || candidate.uri)
                  if (src) {
                    tourImageMap.set(id, getWixImageUrl(String(src), { width: 1400, quality: 80 }))
                    return
                  }
                }
              }
            } catch (cmsErr) {
              // ignore per-item errors
            }
          } catch (err) {
            // per-id error should not abort entire enrichment
            console.warn("[Admin] Tour image enrichment failed for", id, err)
          }
        }))

        // Attach images to enriched bookings when available
        enriched = enriched.map((b) => {
          const id = (b.tourId as string) || (b.tourSlug as string) || undefined
          const resolved = b.tourHeroImage ?? (id ? tourImageMap.get(id) : undefined)
          return {
            ...b,
            tourHeroImage: resolved ?? undefined,
          }
        })
      }
    } catch (imgErr) {
      console.warn("[Admin] Failed to enrich bookings with tour images:", imgErr)
    }

    // ── Enrich with itinerary day counts from Wix CMS ─────────────────
    try {
      const uniqueTourIdsForCount = [...new Set(
        enriched.map((b) => b.tourId as string).filter(Boolean)
      )]
      const countMap = new Map<string, number>()
      await Promise.all(
        uniqueTourIdsForCount.map(async (id) => {
          const count = await getItineraryDayCount(id)
          countMap.set(id, count)
        })
      )
      enriched = enriched.map((b) => {
        const id = b.tourId as string | undefined
        return {
          ...b,
          itineraryDayCount: id ? countMap.get(id) ?? 0 : 0,
        }
      })
    } catch (countErr) {
      console.warn("[Admin] Failed to enrich itinerary day counts:", countErr)
    }

    return res.status(200).json({ bookings: enriched })
  } catch (err) {
    console.error("[Admin] Failed to fetch bookings:", err)
    return res.status(500).json({ error: "Failed to fetch bookings" })
  }
}

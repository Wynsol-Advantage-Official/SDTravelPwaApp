import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { wixClient } from "@/lib/wix/client";
import { getWixImageUrl } from "@/lib/wix/media";
import { FieldValue } from "firebase-admin/firestore";
import { lookupTenant } from "@/lib/edge-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DataSource = "STORES" | "CMS";

interface TourData {
  title: string;
  price: number;
  currency: string;
  dataSource: DataSource;
  /** The canonical CMS _id of the parent Tour record (resolved from _id or slug) */
  resolvedId: string;
}

type SuccessResponse = {
  id: string;
  data: Record<string, unknown>;
  isCheckoutEnabled: boolean;
  dataSource: DataSource;
};

type ErrorResponse = { error: string; details?: Record<string, unknown> };

type Data = SuccessResponse | ErrorResponse;

// ---------------------------------------------------------------------------
// CMS collection name — must match the Wix CMS Dashboard
// ---------------------------------------------------------------------------
const TOURS_COLLECTION = "Tours";

// ---------------------------------------------------------------------------
// Polymorphic fetcher: Stores → CMS fallback
// ---------------------------------------------------------------------------

async function fetchTourData(
  client: NonNullable<ReturnType<typeof wixClient>>,
  tourId: string,
): Promise<TourData | null> {
  // ── Attempt 1: Wix Stores (products) ──────────────────────────────────
  try {
    const { product } = await client.products.getProduct(tourId);

    if (product) {
      const price = Number(
        product.priceData?.price ?? product.price?.price ?? 0,
      );
      return {
        title: product.name ?? "Untitled Product",
        price,
        currency: product.priceData?.currency ?? "USD",
        dataSource: "STORES",
        resolvedId: tourId,
      };
    }
  } catch (storesErr: unknown) {
    // Log but don't bail — fall through to CMS
    const msg = storesErr instanceof Error ? storesErr.message : String(storesErr);
    console.warn("[Booking] Stores lookup failed, falling back to CMS:", msg);
  }

  // ── Attempt 2: Wix CMS "Tours" collection ─────────────────────────────
  try {
    // Try direct getById first (tourId might be a CMS _id)
    const cmsItem = await client.items
      .query(TOURS_COLLECTION)
      .eq("_id", tourId)
      .find();

    const item = cmsItem.items?.[0] as Record<string, unknown> | undefined;

    if (item) {
      return {
        title: (item.title as string) ?? "Untitled Tour",
        price: Number(item.startingPrice ?? 0),
        currency: (item.currency as string) ?? "USD",
        dataSource: "CMS",
        resolvedId: (item._id as string) ?? tourId,
      };
    }

    // Also try matching by slug (frontend might send slug instead of _id)
    const bySlug = await client.items
      .query(TOURS_COLLECTION)
      .eq("slug", tourId)
      .find();

    const slugItem = bySlug.items?.[0] as Record<string, unknown> | undefined;

    if (slugItem) {
      return {
        title: (slugItem.title as string) ?? "Untitled Tour",
        price: Number(slugItem.startingPrice ?? 0),
        currency: (slugItem.currency as string) ?? "USD",
        dataSource: "CMS",
        resolvedId: (slugItem._id as string) ?? tourId,
      };
    }
  } catch (cmsErr: unknown) {
    const msg = cmsErr instanceof Error ? cmsErr.message : String(cmsErr);
    console.error("[Booking] CMS lookup also failed:", msg);
  }

  // Not found in either source
  return null;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  // ── Method guard ────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Auth verification ───────────────────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const idToken = authHeader.split(" ")[1];
  let uid: string;
  let callerTenantId: string | undefined;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
    callerTenantId = (decoded.tenantId as string) ?? undefined;
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Resolve tenantId from request hostname — more reliable than JWT claims
  // because regular users (non-admins) may not have tenantId in custom claims.
  // e.g. solnica.localhost:3000 → "solnica"; localhost:3000 → "www"
  let resolvedTenantId: string = callerTenantId ?? "www";
  try {
    const host = (req.headers.host ?? "").split(":")[0];
    const subdomain = host.includes(".") ? host.split(".")[0] : "";
    const tenantConfig = await lookupTenant(subdomain);
    if (tenantConfig?.tenantId) resolvedTenantId = tenantConfig.tenantId;
  } catch {
    // fall through — use callerTenantId or "www"
  }

  // ── Body validation ─────────────────────────────────────────────────────
  const { tourId, userPrice, tourDate, guests, pickupDetails, wixSiteId } = req.body as {
    tourId?: string;
    userPrice?: number | string;
    tourDate?: string;
    guests?: number;
    pickupDetails?: import("@/types/booking").PickupDetails;
    wixSiteId?: string;
  };

  if (!tourId || typeof userPrice === "undefined") {
    return res.status(400).json({ error: "Missing tourId or userPrice in body" });
  }

  const numericGuests = guests !== undefined ? Math.max(1, Math.floor(Number(guests))) : 1;
  if (!Number.isFinite(numericGuests)) {
    return res.status(400).json({ error: "Invalid guests value" });
  }

  // Parse userPrice robustly: allow formatted strings like "$1,499.00"
  const parsePriceInput = (v: number | string | undefined): number => {
    if (typeof v === "number") return v;
    if (typeof v !== "string") return NaN;
    const cleaned = v.replace(/[^0-9.-]+/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const numericUserPrice = parsePriceInput(userPrice as number | string | undefined);
  if (!Number.isFinite(numericUserPrice)) {
    return res.status(400).json({ error: "Invalid userPrice — must be a finite number" });
  }

  // ── Wix client ──────────────────────────────────────────────────────────
  const resolvedSiteId = typeof wixSiteId === "string" && wixSiteId.trim() ? wixSiteId.trim() : undefined;
  const client = wixClient(resolvedSiteId);
  if (!client) {
    return res.status(500).json({ error: "Wix client not configured on server" });
  }

  // ── Polymorphic fetch: Stores → CMS ─────────────────────────────────────
  const tourData = await fetchTourData(client, tourId);

  if (!tourData) {
    return res.status(404).json({ error: "Tour not found in Wix Stores or CMS" });
  }

  // ── Price verification ──────────────────────────────────────────────────
  // Enforce strict match: frontend sends a total price (guests * unitPrice).
  // Verify the submitted total equals the canonical unit price * number of guests.
  const unitPrice = Number(tourData.price ?? 0)

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return res.status(500).json({ error: "Invalid canonical price for tour" })
  }

  // Work in integer cents to avoid floating point issues and be tolerant
  const unitCents = Math.round(unitPrice * 100)
  const expectedCents = unitCents * numericGuests
  const submittedCentsRaw = Math.round(numericUserPrice * 100)

  // If frontend accidentally sent the unit price instead of the total,
  // convert it to a total by multiplying by guests.
  const submittedCents = submittedCentsRaw === unitCents ? unitCents * numericGuests : submittedCentsRaw

  const expectedTotal = expectedCents / 100
  const submittedTotal = submittedCents / 100

  if (submittedCents !== expectedCents) {
    const msg = `Price mismatch — expected total ${tourData.currency} ${expectedTotal} (unit ${tourData.currency} ${unitPrice} × ${numericGuests} guests), submitted ${tourData.currency} ${submittedTotal}`;
    const details = {
      unitPrice,
      numericGuests,
      numericUserPrice,
      unitCents,
      expectedCents,
      submittedCentsRaw,
      submittedCents,
    };
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Booking] Price mismatch details:", details);
      return res.status(409).json({ error: msg, details });
    }
    return res.status(409).json({ error: msg });
  }

  // ── Firestore write ─────────────────────────────────────────────────────
  try {
    const userRecord = await adminAuth.getUser(uid).catch(() => null);
    // Resolve tour hero image (try Stores product first, then CMS item)
    let tourHeroImage: string | undefined = undefined
    try {
      // Try product image
      try {
        // @ts-ignore
        const { product } = await client.products.getProduct(tourId)
        if (product) {
          const p = product as any
          const candidate =
            p?.media?.uri ||
            p?.image?.uri ||
            p?.imageData?.url ||
            (p?.gallery?.[0]?.uri || p?.gallery?.[0]?.url) ||
            undefined

          if (candidate) {
            tourHeroImage = getWixImageUrl(String(candidate), { width: 1400, quality: 80 })
          }
        }
      } catch (e) {
        // ignore and fall through to CMS
      }

      if (!tourHeroImage) {
        const byId = await client.items.query(TOURS_COLLECTION).eq("_id", tourId).find()
        const item = byId.items?.[0] as Record<string, any> | undefined
        const found = item ?? (await client.items.query(TOURS_COLLECTION).eq("slug", tourId).find()).items?.[0]
        if (found) {
          const candidate = found.heroImage || found.coverImage || found.image || (found.gallery && found.gallery[0]) || undefined
          const src = typeof candidate === "string" ? candidate : (candidate?.src || candidate?.url || candidate?.uri)
          if (src) tourHeroImage = getWixImageUrl(String(src), { width: 1400, quality: 80 })
        }
      }
    } catch (imgErr) {
      console.warn("[Booking] Failed to resolve tour hero image:", imgErr)
    }

    // Firestore rejects `undefined` — coerce every optional field to `null`.
    const sanitizePickup = (pd: typeof pickupDetails): Record<string, unknown> | null => {
      if (!pd) return null
      return Object.fromEntries(
        Object.entries(pd).map(([k, v]) => [k, v === undefined ? null : v]),
      )
    }

    const booking = {
      uid,
      tenantId: resolvedTenantId,
      tourId: tourData.resolvedId,
      tourSlug: tourData.resolvedId !== tourId ? tourId : null,
      tourTitle: tourData.title,
      dataSource: tourData.dataSource,
      status: tourData.dataSource === "STORES" ? "pending" : "hold",
      totalPrice: expectedTotal,
      userSubmittedPrice: numericUserPrice,
      currency: tourData.currency,
      tourDate: tourDate ?? null,
      guests: numericGuests,
      tourHeroImage: tourHeroImage ?? null,
      isCheckoutEnabled: tourData.dataSource === "STORES",
      pickupDetails: sanitizePickup(pickupDetails),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("bookings").add(booking);
    const snap = await docRef.get();
    const data = snap.data() ?? {};

    // ── WhatsApp / Twilio notification ──────────────────────────────────
    try {
      const whatsappUrl = process.env.WHATSAPP_API_URL ?? process.env.TWILIO_WHATSAPP_URL;
      if (whatsappUrl) {
        const travelerName = userRecord?.displayName ?? uid;
        const source = tourData.dataSource === "CMS" ? "Concierge Hold" : "Checkout";
        const message = [
          `🔔 New ${source} booking from ${travelerName}`,
          `Tour: ${tourData.title}`,
          `Guests: ${numericGuests}`,
          `Unit price: ${tourData.currency} ${unitPrice}`,
          `Total: ${tourData.currency} ${expectedTotal}`,
          `Date: ${tourDate ?? "TBD"}`,
          `Source: ${tourData.dataSource}`,
        ].join("\n");

        await fetch(whatsappUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: process.env.ADMIN_WHATSAPP_NUMBER, message }),
        });
      }
    } catch (notifyErr) {
      console.error("[Booking] WhatsApp notify failed:", notifyErr);
    }

    return res.status(201).json({
      id: docRef.id,
      data,
      isCheckoutEnabled: tourData.dataSource === "STORES",
      dataSource: tourData.dataSource,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error("[Booking] Firestore write failed:", errMsg, err)
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ error: "Failed to create booking", details: { message: errMsg } })
    }
    return res.status(500).json({ error: "Failed to create booking" })
  }
}

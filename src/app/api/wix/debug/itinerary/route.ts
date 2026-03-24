import { NextResponse } from "next/server";
import { wixClient } from "@/lib/wix/client";

const ITINERARY_COLLECTION = "ItineraryDays";

type RawItem = Record<string, unknown>;

export async function GET(req: Request) {
  const allowDebug = process.env.WIX_DEBUG_API === "true" || process.env.NODE_ENV !== "production";
  if (!allowDebug) {
    return NextResponse.json({ ok: false, error: "Debug API disabled" }, { status: 403 });
  }

  const url = new URL(req.url);
  const tourId = url.searchParams.get("tourId");
  if (!tourId) {
    return NextResponse.json({ ok: false, error: "Missing tourId parameter" }, { status: 400 });
  }

  const client = wixClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: "Wix client not initialized" }, { status: 500 });
  }

  try {
    let strategy = "eq(tour, tourId)";

    // Canonical query: the `tour` field stores the parent Tour _id
    let result = await client.items
      .query(ITINERARY_COLLECTION)
      .eq("tour", tourId)
      .ascending("dayNumber")
      .find();

    // Migration fallback: legacy TourReferenceID field
    if (!result.items || result.items.length === 0) {
      strategy = "eq(TourReferenceID, tourId) [legacy]";
      try {
        result = await client.items
          .query(ITINERARY_COLLECTION)
          .eq("TourReferenceID", tourId)
          .ascending("dayNumber")
          .find();
      } catch (err) {
        console.warn("[debug/itinerary] TourReferenceID query failed:", err);
      }
    }

    const items: RawItem[] = (result.items ?? []) as RawItem[];

    // For each day, call queryReferenced to surface the destinations multi-ref field
    const itemsWithDestinations = await Promise.all(
      items.map(async (item) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ref = await (client.items as any).queryReferenced(
            ITINERARY_COLLECTION,
            item._id as string,
            "destinations",
          );
          return { ...item, _destinations_resolved: ref.items ?? [] };
        } catch (e) {
          return { ...item, _destinations_resolved: [], _destinations_error: String(e) };
        }
      })
    );

    return NextResponse.json(
      { ok: true, tourId, strategy, count: items.length, items: itemsWithDestinations },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/wix/debug/itinerary error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

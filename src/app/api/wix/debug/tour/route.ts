import { NextResponse } from "next/server";
import { getTourBySlug, getTours } from "@/lib/wix/tours";

export async function GET(req: Request) {
  const allowDebug =
    process.env.WIX_DEBUG_API === "true" || process.env.NODE_ENV !== "production";
  if (!allowDebug) {
    return NextResponse.json({ ok: false, error: "Debug API disabled" }, { status: 403 });
  }

  const url = new URL(req.url);
  let slug = url.searchParams.get("slug") || undefined;

  try {
    if (!slug) {
      const tours = await getTours({ activeOnly: true });
      if (!tours || tours.length === 0) {
        return NextResponse.json({ ok: false, error: "No published tours available" }, { status: 404 });
      }
      slug = tours[0].slug;
    }

    const result = await getTourBySlug(slug as string);
    if (!result) {
      return NextResponse.json({ ok: false, error: `No tour found for slug=${slug}` }, { status: 404 });
    }

    // Return full mapped tour + itinerary so we can inspect dayNumber fields
    return NextResponse.json({ ok: true, slug, data: result }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

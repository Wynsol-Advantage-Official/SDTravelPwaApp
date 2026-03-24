import { NextResponse } from "next/server";
import { getTourBySlug } from "@/lib/wix/tours";

export async function GET(req: Request) {
  const allowDebug = process.env.WIX_DEBUG_API === "true" || process.env.NODE_ENV !== "production";
  if (!allowDebug) {
    return NextResponse.json({ ok: false, error: "Debug API disabled" }, { status: 403 });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug parameter" }, { status: 400 });
  }

  try {
    const result = await getTourBySlug(slug);
    if (!result) return NextResponse.json({ ok: false, error: "Tour not found or unpublished" }, { status: 404 });
    const { tour, itinerary, destination, accommodations } = result;
    return NextResponse.json(
      {
        ok: true,
        slug,
        tour,
        itinerary: { count: itinerary.length, items: itinerary },
        destination,
        accommodations: { count: accommodations.length, items: accommodations },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/wix/debug/details error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

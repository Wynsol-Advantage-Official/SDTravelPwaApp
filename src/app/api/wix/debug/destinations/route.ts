import { NextResponse } from "next/server";
import { wixClient } from "@/lib/wix/client";

const COLLECTION_CANDIDATES = [
  "Destinations",
  "destinations",
  "Destinations1",
  "destinations1",
  "Destinations_1",
  "SDDestinations",
  "CMS/Destinations",
];

export async function GET() {
  const allowDebug =
    process.env.WIX_DEBUG_API === "true" ||
    process.env.NODE_ENV !== "production";
  if (!allowDebug) {
    return NextResponse.json(
      { ok: false, error: "Debug API disabled" },
      { status: 403 },
    );
  }

  const client = wixClient();
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "Wix client not initialised — check WIX_CLIENT_ID" },
      { status: 500 },
    );
  }

  const results: Record<string, unknown> = {};

  for (const name of COLLECTION_CANDIDATES) {
    try {
      const res = await client.items.query(name).limit(3).find();
      results[name] = {
        ok: true,
        totalCount: res.totalCount,
        items: res.items,
      };
    } catch (err) {
      results[name] = { ok: false, error: String(err) };
    }
  }

  return NextResponse.json({ results }, { status: 200 });
}

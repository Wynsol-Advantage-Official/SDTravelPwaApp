import { NextResponse } from "next/server";
import { wixClient } from "@/lib/wix/client";

const TOURS_COLLECTION = "Tours";

export async function GET(req: Request) {
  const allowDebug = process.env.WIX_DEBUG_API === "true" || process.env.NODE_ENV !== "production";
  if (!allowDebug) {
    return NextResponse.json({ ok: false, error: "Debug API disabled" }, { status: 403 });
  }

  // Report presence of critical server-only env vars so deployments can be diagnosed
  const envStatus = {
    WIX_CLIENT_ID: Boolean(process.env.NEXT_PUBLIC_WIX_CLIENT_ID),
    WIX_CLIENT_SECRET: Boolean(process.env.NEXT_PUBLIC_WIX_CLIENT_SECRET),
    WIX_SITE_ID: Boolean(process.env.NEXT_PUBLIC_WIX_SITE_ID),
    WIX_DEBUG_API: process.env.WIX_DEBUG_API ?? null,
  };

  const client = wixClient();
  const wixInitialized = !!client;
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "Wix client not initialized", wixInitialized, envStatus },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const params = url.searchParams;
  const status = params.get("status"); // 'published' or 'all'
  const featured = params.get("featured");
  const slug = params.get("slug");
  const limit = params.get("limit");

  try {
    let query = client.items.query(TOURS_COLLECTION);

    if (slug) {
      query = query.eq("slug", slug);
    }

    if (!slug) {
      if (status && status !== "all") query = query.eq("status", status);
    }

    if (featured === "true") query = query.eq("featured", true);

    if (limit) {
      const l = parseInt(limit, 10);
      if (!Number.isNaN(l)) query = query.limit(l);
    }

    const result = await query.find();

    return NextResponse.json(
      {
        ok: true,
        query: { status: status ?? null, featured: featured ?? null, slug: slug ?? null, limit: limit ?? null },
        envStatus,
        wixInitialized,
        result,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("/api/wix/debug error:", err);
    return NextResponse.json({ ok: false, error: String(err), envStatus, wixInitialized: Boolean(wixClient()) }, { status: 500 });
  }
}

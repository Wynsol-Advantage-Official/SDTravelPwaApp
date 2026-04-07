import { NextResponse } from "next/server";
import { getRoomById } from "@/lib/wix/tours";

export async function GET(req: Request) {
  const allowDebug = process.env.WIX_DEBUG_API === "true" || process.env.NODE_ENV !== "production";
  if (!allowDebug) {
    return NextResponse.json({ ok: false, error: "Debug API disabled" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const acc = await getRoomById(id);
    if (!acc) return NextResponse.json({ ok: false, error: "Room not found" }, { status: 404 });
    return NextResponse.json({ ok: true, room: acc }, { status: 200 });
  } catch (err) {
    console.error("/api/wix/debug/rooms error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

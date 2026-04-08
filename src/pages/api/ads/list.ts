import type { NextApiRequest, NextApiResponse } from "next";
import { getActiveAds } from "@/lib/services/ads.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ads = await getActiveAds(5);
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ items: ads });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/ads/list failed:", msg);
    res.status(500).json({ error: "failed to fetch ads" });
  }
}

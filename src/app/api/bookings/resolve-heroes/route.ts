import { NextResponse } from "next/server"
import { wixClient } from "@/lib/wix/client"
import { getWixImageUrl } from "@/lib/wix/media"

type Body = { tourIds: string[] }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const ids = Array.isArray(body.tourIds) ? [...new Set(body.tourIds.filter(Boolean))] : []

    if (ids.length === 0) return NextResponse.json({})

    const client = wixClient()
    if (!client) return NextResponse.json({}, { status: 500 })

    const map: Record<string, string | null> = {}

    await Promise.all(ids.map(async (id) => {
      try {
        // Try product image first
        try {
          // @ts-ignore
          const { product } = await client.products.getProduct(id)
          if (product) {
            const p: any = product
            const candidate = p?.media?.uri || p?.image?.uri || p?.imageData?.url || p?.gallery?.[0]?.uri || p?.gallery?.[0]?.url
            if (candidate) {
              map[id] = getWixImageUrl(String(candidate), { width: 1200, quality: 80 })
              return
            }
          }
        } catch {
          // fall through to CMS
        }

        // Try CMS item by _id then slug
        const byId = await client.items.query("Tours").eq("_id", id).find()
        const item = byId.items?.[0] as any | undefined
        const found = item ?? (await client.items.query("Tours").eq("slug", id).find()).items?.[0]
        if (found) {
          const candidate = found.heroImage || found.coverImage || found.image || (found.gallery && found.gallery[0])
          const src = typeof candidate === "string" ? candidate : (candidate?.src || candidate?.url || candidate?.uri)
          if (src) {
            map[id] = getWixImageUrl(String(src), { width: 1200, quality: 80 })
            return
          }
        }

        map[id] = null
      } catch (e) {
        map[id] = null
      }
    }))

    return NextResponse.json(map)
  } catch (err) {
    return NextResponse.json({}, { status: 500 })
  }
}

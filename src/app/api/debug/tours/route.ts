import { NextResponse } from 'next/server'
import { wixClient } from '@/lib/wix/client'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const siteId = url.searchParams.get('siteId') ?? undefined
  const full = url.searchParams.get('full') === 'true'

  const client = wixClient(siteId ?? undefined)
  if (!client) {
    return NextResponse.json({ error: 'Wix client not available (check API key)' }, { status: 500 })
  }

  try {
    const res = await client.items.query('Tours').find()
    const raw = res.items ?? []
    const items = full ? raw : raw.map((it: any) => ({ _id: it._id, title: it.title ?? '', slug: it.slug ?? '' }))
    return NextResponse.json({ count: items.length, items })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}

import React from "react"
import { wixClient } from "@/lib/wix/client"

export const revalidate = 0

export default async function WixHealthPage() {
  // server-only checks
  const envStatus = {
    WIX_CLIENT_ID: Boolean(process.env.WIX_CLIENT_ID),
    WIX_CLIENT_SECRET: Boolean(process.env.WIX_CLIENT_SECRET),
    WIX_SITE_ID: Boolean(process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID),
  }

  const client = wixClient()
  const clientInitialized = !!client

  const collections = ["Tours", "Destinations1", "Accommodations", "ItineraryDays"]

  const results: Record<string, { ok: boolean; totalCount?: number; error?: string }> = {}

  if (clientInitialized) {
    for (const name of collections) {
      try {
        // limit to 1 for speed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (client.items as any).query(name).limit(1).find()
        results[name] = { ok: true, totalCount: res.totalCount ?? (res.items?.length ?? 0) }
      } catch (err: unknown) {
        results[name] = { ok: false, error: String(err) }
      }
    }
  } else {
    for (const name of collections) results[name] = { ok: false, error: "Wix client not initialised" }
  }

  return (
    <main className="min-h-dvh bg-diamond p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">Wix Health Check</h1>

        <div className="mb-6 rounded-md border border-sand/20 bg-white p-4">
          <p className="text-sm text-charcoal/70">This page checks the server-side Wix Headless client and collection access. It does not expose secrets.</p>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-sand/20 bg-white p-4">
            <h3 className="font-semibold text-charcoal">Wix Client</h3>
            <p className="mt-2 text-sm text-charcoal/70">Initialized: <strong className="ml-2">{clientInitialized ? 'Yes' : 'No'}</strong></p>
          </div>

          <div className="rounded-md border border-sand/20 bg-white p-4">
            <h3 className="font-semibold text-charcoal">Env Vars</h3>
            <ul className="mt-2 text-sm text-charcoal/70 space-y-1">
              <li>WIX_CLIENT_ID: <strong className="ml-2">{envStatus.WIX_CLIENT_ID ? 'present' : 'missing'}</strong></li>
              <li>WIX_CLIENT_SECRET: <strong className="ml-2">{envStatus.WIX_CLIENT_SECRET ? 'present' : 'missing'}</strong></li>
              <li>WIX_SITE_ID: <strong className="ml-2">{envStatus.WIX_SITE_ID ? 'present' : 'missing'}</strong></li>
            </ul>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-charcoal mb-3">Collection Access</h2>
          <div className="grid gap-3">
            {Object.entries(results).map(([name, r]) => (
              <div key={name} className="rounded-md border border-sand/20 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-charcoal">{name}</p>
                    <p className="text-sm text-charcoal/70">{r.ok ? `Accessible (${r.totalCount ?? 0} items)` : `Error: ${r.error}`}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <a href="/api/wix/debug/destinations" className="link link-primary">Run debug endpoint for more details</a>
        </section>
      </div>
    </main>
  )
}

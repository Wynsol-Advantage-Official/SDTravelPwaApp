import { NextResponse } from "next/server"
import { wixAdminClient } from "@/lib/wix/client"

// ---------------------------------------------------------------------------
// GET /api/wix/debug/site-id — Discover the actual Wix metasite ID
// ---------------------------------------------------------------------------

export async function GET() {
  const apiKey = process.env.WIX_API_KEY
  const accountId = process.env.WIX_ACCOUNT_ID
  const currentSiteId = process.env.WIX_SITE_ID
  const currentClientId = process.env.WIX_CLIENT_ID

  if (!apiKey || !accountId) {
    return NextResponse.json({ error: "WIX_API_KEY or WIX_ACCOUNT_ID not set" }, { status: 500 })
  }

  // Try to list sites via the Wix REST API (site-list)
  const siteListResults: unknown[] = []
  let siteListError: string | null = null

  try {
    const r = await fetch("https://www.wixapis.com/site-list/v2/sites", {
      headers: {
        Authorization: apiKey,
        "wix-account-id": accountId,
        Accept: "application/json",
      },
    })
    if (r.ok) {
      const d = await r.json() as { sites?: Record<string, unknown>[] }
      siteListResults.push(...(d.sites ?? []))
    } else {
      const txt = await r.text()
      siteListError = `HTTP ${r.status}: ${txt.slice(0, 200)}`
    }
  } catch (err) {
    siteListError = String(err)
  }

  // Try to query contacts as a sanity check on the admin client
  let adminClientWorking = false
  let adminClientError: string | null = null
  try {
    const client = wixAdminClient()
    if (client) {
      // queryContacts with a very low limit — just checks auth works
      await client.contacts.listContacts({ paging: { limit: 1 } } as Record<string, unknown>)
      adminClientWorking = true
    }
  } catch (err) {
    adminClientError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json({
    diagnosis: {
      WIX_CLIENT_ID: currentClientId,
      WIX_SITE_ID: currentSiteId,
      note: currentSiteId === currentClientId
        ? "⚠️  WIX_SITE_ID equals WIX_CLIENT_ID — these are DIFFERENT things. Set WIX_META_SITE_ID to your actual Wix site's metasite ID."
        : "WIX_SITE_ID looks distinct from WIX_CLIENT_ID.",
    },
    sites: siteListResults.map((s) => {
      const site = s as Record<string, unknown>
      return { id: site.id, displayName: site.displayName, url: site.url }
    }),
    siteListError,
    adminClient: { working: adminClientWorking, error: adminClientError },
    howToFix: [
      "1. Go to Wix Business Manager → your site → Settings",
      "2. Look for 'Site ID' or check the URL: manage.wix.com/premium-purchase-plan/dynamo?metaSiteId=XXXXX",
      "3. Add WIX_META_SITE_ID=<that GUID> to .env.local and restart the server",
      "4. The admin client will then use the correct site for Inbox conversations",
    ],
  })
}

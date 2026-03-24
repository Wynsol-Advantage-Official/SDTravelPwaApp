#!/usr/bin/env node
import { createClient, OAuthStrategy } from '@wix/sdk'
import { items } from '@wix/data'

async function main() {
  const clientId = process.env.WIX_CLIENT_ID
  const clientSecret = process.env.WIX_CLIENT_SECRET
  const siteId = process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID

  if (!clientId || !clientSecret) {
    console.error('Missing WIX_CLIENT_ID or WIX_CLIENT_SECRET in environment')
    process.exit(2)
  }

  const client = createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId, clientSecret, siteId }),
  })

  const collection = 'Destinations1'
  console.log(`Checking collection access for \"${collection}\"...`)

  try {
    const res = await client.items.query(collection).limit(1).find()
    console.log('Success: received response from Wix:')
    console.log(' totalCount:', res.totalCount)
    console.log(' items returned:', (res.items || []).length)
    if (res.items && res.items.length > 0) {
      console.log(' sample item id:', res.items[0]._id)
    }
  } catch (err) {
    console.error('Wix query failed:')
    console.error(err)
    process.exit(3)
  }
}

main()

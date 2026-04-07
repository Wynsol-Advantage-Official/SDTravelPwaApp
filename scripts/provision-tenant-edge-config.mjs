#!/usr/bin/env node
/**
 * scripts/provision-tenant-edge-config.mjs
 *
 * Upserts a tenant entry into Vercel Edge Config so the middleware can
 * resolve the subdomain without redirecting.
 *
 * Usage:
 *   node scripts/provision-tenant-edge-config.mjs <tenantId> <siteId> [name]
 *
 * Example:
 *   node scripts/provision-tenant-edge-config.mjs solnica f9134a28-xxxx "Solnica Travel"
 *
 * Required env vars (from .env.local):
 *   EDGE_CONFIG_STORE_ID  — ecfg_…
 *   VERCEL_TOKEN          — vcp_… or Bearer token
 *   VERCEL_TEAM_ID        — team_… (optional)
 */

import { readFileSync } from "fs"
import { resolve } from "path"

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------
try {
  const envPath = resolve(process.cwd(), ".env.local")
  const lines = readFileSync(envPath, "utf8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!(key in process.env)) process.env[key] = val
  }
} catch {
  // .env.local not found — rely on environment variables already set
}

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------
const [,, tenantId, siteId, ...nameParts] = process.argv
const name = nameParts.join(" ") || tenantId

if (!tenantId || !siteId) {
  console.error("Usage: node scripts/provision-tenant-edge-config.mjs <tenantId> <siteId> [name]")
  process.exit(1)
}

const storeId = process.env.EDGE_CONFIG_STORE_ID
const token   = process.env.VERCEL_TOKEN
const teamId  = process.env.VERCEL_TEAM_ID

if (!storeId || !token) {
  console.error("Missing EDGE_CONFIG_STORE_ID or VERCEL_TOKEN in .env.local")
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Upsert the tenant key into Edge Config
// ---------------------------------------------------------------------------
const teamQuery = teamId ? `?teamId=${teamId}` : ""
const url = `https://api.vercel.com/v1/edge-config/${storeId}/items${teamQuery}`

const payload = {
  items: [
    {
      operation: "upsert",
      key: tenantId,
      value: { tenantId, siteId, name },
    },
  ],
}

console.log(`\nProvisioning tenant to Edge Config…`)
console.log(`  Store : ${storeId}`)
console.log(`  Key   : ${tenantId}`)
console.log(`  Value : ${JSON.stringify({ tenantId, siteId, name })}`)

const res = await fetch(url, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})

const body = await res.json()

if (!res.ok) {
  console.error(`\n✗ Edge Config API error (${res.status}):`, JSON.stringify(body, null, 2))
  process.exit(1)
}

console.log(`\n✓ Tenant "${tenantId}" provisioned successfully.`)
console.log(`  ${tenantId}.sanddiamonds.travel will now resolve to the correct tenant.`)
console.log(`\nNext: restart the dev server if running locally.\n`)

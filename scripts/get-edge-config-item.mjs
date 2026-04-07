#!/usr/bin/env node
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local into process.env (non-destructive)
try {
  const envPath = resolve(process.cwd(), '.env.local')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^['\"]|['\"]$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
} catch (err) {
  // ignore
}

const [,, key] = process.argv
if (!key) {
  console.error('Usage: node scripts/get-edge-config-item.mjs <key>')
  process.exit(1)
}

const storeId = process.env.EDGE_CONFIG_STORE_ID
const token = process.env.VERCEL_TOKEN
const teamId = process.env.VERCEL_TEAM_ID

if (!storeId || !token) {
  console.error('Missing EDGE_CONFIG_STORE_ID or VERCEL_TOKEN in .env.local')
  process.exit(2)
}

const teamQuery = teamId ? `?teamId=${teamId}` : ''
const url = `https://api.vercel.com/v1/edge-config/${storeId}/items${teamQuery}`

;(async () => {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      const body = await res.text()
      console.error(`Edge Config list failed (${res.status}): ${body}`)
      process.exit(3)
    }
    const body = await res.json()
    const items = Array.isArray(body) ? body : body.items || []
    const found = items.find((it) => it.key === key || it.key === `tenant:${key}`)
    console.log(JSON.stringify({ found, count: items.length }, null, 2))
  } catch (err) {
    console.error('Fetch error', err instanceof Error ? err.message : String(err))
    process.exit(4)
  }
})()

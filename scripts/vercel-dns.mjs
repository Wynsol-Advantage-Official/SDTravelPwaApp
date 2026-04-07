#!/usr/bin/env node
/**
 * scripts/vercel-dns.mjs
 *
 * List, add, or delete DNS records on a Vercel-managed domain via the Vercel API.
 *
 * Usage:
 *   node scripts/vercel-dns.mjs list   <domain>
 *   node scripts/vercel-dns.mjs add    <domain> <type> <name> <value> [ttl]
 *   node scripts/vercel-dns.mjs delete <domain> <recordId>
 *
 * Examples:
 *   node scripts/vercel-dns.mjs list sanddiamonds.travel
 *   node scripts/vercel-dns.mjs add sanddiamonds.travel TXT auth "firebase-verify=abc123"
 *   node scripts/vercel-dns.mjs add sanddiamonds.travel CNAME auth sdtravel-firebase-app.web.app
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!(k in process.env)) process.env[k] = v
  }
} catch (e) {}

// DNS management requires a personal token (tok_…) with DNS scope.
// Set VERCEL_PERSONAL_TOKEN in .env.local — falls back to VERCEL_TOKEN.
const TOKEN  = process.env.VERCEL_PERSONAL_TOKEN || process.env.VERCEL_TOKEN
const TEAM   = process.env.VERCEL_TEAM_ID

if (!TOKEN) {
  console.error('Missing VERCEL_PERSONAL_TOKEN (or VERCEL_TOKEN) in .env.local')
  process.exit(1)
}

const teamQuery = TEAM ? `?teamId=${TEAM}` : ''

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
}

const [,, cmd, domain, ...rest] = process.argv

if (!cmd || !domain) {
  console.error('Usage: node scripts/vercel-dns.mjs <list|add|delete> <domain> [args…]')
  process.exit(1)
}

async function listRecords(domain) {
  const res = await fetch(`https://api.vercel.com/v4/domains/${domain}/records${teamQuery}`, { headers: headers() })
  const body = await res.json()
  if (!res.ok) { console.error('API error:', body); process.exit(2) }
  const records = body.records ?? []
  if (!records.length) { console.log('No records found.'); return }
  console.log(`\nDNS records for ${domain} (${records.length}):\n`)
  for (const r of records) {
    console.log(`  [${r.id}] ${r.type.padEnd(6)} ${String(r.name || '@').padEnd(30)} → ${r.value}  (ttl: ${r.ttl ?? 'auto'})`)
  }
  console.log()
}

async function addRecord(domain, type, name, value, ttl) {
  const payload = { type, name, value, ttl: ttl ? Number(ttl) : 3600 }
  console.log(`\nAdding ${type} record: ${name} → ${value}`)
  const res = await fetch(`https://api.vercel.com/v4/domains/${domain}/records${teamQuery}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  if (!res.ok) { console.error('API error:', JSON.stringify(body, null, 2)); process.exit(2) }
  console.log(`✓ Record created: [${body.uid}] ${type} ${name} → ${value}\n`)
}

async function deleteRecord(domain, recordId) {
  console.log(`\nDeleting record ${recordId} from ${domain}`)
  const res = await fetch(`https://api.vercel.com/v4/domains/${domain}/records/${recordId}${teamQuery}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) { const b = await res.text(); console.error('API error:', b); process.exit(2) }
  console.log(`✓ Record ${recordId} deleted.\n`)
}

;(async () => {
  switch (cmd) {
    case 'list':
      await listRecords(domain)
      break
    case 'add': {
      const [type, name, value, ttl] = rest
      if (!type || !name || !value) {
        console.error('Usage: add <domain> <TYPE> <name> <value> [ttl]')
        process.exit(1)
      }
      await addRecord(domain, type.toUpperCase(), name, value, ttl)
      break
    }
    case 'delete': {
      const [recordId] = rest
      if (!recordId) { console.error('Usage: delete <domain> <recordId>'); process.exit(1) }
      await deleteRecord(domain, recordId)
      break
    }
    default:
      console.error(`Unknown command: ${cmd}. Use list | add | delete`)
      process.exit(1)
  }
})().catch(e => { console.error(e.message); process.exit(3) })

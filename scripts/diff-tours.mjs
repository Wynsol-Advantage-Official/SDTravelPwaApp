#!/usr/bin/env node
import fetch from 'node-fetch'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// load .env.local (non-destructive)
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  env.split('\n').forEach((line) => {
    const t = line.trim(); if (!t || t.startsWith('#')) return
    const i = t.indexOf('='); if (i === -1) return
    const k = t.slice(0,i).trim(); const v = t.slice(i+1).trim().replace(/^['"]|['"]$/g,'')
    if (!(k in process.env)) process.env[k]=v
  })
} catch(e) {}

const args = process.argv.slice(2)
const solnicaSite = args[0] || ''
const mainSite = args[1] || (process.env.WIX_META_SITE_ID || process.env.WIX_SITE_ID || '')

if (!solnicaSite || !mainSite) {
  console.error('Usage: node scripts/diff-tours.mjs <solnicaSiteId> <mainSiteId>')
  process.exit(1)
}

async function fetchFull(siteId) {
  const url = `http://localhost:3000/api/debug/tours?siteId=${encodeURIComponent(siteId)}&full=true`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  return j.items || []
}

function byId(arr) {
  const m = new Map()
  for (const it of arr) m.set(it._id || it.id || it.slug || JSON.stringify(it), it)
  return m
}

function diffObjects(a, b) {
  const keys = new Set([...Object.keys(a||{}), ...Object.keys(b||{})])
  const diffs = []
  for (const k of keys) {
    const va = a?.[k]
    const vb = b?.[k]
    const sa = JSON.stringify(va === undefined ? null : va)
    const sb = JSON.stringify(vb === undefined ? null : vb)
    if (sa !== sb) diffs.push({ key: k, a: va, b: vb })
  }
  return diffs
}

;(async ()=>{
  console.log('Fetching full Tours for', solnicaSite)
  const s = await fetchFull(solnicaSite)
  console.log('Count:', s.length)

  console.log('Fetching full Tours for', mainSite)
  const m = await fetchFull(mainSite)
  console.log('Count:', m.length)

  const sMap = byId(s)
  const mMap = byId(m)

  const allIds = new Set([...sMap.keys(), ...mMap.keys()])

  let anyDiff = false
  for (const id of allIds) {
    const a = sMap.get(id)
    const b = mMap.get(id)
    if (!a) {
      anyDiff = true
      console.log(`+ Present in main only: ${id}`)
      continue
    }
    if (!b) {
      anyDiff = true
      console.log(`- Present in solnica only: ${id}`)
      continue
    }

    const diffs = diffObjects(a, b)
    if (diffs.length) {
      anyDiff = true
      console.log(`\nDIFF for id ${id}:`)
      for (const d of diffs) {
        console.log(`  * ${d.key}: solnica=${JSON.stringify(d.a)} main=${JSON.stringify(d.b)}`)
      }
    }
  }

  if (!anyDiff) {
    console.log('\nNo differences found across fetched Tour objects (exact match).')
    process.exit(1)
  }
  process.exit(0)
})().catch((err)=>{ console.error('Error:', err.message || err); process.exit(2) })

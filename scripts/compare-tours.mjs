import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local to get default site id
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  env.split('\n').forEach((line) => {
    const t = line.trim(); if (!t || t.startsWith('#')) return;
    const i = t.indexOf('='); if (i === -1) return;
    const k = t.slice(0,i).trim(); const v = t.slice(i+1).trim().replace(/^['"]|['"]$/g,'');
    if (!(k in process.env)) process.env[k]=v;
  })
} catch(e) {}

const defaultSite = process.env.WIX_META_SITE_ID || process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID || ''
if (!defaultSite) console.warn('Default WIX site id not set in .env.local')

const args = process.argv.slice(2)
const solnicaSite = args[0] || 'f9134a28-01c2-46a5-94e3-ed354974e4b8' // fallback used in conversation
const mainSite = args[1] || defaultSite

async function fetchTours(siteId) {
  const url = `http://localhost:3000/api/debug/tours?siteId=${encodeURIComponent(siteId)}`
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    return j.items || []
  } catch (e) {
    console.error('Failed to fetch from local API:', e.message)
    console.error('Make sure the dev server is running (npm run dev).')
    process.exit(2)
  }
}

;(async ()=>{
  console.log('Fetching tours for solnica site:', solnicaSite)
  const solnica = await fetchTours(solnicaSite)
  console.log('Count:', solnica.length)

  console.log('Fetching tours for main site:', mainSite)
  const main = await fetchTours(mainSite)
  console.log('Count:', main.length)

  // Simple deep sort + stringify compare on _id+slug+title
  const normalize = (arr) => arr.map(i=>({id:i._id,slug:i.slug,title:i.title})).sort((a,b)=>a.id.localeCompare(b.id))
  const sNorm = normalize(solnica)
  const mNorm = normalize(main)

  const equal = JSON.stringify(sNorm) === JSON.stringify(mNorm)
  if (equal) {
    console.error('TEST FAILURE: Tours match exactly between solnica and main site')
    process.exit(1)
  } else {
    console.log('OK: Tours differ between solnica and main site')
    process.exit(0)
  }
})()

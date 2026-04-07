#!/usr/bin/env node
import dotenv from 'dotenv'
// load .env.local explicitly so local dev variables are picked up
dotenv.config({ path: '.env.local' })
import fetch from 'node-fetch'
import admin from 'firebase-admin'
import fs from 'fs'

const [,, subdomain, wixSiteId, tenantName='Demo Tenant'] = process.argv
if (!subdomain || !wixSiteId) {
  console.error('Usage: node scripts/provision-tenant.mjs <subdomain> <wixSiteId> [tenantName]')
  process.exit(1)
}

// Init Firebase Admin
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY
const projectId = process.env.FIREBASE_PROJECT_ID

// Debug raw env info (masked)
if (process.env.FIREBASE_PRIVATE_KEY) {
  console.log('raw FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY.length)
  console.log('raw FIREBASE_PRIVATE_KEY contains literal \\n sequence?', process.env.FIREBASE_PRIVATE_KEY.includes('\\n'))
}

if (!clientEmail || !privateKey || !projectId) {
  console.error('Missing Firebase admin credentials in environment (.env.local).')
  process.exit(1)
}

// Private key in .env may contain escaped newlines; fix them
// Sanitize private key: remove surrounding quotes, normalize escaped/newline sequences
privateKey = privateKey.trim()
if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
  privateKey = privateKey.slice(1, -1)
}
privateKey = privateKey.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n')
privateKey = privateKey.replace(/\r/g, '\n')

// Basic validation (do not print the key itself)
console.log('FIREBASE_PRIVATE_KEY contains BEGIN marker?', privateKey.includes('BEGIN PRIVATE KEY'))
console.log('FIREBASE_PRIVATE_KEY contains END marker?', privateKey.includes('END PRIVATE KEY'))
console.log('FIREBASE_PRIVATE_KEY length (chars):', privateKey.length)

if (!admin.apps || admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } catch (e) {
    console.error('Failed to initialize Firebase admin SDK:', e.message || e)
    process.exit(2)
  }
}

const db = admin.firestore()

async function upsertTenantDoc() {
  const id = subdomain
  const docRef = db.collection('tenants').doc(id)
  const now = new Date().toISOString()
  const data = {
    tenantId: id,
    siteId: wixSiteId,
    name: tenantName,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
  await docRef.set(data, { merge: true })
  console.log(`Firestore: tenant doc written: tenants/${id}`)
}

async function upsertEdgeConfig() {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_TOKEN_LOCAL
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT
  if (!token || !projectId) {
    // allow operation if EDGE_CONFIG_STORE_ID is set even when projectId is missing
    if (!process.env.EDGE_CONFIG_STORE_ID) {
      console.warn('Vercel token or project id missing in env; skipping Edge Config upsert.')
      return
    }
  }
  // If EDGE_CONFIG_STORE_ID is provided, use it directly; otherwise try to find by project
  const edgeIdFromEnv = process.env.EDGE_CONFIG_STORE_ID
  let edgeId = edgeIdFromEnv

  if (!edgeId) {
    const listRes = await fetch(`https://api.vercel.com/v1/edge-config?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const stores = await listRes.json()
    if (!Array.isArray(stores) || stores.length === 0) {
      console.warn('No Edge Config stores found for project; skipping.')
      return
    }
    const store = stores.find((s) => s.name === 'sd-travel-tenants') || stores[0]
    edgeId = store.uid || store.id
    if (!edgeId) {
      console.warn('Could not determine Edge Config id; skipping.')
      return
    }
  }

  const payload = {
    items: [
      {
        operation: 'upsert',
        key: subdomain,
        value: {
          tenantId: subdomain,
          siteId: wixSiteId,
          name: tenantName,
        },
      },
    ],
  }

  const patchRes = await fetch(`https://api.vercel.com/v1/edge-config/${edgeId}/items`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const patchJson = await patchRes.json()
  if (!patchRes.ok) {
    console.warn('Edge Config upsert returned non-OK:', patchJson)
  } else {
    console.log(`Edge Config: upserted key='${subdomain}' in store ${edgeId}`)
  }
}

(async function main(){
  try {
    await upsertTenantDoc()
    await upsertEdgeConfig()
    console.log('Provisioning complete.')
    process.exit(0)
  } catch (err) {
    console.error('Provisioning failed:', err)
    process.exit(2)
  }
})()

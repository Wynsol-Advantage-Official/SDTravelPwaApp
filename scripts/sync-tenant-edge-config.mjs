#!/usr/bin/env node
/**
 * Sync one tenant record from Firestore into Vercel Edge Config.
 *
 * Usage:
 *   node scripts/sync-tenant-edge-config.mjs <tenantId> [nameOverride]
 *
 * Example:
 *   node scripts/sync-tenant-edge-config.mjs kowayne
 *   node scripts/sync-tenant-edge-config.mjs kowayne "Kowayne Travel"
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { readFileSync } from "fs"
import { resolve } from "path"

function loadEnvLocal() {
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
    // ignore
  }
}

function requireEnv(key) {
  const val = process.env[key]
  if (!val) throw new Error(`Missing ${key}`)
  return val
}

async function patchEdgeConfig(item) {
  const storeId = requireEnv("EDGE_CONFIG_STORE_ID")
  const token = requireEnv("VERCEL_TOKEN")
  const teamId = process.env.VERCEL_TEAM_ID
  const teamQuery = teamId ? `?teamId=${teamId}` : ""

  const res = await fetch(`https://api.vercel.com/v1/edge-config/${storeId}/items${teamQuery}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items: [item] }),
  })

  const body = await res.text()
  if (!res.ok) {
    throw new Error(`Edge Config patch failed (${res.status}): ${body}`)
  }
}

async function main() {
  loadEnvLocal()

  const [, , tenantIdRaw, nameOverrideRaw] = process.argv
  const tenantId = (tenantIdRaw || "").trim().toLowerCase()
  if (!tenantId) {
    console.error("Usage: node scripts/sync-tenant-edge-config.mjs <tenantId> [nameOverride]")
    process.exit(1)
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: requireEnv("FIREBASE_PROJECT_ID"),
        clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    })
  }

  const db = getFirestore()
  const snap = await db.collection("tenants").doc(tenantId).get()
  if (!snap.exists) {
    throw new Error(`Tenant not found: ${tenantId}`)
  }

  const data = snap.data() || {}
  const siteId = typeof data.wixSiteId === "string" ? data.wixSiteId.trim() : ""
  if (!siteId) {
    throw new Error(`Tenant ${tenantId} has empty wixSiteId`)
  }

  const name = (nameOverrideRaw || (typeof data.name === "string" ? data.name : tenantId)).trim()

  const value = {
    tenantId,
    siteId,
    name: name || tenantId,
  }

  await patchEdgeConfig({
    operation: "upsert",
    key: tenantId,
    value,
  })

  console.log(JSON.stringify({ updated: true, key: tenantId, value }, null, 2))
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})

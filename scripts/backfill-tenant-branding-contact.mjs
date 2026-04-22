#!/usr/bin/env node
/**
 * Backfill tenant branding contact fields.
 *
 * Sets default values when missing/blank:
 * - branding.phone        -> "+1 876 276-7352"
 * - branding.supportEmail -> "support@sanddiamondstravel.com"
 *
 * Usage:
 *   node scripts/backfill-tenant-branding-contact.mjs
 *   node scripts/backfill-tenant-branding-contact.mjs --dry-run
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { config } from "dotenv"

config({ path: ".env.local" })

const DRY_RUN = process.argv.includes("--dry-run")
const DEFAULT_PHONE = "+1 876 276-7352"
const DEFAULT_SUPPORT_EMAIL = "support@sanddiamondstravel.com"

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

function isBlank(value) {
  return typeof value !== "string" || value.trim().length === 0
}

async function main() {
  console.log(`\nTenant branding backfill${DRY_RUN ? " (DRY RUN)" : ""}`)

  const snap = await db.collection("tenants").get()
  let updated = 0
  let skipped = 0

  for (const doc of snap.docs) {
    const data = doc.data() || {}
    const branding = data.branding || {}

    const phoneMissing = isBlank(branding.phone)
    const supportMissing = isBlank(branding.supportEmail)

    if (!phoneMissing && !supportMissing) {
      skipped += 1
      continue
    }

    const patch = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (phoneMissing) patch["branding.phone"] = DEFAULT_PHONE
    if (supportMissing) patch["branding.supportEmail"] = DEFAULT_SUPPORT_EMAIL

    if (DRY_RUN) {
      console.log(`[DRY RUN] ${doc.id}`, {
        phone: phoneMissing ? DEFAULT_PHONE : branding.phone,
        supportEmail: supportMissing ? DEFAULT_SUPPORT_EMAIL : branding.supportEmail,
      })
    } else {
      await doc.ref.update(patch)
      console.log(`Updated ${doc.id}`)
    }

    updated += 1
  }

  console.log(`\nDone. ${updated} tenant(s) updated, ${skipped} already complete.\n`)
}

main().catch((err) => {
  console.error("Backfill failed:", err)
  process.exit(1)
})

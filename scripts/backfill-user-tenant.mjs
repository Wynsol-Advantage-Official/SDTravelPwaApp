/**
 * Backfill tenantId for a user's bookings that were saved with tenantId: "www".
 * Regular users don't have tenantId in JWT custom claims, so their bookings
 * may be persisted under "www" instead of the correct tenant slug.
 *
 * Usage:
 *   node scripts/backfill-user-tenant.mjs                              # uses defaults below
 *   node scripts/backfill-user-tenant.mjs <email> <targetTenant>
 *
 * Examples:
 *   node scripts/backfill-user-tenant.mjs
 *   node scripts/backfill-user-tenant.mjs ksmylzcreations@gmail.com solnica
 *   node scripts/backfill-user-tenant.mjs user@example.com mytenantslug
 */

import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  resolve(
    __dirname,
    "../.dev_only/sdtravel-wynsoladv-669c18b237bc.json",
  )

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"))
initializeApp({ credential: cert(serviceAccount) })

const authAdmin = getAuth()
const db = getFirestore()

// ---------------------------------------------------------------------------
// Defaults — override via CLI args or pass directly to main()
// ---------------------------------------------------------------------------
const DEFAULT_EMAIL = "ksmylzcreations@gmail.com"
const DEFAULT_TARGET_TENANT = "solnica"

async function main(email = DEFAULT_EMAIL, targetTenant = DEFAULT_TARGET_TENANT) {
  console.log(`Backfilling bookings for ${email} → tenantId: "${targetTenant}"`)

  let user
  try {
    user = await authAdmin.getUserByEmail(email)
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log(`User ${email} not found in Firebase Auth — nothing to backfill.`)
      return
    }
    throw err
  }
  console.log(`Found user: ${user.uid} (${user.email})`)

  const snap = await db
    .collection("bookings")
    .where("uid", "==", user.uid)
    .where("tenantId", "==", "www")
    .get()

  if (snap.empty) {
    console.log(`No bookings with tenantId='www' found for ${email}.`)
    return
  }

  for (const doc of snap.docs) {
    const data = doc.data()
    await doc.ref.update({ tenantId: targetTenant })
    console.log(`Updated ${doc.id}: "${data.tourTitle}" www → ${targetTenant}`)
  }

  console.log(`\nDone: ${snap.size} booking(s) updated.`)
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
const [, , argEmail, argTenant] = process.argv

main(argEmail || DEFAULT_EMAIL, argTenant || DEFAULT_TARGET_TENANT).catch((err) => {
  console.error(err)
  process.exit(1)
})

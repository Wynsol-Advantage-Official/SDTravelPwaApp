/**
 * Backfill tenantId for ksmylzcreations@gmail.com bookings on solnica.
 * Their bookings were saved with tenantId: "www" because regular users
 * don't have tenantId in JWT custom claims.
 *
 * Usage:
 *   node scripts/backfill-ksmylz-tenant.mjs
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
    "./sdtravel-wynsoladv-firebase-adminsdk-fbsvc-43bc5f07a5.json",
  )

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"))
initializeApp({ credential: cert(serviceAccount) })

const authAdmin = getAuth()
const db = getFirestore()

// ---------------------------------------------------------------------------
// Config — adjust EMAIL and TARGET_TENANT as needed
// ---------------------------------------------------------------------------
const EMAIL = "ksmylzcreations@gmail.com"
const TARGET_TENANT = "solnica"

async function main() {
  let user
  try {
    user = await authAdmin.getUserByEmail(EMAIL)
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`User ${EMAIL} not found in Firebase Auth — nothing to backfill.`)
      return
    }
    throw err
  }
  console.log(`Found user: ${user.uid} (${user.email})`)

  const snap = await db.collection("bookings")
    .where("uid", "==", user.uid)
    .where("tenantId", "==", "www")
    .get()

  if (snap.empty) {
    console.log("No bookings with tenantId='www' found for this user.")
    return
  }

  for (const doc of snap.docs) {
    const data = doc.data()
    await doc.ref.update({ tenantId: TARGET_TENANT })
    console.log(`Updated ${doc.id}: "${data.tourTitle}" www → ${TARGET_TENANT}`)
  }

  console.log(`\nDone: ${snap.size} booking(s) updated.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

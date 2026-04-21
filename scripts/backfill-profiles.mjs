/**
 * Backfill Firestore profiles for all Firebase Auth users that don't yet have
 * a `users/{uid}/profile/main` document.
 *
 * Usage:
 *   node scripts/backfill-profiles.mjs
 *
 * Prerequisites:
 *   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path,
 *   or update SERVICE_ACCOUNT_PATH below.
 */

import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// Service account — same pattern as grant-admin.mjs
// ---------------------------------------------------------------------------
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
// Main
// ---------------------------------------------------------------------------
async function backfillProfiles() {
  let created = 0
  let skipped = 0
  let nextPageToken

  console.log("Scanning Firebase Auth users…\n")

  do {
    const listResult = await authAdmin.listUsers(1000, nextPageToken)

    for (const userRecord of listResult.users) {
      const profileRef = db.doc(`users/${userRecord.uid}/profile/main`)
      const snap = await profileRef.get()

      if (snap.exists) {
        skipped++
        continue
      }

      // Build profile from Auth record
      const profile = {
        displayName:
          userRecord.displayName || userRecord.email || userRecord.uid,
        email: userRecord.email || "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (userRecord.phoneNumber) {
        profile.phone = userRecord.phoneNumber
      }
      if (userRecord.photoURL) {
        profile.avatar = userRecord.photoURL
      }

      await profileRef.set(profile)
      created++
      console.log(
        `  ✓ Created profile for ${userRecord.email || userRecord.uid}`,
      )
    }

    nextPageToken = listResult.pageToken
  } while (nextPageToken)

  console.log(
    `\nDone. Created: ${created}  |  Already existed: ${skipped}  |  Total: ${created + skipped}`,
  )
}

backfillProfiles().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})

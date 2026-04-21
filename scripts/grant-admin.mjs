import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// Load service account — resolves relative to this script's directory.
// Update the path below if your key file is elsewhere.
// ---------------------------------------------------------------------------
const SERVICE_ACCOUNT_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  resolve(__dirname, "./sdtravel-wynsoladv-firebase-adminsdk-fbsvc-43bc5f07a5.json")

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"))

initializeApp({ credential: cert(serviceAccount) })

// ---------------------------------------------------------------------------
// User to promote — pass as CLI arg or update the default below.
// Usage:  node scripts/grant-admin.mjs [uid]
// ---------------------------------------------------------------------------
const uid = process.argv[2] ?? "3HKCPR0nwrSvjGkgWm7Kg42AUtF3"

async function grantAdminRole() {
  try {
    await getAuth().setCustomUserClaims(uid, { admin: true })
    console.log(`✓ Granted admin privileges to user: ${uid}`)

    const userRecord = await getAuth().getUser(uid)
    console.log("Current custom claims:", userRecord.customClaims)
  } catch (error) {
    console.error("Error granting admin role:", error)
    process.exit(1)
  }
}

grantAdminRole()

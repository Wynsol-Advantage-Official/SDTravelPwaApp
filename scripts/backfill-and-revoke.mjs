import fs from 'fs'
import path from 'path'
import admin from 'firebase-admin'

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  loadDotEnv(envPath)

  const targetUid = process.argv[2] // optional; if omitted, do all users
  const reissue = process.argv.includes('--reissue')

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase admin credentials in .env.local')
    process.exit(2)
  }

  privateKey = privateKey.replace(/\\n/g, '\n')

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  })

  const auth = admin.auth()
  const db = admin.firestore()

  async function processUser(user) {
    const uid = user.uid
    const claims = user.customClaims || {}
    const role = claims.role || 'user'
    const tenantId = claims.tenantId || null

    console.log(`[${uid}] backfilling profile — role=${role} tenantId=${tenantId}`)

    try {
      const profileRef = db.collection('users').doc(uid).collection('profile').doc('main')
      await profileRef.set({
        role,
        tenantId,
        claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true })
      console.log(`[${uid}] profile updated`)
    } catch (err) {
      console.error(`[${uid}] failed to update profile:`, err)
    }

    // Revoke refresh tokens to force clients to re-auth
    try {
      await auth.revokeRefreshTokens(uid)
      console.log(`[${uid}] refresh tokens revoked`)
    } catch (err) {
      console.error(`[${uid}] failed to revoke tokens:`, err)
    }

    // Optionally generate a custom token admin can deliver to user to sign-in
    if (reissue) {
      try {
        const customToken = await auth.createCustomToken(uid)
        console.log(`[${uid}] custom token (copy & deliver to user to force sign-in):`)
        console.log(customToken)
      } catch (err) {
        console.error(`[${uid}] failed to create custom token:`, err)
      }
    }
  }

  try {
    if (targetUid) {
      const user = await auth.getUser(targetUid)
      await processUser(user)
    } else {
      let pageToken = undefined
      do {
        const list = await auth.listUsers(1000, pageToken)
        for (const user of list.users) {
          await processUser(user)
        }
        pageToken = list.pageToken
      } while (pageToken)
    }

    console.log('Done')
  } catch (err) {
    console.error('Fatal:', err)
    process.exit(1)
  }
}

main()

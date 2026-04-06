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

  const uid = process.argv[2]
  if (!uid) {
    console.error('Usage: node scripts/set-super-admin.mjs <UID>')
    process.exit(2)
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase admin credentials in .env.local')
    process.exit(2)
  }

  privateKey = privateKey.replace(/\\n/g, '\n')

  const serviceAccount = {
    projectId,
    clientEmail,
    privateKey,
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  const auth = admin.auth()

  try {
    const claims = { role: 'super_admin', admin: true }
    await auth.setCustomUserClaims(uid, claims)
    console.log(`Set custom claims for ${uid}:`, claims)

    // Fetch user to verify
    const user = await auth.getUser(uid)
    console.log('Updated customClaims:', user.customClaims)
  } catch (err) {
    console.error('Failed to set claims:', err)
    process.exit(1)
  }
}

main()

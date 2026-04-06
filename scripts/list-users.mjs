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

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase admin credentials in .env.local (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)')
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

  console.log('Listing users (uid | email | role | tenantId)')

  let pageToken = undefined
  let count = 0
  try {
    do {
      const list = await auth.listUsers(1000, pageToken)
      for (const user of list.users) {
        const claims = user.customClaims || {}
        const role = claims.role || 'user'
        const tenantId = claims.tenantId || ''
        console.log(`${user.uid}\t${user.email || ''}\t${role}\t${tenantId}`)
        count++
      }
      pageToken = list.pageToken
    } while (pageToken)

    console.log(`\nTotal users: ${count}`)
  } catch (err) {
    console.error('Error listing users:', err)
    process.exit(1)
  }
}

main()

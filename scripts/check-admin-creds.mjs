import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SERVICE_ACCOUNT =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  resolve(__dirname, '../.dev_only/sdtravel-wynsoladv-669c18b237bc.json')

function safeLogPresence(obj) {
  console.log('[check-admin-creds] serviceAccount JSON keys:', Object.keys(obj).join(', '))
  console.log('[check-admin-creds] project_id present:', Boolean(obj.project_id))
  console.log('[check-admin-creds] client_email present:', Boolean(obj.client_email))
  console.log('[check-admin-creds] private_key present:', Boolean(obj.private_key))
}

async function main() {
  let raw
  try {
    raw = readFileSync(SERVICE_ACCOUNT, 'utf8')
  } catch (err) {
    console.error('[check-admin-creds] Failed to read service account JSON:', err.message)
    process.exit(2)
  }

  let sa
  try {
    sa = JSON.parse(raw)
  } catch (err) {
    console.error('[check-admin-creds] Invalid JSON in service account file:', err.message)
    process.exit(2)
  }

  safeLogPresence(sa)

  try {
    const app = initializeApp({ credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key.replace(/\\n/g, '\n'),
    }) })

    const db = getFirestore(app)

    console.log('[check-admin-creds] Querying tenants (limit 1) to verify access...')
    const snap = await db.collection('tenants').limit(1).get()
    console.log('[check-admin-creds] Query succeeded. docs:', snap.size)
    if (!snap.empty) {
      console.log('[check-admin-creds] Sample doc id:', snap.docs[0].id)
    }
    process.exit(0)
  } catch (err) {
    console.error('[check-admin-creds] Firestore query failed:')
    console.error(err && err.message ? err.message : String(err))
    if (err && err.code) console.error('[check-admin-creds] code:', err.code)
    process.exit(1)
  }
}

main()

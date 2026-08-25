// One-off cleanup: removes the abandoned username-login feature's leftover database state —
// deletes every doc in the `usernames` collection, and strips the `username` field from every
// `users/{uid}` profile. Safe to delete this file after running it once.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node --env-file=.env scripts/cleanupUsernameFeature.mjs

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  console.error('Generate one via Firebase Console → Project Settings → Service accounts.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function main() {
  const usernamesSnap = await db.collection('usernames').get()
  for (const doc of usernamesSnap.docs) {
    await doc.ref.delete()
    console.log(`Deleted usernames/${doc.id}`)
  }
  if (usernamesSnap.empty) console.log('No documents in usernames collection.')

  const usersSnap = await db.collection('users').get()
  for (const doc of usersSnap.docs) {
    if (doc.data().username === undefined) continue
    await doc.ref.update({ username: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() })
    console.log(`Removed username field from users/${doc.id}`)
  }

  console.log('\nDone.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Cleanup failed:', err)
    process.exit(1)
  })

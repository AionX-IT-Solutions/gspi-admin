// One-time script: creates the first `super_admin` Firebase Auth account + Firestore profile.
// Run this once, from a developer machine — never bundled into the app.
//
// Prerequisites:
//   1. Enable Email/Password sign-in: Firebase Console → Authentication → Sign-in method.
//   2. Generate a service account key: Firebase Console → Project Settings → Service
//      accounts → "Generate new private key". Save it as serviceAccountKey.json at the
//      repo root (already covered by .gitignore's *.json service-account patterns — verify
//      before committing anything).
//   3. BOOTSTRAP_SUPER_ADMIN_EMAIL / _PASSWORD / _FULLNAME must be set in .env at the repo root.
//
// Run with:
//   node --env-file=.env scripts/bootstrapSuperAdmin.mjs

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  console.error('Generate one via Firebase Console → Project Settings → Service accounts, and save it there.')
  process.exit(1)
}

const email = process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL
const password = process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD
const fullName = process.env.BOOTSTRAP_SUPER_ADMIN_FULLNAME ?? 'Super Admin'

if (!email || !password) {
  console.error('BOOTSTRAP_SUPER_ADMIN_EMAIL and BOOTSTRAP_SUPER_ADMIN_PASSWORD must be set (see .env).')
  console.error('Run with: node --env-file=.env scripts/bootstrapSuperAdmin.mjs')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })

const auth = getAuth()
const db = getFirestore()

async function main() {
  let uid
  try {
    const existing = await auth.getUserByEmail(email)
    uid = existing.uid
    await auth.updateUser(uid, { password, displayName: fullName, disabled: false })
    console.log(`Account already existed for ${email} — password and display name updated.`)
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err
    const created = await auth.createUser({ email, password, displayName: fullName })
    uid = created.uid
    console.log(`Created new Firebase Auth account for ${email}.`)
  }

  await auth.setCustomUserClaims(uid, { role: 'super_admin' })

  await db.collection('users').doc(uid).set(
    {
      uid,
      email,
      fullName,
      role: 'super_admin',
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )

  console.log(`\nDone. ${email} is now a super_admin.`)
  console.log('Sign out and back in (or wait for the next token refresh) for the role to take effect in the app.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Bootstrap failed:', err)
    process.exit(1)
  })

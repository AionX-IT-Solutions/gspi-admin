// Create or update a staff Firebase Auth account + Firestore profile, from the CLI.
// The app itself never ships the service account key, so all account management
// (creating accounts, changing roles, admin-set passwords) happens here, run manually
// from a developer machine — never as a network-callable function.
//
// Usage:
//   node --env-file=.env scripts/manageStaffUser.mjs create --email=x@y.com --password=secret123 --fullName="Full Name" --role=cashier
//   node --env-file=.env scripts/manageStaffUser.mjs update --uid=<uid> [--fullName="New Name"] [--role=hr] [--isActive=false] [--newPassword=secret456]
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root
// (Firebase Console → Project Settings → Service accounts → Generate new private key).
// The "Add User" / "Edit User" modals in the app generate the exact command to paste here.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const ASSIGNABLE_ROLES = ['super_admin', 'admin', 'cashier', 'accountant', 'hr', 'inventory_clerk', 'manager']

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')

function parseArgs(argv) {
  const [command, ...rest] = argv
  const flags = {}
  for (const arg of rest) {
    const match = /^--([\w]+)=(.*)$/.exec(arg)
    if (match) flags[match[1]] = match[2]
  }
  return { command, flags }
}

function usageAndExit() {
  console.error('Usage:')
  console.error(
    '  node --env-file=.env scripts/manageStaffUser.mjs create --email=x@y.com --password=secret --fullName="Full Name" --role=cashier'
  )
  console.error(
    '  node --env-file=.env scripts/manageStaffUser.mjs update --uid=<uid> [--fullName=...] [--role=...] [--isActive=true|false] [--newPassword=...]'
  )
  process.exit(1)
}

const { command, flags } = parseArgs(process.argv.slice(2))
if (command !== 'create' && command !== 'update') usageAndExit()

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  console.error('Generate one via Firebase Console → Project Settings → Service accounts.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()
const db = getFirestore()

function assertValidRole(role) {
  if (role && !ASSIGNABLE_ROLES.includes(role)) {
    console.error(`role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`)
    process.exit(1)
  }
}

/** Only one active super_admin at a time — this is the server-side backstop for that rule;
 *  the app's role dropdown already hides the option once one exists, but this script can be
 *  run by hand with a stale/copy-pasted command, so it re-checks here too. */
async function assertSuperAdminAvailable(excludeUid) {
  const snap = await db.collection('users').where('role', '==', 'super_admin').get()
  const other = snap.docs.find((d) => d.id !== excludeUid)
  if (other) {
    console.error(`A super_admin already exists (${other.data().email ?? other.id}). Demote them first.`)
    process.exit(1)
  }
}

async function createUser() {
  const { email, password, fullName, role } = flags
  if (!email || !password || !fullName || !role) usageAndExit()
  assertValidRole(role)
  if (role === 'super_admin') await assertSuperAdminAvailable()

  const userRecord = await auth.createUser({ email, password, displayName: fullName })
  await auth.setCustomUserClaims(userRecord.uid, { role })
  await db
    .collection('users')
    .doc(userRecord.uid)
    .set({
      uid: userRecord.uid,
      email,
      fullName,
      role,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

  console.log(`Created ${email} (uid: ${userRecord.uid}, role: ${role}).`)
}

async function updateUser() {
  const { uid, fullName, role, isActive, newPassword } = flags
  if (!uid) usageAndExit()
  assertValidRole(role)
  if (role === 'super_admin') await assertSuperAdminAvailable(uid)

  const authUpdate = {}
  if (fullName) authUpdate.displayName = fullName
  if (isActive !== undefined) authUpdate.disabled = isActive === 'false'
  if (newPassword) authUpdate.password = newPassword
  if (Object.keys(authUpdate).length > 0) {
    await auth.updateUser(uid, authUpdate)
  }
  if (role) {
    await auth.setCustomUserClaims(uid, { role })
  }

  const firestoreUpdate = { updatedAt: FieldValue.serverTimestamp() }
  if (fullName) firestoreUpdate.fullName = fullName
  if (role) firestoreUpdate.role = role
  if (isActive !== undefined) firestoreUpdate.isActive = isActive !== 'false'

  await db.collection('users').doc(uid).update(firestoreUpdate)

  console.log(`Updated ${uid}.`)
}

;(command === 'create' ? createUser() : updateUser())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })

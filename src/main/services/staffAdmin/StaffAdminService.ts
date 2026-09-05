import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { app } from 'electron'
import log from 'electron-log'
import { cert, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore'
import type {
  CreateStaffUserRequest,
  StaffAdminResult,
  UpdateStaffUserRequest
} from '../../../shared/staff-admin-types'

// Mirrors scripts/manageStaffUser.mjs: same Admin SDK operations, same role rules.
// This only works on a machine where serviceAccountKey.json is present — it's never
// bundled into the packaged installer (see the "files" list in package.json's "build"
// config), so on every other machine isAvailable() is false and the app falls back to
// the copy-pasteable CLI command (see staffUserFunctions.ts).
//
// `role` must always be one of these 7 — Firestore security rules and gspi-app (mobile)
// only understand them. A custom role (Role Permissions screen) is never sent here as
// `role` itself: the renderer resolves it to its base role first and passes the custom
// role's id separately as `customRoleId` (cosmetic — see staff-admin-types.ts).
const ASSIGNABLE_ROLES = [
  'super_admin',
  'admin',
  'cashier',
  'accountant',
  'hr',
  'inventory_clerk',
  'manager'
]

function candidateKeyPaths(): string[] {
  const paths: string[] = []
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS)
    paths.push(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  // Dev (electron-vite dev): app.getAppPath() resolves to the repo root.
  paths.push(join(app.getAppPath(), 'serviceAccountKey.json'))
  // Packaged: an admin can drop the key next to the installed executable by hand.
  paths.push(join(dirname(app.getPath('exe')), 'serviceAccountKey.json'))
  return paths
}

let resolvedKeyPath: string | null | undefined
let adminApp: App | null = null
let authClient: Auth | null = null
let dbClient: Firestore | null = null

function resolveKeyPath(): string | null {
  if (resolvedKeyPath === undefined) {
    resolvedKeyPath = candidateKeyPaths().find((p) => existsSync(p)) ?? null
  }
  return resolvedKeyPath
}

function isAvailable(): boolean {
  return resolveKeyPath() !== null
}

function ensureInitialized(): { auth: Auth; db: Firestore } | null {
  if (authClient && dbClient) return { auth: authClient, db: dbClient }
  const keyPath = resolveKeyPath()
  if (!keyPath) return null
  try {
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'))
    adminApp = initializeApp({ credential: cert(serviceAccount) }, 'staffAdmin')
    authClient = getAuth(adminApp)
    dbClient = getFirestore(adminApp)
    return { auth: authClient, db: dbClient }
  } catch (err) {
    log.error('[staffAdmin] Failed to initialize firebase-admin:', err)
    return null
  }
}

function roleValidationError(role?: string): string | null {
  if (!role) return null
  if (ASSIGNABLE_ROLES.includes(role)) return null
  return `Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}.`
}

/** Only one active super_admin at a time — the app's role dropdown already hides the
 *  option once one exists, but this re-checks server-side too. */
async function superAdminConflictError(db: Firestore, excludeUid?: string): Promise<string | null> {
  const snap = await db.collection('users').where('role', '==', 'super_admin').get()
  const other = snap.docs.find((d) => d.id !== excludeUid)
  if (other)
    return `A super_admin already exists (${other.data().email ?? other.id}). Demote them first.`
  return null
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

async function createUser(input: CreateStaffUserRequest): Promise<StaffAdminResult> {
  const ctx = ensureInitialized()
  if (!ctx) return { ok: false, error: 'unavailable' }
  const { auth, db } = ctx

  const roleError = roleValidationError(input.role)
  if (roleError) return { ok: false, error: roleError }
  if (input.role === 'super_admin') {
    const conflict = await superAdminConflictError(db)
    if (conflict) return { ok: false, error: conflict }
  }

  try {
    const userRecord = await auth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.fullName
    })
    await auth.setCustomUserClaims(userRecord.uid, { role: input.role })
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        ...(input.customRoleId ? { customRoleId: input.customRoleId } : {}),
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
    return { ok: true, uid: userRecord.uid }
  } catch (err) {
    log.error('[staffAdmin] createUser failed:', err)
    return { ok: false, error: errorMessage(err, 'Failed to create user account.') }
  }
}

async function updateUser(input: UpdateStaffUserRequest): Promise<StaffAdminResult> {
  const ctx = ensureInitialized()
  if (!ctx) return { ok: false, error: 'unavailable' }
  const { auth, db } = ctx

  const roleError = roleValidationError(input.role)
  if (roleError) return { ok: false, error: roleError }
  if (input.role === 'super_admin') {
    const conflict = await superAdminConflictError(db, input.uid)
    if (conflict) return { ok: false, error: conflict }
  }

  try {
    const authUpdate: Record<string, unknown> = {}
    if (input.fullName) authUpdate.displayName = input.fullName
    if (input.isActive !== undefined) authUpdate.disabled = !input.isActive
    if (input.newPassword) authUpdate.password = input.newPassword
    if (Object.keys(authUpdate).length > 0) {
      await auth.updateUser(input.uid, authUpdate)
    }
    if (input.role) {
      await auth.setCustomUserClaims(input.uid, { role: input.role })
    }

    const firestoreUpdate: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (input.fullName) firestoreUpdate.fullName = input.fullName
    if (input.role) firestoreUpdate.role = input.role
    if (input.customRoleId !== undefined) {
      firestoreUpdate.customRoleId = input.customRoleId || FieldValue.delete()
    }
    if (input.isActive !== undefined) firestoreUpdate.isActive = input.isActive

    await db.collection('users').doc(input.uid).update(firestoreUpdate)
    return { ok: true, uid: input.uid }
  } catch (err) {
    log.error('[staffAdmin] updateUser failed:', err)
    return { ok: false, error: errorMessage(err, 'Failed to update user account.') }
  }
}

export const staffAdminService = {
  isAvailable,
  createUser,
  updateUser
}

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { RoleId } from '@/app/lib/permissions'

interface CreateStaffUserInput {
  email: string
  password: string
  fullName: string
  role: RoleId
}

/** Builds the exact `scripts/manageStaffUser.mjs create` command to run from a terminal.
 *  Account creation needs Admin SDK access, which this app deliberately never ships with —
 *  so it's a copy-pasteable CLI command instead of an in-app network call. */
export function buildCreateStaffUserCommand(input: CreateStaffUserInput): string {
  return [
    'node --env-file=.env scripts/manageStaffUser.mjs create',
    `--email="${input.email}"`,
    `--password="${input.password}"`,
    `--fullName="${input.fullName}"`,
    `--role=${input.role}`
  ].join(' ')
}

interface UpdateStaffUserInput {
  uid: string
  fullName?: string
  role?: RoleId
}

/** Builds the exact `scripts/manageStaffUser.mjs update` command for a role/name change. */
export function buildUpdateStaffUserCommand(input: UpdateStaffUserInput): string {
  const parts = ['node --env-file=.env scripts/manageStaffUser.mjs update', `--uid=${input.uid}`]
  if (input.fullName) parts.push(`--fullName="${input.fullName}"`)
  if (input.role) parts.push(`--role=${input.role}`)
  return parts.join(' ')
}

/** The one staff-account change the app makes directly — Firestore rules narrowly allow
 *  admin/super_admin to toggle just this field, so Enable/Disable doesn't need the CLI. */
export async function setStaffUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { isActive, updatedAt: serverTimestamp() })
}

/** Renaming a staff member never touches Firebase Auth or the `role` custom claim, so
 *  Firestore rules allow admin/super_admin to write it directly — no CLI round-trip.
 *  Role changes still need the CLI (see buildUpdateStaffUserCommand) — custom claims can
 *  only be set via the Admin SDK. */
export async function setStaffUserFullName(uid: string, fullName: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { fullName, updatedAt: serverTimestamp() })
}

/** Self-service profile photo — Firestore rules narrowly allow a signed-in user to update
 *  only this field (plus `updatedAt`) on their own `users/{uid}` document. */
export async function setStaffUserPhoto(uid: string, photoUrl: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { photoUrl, updatedAt: serverTimestamp() })
}

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import type { UserRole } from '@/app/lib/permissions'
import type { StaffAdminResult } from '../../../../../shared/staff-admin-types'

/** `role` here is always a real built-in role — a custom role selection is resolved to
 *  its base role (+ `customRoleId`) via resolveRoleAssignment() before it ever reaches
 *  these functions. See useAddUserModal.ts / useEditUserModal.ts. */
interface CreateStaffUserInput {
  email: string
  password: string
  fullName: string
  role: UserRole
  customRoleId?: string | null
}

/** True when this machine has a service account key the main process can use — i.e. Add/Edit
 *  User can create or change roles directly. Everywhere else, falls back to the CLI command. */
export function isStaffAdminAvailable(): Promise<boolean> {
  return window.api?.staffAdmin.isAvailable() ?? Promise.resolve(false)
}

export function createStaffUserDirect(input: CreateStaffUserInput): Promise<StaffAdminResult> {
  return window.api.staffAdmin.createUser(input)
}

interface UpdateStaffUserDirectInput {
  uid: string
  fullName?: string
  role?: UserRole
  customRoleId?: string | null
}

export function updateStaffUserDirect(
  input: UpdateStaffUserDirectInput
): Promise<StaffAdminResult> {
  return window.api.staffAdmin.updateUser(input)
}

/** Builds the exact `scripts/manageStaffUser.mjs create` command to run from a terminal.
 *  Fallback for machines without a local service account key — see isStaffAdminAvailable(). */
export function buildCreateStaffUserCommand(input: CreateStaffUserInput): string {
  const parts = [
    'node --env-file=.env scripts/manageStaffUser.mjs create',
    `--email="${input.email}"`,
    `--password="${input.password}"`,
    `--fullName="${input.fullName}"`,
    `--role=${input.role}`
  ]
  if (input.customRoleId) parts.push(`--customRoleId=${input.customRoleId}`)
  return parts.join(' ')
}

interface UpdateStaffUserInput {
  uid: string
  fullName?: string
  role?: UserRole
  customRoleId?: string | null
}

/** Builds the exact `scripts/manageStaffUser.mjs update` command for a role/name change.
 *  `customRoleId: null` clears a previously-set custom role label (passed as `--customRoleId=`
 *  with no value, which the script treats as "remove the field"). */
export function buildUpdateStaffUserCommand(input: UpdateStaffUserInput): string {
  const parts = ['node --env-file=.env scripts/manageStaffUser.mjs update', `--uid=${input.uid}`]
  if (input.fullName) parts.push(`--fullName="${input.fullName}"`)
  if (input.role) parts.push(`--role=${input.role}`)
  if (input.customRoleId !== undefined) parts.push(`--customRoleId=${input.customRoleId ?? ''}`)
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

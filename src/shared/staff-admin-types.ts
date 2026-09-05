// Payloads for the main-process staff account admin bridge (src/main/services/staffAdmin).
// Mirrors scripts/manageStaffUser.mjs — same Admin SDK operations, run in-process instead
// of from a terminal, but only when a service account key is found on this machine.

// `role` here is always a real built-in role — the renderer resolves any custom role
// selection to its base role (+ customRoleId) before calling this bridge. See
// resolveRoleAssignment in app/lib/permissions.ts.

export interface CreateStaffUserRequest {
  email: string
  password: string
  fullName: string
  role: string
  /** The custom role's own id, purely cosmetic — carried on the Firestore doc alongside
   *  the real `role`. Omit/undefined for a plain built-in role. */
  customRoleId?: string | null
}

export interface UpdateStaffUserRequest {
  uid: string
  fullName?: string
  role?: string
  /** `undefined` = leave as-is, `null`/`""` = clear, non-empty string = set. */
  customRoleId?: string | null
  isActive?: boolean
  newPassword?: string
}

export interface StaffAdminResult {
  ok: boolean
  uid?: string
  error?: string
}

import { useAppStore } from '../store/app.store'
import { usePermissionsStore } from '../store/permissions.store'
import { ALL_PERMISSIONS, type Permission } from '../lib/permissions'

export function usePermissions() {
  const role = useAppStore((s) => s.currentUser?.role)
  const customRoleId = useAppStore((s) => s.currentUser?.customRoleId)
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions)

  // super_admin is always full-access (see ASSIGNABLE_USER_ROLES in lib/permissions.ts) —
  // bypass the stored role->permissions map entirely so a stale/incomplete
  // `rolePermissions/super_admin` doc (or a permission added in a later release that
  // never got backfilled into it) can never lock the bootstrap owner out of a module.
  if (role === 'super_admin') {
    return { permissions: ALL_PERMISSIONS as unknown as Permission[], hasPermission: () => true }
  }

  const permissionKey = customRoleId ?? role
  const permissions = permissionKey ? (rolePermissions[permissionKey] ?? []) : []

  function hasPermission(permission?: Permission) {
    return !permission || permissions.includes(permission)
  }

  return { permissions, hasPermission }
}

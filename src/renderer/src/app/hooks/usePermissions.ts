import { useAppStore } from '../store/app.store'
import { usePermissionsStore } from '../store/permissions.store'
import type { Permission } from '../lib/permissions'

export function usePermissions() {
  const role = useAppStore((s) => s.currentUser?.role)
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions)
  const permissions = role ? (rolePermissions[role] ?? []) : []

  function hasPermission(permission?: Permission) {
    return !permission || permissions.includes(permission)
  }

  return { permissions, hasPermission }
}

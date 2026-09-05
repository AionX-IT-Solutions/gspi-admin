import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { useAppStore } from '@/app/store/app.store'
import { useAssignableRoleOptions, type RoleOption } from '@/app/hooks/useRoleLabel'
import { useToast } from '@/app/hooks/useToast'
import { ASSIGNABLE_USER_ROLES, type RoleId, type UserRole } from '@/app/lib/permissions'
import { useUsersStore } from '../store/users.store'

export interface RoleRow extends RoleOption {
  assignedCount: number
}

export function useRolePermissionsSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions)
  const customRoles = usePermissionsStore((s) => s.customRoles)
  const setRolePermissions = usePermissionsStore((s) => s.setRolePermissions)
  const addCustomRole = usePermissionsStore((s) => s.addCustomRole)
  const setCustomRoleBaseRole = usePermissionsStore((s) => s.setCustomRoleBaseRole)
  const deleteCustomRole = usePermissionsStore((s) => s.deleteCustomRole)
  const users = useUsersStore((s) => s.users)
  const currentUserRole = useAppStore((s) => s.currentUser?.role)
  const roleOptions = useAssignableRoleOptions()

  const canManageRoles = currentUserRole === 'super_admin' || currentUserRole === 'admin'

  const roleRows: RoleRow[] = roleOptions.map((r) => ({
    ...r,
    assignedCount: users.filter((u) => u.role === r.value).length
  }))

  /** Options for a custom role's required "base role" — the real Firestore
   *  role/claim it resolves to (see resolveRoleAssignment in lib/permissions.ts). */
  const baseRoleOptions = ASSIGNABLE_USER_ROLES.map((r) => ({ value: r, label: t(`roles.${r}`) }))

  const [permTarget, setPermTarget] = useState<RoleId | null>(null)
  const [addRoleOpen, setAddRoleOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null)

  function handleAddRole(label: string, baseRole: UserRole) {
    const result = addCustomRole(label, baseRole)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    setAddRoleOpen(false)
    setPermTarget(result.id)
  }

  function handleSetBaseRole(id: string, baseRole: UserRole) {
    setCustomRoleBaseRole(id, baseRole)
  }

  function handleConfirmDeleteRole() {
    if (!deleteTarget) return
    deleteCustomRole(deleteTarget.value)
    toast.success(t('users.rolePermissions.deleteRole.success', { role: deleteTarget.label }))
    setDeleteTarget(null)
  }

  return {
    rolePermissions,
    customRoles,
    setRolePermissions,
    permTarget,
    setPermTarget,
    canManageRoles,
    roleRows,
    baseRoleOptions,
    addRoleOpen,
    setAddRoleOpen,
    handleAddRole,
    handleSetBaseRole,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteRole
  }
}

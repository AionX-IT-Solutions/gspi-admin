import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { useAppStore } from '@/app/store/app.store'
import { useAssignableRoleOptions, type RoleOption } from '@/app/hooks/useRoleLabel'
import { useToast } from '@/app/hooks/useToast'
import type { RoleId } from '@/app/lib/permissions'
import { useUsersStore } from '../store/users.store'

export interface RoleRow extends RoleOption {
  assignedCount: number
}

export function useRolePermissionsSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const rolePermissions = usePermissionsStore((s) => s.rolePermissions)
  const togglePermission = usePermissionsStore((s) => s.togglePermission)
  const addCustomRole = usePermissionsStore((s) => s.addCustomRole)
  const deleteCustomRole = usePermissionsStore((s) => s.deleteCustomRole)
  const users = useUsersStore((s) => s.users)
  const currentUserRole = useAppStore((s) => s.currentUser?.role)
  const roleOptions = useAssignableRoleOptions()

  const canManageRoles = currentUserRole === 'super_admin' || currentUserRole === 'admin'

  const roleRows: RoleRow[] = roleOptions.map((r) => ({
    ...r,
    assignedCount: users.filter((u) => u.role === r.value).length
  }))

  const [permTarget, setPermTarget] = useState<RoleId | null>(null)
  const [addRoleOpen, setAddRoleOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null)

  function handleAddRole(label: string) {
    const result = addCustomRole(label)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    setAddRoleOpen(false)
    setPermTarget(result.id)
  }

  function handleConfirmDeleteRole() {
    if (!deleteTarget) return
    deleteCustomRole(deleteTarget.value)
    toast.success(t('users.rolePermissions.deleteRole.success', { role: deleteTarget.label }))
    setDeleteTarget(null)
  }

  return {
    rolePermissions,
    togglePermission,
    permTarget,
    setPermTarget,
    canManageRoles,
    roleRows,
    addRoleOpen,
    setAddRoleOpen,
    handleAddRole,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteRole
  }
}

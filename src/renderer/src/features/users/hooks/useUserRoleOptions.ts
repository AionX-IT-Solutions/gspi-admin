import { useTranslation } from 'react-i18next'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { ASSIGNABLE_USER_ROLES, type RoleId } from '@/app/lib/permissions'
import type { RoleOption } from '@/app/hooks/useRoleLabel'
import { useUsersStore } from '../store/users.store'

/** Role options for the Add/Edit User dropdowns — like useAssignableRoleOptions, but also
 *  offers Super Admin, capped at one active holder at a time: the option only appears when
 *  no other user currently has the role (or when editing that same super_admin, so they
 *  keep their own role rather than having it silently vanish from the dropdown). */
export function useUserRoleOptions(editingUid?: string): RoleOption[] {
  const { t } = useTranslation()
  const customRoles = usePermissionsStore((s) => s.customRoles)
  const users = useUsersStore((s) => s.users)
  const superAdminTaken = users.some((u) => u.role === 'super_admin' && u.uid !== editingUid)

  return [
    ...(superAdminTaken
      ? []
      : [{ value: 'super_admin' as RoleId, label: t('roles.super_admin'), isCustom: false }]),
    ...ASSIGNABLE_USER_ROLES.map((r) => ({
      value: r as RoleId,
      label: t(`roles.${r}`),
      isCustom: false
    })),
    ...customRoles.map((r) => ({ value: r.id as RoleId, label: r.label, isCustom: true }))
  ]
}

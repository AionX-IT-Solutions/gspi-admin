import { useTranslation } from 'react-i18next'
import { usePermissionsStore } from '../store/permissions.store'
import { ASSIGNABLE_USER_ROLES, resolveRoleLabel, type RoleId } from '../lib/permissions'

/** Resolves a single role id to its display label — built-in roles via i18n,
 *  custom roles via their stored label. */
export function useRoleLabel(role?: RoleId): string {
  const { t } = useTranslation()
  const customRoles = usePermissionsStore((s) => s.customRoles)
  if (!role) return ''
  return resolveRoleLabel(role, t, customRoles)
}

export interface RoleOption {
  value: RoleId
  label: string
  isCustom: boolean
}

/** Roles a staff account can be assigned to — the built-in roles (minus `super_admin`)
 *  plus any custom roles added via the Role Permissions screen. */
export function useAssignableRoleOptions(): RoleOption[] {
  const { t } = useTranslation()
  const customRoles = usePermissionsStore((s) => s.customRoles)
  return [
    ...ASSIGNABLE_USER_ROLES.map((r) => ({
      value: r as RoleId,
      label: t(`roles.${r}`),
      isCustom: false
    })),
    ...customRoles.map((r) => ({ value: r.id as RoleId, label: r.label, isCustom: true }))
  ]
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { resolveRoleAssignment, type RoleId } from '@/app/lib/permissions'
import type { StaffUser } from '../store/users.store'
import {
  setStaffUserFullName,
  setStaffUserBirthDate,
  updateStaffUserDirect
} from '../lib/staffUserFunctions'

export function useEditUserModal(target: StaffUser | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const customRoles = usePermissionsStore((s) => s.customRoles)
  const [form, setForm] = useState({ fullName: '', role: 'cashier' as RoleId, birthDate: '' })
  const [saving, setSaving] = useState(false)

  // The custom role's own id (if any), not its resolved base role — so the dropdown
  // shows "Developer" selected, not "Admin", and re-saving without touching the
  // dropdown doesn't look like a role change.
  const initialRoleSelection = target ? (target.customRoleId ?? target.role) : 'cashier'

  useEffect(() => {
    if (target) {
      setForm({
        fullName: target.fullName,
        role: target.customRoleId ?? target.role,
        birthDate: target.birthDate ?? ''
      })
    }
  }, [target])

  const roleChanged = !!target && form.role !== initialRoleSelection
  const birthDateChanged = !!target && form.birthDate !== (target.birthDate ?? '')

  async function handleSave() {
    if (!target) return
    const fullName = form.fullName.trim()
    if (!fullName) {
      toast.error(t('users.toast.fullNameRequired'))
      return
    }
    const fullNameChanged = fullName !== target.fullName

    if (!roleChanged && !fullNameChanged && !birthDateChanged) {
      onClose()
      return
    }

    const { role, customRoleId } = resolveRoleAssignment(form.role, customRoles)

    setSaving(true)
    try {
      if (roleChanged) {
        const result = await updateStaffUserDirect({
          uid: target.uid,
          fullName,
          role,
          customRoleId
        })
        if (!result.ok) {
          toast.error(
            result.error === 'unavailable'
              ? t('users.toast.roleUpdateUnavailable')
              : result.error || t('users.toast.roleUpdateFailed')
          )
          return
        }
        toast.success(t('users.toast.roleUpdated', { fullName }))
      } else if (fullNameChanged) {
        await setStaffUserFullName(target.uid, fullName)
        toast.success(t('users.toast.fullNameUpdated', { fullName }))
      }
      if (birthDateChanged) {
        await setStaffUserBirthDate(target.uid, form.birthDate)
      }
      onClose()
    } catch {
      toast.error(
        roleChanged ? t('users.toast.roleUpdateFailed') : t('users.toast.fullNameUpdateFailed')
      )
    } finally {
      setSaving(false)
    }
  }

  return {
    form,
    setForm,
    roleChanged,
    saving,
    handleSave
  }
}

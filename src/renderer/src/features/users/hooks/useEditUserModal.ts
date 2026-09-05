import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { resolveRoleAssignment, type RoleId } from '@/app/lib/permissions'
import type { StaffUser } from '../store/users.store'
import {
  buildUpdateStaffUserCommand,
  isStaffAdminAvailable,
  setStaffUserFullName,
  updateStaffUserDirect
} from '../lib/staffUserFunctions'

export function useEditUserModal(target: StaffUser | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const customRoles = usePermissionsStore((s) => s.customRoles)
  const [form, setForm] = useState({ fullName: '', role: 'cashier' as RoleId })
  const [generatedCommand, setGeneratedCommand] = useState('')
  const [directAvailable, setDirectAvailable] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    isStaffAdminAvailable().then(setDirectAvailable)
  }, [])

  // The custom role's own id (if any), not its resolved base role — so the dropdown
  // shows "Developer" selected, not "Admin", and re-saving without touching the
  // dropdown doesn't look like a role change.
  const initialRoleSelection = target ? (target.customRoleId ?? target.role) : 'cashier'

  useEffect(() => {
    if (target) {
      setForm({ fullName: target.fullName, role: target.customRoleId ?? target.role })
      setGeneratedCommand('')
    }
  }, [target])

  const roleChanged = !!target && form.role !== initialRoleSelection

  async function handleSave() {
    if (!target) return
    const fullName = form.fullName.trim()
    if (!fullName) {
      toast.error(t('users.toast.fullNameRequired'))
      return
    }

    const { role, customRoleId } = resolveRoleAssignment(form.role, customRoles)

    if (roleChanged && !directAvailable) {
      setGeneratedCommand(
        buildUpdateStaffUserCommand({ uid: target.uid, fullName, role, customRoleId })
      )
      return
    }

    if (!roleChanged && fullName === target.fullName) {
      onClose()
      return
    }

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
          toast.error(result.error || t('users.toast.roleUpdateFailed'))
          return
        }
        toast.success(t('users.toast.roleUpdated', { fullName }))
      } else {
        await setStaffUserFullName(target.uid, fullName)
        toast.success(t('users.toast.fullNameUpdated', { fullName }))
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

  function handleCopy() {
    navigator.clipboard
      .writeText(generatedCommand)
      .then(() => toast.success(t('users.toast.commandCopied')))
      .catch(() => toast.error(t('users.toast.commandCopyFailed')))
  }

  return {
    form,
    setForm,
    generatedCommand,
    directAvailable,
    roleChanged,
    saving,
    handleSave,
    handleCopy
  }
}

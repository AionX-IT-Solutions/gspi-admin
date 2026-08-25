import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import type { RoleId } from '@/app/lib/permissions'
import type { StaffUser } from '../store/users.store'
import { buildUpdateStaffUserCommand, setStaffUserFullName } from '../lib/staffUserFunctions'

export function useEditUserModal(target: StaffUser | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: '', role: 'cashier' as RoleId })
  const [generatedCommand, setGeneratedCommand] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (target) {
      setForm({ fullName: target.fullName, role: target.role })
      setGeneratedCommand('')
    }
  }, [target])

  const roleChanged = !!target && form.role !== target.role

  async function handleSave() {
    if (!target) return
    const fullName = form.fullName.trim()
    if (!fullName) {
      toast.error(t('users.toast.fullNameRequired'))
      return
    }

    if (roleChanged) {
      setGeneratedCommand(
        buildUpdateStaffUserCommand({ uid: target.uid, fullName, role: form.role })
      )
      return
    }

    if (fullName === target.fullName) {
      onClose()
      return
    }

    setSaving(true)
    try {
      await setStaffUserFullName(target.uid, fullName)
      toast.success(t('users.toast.fullNameUpdated', { fullName }))
      onClose()
    } catch {
      toast.error(t('users.toast.fullNameUpdateFailed'))
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

  return { form, setForm, generatedCommand, roleChanged, saving, handleSave, handleCopy }
}

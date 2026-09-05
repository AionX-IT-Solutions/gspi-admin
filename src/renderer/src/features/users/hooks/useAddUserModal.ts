import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissionsStore } from '@/app/store/permissions.store'
import { resolveRoleAssignment, type RoleId } from '@/app/lib/permissions'
import {
  buildCreateStaffUserCommand,
  createStaffUserDirect,
  isStaffAdminAvailable
} from '../lib/staffUserFunctions'

function emptyForm() {
  return { email: '', password: '', fullName: '', role: 'cashier' as RoleId }
}

export function useAddUserModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const customRoles = usePermissionsStore((s) => s.customRoles)
  const [form, setForm] = useState(emptyForm())
  const [generatedCommand, setGeneratedCommand] = useState('')
  const [directAvailable, setDirectAvailable] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    isStaffAdminAvailable().then(setDirectAvailable)
  }, [])

  function validate(): boolean {
    if (!form.email.trim() || !form.password.trim() || !form.fullName.trim()) {
      toast.error(t('users.toast.missingFields'))
      return false
    }
    if (form.password.length < 6) {
      toast.error(t('auth.passwordMinLength'))
      return false
    }
    return true
  }

  async function handleSubmit() {
    if (!validate()) return

    const { role, customRoleId } = resolveRoleAssignment(form.role, customRoles)

    if (!directAvailable) {
      setGeneratedCommand(
        buildCreateStaffUserCommand({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          role,
          customRoleId
        })
      )
      return
    }

    setCreating(true)
    try {
      const result = await createStaffUserDirect({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        role,
        customRoleId
      })
      if (result.ok) {
        toast.success(t('users.toast.userCreated', { fullName: form.fullName.trim() }))
        close()
      } else {
        toast.error(result.error || t('users.toast.userCreateFailed'))
      }
    } catch {
      toast.error(t('users.toast.userCreateFailed'))
    } finally {
      setCreating(false)
    }
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(generatedCommand)
      .then(() => toast.success(t('users.toast.commandCopied')))
      .catch(() => toast.error(t('users.toast.commandCopyFailed')))
  }

  function resetForm() {
    setForm(emptyForm())
    setGeneratedCommand('')
  }

  function close() {
    onOpenChange(false)
    resetForm()
  }

  return {
    form,
    setForm,
    generatedCommand,
    directAvailable,
    creating,
    handleSubmit,
    handleCopy,
    resetForm,
    close
  }
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import type { RoleId } from '@/app/lib/permissions'
import { buildCreateStaffUserCommand } from '../lib/staffUserFunctions'

function emptyForm() {
  return { email: '', password: '', fullName: '', role: 'cashier' as RoleId }
}

export function useAddUserModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const [form, setForm] = useState(emptyForm())
  const [generatedCommand, setGeneratedCommand] = useState('')

  function handleGenerate() {
    if (!form.email.trim() || !form.password.trim() || !form.fullName.trim()) {
      toast.error(t('users.toast.missingFields'))
      return
    }
    if (form.password.length < 6) {
      toast.error(t('auth.passwordMinLength'))
      return
    }
    setGeneratedCommand(
      buildCreateStaffUserCommand({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role
      })
    )
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

  return { form, setForm, generatedCommand, handleGenerate, handleCopy, resetForm, close }
}

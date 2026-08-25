import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { auth } from '@/shared/lib/firebase'
import { useToast } from '@/app/hooks/useToast'

function mapChangePasswordError(err: unknown): string {
  const code = (err as { code?: string })?.code
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'settings.security.errors.wrongCurrentPassword'
    case 'auth/weak-password':
      return 'settings.security.errors.weakPassword'
    case 'auth/requires-recent-login':
      return 'settings.security.errors.requiresRecentLogin'
    default:
      return 'settings.security.errors.generic'
  }
}

export function useSecuritySection() {
  const { t } = useTranslation()
  const toast = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit() {
    const user = auth.currentUser
    if (!user?.email) {
      toast.error(t('settings.security.errors.generic'))
      return
    }
    if (newPassword.length < 6) {
      toast.error(t('auth.passwordMinLength'))
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.security.errors.mismatch'))
      return
    }

    setSubmitting(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      toast.success(t('settings.security.toast.updated'))
      resetForm()
    } catch (err) {
      toast.error(t(mapChangePasswordError(err)))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    submitting,
    handleSubmit
  }
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import type { RequestRow } from './useLeave'

export function useRevertLeaveModal(target: RequestRow | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const revertLeaveApproval = useHRStore((s) => s.revertLeaveApproval)
  const [reason, setReason] = useState('')

  function handleRevert() {
    if (!target) return
    revertLeaveApproval(target.id, reason || undefined)
    toast.success(t('leave.toast.reverted'))
    setReason('')
    onClose()
  }

  return { reason, setReason, handleRevert }
}

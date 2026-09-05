import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { LeaveDecisionTarget } from '../components/LeaveDecisionModal'

export function useLeaveDecisionModal(decision: LeaveDecisionTarget | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const decideLeaveRequest = useHRStore((s) => s.decideLeaveRequest)
  const [decisionNotes, setDecisionNotes] = useState('')

  function handleDecide() {
    if (!decision || !hasPermission('manage:leave')) return
    decideLeaveRequest(decision.id, decision.status, decisionNotes || undefined)
    toast.success(t('leave.toast.decided', { status: t(`common.${decision.status}`) }))
    if (decision.status === 'approved') {
      toast.info(t('leave.toast.approvedSynced'))
    }
    setDecisionNotes('')
    onClose()
  }

  return { decisionNotes, setDecisionNotes, handleDecide }
}

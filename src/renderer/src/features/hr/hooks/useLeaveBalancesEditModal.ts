import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { COMP_TIME_LEAVE_TYPE_ID, useHRStore } from '../store/hr.store'

export function useLeaveBalancesEditModal(open: boolean, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const updateLeaveTypeCredits = useHRStore((s) => s.updateLeaveTypeCredits)

  const editableLeaveTypes = leaveTypes.filter((lt) => lt.id !== COMP_TIME_LEAVE_TYPE_ID)
  const [drafts, setDrafts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (open) {
      setDrafts(
        Object.fromEntries(editableLeaveTypes.map((lt) => [lt.id, lt.defaultAnnualCredits]))
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function setDraft(id: string, value: number) {
    setDrafts((d) => ({ ...d, [id]: value }))
  }

  function handleSave() {
    for (const lt of editableLeaveTypes) {
      const value = drafts[lt.id]
      if (value !== undefined && value !== lt.defaultAnnualCredits) {
        updateLeaveTypeCredits(lt.id, value)
      }
    }
    toast.success(t('leave.balancesModal.saved'))
    onClose()
  }

  return { editableLeaveTypes, drafts, setDraft, handleSave }
}

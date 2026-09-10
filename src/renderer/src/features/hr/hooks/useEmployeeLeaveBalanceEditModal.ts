import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { COMP_TIME_LEAVE_TYPE_ID, useHRStore } from '../store/hr.store'

export function useEmployeeLeaveBalanceEditModal(employeeId: string | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const employees = useHRStore((s) => s.employees)
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const updateEmployee = useHRStore((s) => s.updateEmployee)

  const employee = employees.find((e) => e.id === employeeId) ?? null
  const editableLeaveTypes = leaveTypes.filter((lt) => lt.id !== COMP_TIME_LEAVE_TYPE_ID)
  const [drafts, setDrafts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (employee) {
      setDrafts(
        Object.fromEntries(
          editableLeaveTypes.map((lt) => [
            lt.id,
            employee.leaveCreditOverrides?.[lt.id] ?? lt.defaultAnnualCredits
          ])
        )
      )
    }
    // Re-seed only when a (possibly different) employee opens the modal — not on every
    // store update, or an in-progress edit would get clobbered by its own unsaved changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  function setDraft(id: string, value: number) {
    setDrafts((d) => ({ ...d, [id]: value }))
  }

  function resetDraft(id: string) {
    const lt = editableLeaveTypes.find((l) => l.id === id)
    if (lt) setDraft(id, lt.defaultAnnualCredits)
  }

  function handleSave() {
    if (!employee || !hasPermission('manage:leave')) return
    const overrides = { ...employee.leaveCreditOverrides }
    for (const lt of editableLeaveTypes) {
      const value = drafts[lt.id]
      if (value === undefined) continue
      // Matching the type's own default isn't really an override — dropping the key
      // instead of storing a redundant equal value keeps this employee tracking the
      // org-wide default automatically if it's ever changed later.
      if (value === lt.defaultAnnualCredits) {
        delete overrides[lt.id]
      } else {
        overrides[lt.id] = value
      }
    }
    updateEmployee(employee.id, { leaveCreditOverrides: overrides })
    toast.success(t('leave.employeeBalanceModal.saved', { name: employee.fullName }))
    onClose()
  }

  return { employee, editableLeaveTypes, drafts, setDraft, resetDraft, handleSave }
}

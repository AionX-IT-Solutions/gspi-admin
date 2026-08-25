import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { getLeaveBalance, useHRStore } from '../store/hr.store'
import type { LeaveRequest } from '../types/hr.types'
import type { LeaveDecisionTarget } from '../components/LeaveDecisionModal'

export interface RequestRow extends LeaveRequest {
  employeeName: string
  leaveTypeName: string
}

export interface BalanceRow {
  id: string
  employeeNumber: string
  employeeName: string
  [leaveTypeId: string]: string | number
}

export function useLeave() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const loading = useSkeletonLoading()
  const employees = useHRStore((s) => s.employees)
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const leaveRequests = useHRStore((s) => s.leaveRequests)
  const leaveCreditGrants = useHRStore((s) => s.leaveCreditGrants)
  const deleteLeaveRequest = useHRStore((s) => s.deleteLeaveRequest)

  const canManage = hasPermission('manage:leave')

  const [showFileDialog, setShowFileDialog] = useState(false)
  const [decision, setDecision] = useState<LeaveDecisionTarget | null>(null)
  const [showBalancesModal, setShowBalancesModal] = useState(false)
  const [revertTarget, setRevertTarget] = useState<RequestRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RequestRow | null>(null)

  const activeEmployees = employees.filter((e) => e.isActive)

  const rows: RequestRow[] = useMemo(
    () =>
      leaveRequests
        .map((r) => ({
          ...r,
          employeeName: employees.find((e) => e.id === r.employeeId)?.fullName ?? 'Unknown',
          leaveTypeName: leaveTypes.find((lt) => lt.id === r.leaveTypeId)?.name ?? 'Leave'
        }))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [leaveRequests, employees, leaveTypes]
  )

  const balanceRows: BalanceRow[] = useMemo(() => {
    const year = new Date().getFullYear()
    return activeEmployees.map((emp) => {
      const row: BalanceRow = {
        id: emp.id,
        employeeNumber: emp.employeeNumber,
        employeeName: emp.fullName
      }
      for (const lt of leaveTypes) {
        row[lt.id] = getLeaveBalance(
          { leaveTypes, leaveRequests, leaveCreditGrants },
          emp.id,
          lt.id,
          year
        ).creditsRemaining
      }
      return row
    })
  }, [activeEmployees, leaveTypes, leaveRequests, leaveCreditGrants])

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteLeaveRequest(deleteTarget.id)
    toast.success(t('leave.toast.requestDeleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    leaveTypes,
    rows,
    balanceRows,
    showFileDialog,
    setShowFileDialog,
    decision,
    setDecision,
    canManage,
    showBalancesModal,
    setShowBalancesModal,
    revertTarget,
    setRevertTarget,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}

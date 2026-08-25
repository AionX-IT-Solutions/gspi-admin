import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import type { PayrollEntry, PayrollStatus } from '../types/hr.types'

export interface PayrollRow extends PayrollEntry {
  employeeName: string
  position: string
}

export function usePayroll() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const payroll = useHRStore((s) => s.payroll)
  const setPayrollStatus = useHRStore((s) => s.setPayrollStatus)

  const [showDialog, setShowDialog] = useState(false)
  const [advanceTarget, setAdvanceTarget] = useState<PayrollRow | null>(null)

  const rows: PayrollRow[] = useMemo(
    () =>
      payroll
        .map((p) => {
          const emp = employees.find((e) => e.id === p.employeeId)
          return { ...p, employeeName: emp?.fullName ?? 'Unknown', position: emp?.position ?? '' }
        })
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [payroll, employees]
  )

  const totals = useMemo(
    () => ({
      total: rows.reduce((sum, r) => sum + r.netSalary, 0),
      pending: rows.filter((r) => r.status === 'pending').length,
      paid: rows.filter((r) => r.status === 'paid').length
    }),
    [rows]
  )

  function nextStatus(entry: PayrollRow): PayrollStatus {
    return entry.status === 'pending' ? 'approved' : 'paid'
  }

  function handleConfirmAdvanceStatus() {
    if (!advanceTarget) return
    const next = nextStatus(advanceTarget)
    setPayrollStatus(advanceTarget.id, next)
    toast.success(
      t('payroll.toast.statusUpdated', {
        number: advanceTarget.payrollNumber,
        status: t(`common.${next}`)
      })
    )
    setAdvanceTarget(null)
  }

  return {
    loading,
    rows,
    totals,
    showDialog,
    setShowDialog,
    advanceTarget,
    setAdvanceTarget,
    handleConfirmAdvanceStatus
  }
}

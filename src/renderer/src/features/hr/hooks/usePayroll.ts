import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import { formatDate } from '@/shared/lib/utils'
import type { PayrollEntry, PayrollStatus } from '../types/hr.types'

export interface PayrollRow extends PayrollEntry {
  employeeName: string
  position: string
}

const ALL_FILTER = 'all'

export function usePayroll() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const payroll = useHRStore((s) => s.payroll)
  const setPayrollStatus = useHRStore((s) => s.setPayrollStatus)

  const [showDialog, setShowDialog] = useState(false)
  const [advanceTarget, setAdvanceTarget] = useState<PayrollRow | null>(null)
  const [yearFilter, setYearFilterState] = useState(ALL_FILTER)
  const [periodFilter, setPeriodFilter] = useState(ALL_FILTER)

  const allRows: PayrollRow[] = useMemo(
    () =>
      payroll
        .map((p) => {
          const emp = employees.find((e) => e.id === p.employeeId)
          return { ...p, employeeName: emp?.fullName ?? 'Unknown', position: emp?.position ?? '' }
        })
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [payroll, employees]
  )

  const availableYears = useMemo(
    () =>
      Array.from(new Set(allRows.map((r) => r.periodStart.slice(0, 4))))
        .filter(Boolean)
        .sort((a, b) => Number(b) - Number(a)),
    [allRows]
  )

  function periodKey(periodStart: string, periodEnd: string) {
    return `${periodStart}_${periodEnd}`
  }

  const availablePeriods = useMemo(() => {
    const byKey = new Map<string, { value: string; label: string; periodStart: string }>()
    for (const r of allRows) {
      if (yearFilter !== ALL_FILTER && !r.periodStart.startsWith(yearFilter)) continue
      const value = periodKey(r.periodStart, r.periodEnd)
      if (!byKey.has(value)) {
        byKey.set(value, {
          value,
          label: `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`,
          periodStart: r.periodStart
        })
      }
    }
    return Array.from(byKey.values()).sort((a, b) => (a.periodStart < b.periodStart ? 1 : -1))
  }, [allRows, yearFilter])

  function setYearFilter(value: string) {
    setYearFilterState(value)
    setPeriodFilter(ALL_FILTER)
  }

  const rows: PayrollRow[] = useMemo(
    () =>
      allRows
        .filter((r) => yearFilter === ALL_FILTER || r.periodStart.startsWith(yearFilter))
        .filter(
          (r) =>
            periodFilter === ALL_FILTER || periodKey(r.periodStart, r.periodEnd) === periodFilter
        ),
    [allRows, yearFilter, periodFilter]
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
    yearFilter,
    setYearFilter,
    periodFilter,
    setPeriodFilter,
    availableYears,
    availablePeriods,
    showDialog,
    setShowDialog,
    advanceTarget,
    setAdvanceTarget,
    handleConfirmAdvanceStatus
  }
}

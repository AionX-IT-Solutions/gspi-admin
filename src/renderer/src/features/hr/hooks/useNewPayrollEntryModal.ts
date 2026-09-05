import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/utils'
import { useOrgSettingsStore } from '@/app/store/orgSettings.store'
import { getAttendanceSummary, useHRStore } from '../store/hr.store'
import type { Employee, PayrollEntry } from '../types/hr.types'
import { useToast } from '@/app/hooks/useToast'

function daysAgoIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/** Monthly Salary ÷ 26 — the standard PH daily-rate divisor (average working
 *  days/month), used both for the Basic Salary default and the unpaid-leave
 *  deduction so both are consistent with each other. */
function dailyRateOf(emp: Employee) {
  return Math.round(((emp.salary ?? 0) / 26) * 100) / 100
}

function emptyForm() {
  return {
    employeeId: '',
    // Payroll here runs monthly, so the default period is a trailing month.
    periodStart: daysAgoIso(30),
    periodEnd: daysAgoIso(1),
    dailyRate: 0,
    daysWorked: 0,
    overtimePay: 0,
    cola: 0,
    representation: 0,
    thirteenthMonthPay: 0,
    cashGift: 0,
    sss: 0,
    philhealth: 0,
    pagibig: 0,
    taxDeducted: 0
  }
}

function formFromEntry(entry: PayrollEntry) {
  return {
    employeeId: entry.employeeId,
    periodStart: entry.periodStart,
    periodEnd: entry.periodEnd,
    dailyRate: entry.dailyRate,
    daysWorked: entry.daysWorked,
    overtimePay: entry.overtimePay,
    cola: entry.cola,
    representation: entry.representation,
    thirteenthMonthPay: entry.thirteenthMonthPay ?? 0,
    cashGift: entry.cashGift ?? 0,
    sss: entry.sss,
    philhealth: entry.philhealth,
    pagibig: entry.pagibig,
    taxDeducted: entry.taxDeducted
  }
}

/** November or December — the only months a 13th Month Pay / Cash Gift line applies to. */
function isYearEndMonth(dateIso: string): boolean {
  if (!dateIso) return false
  const month = new Date(`${dateIso}T00:00:00`).getMonth() + 1
  return month === 11 || month === 12
}

/** Only the cash amount is persisted on a PayrollEntry — reverse the day count
 *  from it so editing an existing entry starts from the same figure the
 *  original "Pull from Attendance & Leave" produced. */
function unpaidDaysFromEntry(entry: PayrollEntry) {
  return entry.dailyRate > 0
    ? Math.round((entry.unpaidLeaveDeduction / entry.dailyRate) * 100) / 100
    : 0
}

export function useNewPayrollEntryModal(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  editTarget: PayrollEntry | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const attendance = useHRStore((s) => s.attendance)
  const leaveRequests = useHRStore((s) => s.leaveRequests)
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const payroll = useHRStore((s) => s.payroll)
  const addPayrollEntry = useHRStore((s) => s.addPayrollEntry)
  const updatePayrollEntry = useHRStore((s) => s.updatePayrollEntry)
  const defaultCashGift = useOrgSettingsStore((s) => s.defaultCashGift)

  const activeEmployees = useMemo(() => employees.filter((e) => e.isActive), [employees])

  const [form, setForm] = useState(emptyForm())
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === form.employeeId),
    [employees, form.employeeId]
  )
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState(0)

  useEffect(() => {
    if (!open) return
    setForm(editTarget ? formFromEntry(editTarget) : emptyForm())
    setUnpaidLeaveDays(editTarget ? unpaidDaysFromEntry(editTarget) : 0)
  }, [open, editTarget])

  function applyEmployeeDefaults(emp: Employee) {
    setForm((f) => ({
      ...f,
      employeeId: emp.id,
      dailyRate: dailyRateOf(emp),
      cola: emp.defaultCola ?? 0,
      representation: emp.defaultRepresentation ?? 0,
      sss: emp.defaultSss ?? 0,
      philhealth: emp.defaultPhilhealth ?? 0,
      pagibig: emp.defaultPagibig ?? 0,
      taxDeducted: emp.defaultWithholdingTax ?? 0
    }))
  }

  /** Selecting an employee immediately fills their daily rate/deduction
   *  defaults — "Pull from Attendance & Leave" below is then only needed to
   *  fill in Days Worked and the attendance-derived unpaid-leave deduction
   *  for the chosen period. */
  function selectEmployee(employeeId: string) {
    const emp = employees.find((e) => e.id === employeeId)
    setUnpaidLeaveDays(0)
    if (!emp) {
      setForm((f) => ({ ...f, employeeId: '' }))
      return
    }
    applyEmployeeDefaults(emp)
  }

  function pullFromAttendance() {
    if (!form.employeeId || !form.periodStart || !form.periodEnd) {
      toast.error(t('payroll.toast.selectEmployeePeriod'))
      return
    }
    const emp = employees.find((e) => e.id === form.employeeId)
    if (!emp) return
    const summary = getAttendanceSummary(
      { attendance, leaveRequests, leaveTypes },
      form.employeeId,
      form.periodStart,
      form.periodEnd
    )
    const dailyRate = dailyRateOf(emp)
    const unpaidDeduction = Math.round(summary.unpaidLeaveDays * dailyRate * 100) / 100
    applyEmployeeDefaults(emp)
    // Physical attendance only (present + half-days) — paid leave isn't
    // folded in here since attendance and leave-request records don't
    // reliably cross-reference which leave days are paid vs unpaid; the
    // user can adjust Days Worked manually if paid leave should count.
    setForm((f) => ({ ...f, daysWorked: summary.presentDays + summary.halfDays * 0.5 }))
    setUnpaidLeaveDays(summary.unpaidLeaveDays)
    toast.info(
      t('payroll.toast.attendanceSummary', {
        present: summary.presentDays,
        absent: summary.absentDays,
        leave: summary.leaveDays,
        unpaid: summary.unpaidLeaveDays,
        deduction: formatCurrency(unpaidDeduction)
      })
    )
  }

  const isYearEndPeriod = isYearEndMonth(form.periodEnd) || isYearEndMonth(form.periodStart)

  const netPreview = useMemo(() => {
    const emp = employees.find((e) => e.id === form.employeeId)
    const dailyRate = emp ? dailyRateOf(emp) : 0
    const unpaidDeduction = Math.round(unpaidLeaveDays * dailyRate * 100) / 100
    const basicPay = Math.round(form.dailyRate * form.daysWorked * 100) / 100
    const deductions =
      form.sss + form.philhealth + form.pagibig + form.taxDeducted + unpaidDeduction
    // Only November/December entries can actually carry a 13th Month Pay / Cash Gift — this
    // zeroes out any stale figure left over from switching the period back to a regular month.
    const thirteenthMonthPay = isYearEndPeriod ? form.thirteenthMonthPay : 0
    const cashGift = isYearEndPeriod ? form.cashGift : 0
    return {
      basicPay,
      unpaidDeduction,
      deductions,
      thirteenthMonthPay,
      cashGift,
      net:
        basicPay +
        form.cola +
        form.representation +
        form.overtimePay +
        thirteenthMonthPay +
        cashGift -
        deductions
    }
  }, [form, unpaidLeaveDays, employees, isYearEndPeriod])

  /** Standard PH formula: this employee's total Basic Pay earned across every payroll entry
   *  within the period's calendar year (including this one), divided by 12 — dynamic, not a
   *  hardcoded figure. Cash Gift is filled from the council-wide Settings default. Both stay
   *  freely editable afterward for a manual override. */
  function computeYearEndPay() {
    if (!form.employeeId || !form.periodEnd) {
      toast.error(t('payroll.toast.selectEmployeePeriod'))
      return
    }
    const year = form.periodEnd.slice(0, 4)
    const priorBasicTotal = payroll
      .filter(
        (p) =>
          p.employeeId === form.employeeId &&
          p.periodStart.slice(0, 4) === year &&
          p.id !== editTarget?.id
      )
      .reduce((sum, p) => sum + p.basicSalary, 0)
    const basicPay = Math.round(form.dailyRate * form.daysWorked * 100) / 100
    const thirteenthMonthPay = Math.round(((priorBasicTotal + basicPay) / 12) * 100) / 100
    setForm((f) => ({ ...f, thirteenthMonthPay, cashGift: defaultCashGift }))
    toast.info(
      t('payroll.toast.thirteenthMonthComputed', {
        thirteenth: formatCurrency(thirteenthMonthPay),
        cashGift: formatCurrency(defaultCashGift)
      })
    )
  }

  function handleSubmit() {
    if (!form.employeeId) {
      toast.error(t('payroll.toast.selectEmployee'))
      return
    }
    const payload = {
      employeeId: form.employeeId,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      dailyRate: form.dailyRate,
      daysWorked: form.daysWorked,
      basicSalary: netPreview.basicPay,
      overtimePay: form.overtimePay,
      cola: form.cola,
      representation: form.representation,
      thirteenthMonthPay: netPreview.thirteenthMonthPay || undefined,
      cashGift: netPreview.cashGift || undefined,
      sss: form.sss,
      philhealth: form.philhealth,
      pagibig: form.pagibig,
      taxDeducted: form.taxDeducted,
      unpaidLeaveDeduction: netPreview.unpaidDeduction,
      deductions: netPreview.deductions,
      netSalary: netPreview.net
    }
    if (editTarget) {
      updatePayrollEntry(editTarget.id, payload)
      toast.success(t('payroll.toast.entryUpdated'))
    } else {
      addPayrollEntry({
        id: crypto.randomUUID(),
        payrollNumber: `PAY-${Date.now().toString().slice(-6)}`,
        ...payload,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      toast.success(t('payroll.toast.entryCreated'))
    }
    onOpenChange(false)
  }

  return {
    activeEmployees,
    form,
    setForm,
    selectedEmployee,
    selectEmployee,
    unpaidLeaveDays,
    setUnpaidLeaveDays,
    isYearEndPeriod,
    netPreview,
    pullFromAttendance,
    computeYearEndPay,
    handleSubmit
  }
}

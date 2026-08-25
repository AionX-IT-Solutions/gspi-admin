import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/utils'
import { getAttendanceSummary, useHRStore } from '../store/hr.store'
import type { Employee } from '../types/hr.types'
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
  return Math.round((emp.salary / 26) * 100) / 100
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
    sss: 0,
    philhealth: 0,
    pagibig: 0,
    taxDeducted: 0
  }
}

export function useNewPayrollEntryModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const attendance = useHRStore((s) => s.attendance)
  const leaveRequests = useHRStore((s) => s.leaveRequests)
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const addPayrollEntry = useHRStore((s) => s.addPayrollEntry)

  const activeEmployees = useMemo(() => employees.filter((e) => e.isActive), [employees])

  const [form, setForm] = useState(emptyForm())
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === form.employeeId),
    [employees, form.employeeId]
  )
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState(0)

  function resetForm() {
    setForm(emptyForm())
    setUnpaidLeaveDays(0)
  }

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

  const netPreview = useMemo(() => {
    const emp = employees.find((e) => e.id === form.employeeId)
    const dailyRate = emp ? dailyRateOf(emp) : 0
    const unpaidDeduction = Math.round(unpaidLeaveDays * dailyRate * 100) / 100
    const basicPay = Math.round(form.dailyRate * form.daysWorked * 100) / 100
    const deductions =
      form.sss + form.philhealth + form.pagibig + form.taxDeducted + unpaidDeduction
    return {
      basicPay,
      unpaidDeduction,
      deductions,
      net: basicPay + form.cola + form.representation + form.overtimePay - deductions
    }
  }, [form, unpaidLeaveDays, employees])

  function handleSubmit() {
    if (!form.employeeId) {
      toast.error(t('payroll.toast.selectEmployee'))
      return
    }
    addPayrollEntry({
      id: crypto.randomUUID(),
      payrollNumber: `PAY-${Date.now().toString().slice(-6)}`,
      employeeId: form.employeeId,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      dailyRate: form.dailyRate,
      daysWorked: form.daysWorked,
      basicSalary: netPreview.basicPay,
      overtimePay: form.overtimePay,
      cola: form.cola,
      representation: form.representation,
      sss: form.sss,
      philhealth: form.philhealth,
      pagibig: form.pagibig,
      taxDeducted: form.taxDeducted,
      unpaidLeaveDeduction: netPreview.unpaidDeduction,
      deductions: netPreview.deductions,
      netSalary: netPreview.net,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    toast.success(t('payroll.toast.entryCreated'))
    onOpenChange(false)
    resetForm()
  }

  return {
    activeEmployees,
    form,
    setForm,
    selectedEmployee,
    selectEmployee,
    unpaidLeaveDays,
    setUnpaidLeaveDays,
    netPreview,
    pullFromAttendance,
    handleSubmit,
    resetForm
  }
}

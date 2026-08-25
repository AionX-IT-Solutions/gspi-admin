import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLeaveBalance, useHRStore, daysCountBetween } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    employeeId: '',
    leaveTypeId: '',
    startDate: todayIso(),
    endDate: todayIso(),
    halfDay: false,
    reason: ''
  }
}

export function useFileLeaveModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const leaveTypes = useHRStore((s) => s.leaveTypes)
  const leaveRequests = useHRStore((s) => s.leaveRequests)
  const leaveCreditGrants = useHRStore((s) => s.leaveCreditGrants)
  const fileLeaveRequest = useHRStore((s) => s.fileLeaveRequest)
  const activeEmployees = useMemo(() => employees.filter((e) => e.isActive), [employees])
  const [form, setForm] = useState(emptyForm())

  const isHalfDay = form.halfDay && form.startDate === form.endDate
  const previewDays = isHalfDay
    ? 0.5
    : form.startDate && form.endDate && form.endDate >= form.startDate
      ? daysCountBetween(form.startDate, form.endDate)
      : 0

  function handleFile() {
    if (!form.employeeId || !form.leaveTypeId) {
      toast.error(t('leave.toast.validationRequired'))
      return
    }
    if (form.endDate < form.startDate) {
      toast.error(t('leave.toast.endDateInvalid'))
      return
    }

    const leaveType = leaveTypes.find((lt) => lt.id === form.leaveTypeId)
    const year = new Date(form.startDate).getFullYear()
    const balance = getLeaveBalance(
      { leaveTypes, leaveRequests, leaveCreditGrants },
      form.employeeId,
      form.leaveTypeId,
      year
    )
    if (previewDays > balance.creditsRemaining) {
      toast.error(
        t('leave.toast.insufficientBalance', {
          leaveType: leaveType?.name ?? '',
          remaining: balance.creditsRemaining,
          days: previewDays
        })
      )
      return
    }

    fileLeaveRequest({
      employeeId: form.employeeId,
      leaveTypeId: form.leaveTypeId,
      startDate: form.startDate,
      endDate: form.endDate,
      halfDay: isHalfDay,
      reason: form.reason || undefined
    })
    toast.success(t('leave.toast.filed'))
    onOpenChange(false)
    setForm(emptyForm())
  }

  return { activeEmployees, leaveTypes, form, setForm, previewDays, handleFile }
}

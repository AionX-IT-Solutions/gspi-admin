import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import type { AttendanceStatus } from '../types/hr.types'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    employeeId: '',
    date: todayIso(),
    clockIn: '',
    clockOut: '',
    status: 'present' as AttendanceStatus,
    notes: ''
  }
}

export function useManualAttendanceModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const recordAttendanceManual = useHRStore((s) => s.recordAttendanceManual)
  const activeEmployees = employees.filter((e) => e.isActive)
  const [form, setForm] = useState(emptyForm())

  function handleSubmit() {
    if (!form.employeeId) {
      toast.error(t('attendance.toast.selectEmployee'))
      return
    }
    const clockIn = form.clockIn ? `${form.date}T${form.clockIn}:00` : null
    const clockOut = form.clockOut ? `${form.date}T${form.clockOut}:00` : null
    const hoursWorked =
      clockIn && clockOut
        ? Math.max(
            0,
            Math.round(
              ((new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 3600000) * 100
            ) / 100
          )
        : null
    recordAttendanceManual({
      employeeId: form.employeeId,
      date: form.date,
      clockIn,
      clockOut,
      hoursWorked,
      status: form.status,
      notes: form.notes || undefined
    })
    toast.success(t('attendance.toast.recorded'))
    onOpenChange(false)
  }

  function resetForm() {
    setForm(emptyForm())
  }

  return { activeEmployees, form, setForm, handleSubmit, resetForm }
}

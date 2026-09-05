import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { AttendanceRecord, AttendanceStatus } from '../types/hr.types'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/** Local HH:mm for a `<input type="time">` — `getHours`/`getMinutes` read back local wall-clock
 *  time regardless of whether the stored ISO string is a bare local timestamp (manual entries)
 *  or a UTC one with a `Z` suffix (biometric punches), matching what the table column displays. */
function toTimeInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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

function toFormValues(record: AttendanceRecord) {
  return {
    employeeId: record.employeeId,
    date: record.date,
    clockIn: toTimeInputValue(record.clockIn),
    clockOut: toTimeInputValue(record.clockOut),
    status: record.status,
    notes: record.notes ?? ''
  }
}

export function useManualAttendanceModal(
  onOpenChange: (open: boolean) => void,
  editingRecord: AttendanceRecord | null = null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const employees = useHRStore((s) => s.employees)
  const recordAttendanceManual = useHRStore((s) => s.recordAttendanceManual)
  const activeEmployees = employees.filter((e) => e.isActive)
  const [form, setForm] = useState(() =>
    editingRecord ? toFormValues(editingRecord) : emptyForm()
  )

  useEffect(() => {
    setForm(editingRecord ? toFormValues(editingRecord) : emptyForm())
  }, [editingRecord])

  function handleSubmit() {
    if (!hasPermission('manage:attendance')) return
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
    toast.success(t(editingRecord ? 'attendance.toast.updated' : 'attendance.toast.recorded'))
    onOpenChange(false)
  }

  function resetForm() {
    setForm(editingRecord ? toFormValues(editingRecord) : emptyForm())
  }

  return { activeEmployees, form, setForm, handleSubmit, resetForm }
}

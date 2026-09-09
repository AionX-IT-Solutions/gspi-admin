import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  combinedAttendanceStatus,
  computeShiftHoursWorked,
  isAfternoonOnlyArrival,
  isLateClockIn,
  useHRStore
} from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { todayLocalIso } from '@/shared/lib/utils'
import type { AttendanceRecord, AttendanceStatus } from '../types/hr.types'

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
    date: todayLocalIso(),
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
    const hoursWorked = clockIn && clockOut ? computeShiftHoursWorked(clockIn, clockOut) : null
    // Derive status from the times entered — same as the biometric flow — rather than trusting
    // the dropdown on its own, which used to leave a record saying "Late" for an 08:10 clock-in
    // that's well inside the 15-minute grace period, or "Present" for a day that was actually
    // Overtime/Half-day. Skipped for an explicit Absent/Leave pick, since those describe a day
    // with no real clock times rather than something derivable from them.
    const isDerivableStatus = form.status !== 'absent' && form.status !== 'leave'
    const status = !isDerivableStatus
      ? form.status
      : clockIn && clockOut && hoursWorked != null
        ? combinedAttendanceStatus(clockIn, hoursWorked, clockOut)
        : clockIn
          ? isAfternoonOnlyArrival(clockIn)
            ? 'half-day'
            : isLateClockIn(clockIn)
              ? 'late'
              : 'present'
          : form.status
    recordAttendanceManual({
      employeeId: form.employeeId,
      date: form.date,
      clockIn,
      clockOut,
      hoursWorked,
      status,
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

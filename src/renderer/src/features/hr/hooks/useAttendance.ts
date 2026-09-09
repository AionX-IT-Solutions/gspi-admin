import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { overtimeHoursPastShiftEnd, useHRStore } from '../store/hr.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { useTranslation } from 'react-i18next'
import { daysAgoLocalIso, todayLocalIso } from '@/shared/lib/utils'
import type { AttendanceRecord } from '../types/hr.types'

export interface AttendanceRow extends AttendanceRecord {
  id: string
  employeeName: string
  position: string
}

export function useAttendance() {
  const { t } = useTranslation()
  const toast = useToast()
  const loading = useSkeletonLoading()
  const employees = useHRStore((s) => s.employees)
  const records = useHRStore((s) => s.attendance)
  const deleteAttendanceRecord = useHRStore((s) => s.deleteAttendanceRecord)
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:attendance')

  const [dateFrom, setDateFrom] = useState(daysAgoLocalIso(13))
  const [dateTo, setDateTo] = useState(todayLocalIso())
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [showDialog, setShowDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRow | null>(null)

  const activeEmployees = employees.filter((e) => e.isActive)

  const rows: AttendanceRow[] = useMemo(() => {
    return records
      .filter((r) => r.date >= dateFrom && r.date <= dateTo)
      .filter((r) => employeeFilter === 'all' || r.employeeId === employeeFilter)
      .map((r) => {
        const emp = employees.find((e) => e.id === r.employeeId)
        return { ...r, employeeName: emp?.fullName ?? 'Unknown', position: emp?.position ?? '' }
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [records, employees, dateFrom, dateTo, employeeFilter])

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === 'present').length
    const late = rows.filter((r) => r.status === 'late').length
    const leave = rows.filter((r) => r.status === 'leave').length
    const absent = rows.filter((r) => r.status === 'absent').length
    const overtime = rows.filter((r) => r.status === 'overtime').length
    // Summed straight from each record's clock-out vs the 5:00 PM shift end, not from raw
    // hoursWorked minus 8 — a Half Day arrival (see isAfternoonOnlyArrival in hr.store.ts) who
    // still works late has a `hoursWorked` that's already net of the lunch break and the capped
    // regular portion, so subtracting 8 from it again would under- or over-count real overtime.
    const overtimeHours =
      Math.round(
        rows.reduce((sum, r) => sum + (r.clockOut ? overtimeHoursPastShiftEnd(r.clockOut) : 0), 0) *
          100
      ) / 100
    return { total: rows.length, present, late, leave, absent, overtime, overtimeHours }
  }, [rows])

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteAttendanceRecord(deleteTarget.id)
    toast.success(t('attendance.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    activeEmployees,
    rows,
    summary,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    employeeFilter,
    setEmployeeFilter,
    showDialog,
    setShowDialog,
    canManage,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}

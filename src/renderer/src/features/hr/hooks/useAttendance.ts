import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useHRStore } from '../store/hr.store'
import { useAppStore } from '@/app/store/app.store'
import { useToast } from '@/app/hooks/useToast'
import { useTranslation } from 'react-i18next'
import type { AttendanceRecord } from '../types/hr.types'

function daysAgoIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

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
  const isSuperAdmin = useAppStore((s) => s.currentUser?.role === 'super_admin')

  const [dateFrom, setDateFrom] = useState(daysAgoIso(13))
  const [dateTo, setDateTo] = useState(todayIso())
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
    const overtimeHours =
      Math.round(rows.reduce((sum, r) => sum + Math.max(0, (r.hoursWorked ?? 0) - 8), 0) * 100) /
      100
    return { total: rows.length, present, late, leave, absent, overtime, overtimeHours }
  }, [rows])

  function handleConfirmDelete() {
    if (!deleteTarget) return
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
    isSuperAdmin,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}

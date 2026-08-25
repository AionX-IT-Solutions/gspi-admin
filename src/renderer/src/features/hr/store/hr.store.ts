import { create } from 'zustand'
import { doc, writeBatch } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/shared/lib/firebase'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure,
  stripUndefined
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { deleteFile } from '@/shared/lib/storageSync'
import type {
  AttendanceRecord,
  AttendanceStatus,
  BiometricEnrollment,
  BiometricMethod,
  Employee,
  EmployeeDocument,
  LeaveApprovalTouch,
  LeaveCreditGrant,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
  PayrollEntry,
  PayrollStatus
} from '../types/hr.types'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function datesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const cursor = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  while (cursor.getTime() <= end.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

export function daysCountBetween(startDate: string, endDate: string) {
  return datesInRange(startDate, endDate).length
}

export function hoursBetween(clockIn: string, clockOut: string) {
  const hours = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60)
  return Math.max(0, Math.round(hours * 100) / 100)
}

const OVERTIME_THRESHOLD_HOURS = 8
const COMP_TIME_MIN_OVERTIME_HOURS = 4
const CREDIT_EXPIRY_MONTHS = 3
export const COMP_TIME_LEAVE_TYPE_ID = 'lt-comp-time'

// GSPI official workday start — zero grace period, any clock-in after this instant is Late.
const WORK_START_HOUR = 8
const WORK_START_MINUTE = 0

export function isLateClockIn(clockInIso: string): boolean {
  const clockIn = new Date(clockInIso)
  const workStart = new Date(clockIn)
  workStart.setHours(WORK_START_HOUR, WORK_START_MINUTE, 0, 0)
  return clockIn.getTime() > workStart.getTime()
}

export function statusForHoursWorked(hoursWorked: number): AttendanceStatus {
  if (hoursWorked < 4) return 'half-day'
  if (hoursWorked > OVERTIME_THRESHOLD_HOURS) return 'overtime'
  return 'present'
}

/**
 * Combines hours-based status with lateness. Half-day (worked <4h) always wins since it's the
 * more severe attendance issue; otherwise Late takes priority over Present/Overtime per GSPI policy.
 */
export function combinedAttendanceStatus(clockIn: string, hoursWorked: number): AttendanceStatus {
  const hoursStatus = statusForHoursWorked(hoursWorked)
  if (hoursStatus === 'half-day') return 'half-day'
  return isLateClockIn(clockIn) ? 'late' : hoursStatus
}

/**
 * GSPI HR policy: Compensatory Time Off is earned in flat brackets, not pro-rated per minute —
 * under 4h overtime in a day earns nothing, 4h up to (but under) 8h earns a half day, 8h or more
 * earns a full day. So 4h30m still only earns 0.5 day, same as exactly 4h.
 */
export function overtimeHoursToCompDays(overtimeHours: number): number {
  if (overtimeHours < COMP_TIME_MIN_OVERTIME_HOURS) return 0
  if (overtimeHours < OVERTIME_THRESHOLD_HOURS) return 0.5
  return 1
}

function addMonthsIso(dateIso: string, months: number): string {
  const d = new Date(dateIso)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString()
}

interface ClockResult {
  ok: boolean
  message: string
  employeeName?: string
}

interface HRState {
  employees: Employee[]
  attendance: AttendanceRecord[]
  enrollments: BiometricEnrollment[]
  leaveTypes: LeaveType[]
  leaveRequests: LeaveRequest[]
  leaveCreditGrants: LeaveCreditGrant[]
  payroll: PayrollEntry[]
  employeeDocuments: EmployeeDocument[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  addEmployeeDocument: (document: EmployeeDocument) => void
  /** Deletes both the metadata doc and the underlying Storage file. */
  deleteEmployeeDocument: (id: string) => void

  enrollBiometric: (employeeId: string, method: BiometricMethod) => void
  setEnrollmentActive: (employeeId: string, isActive: boolean) => void
  clockBiometric: (
    employeeId: string,
    method: BiometricMethod,
    direction: 'in' | 'out'
  ) => ClockResult
  recordAttendanceManual: (record: Omit<AttendanceRecord, 'id'>) => void
  deleteAttendanceRecord: (id: string) => void

  /** Grants a Compensatory Time Off credit (in days, converted 1hr OT = 1/8 day) that expires 3 months from now. */
  grantOvertimeCredit: (employeeId: string, overtimeHours: number) => void

  fileLeaveRequest: (
    request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'daysCount'>
  ) => void
  decideLeaveRequest: (id: string, status: LeaveRequestStatus, notes?: string) => void
  /** Reverts an approved request back to rejected, undoing any Attendance records the approval touched. */
  revertLeaveApproval: (id: string, reason?: string) => void
  /** Deletes a leave request outright, undoing any Attendance records an approval had touched. */
  deleteLeaveRequest: (id: string) => void
  /** Admin-settable annual credit pool for a leave type. Compensatory Time Off is grant-based (from overtime) and can't be set this way. */
  updateLeaveTypeCredits: (leaveTypeId: string, defaultAnnualCredits: number) => void

  addPayrollEntry: (entry: PayrollEntry) => void
  setPayrollStatus: (id: string, status: PayrollStatus) => void
}

export const useHRStore = create<HRState>()((set, get) => ({
  employees: [],
  attendance: [],
  enrollments: [],
  leaveTypes: [],
  leaveRequests: [],
  leaveCreditGrants: [],
  payroll: [],
  employeeDocuments: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [
        employees,
        attendance,
        enrollments,
        leaveTypes,
        leaveRequests,
        leaveCreditGrants,
        payroll,
        employeeDocuments
      ] = await Promise.all([
        hydrateCollection<Employee>('employees'),
        hydrateCollection<AttendanceRecord>('attendance'),
        hydrateCollection<BiometricEnrollment>('biometricEnrollments'),
        hydrateCollection<LeaveType>('leaveTypes'),
        hydrateCollection<LeaveRequest>('leaveRequests'),
        hydrateCollection<LeaveCreditGrant>('leaveCreditGrants'),
        hydrateCollection<PayrollEntry>('payroll'),
        hydrateCollection<EmployeeDocument>('employeeDocuments')
      ])

      // Compensatory Time Off is earned automatically from overtime — make sure the leave
      // type it draws against exists, seeding it once if this is the first time it's needed.
      let resolvedLeaveTypes = leaveTypes
      if (!leaveTypes.some((lt) => lt.id === COMP_TIME_LEAVE_TYPE_ID)) {
        const compTimeType: LeaveType = {
          id: COMP_TIME_LEAVE_TYPE_ID,
          name: 'Compensatory Time Off',
          defaultAnnualCredits: 0,
          isPaid: true
        }
        resolvedLeaveTypes = [...leaveTypes, compTimeType]
        persist('leaveTypes', compTimeType.id, compTimeType)
      }

      set({
        employees,
        attendance,
        enrollments,
        leaveTypes: resolvedLeaveTypes,
        leaveRequests,
        leaveCreditGrants,
        payroll,
        employeeDocuments,
        hydrated: true
      })
    } catch (err) {
      reportHydrateFailure('[hr.store] Failed to hydrate', err)
    }
  },

  addEmployee: (employee) => {
    set((s) => ({ employees: [employee, ...s.employees] }))
    persist('employees', employee.id, employee)
    appendAuditLog({
      action: 'employee_created',
      actorName: actorName(),
      entityType: 'employee',
      summary: `Employee record created for ${employee.fullName}.`
    })
  },
  updateEmployee: (id, patch) => {
    set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
    const emp = get().employees.find((e) => e.id === id)
    if (emp) persist('employees', id, emp)
    appendAuditLog({
      action: 'employee_updated',
      actorName: actorName(),
      entityType: 'employee',
      summary: `Employee record updated for ${emp?.fullName ?? id}.`
    })
  },
  deleteEmployee: (id) => {
    const emp = get().employees.find((e) => e.id === id)
    const docs = get().employeeDocuments.filter((d) => d.employeeId === id)
    set((s) => ({
      employees: s.employees.filter((e) => e.id !== id),
      employeeDocuments: s.employeeDocuments.filter((d) => d.employeeId !== id)
    }))
    deleteDocById('employees', id)
    if (emp?.photoStoragePath) deleteFile(emp.photoStoragePath)
    for (const document of docs) {
      deleteDocById('employeeDocuments', document.id)
      deleteFile(document.storagePath)
    }
    appendAuditLog({
      action: 'employee_deleted',
      actorName: actorName(),
      entityType: 'employee',
      summary: `Employee record deleted for ${emp?.fullName ?? id}.`
    })
  },

  addEmployeeDocument: (document) => {
    set((s) => ({ employeeDocuments: [document, ...s.employeeDocuments] }))
    persist('employeeDocuments', document.id, document)
    const emp = get().employees.find((e) => e.id === document.employeeId)
    appendAuditLog({
      action: 'employee_document_added',
      actorName: actorName(),
      entityType: 'employee_document',
      summary: `${document.type} "${document.name}" uploaded for ${emp?.fullName ?? 'employee'}.`
    })
  },
  deleteEmployeeDocument: (id) => {
    const document = get().employeeDocuments.find((d) => d.id === id)
    set((s) => ({ employeeDocuments: s.employeeDocuments.filter((d) => d.id !== id) }))
    deleteDocById('employeeDocuments', id)
    if (document) deleteFile(document.storagePath)
    const emp = document ? get().employees.find((e) => e.id === document.employeeId) : undefined
    appendAuditLog({
      action: 'employee_document_deleted',
      actorName: actorName(),
      entityType: 'employee_document',
      summary: `${document?.type ?? 'Document'} "${document?.name ?? id}" deleted for ${emp?.fullName ?? 'employee'}.`
    })
  },

  enrollBiometric: (employeeId, method) => {
    const mockTemplateId = `MOCK-${method.toUpperCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    set((s) => {
      const existing = s.enrollments.find((e) => e.employeeId === employeeId)
      if (existing) {
        return {
          enrollments: s.enrollments.map((e) =>
            e.employeeId === employeeId
              ? {
                  ...e,
                  method,
                  mockTemplateId,
                  isActive: true,
                  enrolledAt: new Date().toISOString()
                }
              : e
          )
        }
      }
      return {
        enrollments: [
          ...s.enrollments,
          {
            id: crypto.randomUUID(),
            employeeId,
            method,
            mockTemplateId,
            isActive: true,
            enrolledAt: new Date().toISOString()
          }
        ]
      }
    })
    const enrollment = get().enrollments.find((e) => e.employeeId === employeeId)
    if (enrollment) persist('biometricEnrollments', enrollment.id, enrollment)
  },

  setEnrollmentActive: (employeeId, isActive) => {
    set((s) => ({
      enrollments: s.enrollments.map((e) => (e.employeeId === employeeId ? { ...e, isActive } : e))
    }))
    const enrollment = get().enrollments.find((e) => e.employeeId === employeeId)
    if (enrollment) persist('biometricEnrollments', enrollment.id, enrollment)
  },

  clockBiometric: (employeeId, method, direction) => {
    const state = get()
    const employee = state.employees.find((e) => e.id === employeeId)
    if (!employee) return { ok: false, message: 'Employee not found' }

    const enrollment = state.enrollments.find((e) => e.employeeId === employeeId && e.isActive)
    if (!enrollment)
      return { ok: false, message: `${employee.fullName} is not enrolled for biometric attendance` }

    const today = todayIso()
    const existing = state.attendance.find((a) => a.employeeId === employeeId && a.date === today)

    if (existing?.status === 'leave') {
      return { ok: false, message: `${employee.fullName} is on approved leave today` }
    }

    if (direction === 'in') {
      if (existing?.clockIn)
        return { ok: false, message: `${employee.fullName} already clocked in today` }
      const clockIn = new Date().toISOString()
      const clockInStatus: AttendanceStatus = isLateClockIn(clockIn) ? 'late' : 'present'
      const record: AttendanceRecord = existing
        ? { ...existing, clockIn, status: clockInStatus }
        : {
            id: crypto.randomUUID(),
            employeeId,
            date: today,
            clockIn,
            clockOut: null,
            hoursWorked: null,
            status: clockInStatus
          }
      set((s) => ({
        attendance: existing
          ? s.attendance.map((a) => (a.id === existing.id ? record : a))
          : [...s.attendance, record]
      }))
      persist('attendance', record.id, record)
      appendAuditLog({
        action: 'attendance_clocked',
        actorName: actorName(),
        entityType: 'attendance',
        summary: `${employee.fullName} clocked in via ${method} recognition.`
      })
      return {
        ok: true,
        message: `${employee.fullName} clocked in successfully.`,
        employeeName: employee.fullName
      }
    }

    if (!existing?.clockIn)
      return { ok: false, message: `${employee.fullName} has not clocked in yet today` }
    if (existing.clockOut)
      return { ok: false, message: `${employee.fullName} already clocked out today` }
    const clockOut = new Date().toISOString()
    const hoursWorked = hoursBetween(existing.clockIn, clockOut)
    const status = combinedAttendanceStatus(existing.clockIn, hoursWorked)
    const record: AttendanceRecord = { ...existing, clockOut, hoursWorked, status }
    set((s) => ({
      attendance: s.attendance.map((a) => (a.id === existing.id ? record : a))
    }))
    persist('attendance', record.id, record)
    if (statusForHoursWorked(hoursWorked) === 'overtime') {
      get().grantOvertimeCredit(employeeId, hoursWorked - OVERTIME_THRESHOLD_HOURS)
    }
    appendAuditLog({
      action: 'attendance_clocked',
      actorName: actorName(),
      entityType: 'attendance',
      summary: `${employee.fullName} clocked out via ${method} recognition.`
    })
    return {
      ok: true,
      message: `${employee.fullName} clocked out successfully.`,
      employeeName: employee.fullName
    }
  },

  grantOvertimeCredit: (employeeId, overtimeHours) => {
    const days = overtimeHoursToCompDays(overtimeHours)
    if (days <= 0) return
    const grantedAt = new Date().toISOString()
    const grant: LeaveCreditGrant = {
      id: crypto.randomUUID(),
      employeeId,
      leaveTypeId: COMP_TIME_LEAVE_TYPE_ID,
      days,
      grantedAt,
      expiresAt: addMonthsIso(grantedAt, CREDIT_EXPIRY_MONTHS),
      source: 'overtime'
    }
    set((s) => ({ leaveCreditGrants: [...s.leaveCreditGrants, grant] }))
    persist('leaveCreditGrants', grant.id, grant)
    const employee = get().employees.find((e) => e.id === employeeId)
    appendAuditLog({
      action: 'comp_time_granted',
      actorName: actorName(),
      entityType: 'leave_credit_grant',
      summary: `${employee?.fullName ?? 'Employee'} earned ${days} day(s) of Compensatory Time Off from ${overtimeHours}h overtime (expires ${grant.expiresAt.slice(0, 10)}).`
    })
  },

  recordAttendanceManual: (record) => {
    const existing = get().attendance.find(
      (a) => a.employeeId === record.employeeId && a.date === record.date
    )
    const saved: AttendanceRecord = existing
      ? { ...existing, ...record }
      : { ...record, id: crypto.randomUUID() }
    set((s) => ({
      attendance: existing
        ? s.attendance.map((a) => (a.id === existing.id ? saved : a))
        : [...s.attendance, saved]
    }))
    persist('attendance', saved.id, saved)
    if (
      saved.status === 'overtime' &&
      saved.hoursWorked &&
      saved.hoursWorked > OVERTIME_THRESHOLD_HOURS
    ) {
      get().grantOvertimeCredit(saved.employeeId, saved.hoursWorked - OVERTIME_THRESHOLD_HOURS)
    }
  },

  deleteAttendanceRecord: (id) => {
    const record = get().attendance.find((a) => a.id === id)
    set((s) => ({ attendance: s.attendance.filter((a) => a.id !== id) }))
    deleteDocById('attendance', id)
    const emp = record ? get().employees.find((e) => e.id === record.employeeId) : undefined
    appendAuditLog({
      action: 'attendance_deleted',
      actorName: actorName(),
      entityType: 'attendance',
      summary: `Attendance record for ${emp?.fullName ?? 'employee'} on ${record?.date ?? id} deleted.`
    })
  },

  fileLeaveRequest: (request) => {
    const isHalfDay = !!request.halfDay && request.startDate === request.endDate
    const saved: LeaveRequest = {
      ...request,
      halfDay: isHalfDay,
      id: crypto.randomUUID(),
      daysCount: isHalfDay ? 0.5 : daysCountBetween(request.startDate, request.endDate),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    set((s) => ({ leaveRequests: [saved, ...s.leaveRequests] }))
    persist('leaveRequests', saved.id, saved)
    const emp = get().employees.find((e) => e.id === request.employeeId)
    appendAuditLog({
      action: 'leave_request_created',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave request filed for ${emp?.fullName ?? 'employee'} (${request.startDate} to ${request.endDate}).`
    })
  },

  decideLeaveRequest: (id, status, notes) => {
    const state = get()
    const target = state.leaveRequests.find((r) => r.id === id)
    if (!target || target.status !== 'pending') return

    let attendance = state.attendance
    let touches: LeaveApprovalTouch[] | undefined

    if (status === 'approved') {
      const leaveType = state.leaveTypes.find((lt) => lt.id === target.leaveTypeId)
      const dates = datesInRange(target.startDate, target.endDate)
      const leaveStatus = target.halfDay ? ('half-day' as const) : ('leave' as const)
      const notesText = `Approved leave: ${leaveType?.name ?? 'Leave'}${target.halfDay ? ' (Half day)' : ''}`

      touches = []
      for (const date of dates) {
        const existingIdx = attendance.findIndex(
          (a) => a.employeeId === target.employeeId && a.date === date
        )
        if (existingIdx >= 0) {
          const prior = attendance[existingIdx]
          attendance = attendance.map((a, i) =>
            i === existingIdx ? { ...a, status: leaveStatus, notes: notesText } : a
          )
          touches.push({
            attendanceId: prior.id,
            wasNew: false,
            priorStatus: prior.status,
            priorNotes: prior.notes
          })
        } else {
          const created: AttendanceRecord = {
            id: crypto.randomUUID(),
            employeeId: target.employeeId,
            date,
            clockIn: null,
            clockOut: null,
            hoursWorked: null,
            status: leaveStatus,
            notes: notesText
          }
          attendance = [...attendance, created]
          touches.push({ attendanceId: created.id, wasNew: true })
        }
      }
    }

    const updatedRequest: LeaveRequest = {
      ...target,
      status,
      decisionNotes: notes,
      approvalTouches: touches
    }
    const touchedIds = new Set((touches ?? []).map((t) => t.attendanceId))
    const touchedAttendance = attendance.filter((a) => touchedIds.has(a.id))

    set({
      leaveRequests: state.leaveRequests.map((r) => (r.id === id ? updatedRequest : r)),
      attendance
    })

    const onWriteFailure = (err: unknown) => {
      const code = (err as { code?: string })?.code
      if (code === 'permission-denied') return
      console.error('[hr.store] Failed to save leave decision:', err)
      toast.error('Failed to save changes to the server — check your connection.')
    }
    try {
      const batch = writeBatch(db)
      batch.set(doc(db, 'leaveRequests', updatedRequest.id), stripUndefined(updatedRequest))
      for (const record of touchedAttendance) {
        batch.set(doc(db, 'attendance', record.id), stripUndefined(record))
      }
      batch.commit().catch(onWriteFailure)
    } catch (err) {
      onWriteFailure(err)
    }

    const emp = state.employees.find((e) => e.id === target.employeeId)
    appendAuditLog({
      action: 'leave_request_status_updated',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave request for ${emp?.fullName ?? 'employee'} marked as ${status}.`
    })
  },

  revertLeaveApproval: (id, reason) => {
    const state = get()
    const target = state.leaveRequests.find((r) => r.id === id)
    if (!target || target.status !== 'approved') return

    const touches = target.approvalTouches ?? []
    let attendance = state.attendance
    const removedIds: string[] = []
    const touchedIds: string[] = []

    for (const touch of touches) {
      if (touch.wasNew) {
        attendance = attendance.filter((a) => a.id !== touch.attendanceId)
        removedIds.push(touch.attendanceId)
      } else {
        attendance = attendance.map((a) =>
          a.id === touch.attendanceId
            ? { ...a, status: touch.priorStatus ?? 'present', notes: touch.priorNotes }
            : a
        )
        touchedIds.push(touch.attendanceId)
      }
    }
    const restoredRecords = attendance.filter((a) => touchedIds.includes(a.id))

    const updatedRequest: LeaveRequest = {
      ...target,
      status: 'rejected',
      decisionNotes: reason?.trim() || 'Approval reverted',
      approvalTouches: undefined
    }
    set({
      leaveRequests: state.leaveRequests.map((r) => (r.id === id ? updatedRequest : r)),
      attendance
    })

    const onWriteFailure = (err: unknown) => {
      const code = (err as { code?: string })?.code
      if (code === 'permission-denied') return
      console.error('[hr.store] Failed to save leave revert:', err)
      toast.error('Failed to save changes to the server — check your connection.')
    }
    try {
      const batch = writeBatch(db)
      batch.set(doc(db, 'leaveRequests', id), stripUndefined(updatedRequest))
      for (const record of restoredRecords)
        batch.set(doc(db, 'attendance', record.id), stripUndefined(record))
      for (const removedId of removedIds) batch.delete(doc(db, 'attendance', removedId))
      batch.commit().catch(onWriteFailure)
    } catch (err) {
      onWriteFailure(err)
    }

    const emp = state.employees.find((e) => e.id === target.employeeId)
    appendAuditLog({
      action: 'leave_request_reverted',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave approval reverted to rejected for ${emp?.fullName ?? 'employee'} (${target.startDate} to ${target.endDate}).`
    })
  },

  deleteLeaveRequest: (id) => {
    const state = get()
    const target = state.leaveRequests.find((r) => r.id === id)
    if (!target) return

    const touches = target.status === 'approved' ? (target.approvalTouches ?? []) : []
    let attendance = state.attendance
    const removedIds: string[] = []
    const touchedIds: string[] = []

    for (const touch of touches) {
      if (touch.wasNew) {
        attendance = attendance.filter((a) => a.id !== touch.attendanceId)
        removedIds.push(touch.attendanceId)
      } else {
        attendance = attendance.map((a) =>
          a.id === touch.attendanceId
            ? { ...a, status: touch.priorStatus ?? 'present', notes: touch.priorNotes }
            : a
        )
        touchedIds.push(touch.attendanceId)
      }
    }
    const restoredRecords = attendance.filter((a) => touchedIds.includes(a.id))

    set({ leaveRequests: state.leaveRequests.filter((r) => r.id !== id), attendance })

    deleteDocById('leaveRequests', id)
    for (const record of restoredRecords) persist('attendance', record.id, record)
    for (const removedId of removedIds) deleteDocById('attendance', removedId)

    const emp = state.employees.find((e) => e.id === target.employeeId)
    appendAuditLog({
      action: 'leave_request_deleted',
      actorName: actorName(),
      entityType: 'leave_request',
      summary: `Leave request for ${emp?.fullName ?? 'employee'} (${target.startDate} to ${target.endDate}) deleted.`
    })
  },

  updateLeaveTypeCredits: (leaveTypeId, defaultAnnualCredits) => {
    if (leaveTypeId === COMP_TIME_LEAVE_TYPE_ID) return
    set((s) => ({
      leaveTypes: s.leaveTypes.map((lt) =>
        lt.id === leaveTypeId ? { ...lt, defaultAnnualCredits } : lt
      )
    }))
    const leaveType = get().leaveTypes.find((lt) => lt.id === leaveTypeId)
    if (leaveType) persist('leaveTypes', leaveTypeId, leaveType)
    appendAuditLog({
      action: 'leave_type_credits_updated',
      actorName: actorName(),
      entityType: 'leave_type',
      summary: `Annual credits for "${leaveType?.name ?? leaveTypeId}" set to ${defaultAnnualCredits}.`
    })
  },

  addPayrollEntry: (entry) => {
    set((s) => ({ payroll: [entry, ...s.payroll] }))
    persist('payroll', entry.id, entry)
    const emp = get().employees.find((e) => e.id === entry.employeeId)
    appendAuditLog({
      action: 'payroll_created',
      actorName: actorName(),
      entityType: 'payroll',
      summary: `Payroll entry ${entry.payrollNumber} created for ${emp?.fullName ?? 'employee'}.`
    })
  },
  setPayrollStatus: (id, status) => {
    set((s) => ({ payroll: s.payroll.map((p) => (p.id === id ? { ...p, status } : p)) }))
    const entry = get().payroll.find((p) => p.id === id)
    if (entry) persist('payroll', id, entry)
    appendAuditLog({
      action: 'payroll_status_updated',
      actorName: actorName(),
      entityType: 'payroll',
      summary: `Payroll entry ${entry?.payrollNumber ?? id} marked as ${status}.`
    })
  }
}))

// ─── Derived selectors (pure functions over store state) ─────────────────────

export function getLeaveBalance(
  state: Pick<HRState, 'leaveTypes' | 'leaveRequests' | 'leaveCreditGrants'>,
  employeeId: string,
  leaveTypeId: string,
  year: number
) {
  const leaveType = state.leaveTypes.find((lt) => lt.id === leaveTypeId)
  const grants = state.leaveCreditGrants.filter(
    (g) => g.employeeId === employeeId && g.leaveTypeId === leaveTypeId
  )

  // Grant-based leave types (currently just Compensatory Time Off) don't draw from an annual
  // pool — each batch of credit carries its own 3-month expiration from when it was earned, so
  // usage isn't scoped to a calendar year the way ordinary leave types are.
  if (grants.length > 0) {
    const now = new Date().toISOString()
    const creditsTotal = grants
      .filter((g) => g.expiresAt >= now)
      .reduce((sum, g) => sum + g.days, 0)
    const creditsUsed = state.leaveRequests
      .filter(
        (r) =>
          r.employeeId === employeeId && r.leaveTypeId === leaveTypeId && r.status === 'approved'
      )
      .reduce((sum, r) => sum + r.daysCount, 0)
    return { creditsTotal, creditsUsed, creditsRemaining: creditsTotal - creditsUsed }
  }

  const creditsUsed = state.leaveRequests
    .filter(
      (r) =>
        r.employeeId === employeeId &&
        r.leaveTypeId === leaveTypeId &&
        r.status === 'approved' &&
        new Date(r.startDate).getFullYear() === year
    )
    .reduce((sum, r) => sum + r.daysCount, 0)
  return {
    creditsTotal: leaveType?.defaultAnnualCredits ?? 0,
    creditsUsed,
    creditsRemaining: (leaveType?.defaultAnnualCredits ?? 0) - creditsUsed
  }
}

export function getAttendanceSummary(
  state: Pick<HRState, 'attendance' | 'leaveRequests' | 'leaveTypes'>,
  employeeId: string,
  periodStart: string,
  periodEnd: string
) {
  const records = state.attendance.filter(
    (a) => a.employeeId === employeeId && a.date >= periodStart && a.date <= periodEnd
  )
  const presentDays = records.filter((r) => r.status === 'present').length
  const absentDays = records.filter((r) => r.status === 'absent').length
  const leaveDays = records.filter((r) => r.status === 'leave').length
  const halfDays = records.filter((r) => r.status === 'half-day').length
  const overtimeDays = records.filter((r) => r.status === 'overtime').length
  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0)
  const overtimeHours = records
    .filter((r) => r.status === 'overtime')
    .reduce((sum, r) => sum + Math.max(0, (r.hoursWorked ?? 0) - OVERTIME_THRESHOLD_HOURS), 0)

  const unpaidLeaveDays = state.leaveRequests
    .filter((r) => r.employeeId === employeeId && r.status === 'approved')
    .filter((r) => {
      const leaveType = state.leaveTypes.find((lt) => lt.id === r.leaveTypeId)
      return leaveType && !leaveType.isPaid && r.startDate <= periodEnd && r.endDate >= periodStart
    })
    .reduce((sum, r) => sum + r.daysCount, 0)

  return {
    presentDays,
    absentDays,
    leaveDays,
    halfDays,
    overtimeDays,
    overtimeHours,
    totalHours,
    unpaidLeaveDays
  }
}

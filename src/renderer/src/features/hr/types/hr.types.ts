export interface Employee {
  id: string
  employeeNumber: string
  fullName: string
  position: string
  department: string
  branch: string
  email: string
  phone: string
  hireDate: string
  salary: number
  /** Id of this employee's direct supervisor, for the Organizational Chart. Unset = top of the chart. */
  managerId?: string
  /** Firebase Auth uid of the linked login account (the `users/{uid}` doc id, shared by this
   *  desktop app and gspi-app), for tying an employee's HR record to their own account. Unset
   *  = no login account linked to this employee yet. At most one employee should reference a
   *  given uid — enforced client-side by the picker in EmployeeFormModal, not by Firestore rules. */
  userId?: string
  defaultCola: number
  defaultRepresentation: number
  defaultSss: number
  defaultPhilhealth: number
  defaultPagibig: number
  defaultWithholdingTax: number
  isActive: boolean
  avatarColor: string
  photoUrl?: string
  /** Storage path of `photoUrl`, kept so the previous photo can be deleted when it's replaced. */
  photoStoragePath?: string
}

export type EmployeeDocumentType = 'resume' | 'transcript' | 'certification' | 'other'

export interface EmployeeDocument {
  id: string
  employeeId: string
  type: EmployeeDocumentType
  /** User-given label, e.g. the original filename or "TESDA NC II Certificate". */
  name: string
  url: string
  /** Storage path, kept so the file can be deleted alongside its metadata doc. */
  storagePath: string
  uploadedAt: string
  uploadedBy: string
}

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half-day' | 'overtime' | 'late'

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  hoursWorked: number | null
  status: AttendanceStatus
  notes?: string
}

export type BiometricMethod = 'fingerprint' | 'face' | 'both'

export interface BiometricEnrollment {
  id: string
  employeeId: string
  method: BiometricMethod
  mockTemplateId: string
  isActive: boolean
  enrolledAt: string
}

export interface LeaveType {
  id: string
  name: string
  defaultAnnualCredits: number
  isPaid: boolean
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

/** Records how approving a leave request touched an Attendance record, so the change can be
 *  fully undone if the approval is later reverted or the request is deleted. */
export interface LeaveApprovalTouch {
  attendanceId: string
  /** True if the record didn't exist before approval and should be deleted (not restored) on undo. */
  wasNew: boolean
  priorStatus?: AttendanceStatus
  priorNotes?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  daysCount: number
  /** Only meaningful when startDate === endDate — lets a single day be filed as 0.5 day instead of a full day. */
  halfDay?: boolean
  reason?: string
  status: LeaveRequestStatus
  decisionNotes?: string
  createdAt: string
  /** Only present while status is 'approved' — lets a revert/delete restore the touched Attendance records. */
  approvalTouches?: LeaveApprovalTouch[]
}

export interface LeaveBalance {
  employeeId: string
  leaveTypeId: string
  year: number
  creditsTotal: number
  creditsUsed: number
}

/**
 * A discrete batch of leave credit (currently only earned from overtime, 1 hour OT = 1/8 day of
 * Compensatory Time Off), expiring 3 months after it's granted — independent of the calendar-year
 * credit pool that ordinary leave types use.
 */
export interface LeaveCreditGrant {
  id: string
  employeeId: string
  leaveTypeId: string
  days: number
  grantedAt: string
  expiresAt: string
  source: 'overtime'
}

export type PayrollStatus = 'pending' | 'approved' | 'paid'

export interface PayrollEntry {
  id: string
  payrollNumber: string
  employeeId: string
  periodStart: string
  periodEnd: string
  /** Daily rate used for this entry (Monthly Salary ÷ 26), kept alongside
   *  `basicSalary` so a payslip can show how the basic pay total was
   *  derived, not just the final figure. */
  dailyRate: number
  daysWorked: number
  /** Basic pay for this period — `dailyRate * daysWorked`, computed at
   *  entry-creation time (see useNewPayrollEntryModal's netPreview). */
  basicSalary: number
  overtimePay: number
  cola: number
  representation: number
  sss: number
  philhealth: number
  pagibig: number
  taxDeducted: number
  unpaidLeaveDeduction: number
  deductions: number
  netSalary: number
  status: PayrollStatus
  createdAt: string
}

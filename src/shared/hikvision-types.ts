// Shared types for the Hikvision ISAPI face-recognition terminal integration (e.g. DS-K1T321MFWX).
// Used by both the main process (device I/O) and the renderer (config UI, live event display).

export interface HikvisionDeviceConfigInput {
  host: string
  port: number
  useHttps: boolean
  username: string
  /** Only sent when the user is setting/changing the password. Omit/empty to keep the stored one. */
  password?: string
}

/** What the renderer is allowed to see — never echoes the stored password back. */
export interface HikvisionDeviceConfigSummary {
  host: string
  port: number
  useHttps: boolean
  username: string
  hasPassword: boolean
}

export type HikvisionConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface HikvisionStatus {
  state: HikvisionConnectionState
  deviceModel?: string
  serialNumber?: string
  firmwareVersion?: string
  error?: string
  updatedAt: string
}

export interface HikvisionResult {
  ok: boolean
  message: string
}

/** A normalized access-control (attendance) event coming from the terminal. */
export interface HikvisionAttendanceEvent {
  employeeNo: string
  name?: string
  time: string
  verifyMode?: string
  major?: number
  minor?: number
  /**
   * Only present on terminals with "Attendance Mode" enabled in their local menu, which shows
   * the person a Check In/Check Out/Break Out/Break In/Overtime In/Overtime Out prompt at scan
   * time — e.g. "checkIn", "checkOut". When present this is the person's explicit stated intent
   * and should be trusted over guessing direction from today's existing attendance record.
   */
  attendanceStatus?: string
}

export interface HikvisionEventSearchRange {
  startTime: string
  endTime: string
}

export interface HikvisionEnrollFacePayload {
  employeeNo: string
  name: string
  /** Raw base64-encoded JPEG bytes, no `data:` URL prefix. */
  faceImageBase64: string
}

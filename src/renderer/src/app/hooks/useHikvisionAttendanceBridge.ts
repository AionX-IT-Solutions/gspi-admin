import { useEffect } from 'react'
import { toast } from 'sonner'
import { useHRStore } from '@/features/hr/store/hr.store'
import type { HikvisionAttendanceEvent } from '../../../../shared/hikvision-types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Safety net for terminals that don't report explicit intent (see below): a scan can't count as a clock-out
 *  less than this long after clock-in — a same-day recognition that soon is almost always the person just
 *  walking past the camera again, not an intentional time out. */
const MIN_MINUTES_BEFORE_AUTO_CLOCK_OUT = 5

/** Maps a terminal's explicit Check In/Check Out/Break Out/Break In/Overtime In/Overtime Out selection
 *  (only present when the terminal's local "Attendance Mode" is enabled) to our simple in/out model. */
function directionFromAttendanceStatus(attendanceStatus: string | undefined): 'in' | 'out' | null {
  if (!attendanceStatus) return null
  const s = attendanceStatus.toLowerCase()
  if (s.includes('out')) return 'out'
  if (s.includes('in')) return 'in'
  return null
}

/**
 * Listens for real-time face-recognition events pushed from the terminal (main process) and
 * turns each one into a clock-in or clock-out.
 *
 * When the terminal reports an explicit `attendanceStatus` (its local Attendance Mode prompts
 * the person to pick Check In/Check Out on-screen), that stated intent is trusted directly.
 * Otherwise direction is guessed from today's existing attendance record — since the device
 * only reports "this person was recognized," not which button they meant to press — guarded by
 * a cooldown so an incidental second walk-past the camera doesn't silently clock someone out.
 */
export function useHikvisionAttendanceBridge() {
  useEffect(() => {
    const unsubscribe = window.api?.hikvision.onAttendanceEvent(
      (event: HikvisionAttendanceEvent) => {
        const { employees, enrollments, attendance, clockBiometric } = useHRStore.getState()

        const employee = employees.find((e) => e.employeeNumber === event.employeeNo)
        if (!employee) {
          console.warn('[hikvision] Recognized on device but no matching employee record:', event)
          toast.warning(
            `Device recognized "${event.name ?? event.employeeNo}" but no employee has Employee # "${event.employeeNo}" — check the Employee # on the terminal matches Employees exactly.`
          )
          return
        }

        const enrollment = enrollments.find((e) => e.employeeId === employee.id && e.isActive)
        if (!enrollment) {
          console.warn('[hikvision] Recognized employee has no active enrollment:', event, employee)
          toast.warning(
            `${employee.fullName} was recognized by the device but isn't enrolled for biometric attendance in this app — enroll them from Biometric Kiosk → Enrollment.`
          )
          return
        }

        const today = todayIso()
        const existing = attendance.find((a) => a.employeeId === employee.id && a.date === today)
        const statedDirection = directionFromAttendanceStatus(event.attendanceStatus)
        const guessedDirection = !existing?.clockIn ? 'in' : !existing?.clockOut ? 'out' : null
        const direction = statedDirection ?? guessedDirection

        if (!direction) {
          toast.info(
            `${employee.fullName} already has both a time in and time out recorded for today.`
          )
          return
        }

        // Only the blind guess needs the cooldown — an explicit "checkOut" from the terminal is trusted as-is.
        if (!statedDirection && direction === 'out' && existing?.clockIn) {
          const minutesSinceClockIn = (Date.now() - new Date(existing.clockIn).getTime()) / 60000
          if (minutesSinceClockIn < MIN_MINUTES_BEFORE_AUTO_CLOCK_OUT) {
            toast.info(
              `${employee.fullName} was just recognized again ${minutesSinceClockIn < 1 ? 'moments' : `${Math.round(minutesSinceClockIn)} min`} after clocking in — treated as an incidental scan, not a time out.`
            )
            return
          }
        }

        const result = clockBiometric(employee.id, 'face', direction)
        if (result.ok) {
          toast.success(result.message)
        } else {
          toast.warning(result.message)
        }
      }
    )

    return () => unsubscribe?.()
  }, [])
}

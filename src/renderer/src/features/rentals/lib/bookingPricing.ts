import type { BookingDiscountType, RentalSpace } from '../types/rentals.types'

export const PWD_SENIOR_DISCOUNT_RATE = 0.2
export const DOWN_PAYMENT_RATE = 0.5

export interface BookingAmounts {
  /** ratePerDay plus any excess-hour charge, before discount. */
  subtotal: number
  /** Hours actually booked beyond the space's baseHours — 0 whenever baseHours/
   *  excessHourlyRate aren't set, or startTime/endTime weren't given. */
  excessHours: number
  excessAmount: number
  discountAmount: number
  totalAmount: number
  downPaymentAmount: number
}

/** "HH:mm" to hours-since-midnight, or null if unparseable. */
function parseTimeToHours(time: string | undefined): number | null {
  if (!time) return null
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return null
  const hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  if (hours > 23 || minutes > 59) return null
  return hours + minutes / 60
}

/**
 * A space's ratePerDay covers its first `baseHours` — actual time booked beyond that is billed
 * at `excessHourlyRate`/hour, computed here automatically instead of a staff member reading the
 * space's free-text description ("For the First 5 hours plus 1,000.00 per hour for the
 * succeeding hours") and working out the excess by hand. Falls back to 0 excess whenever the
 * space has no baseHours/excessHourlyRate configured, or the booking has no start/end time —
 * both leave `subtotal` at the flat ratePerDay, same as every booking before this existed.
 */
export function computeExcessHours(
  space: Pick<RentalSpace, 'baseHours'>,
  startTime: string | undefined,
  endTime: string | undefined
): number {
  const baseHours = space.baseHours ?? 0
  if (baseHours <= 0) return 0
  const start = parseTimeToHours(startTime)
  const end = parseTimeToHours(endTime)
  if (start === null || end === null) return 0
  // An end time earlier than the start time means the booking runs past midnight into the
  // next day (e.g. 6:00 PM-1:00 AM) rather than a data-entry mistake.
  const durationHours = end >= start ? end - start : 24 - start + end
  return Math.max(0, Math.round((durationHours - baseHours) * 100) / 100)
}

export function computeBookingAmounts(
  space: Pick<RentalSpace, 'ratePerDay' | 'baseHours' | 'excessHourlyRate'>,
  discountType: BookingDiscountType,
  startTime?: string,
  endTime?: string
): BookingAmounts {
  const excessHours = computeExcessHours(space, startTime, endTime)
  const excessAmount = Math.round(excessHours * (space.excessHourlyRate ?? 0) * 100) / 100
  const subtotal = space.ratePerDay + excessAmount
  const discountAmount =
    discountType === 'pwd_senior' ? Math.round(subtotal * PWD_SENIOR_DISCOUNT_RATE * 100) / 100 : 0
  const totalAmount = subtotal - discountAmount
  const downPaymentAmount = Math.round(totalAmount * DOWN_PAYMENT_RATE * 100) / 100
  return { subtotal, excessHours, excessAmount, discountAmount, totalAmount, downPaymentAmount }
}

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export function paymentStatusOf(
  totalAmount: number,
  amountPaid: number | undefined
): PaymentStatus {
  const paid = amountPaid ?? 0
  if (paid <= 0) return 'unpaid'
  if (paid >= totalAmount) return 'paid'
  return 'partial'
}

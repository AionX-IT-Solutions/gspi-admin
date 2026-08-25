import type { BookingDiscountType } from '../types/rentals.types'

export const PWD_SENIOR_DISCOUNT_RATE = 0.2
export const DOWN_PAYMENT_RATE = 0.5

export interface BookingAmounts {
  subtotal: number
  discountAmount: number
  totalAmount: number
  downPaymentAmount: number
}

export function computeBookingAmounts(
  subtotal: number,
  discountType: BookingDiscountType
): BookingAmounts {
  const discountAmount =
    discountType === 'pwd_senior' ? Math.round(subtotal * PWD_SENIOR_DISCOUNT_RATE * 100) / 100 : 0
  const totalAmount = subtotal - discountAmount
  const downPaymentAmount = Math.round(totalAmount * DOWN_PAYMENT_RATE * 100) / 100
  return { subtotal, discountAmount, totalAmount, downPaymentAmount }
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

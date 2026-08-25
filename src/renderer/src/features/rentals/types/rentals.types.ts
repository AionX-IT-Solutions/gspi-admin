export interface RentalSpace {
  id: string
  name: string
  description: string
  ratePerDay: number
  capacity: number
  imageUrl?: string
}

export type BookingStatus = 'reserved' | 'confirmed' | 'completed' | 'cancelled'

/** 'pwd_senior' is a flat 20% off (RA 9994 / RA 10754 discount policy), applied to `subtotal`. */
export type BookingDiscountType = 'none' | 'pwd_senior'

export interface RentalBooking {
  id: string
  rentalSpaceId: string
  bookingDate: string
  startTime?: string
  endTime?: string
  renterName: string
  notes?: string
  /** Space's ratePerDay snapshot at booking time, before discount. */
  subtotal?: number
  discountType?: BookingDiscountType
  discountAmount?: number
  /** Net amount due — subtotal minus discountAmount. */
  totalAmount: number
  /** Actual amount collected so far — compared against totalAmount (and the
   * policy-required 50% down payment) to derive payment status; see
   * paymentStatusOf in useRentals.ts. */
  amountPaid?: number
  status: BookingStatus
}

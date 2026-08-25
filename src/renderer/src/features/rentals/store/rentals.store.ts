import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { BookingStatus, RentalBooking, RentalSpace } from '../types/rentals.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface RentalsState {
  spaces: RentalSpace[]
  bookings: RentalBooking[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addSpace: (space: Omit<RentalSpace, 'id'>) => void
  updateSpace: (id: string, patch: Partial<RentalSpace>) => void
  deleteSpace: (id: string) => void
  addBooking: (booking: Omit<RentalBooking, 'id' | 'status'>) => void
  updateBooking: (id: string, patch: Partial<Omit<RentalBooking, 'id'>>) => void
  deleteBooking: (id: string) => void
  setBookingStatus: (id: string, status: BookingStatus) => void
}

export const useRentalsStore = create<RentalsState>()((set, get) => ({
  spaces: [],
  bookings: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [spaces, bookings] = await Promise.all([
        hydrateCollection<RentalSpace>('rentalSpaces'),
        hydrateCollection<RentalBooking>('rentalBookings')
      ])
      set({ spaces, bookings, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[rentals.store] Failed to hydrate', err)
    }
  },

  addSpace: (space) => {
    const created: RentalSpace = { ...space, id: crypto.randomUUID() }
    set((s) => ({ spaces: [created, ...s.spaces] }))
    persistDoc('rentalSpaces', created.id, created)
    appendAuditLog({
      action: 'rental_space_created',
      actorName: actorName(),
      entityType: 'rental_space',
      summary: `Rental space "${created.name}" added.`
    })
  },

  updateSpace: (id, patch) => {
    set((s) => ({ spaces: s.spaces.map((sp) => (sp.id === id ? { ...sp, ...patch } : sp)) }))
    const space = get().spaces.find((sp) => sp.id === id)
    if (space) persistDoc('rentalSpaces', id, space)
    appendAuditLog({
      action: 'rental_space_updated',
      actorName: actorName(),
      entityType: 'rental_space',
      summary: `Rental space "${space?.name ?? id}" updated.`
    })
  },

  deleteSpace: (id) => {
    const space = get().spaces.find((sp) => sp.id === id)
    set((s) => ({ spaces: s.spaces.filter((sp) => sp.id !== id) }))
    deleteDocById('rentalSpaces', id)
    appendAuditLog({
      action: 'rental_space_deleted',
      actorName: actorName(),
      entityType: 'rental_space',
      summary: `Rental space "${space?.name ?? id}" removed.`
    })
  },

  addBooking: (booking) => {
    const created: RentalBooking = { ...booking, id: crypto.randomUUID(), status: 'reserved' }
    set((s) => ({ bookings: [created, ...s.bookings] }))
    persistDoc('rentalBookings', created.id, created)
    const space = get().spaces.find((sp) => sp.id === booking.rentalSpaceId)
    appendAuditLog({
      action: 'rental_booking_created',
      actorName: actorName(),
      entityType: 'rental_booking',
      summary: `${space?.name ?? 'Space'} booked by ${booking.renterName} for ${booking.bookingDate}.`
    })
  },

  updateBooking: (id, patch) => {
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
    const booking = get().bookings.find((b) => b.id === id)
    if (booking) persistDoc('rentalBookings', id, booking)
    appendAuditLog({
      action: 'rental_booking_updated',
      actorName: actorName(),
      entityType: 'rental_booking',
      summary: `Booking for ${booking?.renterName ?? id} updated.`
    })
  },

  deleteBooking: (id) => {
    const booking = get().bookings.find((b) => b.id === id)
    set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) }))
    deleteDocById('rentalBookings', id)
    appendAuditLog({
      action: 'rental_booking_deleted',
      actorName: actorName(),
      entityType: 'rental_booking',
      summary: `Booking for ${booking?.renterName ?? id} removed.`
    })
  },

  setBookingStatus: (id, status) => {
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)) }))
    const booking = get().bookings.find((b) => b.id === id)
    if (booking) persistDoc('rentalBookings', id, booking)
  }
}))

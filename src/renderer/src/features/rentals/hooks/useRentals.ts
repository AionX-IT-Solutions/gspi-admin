import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { useRentalsStore } from '../store/rentals.store'
import type { RentalBooking, RentalSpace } from '../types/rentals.types'
import { emptyRentalSpaceForm, type RentalSpaceFormState } from '../components/RentalSpaceFormModal'
import { emptyBookingForm, type BookingFormState } from '../components/NewBookingModal'
import { computeBookingAmounts } from '../lib/bookingPricing'

export interface BookingRow extends RentalBooking {
  spaceName: string
}

export function useRentals() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const spaces = useRentalsStore((s) => s.spaces)
  const bookings = useRentalsStore((s) => s.bookings)
  const addSpace = useRentalsStore((s) => s.addSpace)
  const updateSpace = useRentalsStore((s) => s.updateSpace)
  const deleteSpace = useRentalsStore((s) => s.deleteSpace)
  const addBooking = useRentalsStore((s) => s.addBooking)
  const updateBooking = useRentalsStore((s) => s.updateBooking)
  const deleteBooking = useRentalsStore((s) => s.deleteBooking)
  const setBookingStatus = useRentalsStore((s) => s.setBookingStatus)

  const [showDialog, setShowDialog] = useState(false)
  const [bookingEditTarget, setBookingEditTarget] = useState<RentalBooking | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingFormState>(emptyBookingForm())
  const [bookingDeleteTarget, setBookingDeleteTarget] = useState<RentalBooking | null>(null)

  const [showSpaceForm, setShowSpaceForm] = useState(false)
  const [spaceEditTarget, setSpaceEditTarget] = useState<RentalSpace | null>(null)
  const [spaceForm, setSpaceForm] = useState<RentalSpaceFormState>(emptyRentalSpaceForm())
  const [spaceDeleteTarget, setSpaceDeleteTarget] = useState<RentalSpace | null>(null)

  const rows: BookingRow[] = useMemo(
    () =>
      bookings
        .map((b) => ({
          ...b,
          spaceName: spaces.find((sp) => sp.id === b.rentalSpaceId)?.name ?? 'Unknown'
        }))
        .sort((a, b) => (a.bookingDate < b.bookingDate ? 1 : -1)),
    [bookings, spaces]
  )

  function openAddBooking() {
    setBookingEditTarget(null)
    setBookingForm(emptyBookingForm())
    setShowDialog(true)
  }

  function openEditBooking(booking: RentalBooking) {
    setBookingEditTarget(booking)
    setBookingForm({
      rentalSpaceId: booking.rentalSpaceId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime ?? '',
      endTime: booking.endTime ?? '',
      renterName: booking.renterName,
      notes: booking.notes ?? '',
      discountType: booking.discountType ?? 'none',
      amountPaid: booking.amountPaid ?? 0
    })
    setShowDialog(true)
  }

  function handleSaveBooking() {
    if (!bookingForm.rentalSpaceId || !bookingForm.renterName.trim()) {
      toast.error(t('rentals.toast.validationRequired'))
      return
    }
    const space = spaces.find((sp) => sp.id === bookingForm.rentalSpaceId)
    const amounts = computeBookingAmounts(space?.ratePerDay ?? 0, bookingForm.discountType)
    const payload = {
      rentalSpaceId: bookingForm.rentalSpaceId,
      bookingDate: bookingForm.bookingDate,
      startTime: bookingForm.startTime || undefined,
      endTime: bookingForm.endTime || undefined,
      renterName: bookingForm.renterName.trim(),
      notes: bookingForm.notes || undefined,
      discountType: bookingForm.discountType,
      subtotal: amounts.subtotal,
      discountAmount: amounts.discountAmount,
      totalAmount: amounts.totalAmount,
      amountPaid: Math.max(0, bookingForm.amountPaid || 0)
    }
    if (bookingEditTarget) {
      updateBooking(bookingEditTarget.id, payload)
      toast.success(t('rentals.toast.updated'))
    } else {
      addBooking(payload)
      toast.success(t('rentals.toast.created'))
    }
    setShowDialog(false)
    setBookingEditTarget(null)
    setBookingForm(emptyBookingForm())
  }

  function handleConfirmDeleteBooking() {
    if (!bookingDeleteTarget) return
    deleteBooking(bookingDeleteTarget.id)
    toast.success(t('rentals.toast.deleted'))
    setBookingDeleteTarget(null)
  }

  function openAddSpace() {
    setSpaceEditTarget(null)
    setSpaceForm(emptyRentalSpaceForm())
    setShowSpaceForm(true)
  }

  function openEditSpace(space: RentalSpace) {
    setSpaceEditTarget(space)
    setSpaceForm({
      name: space.name,
      description: space.description,
      ratePerDay: space.ratePerDay,
      capacity: space.capacity,
      imageUrl: space.imageUrl ?? ''
    })
    setShowSpaceForm(true)
  }

  function handleSaveSpace() {
    if (!spaceForm.name.trim()) {
      toast.error(t('rentals.toast.nameRequired'))
      return
    }
    if (spaceEditTarget) {
      updateSpace(spaceEditTarget.id, spaceForm)
      toast.success(t('rentals.toast.spaceUpdated', { name: spaceForm.name }))
    } else {
      addSpace(spaceForm)
      toast.success(t('rentals.toast.spaceAdded', { name: spaceForm.name }))
    }
    setShowSpaceForm(false)
    setSpaceEditTarget(null)
    setSpaceForm(emptyRentalSpaceForm())
  }

  function handleConfirmDeleteSpace() {
    if (!spaceDeleteTarget) return
    deleteSpace(spaceDeleteTarget.id)
    toast.success(t('rentals.toast.spaceDeleted', { name: spaceDeleteTarget.name }))
    setSpaceDeleteTarget(null)
  }

  return {
    loading,
    toast,
    spaces,
    rows,
    setBookingStatus,
    showDialog,
    setShowDialog,
    bookingEditTarget,
    bookingForm,
    setBookingForm,
    openAddBooking,
    openEditBooking,
    handleSaveBooking,
    bookingDeleteTarget,
    setBookingDeleteTarget,
    handleConfirmDeleteBooking,
    showSpaceForm,
    setShowSpaceForm,
    spaceEditTarget,
    openAddSpace,
    openEditSpace,
    spaceForm,
    setSpaceForm,
    handleSaveSpace,
    spaceDeleteTarget,
    setSpaceDeleteTarget,
    handleConfirmDeleteSpace
  }
}

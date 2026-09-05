import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useRentalsStore } from '../../rentals/store/rentals.store'
import { useVisitorsStore } from '../../visitors/store/visitors.store'
import type { BookingStatus } from '../../rentals/types/rentals.types'
import type { VisitorStatus } from '../../visitors/types/visitors.types'

export interface CalendarDayBooking {
  id: string
  spaceName: string
  renterName: string
  startTime?: string
  endTime?: string
  status: BookingStatus
}

export interface CalendarDayVisitor {
  id: string
  fullName: string
  purpose: string
  personToVisit: string
  timeIn: string
  timeOut?: string
  status: VisitorStatus
}

export interface CalendarDay {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  bookings: CalendarDayBooking[]
  visitors: CalendarDayVisitor[]
}

/** Local (not UTC) `YYYY-MM-DD` — `bookingDate` is already stored in this shape,
 *  and a visitor's `timeIn` must be bucketed by the *local* calendar day it
 *  happened on, not the UTC day a naive `toISOString().slice(0, 10)` would give. */
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function useFacilityCalendar() {
  const loading = useSkeletonLoading()
  const spaces = useRentalsStore((s) => s.spaces)
  const bookings = useRentalsStore((s) => s.bookings)
  const hydrateRentals = useRentalsStore((s) => s.hydrate)
  const visitors = useVisitorsStore((s) => s.visitors)
  const hydrateVisitors = useVisitorsStore((s) => s.hydrate)

  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const monthLabel = cursor.toLocaleDateString('en-PH', { month: 'long' })

  const weeks = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const todayKey = toDateKey(new Date())

    const bookingsByDate = new Map<string, CalendarDayBooking[]>()
    for (const b of bookings) {
      const entry: CalendarDayBooking = {
        id: b.id,
        spaceName: spaces.find((sp) => sp.id === b.rentalSpaceId)?.name ?? 'Unknown space',
        renterName: b.renterName,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status
      }
      const list = bookingsByDate.get(b.bookingDate)
      if (list) list.push(entry)
      else bookingsByDate.set(b.bookingDate, [entry])
    }

    const visitorsByDate = new Map<string, CalendarDayVisitor[]>()
    for (const v of visitors) {
      const key = toDateKey(new Date(v.timeIn))
      const entry: CalendarDayVisitor = {
        id: v.id,
        fullName: v.fullName,
        purpose: v.purpose,
        personToVisit: v.personToVisit,
        timeIn: v.timeIn,
        timeOut: v.timeOut,
        status: v.status
      }
      const list = visitorsByDate.get(key)
      if (list) list.push(entry)
      else visitorsByDate.set(key, [entry])
    }

    const firstOfMonth = new Date(year, month, 1)
    const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())

    const days: CalendarDay[] = Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
      const dateKey = toDateKey(date)
      return {
        dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateKey === todayKey,
        bookings: bookingsByDate.get(dateKey) ?? [],
        visitors: visitorsByDate.get(dateKey) ?? []
      }
    })

    const rows: CalendarDay[][] = []
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))
    return rows
  }, [cursor, bookings, spaces, visitors])

  const monthTotals = useMemo(() => {
    let bookingCount = 0
    let visitorCount = 0
    for (const week of weeks) {
      for (const day of week) {
        if (!day.isCurrentMonth) continue
        bookingCount += day.bookings.length
        visitorCount += day.visitors.length
      }
    }
    return { bookings: bookingCount, visitors: visitorCount }
  }, [weeks])

  const selectedDay = useMemo(
    () => weeks.flat().find((d) => d.dateKey === selectedDateKey) ?? null,
    [weeks, selectedDateKey]
  )

  function goToPrevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
  }

  function goToToday() {
    const now = new Date()
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  function setYear(year: number) {
    setCursor((c) => new Date(year, c.getMonth(), 1))
  }

  // Always spans at least this year ± 5 — widened further if `cursor` (via
  // Prev/Next) has already wandered outside that range, so the dropdown can
  // never land on a year it doesn't actually list.
  const year = cursor.getFullYear()
  const thisYear = new Date().getFullYear()
  const yearOptions = useMemo(() => {
    const start = Math.min(thisYear, year) - 5
    const end = Math.max(thisYear, year) + 5
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [thisYear, year])

  async function refresh() {
    await Promise.all([hydrateRentals(true), hydrateVisitors(true)])
  }

  return {
    loading,
    weeks,
    weekdayLabels: WEEKDAY_LABELS,
    monthLabel,
    monthTotals,
    year,
    yearOptions,
    setYear,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    selectedDay,
    selectDay: setSelectedDateKey,
    closeDay: () => setSelectedDateKey(null),
    refresh
  }
}

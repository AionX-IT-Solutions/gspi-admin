import { useMemo, useState } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useActivitiesStore } from '../store/activities.store'
import type { ActivityCategory, ActivityStatus } from '../types/activities.types'

export interface CalendarDayActivity {
  id: string
  title: string
  category: ActivityCategory
  location?: string
  startTime?: string
  endTime?: string
  status: ActivityStatus
}

export interface ActivityCalendarDay {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  activities: CalendarDayActivity[]
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Every local date key from `start` to `end` inclusive — `end` defaults to `start`
 *  for single-day activities. */
function dateRange(start: string, end: string | undefined): string[] {
  const startDate = parseDateKey(start)
  const endDate = end ? parseDateKey(end) : startDate
  if (endDate < startDate) return [start]
  const keys: string[] = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    keys.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// The council's activity records start with fiscal year 2026-2027 (see
// startingBudget.ts) — the calendar never needs to look earlier than that, so it
// opens on today's month within 2026+ (or January 2026 itself if the system clock
// somehow reads earlier) instead of whatever month `new Date()` happens to return.
const EARLIEST_YEAR = 2026

function initialCursor(): Date {
  const now = new Date()
  if (now.getFullYear() < EARLIEST_YEAR) return new Date(EARLIEST_YEAR, 0, 1)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export function useActivitiesCalendar() {
  const loading = useSkeletonLoading()
  const activities = useActivitiesStore((s) => s.activities)

  const [cursor, setCursor] = useState(initialCursor)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const monthLabel = cursor.toLocaleDateString('en-PH', { month: 'long' })

  const weeks = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const todayKey = toDateKey(new Date())

    const activitiesByDate = new Map<string, CalendarDayActivity[]>()
    for (const a of activities) {
      const entry: CalendarDayActivity = {
        id: a.id,
        title: a.title,
        category: a.category,
        location: a.location,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status
      }
      for (const key of dateRange(a.startDate, a.endDate)) {
        const list = activitiesByDate.get(key)
        if (list) list.push(entry)
        else activitiesByDate.set(key, [entry])
      }
    }

    const firstOfMonth = new Date(year, month, 1)
    const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())

    const days: ActivityCalendarDay[] = Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
      const dateKey = toDateKey(date)
      return {
        dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateKey === todayKey,
        activities: activitiesByDate.get(dateKey) ?? []
      }
    })

    const rows: ActivityCalendarDay[][] = []
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))
    return rows
  }, [cursor, activities])

  const monthTotal = useMemo(() => {
    let count = 0
    for (const week of weeks) {
      for (const day of week) {
        if (!day.isCurrentMonth) continue
        count += day.activities.length
      }
    }
    return count
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
    setCursor(initialCursor())
  }

  function setYear(year: number) {
    setCursor((c) => new Date(year, c.getMonth(), 1))
  }

  const year = cursor.getFullYear()
  const thisYear = Math.max(new Date().getFullYear(), EARLIEST_YEAR)
  const yearOptions = useMemo(() => {
    const start = Math.max(EARLIEST_YEAR, Math.min(thisYear, year) - 5)
    const end = Math.max(thisYear, year) + 5
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [thisYear, year])

  return {
    loading,
    weeks,
    weekdayLabels: WEEKDAY_LABELS,
    monthLabel,
    monthTotal,
    year,
    yearOptions,
    setYear,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    selectedDay,
    selectDay: setSelectedDateKey,
    closeDay: () => setSelectedDateKey(null)
  }
}

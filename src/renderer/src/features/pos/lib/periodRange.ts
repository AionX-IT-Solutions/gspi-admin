export type ReportPeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom'

export interface PeriodRange {
  start: Date
  end: Date
  /** Human label for report headers, e.g. "September 2026" or "Q3 2026 (Jul 1 – Sep 30, 2026)". */
  label: string
  /** Formatted end-of-period date, used for "Quarter/Year Ended" style phrasing. */
  endLabel: string
}

function longDate(d: Date) {
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

function startOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function endOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(23, 59, 59, 999)
  return r
}

/**
 * Resolves the [start, end] window and header labels for a report period.
 * Daily/weekly/monthly/quarterly/annually are always relative to today —
 * there's no picker to look back at a past week/month/quarter/year, only
 * "custom" accepts arbitrary dates (yyyy-mm-dd strings from a date input).
 */
export function getPeriodRange(
  periodType: ReportPeriodType,
  customStart?: string,
  customEnd?: string
): PeriodRange {
  const now = new Date()

  if (periodType === 'daily') {
    const start = startOfDay(now)
    const end = endOfDay(now)
    const label = longDate(start)
    return { start, end, label, endLabel: label }
  }

  if (periodType === 'weekly') {
    const dow = now.getDay()
    const mondayOffset = dow === 0 ? -6 : 1 - dow
    const start = startOfDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
    )
    const end = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6))
    return { start, end, label: `${longDate(start)} – ${longDate(end)}`, endLabel: longDate(end) }
  }

  if (periodType === 'quarterly') {
    const q = Math.floor(now.getMonth() / 3)
    const start = new Date(now.getFullYear(), q * 3, 1)
    const end = endOfDay(new Date(now.getFullYear(), q * 3 + 3, 0))
    return {
      start,
      end,
      label: `Q${q + 1} ${now.getFullYear()} (${longDate(start)} – ${longDate(end)})`,
      endLabel: longDate(end)
    }
  }

  if (periodType === 'annually') {
    const start = new Date(now.getFullYear(), 0, 1)
    const end = endOfDay(new Date(now.getFullYear(), 11, 31))
    const label = String(now.getFullYear())
    return { start, end, label, endLabel: label }
  }

  if (periodType === 'custom') {
    const start = startOfDay(customStart ? new Date(customStart) : now)
    const end = endOfDay(customEnd ? new Date(customEnd) : now)
    return { start, end, label: `${longDate(start)} – ${longDate(end)}`, endLabel: longDate(end) }
  }

  // monthly (default)
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return {
    start,
    end,
    label: start.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
    endLabel: longDate(end)
  }
}

export function isWithinRange(iso: string | undefined, range: PeriodRange): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return t >= range.start.getTime() && t <= range.end.getTime()
}

export function reportPeriodHeading(periodType: ReportPeriodType): string {
  switch (periodType) {
    case 'daily':
      return 'Daily'
    case 'weekly':
      return 'Weekly'
    case 'quarterly':
      return 'Quarterly'
    case 'annually':
      return 'Annual'
    case 'custom':
      return 'Custom Period'
    default:
      return 'Monthly'
  }
}

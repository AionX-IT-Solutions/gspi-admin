/** "2026-2027" -> "2027-2028" — the next fiscal/program year label, suggested as the
 *  default when starting a new year. Falls back to the plain label if it doesn't parse.
 *  Shared by Budget and Goals & Objectives, which both roll forward on the same
 *  July-June year convention. */
export function nextFiscalYearLabel(year: string): string {
  const match = /^(\d{4})-(\d{4})$/.exec(year)
  if (!match) return year
  const start = parseInt(match[1], 10) + 1
  const end = parseInt(match[2], 10) + 1
  return `${start}-${end}`
}

// Fiscal-year month order both Budget and Goals use: Jul, Aug, ..., Jun. Values are JS
// `Date#getMonth()` indices (0 = January).
const FISCAL_MONTH_ORDER = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5]

/** Which of the 12 fiscal-year slots a date falls into, or null if it's outside this fiscal
 *  year entirely (fiscalYear "2026-2027" spans Jul 2026 through Jun 2027). Shared by Budget's
 *  auto-actuals and Goals' auto-tracked (nesSales) objectives, so a sale on a given date rolls
 *  up into the same fiscal year/month slot in both places. */
export function fiscalMonthIndex(dateIso: string, fiscalYear: string): number | null {
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return null
  const startYear = parseInt(fiscalYear.split('-')[0], 10)
  if (Number.isNaN(startYear)) return null
  const month = d.getMonth()
  const idx = FISCAL_MONTH_ORDER.indexOf(month)
  const expectedYear = month >= 6 ? startYear : startYear + 1
  return d.getFullYear() === expectedYear ? idx : null
}

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

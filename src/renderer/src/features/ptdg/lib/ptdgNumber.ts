import type { PtdgApplication } from '../types/ptdg.types'

// Internal reference number for this app's own list/table — the real paper form has
// no such field, so it's never printed on the export (see ptdgExport.ts).
export function generatePtdgNumber(existing: PtdgApplication[]): string {
  const max = existing.reduce((m, a) => {
    const n = parseInt(a.applicationNumber.split('-')[1], 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `PTDG-${max + 1}`
}

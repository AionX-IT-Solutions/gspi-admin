import type { Invoice } from '../types/accounting.types'

export function generateInvoiceNumber(existing: Invoice[]): string {
  const max = existing.reduce((m, i) => {
    const n = parseInt(i.number.split('-')[1], 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 1000)
  return `INV-${max + 1}`
}

import type { Invoice } from '../types/accounting.types'

export function generateInvoiceNumber(existing: Invoice[]): string {
  const max = existing.reduce((m, i) => Math.max(m, parseInt(i.number.split('-')[1], 10)), 1000)
  return `INV-${max + 1}`
}

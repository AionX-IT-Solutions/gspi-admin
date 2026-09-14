// The itemized backup for a Journal Voucher's cash-advance liquidation. A JV only carries
// the liquidation totals (Total Amount Spent, Amount Refunded, etc.) — this is the
// per-receipt detail (one row per expense) that adds up to that Total Amount Spent figure.
// Kept as its own record (one per voucher, `id` === the voucher's id) so it can be edited
// and re-exported independently of the JV itself, rather than as a tab inside it.

export interface ExpenseSummaryItem {
  id: string
  date: string
  particulars: string
  orNumber: string
  category: string
  amount: number
}

export interface ExpenseSummary {
  id: string
  voucherId: string
  items: ExpenseSummaryItem[]
  updatedAt: string
}

export function emptyExpenseSummaryItem(): ExpenseSummaryItem {
  return {
    id: crypto.randomUUID(),
    date: '',
    particulars: '',
    orNumber: '',
    category: '',
    amount: 0
  }
}

export function expenseSummaryTotal(items: ExpenseSummaryItem[]): number {
  return items.reduce((sum, i) => sum + (i.amount || 0), 0)
}

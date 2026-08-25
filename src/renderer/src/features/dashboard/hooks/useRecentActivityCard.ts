import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import type { Invoice, Expense } from '@/features/accounting/types/accounting.types'

export interface RecentActivityRow {
  kind: 'invoice' | 'expense'
  date: string
  data: Invoice | Expense
}

export function useRecentActivityCard() {
  const navigate = useNavigate()
  const invoices = useAccountingStore((s) => s.invoices)
  const expenses = useAccountingStore((s) => s.expenses)

  const recentActivity: RecentActivityRow[] = useMemo(() => {
    const rows: RecentActivityRow[] = [
      ...invoices.map((i) => ({ kind: 'invoice' as const, date: i.issueDate, data: i })),
      ...expenses.map((e) => ({ kind: 'expense' as const, date: e.date, data: e }))
    ]
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)
  }, [invoices, expenses])

  return { navigate, recentActivity }
}

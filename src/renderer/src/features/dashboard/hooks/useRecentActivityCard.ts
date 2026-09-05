import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getExpenseVouchers } from '@/features/vouchers/lib/expenseVouchers'
import type { Invoice } from '@/features/accounting/types/accounting.types'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'

export interface RecentActivityRow {
  kind: 'invoice' | 'expense'
  date: string
  data: Invoice | Voucher
}

export function useRecentActivityCard() {
  const navigate = useNavigate()
  const invoices = useAccountingStore((s) => s.invoices)
  const vouchers = useVouchersStore((s) => s.vouchers)

  const recentActivity: RecentActivityRow[] = useMemo(() => {
    const expenses = getExpenseVouchers(vouchers)
    const rows: RecentActivityRow[] = [
      ...invoices.map((i) => ({ kind: 'invoice' as const, date: i.issueDate, data: i })),
      ...expenses.map((e) => ({ kind: 'expense' as const, date: e.date, data: e }))
    ]
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)
  }, [invoices, vouchers])

  return { navigate, recentActivity }
}

import { useMemo } from 'react'
import { useAccountingStore } from '@/features/accounting/store/accounting.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getExpenseVouchers, voucherCategory } from '@/features/vouchers/lib/expenseVouchers'
import { useBankBalances } from '@/features/scrd/hooks/useBankBalances'
import { useToast } from '@/app/hooks/useToast'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'

export function useDashboard() {
  const toast = useToast()
  const loading = useSkeletonLoading()
  const invoices = useAccountingStore((s) => s.invoices)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const expenses = useMemo(() => getExpenseVouchers(vouchers), [vouchers])
  const { banks, bankAccountBalances, totalBalance } = useBankBalances()

  const totals = useMemo(() => {
    const income = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0)
    const outstanding = invoices.reduce((s, i) => s + i.balanceDue, 0)
    const overdue = invoices
      .filter((i) => i.status === 'overdue')
      .reduce((s, i) => s + i.balanceDue, 0)
    const notDueYet = invoices
      .filter((i) => i.status === 'sent' || i.status === 'partial')
      .reduce((s, i) => s + i.balanceDue, 0)
    const draft = invoices.filter((i) => i.status === 'draft').length

    const expenseByCategory = new Map<string, number>()
    expenses.forEach((e) => {
      const category = voucherCategory(e)
      expenseByCategory.set(category, (expenseByCategory.get(category) ?? 0) + e.amount)
    })
    const topCategories = [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      income,
      expenseTotal,
      netProfit: income - expenseTotal,
      outstanding,
      overdue,
      notDueYet,
      draft,
      topCategories
    }
  }, [invoices, expenses])

  const outstandingInvoiceCount = invoices.filter((i) => i.balanceDue > 0).length

  return {
    toast,
    loading,
    invoices,
    totals,
    outstandingInvoiceCount,
    banks,
    bankAccountBalances,
    totalBalance
  }
}

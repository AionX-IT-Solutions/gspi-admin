import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useAccountingStore } from '../store/accounting.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { getExpenseVouchers, voucherCategory } from '@/features/vouchers/lib/expenseVouchers'
import {
  exportIncomeStatementExcel,
  exportIncomeStatementPdf,
  exportIncomeStatementDocx,
  buildIncomeStatementPdfDoc
} from '../lib/financialReportsExport'

export function useIncomeStatementTab(periodLabel: string) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const invoices = useAccountingStore((s) => s.invoices)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const expenses = useMemo(() => getExpenseVouchers(vouchers), [vouchers])

  const pnl = useMemo(() => {
    const incomeByAccount = new Map<string, number>()
    invoices
      .filter((inv) => inv.status === 'paid')
      .forEach((inv) => {
        inv.lineItems.forEach((li) => {
          incomeByAccount.set('Income', (incomeByAccount.get('Income') ?? 0) + li.amount)
        })
      })

    const expenseByCategory = new Map<string, number>()
    expenses.forEach((e) => {
      const category = voucherCategory(e)
      expenseByCategory.set(category, (expenseByCategory.get(category) ?? 0) + e.amount)
    })

    const totalIncome = [...incomeByAccount.values()].reduce((s, v) => s + v, 0)
    const totalExpense = [...expenseByCategory.values()].reduce((s, v) => s + v, 0)

    return {
      incomeRows: [...incomeByAccount.entries()].sort((a, b) => b[1] - a[1]),
      expenseRows: [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]),
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense
    }
  }, [invoices, expenses])

  const trendData = useMemo(() => {
    const monthCount = 6
    const now = new Date()
    const months = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1)
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('en-US', { month: 'short' })
      }
    })

    const income = new Map(months.map((m) => [m.key, 0]))
    const expense = new Map(months.map((m) => [m.key, 0]))

    invoices
      .filter((inv) => inv.status === 'paid')
      .forEach((inv) => {
        const d = new Date(inv.issueDate)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (income.has(key)) income.set(key, (income.get(key) ?? 0) + inv.total)
      })

    expenses.forEach((e) => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (expense.has(key)) expense.set(key, (expense.get(key) ?? 0) + e.amount)
    })

    return months.map((m) => ({
      month: m.label,
      income: income.get(m.key) ?? 0,
      expense: expense.get(m.key) ?? 0
    }))
  }, [invoices, expenses])

  async function handleView() {
    preview.openPreview(await buildIncomeStatementPdfDoc({ periodLabel, ...pnl }))
  }

  function handleExportExcel() {
    exportIncomeStatementExcel({ periodLabel, ...pnl })
    toast.success(t('reports.pnl.toast.excel'))
  }

  function handleExportPdf() {
    exportIncomeStatementPdf({ periodLabel, ...pnl })
    toast.success(t('reports.pnl.toast.pdf'))
  }

  function handleExportWord() {
    exportIncomeStatementDocx({ periodLabel, ...pnl })
    toast.success(t('reports.pnl.toast.word'))
  }

  return {
    pnl,
    trendData,
    handleView,
    preview,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  }
}

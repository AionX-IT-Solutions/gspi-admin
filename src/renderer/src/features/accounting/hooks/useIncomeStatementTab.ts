import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useAccountingStore } from '../store/accounting.store'
import {
  exportIncomeStatementExcel,
  exportIncomeStatementPdf,
  exportIncomeStatementDocx
} from '../lib/financialReportsExport'

export function useIncomeStatementTab(periodLabel: string) {
  const { t } = useTranslation()
  const toast = useToast()
  const invoices = useAccountingStore((s) => s.invoices)
  const expenses = useAccountingStore((s) => s.expenses)
  const items = useAccountingStore((s) => s.items)

  const pnl = useMemo(() => {
    const incomeByAccount = new Map<string, number>()
    invoices
      .filter((inv) => inv.status === 'paid')
      .forEach((inv) => {
        inv.lineItems.forEach((li) => {
          const item = items.find((it) => it.name === li.description)
          const account = item?.incomeAccount ?? 'Other Income'
          incomeByAccount.set(account, (incomeByAccount.get(account) ?? 0) + li.amount)
        })
      })

    const expenseByCategory = new Map<string, number>()
    expenses
      .filter((e) => e.status === 'paid')
      .forEach((e) =>
        expenseByCategory.set(e.category, (expenseByCategory.get(e.category) ?? 0) + e.amount)
      )

    const totalIncome = [...incomeByAccount.values()].reduce((s, v) => s + v, 0)
    const totalExpense = [...expenseByCategory.values()].reduce((s, v) => s + v, 0)

    return {
      incomeRows: [...incomeByAccount.entries()].sort((a, b) => b[1] - a[1]),
      expenseRows: [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]),
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense
    }
  }, [invoices, expenses, items])

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

    expenses
      .filter((e) => e.status === 'paid')
      .forEach((e) => {
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

  return { pnl, trendData, handleExportExcel, handleExportPdf, handleExportWord }
}

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useAccountingStore } from '../store/accounting.store'
import {
  exportBalanceSheetExcel,
  exportBalanceSheetPdf,
  exportBalanceSheetDocx
} from '../lib/financialReportsExport'

export function useBalanceSheetTab(periodLabel: string) {
  const { t } = useTranslation()
  const toast = useToast()
  const invoices = useAccountingStore((s) => s.invoices)
  const vendors = useAccountingStore((s) => s.vendors)
  const accounts = useAccountingStore((s) => s.accounts)

  const balanceSheet = useMemo(() => {
    const accountsReceivable = invoices.reduce((s, i) => s + i.balanceDue, 0)
    const accountsPayable = vendors.reduce((s, v) => s + v.balance, 0)

    const resolved = accounts.map((a) => {
      if (a.name === 'Accounts Receivable') return { ...a, balance: accountsReceivable }
      if (a.name === 'Accounts Payable') return { ...a, balance: accountsPayable }
      return a
    })

    const assets = resolved.filter((a) => a.type === 'asset')
    const liabilities = resolved.filter((a) => a.type === 'liability')
    const equity = resolved.filter((a) => a.type === 'equity')

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0)
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0)
    const totalEquity = equity.reduce((s, a) => s + a.balance, 0)

    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity }
  }, [accounts, invoices, vendors])

  function handleExportExcel() {
    exportBalanceSheetExcel({ periodLabel, ...balanceSheet })
    toast.success(t('reports.balanceSheet.toast.excel'))
  }

  function handleExportPdf() {
    exportBalanceSheetPdf({ periodLabel, ...balanceSheet })
    toast.success(t('reports.balanceSheet.toast.pdf'))
  }

  function handleExportWord() {
    exportBalanceSheetDocx({ periodLabel, ...balanceSheet })
    toast.success(t('reports.balanceSheet.toast.word'))
  }

  return { balanceSheet, handleExportExcel, handleExportPdf, handleExportWord }
}

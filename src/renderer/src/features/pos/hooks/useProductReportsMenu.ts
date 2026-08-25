import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { useToast } from '@/app/hooks/useToast'
import type { Product, Purchase, Sale } from '../types/pos.types'
import {
  exportMonthlySalesReport,
  exportMonthlySalesReportPdf,
  exportMonthlySalesReportDocx,
  exportMonthlyInventoryReport,
  exportMonthlyInventoryReportPdf,
  exportMonthlyInventoryReportDocx,
  exportNesIncomeStatement,
  exportNesIncomeStatementPdf,
  exportNesIncomeStatementDocx,
  computeInventoryMovements
} from '../lib/nesExcelExport'

interface UseProductReportsMenuArgs {
  products: Product[]
  sales: Sale[]
  purchases: Purchase[]
  toast: ReturnType<typeof useToast>
}

export function useProductReportsMenu({
  products,
  sales,
  purchases,
  toast
}: UseProductReportsMenuArgs) {
  const { t } = useTranslation()
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly'>('monthly')
  const [quarterEndedLabel, setQuarterEndedLabel] = useState('')

  function monthLabel() {
    return new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  }

  function incomeStatementParams() {
    const month = monthLabel()
    const periodLabel = periodType === 'quarterly' ? quarterEndedLabel || month : month
    const movements = computeInventoryMovements(products, sales, purchases)
    const beginningInventory = movements.reduce((sum, m) => sum + m.beginningValue, 0)
    const purchasesTotal = movements.reduce((sum, m) => sum + m.purchasesValue, 0)
    const endingInventory = movements.reduce((sum, m) => sum + m.endingValue, 0)
    const cashSales = sales.filter((s) => !s.voided).reduce((sum, s) => sum + s.totalAmount, 0)
    return {
      monthLabel: periodLabel,
      periodType,
      beginningInventory,
      purchases: purchasesTotal,
      endingInventory,
      cashSales
    }
  }

  function exportSalesReport(fmt: 'excel' | 'pdf' | 'word') {
    if (sales.length === 0) {
      toast.error(t('products.toast.noSalesToReport'))
      return
    }
    const month = monthLabel()
    if (fmt === 'excel') {
      exportMonthlySalesReport(sales, month)
      toast.success(t('products.toast.salesReportExportedExcel'))
    } else if (fmt === 'pdf') {
      exportMonthlySalesReportPdf(sales, month)
      toast.success(t('products.toast.salesReportExportedPdf'))
    } else {
      exportMonthlySalesReportDocx(sales, month)
      toast.success(t('products.toast.salesReportExportedWord'))
    }
  }

  function exportInventoryReport(fmt: 'excel' | 'pdf' | 'word') {
    const month = monthLabel()
    if (fmt === 'excel') {
      exportMonthlyInventoryReport(products, sales, purchases, month)
      toast.success(t('products.toast.inventoryReportExportedExcel'))
    } else if (fmt === 'pdf') {
      exportMonthlyInventoryReportPdf(products, sales, purchases, month)
      toast.success(t('products.toast.inventoryReportExportedPdf'))
    } else {
      exportMonthlyInventoryReportDocx(products, sales, purchases, month)
      toast.success(t('products.toast.inventoryReportExportedWord'))
    }
  }

  function exportIncomeStatement(fmt: 'excel' | 'pdf' | 'word') {
    const params = incomeStatementParams()
    if (fmt === 'excel') {
      exportNesIncomeStatement(params)
      toast.success(t('products.toast.incomeStatementExportedExcel'))
    } else if (fmt === 'pdf') {
      exportNesIncomeStatementPdf(params)
      toast.success(t('products.toast.incomeStatementExportedPdf'))
    } else {
      exportNesIncomeStatementDocx(params)
      toast.success(t('products.toast.incomeStatementExportedWord'))
    }
  }

  return {
    periodType,
    setPeriodType,
    quarterEndedLabel,
    setQuarterEndedLabel,
    exportSalesReport,
    exportInventoryReport,
    exportIncomeStatement
  }
}

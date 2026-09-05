import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { useToast } from '@/app/hooks/useToast'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import type { Product, Purchase, Sale } from '../types/pos.types'
import {
  exportMonthlySalesReport,
  exportMonthlySalesReportPdf,
  exportMonthlySalesReportDocx,
  buildMonthlySalesReportPdfDoc,
  exportMonthlyInventoryReport,
  exportMonthlyInventoryReportPdf,
  exportMonthlyInventoryReportDocx,
  buildMonthlyInventoryReportPdfDoc,
  exportNesIncomeStatement,
  exportNesIncomeStatementPdf,
  exportNesIncomeStatementDocx,
  buildNesIncomeStatementPdfDoc,
  computeInventoryMovements
} from '../lib/nesExcelExport'
import { type ReportPeriodType, getPeriodRange, isWithinRange } from '../lib/periodRange'

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
  const todayIso = () => new Date().toISOString().slice(0, 10)
  const [periodType, setPeriodType] = useState<ReportPeriodType>('monthly')
  const [customStart, setCustomStart] = useState(todayIso)
  const [customEnd, setCustomEnd] = useState(todayIso)
  const preview = useDocumentPreview()
  const [previewKind, setPreviewKind] = useState<'sales' | 'inventory' | 'incomeStatement' | null>(
    null
  )

  function periodRange() {
    return getPeriodRange(periodType, customStart, customEnd)
  }

  function periodSales() {
    const range = periodRange()
    return sales.filter((s) => !s.voided && isWithinRange(s.createdAt, range))
  }

  function periodPurchases() {
    const range = periodRange()
    return purchases.filter((p) => isWithinRange(p.date, range))
  }

  function incomeStatementParams() {
    const range = periodRange()
    const movements = computeInventoryMovements(products, periodSales(), periodPurchases())
    const beginningInventory = movements.reduce((sum, m) => sum + m.beginningValue, 0)
    const purchasesTotal = movements.reduce((sum, m) => sum + m.purchasesValue, 0)
    const endingInventory = movements.reduce((sum, m) => sum + m.endingValue, 0)
    const cashSales = periodSales().reduce((sum, s) => sum + s.totalAmount, 0)
    return {
      monthLabel: range.label,
      periodType,
      beginningInventory,
      purchases: purchasesTotal,
      endingInventory,
      cashSales
    }
  }

  function exportSalesReport(fmt: 'excel' | 'pdf' | 'word') {
    const sel = periodSales()
    if (sel.length === 0) {
      toast.error(t('products.toast.noSalesToReport'))
      return
    }
    const label = periodRange().label
    if (fmt === 'excel') {
      exportMonthlySalesReport(sel, label, periodType)
      toast.success(t('products.toast.salesReportExportedExcel'))
    } else if (fmt === 'pdf') {
      exportMonthlySalesReportPdf(sel, label, periodType)
      toast.success(t('products.toast.salesReportExportedPdf'))
    } else {
      exportMonthlySalesReportDocx(sel, label, periodType)
      toast.success(t('products.toast.salesReportExportedWord'))
    }
  }

  function exportInventoryReport(fmt: 'excel' | 'pdf' | 'word') {
    const sel = periodSales()
    const pur = periodPurchases()
    const label = periodRange().label
    if (fmt === 'excel') {
      exportMonthlyInventoryReport(products, sel, pur, label, periodType)
      toast.success(t('products.toast.inventoryReportExportedExcel'))
    } else if (fmt === 'pdf') {
      exportMonthlyInventoryReportPdf(products, sel, pur, label, periodType)
      toast.success(t('products.toast.inventoryReportExportedPdf'))
    } else {
      exportMonthlyInventoryReportDocx(products, sel, pur, label, periodType)
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

  async function viewSalesReport() {
    const sel = periodSales()
    if (sel.length === 0) {
      toast.error(t('products.toast.noSalesToReport'))
      return
    }
    setPreviewKind('sales')
    preview.openPreview(await buildMonthlySalesReportPdfDoc(sel, periodRange().label, periodType))
  }

  async function viewInventoryReport() {
    setPreviewKind('inventory')
    preview.openPreview(
      await buildMonthlyInventoryReportPdfDoc(
        products,
        periodSales(),
        periodPurchases(),
        periodRange().label,
        periodType
      )
    )
  }

  async function viewIncomeStatement() {
    setPreviewKind('incomeStatement')
    preview.openPreview(await buildNesIncomeStatementPdfDoc(incomeStatementParams()))
  }

  const previewTitle =
    previewKind === 'sales'
      ? t('products.export.salesReport')
      : previewKind === 'inventory'
        ? t('products.export.inventoryReport')
        : t('products.export.incomeStatement')

  function downloadPreviewed(fmt: 'excel' | 'pdf' | 'word') {
    if (previewKind === 'sales') exportSalesReport(fmt)
    else if (previewKind === 'inventory') exportInventoryReport(fmt)
    else if (previewKind === 'incomeStatement') exportIncomeStatement(fmt)
  }

  return {
    periodType,
    setPeriodType,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    exportSalesReport,
    exportInventoryReport,
    exportIncomeStatement,
    viewSalesReport,
    viewInventoryReport,
    viewIncomeStatement,
    preview,
    previewTitle,
    downloadPreviewed
  }
}

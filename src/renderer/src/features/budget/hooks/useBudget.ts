import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import { useHRStore } from '@/features/hr/store/hr.store'
import { useBudgetStore, type BudgetCategoryEdit } from '../store/budget.store'
import { groupCategories, sectionTotals } from '../lib/budgetCalculations'
import { computeBudgetAutoActuals } from '../lib/budgetAutoActuals'
import {
  buildBudgetPdfDoc,
  exportBudgetDocx,
  exportBudgetExcel,
  exportBudgetPdf,
  type BudgetReportData
} from '../lib/budgetReportExport'
import type { BudgetCategory } from '../types/budget.types'

/** "2026-2027" -> "2027-2028" — the next fiscal year label, suggested as the default
 *  when starting a new year. Falls back to the plain label if it doesn't parse. */
export function nextFiscalYearLabel(year: string): string {
  const match = /^(\d{4})-(\d{4})$/.exec(year)
  if (!match) return year
  const start = parseInt(match[1], 10) + 1
  const end = parseInt(match[2], 10) + 1
  return `${start}-${end}`
}

export function useBudget() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const preview = useDocumentPreview()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:budget')
  const allCategories = useBudgetStore((s) => s.categories)
  const updateCategory = useBudgetStore((s) => s.updateCategory)
  const createFiscalYearAction = useBudgetStore((s) => s.createFiscalYear)

  const sales = usePOSStore((s) => s.sales)
  const bookings = useRentalsStore((s) => s.bookings)
  const spaces = useRentalsStore((s) => s.spaces)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const payroll = useHRStore((s) => s.payroll)

  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('')

  const availableFiscalYears = useMemo(
    () => [...new Set(allCategories.map((c) => c.fiscalYear))].sort(),
    [allCategories]
  )
  // Falls back to the latest known year until the user picks a different one, and
  // recovers automatically if the selected year's data ever disappears.
  const fiscalYear = availableFiscalYears.includes(selectedFiscalYear)
    ? selectedFiscalYear
    : (availableFiscalYears.at(-1) ?? '')

  const categories = useMemo(
    () => allCategories.filter((c) => c.fiscalYear === fiscalYear),
    [allCategories, fiscalYear]
  )

  const incomeGroups = useMemo(() => groupCategories(categories, 'income'), [categories])
  const expenseGroups = useMemo(() => groupCategories(categories, 'expense'), [categories])
  const incomeTotals = useMemo(() => sectionTotals(categories, 'income'), [categories])
  const expenseTotals = useMemo(() => sectionTotals(categories, 'expense'), [categories])
  const netBudgeted = incomeTotals.totalBudgeted - expenseTotals.totalBudgeted
  const netActual = incomeTotals.totalActual - expenseTotals.totalActual

  // Reference figures pulled live from POS/Rentals/Vouchers/Payroll for whichever
  // budget lines have a confident real-data match — offered in the Edit modal as a
  // one-click fill, never silently overwriting the council-approved manual actuals.
  const autoActualsByCategory = useMemo(
    () =>
      computeBudgetAutoActuals(categories, fiscalYear, {
        sales,
        bookings,
        spaces,
        vouchers,
        payroll
      }),
    [categories, fiscalYear, sales, bookings, spaces, vouchers, payroll]
  )

  function handleSaveCategory(id: string, edit: BudgetCategoryEdit) {
    if (!canManage) return
    updateCategory(id, edit)
    toast.success(t('budget.toast.updated'))
    setEditingCategory(null)
  }

  function handleCreateFiscalYear(newFiscalYear: string) {
    if (!canManage) return
    const trimmed = newFiscalYear.trim()
    if (!trimmed) {
      toast.error(t('budget.toast.fiscalYearRequired'))
      return
    }
    const result = createFiscalYearAction(trimmed)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    setSelectedFiscalYear(trimmed)
    toast.success(t('budget.toast.fiscalYearCreated', { year: trimmed }))
  }

  const reportData: BudgetReportData = {
    fiscalYear,
    incomeGroups,
    expenseGroups,
    incomeTotals,
    expenseTotals,
    netBudgeted,
    netActual
  }

  async function handleView() {
    preview.openPreview(await buildBudgetPdfDoc(reportData))
  }

  function handleExportExcel() {
    exportBudgetExcel(reportData)
    toast.success(t('budget.toast.excel'))
  }

  function handleExportPdf() {
    exportBudgetPdf(reportData)
    toast.success(t('budget.toast.pdf'))
  }

  function handleExportWord() {
    exportBudgetDocx(reportData)
    toast.success(t('budget.toast.word'))
  }

  return {
    loading,
    canManage,
    fiscalYear,
    setSelectedFiscalYear,
    availableFiscalYears,
    suggestedNextFiscalYear: nextFiscalYearLabel(availableFiscalYears.at(-1) ?? ''),
    handleCreateFiscalYear,
    incomeGroups,
    expenseGroups,
    incomeTotals,
    expenseTotals,
    netBudgeted,
    netActual,
    autoActualsByCategory,
    editingCategory,
    setEditingCategory,
    handleSaveCategory,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  }
}

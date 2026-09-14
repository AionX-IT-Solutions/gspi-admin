import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'
import { useVouchersStore } from '@/features/vouchers/store/vouchers.store'
import {
  hasCashAdvance,
  deriveCashAdvanceLiquidation
} from '@/features/vouchers/lib/expenseVouchers'
import { useExpenseSummaryStore } from '../store/expenseSummary.store'
import { emptyExpenseSummaryItem, type ExpenseSummaryItem } from '../types/expenseSummary.types'
import {
  buildExpenseSummaryPdfDoc,
  exportExpenseSummaryExcel,
  exportExpenseSummaryPdf,
  exportExpenseSummaryDocx
} from '../lib/expenseSummaryExport'

export function useExpenseSummaryModal() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:vouchers')
  const summaries = useExpenseSummaryStore((s) => s.summaries)
  const saveSummary = useExpenseSummaryStore((s) => s.saveSummary)
  const vouchers = useVouchersStore((s) => s.vouchers)
  const updateVoucher = useVouchersStore((s) => s.updateVoucher)
  const preview = useDocumentPreview()

  const [target, setTarget] = useState<Voucher | null>(null)
  const [items, setItems] = useState<ExpenseSummaryItem[]>([])

  // The Check Voucher this JV's cash advance liquidation traces back to — the Council's
  // real Summary of Expenses cites it in its subtitle as "(CV #___)".
  const relatedVoucherNumber = vouchers.find(
    (v) => v.id === target?.relatedVoucherId
  )?.voucherNumber

  // Re-seeds only when the targeted voucher changes (opening/closing the modal), not on
  // every store update — otherwise a Firestore round-trip mid-edit would clobber whatever
  // the user is currently typing.
  useEffect(() => {
    if (!target) return
    const existing = summaries.find((s) => s.voucherId === target.id)
    setItems(existing && existing.items.length > 0 ? existing.items : [emptyExpenseSummaryItem()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  function open(voucher: Voucher) {
    setTarget(voucher)
  }

  function close() {
    setTarget(null)
  }

  function addItem() {
    setItems((prev) => [...prev, emptyExpenseSummaryItem()])
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev))
  }

  function updateItem(id: string, patch: Partial<ExpenseSummaryItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function handleSave() {
    if (!target || !canManage) return
    const valid = items.filter((i) => i.particulars.trim() && i.amount > 0)
    saveSummary(target.id, valid)
    // The liquidating JV's own debit/credit lines are never hand-typed — they're a
    // mechanical consequence of these itemized receipts, recomputed on every save so the
    // JV always reflects exactly what's on file here.
    if (hasCashAdvance(target)) {
      updateVoucher(
        target.id,
        deriveCashAdvanceLiquidation(target.cashAdvanceAmount ?? 0, valid, target.refundOrNumber)
      )
    }
    toast.success(t('expenseSummary.toast.saved'))
    close()
  }

  async function handleView() {
    if (!target) return
    preview.openPreview(await buildExpenseSummaryPdfDoc(target, items, relatedVoucherNumber))
  }

  function handleExportExcel() {
    if (!target) return
    exportExpenseSummaryExcel(target, items, relatedVoucherNumber)
    toast.success(t('expenseSummary.toast.excelGenerated'))
  }

  function handleExportPdf() {
    if (!target) return
    exportExpenseSummaryPdf(target, items, relatedVoucherNumber)
    toast.success(t('expenseSummary.toast.pdfGenerated'))
  }

  function handleExportWord() {
    if (!target) return
    exportExpenseSummaryDocx(target, items, relatedVoucherNumber)
    toast.success(t('expenseSummary.toast.wordGenerated'))
  }

  return {
    target,
    open,
    close,
    canManage,
    items,
    addItem,
    removeItem,
    updateItem,
    handleSave,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preview
  }
}

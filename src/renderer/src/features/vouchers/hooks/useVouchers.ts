import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useVouchersStore } from '../store/vouchers.store'
import {
  exportDisbursementVoucher,
  exportDisbursementVoucherPdf,
  exportDisbursementVoucherDocx,
  buildDisbursementVoucherPdfDoc,
  exportJournalVoucher,
  exportJournalVoucherPdf,
  exportJournalVoucherDocx,
  buildJournalVoucherPdfDoc
} from '../lib/voucherExcelExport'
import type { Voucher, VoucherStatus } from '../types/vouchers.types'

export function useVouchers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:vouchers')
  const vouchers = useVouchersStore((s) => s.vouchers)
  const decideVoucher = useVouchersStore((s) => s.decideVoucher)
  const deleteVoucher = useVouchersStore((s) => s.deleteVoucher)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<Voucher | null>(null)
  const [advanceTarget, setAdvanceTarget] = useState<Voucher | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null)
  const preview = useDocumentPreview()
  const [previewVoucher, setPreviewVoucher] = useState<Voucher | null>(null)

  function openAdd() {
    setEditTarget(null)
    setShowDialog(true)
  }

  function openEdit(voucher: Voucher) {
    setEditTarget(voucher)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteVoucher(deleteTarget.id)
    toast.success(t('vouchers.toast.deleted'))
    setDeleteTarget(null)
  }
  const [search, setSearch] = useState('')

  const filteredVouchers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vouchers
    return vouchers.filter(
      (v) =>
        v.voucherNumber.toLowerCase().includes(q) ||
        v.payee.toLowerCase().includes(q) ||
        v.particulars.toLowerCase().includes(q)
    )
  }, [vouchers, search])

  function statusLabel(status: VoucherStatus) {
    if (status === 'pending') return t('common.pending')
    if (status === 'approved') return t('common.approved')
    if (status === 'posted') return t('vouchers.status.posted')
    return t('common.cancelled')
  }

  function nextStatus(v: Voucher): VoucherStatus {
    return v.status === 'pending' ? 'approved' : 'posted'
  }

  function handleConfirmAdvance() {
    if (!advanceTarget || !canManage) return
    const next = nextStatus(advanceTarget)
    decideVoucher(advanceTarget.id, next)
    toast.success(
      t('vouchers.toast.statusChanged', {
        number: advanceTarget.voucherNumber,
        status: statusLabel(next)
      })
    )
    setAdvanceTarget(null)
  }

  async function handleView(v: Voucher) {
    setPreviewVoucher(v)
    const doc =
      v.voucherType === 'check_voucher'
        ? await buildDisbursementVoucherPdfDoc(v)
        : await buildJournalVoucherPdfDoc(v)
    preview.openPreview(doc)
  }

  function handleExportExcel(v: Voucher) {
    if (v.voucherType === 'check_voucher') exportDisbursementVoucher(v)
    else exportJournalVoucher(v)
    toast.success(t('vouchers.toast.excelGenerated'))
  }

  function handleExportPdf(v: Voucher) {
    if (v.voucherType === 'check_voucher') exportDisbursementVoucherPdf(v)
    else exportJournalVoucherPdf(v)
    toast.success(t('vouchers.toast.pdfGenerated'))
  }

  function handleExportWord(v: Voucher) {
    if (v.voucherType === 'check_voucher') exportDisbursementVoucherDocx(v)
    else exportJournalVoucherDocx(v)
    toast.success(t('vouchers.toast.wordGenerated'))
  }

  return {
    loading,
    canManage,
    vouchers: filteredVouchers,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    advanceTarget,
    setAdvanceTarget,
    statusLabel,
    handleConfirmAdvance,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    handleView,
    preview,
    previewVoucher
  }
}

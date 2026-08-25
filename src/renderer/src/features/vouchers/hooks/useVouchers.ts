import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { useVouchersStore } from '../store/vouchers.store'
import {
  exportDisbursementVoucher,
  exportDisbursementVoucherPdf,
  exportDisbursementVoucherDocx,
  exportJournalVoucher,
  exportJournalVoucherPdf,
  exportJournalVoucherDocx
} from '../lib/voucherExcelExport'
import type { Voucher, VoucherStatus } from '../types/vouchers.types'

export function useVouchers() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const vouchers = useVouchersStore((s) => s.vouchers)
  const decideVoucher = useVouchersStore((s) => s.decideVoucher)

  const [showDialog, setShowDialog] = useState(false)
  const [advanceTarget, setAdvanceTarget] = useState<Voucher | null>(null)

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
    if (!advanceTarget) return
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
    vouchers,
    showDialog,
    setShowDialog,
    advanceTarget,
    setAdvanceTarget,
    statusLabel,
    handleConfirmAdvance,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  }
}

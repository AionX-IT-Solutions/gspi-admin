import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useAppStore } from '@/app/store/app.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { uploadFile } from '@/shared/lib/storageSync'
import { formatDate } from '@/shared/lib/utils'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useRentalsStore } from '@/features/rentals/store/rentals.store'
import { useTroopsStore } from '@/features/troops/store/troops.store'
import { useBanksStore, bankDisplayName } from '@/features/scrd/store/banks.store'
import { useDailyCollectionsStore } from '../store/dailyCollections.store'
import type {
  CashDepositLine,
  DailyCollectionAttachment,
  ManualReceiptLine
} from '../types/dailyCollection.types'
import {
  exportDailyCollectionsExcel,
  exportDailyCollectionsPdf,
  exportDailyCollectionsDocx,
  buildDailyCollectionsPdfDoc,
  type DailyCollectionsData,
  type DailyCollectionReceiptRow
} from '../lib/financialReportsExport'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function newManualLine(): ManualReceiptLine {
  return {
    id: crypto.randomUUID(),
    siNo: '',
    receivedFrom: '',
    nes: 0,
    bcFee: 0,
    csf: 0,
    iccg: 0,
    memReg: 0,
    rentals: 0
  }
}

function newDepositLine(): CashDepositLine {
  return { id: crypto.randomUUID(), bankId: '', bankName: '', saNo: '', purpose: '', amount: 0 }
}

const emptyReceiptTotals = { nes: 0, bcFee: 0, csf: 0, iccg: 0, memReg: 0, rentals: 0, amount: 0 }

export function useDailyCollectionsTab() {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:reports')
  const currentUser = useAppStore((s) => s.currentUser)

  const reports = useDailyCollectionsStore((s) => s.reports)
  const saveReportAction = useDailyCollectionsStore((s) => s.saveReport)
  const addAttachmentAction = useDailyCollectionsStore((s) => s.addAttachment)
  const deleteAttachmentAction = useDailyCollectionsStore((s) => s.deleteAttachment)

  const sales = usePOSStore((s) => s.sales)
  const bookings = useRentalsStore((s) => s.bookings)
  const spaces = useRentalsStore((s) => s.spaces)
  const scoutMembers = useTroopsStore((s) => s.scoutMembers)
  const troops = useTroopsStore((s) => s.troops)
  const banks = useBanksStore((s) => s.banks)

  const [selectedDate, setSelectedDate] = useState(todayIso())
  const existingReport = reports.find((r) => r.date === selectedDate) ?? null

  const [beginningBalance, setBeginningBalance] = useState(0)
  const [manualReceipts, setManualReceipts] = useState<ManualReceiptLine[]>([])
  const [deposits, setDeposits] = useState<CashDepositLine[]>([])
  const [attachments, setAttachments] = useState<DailyCollectionAttachment[]>([])
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  // Loads the saved report for the selected date, or seeds a blank one — carrying
  // forward the previous day's undeposited balance as a starting suggestion, same as
  // how the paper form's Beginning Balance is always yesterday's leftover cash.
  useEffect(() => {
    if (existingReport) {
      setBeginningBalance(existingReport.beginningBalance)
      setManualReceipts(existingReport.manualReceipts)
      setDeposits(existingReport.deposits)
      setAttachments(existingReport.attachments)
      return
    }
    const previous = reports
      .filter((r) => r.date < selectedDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0]
    const previousUndeposited = previous
      ? previous.beginningBalance +
        previous.manualReceipts.reduce(
          (s, l) => s + l.nes + l.bcFee + l.csf + l.iccg + l.memReg + l.rentals,
          0
        ) -
        previous.deposits.reduce((s, d) => s + d.amount, 0)
      : 0
    setBeginningBalance(Math.max(0, Math.round(previousUndeposited * 100) / 100))
    setManualReceipts([])
    setDeposits([])
    setAttachments([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, existingReport?.id])

  const autoReceiptRows: DailyCollectionReceiptRow[] = useMemo(() => {
    const rows: DailyCollectionReceiptRow[] = []

    for (const s of sales) {
      if (s.voided || s.createdAt.slice(0, 10) !== selectedDate) continue
      rows.push({
        siNo: s.saleNumber,
        receivedFrom: s.memberName ?? t('reports.dailyCollections.walkIn'),
        nes: s.totalAmount,
        bcFee: 0,
        csf: 0,
        iccg: 0,
        memReg: 0,
        rentals: 0,
        amount: s.totalAmount
      })
    }

    for (const b of bookings) {
      if (b.bookingDate !== selectedDate || (b.status !== 'confirmed' && b.status !== 'completed'))
        continue
      const amount = b.amountPaid ?? b.totalAmount
      rows.push({
        siNo: spaces.find((sp) => sp.id === b.rentalSpaceId)?.name ?? '',
        receivedFrom: b.renterName,
        nes: 0,
        bcFee: 0,
        csf: 0,
        iccg: 0,
        memReg: 0,
        rentals: amount,
        amount
      })
    }

    for (const m of scoutMembers) {
      const fee = m.registrationFee ?? 0
      if (fee <= 0 || m.renewedAt !== selectedDate) continue
      rows.push({
        siNo: troops.find((tr) => tr.id === m.troopId)?.troopNumber ?? '',
        receivedFrom: m.fullName,
        nes: 0,
        bcFee: 0,
        csf: 0,
        iccg: 0,
        memReg: fee,
        rentals: 0,
        amount: fee
      })
    }

    return rows
  }, [sales, bookings, spaces, scoutMembers, troops, selectedDate, t])

  const manualReceiptRows: DailyCollectionReceiptRow[] = useMemo(
    () =>
      manualReceipts.map((l) => ({
        siNo: l.siNo,
        receivedFrom: l.receivedFrom,
        nes: l.nes,
        bcFee: l.bcFee,
        csf: l.csf,
        iccg: l.iccg,
        memReg: l.memReg,
        rentals: l.rentals,
        amount: l.nes + l.bcFee + l.csf + l.iccg + l.memReg + l.rentals
      })),
    [manualReceipts]
  )

  const receiptRows = useMemo(
    () => [...autoReceiptRows, ...manualReceiptRows],
    [autoReceiptRows, manualReceiptRows]
  )

  const receiptTotals = useMemo(
    () =>
      receiptRows.reduce(
        (t, r) => ({
          nes: t.nes + r.nes,
          bcFee: t.bcFee + r.bcFee,
          csf: t.csf + r.csf,
          iccg: t.iccg + r.iccg,
          memReg: t.memReg + r.memReg,
          rentals: t.rentals + r.rentals,
          amount: t.amount + r.amount
        }),
        { ...emptyReceiptTotals }
      ),
    [receiptRows]
  )

  const totalCashCollection = receiptTotals.amount
  const totalCashOnHand = beginningBalance + totalCashCollection
  const totalDeposited = deposits.reduce((s, d) => s + d.amount, 0)
  const balanceUndeposited = totalCashOnHand - totalDeposited

  function addManualReceipt() {
    setManualReceipts((p) => [...p, newManualLine()])
  }
  function updateManualReceipt(id: string, patch: Partial<ManualReceiptLine>) {
    setManualReceipts((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  function removeManualReceipt(id: string) {
    setManualReceipts((p) => p.filter((l) => l.id !== id))
  }

  function addDeposit() {
    setDeposits((p) => [...p, newDepositLine()])
  }
  function updateDeposit(id: string, patch: Partial<CashDepositLine>) {
    setDeposits((p) => p.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }
  function setDepositBank(id: string, bankId: string) {
    const bank = banks.find((b) => b.id === bankId)
    setDeposits((p) =>
      p.map((d) =>
        d.id === id
          ? {
              ...d,
              bankId,
              bankName: bank ? bankDisplayName(bank) : '',
              saNo: bank?.accountNumber ?? ''
            }
          : d
      )
    )
  }
  function removeDeposit(id: string) {
    setDeposits((p) => p.filter((d) => d.id !== id))
  }

  function handleSave() {
    if (!canManage) return
    saveReportAction({
      date: selectedDate,
      beginningBalance,
      manualReceipts,
      deposits,
      preparedBy: existingReport?.preparedBy ?? currentUser?.fullName ?? 'System'
    })
    toast.success(t('reports.dailyCollections.toast.saved'))
  }

  async function handleUploadAttachment(file: File) {
    if (!canManage) return
    setUploadingAttachment(true)
    try {
      const path = `dailyCollectionAttachments/${selectedDate}/${Date.now()}-${file.name}`
      const url = await uploadFile(path, file)
      addAttachmentAction(selectedDate, {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        storagePath: path,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.fullName ?? 'System'
      })
      toast.success(t('reports.dailyCollections.toast.attachmentUploaded'))
    } catch {
      toast.error(t('reports.dailyCollections.toast.attachmentFailed'))
    } finally {
      setUploadingAttachment(false)
    }
  }

  function handleDeleteAttachment(attachmentId: string) {
    if (!canManage || !existingReport) return
    deleteAttachmentAction(existingReport.id, attachmentId)
  }

  const dateLabel = formatDate(selectedDate)
  const preparedByDisplay = existingReport?.preparedBy ?? currentUser?.fullName ?? ''

  function reportData(): DailyCollectionsData {
    return {
      dateLabel,
      preparedBy: preparedByDisplay,
      beginningBalance,
      receiptRows,
      receiptTotals,
      totalCashCollection,
      totalCashOnHand,
      depositRows: deposits.map((d) => ({
        bankName: d.bankName,
        saNo: d.saNo,
        purpose: d.purpose,
        amount: d.amount
      })),
      totalDeposited,
      balanceUndeposited
    }
  }

  async function handleView() {
    preview.openPreview(await buildDailyCollectionsPdfDoc(reportData()))
  }
  function handleExportExcel() {
    exportDailyCollectionsExcel(reportData())
    toast.success(t('reports.dailyCollections.toast.excel'))
  }
  function handleExportPdf() {
    exportDailyCollectionsPdf(reportData())
    toast.success(t('reports.dailyCollections.toast.pdf'))
  }
  function handleExportWord() {
    exportDailyCollectionsDocx(reportData())
    toast.success(t('reports.dailyCollections.toast.word'))
  }

  return {
    canManage,
    selectedDate,
    setSelectedDate,
    beginningBalance,
    setBeginningBalance,
    autoReceiptRows,
    manualReceipts,
    addManualReceipt,
    updateManualReceipt,
    removeManualReceipt,
    receiptTotals,
    totalCashCollection,
    totalCashOnHand,
    deposits,
    banks,
    addDeposit,
    updateDeposit,
    setDepositBank,
    removeDeposit,
    totalDeposited,
    balanceUndeposited,
    attachments,
    uploadingAttachment,
    handleUploadAttachment,
    handleDeleteAttachment,
    isSaved: !!existingReport,
    handleSave,
    preview,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord
  }
}

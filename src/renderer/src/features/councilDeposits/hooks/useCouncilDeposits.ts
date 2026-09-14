import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { formatDate } from '@/shared/lib/utils'
import { useCouncilDepositsStore, type CouncilDepositsEdit } from '../store/councilDeposits.store'
import { emptyCouncilDepositsRecord } from '../types/councilDeposits.types'
import {
  buildCouncilDepositsPdfDoc,
  exportCouncilDepositsExcel,
  exportCouncilDepositsDocx,
  exportCouncilDepositsPdf
} from '../lib/councilDepositsExport'

// Newest first — by As of Date when set, falling back to when the snapshot was saved.
function sortKey(r: { asOfDate: string | null; updatedAt: string }): string {
  return r.asOfDate ?? r.updatedAt
}

export function useCouncilDeposits() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:councilDeposits')
  const records = useCouncilDepositsStore((s) => s.records)
  const addRecord = useCouncilDepositsStore((s) => s.addRecord)
  const updateRecord = useCouncilDepositsStore((s) => s.updateRecord)
  const deleteRecord = useCouncilDepositsStore((s) => s.deleteRecord)
  const preview = useDocumentPreview()

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : -1)),
    [records]
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    if (selectedId && sortedRecords.some((r) => r.id === selectedId)) return
    setSelectedId(sortedRecords[0]?.id ?? null)
  }, [sortedRecords, selectedId])

  const record = sortedRecords.find((r) => r.id === selectedId) ?? emptyCouncilDepositsRecord()

  const dateOptions = sortedRecords.map((r) => ({
    value: r.id,
    label: r.asOfDate ? formatDate(r.asOfDate) : t('councilDeposits.undatedOption')
  }))

  function openAdd() {
    setIsNew(true)
    setShowEditModal(true)
  }

  function openEdit() {
    if (!selectedId) return
    setIsNew(false)
    setShowEditModal(true)
  }

  function handleSave(edit: CouncilDepositsEdit) {
    if (!canManage) return
    if (isNew || !selectedId) {
      const id = addRecord(edit)
      setSelectedId(id)
    } else {
      updateRecord(selectedId, edit)
    }
    toast.success(t('councilDeposits.toast.saved'))
    setShowEditModal(false)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteRecord(deleteTarget)
    toast.success(t('councilDeposits.toast.deleted'))
    setDeleteTarget(null)
  }

  async function handleView() {
    preview.openPreview(await buildCouncilDepositsPdfDoc(record))
  }

  function handleExportExcel() {
    exportCouncilDepositsExcel(record)
    toast.success(t('councilDeposits.toast.excelGenerated'))
  }

  function handleExportPdf() {
    exportCouncilDepositsPdf(record)
    toast.success(t('councilDeposits.toast.pdfGenerated'))
  }

  function handleExportWord() {
    exportCouncilDepositsDocx(record)
    toast.success(t('councilDeposits.toast.wordGenerated'))
  }

  return {
    record,
    hasRecords: sortedRecords.length > 0,
    dateOptions,
    selectedId,
    setSelectedId,
    canManage,
    showEditModal,
    setShowEditModal,
    isNew,
    openAdd,
    openEdit,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preview
  }
}

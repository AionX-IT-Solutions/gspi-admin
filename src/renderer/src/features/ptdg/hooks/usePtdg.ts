import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { usePtdgStore } from '../store/ptdg.store'
import {
  buildPtdgPdfDoc,
  exportPtdgApplication,
  exportPtdgDocx,
  exportPtdgPdf
} from '../lib/ptdgExport'
import type { PtdgApplication, PtdgStatus } from '../types/ptdg.types'

export function usePtdg() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:ptdg')
  const allApplications = usePtdgStore((s) => s.applications)
  const deleteApplication = usePtdgStore((s) => s.deleteApplication)
  const decideApplication = usePtdgStore((s) => s.decideApplication)
  const preview = useDocumentPreview()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | PtdgStatus>('all')

  const filterTabs: { key: 'all' | PtdgStatus; label: string }[] = [
    { key: 'all', label: t('ptdg.filter.all') },
    { key: 'draft', label: t('common.draft') },
    { key: 'submitted', label: t('ptdg.status.submitted') },
    { key: 'approved', label: t('ptdg.status.approved') },
    { key: 'disapproved', label: t('ptdg.status.disapproved') }
  ]

  const filtered = useMemo(() => {
    let list = allApplications
    if (filter !== 'all') list = list.filter((a) => a.status === filter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) => a.applicationNumber.toLowerCase().includes(q) || a.purpose.toLowerCase().includes(q)
      )
    }
    return list
  }, [allApplications, filter, search])

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<PtdgApplication | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PtdgApplication | null>(null)
  const [decisionTarget, setDecisionTarget] = useState<PtdgApplication | null>(null)
  const [previewApplication, setPreviewApplication] = useState<PtdgApplication | null>(null)

  function openAdd() {
    setEditTarget(null)
    setShowDialog(true)
  }

  function openEdit(application: PtdgApplication) {
    setEditTarget(application)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteApplication(deleteTarget.id)
    toast.success(t('ptdg.toast.deleted', { number: deleteTarget.applicationNumber }))
    setDeleteTarget(null)
  }

  function handleDecide(decision: {
    status: 'approved' | 'disapproved'
    regionalApprovedAmount?: number
    regionalRemarks?: string
  }) {
    if (!decisionTarget || !canManage) return
    decideApplication(decisionTarget.id, decision)
    toast.success(
      decision.status === 'approved'
        ? t('ptdg.toast.approved', { number: decisionTarget.applicationNumber })
        : t('ptdg.toast.disapproved', { number: decisionTarget.applicationNumber })
    )
    setDecisionTarget(null)
  }

  function statusLabel(status: PtdgStatus) {
    if (status === 'draft') return t('common.draft')
    return t(`ptdg.status.${status}`)
  }

  async function handleView(application: PtdgApplication) {
    setPreviewApplication(application)
    preview.openPreview(await buildPtdgPdfDoc(application))
  }

  function handleExportExcel(application: PtdgApplication) {
    exportPtdgApplication(application)
    toast.success(t('ptdg.toast.excelGenerated'))
  }

  function handleExportPdf(application: PtdgApplication) {
    exportPtdgPdf(application)
    toast.success(t('ptdg.toast.pdfGenerated'))
  }

  function handleExportWord(application: PtdgApplication) {
    exportPtdgDocx(application)
    toast.success(t('ptdg.toast.wordGenerated'))
  }

  return {
    loading,
    canManage,
    applications: filtered,
    search,
    setSearch,
    filter,
    setFilter,
    filterTabs,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    decisionTarget,
    setDecisionTarget,
    handleDecide,
    statusLabel,
    handleView,
    handleExportExcel,
    handleExportPdf,
    handleExportWord,
    preview,
    previewApplication
  }
}

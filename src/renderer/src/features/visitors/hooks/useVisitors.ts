import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useVisitorsStore } from '../store/visitors.store'
import type { VisitorLog } from '../types/visitors.types'
import { emptyVisitorForm, type VisitorFormState } from '../components/NewVisitorModal'

export function useVisitors() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:visitors')
  const visitors = useVisitorsStore((s) => s.visitors)
  const logVisitor = useVisitorsStore((s) => s.logVisitor)
  const checkOut = useVisitorsStore((s) => s.checkOut)
  const deleteVisitor = useVisitorsStore((s) => s.deleteVisitor)
  const restoreVisitor = useVisitorsStore((s) => s.restoreVisitor)

  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState<VisitorFormState>(emptyVisitorForm())
  const [deleteTarget, setDeleteTarget] = useState<VisitorLog | null>(null)
  const [checkOutTarget, setCheckOutTarget] = useState<VisitorLog | null>(null)

  const [search, setSearch] = useState('')

  const rows: VisitorLog[] = useMemo(
    () => [...visitors].sort((a, b) => (a.timeIn < b.timeIn ? 1 : -1)),
    [visitors]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q) ||
        r.personToVisit.toLowerCase().includes(q)
    )
  }, [rows, search])

  function openLogVisitor() {
    setForm(emptyVisitorForm())
    setShowDialog(true)
  }

  function handleSave() {
    if (!canManage) return
    if (!form.fullName.trim() || !form.purpose.trim() || !form.personToVisit.trim()) {
      toast.error(t('visitors.toast.validationRequired'))
      return
    }
    logVisitor({
      fullName: form.fullName.trim(),
      purpose: form.purpose.trim(),
      personToVisit: form.personToVisit.trim(),
      contactNumber: form.contactNumber.trim() || undefined
    })
    toast.success(t('visitors.toast.logged'))
    setShowDialog(false)
    setForm(emptyVisitorForm())
  }

  function handleConfirmCheckOut() {
    if (!checkOutTarget || !canManage) return
    checkOut(checkOutTarget.id)
    toast.success(t('visitors.toast.checkedOut'))
    setCheckOutTarget(null)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const deleted = deleteTarget
    deleteVisitor(deleted.id)
    toast.success(t('visitors.toast.deleted'), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => restoreVisitor(deleted) }
    })
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    rows: filteredRows,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    form,
    setForm,
    openLogVisitor,
    handleSave,
    checkOutTarget,
    setCheckOutTarget,
    handleConfirmCheckOut,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}

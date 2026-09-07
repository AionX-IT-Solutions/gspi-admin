import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useActivitiesStore } from '../store/activities.store'
import type { Activity, ActivityStatus } from '../types/activities.types'
import { emptyActivityForm, type ActivityFormState } from '../components/ActivityFormModal'

export function useActivities() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:activities')
  const activities = useActivitiesStore((s) => s.activities)
  const addActivity = useActivitiesStore((s) => s.addActivity)
  const updateActivity = useActivitiesStore((s) => s.updateActivity)
  const deleteActivity = useActivitiesStore((s) => s.deleteActivity)
  const restoreActivity = useActivitiesStore((s) => s.restoreActivity)
  const setStatus = useActivitiesStore((s) => s.setStatus)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<Activity | null>(null)
  const [form, setForm] = useState<ActivityFormState>(emptyActivityForm())
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null)

  const [search, setSearch] = useState('')

  const rows: Activity[] = useMemo(
    () => [...activities].sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
    [activities]
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.location ?? '').toLowerCase().includes(q) ||
        (r.organizer ?? '').toLowerCase().includes(q)
    )
  }, [rows, search])

  function openAddActivity() {
    setEditTarget(null)
    setForm(emptyActivityForm())
    setShowDialog(true)
  }

  function openEditActivity(activity: Activity) {
    setEditTarget(activity)
    setForm({
      title: activity.title,
      category: activity.category,
      description: activity.description ?? '',
      location: activity.location ?? '',
      organizer: activity.organizer ?? '',
      startDate: activity.startDate,
      endDate: activity.endDate ?? '',
      startTime: activity.startTime ?? '',
      endTime: activity.endTime ?? '',
      status: activity.status
    })
    setShowDialog(true)
  }

  function handleSave() {
    if (!canManage) return
    if (!form.title.trim() || !form.startDate) {
      toast.error(t('activities.toast.validationRequired'))
      return
    }
    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim() || undefined,
      location: form.location.trim() || undefined,
      organizer: form.organizer.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined
    }
    if (editTarget) {
      updateActivity(editTarget.id, { ...payload, status: form.status })
      toast.success(t('activities.toast.updated'))
    } else {
      addActivity(payload)
      toast.success(t('activities.toast.created'))
    }
    setShowDialog(false)
    setEditTarget(null)
    setForm(emptyActivityForm())
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const deleted = deleteTarget
    deleteActivity(deleted.id)
    toast.success(t('activities.toast.deleted'), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => restoreActivity(deleted) }
    })
    setDeleteTarget(null)
  }

  function changeStatus(activity: Activity, status: ActivityStatus) {
    if (!canManage) return
    setStatus(activity.id, status)
    toast.success(t('activities.toast.statusUpdated'))
  }

  return {
    loading,
    canManage,
    rows: filteredRows,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    form,
    setForm,
    openAddActivity,
    openEditActivity,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    changeStatus
  }
}

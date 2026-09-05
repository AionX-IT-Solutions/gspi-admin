import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useAnnouncementsStore } from '../store/announcements.store'
import type { Announcement } from '../types/announcements.types'
import { emptyAnnouncementForm, type AnnouncementFormState } from '../components/AnnouncementModal'

export function useAnnouncements() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:announcements')
  const announcements = useAnnouncementsStore((s) => s.announcements)
  const createAnnouncement = useAnnouncementsStore((s) => s.createAnnouncement)
  const updateAnnouncement = useAnnouncementsStore((s) => s.updateAnnouncement)
  const deleteAnnouncement = useAnnouncementsStore((s) => s.deleteAnnouncement)
  const restoreAnnouncement = useAnnouncementsStore((s) => s.restoreAnnouncement)
  const togglePin = useAnnouncementsStore((s) => s.togglePin)

  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState<AnnouncementFormState>(emptyAnnouncementForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)

  const rows: Announcement[] = useMemo(
    () =>
      [...announcements].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return a.createdAt < b.createdAt ? 1 : -1
      }),
    [announcements]
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyAnnouncementForm())
    setShowDialog(true)
  }

  function openEdit(announcement: Announcement) {
    setEditingId(announcement.id)
    setForm({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      pinned: announcement.pinned
    })
    setShowDialog(true)
  }

  function handleSave() {
    if (!canManage) return
    if (!form.title.trim() || !form.message.trim()) {
      toast.error(t('announcements.toast.validationRequired'))
      return
    }
    const input = {
      title: form.title.trim(),
      message: form.message.trim(),
      priority: form.priority,
      pinned: form.pinned
    }
    if (editingId) {
      updateAnnouncement(editingId, input)
      toast.success(t('announcements.toast.updated'))
    } else {
      createAnnouncement(input)
      toast.success(t('announcements.toast.posted'))
    }
    setShowDialog(false)
    setForm(emptyAnnouncementForm())
    setEditingId(null)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const deleted = deleteTarget
    deleteAnnouncement(deleted.id)
    toast.success(t('announcements.toast.deleted'), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => restoreAnnouncement(deleted) }
    })
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    rows,
    showDialog,
    setShowDialog,
    form,
    setForm,
    editingId,
    openCreate,
    openEdit,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    togglePin
  }
}

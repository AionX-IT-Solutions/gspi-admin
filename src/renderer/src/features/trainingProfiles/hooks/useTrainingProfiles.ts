import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useTrainingProfilesStore } from '../store/trainingProfiles.store'
import type { TrainingProfile } from '../types/trainingProfiles.types'

export function useTrainingProfiles() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:trainingProfiles')
  const profiles = useTrainingProfilesStore((s) => s.profiles)
  const deleteProfile = useTrainingProfilesStore((s) => s.deleteProfile)

  const [showDialog, setShowDialog] = useState(false)
  const [editTarget, setEditTarget] = useState<TrainingProfile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TrainingProfile | null>(null)
  const [search, setSearch] = useState('')

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
    )
  }, [profiles, search])

  function openAdd() {
    setEditTarget(null)
    setShowDialog(true)
  }

  function openEdit(profile: TrainingProfile) {
    setEditTarget(profile)
    setShowDialog(true)
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    deleteProfile(deleteTarget.id)
    toast.success(t('trainingProfiles.toast.deleted'))
    setDeleteTarget(null)
  }

  return {
    loading,
    canManage,
    profiles: filteredProfiles,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  }
}

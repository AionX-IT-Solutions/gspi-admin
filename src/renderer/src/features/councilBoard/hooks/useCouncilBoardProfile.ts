import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { uploadFile, deleteFile } from '@/shared/lib/storageSync'
import { compressFile } from '@/shared/lib/compress'
import { useCouncilBoardStore } from '../store/councilBoard.store'
import type { CouncilBoardMember } from '../types/councilBoard.types'

export function useCouncilBoardProfile(member: CouncilBoardMember | null) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:councilBoard')
  const updateMember = useCouncilBoardStore((s) => s.updateMember)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [confirmingPhotoDelete, setConfirmingPhotoDelete] = useState(false)

  async function handlePhotoChange(file: File) {
    if (!member) return
    setUploadingPhoto(true)
    try {
      const toUpload = await compressFile(file)
      const path = `councilBoardPhotos/${member.id}/${Date.now()}-${toUpload.name}`
      const url = await uploadFile(path, toUpload)
      const previousPath = member.photoStoragePath
      updateMember(member.id, { photoUrl: url, photoStoragePath: path })
      if (previousPath) deleteFile(previousPath)
      toast.success(t('councilBoard.profile.toast.photoUpdated'))
    } catch {
      toast.error(t('councilBoard.profile.toast.photoFailed'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  function handleConfirmDeletePhoto() {
    if (!member) return
    const previousPath = member.photoStoragePath
    updateMember(member.id, { photoUrl: undefined, photoStoragePath: undefined })
    if (previousPath) deleteFile(previousPath)
    toast.success(t('councilBoard.profile.toast.photoRemoved'))
    setConfirmingPhotoDelete(false)
  }

  return {
    canManage,
    uploadingPhoto,
    handlePhotoChange,
    confirmingPhotoDelete,
    setConfirmingPhotoDelete,
    handleConfirmDeletePhoto
  }
}

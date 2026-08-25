import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app.store'
import { useToast } from '@/app/hooks/useToast'
import { uploadFile } from '@/shared/lib/storageSync'
import { setStaffUserPhoto } from '@/features/users/lib/staffUserFunctions'

export function useProfile() {
  const { t } = useTranslation()
  const toast = useToast()
  const currentUser = useAppStore((s) => s.currentUser)
  const setCurrentUserPhoto = useAppStore((s) => s.setCurrentUserPhoto)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function handlePhotoChange(file: File) {
    if (!currentUser) return
    setUploadingPhoto(true)
    try {
      const path = `userPhotos/${currentUser.id}/${Date.now()}-${file.name}`
      const url = await uploadFile(path, file)
      await setStaffUserPhoto(currentUser.id, url)
      setCurrentUserPhoto(url)
      toast.success(t('profile.toast.photoUpdated'))
    } catch {
      toast.error(t('profile.toast.photoFailed'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  return { currentUser, uploadingPhoto, handlePhotoChange }
}

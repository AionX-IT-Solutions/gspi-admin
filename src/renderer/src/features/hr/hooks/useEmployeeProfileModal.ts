import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHRStore } from '../store/hr.store'
import { useAppStore } from '@/app/store/app.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { uploadFile, downloadFile, deleteFile } from '@/shared/lib/storageSync'
import { compressFile } from '@/shared/lib/compress'
import type { Employee, EmployeeDocument, EmployeeDocumentType } from '../types/hr.types'

export function useEmployeeProfileModal(employee: Employee | null) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:employees')
  const currentUser = useAppStore((s) => s.currentUser)
  const employeeDocuments = useHRStore((s) => s.employeeDocuments)
  const updateEmployee = useHRStore((s) => s.updateEmployee)
  const addEmployeeDocument = useHRStore((s) => s.addEmployeeDocument)
  const deleteEmployeeDocument = useHRStore((s) => s.deleteEmployeeDocument)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [confirmingPhotoDelete, setConfirmingPhotoDelete] = useState(false)
  const [docType, setDocType] = useState<EmployeeDocumentType>('resume')
  const [docLabel, setDocLabel] = useState('')
  const [docFiles, setDocFiles] = useState<File[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function addDocFiles(files: File[]) {
    setDocFiles((prev) => [...prev, ...files])
  }

  function removeDocFile(index: number) {
    setDocFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const documents = employee ? employeeDocuments.filter((d) => d.employeeId === employee.id) : []

  async function handlePhotoChange(file: File) {
    if (!employee) return
    setUploadingPhoto(true)
    try {
      const toUpload = await compressFile(file)
      const path = `employeePhotos/${employee.id}/${Date.now()}-${toUpload.name}`
      const url = await uploadFile(path, toUpload)
      const previousPath = employee.photoStoragePath
      updateEmployee(employee.id, { photoUrl: url, photoStoragePath: path })
      if (previousPath) deleteFile(previousPath)
      toast.success(t('employees.profile.toast.photoUpdated'))
    } catch {
      toast.error(t('employees.profile.toast.photoFailed'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  function handleConfirmDeletePhoto() {
    if (!employee) return
    const previousPath = employee.photoStoragePath
    updateEmployee(employee.id, { photoUrl: undefined, photoStoragePath: undefined })
    if (previousPath) deleteFile(previousPath)
    toast.success(t('employees.profile.toast.photoRemoved'))
    setConfirmingPhotoDelete(false)
  }

  async function handleUploadDocument() {
    if (!employee || docFiles.length === 0) return
    setUploadingDoc(true)
    try {
      const singleLabel = docFiles.length === 1 ? docLabel.trim() : ''
      for (const file of docFiles) {
        const toUpload = await compressFile(file)
        const path = `employeeDocuments/${employee.id}/${Date.now()}-${toUpload.name}`
        const url = await uploadFile(path, toUpload)
        addEmployeeDocument({
          id: crypto.randomUUID(),
          employeeId: employee.id,
          type: docType,
          name: singleLabel || file.name,
          url,
          storagePath: path,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.fullName ?? 'System'
        })
      }
      toast.success(t('employees.profile.toast.documentUploaded'))
      setDocFiles([])
      setDocLabel('')
      setDocType('resume')
    } catch {
      toast.error(t('employees.profile.toast.documentFailed'))
    } finally {
      setUploadingDoc(false)
    }
  }

  async function handleDownloadDocument(doc: EmployeeDocument) {
    try {
      await downloadFile(doc.url, doc.name)
    } catch {
      toast.error(t('employees.profile.toast.documentDownloadFailed'))
    }
  }

  function handleConfirmDeleteDocument() {
    if (!deleteTarget) return
    deleteEmployeeDocument(deleteTarget)
    toast.success(t('employees.profile.toast.documentDeleted'))
    setDeleteTarget(null)
  }

  return {
    canManage,
    documents,
    uploadingPhoto,
    handlePhotoChange,
    confirmingPhotoDelete,
    setConfirmingPhotoDelete,
    handleConfirmDeletePhoto,
    docType,
    setDocType,
    docLabel,
    setDocLabel,
    docFiles,
    addDocFiles,
    removeDocFile,
    uploadingDoc,
    handleUploadDocument,
    handleDownloadDocument,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteDocument
  }
}

import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, Download, ExternalLink, FileText, Trash2, Upload, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { Card } from '@/shared/components/ui/Card'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatDate } from '@/shared/lib/utils'
import FileDropzone from '@/shared/components/FileDropzone'
import { useHRStore } from '../store/hr.store'
import { useEmployeeProfileModal } from '../hooks/useEmployeeProfileModal'
import type { EmployeeDocumentType } from '../types/hr.types'

export function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const employee = useHRStore((s) => s.employees.find((e) => e.id === id) ?? null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const {
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
  } = useEmployeeProfileModal(employee)

  if (!employee) return null

  return (
    <div className="page-wrapper">
      <PageHeader
        title={employee.fullName}
        subtitle={employee.position}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/employees')}
            leftIcon={<ArrowLeft size={14} />}
          >
            {t('common.back')}
          </Button>
        }
      />

      <Card padding="16px">
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 140, textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <div
                style={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: `${employee.avatarColor}22`,
                  border: `1px solid ${employee.avatarColor}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 700,
                  color: employee.avatarColor,
                  margin: '0 auto'
                }}
              >
                {employee.photoUrl ? (
                  <img
                    src={employee.photoUrl}
                    alt={employee.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  employee.fullName.slice(0, 2).toUpperCase()
                )}
                {uploadingPhoto && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.45)'
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.35)',
                        borderTopColor: '#fff',
                        animation: 'spin 0.8s linear infinite'
                      }}
                    />
                  </div>
                )}
              </div>
              {canManage && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handlePhotoChange(f)
                      e.currentTarget.value = ''
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Camera size={12} />}
                    loading={uploadingPhoto}
                    disabled={uploadingPhoto}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {uploadingPhoto
                      ? t('employees.profile.uploadingPhoto')
                      : t('employees.profile.changePhoto')}
                  </Button>
                  {employee.photoUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={12} color="#f87171" />}
                      disabled={uploadingPhoto}
                      onClick={() => setConfirmingPhotoDelete(true)}
                    >
                      {t('employees.profile.removePhoto')}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{employee.employeeNumber}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>
                {formatDate(employee.hireDate)}
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('employees.form.department')}
                </div>
                <div style={{ fontSize: 14 }}>{employee.department || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('employees.form.branch')}
                </div>
                <div style={{ fontSize: 14 }}>{employee.branch || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('employees.form.email')}
                </div>
                <div style={{ fontSize: 14 }}>{employee.email || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('employees.form.phone')}
                </div>
                <div style={{ fontSize: 14 }}>{employee.phone || '—'}</div>
              </div>
            </div>

            <div
              style={{
                marginBottom: 12,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}
            >
              {t('employees.profile.documentsHeading')}
            </div>

            {documents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                {t('employees.profile.noDocuments')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <FileText size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 13,
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {doc.name}
                        </span>
                        <Badge variant="outline">
                          {t(`employees.profile.documentTypes.${doc.type}`)}
                        </Badge>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatDate(doc.uploadedAt)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(doc.url, '_blank')}
                      title={t('employees.profile.viewDocument')}
                    >
                      <ExternalLink size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadDocument(doc)}
                      title={t('employees.profile.downloadDocument')}
                    >
                      <Download size={13} />
                    </Button>
                    {canManage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(doc.id)}
                        title={t('common.delete')}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {canManage && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: 12,
                  borderRadius: 8,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <FieldSelect
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as EmployeeDocumentType)}
                    options={[
                      { value: 'resume', label: t('employees.profile.documentTypes.resume') },
                      {
                        value: 'transcript',
                        label: t('employees.profile.documentTypes.transcript')
                      },
                      {
                        value: 'certification',
                        label: t('employees.profile.documentTypes.certification')
                      },
                      { value: 'other', label: t('employees.profile.documentTypes.other') }
                    ]}
                    style={{ width: 180 }}
                  />
                  <FieldInput
                    value={docLabel}
                    onChange={(e) => setDocLabel(e.target.value)}
                    placeholder={t('employees.profile.documentLabelPlaceholder')}
                    style={{ flex: 1, minWidth: 180 }}
                    disabled={docFiles.length > 1}
                  />
                </div>
                <FileDropzone
                  files={docFiles}
                  onSelect={addDocFiles}
                  onRemove={removeDocFile}
                  label={t('employees.profile.chooseFiles')}
                  uploading={uploadingDoc}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Upload size={12} />}
                    onClick={handleUploadDocument}
                    disabled={docFiles.length === 0 || uploadingDoc}
                  >
                    {t('employees.profile.uploadButton')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('employees.profile.confirmDeleteDocument.title')}
        message={t('employees.profile.confirmDeleteDocument.message')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteDocument}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={confirmingPhotoDelete}
        title={t('employees.profile.confirmDeletePhoto.title')}
        message={t('employees.profile.confirmDeletePhoto.message')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeletePhoto}
        onCancel={() => setConfirmingPhotoDelete(false)}
      />
    </div>
  )
}

export default EmployeeProfile

import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, Trash2, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatDate } from '@/shared/lib/utils'
import { useCouncilBoardStore } from '../store/councilBoard.store'
import { useCouncilBoardProfile } from '../hooks/useCouncilBoardProfile'

export function CouncilBoardProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const members = useCouncilBoardStore((s) => s.members)
  const member = members.find((m) => m.id === id) ?? null
  const reportsTo = member?.reportsToId
    ? (members.find((m) => m.id === member.reportsToId) ?? null)
    : null
  const photoInputRef = useRef<HTMLInputElement>(null)

  const {
    canManage,
    uploadingPhoto,
    handlePhotoChange,
    confirmingPhotoDelete,
    setConfirmingPhotoDelete,
    handleConfirmDeletePhoto
  } = useCouncilBoardProfile(member)

  if (!member) return null

  return (
    <div className="page-wrapper">
      <PageHeader
        title={member.fullName}
        subtitle={member.position}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/council-board')}
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
                  background: `${member.avatarColor}22`,
                  border: `1px solid ${member.avatarColor}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 700,
                  color: member.avatarColor,
                  margin: '0 auto'
                }}
              >
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  member.fullName.slice(0, 2).toUpperCase()
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
                      ? t('councilBoard.profile.uploadingPhoto')
                      : t('councilBoard.profile.changePhoto')}
                  </Button>
                  {member.photoUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={12} color="#f87171" />}
                      disabled={uploadingPhoto}
                      onClick={() => setConfirmingPhotoDelete(true)}
                    >
                      {t('councilBoard.profile.removePhoto')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('councilBoard.form.position')}
                </div>
                <div style={{ fontSize: 14 }}>{member.position}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('councilBoard.form.reportsTo')}
                </div>
                <div style={{ fontSize: 14 }}>
                  {reportsTo ? reportsTo.fullName : t('councilBoard.form.noSuperior')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('councilBoard.form.contactNumber')}
                </div>
                <div style={{ fontSize: 14 }}>{member.contactNumber || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('councilBoard.form.email')}
                </div>
                <div style={{ fontSize: 14 }}>{member.email || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {t('councilBoard.form.birthDate')}
                </div>
                <div style={{ fontSize: 14 }}>
                  {member.birthDate ? formatDate(member.birthDate) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmingPhotoDelete}
        title={t('councilBoard.profile.confirmDeletePhoto.title')}
        message={t('councilBoard.profile.confirmDeletePhoto.message')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeletePhoto}
        onCancel={() => setConfirmingPhotoDelete(false)}
      />
    </div>
  )
}

export default CouncilBoardProfile

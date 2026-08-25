import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { SecuritySection } from '@/features/settings/components/SecuritySection'
import { useRoleLabel } from '@/app/hooks/useRoleLabel'
import { useProfile } from '../hooks/useProfile'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Profile() {
  const { t } = useTranslation()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const { currentUser, uploadingPhoto, handlePhotoChange } = useProfile()
  const roleLabel = useRoleLabel(currentUser?.role)

  const initials = (currentUser?.fullName ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <motion.div
      key="profile"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}
        >
          {t('profile.title')}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('profile.subtitle')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background:
                    'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 0 16px var(--accent-primary-glow)'
                }}
              >
                {currentUser?.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                title={t('profile.changePhoto')}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  border: '2px solid var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploadingPhoto ? 'default' : 'pointer',
                  color: 'white'
                }}
              >
                <Camera size={12} />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoChange(file)
                  e.target.value = ''
                }}
              />
            </div>

            <div>
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 2
                }}
              >
                {currentUser?.fullName}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                {currentUser?.email}
              </p>
              {currentUser?.role && <Badge variant="primary">{roleLabel}</Badge>}
            </div>
          </div>
        </Card>

        <SecuritySection />
      </div>
    </motion.div>
  )
}

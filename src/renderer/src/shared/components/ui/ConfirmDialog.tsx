import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  danger = false,
  loading = false
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  if (!open) return null

  const iconBg = danger ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'
  const iconColor = danger ? '#f87171' : '#fbbf24'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,15,35,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}
        onClick={onCancel}
      />
      <div
        className="animate-scale-in"
        style={{
          position: 'relative',
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.09)',
          borderRadius: '16px',
          overflow: 'hidden',
          maxWidth: 420,
          width: '100%',
          boxShadow:
            '0 24px 80px rgba(0,0,0,0.22), 0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(99,102,241,0.06)'
        }}
      >
        {/* Indigo gradient top accent */}
        <div
          style={{
            height: 4,
            background: danger
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : 'linear-gradient(90deg, #6366f1 0%, #818cf8 55%, #a78bfa 100%)',
            flexShrink: 0
          }}
        />

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '24px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={18} color={iconColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#12122a',
                marginBottom: 6,
                margin: 0
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, margin: 0, marginTop: 6 }}>
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '16px 24px 24px',
            borderTop: '1px solid rgba(0,0,0,0.07)'
          }}
        >
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('common.processing') : (confirmLabel ?? t('common.confirm'))}
          </Button>
        </div>
      </div>
    </div>
  )
}

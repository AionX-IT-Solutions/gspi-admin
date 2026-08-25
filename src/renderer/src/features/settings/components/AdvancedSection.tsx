import { AlertTriangle, RotateCcw, Settings as SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { SectionHeader } from './primitives'
import { useAdvancedSection } from '../hooks/useAdvancedSection'

export function AdvancedSection() {
  const { t } = useTranslation()
  const { resetModalOpen, setResetModalOpen, handleReset } = useAdvancedSection()

  return (
    <>
      <Card
        header={
          <SectionHeader
            icon={<SettingsIcon size={18} />}
            title={t('settings.advanced')}
            description={t('settings.advancedDesc')}
          />
        }
        padding="20px"
      >
        <div
          style={{
            padding: '16px',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('settings.resetSettings')}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {t('settings.resetSettingsDesc')}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<RotateCcw size={13} />}
            onClick={() => setResetModalOpen(true)}
            style={{ flexShrink: 0 }}
          >
            {t('common.reset')}
          </Button>
        </div>
      </Card>

      <Modal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title={t('settings.resetConfirmTitle')}
        description={t('settings.resetConfirmDesc')}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<RotateCcw size={13} />}
              onClick={handleReset}
            >
              {t('common.reset')}
            </Button>
          </>
        }
      >
        <div
          style={{
            padding: '14px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '10px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}
        >
          <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '1px', flexShrink: 0 }} />
          <div>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}
            >
              The following will be reset:
            </p>
            <ul
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                paddingLeft: '16px',
                lineHeight: '1.8'
              }}
            >
              <li>Accent color → Indigo</li>
              <li>Font size → 14px</li>
              <li>All notification preferences</li>
              <li>Privacy settings</li>
              <li>Compact mode → Off</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}

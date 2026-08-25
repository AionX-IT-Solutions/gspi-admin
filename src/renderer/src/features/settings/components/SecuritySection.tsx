import { KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { SectionHeader } from './primitives'
import { useSecuritySection } from '../hooks/useSecuritySection'

export function SecuritySection() {
  const { t } = useTranslation()
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    submitting,
    handleSubmit
  } = useSecuritySection()

  return (
    <Card
      header={
        <SectionHeader
          icon={<KeyRound size={18} />}
          title={t('settings.security.title')}
          description={t('settings.security.description')}
        />
      }
      padding="20px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
        <FormField label={t('settings.security.currentPasswordLabel')} required>
          <FieldInput
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </FormField>
        <FormField label={t('settings.security.newPasswordLabel')} required>
          <FieldInput
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormField>
        <FormField label={t('settings.security.confirmPasswordLabel')} required>
          <FieldInput
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormField>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ alignSelf: 'flex-start' }}
        >
          {t('settings.security.updateButton')}
        </Button>
      </div>
    </Card>
  )
}

import { Fingerprint } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { SectionHeader } from './primitives'
import { useBiometricDeviceSection } from '../hooks/useBiometricDeviceSection'

const STATUS_VARIANT = {
  disconnected: 'outline',
  connecting: 'warning',
  connected: 'success',
  error: 'danger'
} as const

export function BiometricDeviceSection() {
  const { t } = useTranslation()
  const {
    form,
    setForm,
    hasPassword,
    status,
    saving,
    testing,
    connecting,
    handleSave,
    handleTestConnection,
    handleConnect,
    handleDisconnect
  } = useBiometricDeviceSection()

  return (
    <Card
      header={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <SectionHeader
            icon={<Fingerprint size={18} />}
            title={t('settings.biometricDevice.title')}
            description={t('settings.biometricDevice.description')}
          />
          <Badge variant={STATUS_VARIANT[status.state]}>
            {t(`settings.biometricDevice.status.${status.state}`)}
          </Badge>
        </div>
      }
      padding="20px"
    >
      {status.state === 'connected' && (status.deviceModel || status.serialNumber) && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          {status.deviceModel}
          {status.serialNumber ? ` · S/N ${status.serialNumber}` : ''}
          {status.firmwareVersion ? ` · FW ${status.firmwareVersion}` : ''}
        </p>
      )}
      {status.state === 'error' && status.error && (
        <p style={{ fontSize: 12, color: '#f87171', marginBottom: 14 }}>{status.error}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, maxWidth: 480 }}>
        <FormField label={t('settings.biometricDevice.hostLabel')} required>
          <FieldInput
            placeholder="192.168.1.64"
            value={form.host}
            onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
          />
        </FormField>
        <FormField label={t('settings.biometricDevice.portLabel')} required>
          <FieldInput
            type="number"
            value={form.port}
            onChange={(e) => setForm((f) => ({ ...f, port: Number(e.target.value) || 80 }))}
          />
        </FormField>
        <FormField label={t('settings.biometricDevice.usernameLabel')} required>
          <FieldInput
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />
        </FormField>
        <FormField label={t('settings.biometricDevice.passwordLabel')}>
          <FieldInput
            type="password"
            autoComplete="off"
            placeholder={hasPassword ? t('settings.biometricDevice.passwordSavedPlaceholder') : ''}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {t('common.save')}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleTestConnection} disabled={testing}>
          {t('settings.biometricDevice.testButton')}
        </Button>
        {status.state === 'connected' ? (
          <Button variant="secondary" size="sm" onClick={handleDisconnect}>
            {t('settings.biometricDevice.disconnectButton')}
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleConnect} disabled={connecting}>
            {t('settings.biometricDevice.connectButton')}
          </Button>
        )}
      </div>
    </Card>
  )
}

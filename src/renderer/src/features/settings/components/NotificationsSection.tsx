import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { SettingRow, SectionHeader, StyledSwitch } from './primitives'
import { useNotificationsSection } from '../hooks/useNotificationsSection'

export function NotificationsSection() {
  const { t } = useTranslation()
  const {
    notificationsEnabled,
    soundEnabled,
    updateNotifs,
    securityAlerts,
    handleNotificationsChange,
    handleSoundChange,
    handleUpdateNotifsChange,
    handleSecurityAlertsChange
  } = useNotificationsSection()

  return (
    <Card
      header={
        <SectionHeader
          icon={<Bell size={18} />}
          title={t('settings.notifications')}
          description={t('settings.notificationsDesc')}
        />
      }
      padding="20px"
    >
      <div>
        <SettingRow
          label={t('settings.enableNotifications')}
          description={t('settings.enableNotificationsDesc')}
        >
          <StyledSwitch
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsChange}
          />
        </SettingRow>
        <SettingRow label={t('settings.soundAlerts')} description={t('settings.soundAlertsDesc')}>
          <StyledSwitch checked={soundEnabled} onCheckedChange={handleSoundChange} />
        </SettingRow>
        <SettingRow
          label={t('settings.updateNotifications')}
          description={t('settings.updateNotificationsDesc')}
        >
          <StyledSwitch checked={updateNotifs} onCheckedChange={handleUpdateNotifsChange} />
        </SettingRow>
        <SettingRow
          label={t('settings.securityAlerts')}
          description={t('settings.securityAlertsDesc')}
        >
          <StyledSwitch checked={securityAlerts} onCheckedChange={handleSecurityAlertsChange} />
        </SettingRow>
      </div>
    </Card>
  )
}

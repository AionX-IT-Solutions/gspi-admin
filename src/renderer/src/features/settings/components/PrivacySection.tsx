import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { SettingRow, SectionHeader, StyledSwitch } from './primitives'
import { usePrivacySection } from '../hooks/usePrivacySection'

export function PrivacySection() {
  const { t } = useTranslation()
  const { dataCollection, crashReports, handleDataCollectionChange, handleCrashReportsChange } =
    usePrivacySection()

  return (
    <Card
      header={
        <SectionHeader
          icon={<Shield size={18} />}
          title={t('settings.privacy')}
          description={t('settings.privacyDesc')}
        />
      }
      padding="20px"
    >
      <div>
        <SettingRow
          label={t('settings.dataCollection')}
          description={t('settings.dataCollectionDesc')}
        >
          <StyledSwitch checked={dataCollection} onCheckedChange={handleDataCollectionChange} />
        </SettingRow>
        <SettingRow label={t('settings.crashReports')} description={t('settings.crashReportsDesc')}>
          <StyledSwitch checked={crashReports} onCheckedChange={handleCrashReportsChange} />
        </SettingRow>
      </div>
    </Card>
  )
}

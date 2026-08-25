import { CalendarRange } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { FormField, FieldSelect } from '@/shared/components/ui/FormField'
import { SectionHeader } from './primitives'
import { useMembershipYearSection } from '../hooks/useMembershipYearSection'

export function MembershipYearSection() {
  const { t } = useTranslation()
  const { startMonth, currentLabel, canEdit, handleChange } = useMembershipYearSection()

  const monthOptions = (
    t('settings.membershipYear.months', { returnObjects: true }) as string[]
  ).map((label, i) => ({
    value: String(i + 1),
    label
  }))

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
            icon={<CalendarRange size={18} />}
            title={t('settings.membershipYear.title')}
            description={t('settings.membershipYear.description')}
          />
          <Badge variant="primary">
            {t('settings.membershipYear.currentCycle', { year: currentLabel })}
          </Badge>
        </div>
      }
      padding="20px"
    >
      <div style={{ maxWidth: 320 }}>
        <FormField label={t('settings.membershipYear.startMonthLabel')}>
          <FieldSelect
            options={monthOptions}
            value={String(startMonth)}
            disabled={!canEdit}
            onChange={(e) => handleChange(Number(e.target.value))}
          />
        </FormField>
      </div>

      {!canEdit && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          {t('settings.membershipYear.adminOnlyNote')}
        </p>
      )}
    </Card>
  )
}

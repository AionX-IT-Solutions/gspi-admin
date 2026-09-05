import { useEffect, useState } from 'react'
import { Gift } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { SectionHeader } from './primitives'
import { usePayrollSettingsSection } from '../hooks/usePayrollSettingsSection'

export function PayrollSettingsSection() {
  const { t } = useTranslation()
  const { defaultCashGift, canEdit, handleChange } = usePayrollSettingsSection()
  const [value, setValue] = useState(String(defaultCashGift))

  useEffect(() => {
    setValue(String(defaultCashGift))
  }, [defaultCashGift])

  function commit() {
    const amount = Math.max(0, parseFloat(value) || 0)
    setValue(String(amount))
    if (amount !== defaultCashGift) handleChange(amount)
  }

  return (
    <Card
      header={
        <SectionHeader
          icon={<Gift size={18} />}
          title={t('settings.payroll.title')}
          description={t('settings.payroll.description')}
        />
      }
      padding="20px"
    >
      <div style={{ maxWidth: 220 }}>
        <FormField label={t('settings.payroll.cashGiftLabel')}>
          <FieldInput
            type="number"
            min={0}
            value={value}
            disabled={!canEdit}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
          />
        </FormField>
      </div>

      {!canEdit && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          {t('settings.payroll.adminOnlyNote')}
        </p>
      )}
    </Card>
  )
}

import { Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldSelect } from '@/shared/components/ui/FormField'
import { SectionHeader, SettingRow, StyledSwitch } from './primitives'
import { usePrinterSection } from '../hooks/usePrinterSection'

export function ReceiptPrinterSection() {
  const { t } = useTranslation()
  const {
    printers,
    config,
    loading,
    testing,
    setDeviceName,
    setAutoPrintReceipt,
    handleTestPrint
  } = usePrinterSection()

  const options = [
    { value: '', label: t('settings.receiptPrinter.systemDefault') },
    ...printers.map((p) => ({
      value: p.name,
      label: p.isDefault
        ? `${p.displayName} (${t('settings.receiptPrinter.default')})`
        : p.displayName
    }))
  ]

  return (
    <Card
      header={
        <SectionHeader
          icon={<Printer size={18} />}
          title={t('settings.receiptPrinter.title')}
          description={t('settings.receiptPrinter.description')}
        />
      }
      padding="20px"
    >
      <div style={{ maxWidth: 420, marginBottom: 8 }}>
        <FormField label={t('settings.receiptPrinter.printerLabel')}>
          <FieldSelect
            options={options}
            value={config.deviceName ?? ''}
            onChange={(e) => setDeviceName(e.target.value || null)}
            disabled={loading}
          />
        </FormField>
      </div>

      <SettingRow
        label={t('settings.receiptPrinter.autoPrintLabel')}
        description={t('settings.receiptPrinter.autoPrintDesc')}
      >
        <StyledSwitch checked={config.autoPrintReceipt} onCheckedChange={setAutoPrintReceipt} />
      </SettingRow>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTestPrint}
          disabled={testing || loading}
        >
          {t('settings.receiptPrinter.testButton')}
        </Button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14 }}>
        {t('settings.receiptPrinter.drawerNote')}
      </p>
    </Card>
  )
}

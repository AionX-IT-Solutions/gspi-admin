import { Barcode, Bluetooth, ScanLine, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { useElectron } from '@/app/hooks/useElectron'
import { SectionHeader } from './primitives'
import { useBarcodeScannerSection } from '../hooks/useBarcodeScannerSection'

export function BarcodeScannerSection() {
  const { t } = useTranslation()
  const { openExternal } = useElectron()
  const { lastScan, clearLastScan } = useBarcodeScannerSection()

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
            icon={<Barcode size={18} />}
            title={t('settings.barcodeScanner.title')}
            description={t('settings.barcodeScanner.description')}
          />
          <Badge variant={lastScan ? 'success' : 'outline'}>
            {t(
              lastScan
                ? 'settings.barcodeScanner.status.detected'
                : 'settings.barcodeScanner.status.idle'
            )}
          </Badge>
        </div>
      }
      padding="20px"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 18 }}>
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 8
            }}
          >
            {t('settings.barcodeScanner.usbTitle')}
          </p>
          <ol
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              paddingLeft: 18,
              margin: 0
            }}
          >
            <li>{t('settings.barcodeScanner.usbStep1')}</li>
            <li>{t('settings.barcodeScanner.usbStep2')}</li>
            <li>{t('settings.barcodeScanner.usbStep3')}</li>
          </ol>
        </div>
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 8
            }}
          >
            {t('settings.barcodeScanner.bluetoothTitle')}
          </p>
          <ol
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              paddingLeft: 18,
              margin: '0 0 10px'
            }}
          >
            <li>{t('settings.barcodeScanner.bluetoothStep1')}</li>
            <li>{t('settings.barcodeScanner.bluetoothStep2')}</li>
            <li>{t('settings.barcodeScanner.bluetoothStep3')}</li>
            <li>{t('settings.barcodeScanner.bluetoothStep4')}</li>
          </ol>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Bluetooth size={12} />}
            onClick={() => openExternal('ms-settings:bluetooth')}
          >
            {t('settings.barcodeScanner.openBluetoothSettings')}
          </Button>
        </div>
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 10,
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ScanLine size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('settings.barcodeScanner.testTitle')}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {t('settings.barcodeScanner.testHint')}
        </p>

        {lastScan ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t('settings.barcodeScanner.lastScanLabel')}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                {lastScan.code}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: 'var(--text-muted)',
                    marginLeft: 8
                  }}
                >
                  {new Date(lastScan.at).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearLastScan}
              title={t('settings.barcodeScanner.clearButton')}
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {t('settings.barcodeScanner.waiting')}
          </p>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
        {t('settings.barcodeScanner.posNote')}
      </p>
    </Card>
  )
}

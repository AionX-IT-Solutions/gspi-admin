import { Barcode as BarcodeIcon, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { BarcodePreview } from './BarcodePreview'
import type { Product } from '../types/pos.types'

interface PrintLabelsModalProps {
  target: Product | null
  onClose: () => void
  printQty: number
  setPrintQty: (qty: number) => void
  onPrint: () => void
}

export function PrintLabelsModal({
  target,
  onClose,
  printQty,
  setPrintQty,
  onPrint
}: PrintLabelsModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={t('products.modal.printLabelsTitle', { name: target?.name ?? '' })}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Printer size={13} />} onClick={onPrint}>
            {t('products.modal.print')}
          </Button>
        </>
      }
    >
      {target && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-muted)'
            }}
          >
            <BarcodeIcon size={14} /> {t('products.modal.preview')}
          </div>
          <BarcodePreview value={target.sku} />
          <FormField label={t('products.form.numberOfLabels')} className="col-span-2">
            <FieldInput
              type="number"
              min={1}
              max={100}
              value={printQty}
              onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
            />
          </FormField>
        </div>
      )}
    </Modal>
  )
}

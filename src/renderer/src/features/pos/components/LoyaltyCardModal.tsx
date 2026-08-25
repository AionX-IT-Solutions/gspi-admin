import { Barcode as BarcodeIcon, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { BarcodePreview } from './BarcodePreview'
import type { Member } from '../types/pos.types'

interface LoyaltyCardModalProps {
  target: Member | null
  onClose: () => void
  printQty: number
  setPrintQty: (qty: number) => void
  onPrint: () => void
}

export function LoyaltyCardModal({
  target,
  onClose,
  printQty,
  setPrintQty,
  onPrint
}: LoyaltyCardModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={t('members.modal.printCardTitle', { name: target?.name ?? '' })}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Printer size={13} />} onClick={onPrint}>
            {t('members.modal.print')}
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
            <BarcodeIcon size={14} /> {t('members.modal.preview')}
          </div>
          <BarcodePreview value={target.code} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            {t('members.modal.scanHint')}
          </p>
          <FormField label={t('members.form.numberOfCards')} className="col-span-2">
            <FieldInput
              type="number"
              min={1}
              max={20}
              value={printQty}
              onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
            />
          </FormField>
        </div>
      )}
    </Modal>
  )
}

import { PackagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import type { Product } from '../types/pos.types'

interface RestockModalProps {
  target: Product | null
  onClose: () => void
  restockQty: number
  setRestockQty: (qty: number) => void
  restockCost: number
  setRestockCost: (cost: number) => void
  onRestock: () => void
}

export function RestockModal({
  target,
  onClose,
  restockQty,
  setRestockQty,
  restockCost,
  setRestockCost,
  onRestock
}: RestockModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={t('products.modal.restockTitle', { name: target?.name ?? '' })}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PackagePlus size={13} />}
            onClick={onRestock}
          >
            {t('products.modal.addStock')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {t('products.modal.currentStockLabel')}{' '}
          <b style={{ color: 'var(--text-primary)' }}>{target?.stockQuantity}</b>{' '}
          {t('products.modal.units')}
        </p>
        <FormField label={t('products.form.quantityToAdd')} required>
          <FieldInput
            type="number"
            min={1}
            value={restockQty}
            onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
          />
        </FormField>
        <FormField label={t('products.form.unitCost')}>
          <FieldInput
            type="number"
            min={0}
            value={restockCost}
            onChange={(e) => setRestockCost(parseFloat(e.target.value) || 0)}
          />
        </FormField>
      </div>
    </Modal>
  )
}

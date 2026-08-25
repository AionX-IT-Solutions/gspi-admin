import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { ItemType } from '../types/accounting.types'
import { useCreateItemModal } from '../hooks/useCreateItemModal'

interface CreateItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateItemModal({ open, onOpenChange }: CreateItemModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleCreate, resetForm } = useCreateItemModal(onOpenChange)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetForm()
      }}
      title={t('items.modalTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            {t('items.saveButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <FormField label={t('items.form.name')} required>
            <FieldInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('items.form.namePlaceholder')}
            />
          </FormField>
          <FormField label={t('items.form.sku')} required>
            <FieldInput
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder={t('items.form.skuPlaceholder')}
            />
          </FormField>
        </div>
        <FormField label={t('items.form.type')}>
          <FieldSelect
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ItemType }))}
            options={[
              { value: 'service', label: t('items.typeBadge.service') },
              { value: 'product', label: t('items.typeBadge.product') },
              { value: 'inventory', label: t('items.typeBadge.inventory') }
            ]}
          />
        </FormField>
        <FormField label={t('items.form.description')}>
          <FieldInput
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('items.form.descriptionPlaceholder')}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label={t('items.form.salesPrice')} required>
            <FieldInput
              type="number"
              min={0}
              value={form.salesPrice}
              onChange={(e) => setForm((f) => ({ ...f, salesPrice: e.target.value }))}
              placeholder="0.00"
            />
          </FormField>
          <FormField label={t('items.form.cost')}>
            <FieldInput
              type="number"
              min={0}
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              placeholder="0.00"
            />
          </FormField>
        </div>
        {form.type !== 'service' && (
          <FormField label={t('items.form.qtyOnHand')}>
            <FieldInput
              type="number"
              min={0}
              value={form.qtyOnHand}
              onChange={(e) => setForm((f) => ({ ...f, qtyOnHand: e.target.value }))}
              placeholder="0"
            />
          </FormField>
        )}
        <FormField label={t('items.form.incomeAccount')}>
          <FieldSelect
            value={form.incomeAccount}
            onChange={(e) => setForm((f) => ({ ...f, incomeAccount: e.target.value }))}
            options={[
              { value: 'Sales of Product Income', label: 'Sales of Product Income' },
              { value: 'Service Income', label: 'Service Income' }
            ]}
          />
        </FormField>
      </div>
    </Modal>
  )
}

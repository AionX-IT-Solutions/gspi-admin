import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { ExpenseStatus } from '../types/accounting.types'
import { useCreateExpenseModal, paymentMethods, categories } from '../hooks/useCreateExpenseModal'

interface CreateExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateExpenseModal({ open, onOpenChange }: CreateExpenseModalProps) {
  const { t } = useTranslation()
  const { vendors, form, setForm, handleCreate, resetForm } = useCreateExpenseModal(onOpenChange)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetForm()
      }}
      title={t('expenses.newExpenseButton')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            {t('expenses.form.saveButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('expenses.table.vendor')} required>
          <FieldSelect
            value={form.vendorId}
            onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
            placeholder={t('expenses.form.selectVendor')}
            options={vendors.map((v) => ({ value: v.id, label: v.company ?? v.name }))}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label={t('expenses.table.date')} required>
            <FieldInput
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FormField>
          <FormField label={t('expenses.table.amount')} required>
            <FieldInput
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
            />
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label={t('expenses.table.category')}>
            <FieldSelect
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </FormField>
          <FormField label={t('expenses.table.paymentMethod')}>
            <FieldSelect
              value={form.paymentMethod}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              options={paymentMethods.map((m) => ({ value: m, label: m }))}
            />
          </FormField>
        </div>
        <FormField label={t('expenses.table.status')}>
          <FieldSelect
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ExpenseStatus }))}
            options={[
              { value: 'unpaid', label: t('common.unpaid') },
              { value: 'paid', label: t('common.paid') }
            ]}
          />
        </FormField>
      </div>
    </Modal>
  )
}

import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useCreateCustomerModal } from '../hooks/useCreateCustomerModal'

interface CreateCustomerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCustomerModal({ open, onOpenChange }: CreateCustomerModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleCreate, resetForm } = useCreateCustomerModal(onOpenChange)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetForm()
      }}
      title={t('customers.newCustomerButton')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            {t('customers.form.saveButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('customers.form.fullName')} required>
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('customers.form.fullNamePlaceholder')}
          />
        </FormField>
        <FormField label={t('customers.fields.company')}>
          <FieldInput
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder={t('customers.form.companyPlaceholder')}
          />
        </FormField>
        <FormField label={t('customers.fields.email')} required>
          <FieldInput
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t('customers.form.emailPlaceholder')}
          />
        </FormField>
        <FormField label={t('customers.fields.phone')}>
          <FieldInput
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder={t('customers.form.phonePlaceholder')}
          />
        </FormField>
        <FormField label={t('customers.form.address')}>
          <FieldInput
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder={t('customers.form.addressPlaceholder')}
          />
        </FormField>
      </div>
    </Modal>
  )
}

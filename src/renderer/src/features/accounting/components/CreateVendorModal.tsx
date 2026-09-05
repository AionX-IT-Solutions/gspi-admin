import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { useCreateVendorModal, categories } from '../hooks/useCreateVendorModal'
import type { Vendor } from '../types/accounting.types'

interface CreateVendorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingVendor?: Vendor | null
  mode?: 'create' | 'edit' | 'view'
}

export function CreateVendorModal({
  open,
  onOpenChange,
  editingVendor = null,
  mode = 'create'
}: CreateVendorModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleCreate, resetForm } = useCreateVendorModal(
    onOpenChange,
    editingVendor
  )
  const isReadOnly = mode === 'view'
  const isEditing = mode === 'edit' || !!editingVendor

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetForm()
      }}
      title={isReadOnly ? t('common.view') : isEditing ? t('common.edit') : t('vendors.modalTitle')}
      footer={
        isReadOnly ? (
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              {t('vendors.saveButton')}
            </Button>
          </>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('vendors.form.contactName')} required>
          <FieldInput
            value={form.name}
            disabled={isReadOnly}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('vendors.form.contactNamePlaceholder')}
          />
        </FormField>
        <FormField label={t('vendors.form.company')}>
          <FieldInput
            value={form.company}
            disabled={isReadOnly}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder={t('vendors.form.companyPlaceholder')}
          />
        </FormField>
        <FormField label={t('vendors.form.email')} required>
          <FieldInput
            type="email"
            value={form.email}
            disabled={isReadOnly}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={t('vendors.form.emailPlaceholder')}
          />
        </FormField>
        <FormField label={t('vendors.form.phone')}>
          <FieldInput
            value={form.phone}
            disabled={isReadOnly}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder={t('vendors.form.phonePlaceholder')}
          />
        </FormField>
        <FormField label={t('vendors.form.category')}>
          <FieldSelect
            value={form.category}
            disabled={isReadOnly}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={categories.map((c) => ({ value: c, label: c }))}
            style={{ backgroundColor: '#ffffff' }}
          />
        </FormField>
      </div>
    </Modal>
  )
}

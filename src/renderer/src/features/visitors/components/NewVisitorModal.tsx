import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'

export interface VisitorFormState {
  fullName: string
  purpose: string
  personToVisit: string
  contactNumber: string
}

export function emptyVisitorForm(): VisitorFormState {
  return { fullName: '', purpose: '', personToVisit: '', contactNumber: '' }
}

interface NewVisitorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: VisitorFormState
  setForm: Dispatch<SetStateAction<VisitorFormState>>
  onSave: () => void
}

export function NewVisitorModal({
  open,
  onOpenChange,
  form,
  setForm,
  onSave
}: NewVisitorModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('visitors.modal.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {t('visitors.modal.logButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('visitors.form.fullName')} required>
          <FieldInput
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('visitors.form.purpose')} required>
          <FieldInput
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
          />
        </FormField>
        <FormField label={t('visitors.form.personToVisit')} required>
          <FieldInput
            value={form.personToVisit}
            onChange={(e) => setForm((f) => ({ ...f, personToVisit: e.target.value }))}
          />
        </FormField>
        <FormField label={t('visitors.form.contactNumber')}>
          <FieldInput
            value={form.contactNumber}
            onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

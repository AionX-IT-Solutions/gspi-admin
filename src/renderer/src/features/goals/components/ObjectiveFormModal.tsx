import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { useObjectiveFormModal } from '../hooks/useObjectiveFormModal'

export interface ObjectiveDialogState {
  mode: 'create' | 'edit'
  goalId: string
  objectiveId?: string
}

interface ObjectiveFormModalProps {
  dialog: ObjectiveDialogState | null
  onClose: () => void
}

export function ObjectiveFormModal({ dialog, onClose }: ObjectiveFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSave } = useObjectiveFormModal(dialog, onClose)

  const unitOptions = [
    { value: '', label: t('goals.form.unitCount') },
    { value: 'peso', label: t('goals.form.unitPeso') },
    { value: 'percent', label: t('goals.form.unitPercent') }
  ]

  return (
    <Modal
      open={!!dialog}
      onOpenChange={(open) => !open && onClose()}
      title={
        dialog?.mode === 'edit' ? t('goals.editObjectiveButton') : t('goals.addObjectiveButton')
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('goals.form.objectiveCode')} required>
          <FieldInput
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder={t('goals.form.objectiveCodePlaceholder')}
          />
        </FormField>
        <FormField label={t('goals.form.objectiveLabel')} required>
          <FieldInput
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder={t('goals.form.objectiveLabelPlaceholder')}
          />
        </FormField>
        <FormField label={t('goals.table.annualTarget')}>
          <FieldInput
            type="number"
            min={0}
            value={form.annualTarget}
            onChange={(e) => setForm((f) => ({ ...f, annualTarget: e.target.value }))}
          />
        </FormField>
        <FormField label={t('goals.form.unit')}>
          <FieldSelect
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value as typeof form.unit }))}
            options={unitOptions}
          />
        </FormField>
      </div>
    </Modal>
  )
}

import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useGoalFormModal } from '../hooks/useGoalFormModal'

export interface GoalDialogState {
  mode: 'create' | 'edit'
  goalId?: string
}

interface GoalFormModalProps {
  dialog: GoalDialogState | null
  onClose: () => void
  onCreated: (goalId: string) => void
}

export function GoalFormModal({ dialog, onClose, onCreated }: GoalFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSave } = useGoalFormModal(dialog, onClose, onCreated)

  return (
    <Modal
      open={!!dialog}
      onOpenChange={(open) => !open && onClose()}
      title={dialog?.mode === 'edit' ? t('goals.editGoalButton') : t('goals.newGoalButton')}
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
        <FormField label={t('goals.form.goalCode')}>
          <FieldInput
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="1"
          />
        </FormField>
        <FormField label={t('goals.form.goalTitle')} required>
          <FieldInput
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t('goals.form.goalTitlePlaceholder')}
          />
        </FormField>
      </div>
    </Modal>
  )
}

import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import type { Troop } from '../types/troop.types'
import { useTroopFormModal } from '../hooks/useTroopFormModal'

interface TroopFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Troop | null
}

export function TroopFormModal({ open, onOpenChange, editTarget }: TroopFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit } = useTroopFormModal(open, onOpenChange, editTarget)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('troops.modal.editTitle') : t('troops.modal.addTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('troops.modal.saveChanges') : t('troops.addButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('troops.form.troopNumber')} required>
          <FieldInput
            value={form.troopNumber}
            onChange={(e) => setForm((f) => ({ ...f, troopNumber: e.target.value }))}
            placeholder="TROOP-014"
          />
        </FormField>
        <FormField label={t('troops.form.level')} required>
          <FieldInput
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
            placeholder={t('troops.form.levelPlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.troopName')} className="col-span-2">
          <FieldInput
            value={form.troopName}
            onChange={(e) => setForm((f) => ({ ...f, troopName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.leaderName')} required>
          <FieldInput
            value={form.leaderName}
            onChange={(e) => setForm((f) => ({ ...f, leaderName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.assistantLeaderName')}>
          <FieldInput
            value={form.assistantLeaderName}
            onChange={(e) => setForm((f) => ({ ...f, assistantLeaderName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.school')}>
          <FieldInput
            value={form.school}
            onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.barangay')}>
          <FieldInput
            value={form.barangay}
            onChange={(e) => setForm((f) => ({ ...f, barangay: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.meetingPlace')} className="col-span-2">
          <FieldInput
            value={form.meetingPlace}
            onChange={(e) => setForm((f) => ({ ...f, meetingPlace: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

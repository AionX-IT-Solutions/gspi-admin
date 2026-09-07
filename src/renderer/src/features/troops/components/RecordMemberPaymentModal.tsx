import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { MemberPaymentCategory, ScoutMember } from '../types/troop.types'
import { useRecordMemberPaymentModal } from '../hooks/useRecordMemberPaymentModal'

interface RecordMemberPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: ScoutMember | null
}

export function RecordMemberPaymentModal({
  open,
  onOpenChange,
  member
}: RecordMemberPaymentModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit } = useRecordMemberPaymentModal(open, onOpenChange, member)

  const categoryOptions: { value: MemberPaymentCategory; label: string }[] = [
    { value: 'membership', label: t('troops.roster.payment.categoryMembership') },
    { value: 'training', label: t('troops.roster.payment.categoryTraining') }
  ]

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('troops.roster.payment.title', { name: member?.fullName ?? '' })}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('troops.roster.payment.submitButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('troops.roster.payment.amountLabel')} required>
          <FieldInput
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            autoFocus
          />
        </FormField>
        <FormField label={t('troops.roster.payment.categoryLabel')} required>
          <FieldSelect
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value as MemberPaymentCategory }))
            }
            options={categoryOptions}
          />
        </FormField>
        <FormField label={t('troops.roster.payment.dateLabel')} required>
          <FieldInput
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

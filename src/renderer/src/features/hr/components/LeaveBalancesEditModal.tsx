import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useLeaveBalancesEditModal } from '../hooks/useLeaveBalancesEditModal'

interface LeaveBalancesEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveBalancesEditModal({ open, onOpenChange }: LeaveBalancesEditModalProps) {
  const { t } = useTranslation()
  const onClose = () => onOpenChange(false)
  const { editableLeaveTypes, drafts, setDraft, handleSave } = useLeaveBalancesEditModal(
    open,
    onClose
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('leave.balancesModal.title')}
      size="sm"
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
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        {t('leave.balancesModal.description')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {editableLeaveTypes.map((lt) => (
          <FormField key={lt.id} label={lt.name}>
            <FieldInput
              type="number"
              min={0}
              value={drafts[lt.id] ?? 0}
              onChange={(e) => setDraft(lt.id, parseFloat(e.target.value) || 0)}
            />
          </FormField>
        ))}
      </div>
    </Modal>
  )
}

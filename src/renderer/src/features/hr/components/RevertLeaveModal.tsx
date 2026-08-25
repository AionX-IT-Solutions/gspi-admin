import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldTextArea } from '@/shared/components/ui/FormField'
import { formatDate } from '@/shared/lib/utils'
import type { RequestRow } from '../hooks/useLeave'
import { useRevertLeaveModal } from '../hooks/useRevertLeaveModal'

interface RevertLeaveModalProps {
  target: RequestRow | null
  onClose: () => void
}

export function RevertLeaveModal({ target, onClose }: RevertLeaveModalProps) {
  const { t } = useTranslation()
  const { reason, setReason, handleRevert } = useRevertLeaveModal(target, onClose)

  return (
    <Modal
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      title={t('leave.confirmRevert.title')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" size="sm" onClick={handleRevert}>
            {t('leave.revertButton')}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 13, marginBottom: 12 }}>
        {target &&
          t('leave.modal.summary', {
            employee: target.employeeName,
            leaveType: target.leaveTypeName,
            start: formatDate(target.startDate),
            end: formatDate(target.endDate),
            days: target.daysCount
          })}
      </p>
      <FormField label={t('leave.form.notesOptional')}>
        <FieldTextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('leave.confirmRevert.reasonPlaceholder')}
        />
      </FormField>
    </Modal>
  )
}

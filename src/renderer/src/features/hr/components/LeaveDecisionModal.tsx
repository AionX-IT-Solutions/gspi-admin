import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldTextArea } from '@/shared/components/ui/FormField'
import { formatDate } from '@/shared/lib/utils'
import type { LeaveRequestStatus } from '../types/hr.types'
import { useLeaveDecisionModal } from '../hooks/useLeaveDecisionModal'

export interface LeaveDecisionTarget {
  id: string
  employeeName: string
  leaveTypeName: string
  startDate: string
  endDate: string
  daysCount: number
  status: LeaveRequestStatus
}

interface LeaveDecisionModalProps {
  decision: LeaveDecisionTarget | null
  onClose: () => void
}

export function LeaveDecisionModal({ decision, onClose }: LeaveDecisionModalProps) {
  const { t } = useTranslation()
  const { decisionNotes, setDecisionNotes, handleDecide } = useLeaveDecisionModal(decision, onClose)

  return (
    <Modal
      open={!!decision}
      onOpenChange={(open) => !open && onClose()}
      title={
        decision?.status === 'approved'
          ? t('leave.modal.approveTitle')
          : t('leave.modal.rejectTitle')
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={decision?.status === 'approved' ? 'primary' : 'danger'}
            size="sm"
            onClick={handleDecide}
          >
            {decision?.status === 'approved'
              ? t('leave.modal.confirmApproval')
              : t('leave.modal.confirmRejection')}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 13, marginBottom: 12 }}>
        {decision &&
          t('leave.modal.summary', {
            employee: decision.employeeName,
            leaveType: decision.leaveTypeName,
            start: formatDate(decision.startDate),
            end: formatDate(decision.endDate),
            days: decision.daysCount
          })}
      </p>
      <FormField label={t('leave.form.notesOptional')}>
        <FieldTextArea
          value={decisionNotes}
          onChange={(e) => setDecisionNotes(e.target.value)}
          placeholder={t('leave.form.notesPlaceholder')}
        />
      </FormField>
    </Modal>
  )
}

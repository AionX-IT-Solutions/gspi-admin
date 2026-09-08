import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { ptdgAmountRequested, type PtdgApplication } from '../types/ptdg.types'

interface PtdgDecisionModalProps {
  application: PtdgApplication | null
  onClose: () => void
  onDecide: (decision: {
    status: 'approved' | 'disapproved'
    regionalApprovedAmount?: number
    regionalRemarks?: string
  }) => void
}

export function PtdgDecisionModal({ application, onClose, onDecide }: PtdgDecisionModalProps) {
  const { t } = useTranslation()
  const [decision, setDecision] = useState<'approved' | 'disapproved'>('approved')
  const [approvedAmount, setApprovedAmount] = useState(0)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (application) {
      setDecision('approved')
      setApprovedAmount(ptdgAmountRequested(application))
      setRemarks('')
    }
  }, [application])

  return (
    <Modal
      open={!!application}
      onOpenChange={(open) => !open && onClose()}
      title={t('ptdg.decisionModal.title')}
      description={application?.applicationNumber}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={decision === 'approved' ? 'primary' : 'danger'}
            size="sm"
            onClick={() =>
              onDecide({
                status: decision,
                regionalApprovedAmount: decision === 'approved' ? approvedAmount : undefined,
                regionalRemarks: remarks.trim() || undefined
              })
            }
          >
            {t('ptdg.decisionModal.saveButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('ptdg.decisionModal.decision')} required>
          <FieldSelect
            value={decision}
            onChange={(e) => setDecision(e.target.value as 'approved' | 'disapproved')}
            options={[
              { value: 'approved', label: t('ptdg.status.approved') },
              { value: 'disapproved', label: t('ptdg.status.disapproved') }
            ]}
          />
        </FormField>
        {decision === 'approved' && (
          <FormField label={t('ptdg.decisionModal.approvedAmount')} required>
            <FieldInput
              type="number"
              min={0}
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
            />
          </FormField>
        )}
        <FormField label={t('ptdg.decisionModal.remarks')}>
          <FieldTextArea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </FormField>
      </div>
    </Modal>
  )
}

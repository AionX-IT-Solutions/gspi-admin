import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { useEmployeeLeaveBalanceEditModal } from '../hooks/useEmployeeLeaveBalanceEditModal'

interface EmployeeLeaveBalanceEditModalProps {
  employeeId: string | null
  onClose: () => void
}

export function EmployeeLeaveBalanceEditModal({
  employeeId,
  onClose
}: EmployeeLeaveBalanceEditModalProps) {
  const { t } = useTranslation()
  const { employee, editableLeaveTypes, drafts, setDraft, resetDraft, handleSave } =
    useEmployeeLeaveBalanceEditModal(employeeId, onClose)

  return (
    <Modal
      open={!!employeeId}
      onOpenChange={(open) => !open && onClose()}
      title={
        employee
          ? t('leave.employeeBalanceModal.titleWithName', { name: employee.fullName })
          : undefined
      }
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
      {employee && (
        <>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            {t('leave.employeeBalanceModal.description')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {editableLeaveTypes.map((lt) => (
              <FormField key={lt.id} label={lt.name}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <FieldInput
                    type="number"
                    min={0}
                    value={drafts[lt.id] ?? 0}
                    onChange={(e) => setDraft(lt.id, parseFloat(e.target.value) || 0)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetDraft(lt.id)}
                    title={t('leave.employeeBalanceModal.resetToDefault', {
                      default: lt.defaultAnnualCredits
                    })}
                  >
                    <RotateCcw size={13} />
                  </Button>
                </div>
              </FormField>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}

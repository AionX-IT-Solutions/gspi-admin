import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { useFileLeaveModal } from '../hooks/useFileLeaveModal'

interface FileLeaveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FileLeaveModal({ open, onOpenChange }: FileLeaveModalProps) {
  const { t } = useTranslation()
  const { activeEmployees, leaveTypes, form, setForm, previewDays, handleFile } =
    useFileLeaveModal(onOpenChange)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('leave.modal.fileTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleFile}>
            {t('leave.modal.submit')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('leave.table.employee')} required className="col-span-2">
          <FieldSelect
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
            placeholder={t('leave.form.selectEmployee')}
            options={activeEmployees.map((e) => ({ value: e.id, label: e.fullName }))}
          />
        </FormField>
        <FormField label={t('leave.table.leaveType')} required className="col-span-2">
          <FieldSelect
            value={form.leaveTypeId}
            onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))}
            placeholder={t('leave.form.selectLeaveType')}
            options={leaveTypes.map((lt) => ({ value: lt.id, label: lt.name }))}
          />
        </FormField>
        <FormField label={t('leave.form.startDate')}>
          <FieldInput
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                startDate: e.target.value,
                endDate: f.halfDay ? e.target.value : f.endDate
              }))
            }
          />
        </FormField>
        <FormField label={t('leave.form.endDate')}>
          <FieldInput
            type="date"
            value={form.endDate}
            disabled={form.halfDay}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
        </FormField>
        <label
          className="col-span-2"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={form.halfDay}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                halfDay: e.target.checked,
                endDate: e.target.checked ? f.startDate : f.endDate
              }))
            }
            style={{ accentColor: 'var(--c-accent)', width: 14, height: 14 }}
          />
          {t('leave.form.halfDay')}
        </label>
        <FormField label={t('leave.table.reason')} className="col-span-2">
          <FieldTextArea
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </FormField>
      </div>
      {previewDays > 0 && (
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          {t('leave.previewDaysPrefix')}{' '}
          <b style={{ color: 'var(--text-primary)' }}>{previewDays}</b>{' '}
          {t('leave.previewDaysSuffix')}
        </p>
      )}
    </Modal>
  )
}

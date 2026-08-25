import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import type { AttendanceStatus } from '../types/hr.types'
import { useManualAttendanceModal } from '../hooks/useManualAttendanceModal'

interface ManualAttendanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManualAttendanceModal({ open, onOpenChange }: ManualAttendanceModalProps) {
  const { t } = useTranslation()
  const { activeEmployees, form, setForm, handleSubmit, resetForm } =
    useManualAttendanceModal(onOpenChange)

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) resetForm()
      }}
      title={t('attendance.modal.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('attendance.table.employee')} required className="col-span-2">
          <FieldSelect
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
            placeholder={t('attendance.form.selectEmployee')}
            options={activeEmployees.map((e) => ({ value: e.id, label: e.fullName }))}
          />
        </FormField>
        <FormField label={t('attendance.table.date')}>
          <FieldInput
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </FormField>
        <FormField label={t('attendance.table.status')}>
          <FieldSelect
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AttendanceStatus }))}
            options={[
              { value: 'present', label: t('attendance.status.present') },
              { value: 'late', label: t('attendance.status.late') },
              { value: 'overtime', label: t('attendance.status.overtime') },
              { value: 'half-day', label: t('attendance.status.half-day') },
              { value: 'absent', label: t('attendance.status.absent') },
              { value: 'leave', label: t('attendance.status.leave') }
            ]}
          />
        </FormField>
        <FormField label={t('attendance.table.clockIn')}>
          <FieldInput
            type="time"
            value={form.clockIn}
            onChange={(e) => setForm((f) => ({ ...f, clockIn: e.target.value }))}
          />
        </FormField>
        <FormField label={t('attendance.table.clockOut')}>
          <FieldInput
            type="time"
            value={form.clockOut}
            onChange={(e) => setForm((f) => ({ ...f, clockOut: e.target.value }))}
          />
        </FormField>
        <FormField label={t('attendance.table.notes')} className="col-span-2">
          <FieldTextArea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

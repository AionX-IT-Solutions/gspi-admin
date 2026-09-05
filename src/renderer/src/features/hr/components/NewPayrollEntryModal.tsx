import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { useNewPayrollEntryModal } from '../hooks/useNewPayrollEntryModal'
import type { PayrollEntry } from '../types/hr.types'

interface NewPayrollEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: PayrollEntry | null
}

export function NewPayrollEntryModal({
  open,
  onOpenChange,
  editTarget
}: NewPayrollEntryModalProps) {
  const { t } = useTranslation()
  const {
    activeEmployees,
    form,
    setForm,
    selectedEmployee,
    selectEmployee,
    unpaidLeaveDays,
    setUnpaidLeaveDays,
    isYearEndPeriod,
    netPreview,
    pullFromAttendance,
    computeYearEndPay,
    handleSubmit
  } = useNewPayrollEntryModal(open, onOpenChange, editTarget)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('payroll.modal.editTitle') : t('payroll.modal.title')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('payroll.modal.saveChanges') : t('payroll.modal.createEntry')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('payroll.table.employee')} required className="col-span-2">
          <FieldSelect
            value={form.employeeId}
            onChange={(e) => selectEmployee(e.target.value)}
            placeholder={t('payroll.form.selectEmployee')}
            options={activeEmployees.map((e) => ({ value: e.id, label: e.fullName }))}
          />
        </FormField>
        <FormField label={t('payroll.form.periodStart')}>
          <FieldInput
            type="date"
            value={form.periodStart}
            onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))}
          />
        </FormField>
        <FormField label={t('payroll.form.periodEnd')}>
          <FieldInput
            type="date"
            value={form.periodEnd}
            onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))}
          />
        </FormField>
      </div>

      <div style={{ margin: '14px 0' }}>
        <Button variant="outline" size="sm" onClick={pullFromAttendance}>
          {t('payroll.pullFromAttendance')}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <FormField label={t('payroll.form.basicSalary')}>
          <FieldInput
            type="number"
            value={form.dailyRate}
            onChange={(e) => setForm((f) => ({ ...f, dailyRate: parseFloat(e.target.value) || 0 }))}
          />
          {selectedEmployee && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {t('payroll.form.monthlySalaryReference', {
                amount: formatCurrency(selectedEmployee.salary)
              })}
            </p>
          )}
        </FormField>
        <FormField label={t('payroll.form.daysWorked')}>
          <FieldInput
            type="number"
            value={form.daysWorked}
            onChange={(e) =>
              setForm((f) => ({ ...f, daysWorked: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('payroll.form.overtimePay')}>
          <FieldInput
            type="number"
            value={form.overtimePay}
            onChange={(e) =>
              setForm((f) => ({ ...f, overtimePay: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('payroll.form.cola')}>
          <FieldInput
            type="number"
            value={form.cola}
            onChange={(e) => setForm((f) => ({ ...f, cola: parseFloat(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label={t('payroll.form.representation')}>
          <FieldInput
            type="number"
            value={form.representation}
            onChange={(e) =>
              setForm((f) => ({ ...f, representation: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('payroll.form.sss')}>
          <FieldInput
            type="number"
            value={form.sss}
            onChange={(e) => setForm((f) => ({ ...f, sss: parseFloat(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label={t('payroll.form.philhealth')}>
          <FieldInput
            type="number"
            value={form.philhealth}
            onChange={(e) =>
              setForm((f) => ({ ...f, philhealth: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('payroll.form.pagibig')}>
          <FieldInput
            type="number"
            value={form.pagibig}
            onChange={(e) => setForm((f) => ({ ...f, pagibig: parseFloat(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label={t('payroll.form.withholdingTax')}>
          <FieldInput
            type="number"
            value={form.taxDeducted}
            onChange={(e) =>
              setForm((f) => ({ ...f, taxDeducted: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('payroll.form.unpaidLeaveDays')}>
          <FieldInput
            type="number"
            value={unpaidLeaveDays}
            onChange={(e) => setUnpaidLeaveDays(parseFloat(e.target.value) || 0)}
          />
        </FormField>
      </div>

      {isYearEndPeriod && (
        <Card style={{ marginTop: 14 }} padding="14px">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>{t('payroll.form.yearEndTitle')}</span>
            <Button variant="outline" size="sm" onClick={computeYearEndPay}>
              {t('payroll.computeYearEndPay')}
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <FormField label={t('payroll.form.thirteenthMonthPay')}>
              <FieldInput
                type="number"
                value={form.thirteenthMonthPay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thirteenthMonthPay: parseFloat(e.target.value) || 0 }))
                }
              />
            </FormField>
            <FormField label={t('payroll.form.cashGift')}>
              <FieldInput
                type="number"
                value={form.cashGift}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cashGift: parseFloat(e.target.value) || 0 }))
                }
              />
            </FormField>
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 16 }} padding="14px">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 4
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{t('payroll.preview.basicPay')}</span>
          <span>{formatCurrency(netPreview.basicPay)}</span>
        </div>
        {netPreview.thirteenthMonthPay > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              marginBottom: 4
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              {t('payroll.form.thirteenthMonthPay')}
            </span>
            <span>{formatCurrency(netPreview.thirteenthMonthPay)}</span>
          </div>
        )}
        {netPreview.cashGift > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              marginBottom: 4
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{t('payroll.form.cashGift')}</span>
            <span>{formatCurrency(netPreview.cashGift)}</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 4
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            {t('payroll.preview.unpaidLeaveDeduction')}
          </span>
          <span>{formatCurrency(netPreview.unpaidDeduction)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 4
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{t('payroll.preview.totalDeductions')}</span>
          <span>{formatCurrency(netPreview.deductions)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 15,
            fontWeight: 700,
            marginTop: 6
          }}
        >
          <span>{t('payroll.preview.netPay')}</span>
          <span>{formatCurrency(netPreview.net)}</span>
        </div>
      </Card>
    </Modal>
  )
}

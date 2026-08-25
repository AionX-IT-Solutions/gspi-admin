import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { formatCurrency } from '@/shared/lib/utils'
import { computeBookingAmounts } from '../lib/bookingPricing'
import type { BookingDiscountType, RentalBooking, RentalSpace } from '../types/rentals.types'

export interface BookingFormState {
  rentalSpaceId: string
  bookingDate: string
  startTime: string
  endTime: string
  renterName: string
  notes: string
  discountType: BookingDiscountType
  amountPaid: number
}

export function emptyBookingForm(): BookingFormState {
  return {
    rentalSpaceId: '',
    bookingDate: new Date().toISOString().slice(0, 10),
    startTime: '',
    endTime: '',
    renterName: '',
    notes: '',
    discountType: 'none',
    amountPaid: 0
  }
}

interface NewBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: RentalBooking | null
  spaces: RentalSpace[]
  form: BookingFormState
  setForm: Dispatch<SetStateAction<BookingFormState>>
  onSave: () => void
}

export function NewBookingModal({
  open,
  onOpenChange,
  editTarget,
  spaces,
  form,
  setForm,
  onSave
}: NewBookingModalProps) {
  const { t } = useTranslation()
  const selectedSpace = spaces.find((sp) => sp.id === form.rentalSpaceId)
  const amounts = computeBookingAmounts(selectedSpace?.ratePerDay ?? 0, form.discountType)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('rentals.modal.editTitle') : t('rentals.modal.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {t('rentals.modal.bookButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('rentals.form.space')} required>
          <FieldSelect
            value={form.rentalSpaceId}
            onChange={(e) => setForm((f) => ({ ...f, rentalSpaceId: e.target.value }))}
            placeholder={t('rentals.form.selectSpace')}
            options={spaces.map((sp) => ({
              value: sp.id,
              label: `${sp.name} (${formatCurrency(sp.ratePerDay)}${t('rentals.perDay')})`
            }))}
          />
        </FormField>
        <FormField label={t('rentals.form.bookingDate')}>
          <FieldInput
            type="date"
            value={form.bookingDate}
            onChange={(e) => setForm((f) => ({ ...f, bookingDate: e.target.value }))}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('rentals.form.startTime')}>
            <FieldInput
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
          </FormField>
          <FormField label={t('rentals.form.endTime')}>
            <FieldInput
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('rentals.form.renterName')} required>
          <FieldInput
            value={form.renterName}
            onChange={(e) => setForm((f) => ({ ...f, renterName: e.target.value }))}
          />
        </FormField>
        <FormField label={t('rentals.form.discount')}>
          <FieldSelect
            value={form.discountType}
            onChange={(e) =>
              setForm((f) => ({ ...f, discountType: e.target.value as BookingDiscountType }))
            }
            options={[
              { value: 'none', label: t('rentals.form.discountNone') },
              { value: 'pwd_senior', label: t('rentals.form.discountPwdSenior') }
            ]}
          />
        </FormField>

        {selectedSpace && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-subtle)',
              fontSize: 12
            }}
          >
            {amounts.discountAmount > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)'
                }}
              >
                <span>{t('rentals.form.discountAmountLabel')}</span>
                <span>-{formatCurrency(amounts.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>{t('rentals.table.amount')}</span>
              <span>{formatCurrency(amounts.totalAmount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--text-muted)'
              }}
            >
              <span>{t('rentals.form.requiredDownPayment')}</span>
              <span>{formatCurrency(amounts.downPaymentAmount)}</span>
            </div>
          </div>
        )}

        <FormField label={t('rentals.form.amountPaid')}>
          <FieldInput
            type="number"
            min={0}
            value={form.amountPaid}
            onChange={(e) =>
              setForm((f) => ({ ...f, amountPaid: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('rentals.form.notes')}>
          <FieldTextArea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

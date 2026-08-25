import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { useBanksStore, bankDisplayName } from '@/features/scrd/store/banks.store'
import type { ModeOfPayment, VoucherType } from '../types/vouchers.types'
import { useNewVoucherModal } from '../hooks/useNewVoucherModal'

interface NewVoucherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewVoucherModal({ open, onOpenChange }: NewVoucherModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit, resetForm } = useNewVoucherModal(onOpenChange)
  const allBanks = useBanksStore((s) => s.banks)
  const banks = useMemo(() => allBanks.filter((b) => b.isActive), [allBanks])

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) resetForm()
      }}
      title={t('vouchers.newVoucherButton')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {t('vouchers.form.createButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('vouchers.form.voucherType')} required>
          <FieldSelect
            value={form.voucherType}
            onChange={(e) => setForm((f) => ({ ...f, voucherType: e.target.value as VoucherType }))}
            options={[
              { value: 'check_voucher', label: t('vouchers.type.checkVoucher') },
              { value: 'journal_voucher', label: t('vouchers.type.journalVoucher') }
            ]}
          />
        </FormField>
        <FormField label={t('vouchers.form.modeOfPayment')} required>
          <FieldSelect
            value={form.modeOfPayment}
            onChange={(e) =>
              setForm((f) => ({ ...f, modeOfPayment: e.target.value as ModeOfPayment }))
            }
            options={[
              { value: 'cash', label: t('vouchers.form.modeCash') },
              { value: 'check', label: t('vouchers.form.modeCheck') }
            ]}
          />
        </FormField>
        {form.modeOfPayment === 'check' && (
          <FormField label={t('vouchers.form.checkNumber')} className="col-span-2">
            <FieldInput
              value={form.checkNumber}
              onChange={(e) => setForm((f) => ({ ...f, checkNumber: e.target.value }))}
            />
          </FormField>
        )}
        <FormField label={t('vouchers.form.payee')} required>
          <FieldInput
            value={form.payee}
            onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))}
            placeholder={t('vouchers.form.payeePlaceholder')}
          />
        </FormField>
        <FormField label={t('vouchers.form.payeeAddress')}>
          <FieldInput
            value={form.payeeAddress}
            onChange={(e) => setForm((f) => ({ ...f, payeeAddress: e.target.value }))}
          />
        </FormField>
        <FormField label={t('vouchers.form.bankAccount')} className="col-span-2">
          <FieldSelect
            value={form.bankAccountRef}
            onChange={(e) => setForm((f) => ({ ...f, bankAccountRef: e.target.value }))}
            placeholder={t('vouchers.form.bankAccountPlaceholder')}
            options={banks.map((b) => ({ value: bankDisplayName(b), label: bankDisplayName(b) }))}
          />
        </FormField>
        <FormField label={t('vouchers.form.glAccount')} required>
          <FieldInput
            value={form.accountName}
            onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
            placeholder={t('vouchers.form.glAccountPlaceholder')}
          />
        </FormField>
        <FormField label={t('vouchers.form.amount')} required>
          <FieldInput
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label={t('vouchers.form.particulars')} className="col-span-2">
          <FieldTextArea
            value={form.particulars}
            onChange={(e) => setForm((f) => ({ ...f, particulars: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

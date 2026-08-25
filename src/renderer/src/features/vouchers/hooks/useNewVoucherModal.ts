import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVouchersStore } from '../store/vouchers.store'
import { useToast } from '@/app/hooks/useToast'
import type { ModeOfPayment, VoucherType } from '../types/vouchers.types'

function todayIso() {
  return new Date().toISOString()
}

function emptyForm() {
  return {
    voucherType: 'check_voucher' as VoucherType,
    modeOfPayment: 'cash' as ModeOfPayment,
    checkNumber: '',
    payee: '',
    payeeAddress: '',
    bankAccountRef: '',
    amount: 0,
    particulars: '',
    accountName: ''
  }
}

export function useNewVoucherModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const addVoucher = useVouchersStore((s) => s.addVoucher)
  const [form, setForm] = useState(emptyForm())

  function handleSubmit() {
    if (!form.payee.trim() || !form.amount || !form.accountName.trim()) {
      toast.error(t('vouchers.toast.missingFields'))
      return
    }
    const prefix = form.voucherType === 'check_voucher' ? 'CV' : 'JV'
    addVoucher({
      voucherNumber: `${new Date().getFullYear()} - ${String(new Date().getMonth() + 1).padStart(2, '0')} - ${prefix}${Math.floor(Math.random() * 90000 + 10000)}`,
      voucherType: form.voucherType,
      date: todayIso(),
      modeOfPayment: form.modeOfPayment,
      checkNumber:
        form.modeOfPayment === 'check' ? form.checkNumber.trim() || undefined : undefined,
      payee: form.payee.trim(),
      payeeAddress: form.payeeAddress.trim() || undefined,
      bankAccountRef: form.bankAccountRef.trim() || undefined,
      amount: form.amount,
      particulars: form.particulars.trim(),
      accountLines: [{ account: form.accountName.trim(), debit: form.amount, credit: 0 }]
    })
    toast.success(t('vouchers.toast.created'))
    onOpenChange(false)
    setForm(emptyForm())
  }

  function resetForm() {
    setForm(emptyForm())
  }

  return { form, setForm, handleSubmit, resetForm }
}

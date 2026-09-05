import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVouchersStore } from '../store/vouchers.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { ModeOfPayment, Voucher, VoucherType } from '../types/vouchers.types'

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

function formFromVoucher(voucher: Voucher) {
  return {
    voucherType: voucher.voucherType,
    modeOfPayment: voucher.modeOfPayment,
    checkNumber: voucher.checkNumber ?? '',
    payee: voucher.payee,
    payeeAddress: voucher.payeeAddress ?? '',
    bankAccountRef: voucher.bankAccountRef ?? '',
    amount: voucher.amount,
    particulars: voucher.particulars,
    accountName: voucher.accountLines[0]?.account ?? ''
  }
}

export function useNewVoucherModal(
  onOpenChange: (open: boolean) => void,
  editTarget?: Voucher | null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const addVoucher = useVouchersStore((s) => s.addVoucher)
  const updateVoucher = useVouchersStore((s) => s.updateVoucher)
  const [form, setForm] = useState(editTarget ? formFromVoucher(editTarget) : emptyForm())

  function handleSubmit() {
    if (!hasPermission('manage:vouchers')) return
    if (!form.payee.trim() || !form.amount || !form.accountName.trim()) {
      toast.error(t('vouchers.toast.missingFields'))
      return
    }

    const payload = {
      voucherType: form.voucherType,
      modeOfPayment: form.modeOfPayment,
      checkNumber:
        form.modeOfPayment === 'check' ? form.checkNumber.trim() || undefined : undefined,
      payee: form.payee.trim(),
      payeeAddress: form.payeeAddress.trim() || undefined,
      bankAccountRef: form.bankAccountRef.trim() || undefined,
      amount: form.amount,
      particulars: form.particulars.trim(),
      accountLines: [{ account: form.accountName.trim(), debit: form.amount, credit: 0 }]
    }

    if (editTarget) {
      updateVoucher(editTarget.id, payload)
      toast.success(t('vouchers.toast.updated'))
    } else {
      const prefix = form.voucherType === 'check_voucher' ? 'CV' : 'JV'
      addVoucher({
        voucherNumber: `${new Date().getFullYear()} - ${String(new Date().getMonth() + 1).padStart(2, '0')} - ${prefix}${Math.floor(Math.random() * 90000 + 10000)}`,
        date: todayIso(),
        ...payload
      })
      toast.success(t('vouchers.toast.created'))
    }
    onOpenChange(false)
    setForm(emptyForm())
  }

  function resetForm() {
    setForm(editTarget ? formFromVoucher(editTarget) : emptyForm())
  }

  return { form, setForm, handleSubmit, resetForm }
}

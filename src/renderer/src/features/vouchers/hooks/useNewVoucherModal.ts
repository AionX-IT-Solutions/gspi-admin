import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVouchersStore } from '../store/vouchers.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { ModeOfPayment, Voucher, VoucherType } from '../types/vouchers.types'

export interface VoucherAccountLineForm {
  account: string
  amount: number
}

function todayIso() {
  return new Date().toISOString()
}

function emptyAccountLine(): VoucherAccountLineForm {
  return { account: '', amount: 0 }
}

export type VoucherDirection = 'debit' | 'credit'

function emptyForm() {
  return {
    voucherType: 'check_voucher' as VoucherType,
    // Only a Journal Voucher can be 'credit' (a receipt) — a Check Voucher is always a
    // disbursement, so this stays 'debit' whenever voucherType is 'check_voucher' (see
    // setVoucherType below).
    direction: 'debit' as VoucherDirection,
    modeOfPayment: 'cash' as ModeOfPayment,
    checkNumber: '',
    payee: '',
    payeeAddress: '',
    bankAccountRef: '',
    particulars: '',
    accountLines: [emptyAccountLine()]
  }
}

function formFromVoucher(voucher: Voucher) {
  const isCredit = voucher.accountLines.some((l) => l.credit > 0)
  return {
    voucherType: voucher.voucherType,
    direction: (isCredit ? 'credit' : 'debit') as VoucherDirection,
    modeOfPayment: voucher.modeOfPayment,
    checkNumber: voucher.checkNumber ?? '',
    payee: voucher.payee,
    payeeAddress: voucher.payeeAddress ?? '',
    bankAccountRef: voucher.bankAccountRef ?? '',
    particulars: voucher.particulars,
    accountLines:
      voucher.accountLines.length > 0
        ? voucher.accountLines.map((l) => ({ account: l.account, amount: l.debit || l.credit }))
        : [emptyAccountLine()]
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

  const totalAmount = form.accountLines.reduce((sum, l) => sum + (l.amount || 0), 0)

  function addAccountLine() {
    setForm((f) => ({ ...f, accountLines: [...f.accountLines, emptyAccountLine()] }))
  }

  function removeAccountLine(index: number) {
    setForm((f) => ({
      ...f,
      accountLines:
        f.accountLines.length > 1 ? f.accountLines.filter((_, i) => i !== index) : f.accountLines
    }))
  }

  function updateAccountLine(index: number, patch: Partial<VoucherAccountLineForm>) {
    setForm((f) => ({
      ...f,
      accountLines: f.accountLines.map((l, i) => (i === index ? { ...l, ...patch } : l))
    }))
  }

  function handleSubmit() {
    if (!hasPermission('manage:vouchers')) return
    const validLines = form.accountLines.filter((l) => l.account.trim() && l.amount > 0)
    if (!form.payee.trim() || validLines.length === 0) {
      toast.error(t('vouchers.toast.missingFields'))
      return
    }
    const amount = validLines.reduce((sum, l) => sum + l.amount, 0)
    // A Check Voucher is always a disbursement — 'credit' direction only ever applies to a
    // Journal Voucher, enforced here too in case form state somehow got out of sync with the
    // voucherType selector.
    const effectiveDirection = form.voucherType === 'check_voucher' ? 'debit' : form.direction

    const payload = {
      voucherType: form.voucherType,
      modeOfPayment: form.modeOfPayment,
      checkNumber:
        form.modeOfPayment === 'check' ? form.checkNumber.trim() || undefined : undefined,
      payee: form.payee.trim(),
      payeeAddress: form.payeeAddress.trim() || undefined,
      bankAccountRef: form.bankAccountRef.trim() || undefined,
      amount,
      particulars: form.particulars.trim(),
      accountLines: validLines.map((l) => ({
        account: l.account.trim(),
        debit: effectiveDirection === 'debit' ? l.amount : 0,
        credit: effectiveDirection === 'credit' ? l.amount : 0
      }))
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

  return {
    form,
    setForm,
    totalAmount,
    addAccountLine,
    removeAccountLine,
    updateAccountLine,
    handleSubmit,
    resetForm
  }
}

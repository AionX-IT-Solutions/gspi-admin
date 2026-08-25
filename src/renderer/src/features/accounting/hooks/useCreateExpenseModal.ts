import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency, toInputDate } from '@/shared/lib/utils'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'
import type { Expense, ExpenseStatus } from '../types/accounting.types'

export const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check']
export const categories = [
  'Utilities',
  'Office Supplies',
  'Shipping & Freight',
  'Maintenance',
  'Vehicle Maintenance',
  'Other'
]

function emptyForm() {
  return {
    vendorId: '',
    date: toInputDate(new Date().toISOString()),
    category: categories[0],
    paymentMethod: paymentMethods[0],
    amount: '',
    status: 'unpaid' as ExpenseStatus,
    memo: ''
  }
}

export function useCreateExpenseModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const vendors = useAccountingStore((s) => s.vendors)
  const addExpense = useAccountingStore((s) => s.addExpense)
  const [form, setForm] = useState(emptyForm())

  function handleCreate() {
    const vendor = vendors.find((v) => v.id === form.vendorId)
    const amount = Number(form.amount)
    if (!vendor) {
      toast.error(t('expenses.toast.vendorRequired'))
      return
    }
    if (!amount || amount <= 0) {
      toast.error(t('expenses.toast.invalidAmount'))
      return
    }
    const expense: Expense = {
      id: crypto.randomUUID(),
      vendorId: vendor.id,
      vendorName: vendor.company ?? vendor.name,
      date: form.date,
      category: form.category,
      paymentMethod: form.paymentMethod,
      amount,
      status: form.status,
      memo: form.memo
    }
    addExpense(expense)
    onOpenChange(false)
    setForm(emptyForm())
    toast.success(t('expenses.toast.created', { amount: formatCurrency(amount) }))
  }

  function resetForm() {
    setForm(emptyForm())
  }

  return { vendors, form, setForm, handleCreate, resetForm }
}

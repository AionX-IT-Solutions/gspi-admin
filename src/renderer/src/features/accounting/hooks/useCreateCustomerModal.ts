import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { Customer } from '../types/accounting.types'

const avatarPalette = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6'
]

function emptyForm() {
  return { name: '', company: '', email: '', phone: '', address: '' }
}

export function useCreateCustomerModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const customerList = useAccountingStore((s) => s.customers)
  const addCustomer = useAccountingStore((s) => s.addCustomer)
  const [form, setForm] = useState(emptyForm())

  function handleCreate() {
    if (!hasPermission('manage:customers')) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t('customers.toast.missingFields'))
      return
    }
    const customer: Customer = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      balance: 0,
      totalBilled: 0,
      status: 'active',
      avatarColor: avatarPalette[customerList.length % avatarPalette.length]
    }
    addCustomer(customer)
    onOpenChange(false)
    setForm(emptyForm())
    toast.success(t('customers.toast.created', { name: customer.name }))
  }

  function resetForm() {
    setForm(emptyForm())
  }

  return { form, setForm, handleCreate, resetForm }
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'
import type { Vendor } from '../types/accounting.types'

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
export const categories = [
  'Office Supplies',
  'Utilities',
  'Shipping & Freight',
  'Maintenance',
  'Vehicle Maintenance',
  'Other'
]

function emptyForm() {
  return { name: '', company: '', email: '', phone: '', category: categories[0] }
}

export function useCreateVendorModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const vendorList = useAccountingStore((s) => s.vendors)
  const addVendor = useAccountingStore((s) => s.addVendor)
  const [form, setForm] = useState(emptyForm())

  function handleCreate() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t('vendors.validation.nameEmailRequired'))
      return
    }
    const vendor: Vendor = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      category: form.category,
      balance: 0,
      status: 'active',
      avatarColor: avatarPalette[vendorList.length % avatarPalette.length]
    }
    addVendor(vendor)
    onOpenChange(false)
    setForm(emptyForm())
    toast.success(t('vendors.toast.added', { name: vendor.name }))
  }

  function resetForm() {
    setForm(emptyForm())
  }

  return { form, setForm, handleCreate, resetForm }
}

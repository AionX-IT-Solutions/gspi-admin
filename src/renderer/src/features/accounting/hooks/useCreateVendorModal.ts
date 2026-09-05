import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
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

function toFormValues(vendor: Vendor) {
  return {
    name: vendor.name,
    company: vendor.company ?? '',
    email: vendor.email,
    phone: vendor.phone,
    category: vendor.category
  }
}

export function useCreateVendorModal(
  onOpenChange: (open: boolean) => void,
  editingVendor: Vendor | null = null
) {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const vendorList = useAccountingStore((s) => s.vendors)
  const addVendor = useAccountingStore((s) => s.addVendor)
  const updateVendor = useAccountingStore((s) => s.updateVendor)
  const [form, setForm] = useState(() =>
    editingVendor ? toFormValues(editingVendor) : emptyForm()
  )

  useEffect(() => {
    setForm(editingVendor ? toFormValues(editingVendor) : emptyForm())
  }, [editingVendor])

  function handleCreate() {
    if (!hasPermission('manage:vendors')) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t('vendors.validation.nameEmailRequired'))
      return
    }

    if (editingVendor) {
      const updatedVendor: Vendor = {
        ...editingVendor,
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        email: form.email.trim(),
        phone: form.phone.trim(),
        category: form.category
      }
      updateVendor(editingVendor.id, updatedVendor)
      onOpenChange(false)
      setForm(emptyForm())
      toast.success(t('vendors.toast.updated', { name: updatedVendor.name }))
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
    setForm(editingVendor ? toFormValues(editingVendor) : emptyForm())
  }

  return { form, setForm, handleCreate, resetForm }
}

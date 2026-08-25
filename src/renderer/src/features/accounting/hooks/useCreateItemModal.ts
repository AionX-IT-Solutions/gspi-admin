import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccountingStore } from '../store/accounting.store'
import { useToast } from '@/app/hooks/useToast'
import type { Item, ItemType } from '../types/accounting.types'

function emptyForm() {
  return {
    name: '',
    sku: '',
    type: 'product' as ItemType,
    description: '',
    salesPrice: '',
    cost: '',
    qtyOnHand: '',
    incomeAccount: 'Sales of Product Income'
  }
}

export function useCreateItemModal(onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const addItem = useAccountingStore((s) => s.addItem)
  const [form, setForm] = useState(emptyForm())

  function handleCreate() {
    if (!form.name.trim() || !form.sku.trim()) {
      toast.error(t('items.validation.nameSkuRequired'))
      return
    }
    const item: Item = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      sku: form.sku.trim(),
      type: form.type,
      description: form.description.trim(),
      salesPrice: Number(form.salesPrice) || 0,
      cost: Number(form.cost) || 0,
      qtyOnHand: form.type === 'service' ? undefined : Number(form.qtyOnHand) || 0,
      incomeAccount: form.incomeAccount
    }
    addItem(item)
    onOpenChange(false)
    setForm(emptyForm())
    toast.success(t('items.toast.added', { name: item.name }))
  }

  function resetForm() {
    setForm(emptyForm())
  }

  return { form, setForm, handleCreate, resetForm }
}

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { usePOSStore } from '../store/pos.store'
import { getCategoryById } from '../store/categories.store'
import { formatCurrency } from '@/shared/lib/utils'
import { openBarcodeLabelPrintWindow } from '../lib/barcode'
import { useToast } from '@/app/hooks/useToast'
import { usePermissions } from '@/app/hooks/usePermissions'
import type { Product } from '../types/pos.types'
import { emptyProductForm, type ProductFormState } from '../components/ProductFormModal'

export function useProducts() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:products')
  const products = usePOSStore((s) => s.products)
  const sales = usePOSStore((s) => s.sales)
  const purchases = usePOSStore((s) => s.purchases)
  const addProduct = usePOSStore((s) => s.addProduct)
  const updateProduct = usePOSStore((s) => s.updateProduct)
  const deleteProduct = usePOSStore((s) => s.deleteProduct)
  const restockProduct = usePOSStore((s) => s.restockProduct)

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyProductForm())
  const [printTarget, setPrintTarget] = useState<Product | null>(null)
  const [printQty, setPrintQty] = useState(6)
  const [restockTarget, setRestockTarget] = useState<Product | null>(null)
  const [restockQty, setRestockQty] = useState(0)
  const [restockCost, setRestockCost] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const lowStock = products.filter((p) => p.isActive && p.stockQuantity <= p.reorderLevel)

  function openAdd() {
    setEditTarget(null)
    setForm(emptyProductForm())
    setShowForm(true)
  }

  function openEdit(product: Product) {
    setEditTarget(product)
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? '',
      categoryId: product.categoryId ?? '',
      unit: product.unit ?? 'pcs',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      imageUrl: product.imageUrl ?? ''
    })
    setShowForm(true)
  }

  function handleSaveProduct() {
    if (!canManage) return
    if (!form.sku.trim() || !form.name.trim()) {
      toast.error(t('products.toast.skuNameRequired'))
      return
    }
    const duplicate = products.some(
      (p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase() && p.id !== editTarget?.id
    )
    if (duplicate) {
      toast.error(t('products.toast.duplicateSku'))
      return
    }
    const now = new Date().toISOString()
    // sku doubles as gspi-app's barcode field (see Product.barcode) — desktop
    // has one combined SKU/barcode input, not a separate one.
    const shared = {
      sku: form.sku.trim(),
      barcode: form.sku.trim(),
      name: form.name,
      description: form.description,
      categoryId: form.categoryId,
      color: getCategoryById(form.categoryId)?.color ?? '#8B5CF6',
      unit: form.unit,
      costPrice: form.costPrice,
      sellingPrice: form.sellingPrice,
      stockQuantity: form.stockQuantity,
      reorderLevel: form.reorderLevel,
      imageUrl: form.imageUrl,
      updatedAt: now
    }
    if (editTarget) {
      updateProduct(editTarget.id, shared)
      toast.success(t('products.toast.productUpdated', { name: form.name }))
    } else {
      addProduct({ id: crypto.randomUUID(), ...shared, isActive: true, createdAt: now })
      toast.success(t('products.toast.productAdded', { name: form.name }))
    }
    setShowForm(false)
    setEditTarget(null)
    setForm(emptyProductForm())
  }

  function handleConfirmDelete() {
    if (!deleteTarget || !canManage) return
    const deleted = deleteTarget
    deleteProduct(deleted.id)
    toast.success(t('products.toast.deleted', { name: deleted.name }), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => addProduct(deleted) }
    })
    setDeleteTarget(null)
  }

  function handlePrint() {
    if (!printTarget) return
    const labels = Array.from({ length: printQty }, () => ({
      sku: printTarget.sku,
      name: printTarget.name,
      price: formatCurrency(printTarget.sellingPrice)
    }))
    openBarcodeLabelPrintWindow(labels)
    setPrintTarget(null)
  }

  function handleRestock() {
    if (!canManage) return
    if (!restockTarget || restockQty <= 0) {
      toast.error(t('products.toast.invalidQuantity'))
      return
    }
    restockProduct(restockTarget.id, restockQty, restockCost || restockTarget.costPrice)
    toast.success(
      t('products.toast.restockSuccess', { count: restockQty, name: restockTarget.name })
    )
    setRestockTarget(null)
    setRestockQty(0)
    setRestockCost(0)
  }

  const [search, setSearch] = useState('')
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (getCategoryById(p.categoryId)?.name.toLowerCase().includes(q) ?? false)
    )
  }, [products, search])

  return {
    loading,
    toast,
    canManage,
    products,
    sales,
    purchases,
    lowStock,
    search,
    setSearch,
    filteredProducts,
    showForm,
    setShowForm,
    editTarget,
    openAdd,
    openEdit,
    form,
    setForm,
    handleSaveProduct,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    printTarget,
    setPrintTarget,
    printQty,
    setPrintQty,
    handlePrint,
    restockTarget,
    setRestockTarget,
    restockQty,
    setRestockQty,
    restockCost,
    setRestockCost,
    handleRestock
  }
}

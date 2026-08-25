import { useRef, type Dispatch, type SetStateAction } from 'react'
import { ImageOff, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { useCategoriesStore } from '../store/categories.store'
import { PRODUCT_UNITS } from '../lib/productUnits'
import type { Product } from '../types/pos.types'

export interface ProductFormState {
  sku: string
  name: string
  description: string
  categoryId: string
  unit: string
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  reorderLevel: number
  imageUrl: string
}

export function emptyProductForm(): ProductFormState {
  return {
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    unit: 'pcs',
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    reorderLevel: 10,
    imageUrl: ''
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Product | null
  form: ProductFormState
  setForm: Dispatch<SetStateAction<ProductFormState>>
  onSave: () => void
}

export function ProductFormModal({
  open,
  onOpenChange,
  editTarget,
  form,
  setForm,
  onSave
}: ProductFormModalProps) {
  const { t } = useTranslation()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const categories = useCategoriesStore((s) => s.categories)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        editTarget ? t('products.modal.editProductTitle') : t('products.modal.addProductTitle')
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {t('products.modal.saveProduct')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('products.form.image')} className="col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImageOff size={18} color="var(--text-muted)" strokeWidth={1.5} />
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload size={12} />}
              type="button"
              onClick={() => imageInputRef.current?.click()}
            >
              {t('products.form.uploadImage')}
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const dataUrl = await readFileAsDataUrl(file)
                setForm((f) => ({ ...f, imageUrl: dataUrl }))
                e.target.value = ''
              }}
            />
          </div>
        </FormField>
        <FormField label={t('products.form.skuBarcode')} required>
          <FieldInput
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="GS-ITEM-001"
          />
        </FormField>
        <FormField label={t('products.form.category')}>
          <FieldSelect
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            placeholder={t('products.form.selectCategory')}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </FormField>
        <FormField label={t('products.form.productName')} required className="col-span-2">
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </FormField>
        <FormField label={t('products.form.description')} className="col-span-2">
          <FieldTextArea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </FormField>
        <FormField label={t('products.form.unit')}>
          <FieldSelect
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            options={PRODUCT_UNITS.map((u) => ({ value: u, label: u }))}
          />
        </FormField>
        <FormField label={t('products.form.costPrice')}>
          <FieldInput
            type="number"
            min={0}
            value={form.costPrice}
            onChange={(e) => setForm((f) => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))}
          />
        </FormField>
        <FormField label={t('products.form.sellingPrice')}>
          <FieldInput
            type="number"
            min={0}
            value={form.sellingPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, sellingPrice: parseFloat(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('products.form.stockQuantity')}>
          <FieldInput
            type="number"
            min={0}
            value={form.stockQuantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, stockQuantity: parseInt(e.target.value) || 0 }))
            }
          />
        </FormField>
        <FormField label={t('products.form.reorderLevel')}>
          <FieldInput
            type="number"
            min={0}
            value={form.reorderLevel}
            onChange={(e) =>
              setForm((f) => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))
            }
          />
        </FormField>
      </div>
    </Modal>
  )
}

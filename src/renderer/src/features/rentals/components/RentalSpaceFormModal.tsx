import { useRef, type Dispatch, type SetStateAction } from 'react'
import { ImageOff, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldTextArea } from '@/shared/components/ui/FormField'
import type { RentalSpace } from '../types/rentals.types'

export interface RentalSpaceFormState {
  name: string
  description: string
  ratePerDay: number
  capacity: number
  imageUrl: string
}

export function emptyRentalSpaceForm(): RentalSpaceFormState {
  return { name: '', description: '', ratePerDay: 0, capacity: 0, imageUrl: '' }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface RentalSpaceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: RentalSpace | null
  form: RentalSpaceFormState
  setForm: Dispatch<SetStateAction<RentalSpaceFormState>>
  onSave: () => void
}

export function RentalSpaceFormModal({
  open,
  onOpenChange,
  editTarget,
  form,
  setForm,
  onSave
}: RentalSpaceFormModalProps) {
  const { t } = useTranslation()
  const imageInputRef = useRef<HTMLInputElement>(null)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('rentals.modal.editSpaceTitle') : t('rentals.modal.addSpaceTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {t('rentals.modal.saveSpace')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('rentals.form.image')}>
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
        <FormField label={t('rentals.form.spaceName')} required>
          <FieldInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Whole Hall, Board Room…"
          />
        </FormField>
        <FormField label={t('rentals.form.description')}>
          <FieldTextArea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. 350–400 pax, day time"
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('rentals.form.ratePerDay')} required>
            <FieldInput
              type="number"
              min={0}
              value={form.ratePerDay}
              onChange={(e) =>
                setForm((f) => ({ ...f, ratePerDay: parseFloat(e.target.value) || 0 }))
              }
            />
          </FormField>
          <FormField label={t('rentals.form.capacityField')}>
            <FieldInput
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 0 }))}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}

import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import type { AnnouncementPriority } from '../types/announcements.types'

export interface AnnouncementFormState {
  title: string
  message: string
  priority: AnnouncementPriority
  pinned: boolean
}

export function emptyAnnouncementForm(): AnnouncementFormState {
  return { title: '', message: '', priority: 'normal', pinned: false }
}

interface AnnouncementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: AnnouncementFormState
  setForm: Dispatch<SetStateAction<AnnouncementFormState>>
  onSave: () => void
  editing: boolean
}

export function AnnouncementModal({
  open,
  onOpenChange,
  form,
  setForm,
  onSave,
  editing
}: AnnouncementModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? t('announcements.modal.editTitle') : t('announcements.modal.newTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {editing ? t('common.save') : t('announcements.modal.postButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('announcements.form.title')} required>
          <FieldInput
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </FormField>
        <FormField label={t('announcements.form.message')} required>
          <FieldTextArea
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        </FormField>
        <FormField label={t('announcements.form.priority')}>
          <FieldSelect
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value as AnnouncementPriority }))
            }
            options={[
              { value: 'normal', label: t('announcements.priority.normal') },
              { value: 'important', label: t('announcements.priority.important') },
              { value: 'urgent', label: t('announcements.priority.urgent') }
            ]}
          />
        </FormField>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {t('announcements.form.pinned')}
          </span>
        </label>
      </div>
    </Modal>
  )
}

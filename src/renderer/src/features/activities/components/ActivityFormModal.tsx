import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { todayLocalIso } from '@/shared/lib/utils'
import type { Activity, ActivityCategory, ActivityStatus } from '../types/activities.types'

export interface ActivityFormState {
  title: string
  category: ActivityCategory
  description: string
  location: string
  organizer: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  status: ActivityStatus
}

export function emptyActivityForm(): ActivityFormState {
  return {
    title: '',
    category: 'meeting',
    description: '',
    location: '',
    organizer: '',
    startDate: todayLocalIso(),
    endDate: '',
    startTime: '',
    endTime: '',
    status: 'scheduled'
  }
}

interface ActivityFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Activity | null
  form: ActivityFormState
  setForm: Dispatch<SetStateAction<ActivityFormState>>
  onSave: () => void
}

export function ActivityFormModal({
  open,
  onOpenChange,
  editTarget,
  form,
  setForm,
  onSave
}: ActivityFormModalProps) {
  const { t } = useTranslation()

  const CATEGORY_OPTIONS: { value: ActivityCategory; label: string }[] = [
    { value: 'meeting', label: t('activities.category.meeting') },
    { value: 'camp', label: t('activities.category.camp') },
    { value: 'training', label: t('activities.category.training') },
    { value: 'communityService', label: t('activities.category.communityService') },
    { value: 'ceremony', label: t('activities.category.ceremony') },
    { value: 'other', label: t('activities.category.other') }
  ]

  const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
    { value: 'scheduled', label: t('activities.status.scheduled') },
    { value: 'ongoing', label: t('activities.status.ongoing') },
    { value: 'completed', label: t('common.completed') },
    { value: 'cancelled', label: t('common.cancelled') }
  ]

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('activities.modal.editTitle') : t('activities.modal.title')}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {editTarget ? t('common.save') : t('activities.modal.createButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('activities.form.title')} required>
          <FieldInput
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('activities.form.category')}>
            <FieldSelect
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as ActivityCategory }))
              }
              options={CATEGORY_OPTIONS}
            />
          </FormField>
          {editTarget && (
            <FormField label={t('activities.form.status')}>
              <FieldSelect
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as ActivityStatus }))
                }
                options={STATUS_OPTIONS}
              />
            </FormField>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('activities.form.startDate')} required>
            <FieldInput
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </FormField>
          <FormField label={t('activities.form.endDate')}>
            <FieldInput
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <FormField label={t('activities.form.startTime')}>
            <FieldInput
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
          </FormField>
          <FormField label={t('activities.form.endTime')}>
            <FieldInput
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </FormField>
        </div>

        <FormField label={t('activities.form.location')}>
          <FieldInput
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </FormField>
        <FormField label={t('activities.form.organizer')}>
          <FieldInput
            value={form.organizer}
            onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
          />
        </FormField>
        <FormField label={t('activities.form.description')}>
          <FieldTextArea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

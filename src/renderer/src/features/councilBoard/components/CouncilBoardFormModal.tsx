import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { useCouncilBoardStore } from '../store/councilBoard.store'
import type { CouncilBoardMember } from '../types/councilBoard.types'
import { useCouncilBoardFormModal } from '../hooks/useCouncilBoardFormModal'
import {
  buildCouncilBoardTree,
  collectCouncilBoardDescendantIds
} from '../lib/councilBoardOrgChart'

interface CouncilBoardFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: CouncilBoardMember | null
}

export function CouncilBoardFormModal({
  open,
  onOpenChange,
  editTarget
}: CouncilBoardFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, handleSubmit } = useCouncilBoardFormModal(open, onOpenChange, editTarget)
  const members = useCouncilBoardStore((s) => s.members)

  // Excludes editTarget's own descendants too, not just editTarget itself — picking one of
  // them would create a reporting-line cycle.
  const reportsToOptions = useMemo(() => {
    const excludedIds = editTarget
      ? collectCouncilBoardDescendantIds(buildCouncilBoardTree(members), editTarget.id)
      : new Set<string>()
    return [
      { value: '', label: t('councilBoard.form.noSuperior') },
      ...members
        .filter((m) => !excludedIds.has(m.id))
        .map((m) => ({ value: m.id, label: `${m.fullName} — ${m.position}` }))
    ]
  }, [members, editTarget, t])

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('councilBoard.editModal.title') : t('councilBoard.addModal.title')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('common.save') : t('councilBoard.addButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('councilBoard.form.fullName')} required>
          <FieldInput
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Juana Dela Cruz"
          />
        </FormField>
        <FormField label={t('councilBoard.form.position')} required>
          <FieldInput
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            placeholder={t('councilBoard.form.positionPlaceholder')}
          />
        </FormField>
        <FormField label={t('councilBoard.form.reportsTo')}>
          <FieldSelect
            options={reportsToOptions}
            value={form.reportsToId}
            onChange={(e) => setForm((f) => ({ ...f, reportsToId: e.target.value }))}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('councilBoard.form.contactNumber')}>
            <FieldInput
              value={form.contactNumber}
              onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
            />
          </FormField>
          <FormField label={t('councilBoard.form.email')}>
            <FieldInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('councilBoard.form.birthDate')}>
          <FieldInput
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

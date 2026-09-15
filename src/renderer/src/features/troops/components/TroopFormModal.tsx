import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import type { TrainingProfile } from '@/features/trainingProfiles/types/trainingProfiles.types'
import { troopLevelOptions, type Troop } from '../types/troop.types'
import { useTroopFormModal } from '../hooks/useTroopFormModal'

interface TroopFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: Troop | null
}

interface LeaderPickerFieldProps {
  label: string
  required?: boolean
  name: string
  profileId: string
  candidates: TrainingProfile[]
  placeholder?: string
  onTypeName: (name: string) => void
  onSelect: (profile: TrainingProfile) => void
  onClear: () => void
}

// A free-text name field that also offers to link to an actual Training Profile record
// (searched as you type) — same "type or pick a known record" pattern as the vendor
// search on the New Voucher form's Payee field. Once linked, the field shows a chip with
// that person's completed-training count instead of a plain text box.
function LeaderPickerField({
  label,
  required,
  name,
  profileId,
  candidates,
  placeholder,
  onTypeName,
  onSelect,
  onClear
}: LeaderPickerFieldProps) {
  const { t } = useTranslation()
  const [focused, setFocused] = useState(false)
  const selected = candidates.find((p) => p.id === profileId) ?? null

  const filtered = useMemo(() => {
    const q = name.trim().toLowerCase()
    if (!q) return []
    return candidates.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 20)
  }, [candidates, name])

  return (
    <FormField label={label} required={required}>
      <div style={{ position: 'relative' }}>
        {selected ? (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: 'var(--accent-primary-subtle)',
              border: '1px solid var(--accent-primary)',
              fontSize: 13,
              color: 'var(--text-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: 40
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {t('troops.form.trainingsCompletedCount', {
                  count: selected.completedTrainings.length
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={onClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: 16,
                padding: 4
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <FieldInput
              value={name}
              onChange={(e) => onTypeName(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              placeholder={placeholder}
              autoComplete="off"
            />
            {focused && filtered.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  maxHeight: 220,
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  zIndex: 20,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelect(p)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {p.school} ·{' '}
                      {t('troops.form.trainingsCompletedCount', {
                        count: p.completedTrainings.length
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </FormField>
  )
}

export function TroopFormModal({ open, onOpenChange, editTarget }: TroopFormModalProps) {
  const { t } = useTranslation()
  const {
    form,
    setForm,
    leaderCandidates,
    selectLeader,
    clearLeaderProfile,
    setLeaderName,
    selectAssistantLeader,
    clearAssistantLeaderProfile,
    setAssistantLeaderName,
    handleSubmit
  } = useTroopFormModal(open, onOpenChange, editTarget)

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editTarget ? t('troops.modal.editTitle') : t('troops.modal.addTitle')}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editTarget ? t('troops.modal.saveChanges') : t('troops.addButton')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <FormField label={t('troops.form.troopNumber')} required>
          <FieldInput
            value={form.troopNumber}
            onChange={(e) => setForm((f) => ({ ...f, troopNumber: e.target.value }))}
            placeholder="TROOP-014"
          />
        </FormField>
        <FormField label={t('troops.form.level')} required>
          <FieldSelect
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
            options={troopLevelOptions(form.level)}
            placeholder={t('troops.form.levelPlaceholder')}
          />
        </FormField>
        <FormField label={t('troops.form.troopName')} className="col-span-2">
          <FieldInput
            value={form.troopName}
            onChange={(e) => setForm((f) => ({ ...f, troopName: e.target.value }))}
          />
        </FormField>
        <LeaderPickerField
          label={t('troops.form.leaderName')}
          required
          name={form.leaderName}
          profileId={form.leaderProfileId}
          candidates={leaderCandidates}
          placeholder={t('troops.form.leaderNamePlaceholder')}
          onTypeName={setLeaderName}
          onSelect={selectLeader}
          onClear={clearLeaderProfile}
        />
        <LeaderPickerField
          label={t('troops.form.assistantLeaderName')}
          name={form.assistantLeaderName}
          profileId={form.assistantLeaderProfileId}
          candidates={leaderCandidates}
          placeholder={t('troops.form.leaderNamePlaceholder')}
          onTypeName={setAssistantLeaderName}
          onSelect={selectAssistantLeader}
          onClear={clearAssistantLeaderProfile}
        />
        <FormField label={t('troops.form.school')}>
          <FieldInput
            value={form.school}
            onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.barangay')}>
          <FieldInput
            value={form.barangay}
            onChange={(e) => setForm((f) => ({ ...f, barangay: e.target.value }))}
          />
        </FormField>
        <FormField label={t('troops.form.meetingPlace')} className="col-span-2">
          <FieldInput
            value={form.meetingPlace}
            onChange={(e) => setForm((f) => ({ ...f, meetingPlace: e.target.value }))}
          />
        </FormField>
      </div>
    </Modal>
  )
}

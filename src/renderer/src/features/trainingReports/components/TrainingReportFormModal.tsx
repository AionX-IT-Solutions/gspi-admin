import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { FormField, FieldInput, FieldSelect, FieldTextArea } from '@/shared/components/ui/FormField'
import { TRAINING_TYPES } from '../types/trainingReports.types'
import { useTrainingReportFormModal } from '../hooks/useTrainingReportFormModal'

export type TrainingReportDialogState = { mode: 'create' } | { mode: 'edit'; reportId: string }

interface TrainingReportFormModalProps {
  dialog: TrainingReportDialogState | null
  onClose: () => void
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--text-muted)',
        marginTop: 4,
        marginBottom: -4
      }}
    >
      {children}
    </p>
  )
}

export function TrainingReportFormModal({ dialog, onClose }: TrainingReportFormModalProps) {
  const { t } = useTranslation()
  const { form, setForm, addParticipant, updateParticipant, removeParticipant, handleSave } =
    useTrainingReportFormModal(dialog, onClose)

  const typeOptions = TRAINING_TYPES.map((type) => ({
    value: type,
    label: t(`trainingReports.types.${type}`)
  }))

  return (
    <Modal
      open={!!dialog}
      onOpenChange={(open) => !open && onClose()}
      title={
        dialog?.mode === 'edit'
          ? t('trainingReports.editButton')
          : t('trainingReports.newReportButton')
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SectionLabel>{t('trainingReports.form.sectionBasic')}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label={t('trainingReports.form.reportNo')} required>
            <FieldInput
              value={form.reportNo}
              onChange={(e) => setForm((f) => ({ ...f, reportNo: e.target.value }))}
              placeholder="19"
            />
          </FormField>
          <FormField label={t('trainingReports.form.seriesYear')} required>
            <FieldInput
              value={form.seriesYear}
              onChange={(e) => setForm((f) => ({ ...f, seriesYear: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('trainingReports.form.title')} required>
          <FieldInput
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t('trainingReports.form.titlePlaceholder')}
          />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormField label={t('trainingReports.form.place')}>
            <FieldInput
              value={form.place}
              onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.dateFrom')}>
            <FieldInput
              type="date"
              value={form.dateFrom}
              onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.dateTo')}>
            <FieldInput
              type="date"
              value={form.dateTo}
              onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))}
            />
          </FormField>
        </div>
        <FormField label={t('trainingReports.form.objectives')}>
          <FieldTextArea
            value={form.objectivesText}
            onChange={(e) => setForm((f) => ({ ...f, objectivesText: e.target.value }))}
            placeholder={t('trainingReports.form.oneLineEach')}
            rows={4}
          />
        </FormField>

        <SectionLabel>{t('trainingReports.form.sectionDetails')}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormField label={t('trainingReports.form.type')}>
            <FieldSelect
              value={form.trainingType}
              onChange={(e) =>
                setForm((f) => ({ ...f, trainingType: e.target.value as typeof f.trainingType }))
              }
              options={typeOptions}
            />
          </FormField>
          <FormField label={t('trainingReports.form.hoursPerDay')}>
            <FieldInput
              type="number"
              min={0}
              value={form.hoursPerDay}
              onChange={(e) => setForm((f) => ({ ...f, hoursPerDay: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.totalHours')}>
            <FieldInput
              type="number"
              min={0}
              value={form.totalHours}
              onChange={(e) => setForm((f) => ({ ...f, totalHours: e.target.value }))}
            />
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <FormField label={t('trainingReports.form.participantClassification')}>
            <FieldInput
              value={form.participantClassification}
              onChange={(e) =>
                setForm((f) => ({ ...f, participantClassification: e.target.value }))
              }
            />
          </FormField>
          <FormField label={t('trainingReports.form.participantCount')}>
            <FieldInput
              type="number"
              min={0}
              value={form.participantCount}
              onChange={(e) => setForm((f) => ({ ...f, participantCount: e.target.value }))}
            />
          </FormField>
        </div>

        <SectionLabel>{t('trainingReports.form.sectionFees')}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormField label={t('trainingReports.form.feePerParticipant')}>
            <FieldInput
              value={form.feePerParticipant}
              onChange={(e) => setForm((f) => ({ ...f, feePerParticipant: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.feeCollectedReserves')}>
            <FieldInput
              value={form.feeCollectedReserves}
              onChange={(e) => setForm((f) => ({ ...f, feeCollectedReserves: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.feeRemitted')}>
            <FieldInput
              value={form.feeRemitted}
              onChange={(e) => setForm((f) => ({ ...f, feeRemitted: e.target.value }))}
            />
          </FormField>
        </div>

        <SectionLabel>{t('trainingReports.form.sectionTeam')}</SectionLabel>
        <FormField label={t('trainingReports.form.trainers')}>
          <FieldTextArea
            value={form.trainersText}
            onChange={(e) => setForm((f) => ({ ...f, trainersText: e.target.value }))}
            placeholder={t('trainingReports.form.oneLineEach')}
            rows={2}
          />
        </FormField>
        <FormField label={t('trainingReports.form.coordinator')}>
          <FieldInput
            value={form.coordinator}
            onChange={(e) => setForm((f) => ({ ...f, coordinator: e.target.value }))}
          />
        </FormField>
        <FormField label={t('trainingReports.form.assistantCoordinators')}>
          <FieldTextArea
            value={form.assistantCoordinatorsText}
            onChange={(e) => setForm((f) => ({ ...f, assistantCoordinatorsText: e.target.value }))}
            placeholder={t('trainingReports.form.oneLineEach')}
            rows={2}
          />
        </FormField>
        <FormField label={t('trainingReports.form.dietician')}>
          <FieldTextArea
            value={form.dieticiansText}
            onChange={(e) => setForm((f) => ({ ...f, dieticiansText: e.target.value }))}
            placeholder={t('trainingReports.form.oneLineEach')}
            rows={2}
          />
        </FormField>

        <SectionLabel>{t('trainingReports.form.sectionObservations')}</SectionLabel>
        <FormField label={t('trainingReports.form.observations')}>
          <FieldTextArea
            value={form.observationsText}
            onChange={(e) => setForm((f) => ({ ...f, observationsText: e.target.value }))}
            placeholder={t('trainingReports.form.oneLineEach')}
            rows={4}
          />
        </FormField>

        <SectionLabel>{t('trainingReports.form.sectionParticipants')}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.participants.map((p) => (
            <div
              key={p.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}
            >
              <FieldInput
                value={p.name}
                onChange={(e) => updateParticipant(p.id, { name: e.target.value })}
                placeholder={t('trainingReports.form.participantName')}
              />
              <FieldInput
                value={p.school}
                onChange={(e) => updateParticipant(p.id, { school: e.target.value })}
                placeholder={t('trainingReports.form.participantSchool')}
              />
              <button
                onClick={() => removeParticipant(p.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 4
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus size={12} />}
            onClick={addParticipant}
            style={{ alignSelf: 'flex-start' }}
          >
            {t('trainingReports.form.addParticipant')}
          </Button>
        </div>

        <SectionLabel>{t('trainingReports.form.sectionSubmission')}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <FormField label={t('trainingReports.form.submittedByName')}>
            <FieldInput
              value={form.submittedByName}
              onChange={(e) => setForm((f) => ({ ...f, submittedByName: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.submittedByDesignation')}>
            <FieldInput
              value={form.submittedByDesignation}
              onChange={(e) => setForm((f) => ({ ...f, submittedByDesignation: e.target.value }))}
            />
          </FormField>
          <FormField label={t('trainingReports.form.submittedDate')}>
            <FieldInput
              type="date"
              value={form.submittedDate}
              onChange={(e) => setForm((f) => ({ ...f, submittedDate: e.target.value }))}
            />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}

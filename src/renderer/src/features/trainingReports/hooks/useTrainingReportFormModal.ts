import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import { useTrainingReportsStore } from '../store/trainingReports.store'
import type { TrainingReportDialogState } from '../components/TrainingReportFormModal'
import type { TrainingReportParticipant, TrainingType } from '../types/trainingReports.types'
import { toInputDate } from '@/shared/lib/utils'

function linesToList(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function emptyForm() {
  return {
    reportNo: '',
    seriesYear: String(new Date().getFullYear()),
    title: '',
    place: '',
    dateFrom: toInputDate(new Date().toISOString()),
    dateTo: '',
    objectivesText: '',
    trainingType: 'other' as TrainingType,
    hoursPerDay: '',
    totalHours: '',
    participantClassification: '',
    participantCount: '',
    feePerParticipant: 'FREE',
    feeCollectedReserves: 'N/A',
    feeRemitted: 'N/A',
    trainersText: '',
    coordinator: '',
    assistantCoordinatorsText: '',
    dieticiansText: '',
    observationsText: '',
    participants: [] as TrainingReportParticipant[],
    submittedByName: '',
    submittedByDesignation: '',
    submittedDate: toInputDate(new Date().toISOString())
  }
}

export function useTrainingReportFormModal(
  dialog: TrainingReportDialogState | null,
  onClose: () => void
) {
  const { t } = useTranslation()
  const toast = useToast()
  const trainingReports = useTrainingReportsStore((s) => s.trainingReports)
  const addTrainingReport = useTrainingReportsStore((s) => s.addTrainingReport)
  const updateTrainingReport = useTrainingReportsStore((s) => s.updateTrainingReport)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!dialog) return
    if (dialog.mode === 'edit') {
      const report = trainingReports.find((r) => r.id === dialog.reportId)
      if (report) {
        setForm({
          reportNo: report.reportNo,
          seriesYear: report.seriesYear,
          title: report.title,
          place: report.place,
          dateFrom: report.dateFrom,
          dateTo: report.dateTo ?? '',
          objectivesText: report.objectives.join('\n'),
          trainingType: report.trainingType,
          hoursPerDay: String(report.hoursPerDay),
          totalHours: String(report.totalHours),
          participantClassification: report.participantClassification,
          participantCount: String(report.participantCount),
          feePerParticipant: report.feePerParticipant,
          feeCollectedReserves: report.feeCollectedReserves,
          feeRemitted: report.feeRemitted,
          trainersText: report.trainers.join('\n'),
          coordinator: report.coordinator,
          assistantCoordinatorsText: report.assistantCoordinators.join('\n'),
          dieticiansText: report.dieticians.join('\n'),
          observationsText: report.observations.join('\n'),
          participants: report.participants,
          submittedByName: report.submittedByName,
          submittedByDesignation: report.submittedByDesignation,
          submittedDate: report.submittedDate
        })
      }
    } else {
      setForm(emptyForm())
    }
  }, [dialog, trainingReports])

  function addParticipant() {
    setForm((f) => ({
      ...f,
      participants: [...f.participants, { id: crypto.randomUUID(), name: '', school: '' }]
    }))
  }

  function updateParticipant(id: string, patch: Partial<TrainingReportParticipant>) {
    setForm((f) => ({
      ...f,
      participants: f.participants.map((p) => (p.id === id ? { ...p, ...patch } : p))
    }))
  }

  function removeParticipant(id: string) {
    setForm((f) => ({ ...f, participants: f.participants.filter((p) => p.id !== id) }))
  }

  function handleSave() {
    if (!form.title.trim() || !form.reportNo.trim()) {
      toast.error(t('trainingReports.toast.requiredFields'))
      return
    }
    const payload = {
      reportNo: form.reportNo.trim(),
      seriesYear: form.seriesYear.trim(),
      title: form.title.trim(),
      place: form.place.trim(),
      dateFrom: form.dateFrom,
      dateTo: form.dateTo || undefined,
      objectives: linesToList(form.objectivesText),
      trainingType: form.trainingType,
      hoursPerDay: Number(form.hoursPerDay) || 0,
      totalHours: Number(form.totalHours) || 0,
      participantClassification: form.participantClassification.trim(),
      participantCount: Number(form.participantCount) || 0,
      feePerParticipant: form.feePerParticipant.trim(),
      feeCollectedReserves: form.feeCollectedReserves.trim(),
      feeRemitted: form.feeRemitted.trim(),
      trainers: linesToList(form.trainersText),
      coordinator: form.coordinator.trim(),
      assistantCoordinators: linesToList(form.assistantCoordinatorsText),
      dieticians: linesToList(form.dieticiansText),
      observations: linesToList(form.observationsText),
      participants: form.participants.filter((p) => p.name.trim()),
      submittedByName: form.submittedByName.trim(),
      submittedByDesignation: form.submittedByDesignation.trim(),
      submittedDate: form.submittedDate
    }
    if (dialog?.mode === 'edit') {
      updateTrainingReport(dialog.reportId, payload)
      toast.success(t('trainingReports.toast.updated'))
    } else {
      addTrainingReport(payload)
      toast.success(t('trainingReports.toast.created'))
    }
    onClose()
  }

  return { form, setForm, addParticipant, updateParticipant, removeParticipant, handleSave }
}

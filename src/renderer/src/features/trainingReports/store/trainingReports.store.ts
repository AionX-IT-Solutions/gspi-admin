import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { TrainingReport } from '../types/trainingReports.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

/** Firestore docs saved before `dietician` (string) became `dieticians` (string[])
 *  still have the old field name — normalize on read so exports/preview don't crash
 *  on `.length`/`.join` over an undefined array. */
function normalizeTrainingReport(report: TrainingReport & { dietician?: string }): TrainingReport {
  if (report.dieticians) return report
  const { dietician, ...rest } = report
  return { ...rest, dieticians: dietician ? [dietician] : [] }
}

interface TrainingReportsState {
  trainingReports: TrainingReport[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addTrainingReport: (report: Omit<TrainingReport, 'id' | 'createdAt' | 'createdBy'>) => void
  updateTrainingReport: (
    id: string,
    patch: Omit<TrainingReport, 'id' | 'createdAt' | 'createdBy'>
  ) => void
  deleteTrainingReport: (id: string) => void
}

export const useTrainingReportsStore = create<TrainingReportsState>()((set, get) => ({
  trainingReports: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const trainingReports = (await hydrateCollection<TrainingReport>('trainingReports')).map(
        normalizeTrainingReport
      )
      set({ trainingReports, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[trainingReports.store] Failed to hydrate', err)
    }
  },

  addTrainingReport: (report) => {
    const created: TrainingReport = {
      ...report,
      id: crypto.randomUUID(),
      createdBy: actorName(),
      createdAt: new Date().toISOString()
    }
    set((s) => ({ trainingReports: [created, ...s.trainingReports] }))
    persistDoc('trainingReports', created.id, created)
    appendAuditLog({
      action: 'training_report_created',
      actorName: actorName(),
      entityType: 'training_report',
      summary: `Training Report No. ${created.reportNo} — "${created.title}" created.`
    })
  },

  updateTrainingReport: (id, patch) => {
    set((s) => ({
      trainingReports: s.trainingReports.map((r) => (r.id === id ? { ...r, ...patch } : r))
    }))
    const report = get().trainingReports.find((r) => r.id === id)
    if (report) persistDoc('trainingReports', id, report)
    appendAuditLog({
      action: 'training_report_updated',
      actorName: actorName(),
      entityType: 'training_report',
      summary: `Training Report No. ${report?.reportNo ?? id} updated.`
    })
  },

  deleteTrainingReport: (id) => {
    const report = get().trainingReports.find((r) => r.id === id)
    set((s) => ({ trainingReports: s.trainingReports.filter((r) => r.id !== id) }))
    deleteDocById('trainingReports', id)
    appendAuditLog({
      action: 'training_report_deleted',
      actorName: actorName(),
      entityType: 'training_report',
      summary: `Training Report No. ${report?.reportNo ?? id} — "${report?.title ?? ''}" deleted.`
    })
  }
}))

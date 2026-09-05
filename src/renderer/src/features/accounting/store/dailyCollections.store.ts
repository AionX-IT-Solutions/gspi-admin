import { create } from 'zustand'
import {
  persistDoc as persist,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { deleteFile } from '@/shared/lib/storageSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type {
  DailyCollectionAttachment,
  DailyCollectionReport
} from '../types/dailyCollection.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface DailyCollectionsState {
  reports: DailyCollectionReport[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  /** Upserts by date — one report per calendar date, matching the paper form. */
  saveReport: (
    report: Omit<DailyCollectionReport, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>
  ) => void
  addAttachment: (date: string, attachment: DailyCollectionAttachment) => void
  deleteAttachment: (reportId: string, attachmentId: string) => void
}

export const useDailyCollectionsStore = create<DailyCollectionsState>()((set, get) => ({
  reports: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const reports = await hydrateCollection<DailyCollectionReport>('dailyCollectionReports')
      set({ reports, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[dailyCollections.store] Failed to hydrate', err)
    }
  },

  saveReport: (report) => {
    const now = new Date().toISOString()
    const existing = get().reports.find((r) => r.date === report.date)
    const saved: DailyCollectionReport = existing
      ? { ...existing, ...report, updatedAt: now }
      : {
          ...report,
          id: crypto.randomUUID(),
          attachments: [],
          createdAt: now,
          updatedAt: now
        }
    set((s) => ({
      reports: existing
        ? s.reports.map((r) => (r.id === existing.id ? saved : r))
        : [saved, ...s.reports]
    }))
    persist('dailyCollectionReports', saved.id, saved)
    appendAuditLog({
      action: existing ? 'daily_collection_report_updated' : 'daily_collection_report_created',
      actorName: actorName(),
      entityType: 'daily_collection_report',
      summary: `Daily Collection Report for ${report.date} ${existing ? 'updated' : 'created'}.`
    })
  },

  addAttachment: (date, attachment) => {
    const existing = get().reports.find((r) => r.date === date)
    const now = new Date().toISOString()
    const saved: DailyCollectionReport = existing
      ? { ...existing, attachments: [attachment, ...existing.attachments], updatedAt: now }
      : {
          id: crypto.randomUUID(),
          date,
          beginningBalance: 0,
          manualReceipts: [],
          deposits: [],
          preparedBy: actorName(),
          attachments: [attachment],
          createdAt: now,
          updatedAt: now
        }
    set((s) => ({
      reports: existing
        ? s.reports.map((r) => (r.id === existing.id ? saved : r))
        : [saved, ...s.reports]
    }))
    persist('dailyCollectionReports', saved.id, saved)
    appendAuditLog({
      action: 'daily_collection_attachment_added',
      actorName: actorName(),
      entityType: 'daily_collection_report',
      summary: `Attachment "${attachment.name}" added to Daily Collection Report for ${date}.`
    })
  },

  deleteAttachment: (reportId, attachmentId) => {
    const report = get().reports.find((r) => r.id === reportId)
    if (!report) return
    const attachment = report.attachments.find((a) => a.id === attachmentId)
    const updated: DailyCollectionReport = {
      ...report,
      attachments: report.attachments.filter((a) => a.id !== attachmentId),
      updatedAt: new Date().toISOString()
    }
    set((s) => ({ reports: s.reports.map((r) => (r.id === reportId ? updated : r)) }))
    persist('dailyCollectionReports', reportId, updated)
    if (attachment) deleteFile(attachment.storagePath)
    appendAuditLog({
      action: 'daily_collection_attachment_deleted',
      actorName: actorName(),
      entityType: 'daily_collection_report',
      summary: `Attachment "${attachment?.name ?? attachmentId}" deleted from Daily Collection Report for ${report.date}.`
    })
  }
}))

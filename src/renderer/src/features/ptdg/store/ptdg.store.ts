import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { PtdgApplication } from '../types/ptdg.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface PtdgState {
  applications: PtdgApplication[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addApplication: (application: Omit<PtdgApplication, 'id' | 'createdAt' | 'createdBy'>) => void
  updateApplication: (id: string, patch: Partial<PtdgApplication>) => void
  deleteApplication: (id: string) => void
  /** Records the Region's own Notice of Approval/Disapproval once it comes back —
   *  separate from `updateApplication` so it always leaves an audit trail entry. */
  decideApplication: (
    id: string,
    decision: {
      status: 'approved' | 'disapproved'
      regionalApprovedAmount?: number
      regionalRemarks?: string
    }
  ) => void
}

export const usePtdgStore = create<PtdgState>()((set, get) => ({
  applications: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const applications = await hydrateCollection<PtdgApplication>('ptdgApplications')
      set({ applications, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[ptdg.store] Failed to hydrate', err)
    }
  },

  addApplication: (application) => {
    const created: PtdgApplication = {
      ...application,
      id: crypto.randomUUID(),
      createdBy: actorName(),
      createdAt: new Date().toISOString()
    }
    set((s) => ({ applications: [created, ...s.applications] }))
    persistDoc('ptdgApplications', created.id, created)
    appendAuditLog({
      action: 'ptdg_application_created',
      actorName: actorName(),
      entityType: 'ptdg_application',
      summary: `${created.applicationNumber} — "${created.purpose}" created.`
    })
  },

  updateApplication: (id, patch) => {
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, ...patch } : a))
    }))
    const application = get().applications.find((a) => a.id === id)
    if (application) persistDoc('ptdgApplications', id, application)
    appendAuditLog({
      action: 'ptdg_application_updated',
      actorName: actorName(),
      entityType: 'ptdg_application',
      summary: `${application?.applicationNumber ?? id} updated.`
    })
  },

  deleteApplication: (id) => {
    const application = get().applications.find((a) => a.id === id)
    set((s) => ({ applications: s.applications.filter((a) => a.id !== id) }))
    deleteDocById('ptdgApplications', id)
    appendAuditLog({
      action: 'ptdg_application_deleted',
      actorName: actorName(),
      entityType: 'ptdg_application',
      summary: `${application?.applicationNumber ?? id} deleted.`
    })
  },

  decideApplication: (id, decision) => {
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              status: decision.status,
              regionalApprovedAmount: decision.regionalApprovedAmount,
              regionalRemarks: decision.regionalRemarks,
              regionalDecisionDate: new Date().toISOString()
            }
          : a
      )
    }))
    const application = get().applications.find((a) => a.id === id)
    if (application) persistDoc('ptdgApplications', id, application)
    appendAuditLog({
      action: 'ptdg_application_decided',
      actorName: actorName(),
      entityType: 'ptdg_application',
      summary: `${application?.applicationNumber ?? id} marked as ${decision.status} by the Region.`
    })
  }
}))

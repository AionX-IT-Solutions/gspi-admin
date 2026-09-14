import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { CouncilDepositsRecord } from '../types/councilDeposits.types'

function currentUser() {
  return useAppStore.getState().currentUser
}

export type CouncilDepositsEdit = Omit<CouncilDepositsRecord, 'id' | 'updatedAt'>

interface CouncilDepositsState {
  records: CouncilDepositsRecord[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  /** Adds a new dated snapshot and returns its id. */
  addRecord: (edit: CouncilDepositsEdit) => string
  updateRecord: (id: string, edit: CouncilDepositsEdit) => void
  deleteRecord: (id: string) => void
}

export const useCouncilDepositsStore = create<CouncilDepositsState>((set, get) => ({
  records: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const records = await hydrateCollection<CouncilDepositsRecord>('councilDeposits')
      set({ records, hydrated: true })
    } catch (err) {
      reportHydrateFailure('Failed to hydrate councilDeposits', err)
      set({ hydrated: true })
    }
  },

  addRecord: (edit) => {
    const record: CouncilDepositsRecord = {
      ...edit,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString()
    }
    set((s) => ({ records: [record, ...s.records] }))
    persistDoc('councilDeposits', record.id, record)
    appendAuditLog({
      action: 'council_deposits_created',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'councilDeposits',
      summary: `Council Deposits (RHQ) snapshot added${record.asOfDate ? ` for ${record.asOfDate}` : ''}.`
    })
    return record.id
  },

  updateRecord: (id, edit) => {
    const existing = get().records.find((r) => r.id === id)
    if (!existing) return
    const updated: CouncilDepositsRecord = {
      ...existing,
      ...edit,
      updatedAt: new Date().toISOString()
    }
    set((s) => ({ records: s.records.map((r) => (r.id === id ? updated : r)) }))
    persistDoc('councilDeposits', id, updated)
    appendAuditLog({
      action: 'council_deposits_updated',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'councilDeposits',
      summary: `Council Deposits (RHQ) snapshot${updated.asOfDate ? ` for ${updated.asOfDate}` : ''} updated.`
    })
  },

  deleteRecord: (id) => {
    const record = get().records.find((r) => r.id === id)
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
    deleteDocById('councilDeposits', id)
    appendAuditLog({
      action: 'council_deposits_deleted',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'councilDeposits',
      summary: `Council Deposits (RHQ) snapshot${record?.asOfDate ? ` for ${record.asOfDate}` : ''} deleted.`
    })
  }
}))

import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { VisitorLog } from '../types/visitors.types'

function currentUser() {
  return useAppStore.getState().currentUser
}

export interface LogVisitorInput {
  fullName: string
  purpose: string
  personToVisit: string
  contactNumber?: string
}

interface VisitorsState {
  visitors: VisitorLog[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  logVisitor: (input: LogVisitorInput) => void
  checkOut: (id: string) => void
  deleteVisitor: (id: string) => void
  /** Re-inserts an exact previously-deleted visitor log (same id) — used by the Undo toast. */
  restoreVisitor: (visitor: VisitorLog) => void
}

export const useVisitorsStore = create<VisitorsState>()((set, get) => ({
  visitors: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const visitors = await hydrateCollection<VisitorLog>('visitors')
      set({ visitors, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[visitors.store] Failed to hydrate', err)
    }
  },

  logVisitor: (input) => {
    const user = currentUser()
    const now = new Date().toISOString()
    const created: VisitorLog = {
      ...input,
      id: crypto.randomUUID(),
      timeIn: now,
      status: 'checked_in',
      loggedById: user?.id ?? '',
      loggedByName: user?.fullName ?? 'System',
      createdAt: now
    }
    set((s) => ({ visitors: [created, ...s.visitors] }))
    persistDoc('visitors', created.id, created)
    appendAuditLog({
      action: 'visitor_logged',
      actorName: user?.fullName ?? 'System',
      entityType: 'visitor',
      summary: `${created.fullName} logged in to see ${created.personToVisit}.`
    })
  },

  checkOut: (id) => {
    const visitor = get().visitors.find((v) => v.id === id)
    if (!visitor) return
    const updated: VisitorLog = {
      ...visitor,
      timeOut: new Date().toISOString(),
      status: 'checked_out'
    }
    set((s) => ({ visitors: s.visitors.map((v) => (v.id === id ? updated : v)) }))
    persistDoc('visitors', id, updated)
    appendAuditLog({
      action: 'visitor_checked_out',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'visitor',
      summary: `${visitor.fullName} checked out.`
    })
  },

  deleteVisitor: (id) => {
    const visitor = get().visitors.find((v) => v.id === id)
    set((s) => ({ visitors: s.visitors.filter((v) => v.id !== id) }))
    deleteDocById('visitors', id)
    appendAuditLog({
      action: 'visitor_deleted',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'visitor',
      summary: `Visitor log for ${visitor?.fullName ?? id} removed.`
    })
  },

  restoreVisitor: (visitor) => {
    set((s) => ({ visitors: [visitor, ...s.visitors] }))
    persistDoc('visitors', visitor.id, visitor)
    appendAuditLog({
      action: 'visitor_logged',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'visitor',
      summary: `Visitor log for ${visitor.fullName} restored.`
    })
  }
}))

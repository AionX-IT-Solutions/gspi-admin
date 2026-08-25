import { create } from 'zustand'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import { persistDoc, reportHydrateFailure } from '@/shared/lib/firestoreSync'

export interface AuditLogEntry {
  id: string
  action: string
  actorName: string
  entityType: string
  summary: string
  createdAt: string
}

interface AuditLogState {
  entries: AuditLogEntry[]
  hydrated: boolean
  append: (entry: Omit<AuditLogEntry, 'id' | 'createdAt'>) => void
  /** Loads the real history from Firestore. Only called from the Audit Log page itself
   *  (not globally) since only admin/super_admin can read this collection — calling it
   *  for every signed-in user would just produce a permission-denied on every load. */
  hydrate: (force?: boolean) => Promise<void>
}

export const useAuditLogStore = create<AuditLogState>()((set, get) => ({
  entries: [],
  hydrated: false,

  append: (entry) => {
    const created: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    set((s) => ({ entries: [created, ...s.entries].slice(0, 500) }))
    persistDoc('auditLog', created.id, created)
  },

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const q = query(collection(db, 'auditLog'), orderBy('createdAt', 'desc'), limit(500))
      const snap = await getDocs(q)
      const entries = snap.docs.map((d) => ({ ...(d.data() as AuditLogEntry), id: d.id }))
      set({ entries, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[auditLog.store] Failed to hydrate', err)
    }
  }
}))

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>) {
  useAuditLogStore.getState().append(entry)
}

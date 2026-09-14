import { create } from 'zustand'
import {
  persistDoc,
  hydrateCollection,
  reportHydrateFailure,
  deleteDocById
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { ExpenseSummary, ExpenseSummaryItem } from '../types/expenseSummary.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface ExpenseSummaryState {
  summaries: ExpenseSummary[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  saveSummary: (voucherId: string, items: ExpenseSummaryItem[]) => void
  deleteSummary: (voucherId: string) => void
}

export const useExpenseSummaryStore = create<ExpenseSummaryState>((set, get) => ({
  summaries: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const summaries = await hydrateCollection<ExpenseSummary>('expenseSummaries')
      set({ summaries, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[expenseSummary.store] Failed to hydrate', err)
      set({ hydrated: true })
    }
  },

  // One summary per voucher — `id` is the voucher's own id, so saving always overwrites
  // that voucher's single record instead of accumulating duplicates.
  saveSummary: (voucherId, items) => {
    const record: ExpenseSummary = {
      id: voucherId,
      voucherId,
      items,
      updatedAt: new Date().toISOString()
    }
    set((s) => ({
      summaries: s.summaries.some((r) => r.id === voucherId)
        ? s.summaries.map((r) => (r.id === voucherId ? record : r))
        : [record, ...s.summaries]
    }))
    persistDoc('expenseSummaries', voucherId, record)
    appendAuditLog({
      action: 'expense_summary_updated',
      actorName: actorName(),
      entityType: 'expenseSummary',
      summary: `Expense summary updated (${items.length} item${items.length === 1 ? '' : 's'}).`
    })
  },

  deleteSummary: (voucherId) => {
    set((s) => ({ summaries: s.summaries.filter((r) => r.id !== voucherId) }))
    deleteDocById('expenseSummaries', voucherId)
  }
}))

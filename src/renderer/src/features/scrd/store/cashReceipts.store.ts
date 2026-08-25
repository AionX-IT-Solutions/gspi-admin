import { create } from 'zustand'
import { persistDoc, hydrateCollection, reportHydrateFailure } from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { CashReceipt } from '../types/cashReceipts.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface CashReceiptsState {
  receipts: CashReceipt[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addReceipt: (receipt: Omit<CashReceipt, 'id'>) => void
}

export const useCashReceiptsStore = create<CashReceiptsState>()((set, get) => ({
  receipts: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const receipts = await hydrateCollection<CashReceipt>('cashReceipts')
      set({ receipts, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[cashReceipts.store] Failed to hydrate', err)
    }
  },

  addReceipt: (receipt) => {
    const created: CashReceipt = { ...receipt, id: crypto.randomUUID() }
    set((s) => ({ receipts: [created, ...s.receipts] }))
    persistDoc('cashReceipts', created.id, created)
    appendAuditLog({
      action: 'cash_receipt_created',
      actorName: actorName(),
      entityType: 'cash_receipt',
      summary: `Cash receipt recorded from ${created.payor} (${created.category}).`
    })
  }
}))

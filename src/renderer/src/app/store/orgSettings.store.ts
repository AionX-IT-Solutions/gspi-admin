import { create } from 'zustand'
import {
  persistDoc as persist,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from './auditLog.store'
import { useAppStore } from './app.store'

const DOC_ID = 'main'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface OrgSettingsDoc {
  id: string
  /** 1-12 — the calendar month the annual membership year cycle starts on. Council-configurable
   *  (not hardcoded) since GSP's registration cycle isn't a fixed calendar year everywhere. */
  membershipYearStartMonth: number
  /** Flat peso amount granted on every employee's November/December payroll entry as their
   *  annual Cash Gift — council-configurable (not hardcoded) since the amount changes year to
   *  year. See [[thirteenth-month-pay]] in usePayroll for how it's applied. */
  defaultCashGift: number
}

const DEFAULTS: OrgSettingsDoc = { id: DOC_ID, membershipYearStartMonth: 6, defaultCashGift: 5000 }

interface OrgSettingsState {
  membershipYearStartMonth: number
  defaultCashGift: number
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  setMembershipYearStartMonth: (month: number) => void
  setDefaultCashGift: (amount: number) => void
}

export const useOrgSettingsStore = create<OrgSettingsState>()((set, get) => ({
  membershipYearStartMonth: DEFAULTS.membershipYearStartMonth,
  defaultCashGift: DEFAULTS.defaultCashGift,
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const docs = await hydrateCollection<OrgSettingsDoc>('orgSettings')
      const doc = docs.find((d) => d.id === DOC_ID)
      set({
        membershipYearStartMonth:
          doc?.membershipYearStartMonth ?? DEFAULTS.membershipYearStartMonth,
        defaultCashGift: doc?.defaultCashGift ?? DEFAULTS.defaultCashGift,
        hydrated: true
      })
    } catch (err) {
      reportHydrateFailure('[orgSettings.store] Failed to hydrate', err)
    }
  },

  // Both setters persist the full settings snapshot (not just the changed field) — persistDoc
  // does a plain setDoc, so writing a partial object here would silently wipe the other field.
  setMembershipYearStartMonth: (month) => {
    set({ membershipYearStartMonth: month })
    const { membershipYearStartMonth, defaultCashGift } = get()
    persist('orgSettings', DOC_ID, { membershipYearStartMonth, defaultCashGift })
    appendAuditLog({
      action: 'membership_year_start_month_updated',
      actorName: actorName(),
      entityType: 'org_settings',
      summary: `Membership year start month set to ${month}.`
    })
  },

  setDefaultCashGift: (amount) => {
    set({ defaultCashGift: amount })
    const { membershipYearStartMonth, defaultCashGift } = get()
    persist('orgSettings', DOC_ID, { membershipYearStartMonth, defaultCashGift })
    appendAuditLog({
      action: 'default_cash_gift_updated',
      actorName: actorName(),
      entityType: 'org_settings',
      summary: `Default Cash Gift amount set to ${amount}.`
    })
  }
}))

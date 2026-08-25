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
}

const DEFAULTS: OrgSettingsDoc = { id: DOC_ID, membershipYearStartMonth: 6 }

interface OrgSettingsState {
  membershipYearStartMonth: number
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  setMembershipYearStartMonth: (month: number) => void
}

export const useOrgSettingsStore = create<OrgSettingsState>()((set, get) => ({
  membershipYearStartMonth: DEFAULTS.membershipYearStartMonth,
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const docs = await hydrateCollection<OrgSettingsDoc>('orgSettings')
      const doc = docs.find((d) => d.id === DOC_ID)
      set({
        membershipYearStartMonth:
          doc?.membershipYearStartMonth ?? DEFAULTS.membershipYearStartMonth,
        hydrated: true
      })
    } catch (err) {
      reportHydrateFailure('[orgSettings.store] Failed to hydrate', err)
    }
  },

  setMembershipYearStartMonth: (month) => {
    set({ membershipYearStartMonth: month })
    persist('orgSettings', DOC_ID, { membershipYearStartMonth: month })
    appendAuditLog({
      action: 'membership_year_start_month_updated',
      actorName: actorName(),
      entityType: 'org_settings',
      summary: `Membership year start month set to ${month}.`
    })
  }
}))

import { create } from 'zustand'
import { persistDoc, hydrateCollection, reportHydrateFailure } from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import {
  monthKey,
  type AgeLevelCounts,
  type CategoryAgeLevelCounts,
  type CategoryDef,
  type ProgramReportLineItem,
  type LineItemShape,
  type ReportScope,
  type StructuredFieldDef
} from '../types/programReports.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function emptyMonthly(
  shape: LineItemShape,
  scope: ReportScope
): Pick<
  ProgramReportLineItem,
  | 'monthlyCounts'
  | 'monthlyBreakdowns'
  | 'monthlyCategoryBreakdowns'
  | 'districtMonthlyCounts'
  | 'districtMonthlyBreakdowns'
  | 'districtMonthlyCategoryBreakdowns'
  | 'entries'
> {
  if (scope === 'district') {
    if (shape === 'count') return { districtMonthlyCounts: {} }
    if (shape === 'ageLevelBreakdown') return { districtMonthlyBreakdowns: {} }
    if (shape === 'categoryAgeLevelBreakdown' || shape === 'categoryMatrix')
      return { districtMonthlyCategoryBreakdowns: {} }
    return { entries: [] }
  }
  if (shape === 'count') return { monthlyCounts: {} }
  if (shape === 'ageLevelBreakdown') return { monthlyBreakdowns: {} }
  if (shape === 'categoryAgeLevelBreakdown' || shape === 'categoryMatrix')
    return { monthlyCategoryBreakdowns: {} }
  return { entries: [] }
}

/** Population tracking is independent of `shape` — it opts in via `tracksGoalMetrics`
 *  regardless of whether the item is ageLevelBreakdown or categoryAgeLevelBreakdown. */
function emptyPopulation(
  scope: ReportScope
): Pick<ProgramReportLineItem, 'monthlyPopulation' | 'districtMonthlyPopulation'> {
  if (scope === 'district') return { districtMonthlyPopulation: {} }
  return { monthlyPopulation: {} }
}

type SeedLineItem = Pick<
  ProgramReportLineItem,
  | 'section'
  | 'code'
  | 'label'
  | 'shape'
  | 'scope'
  | 'fields'
  | 'categories'
  | 'ageLevels'
  | 'tracksGoalMetrics'
  | 'dateLabel'
  | 'dateColumnIndex'
  | 'hideDateColumn'
  | 'districtLabel'
  | 'valueLabel'
>

const num = (key: string, label: string, groupLabel?: string): StructuredFieldDef => ({
  key,
  label,
  type: 'number',
  groupLabel
})
const txt = (key: string, label: string, groupLabel?: string): StructuredFieldDef => ({
  key,
  label,
  type: 'text',
  groupLabel
})
const dt = (key: string, label: string, groupLabel?: string): StructuredFieldDef => ({
  key,
  label,
  type: 'date',
  groupLabel
})
const cat = (key: string, label: string): CategoryDef => ({ key, label })

/** REPORTS.xls's Badgework table (1.b.1) crosses age level against these 8 "Eight
 *  Point Challenge" categories as columns — one line item, not eight. */
const BADGEWORK_CATEGORIES: CategoryDef[] = [
  cat('spiritualityWellBeing', 'Spirituality & Well Being'),
  cat('preparedness', 'Preparedness'),
  cat('familyLife', 'Family Life'),
  cat('heritageCitizenship', 'Heritage & Citizenship'),
  cat('arts', 'Arts'),
  cat('environment', 'Environment'),
  cat('worldCommunity', 'World Community'),
  cat('economicSelfSufficiency', 'Economic Self-Sufficiency')
]

/** REPORTS.xls's Other WAGGGS Badges table (1.b.2) crosses age level against these 5
 *  badge-type columns. */
const WAGGGS_BADGE_CATEGORIES: CategoryDef[] = [
  cat('yunga', 'YUNGA'),
  cat('wtd', 'WTD'),
  cat('idg', 'IDG'),
  cat('stv', 'STV'),
  cat('surfSmart', 'Surf Smart')
]

/** Seeded from REPORTS.xls (Badgework / Troop Camps & Other Outdoor Activities /
 *  Improved Image & Visibility / International Affairs) — National HQ's actual monthly
 *  accomplishment-report submission form. See the "Program Reports" plan for the
 *  sheet-by-sheet mapping this list follows. Admin-editable afterward via Add/Edit Line
 *  Item, same as Goals' objectives — this is only the starting set, not a fixed enum. */
const SEED_LINE_ITEMS: SeedLineItem[] = [
  // Badgework "1.b.1 BADGEWORK" summary — District x age level only, matching REPORTS.xls's
  // own summary table exactly. Its "1.1 NUMBER OF GIRLS EARNED BADGES" category detail
  // table is entered separately below (code "1.1") — the two are entered independently,
  // not derived from each other, matching the real form's two distinct tables.
  {
    section: 'badgework',
    code: '1.b.1',
    label: 'Badgework — Eight Point Challenge',
    shape: 'ageLevelBreakdown',
    scope: 'district',
    tracksGoalMetrics: true
  },
  {
    section: 'badgework',
    code: '1.1',
    label: 'Number of Girls Earned Badges',
    shape: 'categoryAgeLevelBreakdown',
    scope: 'district',
    categories: BADGEWORK_CATEGORIES,
    tracksGoalMetrics: true
  },
  // Same split as 1.b.1/1.1 above — "1.b.2 OTHER WAGGGS BADGES" is its own plain
  // District x age level summary, matching REPORTS.xls's table exactly; its own
  // "1.b.2.1 NUMBER OF GIRLS EARNED BADGES" category detail table is entered
  // separately below (code "1.b.2.1"), not derived from this one.
  {
    section: 'badgework',
    code: '1.b.2',
    label: 'Other WAGGGS Badges',
    shape: 'ageLevelBreakdown',
    scope: 'district',
    tracksGoalMetrics: true
  },
  {
    section: 'badgework',
    code: '1.b.2.1',
    label: 'Number of Girls Earned Badges',
    shape: 'categoryAgeLevelBreakdown',
    scope: 'district',
    categories: WAGGGS_BADGE_CATEGORIES,
    tracksGoalMetrics: true
  },
  // Same split as 1.b.1/1.1 and 1.b.2/1.b.2.1 above — "1.b.3 FREE BEING ME / ACTION
  // ON BODY CONFIDENCE" is its own plain District x age level summary; its own
  // "1.b.3.1 NUMBER OF GIRLS EARNED BADGES" detail table (a single-category matrix,
  // REPORTS.xls only ever has one column here) is entered separately below.
  {
    section: 'badgework',
    code: '1.b.3',
    label: 'Free Being Me / Action on Body Confidence',
    shape: 'ageLevelBreakdown',
    scope: 'district',
    tracksGoalMetrics: true
  },
  {
    section: 'badgework',
    code: '1.b.3.1',
    label: 'Number of Girls Earned Badges',
    shape: 'categoryAgeLevelBreakdown',
    scope: 'district',
    categories: [cat('value', 'Free Being Me / Action on Body Confidence')],
    tracksGoalMetrics: true
  },
  // Same split — "1.b.4 GIRL POWERED NUTRITION PROGRAM" summary + its own
  // "1.b.4.1 NUMBER OF GIRLS EARNED BADGES" detail table, whose single column is
  // "No. of Girls Reached" in REPORTS.xls, not the item's own program name.
  {
    section: 'badgework',
    code: '1.b.4',
    label: 'Girl Powered Nutrition Program',
    shape: 'ageLevelBreakdown',
    scope: 'district',
    tracksGoalMetrics: true
  },
  {
    section: 'badgework',
    code: '1.b.4.1',
    label: 'Number of Girls Earned Badges',
    shape: 'categoryAgeLevelBreakdown',
    scope: 'district',
    categories: [cat('value', 'No. of Girls Reached')],
    tracksGoalMetrics: true
  },
  // Troop Camps & Other Outdoor Activities
  // District rows x {Troop Camps, Other Outdoor Activities} categories x {No. of
  // Troops, Girls, Leaders} sub-metrics, with a computed Total-of-categories group —
  // REPORTS.xls's own matrix, not a log of dated entries.
  {
    section: 'troopCamps',
    code: '1.b.5',
    label: 'Troop Camps & Other Outdoor Activities',
    shape: 'categoryMatrix',
    scope: 'district',
    categories: [cat('troopCamps', 'Troop Camps'), cat('otherOutdoor', 'Other Outdoor Activities')],
    ageLevels: [cat('troops', 'No. of Troops'), cat('girls', 'Girls'), cat('leaders', 'Leaders')]
  },
  {
    section: 'troopCamps',
    code: '1.b.6',
    label: "Patrol Leaders' Camp Permit",
    shape: 'count',
    scope: 'district',
    valueLabel: 'No. of PL Trained'
  },
  {
    section: 'troopCamps',
    code: '1.b.7',
    label: 'Patrol Camps',
    shape: 'count',
    scope: 'district',
    valueLabel: 'No. of PLs Conducted Patrol Camp and Earned PL Camp Permit Certificate & Pin'
  },
  {
    section: 'troopCamps',
    code: '1.b.8.1',
    label: 'Chief Girl Scout Medal Scheme Project',
    shape: 'count',
    scope: 'district'
  },
  {
    section: 'troopCamps',
    code: '1.b.8.2',
    label: 'Pilar Hidalgo Lim Troop Achievement Award',
    shape: 'count',
    scope: 'district'
  },
  {
    section: 'troopCamps',
    code: '1.b.8.3',
    label: 'Magic Spot Project',
    shape: 'count',
    scope: 'district'
  },
  // No standalone Date column — just "COUNCIL/DISTRICT" and "PROJECT INITIATED".
  {
    section: 'troopCamps',
    code: '1.b.9',
    label: 'Senior-Cadet Planning Board',
    shape: 'log',
    scope: 'district',
    districtLabel: 'Council/District',
    hideDateColumn: true,
    fields: [txt('project', 'Project Initiated')]
  },
  // "Date Conducted" is already its own field (3rd column) — no separate built-in
  // Date column on top of it.
  {
    section: 'troopCamps',
    code: '1.b.10',
    label: 'More Learner-Led Activities for Senior & Cadet Girl Scouts',
    shape: 'log',
    scope: 'council',
    hideDateColumn: true,
    fields: [
      txt('activity', 'Learner-Led Activity Conducted'),
      num('participants', 'No. of Senior & Cadet Participants'),
      dt('date', 'Date Conducted'),
      txt('venue', 'Venue'),
      txt('facilitators', 'Girl Leaders/Facilitators')
    ]
  },
  // No standalone Date column.
  {
    section: 'troopCamps',
    code: '1.b.11',
    label: 'SAVER Team',
    shape: 'log',
    scope: 'council',
    hideDateColumn: true,
    fields: [
      num('girlScouts', 'No. of Girl Scouts', 'Members'),
      num('adults', 'No. of Adults', 'Members'),
      num('nonGS', 'Non-GS', 'Members'),
      txt('preEmergencyAction', 'Pre-Emergency Action'),
      txt('actualEmergencyAction', 'Actual Emergency Action'),
      txt('postEmergencyAction', 'Post-Emergency Action')
    ]
  },
  // Improved Image & Visibility
  // REPORTS.xls has no standalone Date column for this table — its "Date of Issue"
  // field (part of the Junior Journalist Guild group) already covers it.
  {
    section: 'improvedImage',
    code: '1.c.1',
    label: 'Functional Girl Clubs — JJG & RTV',
    shape: 'log',
    scope: 'council',
    hideDateColumn: true,
    fields: [
      txt('newsletterName', 'Name of Council Newsletter', 'Junior Journalist Guild'),
      dt('issueDate', 'Date of Issue', 'Junior Journalist Guild'),
      txt('radioTvProgram', 'Name of Radio/TV Program', 'Radio/TV Club'),
      txt('station', 'Radio/TV Station', 'Radio/TV Club'),
      txt('schedule', 'Schedule', 'Radio/TV Club'),
      num('girls', 'Girls', 'Radio/TV Club'),
      num('adults', 'Adults', 'Radio/TV Club')
    ]
  },
  {
    section: 'improvedImage',
    code: '1.c.2',
    label: 'Girl Scout Articles',
    shape: 'log',
    scope: 'district',
    hideDateColumn: true,
    fields: [
      txt('articleTitle', 'Title of Article'),
      txt('writer', 'Writer'),
      dt('dateReceived', 'Date Received')
    ]
  },
  {
    section: 'improvedImage',
    code: '1.c.3',
    label: 'Girl Scout Videos',
    shape: 'log',
    scope: 'district',
    hideDateColumn: true,
    fields: [
      txt('videoTitle', 'Title of Video'),
      txt('creator', 'Creator'),
      dt('dateReceived', 'Date Received')
    ]
  },
  // Date sits between the event/activity name and the venue in REPORTS.xls, not first.
  {
    section: 'improvedImage',
    code: '1.c.4',
    label: 'Utilization of Quad Media',
    shape: 'log',
    scope: 'council',
    dateColumnIndex: 1,
    fields: [
      txt('eventActivity', 'Council Event/Activity'),
      txt('venue', 'Venue'),
      txt('tv', 'TV', 'Quad-Media Utilized'),
      txt('radio', 'Radio', 'Quad-Media Utilized'),
      txt('printMedia', 'Print Media', 'Quad-Media Utilized'),
      txt('socialMedia', 'Social Media', 'Quad-Media Utilized')
    ]
  },
  // Date (of Award) sits after the awardee counts and before the venue in REPORTS.xls.
  {
    section: 'improvedImage',
    code: '3.a.4',
    label: 'Awards Ceremony',
    shape: 'log',
    scope: 'district',
    dateLabel: 'Date of Award',
    dateColumnIndex: 4,
    fields: [
      num('troopLeaders', 'Troop Leaders', 'Number of Awardees'),
      num('otherMembers', 'Other Members', 'Number of Awardees'),
      num('nonMembers', 'Non-Members', 'Number of Awardees'),
      txt('venue', 'Venue')
    ]
  },
  // International Affairs
  {
    section: 'intlAffairs',
    code: '1.b.14',
    label: 'Increased & Diversified Participation in International Events',
    shape: 'log',
    scope: 'council',
    dateColumnIndex: 2,
    fields: [
      txt('council', 'Council'),
      txt('event', 'International Event Attended'),
      txt('place', 'Place'),
      num('girls', 'Girl', 'Participant'),
      num('adults', 'Adult', 'Participant')
    ]
  },
  {
    section: 'intlAffairs',
    code: '1.b.15',
    label: 'Sustainability of International Participation',
    shape: 'log',
    scope: 'council',
    dateLabel: 'Date Posted',
    dateColumnIndex: 2,
    fields: [
      txt('internationalEvent', 'International Event'),
      txt('supplementaryInitiative', 'Supplementary Initiative Done'),
      txt('platform', 'Online Platform/Council Event Used')
    ]
  }
]

interface ProgramReportsState {
  lineItems: ProgramReportLineItem[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  updateLineItem: (
    id: string,
    patch: Partial<Pick<ProgramReportLineItem, 'code' | 'label' | 'ageLevels'>>
  ) => void
  setMonthlyCount: (id: string, year: string, monthIndex: number, value: number) => void
  setMonthlyBreakdown: (id: string, year: string, monthIndex: number, value: AgeLevelCounts) => void
  setDistrictMonthlyCount: (
    id: string,
    district: string,
    year: string,
    monthIndex: number,
    value: number
  ) => void
  setDistrictMonthlyBreakdown: (
    id: string,
    district: string,
    year: string,
    monthIndex: number,
    value: AgeLevelCounts
  ) => void
  setMonthlyCategoryBreakdown: (
    id: string,
    year: string,
    monthIndex: number,
    value: CategoryAgeLevelCounts
  ) => void
  setDistrictMonthlyCategoryBreakdown: (
    id: string,
    district: string,
    year: string,
    monthIndex: number,
    value: CategoryAgeLevelCounts
  ) => void
  setMonthlyPopulation: (
    id: string,
    year: string,
    monthIndex: number,
    value: AgeLevelCounts
  ) => void
  setDistrictMonthlyPopulation: (
    id: string,
    district: string,
    year: string,
    monthIndex: number,
    value: AgeLevelCounts
  ) => void
  setMonthlyAwardedAgainstGoal: (
    id: string,
    year: string,
    monthIndex: number,
    value: number
  ) => void
  setDistrictMonthlyAwardedAgainstGoal: (
    id: string,
    district: string,
    year: string,
    monthIndex: number,
    value: number
  ) => void
  setGoalTarget: (id: string, value: number | undefined) => void
  addLogEntry: (
    id: string,
    entry: { date: string; district?: string; values: Record<string, string | number> }
  ) => void
  updateLogEntry: (
    id: string,
    entryId: string,
    patch: Partial<{ date: string; district?: string; values: Record<string, string | number> }>
  ) => void
  deleteLogEntry: (id: string, entryId: string) => void
  /** Removes a District entirely from a line item — every month's data under it,
   *  across whichever district-keyed field(s) the item's shape actually uses, plus
   *  any log entries tagged with it. Lets an admin clean up a mistyped/placeholder
   *  District (e.g. "Unspecified") straight from the breakdown modal. */
  deleteDistrict: (id: string, district: string) => void
}

// Guards the seed-if-missing check below against firing twice from within this same
// app instance — e.g. two components both calling hydrate() on mount before either
// finishes, or a force refresh landing while the initial hydrate is still in flight.
// Without this, both callers independently compute the same "missing codes" list and
// each write their own seed doc for it, producing duplicate line items with the same
// code (see banks.store.ts's identical guard for the incident that fixed there).
let hydratePromise: Promise<void> | null = null

export const useProgramReportsStore = create<ProgramReportsState>()((set, get) => ({
  lineItems: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    if (hydratePromise) return hydratePromise
    hydratePromise = (async () => {
      try {
        const docs = await hydrateCollection<ProgramReportLineItem>('programReportLineItems')
        // Matched by section, not by any per-item field — code is editable via Edit
        // Line Item, and label has in practice drifted too (e.g. from earlier admin
        // edits or migrations), so matching on either one eventually goes stale and
        // re-seeds a duplicate. A section that already has any docs is treated as
        // already seeded, full stop — new items only ever come from admins explicitly
        // adding one, never from hydrate() re-guessing what's "missing".
        const seededSections = new Set(docs.map((d) => d.section))
        const missingSeed = SEED_LINE_ITEMS.filter((seed) => !seededSections.has(seed.section)).map(
          (seed) => ({
            id: crypto.randomUUID(),
            ...seed,
            ...emptyMonthly(seed.shape, seed.scope),
            ...(seed.tracksGoalMetrics ? emptyPopulation(seed.scope) : {})
          })
        )
        if (missingSeed.length > 0) {
          await Promise.all(
            missingSeed.map((item) => persistDoc('programReportLineItems', item.id, item))
          )
        }
        set({ lineItems: [...docs, ...missingSeed], hydrated: true })
      } catch (err) {
        reportHydrateFailure('[programReports.store] Failed to hydrate', err)
      } finally {
        hydratePromise = null
      }
    })()
    return hydratePromise
  },

  updateLineItem: (id, patch) => {
    set((s) => ({ lineItems: s.lineItems.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
    appendAuditLog({
      action: 'program_report_line_item_updated',
      actorName: actorName(),
      entityType: 'program_report_line_item',
      summary: `Line item ${item?.code ?? id} updated.`
    })
  },

  setMonthlyCount: (id, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id ? { ...i, monthlyCounts: { ...i.monthlyCounts, [key]: value } } : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setMonthlyBreakdown: (id, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id ? { ...i, monthlyBreakdowns: { ...i.monthlyBreakdowns, [key]: value } } : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setDistrictMonthlyCount: (id, district, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) => {
        if (i.id !== id) return i
        const current = i.districtMonthlyCounts?.[district] ?? {}
        return {
          ...i,
          districtMonthlyCounts: {
            ...i.districtMonthlyCounts,
            [district]: { ...current, [key]: value }
          }
        }
      })
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setDistrictMonthlyBreakdown: (id, district, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) => {
        if (i.id !== id) return i
        const current = i.districtMonthlyBreakdowns?.[district] ?? {}
        return {
          ...i,
          districtMonthlyBreakdowns: {
            ...i.districtMonthlyBreakdowns,
            [district]: { ...current, [key]: value }
          }
        }
      })
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setMonthlyCategoryBreakdown: (id, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id
          ? { ...i, monthlyCategoryBreakdowns: { ...i.monthlyCategoryBreakdowns, [key]: value } }
          : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setDistrictMonthlyCategoryBreakdown: (id, district, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) => {
        if (i.id !== id) return i
        const current = i.districtMonthlyCategoryBreakdowns?.[district] ?? {}
        return {
          ...i,
          districtMonthlyCategoryBreakdowns: {
            ...i.districtMonthlyCategoryBreakdowns,
            [district]: { ...current, [key]: value }
          }
        }
      })
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setMonthlyPopulation: (id, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id ? { ...i, monthlyPopulation: { ...i.monthlyPopulation, [key]: value } } : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setDistrictMonthlyPopulation: (id, district, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) => {
        if (i.id !== id) return i
        const current = i.districtMonthlyPopulation?.[district] ?? {}
        return {
          ...i,
          districtMonthlyPopulation: {
            ...i.districtMonthlyPopulation,
            [district]: { ...current, [key]: value }
          }
        }
      })
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setMonthlyAwardedAgainstGoal: (id, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id
          ? { ...i, monthlyAwardedAgainstGoal: { ...i.monthlyAwardedAgainstGoal, [key]: value } }
          : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setDistrictMonthlyAwardedAgainstGoal: (id, district, year, monthIndex, value) => {
    const key = monthKey(year, monthIndex)
    set((s) => ({
      lineItems: s.lineItems.map((i) => {
        if (i.id !== id) return i
        const current = i.districtMonthlyAwardedAgainstGoal?.[district] ?? {}
        return {
          ...i,
          districtMonthlyAwardedAgainstGoal: {
            ...i.districtMonthlyAwardedAgainstGoal,
            [district]: { ...current, [key]: value }
          }
        }
      })
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  setGoalTarget: (id, value) => {
    set((s) => ({
      lineItems: s.lineItems.map((i) => (i.id === id ? { ...i, goalTarget: value } : i))
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  addLogEntry: (id, entry) => {
    const newEntry = { ...entry, id: crypto.randomUUID() }
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id ? { ...i, entries: [newEntry, ...(i.entries ?? [])] } : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  updateLogEntry: (id, entryId, patch) => {
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id
          ? {
              ...i,
              entries: (i.entries ?? []).map((e) => (e.id === entryId ? { ...e, ...patch } : e))
            }
          : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  deleteLogEntry: (id, entryId) => {
    set((s) => ({
      lineItems: s.lineItems.map((i) =>
        i.id === id ? { ...i, entries: (i.entries ?? []).filter((e) => e.id !== entryId) } : i
      )
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
  },

  deleteDistrict: (id, district) => {
    set((s) => ({
      lineItems: s.lineItems.map((i) => {
        if (i.id !== id) return i
        const next = { ...i }
        if (next.districtMonthlyCounts) {
          const rest = { ...next.districtMonthlyCounts }
          delete rest[district]
          next.districtMonthlyCounts = rest
        }
        if (next.districtMonthlyBreakdowns) {
          const rest = { ...next.districtMonthlyBreakdowns }
          delete rest[district]
          next.districtMonthlyBreakdowns = rest
        }
        if (next.districtMonthlyCategoryBreakdowns) {
          const rest = { ...next.districtMonthlyCategoryBreakdowns }
          delete rest[district]
          next.districtMonthlyCategoryBreakdowns = rest
        }
        if (next.districtMonthlyPopulation) {
          const rest = { ...next.districtMonthlyPopulation }
          delete rest[district]
          next.districtMonthlyPopulation = rest
        }
        if (next.districtMonthlyAwardedAgainstGoal) {
          const rest = { ...next.districtMonthlyAwardedAgainstGoal }
          delete rest[district]
          next.districtMonthlyAwardedAgainstGoal = rest
        }
        if (next.entries) {
          next.entries = next.entries.filter((e) => e.district !== district)
        }
        return next
      })
    }))
    const item = get().lineItems.find((i) => i.id === id)
    if (item) persistDoc('programReportLineItems', id, item)
    appendAuditLog({
      action: 'program_report_line_item_updated',
      actorName: actorName(),
      entityType: 'program_report_line_item',
      summary: `District "${district}" removed from line item ${item?.code ?? id}.`
    })
  }
}))

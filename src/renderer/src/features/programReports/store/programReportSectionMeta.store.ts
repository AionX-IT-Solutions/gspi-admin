import { create } from 'zustand'
import {
  persistDoc as persist,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { monthKey, PROGRAM_MONTHS, type ProgramReportSection } from '../types/programReports.types'

const DOC_ID = 'main'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

export interface ProgramReportSectionMeta {
  /** The report's own title, printed under the org header — e.g. "MONTHLY PROGRAM REPORT". */
  reportTitle: string
  /** The Goal-level heading printed above this section's tables — e.g. "GOAL 1. b
   *  STRENGTHENED QUALITY OF THE GIRL SCOUTING EXPERIENCE". Admin-editable rather than
   *  hardcoded since Goal numbering/wording is set by National HQ and can change between
   *  program years. */
  goalHeading: string
  /** Prints a "Council: GSP <council name>" line under the report title — REPORTS.xls's
   *  Int'l Affairs and Improved Image sheets both have this (Badgework/Troop Camps
   *  don't), presumably because those two are submitted as standalone forms rather than
   *  pages of the combined Monthly Program Report packet. */
  showCouncilLine?: boolean
}

/** Starting defaults, verbatim from REPORTS.xls (NHQ's actual submission workbook) — one
 *  sheet per section. Only overridden in Firestore once an admin edits a section's header. */
export const DEFAULT_SECTION_META: Record<ProgramReportSection, ProgramReportSectionMeta> = {
  badgework: {
    reportTitle: 'MONTHLY PROGRAM REPORT',
    goalHeading: 'GOAL 1. b STRENGTHENED QUALITY OF THE GIRL SCOUTING EXPERIENCE'
  },
  troopCamps: {
    reportTitle: 'MONTHLY PROGRAM REPORT',
    goalHeading: 'GOAL 1. b STRENGTHENED QUALITY OF THE GIRL SCOUTING EXPERIENCE'
  },
  intlAffairs: {
    reportTitle: 'INTERNATIONAL AFFAIRS REPORT',
    goalHeading: 'GOAL 1. b STRENGTHENED QUALITY OF THE GIRL SCOUTING EXPERIENCE',
    showCouncilLine: true
  },
  improvedImage: {
    reportTitle: 'ACCOMPLISHMENT REPORT',
    goalHeading: '1.C IMPROVED IMAGE AND VISIBILITY OF GIRL SCOUTS',
    showCouncilLine: true
  }
}

/** Header overrides are keyed per section AND per program year + month, not just per
 *  section — National HQ's Goal numbering/wording (and sometimes the report title
 *  itself) can change between program years or even month to month, so an edit made
 *  while viewing one year/month must never leak into any other. A period with no
 *  override yet just falls back to DEFAULT_SECTION_META. */
export function metaKey(section: ProgramReportSection, year: string, monthIndex: number): string {
  return `${section}|${monthKey(year, monthIndex)}`
}

interface SectionMetaDoc {
  id: string
  meta: Record<string, ProgramReportSectionMeta>
}

interface ProgramReportSectionMetaState {
  meta: Record<string, ProgramReportSectionMeta>
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  /** Builds a fresh object every call — safe to call imperatively (as `updateSectionMeta`
   *  does below), but never select this directly as a React hook, e.g.
   *  `useProgramReportSectionMetaStore((s) => s.getSectionMeta(...))`. Zustand's React
   *  binding requires a selector's return value to be reference-stable across calls when
   *  the underlying state hasn't changed; a selector that hands back a new `{...}` object
   *  every render trips React's `useSyncExternalStore` "snapshot changed" check on every
   *  single render, which re-renders, which calls the selector again, forever — a
   *  "Maximum update depth exceeded" crash. In a component, select the stable
   *  `meta[metaKey(section, year, monthIndex)]` slice instead and merge it with
   *  `DEFAULT_SECTION_META` in a `useMemo` — see EditSectionHeaderModal.tsx. */
  getSectionMeta: (
    section: ProgramReportSection,
    year: string,
    monthIndex: number
  ) => ProgramReportSectionMeta
  updateSectionMeta: (
    section: ProgramReportSection,
    year: string,
    monthIndex: number,
    patch: Partial<ProgramReportSectionMeta>
  ) => void
}

export const useProgramReportSectionMetaStore = create<ProgramReportSectionMetaState>()(
  (set, get) => ({
    meta: {},
    hydrated: false,

    hydrate: async (force = false) => {
      if (get().hydrated && !force) return
      try {
        const docs = await hydrateCollection<SectionMetaDoc>('programReportSectionMeta')
        const doc = docs.find((d) => d.id === DOC_ID)
        set({ meta: doc?.meta ?? {}, hydrated: true })
      } catch (err) {
        reportHydrateFailure('[programReportSectionMeta.store] Failed to hydrate', err)
      }
    },

    getSectionMeta: (section, year, monthIndex) => {
      const override = get().meta[metaKey(section, year, monthIndex)]
      return { ...DEFAULT_SECTION_META[section], ...override }
    },

    updateSectionMeta: (section, year, monthIndex, patch) => {
      const key = metaKey(section, year, monthIndex)
      const nextEntry = { ...get().getSectionMeta(section, year, monthIndex), ...patch }
      const nextMeta = { ...get().meta, [key]: nextEntry }
      set({ meta: nextMeta })
      persist('programReportSectionMeta', DOC_ID, { meta: nextMeta })
      appendAuditLog({
        action: 'program_report_section_meta_updated',
        actorName: actorName(),
        entityType: 'program_report_section_meta',
        summary: `"${section}" report header updated for ${PROGRAM_MONTHS[monthIndex]} ${year}.`
      })
    }
  })
)

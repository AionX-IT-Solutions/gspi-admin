/** Index 0 = July (start of the GSP program year) — matches goals/types/goals.types.ts's
 *  PROGRAM_MONTHS; duplicated here so this feature has no dependency on goals/. */
export const PROGRAM_MONTHS = [
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun'
] as const

/** GSP's program year runs July-June, so e.g. November 2026 belongs to program year
 *  "2026-2027" — hardcoded to July (not the separate, admin-configurable Membership
 *  Year setting in orgSettings, which defaults to June and tracks a different cycle:
 *  member registration renewal, not program reporting). Duplicated in spirit from
 *  troops/lib/membershipYear.ts's getMembershipYearLabel rather than imported, same
 *  reasoning as PROGRAM_MONTHS above. */
export function programYearLabel(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth() + 1
  const startYear = month >= 7 ? year : year - 1
  return `${startYear}-${startYear + 1}`
}

/** A handful of program years centered on the current one, newest first — the Year
 *  filter's option list. Generous enough to reach a few years of back-data without
 *  needing to grow dynamically from whatever's actually stored. */
export function programYearOptions(referenceDate: Date = new Date()): string[] {
  const current = programYearLabel(referenceDate)
  const currentStart = Number(current.split('-')[0])
  return Array.from({ length: 6 }, (_, i) => {
    const start = currentStart + 2 - i
    return `${start}-${start + 1}`
  })
}

/** Every monthly-data field (`monthlyCounts`, `districtMonthlyBreakdowns`, etc.) is
 *  keyed by this composite string rather than nested `Record<year, T[12]>` — same
 *  nesting depth as before (district-scoped fields are still just `district -> value`,
 *  the "value" is now a year+month-keyed map instead of a 12-slot array; council-scoped
 *  fields go from a 12-slot array straight to a keyed map, one level, not two). */
export function monthKey(year: string, monthIndex: number): string {
  return `${year}|${monthIndex}`
}

export const PROGRAM_REPORT_SECTIONS = [
  'badgework',
  'troopCamps',
  'improvedImage',
  'intlAffairs'
] as const

export type ProgramReportSection = (typeof PROGRAM_REPORT_SECTIONS)[number]

/** REPORTS.xls titles a Badgework-family item's category/age-level detail table under
 *  its own sub-code, distinct from the summary's own code — "1.1 NUMBER OF GIRLS EARNED
 *  BADGES" under 1.b.1 (an inconsistency in the source file itself, not introduced
 *  here), "1.b.2.1" under 1.b.2, "1.b.3.1" under 1.b.3, "1.b.4.1" under 1.b.4. Both the
 *  export (programReportsExport.ts) and the line-item list (ProgramReports.tsx, which
 *  shows the detail table as its own read-only row pointing back at the same doc) key
 *  off this same map, so the two stay in sync. */
export const BADGEWORK_DETAIL_SUBCODE: Record<string, string> = {
  '1.b.1': '1.1',
  '1.b.2': '1.b.2.1',
  '1.b.3': '1.b.3.1',
  '1.b.4': '1.b.4.1'
}

const BADGEWORK_DETAIL_CODES = new Set(Object.values(BADGEWORK_DETAIL_SUBCODE))

/** "1.1" is now its own real line item (see the split-detail migration), so this can
 *  be called with either the parent code ("1.b.1") or the detail item's own code
 *  ("1.1") — the latter is already the answer, not something to append ".1" to again. */
export function badgeworkDetailSubcode(code: string): string {
  if (BADGEWORK_DETAIL_CODES.has(code)) return code
  return BADGEWORK_DETAIL_SUBCODE[code] ?? `${code}.1`
}

/** REPORTS.xls prints a fixed heading above a detail item's category columns — "1.1"'s
 *  8 columns are "EIGHT POINT CHALLENGE", "1.b.2.1"'s 5 are "OTHER WAGGGS BADGES" —
 *  neither matches the detail item's own label ("Number of Girls Earned Badges" for
 *  both); it's the *parent* summary item's name instead. Anything not in this map
 *  falls back to its own label, uppercased, same as before. */
const CATEGORY_GROUP_LABEL_BY_CODE: Record<string, string> = {
  '1.1': 'EIGHT POINT CHALLENGE',
  '1.b.2.1': 'OTHER WAGGGS BADGES'
}
export function categoryGroupLabel(item: Pick<ProgramReportLineItem, 'code' | 'label'>): string {
  return CATEGORY_GROUP_LABEL_BY_CODE[item.code] ?? item.label.toUpperCase()
}

export const LINE_ITEM_SHAPES = [
  'count',
  'ageLevelBreakdown',
  'categoryAgeLevelBreakdown',
  'categoryMatrix',
  'log'
] as const
export type LineItemShape = (typeof LINE_ITEM_SHAPES)[number]

/** 'district' items track data per-District (matching REPORTS.xls's DISTRICT rows) with an
 *  auto-computed council total; 'council' items are a single council-wide figure, as before. */
export const REPORT_SCOPES = ['council', 'district'] as const
export type ReportScope = (typeof REPORT_SCOPES)[number]

/** The standard GSP age-level divisions — the starting default, not a fixed enum. Kept
 *  for backward-compat construction (AGE_LEVEL_LABELS, DEFAULT_AGE_LEVELS below) and as
 *  a fallback name/order when a line item has no `ageLevels` of its own; every actual
 *  read/write site should go through `item.ageLevels ?? DEFAULT_AGE_LEVELS` instead of
 *  this constant directly, same as `categories` already works. */
export const AGE_LEVELS = ['twinkler', 'star', 'junior', 'senior', 'cadet'] as const
export type AgeLevel = (typeof AGE_LEVELS)[number]

/** Keyed by whatever age-level `key`s the owning item's `ageLevels` (or the
 *  DEFAULT_AGE_LEVELS fallback) defines — not a fixed union, same reasoning as
 *  CategoryAgeLevelCounts being keyed by category `key` below. */
export type AgeLevelCounts = Record<string, number>

/** One named column of a 'categoryAgeLevelBreakdown' item's matrix — e.g. Badgework's
 *  Eight Point Challenge categories, or Other WAGGGS Badges' badge types. Mirrors
 *  StructuredFieldDef's key/label pairing so it's the same admin-editable shape. Also
 *  reused for `ageLevels` (Twinkler/Star/... are just another named-column list, one
 *  admins can customize the same way). */
export interface CategoryDef {
  key: string
  label: string
}

/** Turns a user-typed name ("Daisy") into a unique object key ("daisy", or "daisy2" if
 *  that's already taken) for a new CategoryDef — used when adding a custom age level or
 *  category straight from a breakdown modal, the same way District names double as their
 *  own keys elsewhere in this feature. */
export function uniqueDefKey(label: string, existing: CategoryDef[]): string {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '') || 'level'
  const taken = new Set(existing.map((c) => c.key))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}${n}`)) n++
  return `${base}${n}`
}

/** Fallback category for a 'categoryAgeLevelBreakdown' item with no `categories`
 *  defined — same rescue pattern as DEFAULT_LOG_FIELDS below. */
export const DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES: CategoryDef[] = [
  { key: 'total', label: 'Total' }
]

/** Age-level counts keyed by category — REPORTS.xls's Badgework/WAGGGS Badges tables
 *  cross age level (rows) against a fixed set of category columns (Eight Point
 *  Challenge / badge type) for a single District (or council total). */
export type CategoryAgeLevelCounts = Record<string, AgeLevelCounts>

export const STRUCTURED_FIELD_TYPES = ['text', 'number', 'date'] as const
export type StructuredFieldType = (typeof STRUCTURED_FIELD_TYPES)[number]

/** Defines one named column of a 'log'-shaped line item — e.g. Troop Camps' "Girls" /
 *  "Leaders" columns, or Int'l Affairs' "Event" / "Place" columns. A line item without
 *  `fields` falls back to the legacy generic description+quantity pair for backward
 *  compatibility with log entries recorded before this became configurable. */
export interface StructuredFieldDef {
  key: string
  label: string
  type: StructuredFieldType
  /** Groups consecutive fields under one spanning header cell — REPORTS.xls's "PARTICIPANT"
   *  merged cell over Int'l Affairs 1.b.14's Girl/Adult columns, for example. Fields must be
   *  adjacent in the `fields` array to render as one span. */
  groupLabel?: string
}

/** Fallback columns for a 'log' item with no `fields` defined — keeps older/custom
 *  line items (created before structured fields existed) rendering sensibly. */
export const DEFAULT_LOG_FIELDS: StructuredFieldDef[] = [
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'quantity', label: 'Qty', type: 'number' }
]

export interface ProgramReportLogEntry {
  id: string
  date: string
  /** Only set when the owning line item's `scope` is 'district'. */
  district?: string
  values: Record<string, string | number>
}

/** One line item's monthly progress, keyed the same as Goals' PROGRAM_MONTHS
 *  (index 0 = July). Only the field(s) matching `shape`/`scope` are ever populated:
 *  council-scoped 'count' -> monthlyCounts, 'ageLevelBreakdown' -> monthlyBreakdowns,
 *  'categoryAgeLevelBreakdown' -> monthlyCategoryBreakdowns; district-scoped versions
 *  use the `district*` maps instead; 'log' -> entries (each optionally tagged with a
 *  district when scope is 'district'). */
export interface ProgramReportLineItem {
  id: string
  section: ProgramReportSection
  code: string
  label: string
  shape: LineItemShape
  scope: ReportScope
  /** Keyed by monthKey(year, monthIndex) — see that function's doc comment. */
  monthlyCounts?: Record<string, number>
  monthlyBreakdowns?: Record<string, AgeLevelCounts>
  /** Also used by 'categoryMatrix' items (Troop Camps 1.b.5) — same category x
   *  sub-metric matrix shape, just without 'categoryAgeLevelBreakdown's age-level
   *  semantics or Badgework-style goal tracking; `ageLevels` doubles as the matrix's
   *  metric columns (No. of Troops / Girls / Leaders) there. */
  monthlyCategoryBreakdowns?: Record<string, CategoryAgeLevelCounts>
  districtMonthlyCounts?: Record<string, Record<string, number>>
  districtMonthlyBreakdowns?: Record<string, Record<string, AgeLevelCounts>>
  districtMonthlyCategoryBreakdowns?: Record<string, Record<string, CategoryAgeLevelCounts>>
  entries?: ProgramReportLogEntry[]
  /** Named columns for this item's log entries — see StructuredFieldDef. */
  fields?: StructuredFieldDef[]
  /** Overrides the log table's built-in "Date" column header — Int'l Affairs 1.b.15's
   *  own column is "DATE POSTED" in REPORTS.xls, for example. Defaults to "Date". */
  dateLabel?: string
  /** Where the Date column sits among the other columns (District, then `fields`, in
   *  order) — REPORTS.xls usually has Date first (the default, 0), but Int'l Affairs
   *  1.b.14/1.b.15 both have it 3rd (after 2 other columns), so `dateColumnIndex: 2`. */
  dateColumnIndex?: number
  /** Suppresses the log table's built-in Date column entirely — Improved Image 1.c.1's
   *  table has no standalone Date column at all in REPORTS.xls (its "Date of Issue"
   *  field, part of the Junior Journalist Guild group, already covers it). */
  hideDateColumn?: boolean
  /** Overrides the built-in "District" column header — Troop Camps 1.b.9/1.b.13 both
   *  label it "COUNCIL/DISTRICT" in REPORTS.xls. Defaults to the generic "District". */
  districtLabel?: string
  /** Overrides a plain 'count' item's generic "Count" column header with REPORTS.xls's
   *  own, often long, descriptive header — e.g. 1.b.7's "No. of PLs Conducted Patrol
   *  Camp and Earned PL Camp Permit Certificate & Pin". Defaults to "Count". */
  valueLabel?: string
  /** Named category columns for a 'categoryAgeLevelBreakdown' item's matrix — see CategoryDef. */
  categories?: CategoryDef[]
  /** Named age-level rows for an 'ageLevelBreakdown'/'categoryAgeLevelBreakdown' item —
   *  defaults to the 5 standard GSP levels (DEFAULT_AGE_LEVELS) when unset. Admin-editable
   *  the same way `categories` is. */
  ageLevels?: CategoryDef[]
  /** Opts this item into REPORTS.xls's Badgework-style "Total No. of Girls" / "Against
   *  Goal" tracking — see monthlyPopulation and goalTarget below. Independent of `shape`:
   *  applies on top of ageLevelBreakdown or categoryAgeLevelBreakdown alike. */
  tracksGoalMetrics?: boolean
  /** "Total No. of Girls" per age level — the population/reach base REPORTS.xls tracks
   *  alongside how many actually earned a badge, only meaningful when tracksGoalMetrics. */
  monthlyPopulation?: Record<string, AgeLevelCounts>
  districtMonthlyPopulation?: Record<string, Record<string, AgeLevelCounts>>
  /** REPORTS.xls's "Total No. of Badges Awarded Against Goal" column — filled in by
   *  hand same as monthlyPopulation, not derived from the earned totals (a badge can
   *  be earned without counting toward the goal, e.g. re-earns). Only meaningful when
   *  tracksGoalMetrics. */
  monthlyAwardedAgainstGoal?: Record<string, number>
  districtMonthlyAwardedAgainstGoal?: Record<string, Record<string, number>>
  /** Manual monthly target (e.g. "25 badges this month") an admin sets — compared
   *  against monthlyAwardedAgainstGoal/districtMonthlyAwardedAgainstGoal via
   *  percentAgainstGoal below for an at-a-glance progress readout. */
  goalTarget?: number
}

export const AGE_LEVEL_LABELS: Record<AgeLevel, string> = {
  twinkler: 'Twinkler',
  star: 'Star',
  junior: 'Junior',
  senior: 'Senior',
  cadet: 'Cadet'
}

/** The starting default for a new item's `ageLevels` — same rescue pattern as
 *  DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES/DEFAULT_LOG_FIELDS above. */
export const DEFAULT_AGE_LEVELS: CategoryDef[] = AGE_LEVELS.map((key) => ({
  key,
  label: AGE_LEVEL_LABELS[key]
}))

export function ageLevelTotal(counts: AgeLevelCounts | undefined): number {
  if (!counts) return 0
  return Object.values(counts).reduce((sum, v) => sum + (v ?? 0), 0)
}

/** Council-wide total across every district's breakdown for a given year+month — the
 *  auto-computed "COUNCIL TOTAL" row REPORTS.xls shows under each district list. */
export function councilAgeLevelTotal(
  districtBreakdowns: Record<string, Record<string, AgeLevelCounts>> | undefined,
  year: string,
  monthIndex: number
): AgeLevelCounts {
  const key = monthKey(year, monthIndex)
  const totals: AgeLevelCounts = {}
  for (const monthly of Object.values(districtBreakdowns ?? {})) {
    const counts = monthly[key]
    if (!counts) continue
    for (const [level, value] of Object.entries(counts)) {
      totals[level] = (totals[level] ?? 0) + (value ?? 0)
    }
  }
  return totals
}

/** Sum of every category's age-level total — the "TOTAL NO. OF BADGES EARNED" figure
 *  REPORTS.xls shows for a Badgework/WAGGGS Badges row. */
export function categoryAgeLevelGrandTotal(counts: CategoryAgeLevelCounts | undefined): number {
  if (!counts) return 0
  return Object.values(counts).reduce((sum, levels) => sum + ageLevelTotal(levels), 0)
}

/** Council-wide category matrix across every district's breakdown for a given
 *  year+month — same "COUNCIL TOTAL" aggregation as councilAgeLevelTotal, one
 *  dimension deeper. */
export function councilCategoryAgeLevelBreakdown(
  districtBreakdowns: Record<string, Record<string, CategoryAgeLevelCounts>> | undefined,
  year: string,
  monthIndex: number
): CategoryAgeLevelCounts {
  const key = monthKey(year, monthIndex)
  const totals: CategoryAgeLevelCounts = {}
  for (const monthly of Object.values(districtBreakdowns ?? {})) {
    const counts = monthly[key]
    if (!counts) continue
    for (const [category, levels] of Object.entries(counts)) {
      const existing = totals[category] ?? {}
      for (const [level, value] of Object.entries(levels)) {
        existing[level] = (existing[level] ?? 0) + (value ?? 0)
      }
      totals[category] = existing
    }
  }
  return totals
}

/** This month's manually entered "Total No. of Badges Awarded Against Goal" as a
 *  percentage of the admin-set target — an at-a-glance progress readout shown
 *  alongside the raw input, not itself part of REPORTS.xls. Null when no target
 *  has been set yet. */
export function percentAgainstGoal(awarded: number, target: number | undefined): number | null {
  if (!target) return null
  return Math.round((awarded / target) * 100)
}

/** Council-wide sum of a per-district single-number-per-month map for a given
 *  year+month — same aggregation as councilAgeLevelTotal, one dimension shallower. */
export function councilMonthlyTotal(
  districtValues: Record<string, Record<string, number>> | undefined,
  year: string,
  monthIndex: number
): number {
  const key = monthKey(year, monthIndex)
  return Object.values(districtValues ?? {}).reduce((sum, monthly) => sum + (monthly[key] ?? 0), 0)
}

/** Natural-sorts dotted codes like REPORTS.xls's ("1.b.1", "1.b.10", "1.b.8.1", "3.a.4")
 *  segment by segment — numeric segments compare as numbers (so "1.b.10" sorts after
 *  "1.b.9", not before "1.b.2"), everything else compares as text. A code that's a
 *  prefix of another (e.g. "1.b.8" vs "1.b.8.1") sorts first — parent before children. */
/** "1.1" is 1.b.1's own detail row, but its code doesn't nest under "1.b.1" the way
 *  "1.b.2.1" naturally does — so for ordering purposes only, treat it as if it were
 *  "1.b.1.1" (right after 1.b.1, before 1.b.2), matching how its sibling detail rows sort. */
function sortKeyForCode(code: string): string {
  return code === '1.1' ? '1.b.1.1' : code
}

export function compareLineItemCodes(a: string, b: string): number {
  const segA = sortKeyForCode(a).split('.')
  const segB = sortKeyForCode(b).split('.')
  const len = Math.max(segA.length, segB.length)
  for (let i = 0; i < len; i++) {
    const x = segA[i]
    const y = segB[i]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const nx = Number(x)
    const ny = Number(y)
    if (!Number.isNaN(nx) && !Number.isNaN(ny)) {
      if (nx !== ny) return nx - ny
    } else {
      const cmp = x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' })
      if (cmp !== 0) return cmp
    }
  }
  return 0
}

/** Line items ordered by compareLineItemCodes — REPORTS.xls's own code order, not
 *  Firestore's arbitrary document order. */
export function sortByCode<T extends { code: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => compareLineItemCodes(a.code, b.code))
}

/** A code like "1.b.8.1" is a sub-item of "1.b.8" — REPORTS.xls nests several rows
 *  (e.g. 1.b.8's three community-development award schemes) under one numbered
 *  section. More segments than the standard "N.x.N" pattern signals a sub-item. */
export function isSubCode(code: string): boolean {
  return code.split('.').length > 3
}

/** Distinct district names already used anywhere in this line item — feeds the
 *  free-text autocomplete so entries stay consistent without a hardcoded list. */
export function districtsFor(item: ProgramReportLineItem): string[] {
  const names = new Set<string>()
  Object.keys(item.districtMonthlyCounts ?? {}).forEach((d) => names.add(d))
  Object.keys(item.districtMonthlyBreakdowns ?? {}).forEach((d) => names.add(d))
  Object.keys(item.districtMonthlyCategoryBreakdowns ?? {}).forEach((d) => names.add(d))
  Object.keys(item.districtMonthlyPopulation ?? {}).forEach((d) => names.add(d))
  ;(item.entries ?? []).forEach((e) => e.district && names.add(e.district))
  return [...names].sort()
}

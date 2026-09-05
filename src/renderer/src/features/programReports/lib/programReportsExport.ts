import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import {
  createPdf,
  addHeaderLines,
  addTable,
  addSignatories,
  savePdf
} from '@/shared/lib/pdfExport'
import {
  headerParagraphs,
  buildTable,
  spacer,
  signatoryTable,
  saveDocx
} from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { formatDate } from '@/shared/lib/utils'
import { Paragraph, TextRun, type Table } from 'docx'
import {
  DEFAULT_AGE_LEVELS,
  DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES,
  DEFAULT_LOG_FIELDS,
  PROGRAM_MONTHS,
  ageLevelTotal,
  badgeworkDetailSubcode,
  categoryGroupLabel,
  councilAgeLevelTotal,
  councilCategoryAgeLevelBreakdown,
  councilMonthlyTotal,
  monthKey,
  type AgeLevelCounts,
  type CategoryAgeLevelCounts,
  type ProgramReportLineItem,
  type ProgramReportLogEntry
} from '../types/programReports.types'
import type { ProgramReportSectionMeta } from '../store/programReportSectionMeta.store'

function fileBase(sectionLabel: string): string {
  return `Program_Report_${sectionLabel}`.replace(/[^0-9a-zA-Z_]/g, '_')
}

const COUNCIL_TOTAL_LABEL = 'TOTAL'

/** One line item rendered as its own small table — REPORTS.xls's actual shape: a
 *  title, a set of column headers specific to that item, and one row per District
 *  (with an auto-computed council total row) or a single council-wide row.
 *  `groupHeader`, when present, is an extra row of column-spanning labels sitting
 *  above `headers` — REPORTS.xls's "EIGHT POINT CHALLENGE" merged cell spanning its
 *  8 category columns, for example. Spans must sum to `headers.length`. */
interface ReportTableBlock {
  title: string
  groupHeader?: { label: string; span: number }[]
  headers: string[]
  rows: (string | number)[][]
}

function blockForItem(
  item: ProgramReportLineItem,
  year: string,
  monthIndex: number
): ReportTableBlock {
  const title = `${item.code} — ${item.label}`.trim()
  const key = monthKey(year, monthIndex)

  if (item.shape === 'count') {
    const valueLabel = item.valueLabel ?? 'Count'
    if (item.scope === 'district') {
      const districts = Object.keys(item.districtMonthlyCounts ?? {}).sort()
      const rows = districts.map((d) => [d, item.districtMonthlyCounts?.[d]?.[key] ?? 0])
      const total = rows.reduce((sum, r) => sum + (r[1] as number), 0)
      rows.push([COUNCIL_TOTAL_LABEL, total])
      return { title, headers: [item.districtLabel ?? 'District', valueLabel], rows }
    }
    return { title, headers: [valueLabel], rows: [[item.monthlyCounts?.[key] ?? 0]] }
  }

  // 'log' — one column per structured field, plus Date and (if district-scoped) District.
  // Date defaults to leading (REPORTS.xls usually has it first) but `dateColumnIndex` can
  // move it — Int'l Affairs 1.b.14/1.b.15 both have it 3rd, after 2 other columns.
  const fields = item.fields ?? DEFAULT_LOG_FIELDS
  interface LogColumn {
    label: string
    groupLabel?: string
    value: (e: ProgramReportLogEntry) => string | number
  }
  const columns: LogColumn[] = []
  if (item.scope === 'district')
    columns.push({ label: item.districtLabel ?? 'District', value: (e) => e.district ?? '' })
  for (const f of fields)
    columns.push({ label: f.label, groupLabel: f.groupLabel, value: (e) => e.values[f.key] ?? '' })
  if (!item.hideDateColumn) {
    const dateColumn: LogColumn = {
      label: item.dateLabel ?? 'Date',
      value: (e) => formatDate(e.date)
    }
    columns.splice(Math.min(item.dateColumnIndex ?? 0, columns.length), 0, dateColumn)
  }

  const headers = columns.map((c) => c.label)
  const rows = (item.entries ?? []).map((e) => columns.map((c) => c.value(e)))
  return { title, headers, rows, groupHeader: logColumnsGroupHeader(columns) }
}

/** Collapses consecutive columns sharing the same `groupLabel` into one spanning header
 *  cell — REPORTS.xls's "PARTICIPANT" merged cell over Int'l Affairs 1.b.14's Girl/Adult
 *  columns, for example. Returns undefined (no group-header row at all) when no column
 *  opts in, so every other log item's export is unaffected. */
function logColumnsGroupHeader(
  columns: { label: string; groupLabel?: string }[]
): { label: string; span: number }[] | undefined {
  if (!columns.some((c) => c.groupLabel)) return undefined
  const groups: { label: string; span: number }[] = []
  for (const col of columns) {
    const last = groups[groups.length - 1]
    if (col.groupLabel && last?.label === col.groupLabel) {
      last.span++
    } else {
      groups.push({ label: col.groupLabel ?? '', span: 1 })
    }
  }
  return groups
}

interface ColumnDef {
  key: string
  label: string
}

interface DistrictGroup {
  label: string
  matrix: CategoryAgeLevelCounts
  population: AgeLevelCounts | undefined
  awardedAgainstGoal: number
}

function ageLevelCountsAcrossCategories(
  counts: CategoryAgeLevelCounts,
  categories: ColumnDef[],
  ageLevels: ColumnDef[]
): AgeLevelCounts {
  const result: AgeLevelCounts = {}
  for (const level of ageLevels) {
    result[level.key] = categories.reduce((sum, c) => sum + (counts[c.key]?.[level.key] ?? 0), 0)
  }
  return result
}

function categoryMatrixGrandTotal(counts: CategoryAgeLevelCounts, categories: ColumnDef[]): number {
  return categories.reduce((sum, c) => sum + ageLevelTotal(counts[c.key]), 0)
}

/** REPORTS.xls's Badgework-family sections (1.b.1, 1.b.2, and — with a single
 *  pseudo-category standing in for their one program — 1.b.3/1.b.4 too) are always
 *  the same two fixed tables: a "1.b.1 BADGEWORK" summary (District rows, age level
 *  columns, 3 total columns) and a "1.1 NUMBER OF GIRLS EARNED BADGES" detail table
 *  (District+Age Level nested rows, one column per category). The template itself
 *  never changes — only `categories` (8 for Badgework, 5 for WAGGGS Badges, 1 for a
 *  single-program item) and which District/month it's for. */
// REPORTS.xls's own 3 summary columns, verified against the actual merged cells in
// the file (G12:H12/I12:K12/L12:N12 on the "1.b.1 BADGEWORK" table; L26:N28 on its
// "1.1 NUMBER OF GIRLS EARNED BADGES" detail table — same 3, just abbreviated
// "No." there). "Girls Earned Badges" and "Badges Earned" are the same grand total
// (every cell in the matrix, summed in a different order) — this app has no way to
// tell "one girl counted twice" apart from "two different girls" — but the real
// form still prints them as two separate columns, so both stay, matching the file
// exactly rather than quietly collapsing them into one.
const TOTAL_GIRLS_HEADER = 'Total No. of Girls Earned Badges'
const TOTAL_BADGES_HEADER = 'Total No. of Badges Earned'
const AGAINST_GOAL_HEADER = 'Total No. of Badges Awarded Against Goal'

/** 1.b.3.1/1.b.4.1's own last column drops the "Against Goal" wording every other
 *  detail table's last column has ("Total No. of Badges Awarded" instead of "...
 *  Awarded Against Goal") — confirmed against REPORTS.xls's own header cells
 *  (BADGEWORK sheet M71 / L104), not a guess. */
const DETAIL_AGAINST_GOAL_HEADER_BY_CODE: Record<string, string> = {
  '1.b.3.1': 'Total No. of Badges Awarded',
  '1.b.4.1': 'Total No. of Badges Awarded'
}

/** 1.b.4.1 is the one detail table with no "Total No. of Badges Earned" column at
 *  all (District | Age Level | Total No. of Girls | No. of Girls Reached | Total
 *  No. of Girls Earned Badges | Total No. of Badges Awarded — 6 columns, not 7) —
 *  confirmed against REPORTS.xls (BADGEWORK sheet row 103), not a guess. */
const DETAIL_OMITS_BADGES_EARNED = new Set(['1.b.4.1'])

function detailBlockTitle(code: string): string {
  return `${badgeworkDetailSubcode(code)} NUMBER OF GIRLS EARNED BADGES`
}

/** Every Badgework-family summary item (1.b.1, 1.b.2, 1.b.3, 1.b.4) is entered as two
 *  separate documents now: a plain District x age level summary, and its own
 *  category-matrix detail item (1.1, 1.b.2.1, 1.b.3.1, 1.b.4.1 — the last two with
 *  just a single category column, since REPORTS.xls's own tables for those only ever
 *  have one). Each exports only its own real table — not the other, derived, half. */
type BlockMode = 'both' | 'summary' | 'detail'
const BLOCK_MODE: Record<string, BlockMode> = {
  '1.b.1': 'summary',
  '1.1': 'detail',
  '1.b.2': 'summary',
  '1.b.2.1': 'detail',
  '1.b.3': 'summary',
  '1.b.3.1': 'detail',
  '1.b.4': 'summary',
  '1.b.4.1': 'detail'
}

function badgeworkStyleBlocks(
  code: string,
  title: string,
  detailTitle: string,
  groupLabel: string,
  categories: ColumnDef[],
  ageLevels: ColumnDef[],
  groups: DistrictGroup[],
  showDistrictColumn: boolean,
  tracksGoalMetrics: boolean,
  mode: BlockMode
): ReportTableBlock[] {
  const ageHeaders = ageLevels.map((l) => l.label)
  const detailAgainstGoalHeader = DETAIL_AGAINST_GOAL_HEADER_BY_CODE[code] ?? AGAINST_GOAL_HEADER
  const detailHasBadgesEarned = !DETAIL_OMITS_BADGES_EARNED.has(code)

  const summaryRows = groups.map((g) => {
    const ageCounts = ageLevelCountsAcrossCategories(g.matrix, categories, ageLevels)
    const girlsEarned = ageLevelTotal(ageCounts)
    const badgesEarned = categoryMatrixGrandTotal(g.matrix, categories)
    return [
      ...(showDistrictColumn ? [g.label] : []),
      ...ageLevels.map((l) => ageCounts[l.key] ?? 0),
      girlsEarned,
      badgesEarned,
      g.awardedAgainstGoal
    ]
  })
  const summaryBlock: ReportTableBlock = {
    title,
    groupHeader: [
      ...(showDistrictColumn ? [{ label: '', span: 1 }] : []),
      { label: 'NUMBER OF GIRLS EARNED BADGES', span: ageLevels.length },
      { label: '', span: 3 } // Total No. of Girls Earned Badges + Total No. of Badges Earned + Against Goal
    ],
    headers: [
      ...(showDistrictColumn ? ['District'] : []),
      ...ageHeaders,
      TOTAL_GIRLS_HEADER,
      TOTAL_BADGES_HEADER,
      AGAINST_GOAL_HEADER
    ],
    rows: summaryRows
  }

  const leadingCols = (showDistrictColumn ? 1 : 0) + 1 + (tracksGoalMetrics ? 1 : 0) // District? + Age Level + Total No. of Girls?
  const detailTotalColumnCount = detailHasBadgesEarned ? 3 : 2
  const detailHeaders = [
    ...(showDistrictColumn ? ['District'] : []),
    'Age Level',
    ...(tracksGoalMetrics ? ['Total No. of Girls'] : []),
    ...categories.map((c) => c.label),
    TOTAL_GIRLS_HEADER,
    ...(detailHasBadgesEarned ? [TOTAL_BADGES_HEADER] : []),
    detailAgainstGoalHeader
  ]
  const detailGroupHeader = [
    ...(leadingCols > 0 ? [{ label: '', span: leadingCols }] : []),
    { label: groupLabel, span: categories.length },
    { label: '', span: detailTotalColumnCount } // Total No. of Girls Earned Badges + (Total No. of Badges Earned?) + Against Goal
  ]
  // The 3 total columns only carry a value on each District's final "Total" row —
  // REPORTS.xls leaves them blank on the individual Twinkler..Cadet rows, since
  // they're a total *of* those rows, not a per-row figure.
  //
  // The District column's name is only printed on the first row of that District's
  // block (its first Age Level row) and left blank for the rest of the block
  // (remaining Age Level rows + that District's own Total row) — a "grouped" look
  // without needing actual merged/rowspan cells, which the shared row shape (used
  // by the PDF/Excel/DOCX exporters alike) doesn't carry.
  const detailRows: (string | number)[][] = []
  const realGroups = groups.filter((g) => g.label !== COUNCIL_TOTAL_LABEL)
  for (const g of realGroups) {
    const badgesEarned = categoryMatrixGrandTotal(g.matrix, categories)
    const girlsEarned = ageLevelTotal(
      ageLevelCountsAcrossCategories(g.matrix, categories, ageLevels)
    )
    ageLevels.forEach((level, index) => {
      detailRows.push([
        ...(showDistrictColumn ? [index === 0 ? g.label : ''] : []),
        level.label,
        ...(tracksGoalMetrics ? [g.population?.[level.key] ?? 0] : []),
        ...categories.map((c) => g.matrix[c.key]?.[level.key] ?? 0),
        ...Array<string>(detailTotalColumnCount).fill('')
      ])
    })
    detailRows.push([
      ...(showDistrictColumn ? [''] : []),
      COUNCIL_TOTAL_LABEL,
      ...(tracksGoalMetrics ? [ageLevelTotal(g.population)] : []),
      ...categories.map((c) => ageLevelTotal(g.matrix[c.key])),
      girlsEarned,
      ...(detailHasBadgesEarned ? [badgesEarned] : []),
      g.awardedAgainstGoal
    ])
  }
  // A district-scoped item's overall grand total (across every District) gets one
  // summary row here, not its own repeated Twinkler..Cadet breakdown — repeating that
  // breakdown for a total that's just the sum of the rows already shown above it is
  // redundant, and REPORTS.xls doesn't do it either. Only added when there's more than
  // one real District, though — with exactly one, that District's own "Total" row above
  // already IS the grand total (identical numbers), so a second one is just a duplicate.
  const grandTotal = groups.find((g) => g.label === COUNCIL_TOTAL_LABEL)
  if (grandTotal && realGroups.length > 1) {
    const badgesEarned = categoryMatrixGrandTotal(grandTotal.matrix, categories)
    const girlsEarned = ageLevelTotal(
      ageLevelCountsAcrossCategories(grandTotal.matrix, categories, ageLevels)
    )
    detailRows.push([
      ...(showDistrictColumn ? [''] : []),
      COUNCIL_TOTAL_LABEL,
      ...(tracksGoalMetrics ? [ageLevelTotal(grandTotal.population)] : []),
      ...categories.map((c) => ageLevelTotal(grandTotal.matrix[c.key])),
      girlsEarned,
      ...(detailHasBadgesEarned ? [badgesEarned] : []),
      grandTotal.awardedAgainstGoal
    ])
  }
  const detailBlock: ReportTableBlock = {
    title: detailTitle,
    // A single-category detail table (1.b.3.1/1.b.4.1) prints its one column's full
    // name directly in the regular header row and has no separate group-header row
    // above it at all — REPORTS.xls only adds that extra row to actually *group*
    // multiple category columns under one heading (1.1's "EIGHT POINT CHALLENGE",
    // 1.b.2.1's "OTHER WAGGGS BADGES").
    groupHeader: categories.length > 1 ? detailGroupHeader : undefined,
    headers: detailHeaders,
    rows: detailRows
  }

  if (mode === 'summary') return [summaryBlock]
  if (mode === 'detail') return [detailBlock]
  return [summaryBlock, detailBlock]
}

function categoryAgeLevelBlocks(
  item: ProgramReportLineItem,
  year: string,
  monthIndex: number
): ReportTableBlock[] {
  const categories = item.categories?.length
    ? item.categories
    : DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES
  const ageLevels = item.ageLevels?.length ? item.ageLevels : DEFAULT_AGE_LEVELS
  const title = `${item.code} — ${item.label}`.trim()
  const detailTitle = detailBlockTitle(item.code)
  const mode = BLOCK_MODE[item.code] ?? 'both'
  const key = monthKey(year, monthIndex)

  if (item.scope === 'district') {
    const districts = Object.keys(item.districtMonthlyCategoryBreakdowns ?? {}).sort()
    const groups: DistrictGroup[] = districts.map((d) => ({
      label: d,
      matrix: item.districtMonthlyCategoryBreakdowns?.[d]?.[key] ?? {},
      population: item.districtMonthlyPopulation?.[d]?.[key],
      awardedAgainstGoal: item.districtMonthlyAwardedAgainstGoal?.[d]?.[key] ?? 0
    }))
    groups.push({
      label: COUNCIL_TOTAL_LABEL,
      matrix: councilCategoryAgeLevelBreakdown(
        item.districtMonthlyCategoryBreakdowns,
        year,
        monthIndex
      ),
      population: councilAgeLevelTotal(item.districtMonthlyPopulation, year, monthIndex),
      awardedAgainstGoal: councilMonthlyTotal(
        item.districtMonthlyAwardedAgainstGoal,
        year,
        monthIndex
      )
    })
    return badgeworkStyleBlocks(
      item.code,
      title,
      detailTitle,
      categoryGroupLabel(item),
      categories,
      ageLevels,
      groups,
      true,
      !!item.tracksGoalMetrics,
      mode
    )
  }

  const groups: DistrictGroup[] = [
    {
      label: item.label,
      matrix: item.monthlyCategoryBreakdowns?.[key] ?? {},
      population: item.monthlyPopulation?.[key],
      awardedAgainstGoal: item.monthlyAwardedAgainstGoal?.[key] ?? 0
    }
  ]
  return badgeworkStyleBlocks(
    item.code,
    title,
    detailTitle,
    categoryGroupLabel(item),
    categories,
    ageLevels,
    groups,
    false,
    !!item.tracksGoalMetrics,
    mode
  )
}

/** A plain ageLevelBreakdown item (Free Being Me, Girl Powered Nutrition) has no
 *  category split of its own — it's the same Badgework-family template with a single
 *  pseudo-category standing in for its one program, matching REPORTS.xls's "1.b.3.1"/
 *  "1.b.4.1" detail tables (which repeat the same District+Age Level shape). */
function ageLevelBreakdownBlocks(
  item: ProgramReportLineItem,
  year: string,
  monthIndex: number
): ReportTableBlock[] {
  const categories: ColumnDef[] = [{ key: 'value', label: item.label }]
  const ageLevels = item.ageLevels?.length ? item.ageLevels : DEFAULT_AGE_LEVELS
  const title = `${item.code} — ${item.label}`.trim()
  const detailTitle = detailBlockTitle(item.code)
  const mode = BLOCK_MODE[item.code] ?? 'both'
  const wrap = (counts: AgeLevelCounts | undefined): CategoryAgeLevelCounts => ({
    value: counts ?? {}
  })
  const key = monthKey(year, monthIndex)

  if (item.scope === 'district') {
    const districts = Object.keys(item.districtMonthlyBreakdowns ?? {}).sort()
    const groups: DistrictGroup[] = districts.map((d) => ({
      label: d,
      matrix: wrap(item.districtMonthlyBreakdowns?.[d]?.[key]),
      population: item.districtMonthlyPopulation?.[d]?.[key],
      awardedAgainstGoal: item.districtMonthlyAwardedAgainstGoal?.[d]?.[key] ?? 0
    }))
    groups.push({
      label: COUNCIL_TOTAL_LABEL,
      matrix: wrap(councilAgeLevelTotal(item.districtMonthlyBreakdowns, year, monthIndex)),
      population: councilAgeLevelTotal(item.districtMonthlyPopulation, year, monthIndex),
      awardedAgainstGoal: councilMonthlyTotal(
        item.districtMonthlyAwardedAgainstGoal,
        year,
        monthIndex
      )
    })
    return badgeworkStyleBlocks(
      item.code,
      title,
      detailTitle,
      categoryGroupLabel(item),
      categories,
      ageLevels,
      groups,
      true,
      !!item.tracksGoalMetrics,
      mode
    )
  }

  const groups: DistrictGroup[] = [
    {
      label: item.label,
      matrix: wrap(item.monthlyBreakdowns?.[key]),
      population: item.monthlyPopulation?.[key],
      awardedAgainstGoal: item.monthlyAwardedAgainstGoal?.[key] ?? 0
    }
  ]
  return badgeworkStyleBlocks(
    item.code,
    title,
    detailTitle,
    categoryGroupLabel(item),
    categories,
    ageLevels,
    groups,
    false,
    !!item.tracksGoalMetrics,
    mode
  )
}

/** Troop Camps 1.b.5's own fixed matrix — District rows, one column-group per named
 *  category (Troop Camps / Other Outdoor Activities), each with the item's named
 *  sub-metrics (No. of Troops / Girls / Leaders) as columns, plus a computed "Total"
 *  group summing across categories per metric. A single table, not a summary+detail
 *  pair like the Badgework-family items — REPORTS.xls only has the one here, and it
 *  has no goal/population tracking to carry either. */
function categoryMatrixBlocks(
  item: ProgramReportLineItem,
  year: string,
  monthIndex: number
): ReportTableBlock[] {
  const categories = item.categories?.length
    ? item.categories
    : DEFAULT_CATEGORY_BREAKDOWN_CATEGORIES
  const metrics = item.ageLevels?.length ? item.ageLevels : DEFAULT_AGE_LEVELS
  const title = `${item.code} — ${item.label}`.trim()
  const key = monthKey(year, monthIndex)
  const showDistrictColumn = item.scope === 'district'

  const metricTotal = (matrix: CategoryAgeLevelCounts, metricKey: string) =>
    categories.reduce((sum, c) => sum + (matrix[c.key]?.[metricKey] ?? 0), 0)

  let groups: { label: string; matrix: CategoryAgeLevelCounts }[]
  if (showDistrictColumn) {
    const districts = Object.keys(item.districtMonthlyCategoryBreakdowns ?? {}).sort()
    groups = districts.map((d) => ({
      label: d,
      matrix: item.districtMonthlyCategoryBreakdowns?.[d]?.[key] ?? {}
    }))
    groups.push({
      label: COUNCIL_TOTAL_LABEL,
      matrix: councilCategoryAgeLevelBreakdown(
        item.districtMonthlyCategoryBreakdowns,
        year,
        monthIndex
      )
    })
  } else {
    groups = [{ label: item.label, matrix: item.monthlyCategoryBreakdowns?.[key] ?? {} }]
  }

  const rows = groups.map((g) => [
    ...(showDistrictColumn ? [g.label] : []),
    ...categories.flatMap((c) => metrics.map((m) => g.matrix[c.key]?.[m.key] ?? 0)),
    ...metrics.map((m) => metricTotal(g.matrix, m.key))
  ])

  const metricHeaders = metrics.map((m) => m.label)
  const headers = [
    ...(showDistrictColumn ? ['District'] : []),
    ...categories.flatMap(() => metricHeaders),
    ...metricHeaders
  ]
  const groupHeader = [
    ...(showDistrictColumn ? [{ label: '', span: 1 }] : []),
    ...categories.map((c) => ({ label: c.label.toUpperCase(), span: metrics.length })),
    { label: 'TOTAL', span: metrics.length }
  ]

  return [{ title, groupHeader, headers, rows }]
}

function blocksForItem(
  item: ProgramReportLineItem,
  year: string,
  monthIndex: number
): ReportTableBlock[] {
  if (item.shape === 'categoryAgeLevelBreakdown')
    return categoryAgeLevelBlocks(item, year, monthIndex)
  if (item.shape === 'ageLevelBreakdown') return ageLevelBreakdownBlocks(item, year, monthIndex)
  if (item.shape === 'categoryMatrix') return categoryMatrixBlocks(item, year, monthIndex)
  return [blockForItem(item, year, monthIndex)]
}

/** REPORTS.xls prints Troop Camps 1.b.8.1/1.b.8.2/1.b.8.3 (three independently
 *  entered 'count' items) side by side in ONE combined "1.b.8 COMMUNITY DEVELOPMENT
 *  PROJECTS" table, not as three separate small tables. Grouped here purely for
 *  export/print — the three stay separate documents (independently addable / editable
 *  / deletable in the app) same as before. */
const MERGED_COUNT_GROUPS: { title: string; codes: string[] }[] = [
  { title: '1.b.8 — Community Development Projects', codes: ['1.b.8.1', '1.b.8.2', '1.b.8.3'] }
]

function mergedCountBlock(
  group: { title: string; codes: string[] },
  items: ProgramReportLineItem[],
  year: string,
  monthIndex: number
): ReportTableBlock | null {
  const key = monthKey(year, monthIndex)
  const groupItems = group.codes
    .map((code) => items.find((i) => i.code === code))
    .filter((i): i is ProgramReportLineItem => !!i)
  if (groupItems.length === 0) return null

  const districts = Array.from(
    new Set(groupItems.flatMap((i) => Object.keys(i.districtMonthlyCounts ?? {})))
  ).sort()
  const rows = districts.map((d) => [
    d,
    ...groupItems.map((i) => i.districtMonthlyCounts?.[d]?.[key] ?? 0)
  ])
  const totals = groupItems.map((i) =>
    Object.values(i.districtMonthlyCounts ?? {}).reduce(
      (sum, monthly) => sum + (monthly[key] ?? 0),
      0
    )
  )
  rows.push([COUNCIL_TOTAL_LABEL, ...totals])

  return {
    title: group.title,
    headers: ['District', ...groupItems.map((i) => `${i.code} ${i.label}`)],
    rows
  }
}

/** Every item's blocks, in order, with any MERGED_COUNT_GROUPS members collapsed into
 *  their one combined block (at the position of the first group member encountered) —
 *  the single entry point every exporter (Excel/PDF/DOCX) should iterate instead of
 *  calling blocksForItem per item directly. */
function blocksForItems(
  items: ProgramReportLineItem[],
  year: string,
  monthIndex: number
): ReportTableBlock[] {
  const handledGroups = new Set<string>()
  const blocks: ReportTableBlock[] = []
  for (const item of items) {
    const group = MERGED_COUNT_GROUPS.find((g) => g.codes.includes(item.code))
    if (group) {
      if (handledGroups.has(group.title)) continue
      handledGroups.add(group.title)
      const block = mergedCountBlock(group, items, year, monthIndex)
      if (block) blocks.push(block)
      continue
    }
    blocks.push(...blocksForItem(item, year, monthIndex))
  }
  return blocks
}

/** Distributes `totalCols` physical columns across `weights.length` header cells,
 *  proportional to each header's own relative weight (its own text length) — every
 *  block ends up spanning the sheet's full column count via merged cells, matching
 *  how the PDF/Word exports auto-fit each table's own columns independently, instead
 *  of a narrower block (fewer/shorter headers) leaving most of the shared column grid
 *  blank and looking visually mismatched next to a wider block using the same raw
 *  columns. Every header gets at least 1 column; `totalCols` is always >= the header
 *  count (it's the widest header count across every block on the sheet), so the
 *  guaranteed minimum never has to be reclaimed from anywhere. */
function distributeColumnSpans(weights: number[], totalCols: number): number[] {
  const n = weights.length
  if (n === 0) return []
  const spans = new Array(n).fill(1)
  const extra = totalCols - n
  if (extra <= 0) return spans
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || n
  const raw = weights.map((w) => (w / totalWeight) * extra)
  raw.forEach((x, i) => {
    spans[i] += Math.floor(x)
  })
  // Leftover columns from integer rounding go one at a time to whichever header has
  // the largest fractional remainder (largest-remainder rounding), so the spans sum
  // to exactly `totalCols` without arbitrarily favoring the first or last header.
  const remainder = extra - raw.reduce((sum, x) => sum + Math.floor(x), 0)
  const byFraction = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < remainder; k++) spans[byFraction[k % n].i]++
  return spans
}

function monthLabel(monthIndex: number): string {
  return PROGRAM_MONTHS[monthIndex] ?? ''
}

/** "November 2026" — the calendar year for a given month within a program year label
 *  like "2026-2027" (index 0-5 = Jul-Dec, the first calendar year; 6-11 = Jan-Jun, the
 *  second) — so two exports for the same month name in different program years don't
 *  read identically. */
function monthYearLabel(year: string, monthIndex: number): string {
  const [startYear, endYear] = year.split('-')
  const calendarYear = monthIndex < 6 ? startYear : endYear
  return `${monthLabel(monthIndex)} ${calendarYear ?? ''}`.trim()
}

/** REPORTS.xls's Int'l Affairs/Improved Image sheets print this bold-italic "Council:"
 *  line under the report title, left-aligned — Badgework/Troop Camps don't have it. */
function councilLineText(): string {
  return `Council: GSP ${orgHeader.council}`
}

const signatureLines = [
  { label: 'Prepared by:', name: signatories.taForProgram, role: 'TA for Program' },
  { label: 'Noted by:', name: signatories.councilExecutive, role: 'Council Executive' },
  { label: 'Approved:', name: signatories.councilPresident, role: 'Council President' }
]

export async function exportProgramReportsExcel(
  items: ProgramReportLineItem[],
  sectionLabel: string,
  meta: ProgramReportSectionMeta,
  year: string,
  monthIndex: number,
  _t: (key: string) => string
) {
  // Blocks are computed once up front (rather than re-derived inside the write loop
  // below) so their real column counts are known before the sheet layout is decided —
  // Program Reports mixes tables of very different widths on one sheet (a plain
  // 'count' item is 1-2 columns; a badgework category-detail table can be 11-14), so a
  // single hardcoded merge span for every banner/title row would leave the wider
  // tables' title bars ending short of their own data, looking visually cut off. Column
  // COUNT is driven purely by the section's own widest real table (no arbitrary "always
  // 9" floor) — otherwise a section whose tables are all narrower than 9 columns gets a
  // banner (and a centered logo within it) far wider than any table underneath it,
  // reading as off-center relative to the actual content instead of merely "centered
  // over some unrelated fixed span".
  const allBlocks = blocksForItems(items, year, monthIndex)
  const maxCols = Math.max(
    1,
    allBlocks.reduce((m, b) => Math.max(m, b.headers.length), 0)
  )

  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet(sectionLabel.slice(0, 31), { views: [{ showGridLines: false }] })
  // Every column gets the same base width. Each block's own headers are spread across
  // `maxCols` physical columns in proportion to their own text length (distributeColumnSpans,
  // used below), so a header needing more room gets a wider *merged* cell instead of the
  // whole sheet's shared per-column width being pulled around by whichever block happens
  // to need the most space at that column index — which used to make a narrower block
  // (fewer/shorter headers) look visually mismatched next to a wider one sharing the same
  // raw column grid.
  const UNIT_COL_WIDTH = 16
  const colWidths = Array.from({ length: maxCols }, () => UNIT_COL_WIDTH)
  // A section with only narrow tables (e.g. a couple of 2-column District/Count items)
  // would otherwise squeeze the banner — org name, report title, "For the month of…" —
  // into a column span too tight for its own longest line, wrapping it awkwardly. Scale
  // every column up (proportionally, so the widths chosen above stay in the same ratio
  // to each other) until the sheet is at least as wide as that longest banner line needs.
  const colPx = (w: number) => w * 7 + 5
  const sheetWidthPx = colWidths.reduce((sum, w) => sum + colPx(w), 0)
  const bannerLines = [
    orgHeader.orgName,
    orgHeader.region,
    orgHeader.council,
    meta.reportTitle,
    meta.goalHeading,
    `For the month of ${monthYearLabel(year, monthIndex)}`
  ]
  const neededBannerPx = Math.max(...bannerLines.map((line) => line.length * 7.5 + 20))
  if (sheetWidthPx > 0 && sheetWidthPx < neededBannerPx) {
    const scale = neededBannerPx / sheetWidthPx
    for (let i = 0; i < colWidths.length; i++) colWidths[i] = colWidths[i] * scale
  }
  sheet.columns = colWidths.map((width) => ({ width }))
  await addWorksheetLogo(wb, sheet)

  const lines: { text: string; bold: boolean; size: number }[] = [
    { text: orgHeader.orgName, bold: true, size: 10 },
    { text: orgHeader.region, bold: true, size: 10 },
    { text: orgHeader.council, bold: true, size: 10 },
    { text: meta.reportTitle, bold: true, size: 14 },
    { text: `For the month of ${monthYearLabel(year, monthIndex)}`, bold: false, size: 10 }
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, maxCols)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line.text
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: line.bold, size: line.size }
  })

  let nextRow = lines.length + 1
  if (meta.showCouncilLine) {
    sheet.mergeCells(nextRow, 1, nextRow, maxCols)
    const cell = sheet.getCell(nextRow, 1)
    cell.value = councilLineText()
    cell.alignment = { horizontal: 'left' }
    cell.font = { bold: true, italic: true, size: 10 }
    nextRow++
  }

  const goalRow = nextRow + 1
  sheet.getCell(goalRow, 1).value = meta.goalHeading
  sheet.getCell(goalRow, 1).font = { bold: true, size: 12 }

  let r = goalRow + 2
  for (const block of allBlocks) {
    // Every block's own headers are spread across the sheet's full `maxCols` physical
    // columns (proportional to each header's own text length), so every block's title
    // bar, group header, header row, and data rows all end up the same total width —
    // matching each other and matching the PDF/Word exports' own per-table auto-fit,
    // instead of a narrower block's row stopping partway across the shared grid.
    const spans = distributeColumnSpans(
      block.headers.map((h) => String(h).length),
      maxCols
    )

    sheet.mergeCells(r, 1, r, maxCols)
    sheet.getCell(r, 1).value = block.title
    sheet.getCell(r, 1).font = { bold: true }
    r++
    if (block.groupHeader) {
      let origIdx = 0
      let col = 1
      for (const g of block.groupHeader) {
        const groupSpan = spans.slice(origIdx, origIdx + g.span).reduce((sum, s) => sum + s, 0)
        if (groupSpan > 1) sheet.mergeCells(r, col, r, col + groupSpan - 1)
        if (g.label) {
          const cell = sheet.getCell(r, col)
          cell.value = g.label
          cell.alignment = { horizontal: 'center' }
          cell.font = { bold: true }
        }
        origIdx += g.span
        col += groupSpan
      }
      r++
    }
    {
      let col = 1
      block.headers.forEach((h, i) => {
        const span = spans[i]
        if (span > 1) sheet.mergeCells(r, col, r, col + span - 1)
        const cell = sheet.getCell(r, col)
        cell.value = h
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        col += span
      })
    }
    r++
    if (block.rows.length === 0) {
      sheet.mergeCells(r, 1, r, maxCols)
      const cell = sheet.getCell(r, 1)
      cell.value = '—'
      cell.alignment = { horizontal: 'center' }
      r++
    }
    for (const row of block.rows) {
      let col = 1
      row.forEach((val, i) => {
        const span = spans[i]
        if (span > 1) sheet.mergeCells(r, col, r, col + span - 1)
        const cell = sheet.getCell(r, col)
        cell.value = val
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        col += span
      })
      r++
    }
    r++
  }

  r += 1
  signatureLines.forEach((s, i) => {
    sheet.getCell(r + i, 1).value = s.label
    sheet.getCell(r + i, 2).value = s.name
    sheet.getCell(r + i, 2).font = { bold: true }
    sheet.getCell(r + i, 3).value = s.role
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileBase(sectionLabel)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function buildProgramReportsPdfDoc(
  items: ProgramReportLineItem[],
  meta: ProgramReportSectionMeta,
  year: string,
  monthIndex: number
) {
  const doc = createPdf('landscape')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region, bold: true },
    { text: orgHeader.council, bold: true },
    { text: meta.reportTitle, bold: true, size: 13 },
    { text: `For the month of ${monthYearLabel(year, monthIndex)}` }
  ])

  if (meta.showCouncilLine) {
    doc.setFont('helvetica', 'bolditalic')
    doc.setFontSize(10)
    doc.text(councilLineText(), 24, y + 4)
    y += 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text(meta.goalHeading, 24, y + 4)
  y += 22

  for (const block of blocksForItems(items, year, monthIndex)) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text(block.title, 24, y + 10)
    y += 16
    const head = block.groupHeader
      ? [
          block.groupHeader.map((g) => ({
            content: g.label,
            colSpan: g.span,
            styles: { halign: 'center' as const }
          })),
          block.headers
        ]
      : [block.headers]
    y =
      addTable(doc, {
        startY: y,
        head,
        body: block.rows.length > 0 ? block.rows : [block.headers.map(() => '—')]
      }) + 14
  }

  addSignatories(
    doc,
    y,
    signatureLines.map((s) => ({ label: s.label, name: s.name, role: s.role }))
  )

  return doc
}

export async function exportProgramReportsPdf(
  items: ProgramReportLineItem[],
  sectionLabel: string,
  meta: ProgramReportSectionMeta,
  year: string,
  monthIndex: number
) {
  const doc = await buildProgramReportsPdfDoc(items, meta, year, monthIndex)
  savePdf(doc, `${fileBase(sectionLabel)}.pdf`)
}

export async function exportProgramReportsDocx(
  items: ProgramReportLineItem[],
  sectionLabel: string,
  meta: ProgramReportSectionMeta,
  year: string,
  monthIndex: number
) {
  const children: (Paragraph | Table)[] = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region, bold: true },
      { text: orgHeader.council, bold: true },
      { text: meta.reportTitle, bold: true, size: 26 },
      { text: `For the month of ${monthYearLabel(year, monthIndex)}` }
    ])),
    ...(meta.showCouncilLine
      ? [
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: councilLineText(), bold: true, italics: true, size: 18 })
            ]
          })
        ]
      : []),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: meta.goalHeading, bold: true, size: 22 })]
    }),
    spacer()
  ]

  for (const block of blocksForItems(items, year, monthIndex)) {
    children.push(
      buildTable(
        block.headers,
        block.rows.length > 0 ? block.rows : [block.headers.map(() => '—')],
        undefined,
        block.groupHeader?.map((g) => ({ label: g.label, span: g.span }))
      ),
      spacer()
    )
  }

  children.push(signatoryTable(signatureLines))

  await saveDocx(children, `${fileBase(sectionLabel)}.docx`, true)
}

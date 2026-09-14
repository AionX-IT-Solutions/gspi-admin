import { Paragraph, TextRun } from 'docx'
import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import { formatAmount } from '@/shared/lib/utils'
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
  signatoryTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import { addWorksheetLogo, applyDoubleRule } from '@/shared/lib/excelReport'
import {
  actualToDate,
  groupTotalLabel,
  type BudgetGroupSummary,
  type BudgetSectionTotals
} from './budgetCalculations'
import { BUDGET_MONTH_LABELS, type BudgetSection } from '../types/budget.types'

export interface BudgetReportData {
  fiscalYear: string
  incomeGroups: BudgetGroupSummary[]
  expenseGroups: BudgetGroupSummary[]
  incomeTotals: BudgetSectionTotals
  expenseTotals: BudgetSectionTotals
  netBudgeted: number
  netActual: number
}

const TABLE_HEAD = ['Category', ...BUDGET_MONTH_LABELS, 'Budgeted', 'Actual to Date', 'Variance']
const BLANK_MONTHS = BUDGET_MONTH_LABELS.map(() => '')

// The Council's real budget document closes each section (Income, then Expenses) with its
// own "SUMMARY" recap — Operations/Capital/Other broken out, then a Grand Total — rather
// than one combined Income/Expenses/Net block. Expense's own group order/naming differs
// from income's (II. OTHER EXPENSES / III. CAPITAL OUTLAY, swapped vs. income's II/III),
// so this maps by meaning, not by roman-numeral position — same convention as
// budgetCalculations.ts's GROUP_TOTAL_LABELS.
const SUMMARY_GROUP_LABELS: Record<string, string> = {
  'income:I. OPERATIONS': 'OPERATIONS',
  'income:II. CAPITAL': 'CAPITAL',
  'income:III. OTHER INCOME': 'OTHER INCOME',
  'expense:I. OPERATIONS': 'OPERATIONS',
  'expense:II. OTHER EXPENSES': 'OTHER EXPENSES',
  'expense:III. CAPITAL OUTLAY': 'CAPITAL'
}

function summaryGroupLabel(section: BudgetSection, group: string): string {
  return SUMMARY_GROUP_LABELS[`${section}:${group}`] ?? group.toUpperCase()
}

interface SectionRowsResult {
  rows: (string | number)[][]
  /** Indices into `rows` for group-heading, sub-total, and group-total lines — bolded
   *  in every export format to match this table's own bold styling for these rows on
   *  screen (see BudgetSectionTable.tsx's groupHeadingStyle/groupTotalStyle and its
   *  inline sub-total row). */
  boldRowIndexes: number[]
}

/** One line item's Jul-Jun actuals, month-by-month — blank (not "0.00") for a month with
 *  no activity, matching how the source workbook leaves an inactive month's cell empty
 *  rather than writing a zero into it. */
function monthCells(monthlyActuals: number[]): (string | number)[] {
  return BUDGET_MONTH_LABELS.map((_, i) => {
    const v = monthlyActuals[i] ?? 0
    return v !== 0 ? v : ''
  })
}

/** Flattens grouped categories into a single table body — group and sub-group headings
 *  as their own label-only rows, each line item indented under them (with its own Jul-Jun
 *  breakdown), a sub-total row closing out every sub-group. Amounts stay real `number`s
 *  (not pre-formatted strings) so Excel's own numFmt can format them — a numeric cell
 *  holding a string value silently ignores numFmt, which used to leave this report's line
 *  items as plain unformatted text; PDF/DOCX format them via formatBudgetRows below instead. */
function sectionRows(section: BudgetSection, groups: BudgetGroupSummary[]): SectionRowsResult {
  const rows: (string | number)[][] = []
  const boldRowIndexes: number[] = []
  const markLastRowBold = () => boldRowIndexes.push(rows.length - 1)

  for (const group of groups) {
    rows.push([group.group.toUpperCase(), ...BLANK_MONTHS, '', '', ''])
    markLastRowBold()
    for (const sg of group.subGroups) {
      if (sg.subGroup) rows.push([`  ${sg.subGroup}`, ...BLANK_MONTHS, '', '', ''])
      for (const item of sg.items) {
        const actual = actualToDate(item)
        rows.push([
          `    ${item.name}`,
          ...monthCells(item.monthlyActuals),
          item.budgetedAmount,
          actual,
          actual - item.budgetedAmount
        ])
      }
      rows.push([
        '  Sub-total',
        ...BLANK_MONTHS,
        sg.totalBudgeted,
        sg.totalActual,
        sg.totalActual - sg.totalBudgeted
      ])
      markLastRowBold()
    }
    rows.push([
      (groupTotalLabel(section, group.group) ?? `${group.group} TOTAL`).toUpperCase(),
      ...BLANK_MONTHS,
      group.totalBudgeted,
      group.totalActual,
      group.totalActual - group.totalBudgeted
    ])
    markLastRowBold()
  }
  return { rows, boldRowIndexes }
}

/** The per-section SUMMARY recap — one row per group (Operations/Capital/Other), then a
 *  Grand Total row. Only 3 columns (no month breakdown — the source form doesn't carry
 *  one here either). */
function summaryRows(
  section: BudgetSection,
  groups: BudgetGroupSummary[],
  grandTotal: BudgetSectionTotals
): (string | number)[][] {
  const rows = groups.map((g) => [
    summaryGroupLabel(section, g.group),
    g.totalBudgeted,
    g.totalActual,
    g.totalActual - g.totalBudgeted
  ])
  rows.push(['GRAND TOTAL', grandTotal.totalBudgeted, grandTotal.totalActual, grandTotal.variance])
  return rows
}

/** Renders a rows body's numeric columns (everything past the label) as comma-grouped
 *  display text — for PDF/DOCX, which print plain strings rather than a spreadsheet's
 *  numFmt-aware numeric cell. */
function formatBudgetRows(rows: (string | number)[][]): (string | number)[][] {
  return rows.map((row) => row.map((v, i) => (i > 0 && v !== '' ? formatAmount(v as number) : v)))
}

function headerLines(fiscalYear: string) {
  return [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: 'Council Budget', bold: true, size: 12 },
    { text: `Fiscal Year ${fiscalYear}` }
  ]
}

const filenameFor = (fiscalYear: string, ext: string) =>
  `Council_Budget_${fiscalYear.replace(/[^0-9a-z]/gi, '_')}.${ext}`

// 1 label column + 12 month columns + Budgeted/Actual/Variance = the full width of the
// section detail table (columns B through Q, A left as a spacer margin).
const LAST_DATA_COL = 2 + 1 + BUDGET_MONTH_LABELS.length + 2

export async function exportBudgetExcel(data: BudgetReportData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Council Budget')
  sheet.columns = [
    { width: 3 },
    { width: 30 },
    ...BUDGET_MONTH_LABELS.map(() => ({ width: 9 })),
    { width: 13 },
    { width: 13 },
    { width: 13 }
  ]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: LAST_DATA_COL })

  const lines = [
    orgHeader.orgName,
    orgHeader.council,
    'Council Budget',
    `Fiscal Year ${data.fiscalYear}`
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, LAST_DATA_COL)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  let r = 6

  function writeSection(
    section: BudgetSection,
    title: string,
    groups: BudgetGroupSummary[],
    totals: BudgetSectionTotals
  ) {
    sheet.getCell(r, 2).value = title.toUpperCase()
    sheet.getCell(r, 2).font = { bold: true, size: 12 }
    r += 2
    TABLE_HEAD.forEach((label, i) => {
      const cell = sheet.getCell(r, i + 2)
      cell.value = label
      cell.font = { bold: true }
      cell.alignment = { horizontal: i === 0 ? 'left' : 'center' }
    })
    r++
    const { rows, boldRowIndexes } = sectionRows(section, groups)
    const boldRows = new Set(boldRowIndexes)
    rows.forEach((row, idx) => {
      const bold = boldRows.has(idx)
      row.forEach((v, i) => {
        const cell = sheet.getCell(r, i + 2)
        cell.value = v
        if (i > 0 && v !== '') {
          cell.numFmt = '#,##0.00'
          cell.alignment = { horizontal: 'right' }
        }
        if (bold) cell.font = { bold: true }
      })
      r++
    })
    r++

    sheet.getCell(r, 2).value = `${title.toUpperCase()} SUMMARY`
    sheet.getCell(r, 2).font = { bold: true }
    r++
    for (const [label, budgeted, actual, variance] of summaryRows(section, groups, totals)) {
      const isGrandTotal = label === 'GRAND TOTAL'
      sheet.getCell(r, 2).value = label
      sheet.getCell(r, LAST_DATA_COL - 2).value = budgeted
      sheet.getCell(r, LAST_DATA_COL - 1).value = actual
      sheet.getCell(r, LAST_DATA_COL).value = variance
      ;[LAST_DATA_COL - 2, LAST_DATA_COL - 1, LAST_DATA_COL].forEach((c) => {
        sheet.getCell(r, c).numFmt = '#,##0.00'
        sheet.getCell(r, c).alignment = { horizontal: 'right' }
      })
      if (isGrandTotal) {
        ;[2, LAST_DATA_COL - 2, LAST_DATA_COL - 1, LAST_DATA_COL].forEach((c) => {
          sheet.getCell(r, c).font = { bold: true }
        })
        applyDoubleRule(sheet, r, 2, LAST_DATA_COL)
      }
      r++
    }
    r += 2
  }

  writeSection('income', 'Income', data.incomeGroups, data.incomeTotals)
  writeSection('expense', 'Expenses', data.expenseGroups, data.expenseTotals)

  sheet.getCell(r, 2).value = 'NET'
  sheet.getCell(r, 2).font = { bold: true, size: 12 }
  sheet.getCell(r, LAST_DATA_COL - 2).value = data.netBudgeted
  sheet.getCell(r, LAST_DATA_COL - 1).value = data.netActual
  sheet.getCell(r, LAST_DATA_COL).value = data.netActual - data.netBudgeted
  ;[LAST_DATA_COL - 2, LAST_DATA_COL - 1, LAST_DATA_COL].forEach((c) => {
    sheet.getCell(r, c).numFmt = '#,##0.00'
    sheet.getCell(r, c).font = { bold: true }
    sheet.getCell(r, c).alignment = { horizontal: 'right' }
  })
  applyDoubleRule(sheet, r, 2, LAST_DATA_COL)
  r += 3

  // Spread across the sheet's now much wider 17-column table (was columns 2/4 when this
  // report was just 5 columns wide) so the two signature columns don't bunch up on the left.
  const SIG_COL_LEFT = 2
  const SIG_COL_RIGHT = 10

  sheet.getCell(r, SIG_COL_LEFT).value = 'Prepared by:'
  sheet.getCell(r, SIG_COL_RIGHT).value = 'Noted by:'
  r += 3
  sheet.getCell(r, SIG_COL_LEFT).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, SIG_COL_RIGHT).value = signatories.councilExecutive.toUpperCase()
  r++
  sheet.getCell(r, SIG_COL_LEFT).value = 'Accounting Clerk'
  sheet.getCell(r, SIG_COL_RIGHT).value = 'Council Executive'
  r += 3
  sheet.getCell(r, SIG_COL_LEFT).value = 'Certified by:'
  sheet.getCell(r, SIG_COL_RIGHT).value = 'Approved:'
  r += 3
  sheet.getCell(r, SIG_COL_LEFT).value = signatories.councilTreasurer.toUpperCase()
  sheet.getCell(r, SIG_COL_RIGHT).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(r, SIG_COL_LEFT).value = 'Council Treasurer'
  sheet.getCell(r, SIG_COL_RIGHT).value = 'Council President'

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filenameFor(data.fiscalYear, 'xlsx')
  a.click()
  URL.revokeObjectURL(url)
}

function budgetSignatories() {
  return {
    primary: [
      {
        label: 'Prepared by:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      },
      {
        label: 'Noted by:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
      }
    ],
    approval: [
      {
        label: 'Certified by:',
        name: signatories.councilTreasurer.toUpperCase(),
        role: 'Council Treasurer'
      },
      {
        label: 'Approved:',
        name: signatories.councilPresident.toUpperCase(),
        role: 'Council President'
      }
    ]
  }
}

function summaryFootRow(
  section: BudgetSection,
  groups: BudgetGroupSummary[],
  totals: BudgetSectionTotals
): (string | number)[][] {
  return formatBudgetRows(summaryRows(section, groups, totals))
}

export async function buildBudgetPdfDoc(data: BudgetReportData) {
  // Landscape: 15 columns (label + Jul-Jun + Budgeted/Actual/Variance) don't fit portrait.
  const doc = createPdf('landscape')
  let y = await addHeaderLines(doc, headerLines(data.fiscalYear))

  function writeSection(
    section: BudgetSection,
    title: string,
    groups: BudgetGroupSummary[],
    totals: BudgetSectionTotals
  ) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), 30, y)
    y += 8
    const sectionData = sectionRows(section, groups)
    y = addTable(doc, {
      startY: y,
      head: [TABLE_HEAD],
      body: formatBudgetRows(sectionData.rows),
      columnStyles: Object.fromEntries(
        TABLE_HEAD.map((_, i) => [i, { halign: i === 0 ? 'left' : 'right' }])
      ),
      boldBodyRowIndexes: sectionData.boldRowIndexes
    })
    y += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${title.toUpperCase()} SUMMARY`, 30, y)
    y += 6
    const summary = summaryFootRow(section, groups, totals)
    y = addTable(doc, {
      startY: y,
      head: [['', 'Budgeted', 'Actual to Date', 'Variance']],
      body: summary.slice(0, -1),
      foot: [summary[summary.length - 1]],
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    })
    y += 20
  }

  writeSection('income', 'Income', data.incomeGroups, data.incomeTotals)

  if (y > 460) {
    doc.addPage()
    y = 40
  }
  writeSection('expense', 'Expenses', data.expenseGroups, data.expenseTotals)

  y = addTable(doc, {
    startY: y,
    head: [],
    body: [],
    foot: [
      [
        'NET',
        formatAmount(data.netBudgeted),
        formatAmount(data.netActual),
        formatAmount(data.netActual - data.netBudgeted)
      ]
    ],
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  })
  y += 20

  const sig = budgetSignatories()
  y = addSignatories(doc, y, sig.primary)
  y += 20
  addSignatories(doc, y, sig.approval)

  return doc
}

export async function exportBudgetPdf(data: BudgetReportData) {
  const doc = await buildBudgetPdfDoc(data)
  savePdf(doc, filenameFor(data.fiscalYear, 'pdf'))
}

export async function exportBudgetDocx(data: BudgetReportData) {
  const sig = budgetSignatories()

  function sectionBlocks(
    section: BudgetSection,
    title: string,
    groups: BudgetGroupSummary[],
    totals: BudgetSectionTotals
  ) {
    const sectionData = sectionRows(section, groups)
    const summary = summaryFootRow(section, groups, totals)
    return [
      ...headerParagraphsSyncSafe(title.toUpperCase(), true),
      spacer(),
      buildTable(
        TABLE_HEAD,
        formatBudgetRows(sectionData.rows),
        undefined,
        undefined,
        sectionData.boldRowIndexes
      ),
      spacer(),
      ...headerParagraphsSyncSafe(`${title.toUpperCase()} SUMMARY`, false),
      buildTable(
        ['', 'Budgeted', 'Actual to Date', 'Variance'],
        summary.slice(0, -1),
        summary[summary.length - 1]
      ),
      spacer()
    ]
  }

  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Council Budget', bold: true, size: 24 },
      { text: `Fiscal Year ${data.fiscalYear}` }
    ])),
    spacer(),
    ...sectionBlocks('income', 'Income', data.incomeGroups, data.incomeTotals),
    ...sectionBlocks('expense', 'Expenses', data.expenseGroups, data.expenseTotals),
    buildTable(
      [],
      [],
      [
        'NET',
        formatAmount(data.netBudgeted),
        formatAmount(data.netActual),
        formatAmount(data.netActual - data.netBudgeted)
      ]
    ),
    spacer(),
    spacer(),
    signatoryTable(sig.primary),
    spacer(),
    signatoryTable(sig.approval)
  ]
  await saveDocx(children, filenameFor(data.fiscalYear, 'docx'), true)
}

// headerParagraphs is async (it fetches the logo) — these small in-body section headings
// never need one, so they get their own lightweight paragraph instead of that helper.
function headerParagraphsSyncSafe(text: string, large: boolean) {
  return [
    new Paragraph({
      children: [new TextRun({ text, bold: true, size: large ? 22 : 18 })]
    })
  ]
}

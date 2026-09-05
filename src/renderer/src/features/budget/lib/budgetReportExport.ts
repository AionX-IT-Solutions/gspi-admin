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
  signatoryTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import {
  actualToDate,
  type BudgetGroupSummary,
  type BudgetSectionTotals
} from './budgetCalculations'

export interface BudgetReportData {
  fiscalYear: string
  incomeGroups: BudgetGroupSummary[]
  expenseGroups: BudgetGroupSummary[]
  incomeTotals: BudgetSectionTotals
  expenseTotals: BudgetSectionTotals
  netBudgeted: number
  netActual: number
}

const TABLE_HEAD = ['Category', 'Budgeted', 'Actual to Date', 'Variance']

function fmt(n: number): string {
  return n.toFixed(2)
}

/** Flattens grouped categories into a single table body — group and sub-group headings
 *  as their own label-only rows, each line item indented under them, a sub-total row
 *  closing out every sub-group. */
function sectionRows(groups: BudgetGroupSummary[]): (string | number)[][] {
  const rows: (string | number)[][] = []
  for (const group of groups) {
    rows.push([group.group.toUpperCase(), '', '', ''])
    for (const sg of group.subGroups) {
      if (sg.subGroup) rows.push([`  ${sg.subGroup}`, '', '', ''])
      for (const item of sg.items) {
        const actual = actualToDate(item)
        rows.push([
          `    ${item.name}`,
          fmt(item.budgetedAmount),
          fmt(actual),
          fmt(actual - item.budgetedAmount)
        ])
      }
      rows.push([
        '  Sub-total',
        fmt(sg.totalBudgeted),
        fmt(sg.totalActual),
        fmt(sg.totalActual - sg.totalBudgeted)
      ])
    }
  }
  return rows
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

export async function exportBudgetExcel(data: BudgetReportData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Council Budget')
  sheet.columns = [{ width: 4 }, { width: 40 }, { width: 16 }, { width: 16 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 5 })

  const lines = [
    orgHeader.orgName,
    orgHeader.council,
    'Council Budget',
    `Fiscal Year ${data.fiscalYear}`
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 5)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  let r = 7

  function writeSummaryRow(label: string, budgeted: number, actual: number) {
    sheet.getCell(r, 2).value = label
    sheet.getCell(r, 2).font = { bold: true }
    sheet.getCell(r, 3).value = budgeted
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    sheet.getCell(r, 4).value = actual
    sheet.getCell(r, 4).numFmt = '#,##0.00'
    sheet.getCell(r, 5).value = actual - budgeted
    sheet.getCell(r, 5).numFmt = '#,##0.00'
    r++
  }

  sheet.getCell(r, 3).value = 'Budgeted'
  sheet.getCell(r, 4).value = 'Actual to Date'
  sheet.getCell(r, 5).value = 'Variance'
  ;[3, 4, 5].forEach((c) => (sheet.getCell(r, c).font = { bold: true }))
  r++
  writeSummaryRow('Income', data.incomeTotals.totalBudgeted, data.incomeTotals.totalActual)
  writeSummaryRow('Expenses', data.expenseTotals.totalBudgeted, data.expenseTotals.totalActual)
  writeSummaryRow('Net', data.netBudgeted, data.netActual)
  r += 2

  function writeSection(title: string, groups: BudgetGroupSummary[], totals: BudgetSectionTotals) {
    sheet.getCell(r, 2).value = title
    sheet.getCell(r, 2).font = { bold: true, size: 12 }
    r++
    TABLE_HEAD.forEach((label, i) => {
      const cell = sheet.getCell(r, i + 2)
      cell.value = label
      cell.font = { bold: true }
    })
    r++
    for (const row of sectionRows(groups)) {
      row.forEach((v, i) => {
        const cell = sheet.getCell(r, i + 2)
        cell.value = v
        if (i > 0) cell.numFmt = '#,##0.00'
      })
      r++
    }
    sheet.getCell(r, 2).value = `Total ${title}`
    sheet.getCell(r, 2).font = { bold: true }
    sheet.getCell(r, 3).value = totals.totalBudgeted
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    sheet.getCell(r, 4).value = totals.totalActual
    sheet.getCell(r, 4).numFmt = '#,##0.00'
    sheet.getCell(r, 5).value = totals.variance
    sheet.getCell(r, 5).numFmt = '#,##0.00'
    ;[2, 3, 4, 5].forEach((c) => (sheet.getCell(r, c).font = { bold: true }))
    r += 3
  }

  writeSection('Income', data.incomeGroups, data.incomeTotals)
  writeSection('Expenses', data.expenseGroups, data.expenseTotals)

  r += 1
  sheet.getCell(r, 2).value = 'Prepared by:'
  sheet.getCell(r, 4).value = 'Noted by:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 4).value = signatories.councilExecutive.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 4).value = 'Council Executive'
  r += 3
  sheet.getCell(r, 2).value = 'Certified by:'
  sheet.getCell(r, 4).value = 'Approved:'
  r += 3
  sheet.getCell(r, 2).value = signatories.councilTreasurer.toUpperCase()
  sheet.getCell(r, 4).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Council Treasurer'
  sheet.getCell(r, 4).value = 'Council President'

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

export async function buildBudgetPdfDoc(data: BudgetReportData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, headerLines(data.fiscalYear))

  y = addTable(doc, {
    startY: y,
    head: [['', 'Budgeted', 'Actual to Date', 'Variance']],
    body: [
      [
        'Income',
        fmt(data.incomeTotals.totalBudgeted),
        fmt(data.incomeTotals.totalActual),
        fmt(data.incomeTotals.variance)
      ],
      [
        'Expenses',
        fmt(data.expenseTotals.totalBudgeted),
        fmt(data.expenseTotals.totalActual),
        fmt(data.expenseTotals.variance)
      ]
    ],
    foot: [
      ['Net', fmt(data.netBudgeted), fmt(data.netActual), fmt(data.netActual - data.netBudgeted)]
    ],
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  })
  y += 20

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Income', 30, y)
  y += 8
  y = addTable(doc, {
    startY: y,
    head: [TABLE_HEAD],
    body: sectionRows(data.incomeGroups),
    foot: [
      [
        'TOTAL INCOME',
        fmt(data.incomeTotals.totalBudgeted),
        fmt(data.incomeTotals.totalActual),
        fmt(data.incomeTotals.variance)
      ]
    ],
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  })
  y += 24

  if (y > 700) {
    doc.addPage()
    y = 40
  }
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Expenses', 30, y)
  y += 8
  y = addTable(doc, {
    startY: y,
    head: [TABLE_HEAD],
    body: sectionRows(data.expenseGroups),
    foot: [
      [
        'TOTAL EXPENSES',
        fmt(data.expenseTotals.totalBudgeted),
        fmt(data.expenseTotals.totalActual),
        fmt(data.expenseTotals.variance)
      ]
    ],
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  })

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
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Council Budget', bold: true, size: 24 },
      { text: `Fiscal Year ${data.fiscalYear}` }
    ])),
    spacer(),
    buildTable(
      ['', 'Budgeted', 'Actual to Date', 'Variance'],
      [
        [
          'Income',
          fmt(data.incomeTotals.totalBudgeted),
          fmt(data.incomeTotals.totalActual),
          fmt(data.incomeTotals.variance)
        ],
        [
          'Expenses',
          fmt(data.expenseTotals.totalBudgeted),
          fmt(data.expenseTotals.totalActual),
          fmt(data.expenseTotals.variance)
        ]
      ],
      ['Net', fmt(data.netBudgeted), fmt(data.netActual), fmt(data.netActual - data.netBudgeted)]
    ),
    spacer(),
    spacer(),
    buildTable(TABLE_HEAD, sectionRows(data.incomeGroups), [
      'TOTAL INCOME',
      fmt(data.incomeTotals.totalBudgeted),
      fmt(data.incomeTotals.totalActual),
      fmt(data.incomeTotals.variance)
    ]),
    spacer(),
    buildTable(TABLE_HEAD, sectionRows(data.expenseGroups), [
      'TOTAL EXPENSES',
      fmt(data.expenseTotals.totalBudgeted),
      fmt(data.expenseTotals.totalActual),
      fmt(data.expenseTotals.variance)
    ]),
    spacer(),
    spacer(),
    signatoryTable(sig.primary),
    spacer(),
    signatoryTable(sig.approval)
  ]
  await saveDocx(children, filenameFor(data.fiscalYear, 'docx'), true)
}

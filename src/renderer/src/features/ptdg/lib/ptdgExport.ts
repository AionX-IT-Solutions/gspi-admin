import type { jsPDF } from 'jspdf'
import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import { formatAmount, formatDate } from '@/shared/lib/utils'
import { createPdf, addHeaderLines, addSignatories, savePdf } from '@/shared/lib/pdfExport'
import {
  headerParagraphs,
  buildTable,
  signatoryTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import {
  ptdgAmountRequested,
  ptdgExpensesTotal,
  ptdgSourcesSubtotal,
  type PtdgApplication,
  type PtdgLineItem
} from '../types/ptdg.types'

// Matches the National HQ paper form's own checkbox notation — "[ X ]" reads reliably
// in every export format (Excel/Word don't need a special glyph/font for it).
function checkboxText(checked: boolean): string {
  return checked ? '[ X ]' : '[    ]'
}

function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  wb.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  })
}

const filenameFor = (app: PtdgApplication, ext: string) =>
  `PTDG_${app.applicationNumber.replace(/[^0-9a-z]/gi, '_')}.${ext}`

function lineItemRows(items: PtdgLineItem[]): [string, string][] {
  if (items.length === 0) return [['—', '']]
  return items.map((l) => [l.particulars, formatAmount(l.amount)] as [string, string])
}

// ─── PDF ──────────────────────────────────────────────────────────────────
// Laid out with direct text/line placement (not autoTable's boxed grid) so the
// result reads as a filled-in copy of the actual "Application for Program &
// Training Development Grant" form — labeled fields with underlines, a plain
// PARTICULARS/AMOUNT budget table, and the Notice of Approval/Disapproval
// section with its own [ ] checkboxes — rather than a generic report table.
const PDF_MARGIN = 45

function pdfFieldLine(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  pageWidth: number
): number {
  const colonX = 195
  const valueX = colonX + 8
  const rightEdge = pageWidth - PDF_MARGIN
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(label, PDF_MARGIN, y)
  doc.text(':', colonX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(value, valueX, y)
  doc.setDrawColor(80, 80, 80)
  doc.setLineWidth(0.5)
  doc.line(valueX, y + 2, rightEdge, y + 2)
  return y + 18
}

function pdfSectionHeading(doc: jsPDF, text: string, y: number, pageWidth: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(text, pageWidth / 2, y, { align: 'center' })
  const textWidth = doc.getTextWidth(text)
  doc.setLineWidth(0.6)
  doc.line(pageWidth / 2 - textWidth / 2, y + 2.5, pageWidth / 2 + textWidth / 2, y + 2.5)
  return y + 20
}

function pdfBudgetTable(
  doc: jsPDF,
  title: string,
  items: PtdgLineItem[],
  totalLabel: string,
  totalAmount: number,
  y: number,
  pageWidth: number
): number {
  const rightEdge = pageWidth - PDF_MARGIN
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(title, PDF_MARGIN, y)
  y += 16
  doc.setFontSize(9)
  doc.text('PARTICULARS', PDF_MARGIN, y)
  doc.text('AMOUNT', rightEdge, y, { align: 'right' })
  doc.setLineWidth(0.6)
  doc.line(PDF_MARGIN, y + 2.5, PDF_MARGIN + doc.getTextWidth('PARTICULARS'), y + 2.5)
  doc.line(rightEdge - doc.getTextWidth('AMOUNT'), y + 2.5, rightEdge, y + 2.5)
  y += 16

  doc.setFont('helvetica', 'normal')
  for (const row of lineItemRows(items)) {
    doc.text(row[0], PDF_MARGIN, y)
    doc.text(row[1], rightEdge, y, { align: 'right' })
    y += 16
  }

  doc.setFont('helvetica', 'bold')
  doc.text(totalLabel, PDF_MARGIN + 20, y)
  const amountText = formatAmount(totalAmount)
  doc.text(amountText, rightEdge, y, { align: 'right' })
  doc.setLineWidth(0.5)
  doc.line(PDF_MARGIN + 20, y + 2, PDF_MARGIN + 20 + doc.getTextWidth(totalLabel) + 4, y + 2)
  doc.line(rightEdge - doc.getTextWidth(amountText), y + 2, rightEdge, y + 2)
  return y + 22
}

export async function buildPtdgPdfDoc(app: PtdgApplication) {
  const doc = createPdf('portrait')
  const pageWidth = doc.internal.pageSize.getWidth()
  const rightEdge = pageWidth - PDF_MARGIN

  // Top-right filing note, exactly as printed on the real form — laid out
  // independently of the centered org header below it.
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  ;['R.O. File', 'To be returned by', 'R.O. to Council', 'Council File'].forEach((line, i) => {
    doc.text(line, rightEdge, 40 + i * 9, { align: 'right' })
  })

  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region }
  ])
  y += 4
  y = pdfSectionHeading(doc, 'APPLICATION FOR PROGRAM & TRAINING DEVELOPMENT GRANT', y, pageWidth)
  y += 6

  y = pdfFieldLine(doc, 'FROM', orgHeader.council, y, pageWidth)
  y = pdfFieldLine(doc, 'PURPOSE/EVENT/ACTIVITY', app.purpose, y, pageWidth)
  y = pdfFieldLine(doc, 'DATE OF EVENT/ACTIVITY', app.eventDate, y, pageWidth)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text('AMOUNT REQUESTED', PDF_MARGIN, y)
  doc.text(`: P ${formatAmount(ptdgAmountRequested(app))}`, 195, y)
  y += 22

  y = pdfSectionHeading(doc, 'PROPOSED BUDGET', y, pageWidth)
  y += 4
  y = pdfBudgetTable(
    doc,
    'PROJECTED SOURCES:',
    app.projectedSources,
    'SUB TOTAL',
    ptdgSourcesSubtotal(app),
    y,
    pageWidth
  )
  y += 10
  y = pdfBudgetTable(
    doc,
    'PROJECTED EXPENSES:',
    app.projectedExpenses,
    'TOTAL',
    ptdgExpensesTotal(app),
    y,
    pageWidth
  )
  y += 14

  y = addSignatories(doc, y, [
    {
      label: 'REQUESTED BY:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    },
    { label: 'DATE', name: formatDate(app.createdAt), role: '' },
    {
      label: 'APPROVED BY:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ])
  y += 14
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.5)
  doc.line(PDF_MARGIN, y, rightEdge, y)
  y += 12
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text(
    '(This application is not valid if not duly signed by Council Executive and Council President)',
    pageWidth / 2,
    y,
    { align: 'center' }
  )
  y += 22

  if (y > 620) {
    doc.addPage()
    y = 50
  }

  y = pdfSectionHeading(doc, 'NOTICE OF APPROVAL/DISAPPROVAL', y, pageWidth)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text('(TO BE FILLED UP BY REGIONAL OFFICE)', pageWidth / 2, y, { align: 'center' })
  y += 22

  const approved = app.status === 'approved'
  const disapproved = app.status === 'disapproved'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(`${checkboxText(approved)} APPROVED`, PDF_MARGIN, y)
  doc.text('AMOUNT P', 330, y)
  const amountValueX = 330 + doc.getTextWidth('AMOUNT P') + 6
  doc.setFont('helvetica', 'normal')
  const approvedAmountText = approved ? formatAmount(app.regionalApprovedAmount ?? 0) : ''
  doc.text(approvedAmountText, amountValueX, y)
  doc.setLineWidth(0.5)
  doc.line(amountValueX, y + 2, rightEdge, y + 2)
  y += 22

  doc.setFontSize(9)
  const balanceRows: [string, string][] = [
    ['Program and Training Development Grant Balance as of _______________', 'P'],
    ['Less: Approved PTDG', ''],
    ['Balance as of _______________', '']
  ]
  for (const [label, prefix] of balanceRows) {
    doc.text(label, PDF_MARGIN, y)
    doc.text(prefix, 460, y)
    doc.line(475, y + 2, rightEdge, y + 2)
    y += 16
  }
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.text('REMARKS:', PDF_MARGIN, y)
  doc.setFont('helvetica', 'normal')
  const approvedRemarks = approved ? (app.regionalRemarks ?? '') : ''
  doc.text(approvedRemarks, PDF_MARGIN + 55, y)
  doc.line(PDF_MARGIN + 55, y + 2, rightEdge, y + 2)
  y += 14
  doc.line(PDF_MARGIN, y + 2, rightEdge, y + 2)
  y += 24

  doc.setFont('helvetica', 'bold')
  doc.text(`${checkboxText(disapproved)} DISAPPROVED`, PDF_MARGIN, y)
  y += 18
  doc.text('REMARKS:', PDF_MARGIN, y)
  doc.setFont('helvetica', 'normal')
  const disapprovedRemarks = disapproved ? (app.regionalRemarks ?? '') : ''
  doc.text(disapprovedRemarks, PDF_MARGIN + 55, y)
  doc.line(PDF_MARGIN + 55, y + 2, rightEdge, y + 2)
  y += 14
  doc.line(PDF_MARGIN, y + 2, rightEdge, y + 2)
  y += 8

  // addSignatories adds its own ~30pt gap before drawing, so this only needs to
  // guard against the signature block itself running past the page — not the
  // gap on top of it (an over-eager check here was leaving an almost-empty
  // trailing page behind it).
  if (y > 760) {
    doc.addPage()
    y = 50
  }

  addSignatories(doc, y, [
    {
      label: 'CERTIFIED CORRECT:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    { label: 'APPROVED BY:', name: '', role: 'Regional Executive Director' }
  ])

  return doc
}

export async function exportPtdgPdf(app: PtdgApplication) {
  const doc = await buildPtdgPdfDoc(app)
  savePdf(doc, filenameFor(app, 'pdf'))
}

// ─── Excel ────────────────────────────────────────────────────────────────
export async function exportPtdgApplication(app: PtdgApplication) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('PTDG')
  sheet.columns = [{ width: 4 }, { width: 30 }, { width: 4 }, { width: 22 }, { width: 18 }]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 5 })

  const headerLines = [
    orgHeader.orgName,
    orgHeader.region,
    'APPLICATION FOR PROGRAM & TRAINING DEVELOPMENT GRANT'
  ]
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 5)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i === 2, size: i === 2 ? 12 : 11, underline: i === 2 }
  })

  let r = 6
  const field = (label: string, value: string) => {
    sheet.getCell(r, 2).value = label
    sheet.getCell(r, 2).font = { bold: true }
    sheet.mergeCells(r, 4, r, 5)
    sheet.getCell(r, 3).value = ':'
    sheet.getCell(r, 4).value = value
    sheet.getCell(r, 4).border = { bottom: { style: 'thin' } }
    sheet.getCell(r, 5).border = { bottom: { style: 'thin' } }
    r++
  }
  field('FROM', orgHeader.council)
  field('PURPOSE/EVENT/ACTIVITY', app.purpose)
  field('DATE OF EVENT/ACTIVITY', app.eventDate)
  r++
  sheet.getCell(r, 2).value = 'AMOUNT REQUESTED'
  sheet.getCell(r, 2).font = { bold: true, size: 12 }
  sheet.getCell(r, 3).value = ':'
  sheet.getCell(r, 4).value = `P ${formatAmount(ptdgAmountRequested(app))}`
  sheet.getCell(r, 4).font = { bold: true, size: 12 }
  r += 2

  sheet.mergeCells(r, 2, r, 5)
  sheet.getCell(r, 2).value = 'PROPOSED BUDGET'
  sheet.getCell(r, 2).font = { bold: true, underline: true }
  sheet.getCell(r, 2).alignment = { horizontal: 'center' }
  r += 2

  function writeLineItems(title: string, items: PtdgLineItem[], totalLabel: string) {
    sheet.getCell(r, 2).value = title
    sheet.getCell(r, 2).font = { bold: true }
    r++
    sheet.getCell(r, 2).value = 'PARTICULARS'
    sheet.getCell(r, 5).value = 'AMOUNT'
    sheet.getCell(r, 2).font = { bold: true }
    sheet.getCell(r, 5).font = { bold: true }
    sheet.getCell(r, 5).alignment = { horizontal: 'right' }
    r++
    if (items.length === 0) {
      sheet.getCell(r, 2).value = '—'
      r++
    }
    for (const item of items) {
      sheet.getCell(r, 2).value = item.particulars
      sheet.getCell(r, 5).value = item.amount
      sheet.getCell(r, 5).numFmt = '#,##0.00'
      sheet.getCell(r, 5).alignment = { horizontal: 'right' }
      r++
    }
    sheet.getCell(r, 2).value = totalLabel
    sheet.getCell(r, 2).font = { bold: true }
    sheet.getCell(r, 5).value = items.reduce((sum, l) => sum + l.amount, 0)
    sheet.getCell(r, 5).numFmt = '#,##0.00'
    sheet.getCell(r, 5).font = { bold: true }
    sheet.getCell(r, 5).alignment = { horizontal: 'right' }
    r += 2
  }

  writeLineItems('PROJECTED SOURCES:', app.projectedSources, 'SUB TOTAL')
  writeLineItems('PROJECTED EXPENSES:', app.projectedExpenses, 'TOTAL')

  r++
  sheet.getCell(r, 2).value = 'REQUESTED BY:'
  sheet.getCell(r, 4).value = 'APPROVED BY:'
  r += 3
  sheet.getCell(r, 2).value = signatories.councilExecutive.toUpperCase()
  sheet.getCell(r, 3).value = formatDate(app.createdAt)
  sheet.getCell(r, 4).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Council Executive'
  sheet.getCell(r, 4).value = 'Council President'
  r += 2
  sheet.mergeCells(r, 2, r, 5)
  sheet.getCell(r, 2).value =
    '(This application is not valid if not duly signed by Council Executive and Council President)'
  sheet.getCell(r, 2).font = { italic: true, size: 9 }
  sheet.getCell(r, 2).alignment = { horizontal: 'center' }
  r += 3

  sheet.mergeCells(r, 2, r, 5)
  sheet.getCell(r, 2).value = 'NOTICE OF APPROVAL/DISAPPROVAL'
  sheet.getCell(r, 2).font = { bold: true, underline: true }
  sheet.getCell(r, 2).alignment = { horizontal: 'center' }
  r++
  sheet.mergeCells(r, 2, r, 5)
  sheet.getCell(r, 2).value = '(TO BE FILLED UP BY REGIONAL OFFICE)'
  sheet.getCell(r, 2).font = { size: 9 }
  sheet.getCell(r, 2).alignment = { horizontal: 'center' }
  r += 2

  const approved = app.status === 'approved'
  const disapproved = app.status === 'disapproved'

  sheet.getCell(r, 2).value = `${checkboxText(approved)} APPROVED`
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 4).value = 'AMOUNT P'
  sheet.getCell(r, 5).value = approved ? formatAmount(app.regionalApprovedAmount ?? 0) : ''
  r += 2
  sheet.getCell(r, 2).value = 'Program and Training Development Grant Balance as of'
  sheet.getCell(r, 4).value = 'P'
  r++
  sheet.getCell(r, 2).value = 'Less: Approved PTDG'
  r++
  sheet.getCell(r, 2).value = 'Balance as of'
  r += 2
  sheet.getCell(r, 2).value = 'REMARKS:'
  sheet.mergeCells(r, 3, r, 5)
  sheet.getCell(r, 3).value = approved ? (app.regionalRemarks ?? '') : ''
  r += 3

  sheet.getCell(r, 2).value = `${checkboxText(disapproved)} DISAPPROVED`
  sheet.getCell(r, 2).font = { bold: true }
  r += 2
  sheet.getCell(r, 2).value = 'REMARKS:'
  sheet.mergeCells(r, 3, r, 5)
  sheet.getCell(r, 3).value = disapproved ? (app.regionalRemarks ?? '') : ''
  r += 3

  sheet.getCell(r, 2).value = 'CERTIFIED CORRECT:'
  sheet.getCell(r, 4).value = 'APPROVED BY:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 4).value = 'Regional Executive Director'

  downloadWorkbook(wb, filenameFor(app, 'xlsx'))
}

// ─── Word ─────────────────────────────────────────────────────────────────
export async function exportPtdgDocx(app: PtdgApplication) {
  const approved = app.status === 'approved'
  const disapproved = app.status === 'disapproved'

  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: 'APPLICATION FOR PROGRAM & TRAINING DEVELOPMENT GRANT', bold: true, size: 24 }
    ])),
    spacer(),
    buildTable(
      [],
      [
        ['FROM', orgHeader.council],
        ['PURPOSE/EVENT/ACTIVITY', app.purpose],
        ['DATE OF EVENT/ACTIVITY', app.eventDate],
        ['AMOUNT REQUESTED', `P ${formatAmount(ptdgAmountRequested(app))}`]
      ],
      undefined,
      undefined,
      [3]
    ),
    spacer(),
    buildTable(['PARTICULARS', 'AMOUNT'], lineItemRows(app.projectedSources), [
      'SUB TOTAL',
      formatAmount(ptdgSourcesSubtotal(app))
    ]),
    spacer(),
    buildTable(['PARTICULARS', 'AMOUNT'], lineItemRows(app.projectedExpenses), [
      'TOTAL',
      formatAmount(ptdgExpensesTotal(app))
    ]),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'REQUESTED BY:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
      },
      { label: 'DATE', name: formatDate(app.createdAt), role: '' },
      {
        label: 'APPROVED BY:',
        name: signatories.councilPresident.toUpperCase(),
        role: 'Council President'
      }
    ]),
    spacer(),
    ...(await headerParagraphs([
      {
        text: '(This application is not valid if not duly signed by Council Executive and Council President)',
        size: 16
      }
    ])),
    spacer(),
    ...(await headerParagraphs([
      { text: 'NOTICE OF APPROVAL/DISAPPROVAL', bold: true, size: 22 },
      { text: '(TO BE FILLED UP BY REGIONAL OFFICE)', size: 16 }
    ])),
    spacer(),
    buildTable(
      [],
      [
        [
          `${checkboxText(approved)} APPROVED`,
          approved ? `Amount: P ${formatAmount(app.regionalApprovedAmount ?? 0)}` : 'Amount: P'
        ],
        ['Program and Training Development Grant Balance as of', ''],
        ['Less: Approved PTDG', ''],
        ['Balance as of', ''],
        ['REMARKS:', approved ? (app.regionalRemarks ?? '') : ''],
        [`${checkboxText(disapproved)} DISAPPROVED`, ''],
        ['REMARKS:', disapproved ? (app.regionalRemarks ?? '') : '']
      ]
    ),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'CERTIFIED CORRECT:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      },
      { label: 'APPROVED BY:', name: '', role: 'Regional Executive Director' }
    ])
  ]
  await saveDocx(children, filenameFor(app, 'docx'))
}

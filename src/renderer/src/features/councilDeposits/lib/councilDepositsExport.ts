import ExcelJS from 'exceljs'
import { orgHeader } from '@/shared/data/signatories.data'
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
  lineItemTotal,
  councilDepositsColumnTotals,
  councilDepositsGrandTotal,
  type CouncilDepositsRecord
} from '../types/councilDeposits.types'

const REPORT_TITLE = 'PTDG, MMAF & JL Escoda Memento Fund'
const REPORT_SUBTITLE = 'Council Deposits retained at RHQ'
const NO_BREAKDOWN = '-'

function asOfLabel(record: CouncilDepositsRecord): string {
  return record.asOfDate ? `As of ${record.asOfDate}` : 'As of —'
}

function fmt(n: number): string {
  return n.toFixed(2)
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

function tableHead(): string[] {
  return [
    'Council Deposits',
    'National Event',
    'Regional Event',
    'Council Event',
    'International Event',
    'Total'
  ]
}

function tableRows(record: CouncilDepositsRecord): (string | number)[][] {
  return record.items.map((item) => [
    item.label,
    item.hasBreakdown ? fmt(item.breakdown.nationalEvent) : NO_BREAKDOWN,
    item.hasBreakdown ? fmt(item.breakdown.regionalEvent) : NO_BREAKDOWN,
    item.hasBreakdown ? fmt(item.breakdown.councilEvent) : NO_BREAKDOWN,
    item.hasBreakdown ? fmt(item.breakdown.internationalEvent) : NO_BREAKDOWN,
    fmt(lineItemTotal(item))
  ])
}

function tableFoot(record: CouncilDepositsRecord): (string | number)[] {
  const totals = councilDepositsColumnTotals(record)
  return [
    'TOTAL',
    fmt(totals.nationalEvent),
    fmt(totals.regionalEvent),
    fmt(totals.councilEvent),
    fmt(totals.internationalEvent),
    fmt(councilDepositsGrandTotal(record))
  ]
}

function signatoryColumns(record: CouncilDepositsRecord) {
  return [
    {
      label: 'Prepared by:',
      name: record.preparedByName || '—',
      role: record.preparedByTitle || ''
    },
    { label: 'Noted by:', name: record.notedByName || '—', role: record.notedByTitle || '' }
  ]
}

function exportFilename(record: CouncilDepositsRecord, ext: string): string {
  const suffix = record.asOfDate ? record.asOfDate.replace(/[^0-9a-z]/gi, '_') : 'undated'
  return `Council_Deposits_RHQ_${suffix}.${ext}`
}

export async function exportCouncilDepositsExcel(record: CouncilDepositsRecord) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Council Deposits')
  sheet.columns = [
    { width: 34 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 16 }
  ]
  await addWorksheetLogo(wb, sheet, { startCol: 1, endCol: 6 })

  const lines = [
    orgHeader.orgName,
    orgHeader.council,
    REPORT_TITLE,
    REPORT_SUBTITLE,
    asOfLabel(record)
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, 6)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i === 2, italic: i === 3 }
  })

  let r = 8
  const head = tableHead()
  head.forEach((label, i) => {
    const cell = sheet.getCell(r, i + 1)
    cell.value = label
    cell.font = { bold: true }
    cell.alignment = { horizontal: i === 0 ? 'left' : 'center' }
  })
  r++

  for (const row of tableRows(record)) {
    row.forEach((value, i) => {
      const cell = sheet.getCell(r, i + 1)
      if (i === 0) {
        cell.value = value
      } else {
        cell.value = value === NO_BREAKDOWN ? NO_BREAKDOWN : Number(value)
        cell.alignment = { horizontal: 'right' }
        if (value !== NO_BREAKDOWN) cell.numFmt = '#,##0.00'
      }
    })
    r++
  }

  const foot = tableFoot(record)
  foot.forEach((value, i) => {
    const cell = sheet.getCell(r, i + 1)
    cell.value = i === 0 ? value : Number(value)
    cell.font = { bold: true }
    if (i > 0) {
      cell.alignment = { horizontal: 'right' }
      cell.numFmt = '#,##0.00'
    }
  })
  r += 4

  sheet.getCell(r, 1).value = 'Prepared by:'
  sheet.getCell(r, 4).value = 'Noted by:'
  r += 3
  sheet.getCell(r, 1).value = (record.preparedByName || '—').toUpperCase()
  sheet.getCell(r, 4).value = (record.notedByName || '—').toUpperCase()
  r++
  sheet.getCell(r, 1).value = record.preparedByTitle || ''
  sheet.getCell(r, 4).value = record.notedByTitle || ''

  downloadWorkbook(wb, exportFilename(record, 'xlsx'))
}

export async function buildCouncilDepositsPdfDoc(record: CouncilDepositsRecord) {
  const doc = createPdf('landscape')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: REPORT_TITLE, bold: true, size: 12 },
    { text: REPORT_SUBTITLE },
    { text: asOfLabel(record) }
  ])
  y = addTable(doc, {
    startY: y,
    head: [tableHead()],
    body: tableRows(record),
    foot: [tableFoot(record)],
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  })
  addSignatories(doc, y, signatoryColumns(record))
  return doc
}

export async function exportCouncilDepositsPdf(record: CouncilDepositsRecord) {
  const doc = await buildCouncilDepositsPdfDoc(record)
  savePdf(doc, exportFilename(record, 'pdf'))
}

export async function exportCouncilDepositsDocx(record: CouncilDepositsRecord) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: REPORT_TITLE, bold: true, size: 24 },
      { text: REPORT_SUBTITLE },
      { text: asOfLabel(record) }
    ])),
    spacer(),
    buildTable(tableHead(), tableRows(record), tableFoot(record)),
    spacer(),
    spacer(),
    signatoryTable(signatoryColumns(record))
  ]
  await saveDocx(children, exportFilename(record, 'docx'), true)
}

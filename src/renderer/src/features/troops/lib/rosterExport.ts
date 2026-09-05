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
import type { ScoutMember } from '../types/troop.types'

export interface RosterExportRow extends ScoutMember {
  membershipStatusLabel: string
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

const HEADERS = [
  'Name',
  'Birthdate',
  'Level',
  'Guardian',
  'Guardian Contact',
  'Membership Year',
  'Status'
]

function rosterRow(m: RosterExportRow): (string | number)[] {
  return [
    m.fullName,
    formatDate(m.birthdate),
    m.level || '—',
    m.guardianName || '—',
    m.guardianContact || '—',
    m.membershipStatusLabel,
    m.isActive ? 'Active' : 'Inactive'
  ]
}

const signatureLines = [
  { label: 'Prepared by:', name: signatories.taForProgram, role: 'TA for Program' },
  { label: 'Noted by:', name: signatories.councilExecutive, role: 'Council Executive' },
  { label: 'Approved:', name: signatories.councilPresident, role: 'Council President' }
]

function fileBase(troopNumber: string, membershipYear: string) {
  return `Troop_${troopNumber}_Roster_${membershipYear}`.replace(/[^0-9a-z]/gi, '_')
}

export async function exportRosterExcel(
  roster: RosterExportRow[],
  troopNumber: string,
  membershipYear: string
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Member Roster')
  sheet.columns = [
    { width: 24 },
    { width: 14 },
    { width: 16 },
    { width: 22 },
    { width: 18 },
    { width: 18 },
    { width: 12 }
  ]
  await addWorksheetLogo(wb, sheet)

  const totalCols = HEADERS.length
  const lines = [
    orgHeader.orgName,
    orgHeader.region,
    orgHeader.council,
    `TROOP ${troopNumber} — MEMBER ROSTER`,
    `Membership Year ${membershipYear}`
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, totalCols)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 3, size: i === 3 ? 13 : 11 }
  })

  const headerRowIdx = lines.length + 2
  const headerRow = sheet.getRow(headerRowIdx)
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }
    cell.alignment = { horizontal: 'center' }
  })

  let r = headerRowIdx + 1
  for (const member of roster) {
    rosterRow(member).forEach((val, i) => {
      sheet.getCell(r, i + 1).value = val
    })
    r++
  }

  r += 2
  signatureLines.forEach((s, i) => {
    sheet.getCell(r + i, 1).value = s.label
    sheet.getCell(r + i, 2).value = s.name
    sheet.getCell(r + i, 2).font = { bold: true }
    sheet.getCell(r + i, 3).value = s.role
  })

  downloadWorkbook(wb, `${fileBase(troopNumber, membershipYear)}.xlsx`)
}

export async function buildRosterPdfDoc(
  roster: RosterExportRow[],
  troopNumber: string,
  membershipYear: string
) {
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: `TROOP ${troopNumber} — MEMBER ROSTER`, bold: true, size: 13 },
    { text: `Membership Year ${membershipYear}` }
  ])
  const finalY = addTable(doc, {
    startY: y,
    head: [HEADERS],
    body: roster.map(rosterRow)
  })
  addSignatories(doc, finalY, signatureLines)
  return doc
}

export async function exportRosterPdf(
  roster: RosterExportRow[],
  troopNumber: string,
  membershipYear: string
) {
  const doc = await buildRosterPdfDoc(roster, troopNumber, membershipYear)
  savePdf(doc, `${fileBase(troopNumber, membershipYear)}.pdf`)
}

export async function exportRosterDocx(
  roster: RosterExportRow[],
  troopNumber: string,
  membershipYear: string
) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: `TROOP ${troopNumber} — MEMBER ROSTER`, bold: true, size: 26 },
      { text: `Membership Year ${membershipYear}` }
    ])),
    spacer(),
    buildTable(HEADERS, roster.map(rosterRow)),
    spacer(),
    spacer(),
    signatoryTable(signatureLines)
  ]
  await saveDocx(children, `${fileBase(troopNumber, membershipYear)}.docx`, true)
}

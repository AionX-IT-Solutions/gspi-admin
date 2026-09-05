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
import type { Troop } from '../types/troop.types'

export interface TroopExportRow extends Troop {
  memberCount: number
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
  'Troop #',
  'Troop Name',
  'Level',
  'Troop Leader',
  'Assistant Leader',
  'School',
  'Barangay',
  'Members',
  'Status'
]

function troopRow(t: TroopExportRow): (string | number)[] {
  return [
    t.troopNumber,
    t.troopName ?? '—',
    t.level,
    t.leaderName,
    t.assistantLeaderName ?? '—',
    t.school ?? '—',
    t.barangay ?? '—',
    t.memberCount,
    t.isActive ? 'Active' : 'Inactive'
  ]
}

const signatureLines = [
  { label: 'Prepared by:', name: signatories.taForProgram, role: 'TA for Program' },
  { label: 'Noted by:', name: signatories.councilExecutive, role: 'Council Executive' },
  { label: 'Approved:', name: signatories.councilPresident, role: 'Council President' }
]

export async function exportTroopsExcel(troops: TroopExportRow[], membershipYear: string) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Troops & Membership')
  sheet.columns = [
    { width: 10 },
    { width: 24 },
    { width: 16 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 18 },
    { width: 10 },
    { width: 12 }
  ]
  await addWorksheetLogo(wb, sheet)

  const totalCols = HEADERS.length
  const lines = [
    orgHeader.orgName,
    orgHeader.region,
    orgHeader.council,
    'TROOPS & MEMBERSHIP',
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
  for (const troop of troops) {
    troopRow(troop).forEach((val, i) => {
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

  downloadWorkbook(wb, `Troops_and_Membership_${membershipYear.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildTroopsPdfDoc(troops: TroopExportRow[], membershipYear: string) {
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'TROOPS & MEMBERSHIP', bold: true, size: 13 },
    { text: `Membership Year ${membershipYear}` }
  ])
  const finalY = addTable(doc, {
    startY: y,
    head: [HEADERS],
    body: troops.map(troopRow)
  })
  addSignatories(doc, finalY, signatureLines)
  return doc
}

export async function exportTroopsPdf(troops: TroopExportRow[], membershipYear: string) {
  const doc = await buildTroopsPdfDoc(troops, membershipYear)
  savePdf(doc, `Troops_and_Membership_${membershipYear.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportTroopsDocx(troops: TroopExportRow[], membershipYear: string) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'TROOPS & MEMBERSHIP', bold: true, size: 26 },
      { text: `Membership Year ${membershipYear}` }
    ])),
    spacer(),
    buildTable(HEADERS, troops.map(troopRow)),
    spacer(),
    spacer(),
    signatoryTable(signatureLines)
  ]
  await saveDocx(
    children,
    `Troops_and_Membership_${membershipYear.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

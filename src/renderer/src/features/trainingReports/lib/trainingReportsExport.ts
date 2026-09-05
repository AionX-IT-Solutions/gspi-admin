import ExcelJS from 'exceljs'
import autoTable from 'jspdf-autotable'
import type { jsPDF } from 'jspdf'
import { orgHeader } from '@/shared/data/signatories.data'
import { createPdf, savePdf } from '@/shared/lib/pdfExport'
import { getReportLogoDataUrl } from '@/shared/lib/reportLogo'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { Paragraph, TextRun, type Table } from 'docx'
import type { TrainingReport } from '../types/trainingReports.types'

function fileBase(report: TrainingReport): string {
  return `Training_Report_${report.reportNo}_${report.seriesYear}`.replace(/[^0-9a-zA-Z_]/g, '_')
}

function formatLongDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function dateRangeLabel(report: TrainingReport): string {
  const from = formatLongDate(report.dateFrom)
  if (!report.dateTo || report.dateTo === report.dateFrom) return from
  return `${from} – ${formatLongDate(report.dateTo)}`
}

function reportHeading(report: TrainingReport): string {
  return `TRAINING REPORT NO.${report.reportNo} S.${report.seriesYear}`
}

/** Every role this report lists, in the same order the official form groups them:
 *  Trainer(s) under TRAINING TEAM, then Coordinator / Assistant Coordinators /
 *  Dietician-QM under STAFF. Shared by the Excel and Word builders. */
function roleRows(report: TrainingReport): { label: string; names: string[] }[] {
  return [
    { label: 'Trainer', names: report.trainers },
    { label: 'Coordinator', names: report.coordinator ? [report.coordinator] : [] },
    { label: 'Assistant Coordinators', names: report.assistantCoordinators },
    { label: 'Dietician/QM', names: report.dieticians }
  ].filter((r) => r.names.length > 0)
}

// ---------------------------------------------------------------------------
// PDF — replicates the official NHQ "TRAINING REPORT" form: lettered sections
// A–L (A–D take a period after the letter, E–L don't — that inconsistency is
// in the official template itself), CHQ/RHQ/NHQ copy checkboxes, dot-leader
// fee/staff lines, then a second page with the signed participant list.
// ---------------------------------------------------------------------------

const PDF_MARGIN = 40
const LINE_H = 13

function drawCheckbox(doc: jsPDF, x: number, y: number, label: string): void {
  doc.setDrawColor(0)
  doc.rect(x, y - 6, 7, 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(label, x + 11, y)
}

function drawDots(doc: jsPDF, width: number): string {
  const dotWidth = doc.getTextWidth('.')
  if (dotWidth <= 0 || width <= 0) return ''
  return '.'.repeat(Math.floor(width / dotWidth))
}

function drawLabelValue(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  rightEdge: number
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(label, x, y)
  const valueX = x + doc.getTextWidth(label) + 6
  doc.setFont('helvetica', 'normal')
  const lines = doc.splitTextToSize(value || '—', rightEdge - valueX) as string[]
  lines.forEach((line, i) => doc.text(line, valueX, y + i * LINE_H))
  return y + lines.length * LINE_H
}

function drawBullets(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  items: string[],
  rightEdge: number
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(label, x, y)
  y += LINE_H
  doc.setFont('helvetica', 'normal')
  for (const item of items) {
    const lines = doc.splitTextToSize(`•${item}`, rightEdge - x) as string[]
    lines.forEach((line, i) => doc.text(line, x, y + i * LINE_H))
    y += lines.length * LINE_H
  }
  return y
}

function drawDotLeaderRow(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  valueX: number
): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(label, x, y)
  const labelEnd = x + doc.getTextWidth(label) + 4
  const dots = drawDots(doc, valueX - labelEnd - 4)
  if (dots) doc.text(dots, labelEnd, y)
  doc.setFont('helvetica', 'bold')
  doc.text(value || '—', valueX, y)
  return y + LINE_H
}

function drawRoleBlock(
  doc: jsPDF,
  roleX: number,
  valueX: number,
  y: number,
  role: string,
  names: string[]
): number {
  if (names.length === 0) return y
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(role, roleX, y)
  doc.setFont('helvetica', 'bold')
  names.forEach((name, i) => doc.text(name, valueX, y + i * LINE_H))
  return y + names.length * LINE_H
}

export async function buildTrainingReportPdfDoc(
  report: TrainingReport,
  t: (key: string) => string
): Promise<jsPDF> {
  const doc = createPdf('portrait')
  const pageWidth = doc.internal.pageSize.getWidth()
  const left = PDF_MARGIN
  const right = pageWidth - PDF_MARGIN
  const indent = left + 14

  let y = PDF_MARGIN
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(orgHeader.orgName.toUpperCase(), left, y)
  drawCheckbox(doc, right - 85, y, 'CHQ Copy')
  y += 12
  doc.text(orgHeader.region.toUpperCase(), left, y)
  drawCheckbox(doc, right - 85, y, 'RHQ Copy')
  y += 12
  doc.text(orgHeader.council.toUpperCase(), left, y)
  drawCheckbox(doc, right - 85, y, 'NHQ Copy')
  y += 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(reportHeading(report), pageWidth / 2, y, { align: 'center' })
  y += 8
  doc.setLineWidth(0.75)
  doc.line(left, y, right, y)
  y += 20

  y = drawLabelValue(doc, left, y, 'A. TITLE OF TRAINING EVENT:', report.title, right) + 8
  y = drawLabelValue(doc, left, y, 'B. PLACE OF TRAINING EVENT:', report.place, right) + 8
  y =
    drawLabelValue(doc, left, y, 'C. INCLUSIVE DATES OF TRAINING:', dateRangeLabel(report), right) +
    8
  y = drawBullets(doc, left, y, 'D. OBJECTIVES OF TRAINING:', report.objectives, right) + 16

  y = drawLabelValue(
    doc,
    left,
    y,
    'E  TYPE OF TRAINING:',
    t(`trainingReports.types.${report.trainingType}`).toUpperCase(),
    right
  )
  y += 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('F  NUMBER OF ACTUAL HOURS TAKEN PER DAY:', left, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    String(report.hoursPerDay),
    left + doc.getTextWidth('F  NUMBER OF ACTUAL HOURS TAKEN PER DAY:') + 6,
    y
  )
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL HOURS:', left + 300, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(report.totalHours), left + 300 + doc.getTextWidth('TOTAL HOURS:') + 4, y)
  y += 18

  doc.setFont('helvetica', 'bold')
  doc.text('G  CLASSIFICATION OF PARTICIPANTS:', left, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    report.participantClassification || '—',
    left + doc.getTextWidth('G  CLASSIFICATION OF PARTICIPANTS:') + 10,
    y
  )
  doc.setFont('helvetica', 'bold')
  doc.text('NO.', right - 70, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(report.participantCount), right - 70 + doc.getTextWidth('NO.') + 4, y)
  y += 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('H  FEES:', left, y)
  y += LINE_H
  const feeValueX = left + 230
  y = drawDotLeaderRow(
    doc,
    indent,
    y,
    '1. Amount Collected Per Participant',
    report.feePerParticipant,
    feeValueX
  )
  y = drawDotLeaderRow(
    doc,
    indent,
    y,
    '2. Amount Collected in Training Reserves',
    report.feeCollectedReserves,
    feeValueX
  )
  y = drawDotLeaderRow(
    doc,
    indent,
    y,
    '3. Amount Remitted and Enclosed',
    report.feeRemitted,
    feeValueX
  )
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const teamLabel = 'I  TRAINING TEAM:'
  const staffLabel = 'J  STAFF:'
  const roleX = left + Math.max(doc.getTextWidth(teamLabel), doc.getTextWidth(staffLabel)) + 14
  const roleValueX = roleX + 128

  doc.text(teamLabel, left, y)
  y = drawRoleBlock(doc, roleX, roleValueX, y, 'Trainer', report.trainers) + 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(staffLabel, left, y)
  y = drawRoleBlock(
    doc,
    roleX,
    roleValueX,
    y,
    'Coordinator',
    report.coordinator ? [report.coordinator] : []
  )
  y = drawRoleBlock(
    doc,
    roleX,
    roleValueX,
    y,
    'Assistant Coordinators',
    report.assistantCoordinators
  )
  y = drawRoleBlock(doc, roleX, roleValueX, y, 'Dietician/QM', report.dieticians) + 16

  y =
    drawBullets(
      doc,
      left,
      y,
      'K  OBSERVATIONS/RECOMMENDATIONS/SUGGESTIONS',
      report.observations,
      right
    ) + 16

  if (report.participants.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('L  ENCLOSED LIST OF PARTICIPANTS', left, y)
    y += 30
  } else {
    y += 14
  }

  const midX = pageWidth / 2 + 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Submitted By:', midX, y)
  doc.setFont('helvetica', 'bold')
  const nameX = midX + doc.getTextWidth('Submitted By:') + 6
  doc.text((report.submittedByName || '—').toUpperCase(), nameX, y)
  doc.setLineWidth(0.5)
  doc.line(nameX - 2, y + 3, right, y + 3)
  y += 20
  doc.setFont('helvetica', 'normal')
  doc.text('Date:', left, y)
  doc.setFont('helvetica', 'bold')
  doc.text(
    formatLongDate(report.submittedDate).toUpperCase(),
    left + doc.getTextWidth('Date:') + 6,
    y
  )
  doc.setFont('helvetica', 'normal')
  doc.text('Designation:', midX, y)
  doc.setFont('helvetica', 'bold')
  doc.text(report.submittedByDesignation || '—', midX + doc.getTextWidth('Designation:') + 6, y)

  if (report.participants.length > 0) {
    await addParticipantListPage(doc, report)
  }

  return doc
}

async function addParticipantListPage(doc: jsPDF, report: TrainingReport): Promise<void> {
  doc.addPage()
  const pageWidth = doc.internal.pageSize.getWidth()
  const left = PDF_MARGIN
  const right = pageWidth - PDF_MARGIN
  let y = PDF_MARGIN

  const logo = await getReportLogoDataUrl()
  if (logo) {
    const size = 46
    doc.addImage(logo, 'PNG', pageWidth / 2 - size / 2, y, size, size)
    y += size + 8
  }

  doc.setTextColor(16, 185, 129)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(orgHeader.orgName.toUpperCase(), pageWidth / 2, y, { align: 'center' })
  y += 16
  doc.setTextColor(20, 20, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(orgHeader.region, pageWidth / 2, y, { align: 'center' })
  y += 13
  doc.setFont('helvetica', 'bold')
  doc.text(orgHeader.council, pageWidth / 2, y, { align: 'center' })
  y += 20

  const barHeight = 34
  doc.setFillColor(16, 185, 129)
  doc.rect(left, y, right - left, barHeight, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text(report.title.toUpperCase(), pageWidth / 2, y + 15, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`${dateRangeLabel(report)}  |  ${report.place}`, pageWidth / 2, y + 27, {
    align: 'center'
  })
  doc.setTextColor(0, 0, 0)
  y += barHeight

  autoTable(doc, {
    startY: y,
    margin: { left, right: PDF_MARGIN },
    head: [['NO.', 'NAME', 'SCHOOL', 'Signature']],
    body: report.participants.map((p, i) => [String(i + 1), p.name, p.school, '']),
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      valign: 'middle',
      lineColor: [180, 180, 190],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [20, 20, 30],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 160 },
      2: { cellWidth: 160 },
      3: { cellWidth: 'auto' }
    }
  })
}

export async function exportTrainingReportPdf(report: TrainingReport, t: (key: string) => string) {
  const doc = await buildTrainingReportPdfDoc(report, t)
  savePdf(doc, `${fileBase(report)}.pdf`)
}

// ---------------------------------------------------------------------------
// Excel — sheet 1 mirrors the official form's own lettered sections A–L
// (same content, order and grouping as the PDF, laid out as rows/cells
// instead of drawn text); sheet 2 is the signed participant list.
// ---------------------------------------------------------------------------

function excelLabelValueRow(
  sheet: ExcelJS.Worksheet,
  row: number,
  label: string,
  value: string,
  lastCol = 5
): void {
  sheet.getCell(row, 1).value = label
  sheet.getCell(row, 1).font = { bold: true }
  sheet.mergeCells(row, 2, row, lastCol)
  sheet.getCell(row, 2).value = value
  sheet.getCell(row, 2).alignment = { wrapText: true }
}

function excelBulletRows(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  label: string,
  items: string[]
): number {
  let r = startRow
  sheet.getCell(r, 1).value = label
  sheet.getCell(r, 1).font = { bold: true }
  r++
  for (const item of items) {
    sheet.mergeCells(r, 1, r, 5)
    sheet.getCell(r, 1).value = `• ${item}`
    sheet.getCell(r, 1).alignment = { wrapText: true }
    r++
  }
  return r
}

export async function exportTrainingReportExcel(
  report: TrainingReport,
  t: (key: string) => string
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Training Report'.slice(0, 31))
  sheet.columns = [{ width: 30 }, { width: 30 }, { width: 22 }, { width: 22 }, { width: 22 }]
  await addWorksheetLogo(wb, sheet)

  sheet.getCell(1, 1).value = orgHeader.orgName.toUpperCase()
  sheet.getCell(1, 1).font = { bold: true }
  sheet.getCell(1, 5).value = '☐ CHQ Copy'
  sheet.getCell(2, 1).value = orgHeader.region.toUpperCase()
  sheet.getCell(2, 5).value = '☐ RHQ Copy'
  sheet.getCell(3, 1).value = orgHeader.council.toUpperCase()
  sheet.getCell(3, 5).value = '☐ NHQ Copy'

  sheet.mergeCells(5, 1, 5, 5)
  const headingCell = sheet.getCell(5, 1)
  headingCell.value = reportHeading(report)
  headingCell.font = { bold: true, size: 13 }
  headingCell.alignment = { horizontal: 'center' }
  headingCell.border = { bottom: { style: 'medium' } }

  let r = 7
  excelLabelValueRow(sheet, r, 'A. TITLE OF TRAINING EVENT:', report.title)
  r++
  excelLabelValueRow(sheet, r, 'B. PLACE OF TRAINING EVENT:', report.place)
  r++
  excelLabelValueRow(sheet, r, 'C. INCLUSIVE DATES OF TRAINING:', dateRangeLabel(report))
  r += 2

  r = excelBulletRows(sheet, r, 'D. OBJECTIVES OF TRAINING:', report.objectives)
  r++

  excelLabelValueRow(
    sheet,
    r,
    'E  TYPE OF TRAINING:',
    t(`trainingReports.types.${report.trainingType}`).toUpperCase()
  )
  r += 2

  sheet.getCell(r, 1).value = 'F  NUMBER OF ACTUAL HOURS TAKEN PER DAY:'
  sheet.getCell(r, 1).font = { bold: true }
  sheet.getCell(r, 2).value = report.hoursPerDay
  sheet.getCell(r, 3).value = 'TOTAL HOURS:'
  sheet.getCell(r, 3).font = { bold: true }
  sheet.getCell(r, 4).value = report.totalHours
  r++

  sheet.getCell(r, 1).value = 'G  CLASSIFICATION OF PARTICIPANTS:'
  sheet.getCell(r, 1).font = { bold: true }
  sheet.getCell(r, 2).value = report.participantClassification
  sheet.getCell(r, 4).value = 'NO.'
  sheet.getCell(r, 4).font = { bold: true }
  sheet.getCell(r, 5).value = report.participantCount
  r += 2

  sheet.getCell(r, 1).value = 'H  FEES:'
  sheet.getCell(r, 1).font = { bold: true }
  r++
  const feeRows: [string, string][] = [
    ['1. Amount Collected Per Participant', report.feePerParticipant],
    ['2. Amount Collected in Training Reserves', report.feeCollectedReserves],
    ['3. Amount Remitted and Enclosed', report.feeRemitted]
  ]
  for (const [label, value] of feeRows) {
    sheet.getCell(r, 1).value = label
    sheet.getCell(r, 2).value = value
    r++
  }
  r++

  sheet.getCell(r, 1).value = 'I  TRAINING TEAM:'
  sheet.getCell(r, 1).font = { bold: true }
  const teamRoles = roleRows(report).filter((role) => role.label === 'Trainer')
  const staffRoles = roleRows(report).filter((role) => role.label !== 'Trainer')
  for (const role of teamRoles) {
    for (const name of role.names) {
      sheet.getCell(r, 2).value = role.label
      sheet.getCell(r, 3).value = name
      sheet.getCell(r, 3).font = { bold: true }
      r++
    }
  }
  r++

  sheet.getCell(r, 1).value = 'J  STAFF:'
  sheet.getCell(r, 1).font = { bold: true }
  for (const role of staffRoles) {
    for (const name of role.names) {
      sheet.getCell(r, 2).value = role.label
      sheet.getCell(r, 3).value = name
      sheet.getCell(r, 3).font = { bold: true }
      r++
    }
  }
  r++

  r = excelBulletRows(sheet, r, 'K  OBSERVATIONS/RECOMMENDATIONS/SUGGESTIONS', report.observations)
  r++

  if (report.participants.length > 0) {
    sheet.getCell(r, 1).value = 'L  ENCLOSED LIST OF PARTICIPANTS'
    sheet.getCell(r, 1).font = { bold: true }
    r += 2
  }

  sheet.getCell(r, 3).value = 'Submitted By:'
  sheet.getCell(r, 4).value = (report.submittedByName || '—').toUpperCase()
  sheet.getCell(r, 4).font = { bold: true }
  r++
  sheet.getCell(r, 1).value = 'Date:'
  sheet.getCell(r, 2).value = formatLongDate(report.submittedDate).toUpperCase()
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = 'Designation:'
  sheet.getCell(r, 4).value = report.submittedByDesignation
  sheet.getCell(r, 4).font = { bold: true }

  if (report.participants.length > 0) {
    const list = wb.addWorksheet('Participant List'.slice(0, 31))
    list.columns = [{ width: 6 }, { width: 32 }, { width: 32 }, { width: 24 }]
    await addWorksheetLogo(wb, list)

    const headLines = [orgHeader.orgName, orgHeader.region, orgHeader.council]
    headLines.forEach((line, i) => {
      list.mergeCells(i + 1, 1, i + 1, 4)
      const cell = list.getCell(i + 1, 1)
      cell.value = line
      cell.alignment = { horizontal: 'center' }
      cell.font = { bold: i !== 1 }
    })

    list.mergeCells(5, 1, 5, 4)
    const titleCell = list.getCell(5, 1)
    titleCell.value = report.title.toUpperCase()
    titleCell.alignment = { horizontal: 'center' }
    titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }

    list.mergeCells(6, 1, 6, 4)
    const subtitleCell = list.getCell(6, 1)
    subtitleCell.value = `${dateRangeLabel(report)}  |  ${report.place}`
    subtitleCell.alignment = { horizontal: 'center' }
    subtitleCell.font = { color: { argb: 'FFFFFFFF' } }
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }

    const headerRow = list.getRow(7)
    ;['NO.', 'NAME', 'SCHOOL', 'Signature'].forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h
      cell.font = { bold: true }
      cell.alignment = { horizontal: i === 0 ? 'center' : 'left' }
      cell.border = { bottom: { style: 'thin' } }
    })

    report.participants.forEach((p, i) => {
      const row = list.getRow(8 + i)
      row.getCell(1).value = i + 1
      row.getCell(1).alignment = { horizontal: 'center' }
      row.getCell(2).value = p.name
      row.getCell(3).value = p.school
      row.getCell(4).value = ''
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileBase(report)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Word — mirrors the same lettered sections A–L as the PDF/Excel builders,
// then a page break into the signed participant list so the printed layout
// matches the PDF's two pages.
// ---------------------------------------------------------------------------

function docxLabelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${label} `, bold: true, size: 18 }),
      new TextRun({ text: value, size: 18 })
    ]
  })
}

function docxTwoPairs(label1: string, value1: string, label2: string, value2: string): Paragraph {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${label1} `, bold: true, size: 18 }),
      new TextRun({ text: `${value1}          `, size: 18 }),
      new TextRun({ text: `${label2} `, bold: true, size: 18 }),
      new TextRun({ text: value2, size: 18 })
    ]
  })
}

function docxBullets(label: string, items: string[]): Paragraph[] {
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: label, bold: true, size: 18 })]
    }),
    ...items.map(
      (item) =>
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 200 },
          children: [new TextRun({ text: `• ${item}`, size: 18 })]
        })
    )
  ]
}

function docxRoleBlock(
  sectionLabel: string,
  roles: { label: string; names: string[] }[]
): Paragraph[] {
  const paragraphs: Paragraph[] = []
  let sectionPrinted = false
  for (const role of roles) {
    role.names.forEach((name, i) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: !sectionPrinted ? `${sectionLabel}  ` : '        ',
              bold: true,
              size: 18
            }),
            new TextRun({
              text: i === 0 ? `${role.label}   ` : '                         ',
              size: 18
            }),
            new TextRun({ text: name, bold: true, size: 18 })
          ]
        })
      )
      sectionPrinted = true
    })
  }
  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: sectionLabel, bold: true, size: 18 })] })
    )
  }
  return paragraphs
}

export async function exportTrainingReportDocx(report: TrainingReport, t: (key: string) => string) {
  const teamRoles = roleRows(report).filter((role) => role.label === 'Trainer')
  const staffRoles = roleRows(report).filter((role) => role.label !== 'Trainer')

  const children: (Paragraph | Table)[] = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: reportHeading(report), bold: true, size: 24 },
      { text: report.title.toUpperCase() }
    ])),
    spacer(),
    docxLabelValue('A. TITLE OF TRAINING EVENT:', report.title),
    docxLabelValue('B. PLACE OF TRAINING EVENT:', report.place),
    docxLabelValue('C. INCLUSIVE DATES OF TRAINING:', dateRangeLabel(report)),
    spacer(),
    ...docxBullets('D. OBJECTIVES OF TRAINING:', report.objectives),
    spacer(),
    docxLabelValue(
      'E  TYPE OF TRAINING:',
      t(`trainingReports.types.${report.trainingType}`).toUpperCase()
    ),
    docxTwoPairs(
      'F  NUMBER OF ACTUAL HOURS TAKEN PER DAY:',
      String(report.hoursPerDay),
      'TOTAL HOURS:',
      String(report.totalHours)
    ),
    docxTwoPairs(
      'G  CLASSIFICATION OF PARTICIPANTS:',
      report.participantClassification,
      'NO.',
      String(report.participantCount)
    ),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: 'H  FEES:', bold: true, size: 18 })] }),
    docxLabelValue('1. Amount Collected Per Participant', report.feePerParticipant),
    docxLabelValue('2. Amount Collected in Training Reserves', report.feeCollectedReserves),
    docxLabelValue('3. Amount Remitted and Enclosed', report.feeRemitted),
    spacer(),
    ...docxRoleBlock('I  TRAINING TEAM:', teamRoles),
    spacer(),
    ...docxRoleBlock('J  STAFF:', staffRoles),
    spacer(),
    ...docxBullets('K  OBSERVATIONS/RECOMMENDATIONS/SUGGESTIONS', report.observations),
    spacer()
  ]

  if (report.participants.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'L  ENCLOSED LIST OF PARTICIPANTS', bold: true, size: 18 })]
      }),
      spacer()
    )
  }

  children.push(
    docxTwoPairs(
      'Date:',
      formatLongDate(report.submittedDate).toUpperCase(),
      'Submitted By:',
      (report.submittedByName || '—').toUpperCase()
    ),
    docxLabelValue('Designation:', report.submittedByDesignation)
  )

  if (report.participants.length > 0) {
    children.push(
      new Paragraph({ text: '', pageBreakBefore: true }),
      ...(await headerParagraphs([
        { text: orgHeader.orgName, bold: true },
        { text: orgHeader.region },
        { text: orgHeader.council },
        { text: report.title.toUpperCase(), bold: true, size: 22 },
        { text: `${dateRangeLabel(report)}  |  ${report.place}` }
      ])),
      spacer(),
      buildTable(
        ['NO.', 'NAME', 'SCHOOL', 'Signature'],
        report.participants.map((p, i) => [String(i + 1), p.name, p.school, ''])
      )
    )
  }

  await saveDocx(children, `${fileBase(report)}.docx`)
}

import ExcelJS from 'exceljs'
import autoTable from 'jspdf-autotable'
import type { jsPDF } from 'jspdf'
import { orgHeader } from '@/shared/data/signatories.data'
import { createPdf, addHeaderLines, savePdf } from '@/shared/lib/pdfExport'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { Paragraph, TextRun, type Table } from 'docx'
import { PROGRAM_MONTHS, type Goal, type GoalObjective } from '../types/goals.types'

/**
 * Mirrors the council's official "Goals & Objectives" tracker: one continuous
 * sheet/table with every Goal's objectives listed under a section header row,
 * a column per program month (Jul–Jun) showing the CUMULATIVE achieved total
 * as of that month's end, and a trailing % column — not a single "achieved
 * to date" snapshot like the old per-goal summary export.
 */

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

function monthYearLabel(index: number, programYear: string): string {
  const startYear = Number(programYear.split('-')[0]) || new Date().getFullYear()
  const year = index < 6 ? startYear : startYear + 1
  return `${PROGRAM_MONTHS[index]} ${year}`
}

function formatValue(value: number, unit?: GoalObjective['unit']): string {
  if (!Number.isFinite(value)) return '—'
  if (unit === 'percent') return `${value}%`
  return value.toLocaleString()
}

/** 12 cumulative totals (index 0 = Jul) built by running-summing monthlyAchieved.
 *  Auto-sourced objectives (e.g. live NES sales) have no historical monthly
 *  breakdown, so only the current "as of" month carries a value. */
function cumulativeSeries(
  o: GoalObjective,
  achievedFor: (o: GoalObjective) => number,
  currentMonthIndex: number
): number[] {
  if (o.autoSource) {
    return PROGRAM_MONTHS.map((_, i) => (i <= currentMonthIndex ? achievedFor(o) : NaN))
  }
  let running = 0
  return o.monthlyAchieved.map((v) => (running += v))
}

function objectiveRow(
  o: GoalObjective,
  achievedFor: (o: GoalObjective) => number,
  currentMonthIndex: number
): (string | number)[] {
  const series = cumulativeSeries(o, achievedFor, currentMonthIndex)
  const lastValid = [...series].reverse().find((v) => Number.isFinite(v)) ?? 0
  const pct = o.annualTarget > 0 ? (lastValid / o.annualTarget) * 100 : 0
  return [
    o.code,
    o.label,
    formatValue(o.annualTarget, o.unit),
    ...series.map((v) => formatValue(v, o.unit)),
    `${pct.toFixed(1)}%`
  ]
}

export async function exportGoalsExcel(
  goals: Goal[],
  achievedFor: (o: GoalObjective) => number,
  programYear: string,
  currentMonthIndex: number
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Goals & Objectives'.slice(0, 31))
  sheet.columns = [
    { width: 10 },
    { width: 45 },
    { width: 14 },
    ...PROGRAM_MONTHS.map(() => ({ width: 12 })),
    { width: 10 }
  ]
  await addWorksheetLogo(wb, sheet)

  const totalCols = 3 + PROGRAM_MONTHS.length + 1
  const lines = [
    orgHeader.orgName,
    orgHeader.region,
    orgHeader.council,
    `${programYear} GOALS & OBJECTIVES`,
    `As of ${monthYearLabel(currentMonthIndex, programYear)}`
  ]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, totalCols)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 3 }
  })

  const headerRowIdx = lines.length + 2
  const headers = [
    'Code',
    'Objective',
    'Annual Target',
    ...PROGRAM_MONTHS.map((_, i) => monthYearLabel(i, programYear)),
    '% Achieved'
  ]
  const headerRow = sheet.getRow(headerRowIdx)
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }
    cell.alignment = { horizontal: 'center' }
  })

  let r = headerRowIdx + 1
  for (const goal of goals) {
    sheet.mergeCells(r, 1, r, totalCols)
    const goalCell = sheet.getCell(r, 1)
    goalCell.value = `GOAL ${goal.code}: ${goal.title.toUpperCase()}`
    goalCell.font = { bold: true }
    goalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5F9F0' } }
    r++
    for (const o of goal.objectives) {
      const row = objectiveRow(o, achievedFor, currentMonthIndex)
      row.forEach((val, i) => {
        sheet.getCell(r, i + 1).value = val
      })
      r++
    }
  }

  downloadWorkbook(wb, `Goals_and_Objectives_${programYear.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

interface AutoTableDoc extends jsPDF {
  lastAutoTable: { finalY: number }
}

function drawGoalsTable(
  doc: jsPDF,
  startY: number,
  head: string[][],
  body: (string | number)[][]
): number {
  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 3,
      valign: 'middle',
      lineColor: [220, 220, 230],
      lineWidth: 0.5
    },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: { 1: { cellWidth: 130 } },
    margin: { left: 24, right: 24 }
  })
  return (doc as unknown as AutoTableDoc).lastAutoTable.finalY
}

export async function buildGoalsPdfDoc(
  goals: Goal[],
  achievedFor: (o: GoalObjective) => number,
  programYear: string,
  currentMonthIndex: number
): Promise<jsPDF> {
  const doc = createPdf('landscape')
  const monthHeaders = PROGRAM_MONTHS.map((_, i) => monthYearLabel(i, programYear))
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: `${programYear} GOALS & OBJECTIVES`, bold: true, size: 12 },
    { text: `As of ${monthYearLabel(currentMonthIndex, programYear)}` }
  ])

  for (const goal of goals) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.text(`GOAL ${goal.code}: ${goal.title.toUpperCase()}`, 24, y + 10)
    y += 16
    y =
      drawGoalsTable(
        doc,
        y,
        [['Code', 'Objective', 'Target', ...monthHeaders, '%']],
        goal.objectives.map((o) => objectiveRow(o, achievedFor, currentMonthIndex))
      ) + 14
  }

  return doc
}

export async function exportGoalsPdf(
  goals: Goal[],
  achievedFor: (o: GoalObjective) => number,
  programYear: string,
  currentMonthIndex: number
) {
  const doc = await buildGoalsPdfDoc(goals, achievedFor, programYear, currentMonthIndex)
  savePdf(doc, `Goals_and_Objectives_${programYear.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportGoalsDocx(
  goals: Goal[],
  achievedFor: (o: GoalObjective) => number,
  programYear: string,
  currentMonthIndex: number
) {
  const monthHeaders = PROGRAM_MONTHS.map((_, i) => monthYearLabel(i, programYear))
  const children: (Paragraph | Table)[] = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: `${programYear} GOALS & OBJECTIVES`, bold: true, size: 24 },
      { text: `As of ${monthYearLabel(currentMonthIndex, programYear)}` }
    ])),
    spacer()
  ]

  for (const goal of goals) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `GOAL ${goal.code}: ${goal.title.toUpperCase()}`, bold: true })
        ],
        spacing: { after: 80 }
      }),
      buildTable(
        ['Code', 'Objective', 'Target', ...monthHeaders, '%'],
        goal.objectives.map((o) => objectiveRow(o, achievedFor, currentMonthIndex))
      ),
      spacer()
    )
  }

  await saveDocx(
    children,
    `Goals_and_Objectives_${programYear.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

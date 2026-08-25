import ExcelJS from 'exceljs'
import { orgHeader } from '@/shared/data/signatories.data'
import { createPdf, addHeaderLines, addTable, savePdf } from '@/shared/lib/pdfExport'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import type { Paragraph, Table } from 'docx'
import type { Goal } from '../types/goals.types'

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

function goalRows(goal: Goal, achievedFor: (objectiveId: string) => number): (string | number)[][] {
  return goal.objectives.map((o) => {
    const achieved = achievedFor(o.id)
    const pct = o.annualTarget > 0 ? (achieved / o.annualTarget) * 100 : 0
    return [
      o.code,
      o.label,
      o.annualTarget.toLocaleString(),
      achieved.toLocaleString(),
      `${pct.toFixed(1)}%`
    ]
  })
}

export async function exportGoalsExcel(
  goals: Goal[],
  achievedFor: (objectiveId: string) => number,
  programYear: string
) {
  const wb = new ExcelJS.Workbook()

  for (const goal of goals) {
    const sheet = wb.addWorksheet(`Goal ${goal.code}`.slice(0, 31))
    sheet.columns = [{ width: 10 }, { width: 55 }, { width: 16 }, { width: 16 }, { width: 12 }]
    await addWorksheetLogo(wb, sheet)

    const lines = [
      orgHeader.orgName,
      orgHeader.council,
      `GOAL ${goal.code} — ${goal.title.toUpperCase()}`,
      `Program Year ${programYear}`
    ]
    lines.forEach((line, i) => {
      sheet.mergeCells(i + 1, 1, i + 1, 5)
      const cell = sheet.getCell(i + 1, 1)
      cell.value = line
      cell.alignment = { horizontal: 'center' }
      cell.font = { bold: i >= 2 }
    })

    const headerRow = 6
    ;['Code', 'Objective', 'Annual Target', 'Achieved', '% Achieved'].forEach((label, i) => {
      const cell = sheet.getCell(headerRow, i + 1)
      cell.value = label
      cell.font = { bold: true }
    })

    let r = headerRow + 1
    for (const row of goalRows(goal, achievedFor)) {
      row.forEach((val, i) => {
        sheet.getCell(r, i + 1).value = val
      })
      r++
    }
  }

  downloadWorkbook(wb, `Goals_and_Objectives_${programYear.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function exportGoalsPdf(
  goals: Goal[],
  achievedFor: (objectiveId: string) => number,
  programYear: string
) {
  const doc = createPdf('portrait')
  let firstPage = true

  for (const goal of goals) {
    if (!firstPage) doc.addPage()
    firstPage = false

    const y = await addHeaderLines(doc, [
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: `GOAL ${goal.code} — ${goal.title.toUpperCase()}`, bold: true, size: 12 },
      { text: `Program Year ${programYear}` }
    ])
    addTable(doc, {
      startY: y,
      head: [['Code', 'Objective', 'Annual Target', 'Achieved', '% Achieved']],
      body: goalRows(goal, achievedFor),
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    })
  }

  savePdf(doc, `Goals_and_Objectives_${programYear.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportGoalsDocx(
  goals: Goal[],
  achievedFor: (objectiveId: string) => number,
  programYear: string
) {
  const children: (Paragraph | Table)[] = []
  for (const goal of goals) {
    children.push(
      ...(await headerParagraphs([
        { text: orgHeader.orgName, bold: true },
        { text: orgHeader.council },
        { text: `GOAL ${goal.code} — ${goal.title.toUpperCase()}`, bold: true, size: 24 },
        { text: `Program Year ${programYear}` }
      ])),
      spacer(),
      buildTable(
        ['Code', 'Objective', 'Annual Target', 'Achieved', '% Achieved'],
        goalRows(goal, achievedFor)
      ),
      spacer()
    )
  }
  await saveDocx(children, `Goals_and_Objectives_${programYear.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

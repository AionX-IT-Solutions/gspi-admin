import ExcelJS from 'exceljs'
import { signatories, orgHeader } from '@/shared/data/signatories.data'
import type { Employee, PayrollEntry } from '../types/hr.types'
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

// Matches the Council's actual "Payroll / Salary Distribution" (SD) sheet —
// acknowledgement-receipt style payroll register signed by each employee.
export async function exportPayrollRegister(
  entries: (PayrollEntry & { employee?: Employee })[],
  periodLabel: string
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Payroll')
  await addWorksheetLogo(wb, sheet)
  sheet.columns = [
    { width: 26 },
    { width: 22 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 16 }
  ]

  const headerLines = [
    orgHeader.orgName,
    orgHeader.council,
    'PAYROLL',
    `For the Period of ${periodLabel}`
  ]
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 14)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2, size: i === 2 ? 13 : 11 }
  })

  sheet.mergeCells('B6:N7')
  sheet.getCell('B6').value =
    `We acknowledge to have received from the Girl Scouts of the Philippines, ${orgHeader.council.toUpperCase()} the sum herein specified opposite our respective names, in full compensation for our services for the period stated.`
  sheet.getCell('B6').alignment = { wrapText: true }

  const headerRow = 10
  const cols = [
    'NAME',
    'DESIGNATION',
    'STATUS',
    'MONTHLY SALARY',
    'SEMI-MONTHLY SALARY',
    'COLA',
    'REPRESENTATION',
    'TOTAL EARNED FOR PERIOD',
    'SSS PREMIUM',
    'PAG-IBIG',
    'PHILHEALTH',
    'UNPAID LEAVE DEDUCTION',
    'NET AMOUNT RECEIVED',
    'SIGNATURE'
  ]
  cols.forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 1)
    cell.value = label
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center', wrapText: true }
  })

  let r = headerRow + 1
  let totalMonthly = 0,
    totalSemi = 0,
    totalCola = 0,
    totalRepresentation = 0,
    totalEarned = 0
  let totalSss = 0,
    totalPagibig = 0,
    totalPhilhealth = 0,
    totalUnpaid = 0,
    totalNet = 0

  for (const entry of entries) {
    const monthly = entry.employee?.salary ?? entry.basicSalary
    const totalEarnedForPeriod =
      entry.basicSalary + entry.cola + entry.representation + entry.overtimePay
    sheet.getCell(r, 1).value = entry.employee?.fullName ?? entry.employeeId
    sheet.getCell(r, 2).value = entry.employee?.position ?? ''
    sheet.getCell(r, 3).value = 'Permanent'
    sheet.getCell(r, 4).value = monthly
    sheet.getCell(r, 5).value = entry.basicSalary
    sheet.getCell(r, 6).value = entry.cola
    sheet.getCell(r, 7).value = entry.representation
    sheet.getCell(r, 8).value = totalEarnedForPeriod
    sheet.getCell(r, 9).value = entry.sss
    sheet.getCell(r, 10).value = entry.pagibig
    sheet.getCell(r, 11).value = entry.philhealth
    sheet.getCell(r, 12).value = entry.unpaidLeaveDeduction
    sheet.getCell(r, 13).value = entry.netSalary
    for (let c = 4; c <= 13; c++) sheet.getCell(r, c).numFmt = '#,##0.00'

    totalMonthly += monthly
    totalSemi += entry.basicSalary
    totalCola += entry.cola
    totalRepresentation += entry.representation
    totalEarned += totalEarnedForPeriod
    totalSss += entry.sss
    totalPagibig += entry.pagibig
    totalPhilhealth += entry.philhealth
    totalUnpaid += entry.unpaidLeaveDeduction
    totalNet += entry.netSalary
    r++
  }

  sheet.getCell(r, 3).value = 'TOTAL'
  sheet.getCell(r, 3).font = { bold: true }
  const totals = [
    totalMonthly,
    totalSemi,
    totalCola,
    totalRepresentation,
    totalEarned,
    totalSss,
    totalPagibig,
    totalPhilhealth,
    totalUnpaid,
    totalNet
  ]
  totals.forEach((val, i) => {
    const cell = sheet.getCell(r, 4 + i)
    cell.value = val
    cell.numFmt = '#,##0.00'
    cell.font = { bold: true }
  })

  r += 4
  sheet.getCell(r, 2).value = 'PREPARED BY:'
  sheet.getCell(r, 9).value = 'APPROVED:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 9).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 9).value = 'Council President'

  downloadWorkbook(wb, `Payroll_Register_${periodLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

const payrollCols = [
  'NAME',
  'DESIGNATION',
  'STATUS',
  'MONTHLY',
  'SEMI-MONTHLY',
  'COLA',
  'REPRESENTATION',
  'TOTAL EARNED',
  'SSS',
  'PAG-IBIG',
  'PHILHEALTH',
  'UNPAID LEAVE',
  'NET AMOUNT'
]

function payrollRows(entries: (PayrollEntry & { employee?: Employee })[]) {
  const totals = {
    monthly: 0,
    semi: 0,
    cola: 0,
    representation: 0,
    earned: 0,
    sss: 0,
    pagibig: 0,
    philhealth: 0,
    unpaid: 0,
    net: 0
  }
  const rows: (string | number)[][] = entries.map((entry) => {
    const monthly = entry.employee?.salary ?? entry.basicSalary
    const totalEarnedForPeriod =
      entry.basicSalary + entry.cola + entry.representation + entry.overtimePay
    totals.monthly += monthly
    totals.semi += entry.basicSalary
    totals.cola += entry.cola
    totals.representation += entry.representation
    totals.earned += totalEarnedForPeriod
    totals.sss += entry.sss
    totals.pagibig += entry.pagibig
    totals.philhealth += entry.philhealth
    totals.unpaid += entry.unpaidLeaveDeduction
    totals.net += entry.netSalary
    return [
      entry.employee?.fullName ?? entry.employeeId,
      entry.employee?.position ?? '',
      'Permanent',
      monthly.toFixed(2),
      entry.basicSalary.toFixed(2),
      entry.cola.toFixed(2),
      entry.representation.toFixed(2),
      totalEarnedForPeriod.toFixed(2),
      entry.sss.toFixed(2),
      entry.pagibig.toFixed(2),
      entry.philhealth.toFixed(2),
      entry.unpaidLeaveDeduction.toFixed(2),
      entry.netSalary.toFixed(2)
    ]
  })
  const totalsRow = [
    '',
    '',
    'TOTAL',
    totals.monthly.toFixed(2),
    totals.semi.toFixed(2),
    totals.cola.toFixed(2),
    totals.representation.toFixed(2),
    totals.earned.toFixed(2),
    totals.sss.toFixed(2),
    totals.pagibig.toFixed(2),
    totals.philhealth.toFixed(2),
    totals.unpaid.toFixed(2),
    totals.net.toFixed(2)
  ]
  return { rows, totalsRow }
}

export async function exportPayrollRegisterPdf(
  entries: (PayrollEntry & { employee?: Employee })[],
  periodLabel: string
) {
  const { rows, totalsRow } = payrollRows(entries)
  const doc = createPdf('landscape')
  const acknowledgement = `We acknowledge to have received from the Girl Scouts of the Philippines, ${orgHeader.council.toUpperCase()} the sum herein specified opposite our respective names, in full compensation for our services for the period stated.`
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: 'PAYROLL', bold: true, size: 12 },
    { text: `For the Period of ${periodLabel}` }
  ])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const wrapped = doc.splitTextToSize(acknowledgement, doc.internal.pageSize.getWidth() - 60)
  doc.text(wrapped, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' })
  y += wrapped.length * 10 + 10

  y = addTable(doc, {
    startY: y,
    head: [payrollCols],
    body: rows,
    foot: totalsRow,
    columnStyles: Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [i + 3, { halign: 'right' as const }])
    )
  })
  addSignatories(doc, y, [
    {
      label: 'Prepared by:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    {
      label: 'Approved:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ])
  savePdf(doc, `Payroll_Register_${periodLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportPayrollRegisterDocx(
  entries: (PayrollEntry & { employee?: Employee })[],
  periodLabel: string
) {
  const { rows, totalsRow } = payrollRows(entries)
  const acknowledgement = `We acknowledge to have received from the Girl Scouts of the Philippines, ${orgHeader.council.toUpperCase()} the sum herein specified opposite our respective names, in full compensation for our services for the period stated.`
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'PAYROLL', bold: true, size: 24 },
      { text: `For the Period of ${periodLabel}` }
    ])),
    ...(await headerParagraphs([{ text: acknowledgement, size: 16 }])),
    spacer(),
    buildTable(payrollCols, rows, totalsRow),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'Prepared by:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      },
      {
        label: 'Approved:',
        name: signatories.councilPresident.toUpperCase(),
        role: 'Council President'
      }
    ])
  ]
  await saveDocx(children, `Payroll_Register_${periodLabel.replace(/[^0-9a-z]/gi, '_')}.docx`, true)
}

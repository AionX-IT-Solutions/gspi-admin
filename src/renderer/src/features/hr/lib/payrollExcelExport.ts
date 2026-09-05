import ExcelJS from 'exceljs'
import { signatories, orgHeader } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
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

/** A payroll entry annotated with the display fields usePayroll's rows already carry —
 *  avoids a separate Employee lookup just to print a payslip's name/position. */
type PayslipEntry = PayrollEntry & { employeeName: string; position: string }

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
  sheet.columns = [
    { width: 26 },
    { width: 22 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 14 },
    { width: 16 }
  ]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 16 })

  const headerLines = [
    orgHeader.orgName,
    orgHeader.council,
    'PAYROLL',
    `For the Period of ${periodLabel}`
  ]
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 16)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2, size: i === 2 ? 13 : 11 }
  })

  sheet.mergeCells('B6:P7')
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
    '13TH MONTH PAY',
    'CASH GIFT',
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
    totalThirteenth = 0,
    totalCashGift = 0,
    totalEarned = 0
  let totalSss = 0,
    totalPagibig = 0,
    totalPhilhealth = 0,
    totalUnpaid = 0,
    totalNet = 0

  for (const entry of entries) {
    const monthly = entry.employee?.salary ?? entry.basicSalary
    const thirteenthMonthPay = entry.thirteenthMonthPay ?? 0
    const cashGift = entry.cashGift ?? 0
    const totalEarnedForPeriod =
      entry.basicSalary +
      entry.cola +
      entry.representation +
      entry.overtimePay +
      thirteenthMonthPay +
      cashGift
    sheet.getCell(r, 1).value = entry.employee?.fullName ?? entry.employeeId
    sheet.getCell(r, 2).value = entry.employee?.position ?? ''
    sheet.getCell(r, 3).value = 'Permanent'
    sheet.getCell(r, 4).value = monthly
    sheet.getCell(r, 5).value = entry.basicSalary
    sheet.getCell(r, 6).value = entry.cola
    sheet.getCell(r, 7).value = entry.representation
    sheet.getCell(r, 8).value = thirteenthMonthPay
    sheet.getCell(r, 9).value = cashGift
    sheet.getCell(r, 10).value = totalEarnedForPeriod
    sheet.getCell(r, 11).value = entry.sss
    sheet.getCell(r, 12).value = entry.pagibig
    sheet.getCell(r, 13).value = entry.philhealth
    sheet.getCell(r, 14).value = entry.unpaidLeaveDeduction
    sheet.getCell(r, 15).value = entry.netSalary
    for (let c = 4; c <= 15; c++) sheet.getCell(r, c).numFmt = '#,##0.00'

    totalMonthly += monthly
    totalSemi += entry.basicSalary
    totalCola += entry.cola
    totalRepresentation += entry.representation
    totalThirteenth += thirteenthMonthPay
    totalCashGift += cashGift
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
    totalThirteenth,
    totalCashGift,
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
  sheet.getCell(r, 7).value = 'CERTIFIED CORRECT:'
  sheet.getCell(r, 12).value = 'APPROVED:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 7).value = signatories.councilExecutive.toUpperCase()
  sheet.getCell(r, 12).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 7).value = 'Council Executive'
  sheet.getCell(r, 12).value = 'Council President'

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
  '13TH MONTH',
  'CASH GIFT',
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
    thirteenth: 0,
    cashGift: 0,
    earned: 0,
    sss: 0,
    pagibig: 0,
    philhealth: 0,
    unpaid: 0,
    net: 0
  }
  const rows: (string | number)[][] = entries.map((entry) => {
    const monthly = entry.employee?.salary ?? entry.basicSalary
    const thirteenthMonthPay = entry.thirteenthMonthPay ?? 0
    const cashGift = entry.cashGift ?? 0
    const totalEarnedForPeriod =
      entry.basicSalary +
      entry.cola +
      entry.representation +
      entry.overtimePay +
      thirteenthMonthPay +
      cashGift
    totals.monthly += monthly
    totals.semi += entry.basicSalary
    totals.cola += entry.cola
    totals.representation += entry.representation
    totals.thirteenth += thirteenthMonthPay
    totals.cashGift += cashGift
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
      thirteenthMonthPay.toFixed(2),
      cashGift.toFixed(2),
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
    totals.thirteenth.toFixed(2),
    totals.cashGift.toFixed(2),
    totals.earned.toFixed(2),
    totals.sss.toFixed(2),
    totals.pagibig.toFixed(2),
    totals.philhealth.toFixed(2),
    totals.unpaid.toFixed(2),
    totals.net.toFixed(2)
  ]
  return { rows, totalsRow }
}

export async function buildPayrollRegisterPdfDoc(
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
    foot: [totalsRow],
    columnStyles: Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i + 3, { halign: 'right' as const }])
    )
  })
  addSignatories(doc, y, [
    {
      label: 'Prepared by:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    {
      label: 'Certified Correct:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    },
    {
      label: 'Approved:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ])
  return doc
}

export async function exportPayrollRegisterPdf(
  entries: (PayrollEntry & { employee?: Employee })[],
  periodLabel: string
) {
  const doc = await buildPayrollRegisterPdfDoc(entries, periodLabel)
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
        label: 'Certified Correct:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
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

function payslipLineItems(entry: PayslipEntry) {
  const thirteenthMonthPay = entry.thirteenthMonthPay ?? 0
  const cashGift = entry.cashGift ?? 0
  const grossPay =
    entry.basicSalary +
    entry.cola +
    entry.representation +
    entry.overtimePay +
    thirteenthMonthPay +
    cashGift
  return [
    { label: 'Basic Pay (Daily Rate × Days Worked)', value: entry.basicSalary },
    { label: 'COLA', value: entry.cola },
    { label: 'Representation', value: entry.representation },
    { label: 'Overtime Pay', value: entry.overtimePay },
    // Only shown on the November/December payslip that actually carries them.
    ...(thirteenthMonthPay ? [{ label: '13th Month Pay', value: thirteenthMonthPay }] : []),
    ...(cashGift ? [{ label: 'Cash Gift', value: cashGift }] : []),
    { label: 'Gross Pay', value: grossPay },
    { label: 'Less: SSS', value: entry.sss },
    { label: 'Less: PhilHealth', value: entry.philhealth },
    { label: 'Less: Pag-IBIG', value: entry.pagibig },
    { label: 'Less: Withholding Tax', value: entry.taxDeducted },
    { label: 'Less: Unpaid Leave Deduction', value: entry.unpaidLeaveDeduction },
    { label: 'Total Deductions', value: entry.deductions }
  ]
}

function payslipHeaderLines(entry: PayslipEntry, periodLabel: string) {
  return [
    orgHeader.orgName,
    orgHeader.council,
    'PAYSLIP',
    `${entry.employeeName} — ${entry.position}`,
    `Payroll #${entry.payrollNumber}  •  ${periodLabel}`
  ]
}

function payslipFilename(entry: PayslipEntry, ext: string) {
  return `Payslip_${entry.employeeName.replace(/[^0-9a-z]/gi, '_')}_${entry.payrollNumber}.${ext}`
}

// Individual acknowledgement slip for a single payroll entry — same figures as
// one row of the Payroll Register, broken out per employee for handing out or
// filing separately.
export async function exportPayslip(entry: PayslipEntry) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Payslip')
  sheet.columns = [{ width: 4 }, { width: 32 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 3 })

  const periodLabel = `${formatDate(entry.periodStart)} – ${formatDate(entry.periodEnd)}`
  const headerLines = payslipHeaderLines(entry, periodLabel)
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 3)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2, size: i === 2 ? 13 : 11 }
  })

  let r = 8
  for (const item of payslipLineItems(entry)) {
    sheet.getCell(r, 2).value = item.label
    sheet.getCell(r, 3).value = item.value
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  r++
  sheet.getCell(r, 2).value = 'Net Pay'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = entry.netSalary
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }

  r += 3
  sheet.getCell(r, 2).value = 'Prepared by:'
  sheet.getCell(r, 3).value = 'Received by:'
  r += 2
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 3).value = entry.employeeName.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 3).value = entry.position

  downloadWorkbook(wb, payslipFilename(entry, 'xlsx'))
}

export async function buildPayslipPdfDoc(entry: PayslipEntry) {
  const periodLabel = `${formatDate(entry.periodStart)} – ${formatDate(entry.periodEnd)}`
  const doc = createPdf('portrait')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: 'PAYSLIP', bold: true, size: 12 },
    { text: `${entry.employeeName} — ${entry.position}` },
    { text: `Payroll #${entry.payrollNumber}  •  ${periodLabel}` }
  ])
  const tableEndY = addTable(doc, {
    startY: y,
    head: [],
    body: payslipLineItems(entry).map((item) => [item.label, item.value.toFixed(2)]),
    foot: [['Net Pay', entry.netSalary.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  addSignatories(doc, tableEndY, [
    {
      label: 'Prepared by:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    { label: 'Received by:', name: entry.employeeName.toUpperCase(), role: entry.position }
  ])
  return doc
}

export async function exportPayslipPdf(entry: PayslipEntry) {
  const doc = await buildPayslipPdfDoc(entry)
  savePdf(doc, payslipFilename(entry, 'pdf'))
}

export async function exportPayslipDocx(entry: PayslipEntry) {
  const periodLabel = `${formatDate(entry.periodStart)} – ${formatDate(entry.periodEnd)}`
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'PAYSLIP', bold: true, size: 24 },
      { text: `${entry.employeeName} — ${entry.position}` },
      { text: `Payroll #${entry.payrollNumber}  •  ${periodLabel}` }
    ])),
    spacer(),
    buildTable(
      [],
      payslipLineItems(entry).map((item) => [item.label, item.value.toFixed(2)]),
      ['Net Pay', entry.netSalary.toFixed(2)]
    ),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'Prepared by:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      },
      { label: 'Received by:', name: entry.employeeName.toUpperCase(), role: entry.position }
    ])
  ]
  await saveDocx(children, payslipFilename(entry, 'docx'))
}

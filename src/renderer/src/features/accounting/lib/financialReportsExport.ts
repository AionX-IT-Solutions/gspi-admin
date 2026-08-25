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

export interface IncomeStatementData {
  periodLabel: string
  incomeRows: [string, number][]
  expenseRows: [string, number][]
  totalIncome: number
  totalExpense: number
  netIncome: number
}

const headerLines = (title: string, periodLabel: string) => [
  { text: orgHeader.orgName, bold: true },
  { text: orgHeader.council },
  { text: title, bold: true, size: 12 },
  { text: periodLabel }
]

export async function exportIncomeStatementExcel(data: IncomeStatementData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Income Statement')
  sheet.columns = [{ width: 4 }, { width: 34 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet)

  const lines = [orgHeader.orgName, orgHeader.council, 'Income Statement', data.periodLabel]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 3)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  let r = 7
  sheet.getCell(r, 2).value = 'Income'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const [account, amount] of data.incomeRows) {
    sheet.getCell(r, 2).value = `   ${account}`
    sheet.getCell(r, 3).value = amount
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Income'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalIncome
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'Expenses'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const [category, amount] of data.expenseRows) {
    sheet.getCell(r, 2).value = `   ${category}`
    sheet.getCell(r, 3).value = amount
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Expenses'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalExpense
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'Net Income'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.netIncome
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 4

  sheet.getCell(r, 2).value = 'Prepared by:'
  sheet.getCell(r, 3).value = 'Certified Correct:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 3).value = signatories.councilExecutive.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 3).value = 'Council Executive'

  downloadWorkbook(wb, `Income_Statement_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

function incomeStatementRows(data: IncomeStatementData): (string | number)[][] {
  return [
    ['Income', ''],
    ...data.incomeRows.map(([account, amount]) => [`   ${account}`, amount.toFixed(2)]),
    ['Total Income', data.totalIncome.toFixed(2)],
    ['Expenses', ''],
    ...data.expenseRows.map(([category, amount]) => [`   ${category}`, amount.toFixed(2)]),
    ['Total Expenses', data.totalExpense.toFixed(2)]
  ]
}

export async function exportIncomeStatementPdf(data: IncomeStatementData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, headerLines('Income Statement', data.periodLabel))
  y = addTable(doc, {
    startY: y,
    head: [],
    body: incomeStatementRows(data),
    foot: [['Net Income', data.netIncome.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
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
    }
  ])
  savePdf(doc, `Income_Statement_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportIncomeStatementDocx(data: IncomeStatementData) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Income Statement', bold: true, size: 24 },
      { text: data.periodLabel }
    ])),
    spacer(),
    buildTable([], incomeStatementRows(data), ['Net Income', data.netIncome.toFixed(2)]),
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
      }
    ])
  ]
  await saveDocx(children, `Income_Statement_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

export interface BalanceSheetData {
  periodLabel: string
  assets: { id: string; name: string; balance: number }[]
  liabilities: { id: string; name: string; balance: number }[]
  equity: { id: string; name: string; balance: number }[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

export async function exportBalanceSheetExcel(data: BalanceSheetData) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Balance Sheet')
  sheet.columns = [{ width: 4 }, { width: 34 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet)

  const lines = [orgHeader.orgName, orgHeader.council, 'Balance Sheet', data.periodLabel]
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 3)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  let r = 7
  sheet.getCell(r, 2).value = 'Assets'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const a of data.assets) {
    sheet.getCell(r, 2).value = `   ${a.name}`
    sheet.getCell(r, 3).value = a.balance
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Assets'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalAssets
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'Liabilities'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const l of data.liabilities) {
    sheet.getCell(r, 2).value = `   ${l.name}`
    sheet.getCell(r, 3).value = l.balance
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Liabilities'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalLiabilities
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 2

  sheet.getCell(r, 2).value = 'Equity'
  sheet.getCell(r, 2).font = { bold: true }
  r++
  for (const e of data.equity) {
    sheet.getCell(r, 2).value = `   ${e.name}`
    sheet.getCell(r, 3).value = e.balance
    sheet.getCell(r, 3).numFmt = '#,##0.00'
    r++
  }
  sheet.getCell(r, 2).value = 'Total Liabilities & Equity'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = data.totalLiabilities + data.totalEquity
  sheet.getCell(r, 3).numFmt = '#,##0.00'
  sheet.getCell(r, 3).font = { bold: true }
  r += 4

  sheet.getCell(r, 2).value = 'Prepared by:'
  sheet.getCell(r, 3).value = 'Certified Correct:'
  r += 3
  sheet.getCell(r, 2).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(r, 3).value = signatories.councilExecutive.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'Accounting Clerk'
  sheet.getCell(r, 3).value = 'Council Executive'

  downloadWorkbook(wb, `Balance_Sheet_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

function balanceSheetRows(data: BalanceSheetData): (string | number)[][] {
  return [
    ['Assets', ''],
    ...data.assets.map((a) => [`   ${a.name}`, a.balance.toFixed(2)]),
    ['Total Assets', data.totalAssets.toFixed(2)],
    ['Liabilities', ''],
    ...data.liabilities.map((l) => [`   ${l.name}`, l.balance.toFixed(2)]),
    ['Total Liabilities', data.totalLiabilities.toFixed(2)],
    ['Equity', ''],
    ...data.equity.map((e) => [`   ${e.name}`, e.balance.toFixed(2)])
  ]
}

export async function exportBalanceSheetPdf(data: BalanceSheetData) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, headerLines('Balance Sheet', data.periodLabel))
  y = addTable(doc, {
    startY: y,
    head: [],
    body: balanceSheetRows(data),
    foot: [['Total Liabilities & Equity', (data.totalLiabilities + data.totalEquity).toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
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
    }
  ])
  savePdf(doc, `Balance_Sheet_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportBalanceSheetDocx(data: BalanceSheetData) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: 'Balance Sheet', bold: true, size: 24 },
      { text: data.periodLabel }
    ])),
    spacer(),
    buildTable([], balanceSheetRows(data), [
      'Total Liabilities & Equity',
      (data.totalLiabilities + data.totalEquity).toFixed(2)
    ]),
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
      }
    ])
  ]
  await saveDocx(children, `Balance_Sheet_${data.periodLabel.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

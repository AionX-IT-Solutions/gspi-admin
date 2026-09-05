import ExcelJS from 'exceljs'
import { orgHeader } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import { createPdf, addHeaderLines, addTable, savePdf } from '@/shared/lib/pdfExport'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
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

function addHeader(sheet: ExcelJS.Worksheet, lines: string[], totalCols: number) {
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, totalCols)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= lines.length - 2, size: i === lines.length - 2 ? 13 : 11 }
  })
}

export interface JournalRow {
  date: string
  name: string
  particulars: string
  reference?: string
  category: string
  bankAccount: string
  amount: number
}

// Pivots a flat list of journal entries into the Council's real wide-ledger
// layout: one column per distinct category actually present in the data, plus
// one column per bank account — each row places its amount under the matching
// category column AND the matching bank column (columns grow/shrink with the
// data instead of a fixed ~20/40-column template that would mostly sit empty).
function journalPivotData(rows: JournalRow[], fixedCols: string[], bankAccountNames: string[]) {
  const categories = Array.from(new Set(rows.map((r) => r.category))).sort()
  const allCols = [...fixedCols, ...categories, ...bankAccountNames]
  const categoryTotals = new Array(categories.length).fill(0)
  const bankTotals = new Array(bankAccountNames.length).fill(0)

  const body: (string | number)[][] = rows.map((row) => {
    const catIdx = categories.indexOf(row.category)
    const bankIdx = bankAccountNames.indexOf(row.bankAccount)
    const catCells = categories.map((_, i) => {
      if (i !== catIdx) return ''
      categoryTotals[i] += row.amount
      return row.amount.toFixed(2)
    })
    const bankCells = bankAccountNames.map((_, i) => {
      if (i !== bankIdx) return ''
      bankTotals[i] += row.amount
      return row.amount.toFixed(2)
    })
    return [
      formatDate(row.date),
      row.name,
      row.particulars,
      row.reference ?? '',
      ...catCells,
      ...bankCells
    ]
  })

  const foot = [
    ...fixedCols.map((_, i) => (i === fixedCols.length - 1 ? 'TOTAL' : '')),
    ...categoryTotals.map((t) => t.toFixed(2)),
    ...bankTotals.map((t) => t.toFixed(2))
  ]

  return { allCols, categories, body, foot }
}

async function writeJournalSheet(
  wb: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  headerLines: string[],
  fixedCols: string[],
  rows: JournalRow[],
  bankAccountNames: string[]
) {
  const { allCols, categories, body, foot } = journalPivotData(rows, fixedCols, bankAccountNames)
  sheet.columns = allCols.map((_, i) => ({ width: i < fixedCols.length ? 20 : 15 }))
  await addWorksheetLogo(wb, sheet)
  addHeader(sheet, headerLines, allCols.length)

  const headerRow = 7
  allCols.forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 1)
    cell.value = label
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center', wrapText: true }
  })

  let r = headerRow + 1
  for (const cells of body) {
    cells.forEach((value, i) => {
      const cell = sheet.getCell(r, i + 1)
      if (i >= fixedCols.length && value !== '') {
        cell.value = parseFloat(value as string)
        cell.numFmt = '#,##0.00'
      } else {
        cell.value = value
      }
    })
    r++
  }

  r++
  foot.forEach((value, i) => {
    const cell = sheet.getCell(r, i + 1)
    if (i >= fixedCols.length && value !== '') {
      cell.value = parseFloat(value as string)
      cell.numFmt = '#,##0.00'
    } else {
      cell.value = value
    }
    cell.font = { bold: true }
  })

  return { allCols, categories }
}

// ─── Cash Receipts Journal — categorized + multi-bank-account column layout ─
export async function exportCashReceiptsJournal(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Cash Receipts')
  await writeJournalSheet(
    wb,
    sheet,
    [
      orgHeader.orgName,
      orgHeader.region,
      orgHeader.council,
      'CASH RECEIPTS',
      `For the Month of ${monthLabel}`
    ],
    ['DATE', 'PAYOR', 'PARTICULARS', 'REF #'],
    rows,
    bankAccountNames
  )
  downloadWorkbook(wb, `Cash_Receipts_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildCashReceiptsJournalPdfDoc(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYOR', 'PARTICULARS', 'REF #'],
    bankAccountNames
  )
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'CASH RECEIPTS', bold: true, size: 12 },
    { text: `For the Month of ${monthLabel}` }
  ])
  addTable(doc, {
    startY: y,
    head: [allCols],
    body,
    foot: [foot],
    columnStyles: Object.fromEntries(
      Array.from({ length: allCols.length - 4 }, (_, i) => [4 + i, { halign: 'right' as const }])
    )
  })
  return doc
}

export async function exportCashReceiptsJournalPdf(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const doc = await buildCashReceiptsJournalPdfDoc(rows, monthLabel, bankAccountNames)
  savePdf(doc, `Cash_Receipts_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportCashReceiptsJournalDocx(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYOR', 'PARTICULARS', 'REF #'],
    bankAccountNames
  )
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'CASH RECEIPTS', bold: true, size: 24 },
      { text: `For the Month of ${monthLabel}` }
    ])),
    spacer(),
    buildTable(allCols, body, foot)
  ]
  await saveDocx(
    children,
    `Cash_Receipts_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

// ─── Cash Disbursement Journal — categorized + multi-bank-account layout ───
export async function exportCashDisbursementJournal(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Cash Disbursements')
  await writeJournalSheet(
    wb,
    sheet,
    [
      orgHeader.orgName,
      orgHeader.region,
      orgHeader.council,
      'CASH DISBURSEMENT',
      `FOR THE MONTH OF ${monthLabel.toUpperCase()}`
    ],
    ['DATE', 'PAYEE', 'EXPLANATION', 'CV #'],
    rows,
    bankAccountNames
  )
  downloadWorkbook(wb, `Cash_Disbursement_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildCashDisbursementJournalPdfDoc(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYEE', 'EXPLANATION', 'CV #'],
    bankAccountNames
  )
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'CASH DISBURSEMENT', bold: true, size: 12 },
    { text: `FOR THE MONTH OF ${monthLabel.toUpperCase()}` }
  ])
  addTable(doc, {
    startY: y,
    head: [allCols],
    body,
    foot: [foot],
    columnStyles: Object.fromEntries(
      Array.from({ length: allCols.length - 4 }, (_, i) => [4 + i, { halign: 'right' as const }])
    )
  })
  return doc
}

export async function exportCashDisbursementJournalPdf(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const doc = await buildCashDisbursementJournalPdfDoc(rows, monthLabel, bankAccountNames)
  savePdf(doc, `Cash_Disbursement_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportCashDisbursementJournalDocx(
  rows: JournalRow[],
  monthLabel: string,
  bankAccountNames: string[]
) {
  const { allCols, body, foot } = journalPivotData(
    rows,
    ['DATE', 'PAYEE', 'EXPLANATION', 'CV #'],
    bankAccountNames
  )
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'CASH DISBURSEMENT', bold: true, size: 24 },
      { text: `FOR THE MONTH OF ${monthLabel.toUpperCase()}` }
    ])),
    spacer(),
    buildTable(allCols, body, foot)
  ]
  await saveDocx(
    children,
    `Cash_Disbursement_Journal_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

// ─── Statement of Cash Receipts & Disbursements (SCRD) — summary ────────────
// Matches the Council's real SCRD format: receipts grouped into I. Operations
// (A. General Operations, B. National Equipment Service), II. Rental Income,
// III. Interest Income, IV. Other Income; disbursements grouped into
// I. Operations (A. Operating Expenses, B. National Equipment Services),
// II. Capital Outlay, III. Other Expenses; plus the "ACCOUNTED FOR AS FOLLOWS"
// cash-by-bank-account reconciliation (General Operations / Retirement Fund /
// Capital Outlay-Building-NES-Transitory Fees, per the real account groupings).
export interface SCRDCategoryTotal {
  category: string
  amount: number
}

export type BankAccountBucket = 'general' | 'retirement' | 'capital'

export const BANK_ACCOUNT_BUCKET: Record<string, BankAccountBucket> = {
  'Cash on Hand': 'general',
  'DBP #00-500128590-5': 'general',
  'Cordillera Bank #8104': 'retirement',
  'Maybank #01-017-00-0197-9': 'capital',
  'DBP #0-50141-590-7': 'capital',
  'PNB #223510036978': 'capital'
}

export interface BankAccountBalance {
  id: string
  account: string
  opening: number
  receipts: number
  disbursements: number
  closing: number
}

export interface SCRDSummaryParams {
  monthLabel: string
  beginningBalance: number
  generalReceiptCategories: SCRDCategoryTotal[]
  nesSalesTotal: number
  rentalIncomeTotal: number
  interestIncome: number
  otherIncomeCategories: SCRDCategoryTotal[]
  generalDisbursementCategories: SCRDCategoryTotal[]
  nesPurchasesTotal: number
  capitalOutlayCategories: SCRDCategoryTotal[]
  otherExpenseCategories: SCRDCategoryTotal[]
  bankAccountBalances: BankAccountBalance[]
}

function sumCategories(categories: SCRDCategoryTotal[]) {
  return categories.reduce((s, c) => s + c.amount, 0)
}

function scrdFigures(params: SCRDSummaryParams) {
  const generalReceipts = sumCategories(params.generalReceiptCategories)
  const operationsReceipts = generalReceipts + params.nesSalesTotal
  const otherIncomeTotal = sumCategories(params.otherIncomeCategories)
  const totalReceipts =
    operationsReceipts + params.rentalIncomeTotal + params.interestIncome + otherIncomeTotal
  const generalDisbursements = sumCategories(params.generalDisbursementCategories)
  const operationsDisbursements = generalDisbursements + params.nesPurchasesTotal
  const capitalOutlayTotal = sumCategories(params.capitalOutlayCategories)
  const otherExpensesTotal = sumCategories(params.otherExpenseCategories)
  const totalDisbursements = operationsDisbursements + capitalOutlayTotal + otherExpensesTotal
  const totalCashAvailable = params.beginningBalance + totalReceipts
  const endingBalance = totalCashAvailable - totalDisbursements
  const bucketTotal = (bucket: BankAccountBucket) =>
    params.bankAccountBalances
      .filter((b) => BANK_ACCOUNT_BUCKET[b.account] === bucket)
      .reduce((s, b) => s + b.closing, 0)
  return {
    generalReceipts,
    operationsReceipts,
    otherIncomeTotal,
    totalReceipts,
    generalDisbursements,
    operationsDisbursements,
    capitalOutlayTotal,
    otherExpensesTotal,
    totalDisbursements,
    totalCashAvailable,
    endingBalance,
    generalBucketTotal: bucketTotal('general'),
    retirementBucketTotal: bucketTotal('retirement'),
    capitalBucketTotal: bucketTotal('capital')
  }
}

function scrdSummaryRows(params: SCRDSummaryParams) {
  const f = scrdFigures(params)
  const generalBanks = params.bankAccountBalances.filter(
    (b) => BANK_ACCOUNT_BUCKET[b.account] === 'general'
  )
  const retirementBanks = params.bankAccountBalances.filter(
    (b) => BANK_ACCOUNT_BUCKET[b.account] === 'retirement'
  )
  const capitalBanks = params.bankAccountBalances.filter(
    (b) => BANK_ACCOUNT_BUCKET[b.account] === 'capital'
  )

  const rows: (string | number)[][] = [
    ['CASH BALANCE AVAILABLE AT THE BEGINNING', params.beginningBalance.toFixed(2)],
    ['ADD: CASH RECEIPTS', ''],
    ['I. Operations', ''],
    ['   A. General Operations', ''],
    ...params.generalReceiptCategories.map((c) => [`      ${c.category}`, c.amount.toFixed(2)]),
    ['      Sub-total', f.generalReceipts.toFixed(2)],
    ['   B. National Equipment Service (NES)', ''],
    ['      Sales: NES Items', params.nesSalesTotal.toFixed(2)],
    ['II. Rental Income', params.rentalIncomeTotal.toFixed(2)],
    ['III. Interest Income', params.interestIncome.toFixed(2)],
    ['IV. Other Income', ''],
    ...params.otherIncomeCategories.map((c) => [`      ${c.category}`, c.amount.toFixed(2)]),
    ['      Sub-total', f.otherIncomeTotal.toFixed(2)],
    ['TOTAL CASH RECEIPTS', f.totalReceipts.toFixed(2)],
    ['TOTAL CASH AVAILABLE', f.totalCashAvailable.toFixed(2)],
    ['LESS: CASH DISBURSEMENTS', ''],
    ['I. Operations', ''],
    ['   A. Operating Expenses', ''],
    ...params.generalDisbursementCategories.map((c) => [
      `      ${c.category}`,
      c.amount.toFixed(2)
    ]),
    ['      Sub-total', f.generalDisbursements.toFixed(2)],
    ['   B. National Equipment Services', ''],
    ['      Purchases', params.nesPurchasesTotal.toFixed(2)],
    ['II. Capital Outlay', ''],
    ...params.capitalOutlayCategories.map((c) => [`      ${c.category}`, c.amount.toFixed(2)]),
    ['      Sub-total', f.capitalOutlayTotal.toFixed(2)],
    ['III. Other Expenses', ''],
    ...params.otherExpenseCategories.map((c) => [`      ${c.category}`, c.amount.toFixed(2)]),
    ['      Sub-total', f.otherExpensesTotal.toFixed(2)],
    ['TOTAL CASH DISBURSEMENTS', f.totalDisbursements.toFixed(2)],
    ['TOTAL CASH BALANCE', f.endingBalance.toFixed(2)],
    ['', ''],
    ['ACCOUNTED FOR AS FOLLOWS:', ''],
    ['I. Operations', ''],
    ['   A. General Operations', ''],
    ...generalBanks.map((b) => [`      ${b.account}`, b.closing.toFixed(2)]),
    ['      Sub-total', f.generalBucketTotal.toFixed(2)],
    ['   B. Retirement Fund', ''],
    ...retirementBanks.map((b) => [`      ${b.account}`, b.closing.toFixed(2)]),
    ['      Sub-total', f.retirementBucketTotal.toFixed(2)],
    ['II. Capital Outlay', ''],
    ['   A. Building/NES/Transitory Fees', ''],
    ...capitalBanks.map((b) => [`      ${b.account}`, b.closing.toFixed(2)]),
    ['      Sub-total', f.capitalBucketTotal.toFixed(2)],
    ['TOTAL CASH BALANCE (ACCOUNTED FOR)', f.endingBalance.toFixed(2)]
  ]
  return { rows, ending: f.endingBalance }
}

export async function exportSCRDSummary(params: SCRDSummaryParams) {
  const { rows } = scrdSummaryRows(params)
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('SCRD')
  sheet.columns = [{ width: 4 }, { width: 4 }, { width: 40 }, { width: 16 }]
  await addWorksheetLogo(wb, sheet)

  addHeader(
    sheet,
    [
      orgHeader.orgName,
      orgHeader.region,
      orgHeader.council,
      'STATEMENT OF CASH RECEIPTS & DISBURSEMENTS',
      `For the Month Ended, ${params.monthLabel}`
    ],
    4
  )

  let r = 7
  for (const [label, amount] of rows) {
    const trimmed = typeof label === 'string' ? label.trim() : ''
    const isHeading =
      /^(I{1,3}\.|IV\.)/.test(trimmed) ||
      trimmed.startsWith('TOTAL') ||
      trimmed.startsWith('CASH BALANCE') ||
      trimmed.startsWith('ADD:') ||
      trimmed.startsWith('LESS:') ||
      trimmed.startsWith('ACCOUNTED') ||
      trimmed.includes('Sub-total')
    const col = typeof label === 'string' && label.startsWith('      ') ? 3 : 1
    sheet.getCell(r, col).value = label
    if (isHeading) sheet.getCell(r, col).font = { bold: true }
    if (amount !== '') {
      sheet.getCell(r, 4).value = parseFloat(amount as string)
      sheet.getCell(r, 4).numFmt = '#,##0.00'
      if (isHeading) sheet.getCell(r, 4).font = { bold: true }
    }
    r++
  }

  downloadWorkbook(wb, `SCRD_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildSCRDSummaryPdfDoc(params: SCRDSummaryParams) {
  const { rows } = scrdSummaryRows(params)
  const doc = createPdf('portrait')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    { text: 'STATEMENT OF CASH RECEIPTS & DISBURSEMENTS', bold: true, size: 12 },
    { text: `For the Month Ended, ${params.monthLabel}` }
  ])
  addTable(doc, {
    startY: y,
    head: [],
    body: rows,
    columnStyles: { 1: { halign: 'right' } }
  })
  return doc
}

export async function exportSCRDSummaryPdf(params: SCRDSummaryParams) {
  const doc = await buildSCRDSummaryPdfDoc(params)
  savePdf(doc, `SCRD_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportSCRDSummaryDocx(params: SCRDSummaryParams) {
  const { rows } = scrdSummaryRows(params)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      { text: 'STATEMENT OF CASH RECEIPTS & DISBURSEMENTS', bold: true, size: 24 },
      { text: `For the Month Ended, ${params.monthLabel}` }
    ])),
    spacer(),
    buildTable([], rows)
  ]
  await saveDocx(children, `SCRD_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

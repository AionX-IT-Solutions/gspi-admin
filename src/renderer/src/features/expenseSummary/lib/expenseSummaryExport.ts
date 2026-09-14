import ExcelJS from 'exceljs'
import { signatories, orgHeader } from '@/shared/data/signatories.data'
import { formatDate, formatAmount } from '@/shared/lib/utils'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import {
  createPdf,
  addHeaderLines,
  addTable,
  addSignatories,
  type PdfSignatoryColumn,
  savePdf
} from '@/shared/lib/pdfExport'
import {
  headerParagraphs,
  buildTable,
  signatoryTable,
  spacer,
  saveDocx
} from '@/shared/lib/docxExport'
import type { Voucher } from '@/features/vouchers/types/vouchers.types'
import {
  emptyExpenseSummaryItem,
  expenseSummaryTotal,
  type ExpenseSummaryItem
} from '../types/expenseSummary.types'

// Owed back TO the payee once the actual liquidated expenses (the itemized total below,
// the receipt-level source of truth) exceed the net cash advance (the advance minus
// whatever's already been refunded).
function cashAdvanceReimbursement(voucher: Voucher, itemsTotal: number): number {
  const netAdvance = (voucher.cashAdvanceAmount ?? 0) - (voucher.amountRefunded ?? 0)
  return Math.max(0, itemsTotal - netAdvance)
}

function hasCashAdvance(voucher: Voucher): boolean {
  return voucher.cashAdvanceAmount !== undefined
}

// "2026 - 04 - 203718" -> "203718" — the Council's real Summary of Expenses cites the
// originating Check Voucher by just its trailing sequence number, e.g. "(CV #203718)".
function shortVoucherNumber(voucherNumber: string): string {
  const segments = voucherNumber.split('-')
  return segments[segments.length - 1]?.trim() || voucherNumber
}

function summarySubtitle(voucher: Voucher, relatedVoucherNumber?: string): string {
  return relatedVoucherNumber
    ? `${voucher.particulars} (CV #${shortVoucherNumber(relatedVoucherNumber)})`
    : voucher.particulars
}

function categoryOf(item: ExpenseSummaryItem): string {
  return item.category.trim() || 'Amount'
}

// The Council's real Summary of Expenses gives each spending category its own column
// (e.g. "Meals and Snacks"), rather than a generic Category + Amount pair — one row per
// receipt, one column per category, first-seen order.
function distinctCategories(items: ExpenseSummaryItem[]): string[] {
  const seen = new Set<string>()
  for (const item of items) {
    seen.add(categoryOf(item))
  }
  return seen.size > 0 ? [...seen] : ['Amount']
}

function exportFilename(voucher: Voucher, ext: string): string {
  return `SOE_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.${ext}`
}

const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin' }
const PESO_FMT = '"₱"#,##0.00'

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

function setCell(
  sheet: ExcelJS.Worksheet,
  addr: string,
  value: unknown,
  font: Partial<ExcelJS.Font>,
  center = false
) {
  const cell = sheet.getCell(addr)
  cell.value = value as ExcelJS.CellValue
  cell.font = font
  if (center) cell.alignment = { horizontal: 'center' }
}

// Every populated cell defaults to Excel's Calibri unless told otherwise — the Council's
// real form is typed in Arial throughout, so this pass (run once, right before download)
// applies it everywhere without touching every individual font assignment.
function applyArialFont(sheet: ExcelJS.Worksheet) {
  sheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { size: 10, ...cell.font, name: 'Arial' }
    })
  })
}

function addRowRule(sheet: ExcelJS.Worksheet, row: number, span: number, side: 'top' | 'bottom') {
  for (let c = 1; c <= span; c++) {
    const cell = sheet.getCell(row, c)
    cell.border = { ...cell.border, [side]: THIN_BORDER }
  }
}

// A continuous left/right rule down the whole form plus a closing rule under its very
// last row — the outer box every real Council form is printed inside.
function addOuterBox(sheet: ExcelJS.Worksheet, span: number, lastRow: number) {
  for (let r = 1; r <= lastRow; r++) {
    const left = sheet.getCell(r, 1)
    left.border = { ...left.border, left: THIN_BORDER }
    const right = sheet.getCell(r, span)
    right.border = { ...right.border, right: THIN_BORDER }
  }
  addRowRule(sheet, lastRow, span, 'bottom')
}

function addCenteredHeader(sheet: ExcelJS.Worksheet, title: string, span: number) {
  const lines = [orgHeader.orgName, orgHeader.council, orgHeader.city, title]
  lines.forEach((line, i) => {
    const row = sheet.getRow(i + 1)
    row.getCell(1).value = line
    row.getCell(1).font = i === 3 ? { bold: true, size: 18 } : { bold: i === 0, size: 11 }
    row.getCell(1).alignment = {
      horizontal: 'center',
      vertical: i === 3 ? 'middle' : undefined
    }
    sheet.mergeCells(i + 1, 1, i + 1, span)
  })
  sheet.getRow(4).height = 26
  addRowRule(sheet, 3, span, 'bottom')
  addRowRule(sheet, 4, span, 'top')
  addRowRule(sheet, 4, span, 'bottom')
}

const SIGNATURE_LABEL_FONT = { bold: true, size: 10 }
const SIGNATURE_NAME_FONT = { bold: true, underline: true, size: 9 }
const SIGNATURE_ROLE_FONT = { size: 10 }

// Two-tier signature block (Prepared/Checked, then a single centered Noted By) matching
// the Council's real Summary of Expenses form — narrower than the JV's own three/two-tier
// block since this sheet's own signatories are simpler. `span` adapts to however many
// category columns the sheet ended up with.
function writeSignatureBlock(sheet: ExcelJS.Worksheet, startRow: number, span: number): number {
  let r = startRow
  const secondCol = Math.max(4, span - 1)
  addRowRule(sheet, r, span, 'top')
  const tier1 = signatoryTier1()
  setCell(sheet, `A${r}`, tier1[0].label, SIGNATURE_LABEL_FONT)
  setCell(sheet, sheet.getCell(r, secondCol).address, tier1[1].label, SIGNATURE_LABEL_FONT)
  r += 3
  setCell(sheet, `A${r}`, tier1[0].name, SIGNATURE_NAME_FONT, true)
  setCell(sheet, sheet.getCell(r, secondCol).address, tier1[1].name, SIGNATURE_NAME_FONT, true)
  r++
  setCell(sheet, `A${r}`, tier1[0].role, SIGNATURE_ROLE_FONT, true)
  setCell(sheet, sheet.getCell(r, secondCol).address, tier1[1].role, SIGNATURE_ROLE_FONT, true)

  r += 2
  addRowRule(sheet, r, span, 'top')
  const tier2 = signatoryTier2()
  sheet.mergeCells(r, 1, r, span)
  setCell(sheet, `A${r}`, tier2[0].label, SIGNATURE_LABEL_FONT, true)
  r += 3
  sheet.mergeCells(r, 1, r, span)
  setCell(sheet, `A${r}`, tier2[0].name, SIGNATURE_NAME_FONT, true)
  r++
  sheet.mergeCells(r, 1, r, span)
  setCell(sheet, `A${r}`, tier2[0].role, SIGNATURE_ROLE_FONT, true)
  return r + 2
}

function signatoryTier1(): PdfSignatoryColumn[] {
  return [
    {
      label: 'PREPARED BY:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    {
      label: 'CHECKED BY:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    }
  ]
}

function signatoryTier2(): PdfSignatoryColumn[] {
  return [
    {
      label: 'NOTED BY:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ]
}

// Same pivot as the Excel export: one column per spending category (its name as the
// header) rather than a generic Category + Amount pair, plus a grand-total column once
// there's more than one category to add up.
function tableHead(categories: string[]): string[] {
  return [
    'Date',
    'Particulars',
    'OR No.',
    ...categories,
    ...(categories.length > 1 ? ['Total'] : [])
  ]
}

function tableRows(items: ExpenseSummaryItem[], categories: string[]): (string | number)[][] {
  const rows = items.length > 0 ? items : [emptyExpenseSummaryItem()]
  const hasGrandTotalCol = categories.length > 1
  return rows.map((item) => [
    item.date ? formatDate(item.date) : '',
    item.particulars,
    item.orNumber,
    ...categories.map((c) =>
      categoryOf(item) === c && item.amount ? formatAmount(item.amount) : ''
    ),
    ...(hasGrandTotalCol ? [item.amount ? formatAmount(item.amount) : ''] : [])
  ])
}

function tableFoot(items: ExpenseSummaryItem[], categories: string[]): (string | number)[] {
  const catTotals = categories.map((c) =>
    formatAmount(
      items.filter((i) => categoryOf(i) === c).reduce((sum, i) => sum + (i.amount || 0), 0)
    )
  )
  return [
    '',
    '',
    'TOTAL',
    ...catTotals,
    ...(categories.length > 1 ? [formatAmount(expenseSummaryTotal(items))] : [])
  ]
}

// Right-aligns every category (and grand-total) column — the first three (Date/
// Particulars/OR No.) stay left-aligned by default.
function amountColumnStyles(categories: string[]): Record<number, { halign: 'right' }> {
  const lastIndex = 3 + categories.length - 1 + (categories.length > 1 ? 1 : 0)
  const styles: Record<number, { halign: 'right' }> = {}
  for (let i = 3; i <= lastIndex; i++) styles[i] = { halign: 'right' }
  return styles
}

// The cash-advance recap (amount granted / refunded / still owed) — same figures a JV's
// own cash-advance-liquidation fields carry, shown here instead since the itemized total
// above is the more accurate, receipt-backed source for "amount spent."
function cashAdvanceRecapRows(
  voucher: Voucher,
  items: ExpenseSummaryItem[]
): (string | number)[][] {
  if (!hasCashAdvance(voucher)) return []
  return [
    [
      'AMOUNT OF CASH ADVANCE',
      formatAmount(voucher.cashAdvanceAmount ?? 0),
      'DATED',
      voucher.cashAdvanceDate ? formatDate(voucher.cashAdvanceDate) : ''
    ],
    [
      `AMOUNT REFUNDED${voucher.refundOrNumber ? ` PER OR. NO. ${voucher.refundOrNumber}` : ''}`,
      formatAmount(voucher.amountRefunded ?? 0),
      'DATED',
      voucher.refundDate ? formatDate(voucher.refundDate) : ''
    ],
    [
      'AMOUNT TO BE REIMBURSED',
      formatAmount(cashAdvanceReimbursement(voucher, expenseSummaryTotal(items)))
    ]
  ]
}

// The Council's real backup sheet for a JV's cash-advance liquidation — a standalone
// workbook (not a tab inside the JV's own file) since it's edited and re-exported on its
// own schedule as receipts come in, separate from the JV itself.
export async function exportExpenseSummaryExcel(
  voucher: Voucher,
  items: ExpenseSummaryItem[],
  relatedVoucherNumber?: string
) {
  const rows = items.length > 0 ? items : [emptyExpenseSummaryItem()]
  const categories = distinctCategories(rows)
  const hasGrandTotalCol = categories.length > 1
  const span = 3 + categories.length + (hasGrandTotalCol ? 1 : 0)

  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Summary of Expenses')
  sheet.columns = [
    { width: 12 },
    { width: 34 },
    { width: 18 },
    ...categories.map(() => ({ width: 18 })),
    ...(hasGrandTotalCol ? [{ width: 14 }] : [])
  ]
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet, 'SUMMARY OF EXPENSES', span)

  sheet.mergeCells(6, 1, 7, span)
  const subtitle = sheet.getCell(6, 1)
  subtitle.value = summarySubtitle(voucher, relatedVoucherNumber)
  subtitle.font = { bold: true, italic: true, size: 10 }
  subtitle.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  for (let c = 1; c <= span; c++) {
    const cell = sheet.getCell(6, c)
    cell.border = { ...cell.border, top: THIN_BORDER }
    sheet.getCell(7, c).border = { ...sheet.getCell(7, c).border, bottom: THIN_BORDER }
  }
  sheet.getCell(6, 1).border = { ...sheet.getCell(6, 1).border, left: THIN_BORDER }
  sheet.getCell(7, 1).border = { ...sheet.getCell(7, 1).border, left: THIN_BORDER }
  sheet.getCell(6, span).border = { ...sheet.getCell(6, span).border, right: THIN_BORDER }
  sheet.getCell(7, span).border = { ...sheet.getCell(7, span).border, right: THIN_BORDER }

  const headerRow = 9
  sheet.getRow(headerRow).height = 26
  const headerLabels = [
    'DATE',
    'PARTICULARS',
    'OR NO.',
    ...categories,
    ...(hasGrandTotalCol ? ['TOTAL'] : [])
  ]
  headerLabels.forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 1)
    cell.value = label
    cell.font = { bold: true, size: 11 }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  addRowRule(sheet, headerRow, span, 'top')
  addRowRule(sheet, headerRow, span, 'bottom')

  const firstDataRow = headerRow + 1
  rows.forEach((item, i) => {
    const r = firstDataRow + i
    if (item.date) sheet.getCell(r, 1).value = new Date(item.date)
    sheet.getCell(r, 1).numFmt = 'dd-mmm-yy'
    sheet.getCell(r, 2).value = item.particulars
    sheet.getCell(r, 3).value = item.orNumber
    sheet.getCell(r, 3).alignment = { horizontal: 'center' }
    if (item.amount) {
      const catCol = 4 + categories.indexOf(categoryOf(item))
      const cell = sheet.getCell(r, catCol)
      cell.value = item.amount
      cell.numFmt = '#,##0.00'
      cell.alignment = { horizontal: 'center' }
    }
  })
  const lastDataRow = firstDataRow + rows.length - 1
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    sheet.getCell(r, 1).border = { ...sheet.getCell(r, 1).border, left: THIN_BORDER }
    sheet.getCell(r, span).border = { ...sheet.getCell(r, span).border, right: THIN_BORDER }
  }
  addRowRule(sheet, lastDataRow, span, 'bottom')

  const totalRow = lastDataRow + 1
  sheet.getCell(totalRow, 3).value = 'TOTAL'
  sheet.getCell(totalRow, 3).font = { bold: true, size: 11 }
  sheet.getCell(totalRow, 3).alignment = { horizontal: 'right' }
  categories.forEach((_, i) => {
    const col = 4 + i
    const colLetter = sheet.getColumn(col).letter
    const cell = sheet.getCell(totalRow, col)
    cell.value = { formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})` }
    cell.numFmt = '#,##0.00'
    cell.font = { bold: true, size: 11 }
    cell.alignment = { horizontal: 'center' }
    cell.border = { top: THIN_BORDER, bottom: { style: hasGrandTotalCol ? 'thin' : 'double' } }
  })
  if (hasGrandTotalCol) {
    const cell = sheet.getCell(totalRow, span)
    cell.value = expenseSummaryTotal(items)
    cell.numFmt = '#,##0.00'
    cell.font = { bold: true, size: 11 }
    cell.alignment = { horizontal: 'center' }
    cell.border = { top: THIN_BORDER, bottom: { style: 'double' } }
  }

  let r = totalRow + 2
  if (hasCashAdvance(voucher)) {
    const itemsTotal = expenseSummaryTotal(items)
    sheet.mergeCells(r, 1, r, span - 1)
    setCell(
      sheet,
      sheet.getCell(r, 1).address,
      `AMOUNT OF CASH ADVANCE${voucher.cashAdvanceDate ? ` DATED ${formatDate(voucher.cashAdvanceDate)}` : ''}`,
      { size: 10 }
    )
    setCell(
      sheet,
      sheet.getCell(r, span).address,
      voucher.cashAdvanceAmount ?? 0,
      { bold: true, size: 11 },
      true
    )
    sheet.getCell(r, span).numFmt = PESO_FMT
    r++
    sheet.mergeCells(r, 1, r, span - 1)
    setCell(
      sheet,
      sheet.getCell(r, 1).address,
      `AMOUNT REFUNDED${voucher.refundOrNumber ? ` PER OR. NO. ${voucher.refundOrNumber}` : ''}${voucher.refundDate ? ` DATED ${formatDate(voucher.refundDate)}` : ''}`,
      { size: 10 }
    )
    setCell(
      sheet,
      sheet.getCell(r, span).address,
      voucher.amountRefunded ?? 0,
      { bold: true, size: 11 },
      true
    )
    sheet.getCell(r, span).numFmt = PESO_FMT
    r++
    sheet.mergeCells(r, 1, r, span - 1)
    setCell(sheet, sheet.getCell(r, 1).address, 'AMOUNT TO BE REIMBURSED', { size: 10 })
    setCell(
      sheet,
      sheet.getCell(r, span).address,
      cashAdvanceReimbursement(voucher, itemsTotal),
      { bold: true, size: 11 },
      true
    )
    sheet.getCell(r, span).numFmt = PESO_FMT
    r += 2
  }

  const signatureEndRow = writeSignatureBlock(sheet, r + 1, span)

  applyArialFont(sheet)
  addOuterBox(sheet, span, signatureEndRow - 2)

  downloadWorkbook(wb, exportFilename(voucher, 'xlsx'))
}

export async function buildExpenseSummaryPdfDoc(
  voucher: Voucher,
  items: ExpenseSummaryItem[],
  relatedVoucherNumber?: string
) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'SUMMARY OF EXPENSES', bold: true, size: 12 }
  ])

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 30
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const subtitleLines = doc.splitTextToSize(
    summarySubtitle(voucher, relatedVoucherNumber),
    pageWidth - margin * 2
  ) as string[]
  doc.text(subtitleLines, margin, y)
  y += subtitleLines.length * 12 + 10

  const categories = distinctCategories(items.length > 0 ? items : [emptyExpenseSummaryItem()])
  y = addTable(doc, {
    startY: y,
    head: [tableHead(categories)],
    body: tableRows(items, categories),
    foot: [tableFoot(items, categories)],
    columnStyles: amountColumnStyles(categories)
  })

  const recap = cashAdvanceRecapRows(voucher, items)
  if (recap.length > 0) {
    y = addTable(doc, {
      startY: y + 6,
      head: [],
      body: recap,
      columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } }
    })
  }

  y = addSignatories(doc, y, signatoryTier1())
  addSignatories(doc, y, signatoryTier2())
  return doc
}

export async function exportExpenseSummaryPdf(
  voucher: Voucher,
  items: ExpenseSummaryItem[],
  relatedVoucherNumber?: string
) {
  const doc = await buildExpenseSummaryPdfDoc(voucher, items, relatedVoucherNumber)
  savePdf(doc, exportFilename(voucher, 'pdf'))
}

export async function exportExpenseSummaryDocx(
  voucher: Voucher,
  items: ExpenseSummaryItem[],
  relatedVoucherNumber?: string
) {
  const categories = distinctCategories(items.length > 0 ? items : [emptyExpenseSummaryItem()])
  const recap = cashAdvanceRecapRows(voucher, items)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: 'SUMMARY OF EXPENSES', bold: true, size: 24 },
      { text: summarySubtitle(voucher, relatedVoucherNumber), size: 18 }
    ])),
    spacer(),
    buildTable(tableHead(categories), tableRows(items, categories), tableFoot(items, categories)),
    ...(recap.length > 0 ? [spacer(), buildTable([], recap)] : []),
    spacer(),
    spacer(),
    signatoryTable(signatoryTier1()),
    spacer(),
    signatoryTable(signatoryTier2())
  ]
  await saveDocx(children, exportFilename(voucher, 'docx'))
}

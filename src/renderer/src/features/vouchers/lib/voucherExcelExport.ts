import type { jsPDF } from 'jspdf'
import { Paragraph, TextRun } from 'docx'
import ExcelJS from 'exceljs'
import { signatories, orgHeader } from '@/shared/data/signatories.data'
import { formatDate, formatAmount } from '@/shared/lib/utils'
import { amountToWords } from '@/shared/lib/numberToWords'
import {
  isCashAdvanceDisbursement,
  hasCashAdvance,
  cashAdvanceReimbursement,
  stripCategoryNumbering
} from '../lib/expenseVouchers'
import type { Voucher, VoucherAccountLine } from '../types/vouchers.types'
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
import { addWorksheetLogo } from '@/shared/lib/excelReport'

// The Council's real DV/JV form always carries the same two signature tiers — Prepared/
// Certified/Verified, then Recommending Approval/Approved By — regardless of voucher type.
function signatoryTier1(voucher: Voucher): PdfSignatoryColumn[] {
  return [
    {
      label: 'PREPARED BY:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    {
      label: isCashAdvanceDisbursement(voucher) ? 'REQUESTED BY:' : 'CERTIFIED CORRECT:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    },
    {
      label: 'VERIFIED CORRECT:',
      name: signatories.councilAuditor.toUpperCase(),
      role: 'Council Auditor'
    }
  ]
}

function signatoryTier2(): PdfSignatoryColumn[] {
  return [
    {
      label: 'RECOMMENDING APPROVAL:',
      name: signatories.councilTreasurer.toUpperCase(),
      role: 'Council Treasurer'
    },
    {
      label: 'APPROVED BY:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ]
}

// A Check Voucher that never itemized its credit side falls back to a single implicit
// credit line for `bankAccountRef` worth the full amount — once the credit side IS
// itemized, that fallback would double it, so it only applies in the fallback case.
function hasExplicitCreditLines(voucher: Voucher): boolean {
  return voucher.accountLines.some((l) => l.credit > 0)
}

// "Salary - March 16-31, 2026" — the account title (its Council Budget category's leading
// workbook ordinal stripped, same as NewVoucherModal's own suggestion list — an account
// picked before that stripping existed, or hand-typed with a number, would otherwise still
// print one) with its optional description appended, exactly as it should read on the
// printed voucher.
function accountLabel(line: VoucherAccountLine): string {
  const account = stripCategoryNumbering(line.account)
  return line.description?.trim() ? `${account} - ${line.description.trim()}` : account
}

function acknowledgmentText(voucher: Voucher): string {
  return `Received from the ${orgHeader.orgName} the amount of ${amountToWords(voucher.amount)} (P${formatAmount(voucher.amount)}).`
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
// real DV/JV forms are typed in Arial throughout, so this pass (run once per sheet, right
// before download) applies it everywhere without touching every individual font assignment.
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

// A boxed sub-region within the form — the "JV No. / Date" pair in the header, matching
// the Council's real template where those two fields sit in their own ruled cell.
function boxRange(sheet: ExcelJS.Worksheet, r1: number, c1: number, r2: number, c2: number) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = sheet.getCell(r, c)
      const border = { ...cell.border }
      if (r === r1) border.top = THIN_BORDER
      if (r === r2) border.bottom = THIN_BORDER
      if (c === c1) border.left = THIN_BORDER
      if (c === c2) border.right = THIN_BORDER
      cell.border = border
    }
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

function addCenteredHeader(sheet: ExcelJS.Worksheet, title: string) {
  const lines = [orgHeader.orgName, `${orgHeader.council}`, orgHeader.city, title]
  lines.forEach((line, i) => {
    const row = sheet.getRow(i + 1)
    row.getCell(1).value = line
    row.getCell(1).font = i === 3 ? { bold: true, size: 18 } : { bold: i === 0, size: 11 }
    row.getCell(1).alignment = {
      horizontal: 'center',
      vertical: i === 3 ? 'middle' : undefined
    }
    sheet.mergeCells(i + 1, 1, i + 1, 8)
  })
  sheet.getRow(4).height = 26
  addRowRule(sheet, 3, 8, 'bottom')
  addRowRule(sheet, 4, 8, 'top')
  addRowRule(sheet, 4, 8, 'bottom')
}

const SIGNATURE_LABEL_FONT = { bold: true, size: 10 }
const SIGNATURE_NAME_FONT = { bold: true, underline: true, size: 9 }
const SIGNATURE_ROLE_FONT = { size: 10 }

// Writes the cash-advance recap rows (see cashAdvanceRecapRows) into the JV sheet itself,
// each with its own "DATED" sub-field where the source template carries one — a no-op
// (returns startRow unchanged) for a Journal Voucher that isn't liquidating an advance.
function writeCashAdvanceRecap(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  voucher: Voucher
): number {
  if (!hasCashAdvance(voucher)) return startRow
  let r = startRow
  const spent = voucher.totalAmountSpent ?? 0
  setCell(sheet, `A${r}`, 'TOTAL AMOUNT SPENT', { size: 10 })
  setCell(sheet, `F${r}`, spent, { bold: true, size: 11 }, true)
  sheet.getCell(`F${r}`).numFmt = '#,##0.00'
  r++
  setCell(sheet, `A${r}`, 'AMOUNT OF CASH ADVANCE', { size: 10 })
  setCell(sheet, `F${r}`, voucher.cashAdvanceAmount ?? 0, { size: 10 }, true)
  sheet.getCell(`F${r}`).numFmt = '#,##0.00'
  if (voucher.cashAdvanceDate) {
    setCell(sheet, `G${r}`, 'DATED', { size: 10 }, true)
    setCell(sheet, `H${r}`, formatDate(voucher.cashAdvanceDate), { size: 10 }, true)
  }
  r++
  setCell(
    sheet,
    `A${r}`,
    `AMOUNT REFUNDED${voucher.refundOrNumber ? ` PER OR. NO. ${voucher.refundOrNumber}` : ''}`,
    { bold: true, size: 10 }
  )
  setCell(sheet, `F${r}`, voucher.amountRefunded ?? 0, { size: 10 }, true)
  sheet.getCell(`F${r}`).numFmt = '#,##0.00'
  if (voucher.refundDate) {
    setCell(sheet, `G${r}`, 'DATED', { size: 10 }, true)
    setCell(sheet, `H${r}`, formatDate(voucher.refundDate), { size: 10 }, true)
  }
  r++
  setCell(sheet, `A${r}`, 'AMOUNT TO BE REIMBURSED', { size: 10 })
  const reimbursement = cashAdvanceReimbursement(voucher, spent)
  if (reimbursement > 0) {
    setCell(sheet, `F${r}`, reimbursement, { size: 10 }, true)
    sheet.getCell(`F${r}`).numFmt = '#,##0.00'
  }
  return r + 2
}

// Two-tier signature block + Excel's own row cursor, shared by the CV and JV sheets.
function writeSignatureBlock(sheet: ExcelJS.Worksheet, startRow: number, voucher: Voucher): number {
  let r = startRow
  addRowRule(sheet, r, 8, 'top')
  const tier1 = signatoryTier1(voucher)
  setCell(sheet, `A${r}`, tier1[0].label, SIGNATURE_LABEL_FONT)
  setCell(sheet, `D${r}`, tier1[1].label, SIGNATURE_LABEL_FONT)
  setCell(sheet, `G${r}`, tier1[2].label, SIGNATURE_LABEL_FONT)
  r += 3
  setCell(sheet, `A${r}`, tier1[0].name, SIGNATURE_NAME_FONT, true)
  setCell(sheet, `D${r}`, tier1[1].name, SIGNATURE_NAME_FONT, true)
  setCell(sheet, `G${r}`, tier1[2].name, SIGNATURE_NAME_FONT, true)
  r++
  setCell(sheet, `A${r}`, tier1[0].role, SIGNATURE_ROLE_FONT, true)
  setCell(sheet, `D${r}`, tier1[1].role, SIGNATURE_ROLE_FONT, true)
  setCell(sheet, `G${r}`, tier1[2].role, SIGNATURE_ROLE_FONT, true)

  r += 2
  addRowRule(sheet, r, 8, 'top')
  const tier2 = signatoryTier2()
  setCell(sheet, `A${r}`, tier2[0].label, SIGNATURE_LABEL_FONT)
  setCell(sheet, `G${r}`, tier2[1].label, SIGNATURE_LABEL_FONT)
  r += 3
  setCell(sheet, `A${r}`, tier2[0].name, SIGNATURE_NAME_FONT, true)
  setCell(sheet, `G${r}`, tier2[1].name, SIGNATURE_NAME_FONT, true)
  r++
  setCell(sheet, `A${r}`, tier2[0].role, SIGNATURE_ROLE_FONT, true)
  setCell(sheet, `G${r}`, tier2[1].role, SIGNATURE_ROLE_FONT, true)
  return r + 2
}

// The "acknowledgment of receipt" stub every real DV carries — Disbursement/Check
// Vouchers only, since a Journal Voucher is never a cash handoff to a payee.
function writeAcknowledgment(sheet: ExcelJS.Worksheet, voucher: Voucher, startRow: number): number {
  let r = startRow
  sheet.mergeCells(`A${r}:H${r + 1}`)
  sheet.getCell(`A${r}`).value = acknowledgmentText(voucher)
  sheet.getCell(`A${r}`).alignment = { wrapText: true, vertical: 'top' }
  r += 3
  sheet.getCell(`A${r}`).value = 'Check No.'
  sheet.getCell(`C${r}`).value = voucher.checkNumber ?? ''
  r++
  sheet.getCell(`A${r}`).value = 'Date:'
  sheet.getCell(`C${r}`).value = formatDate(voucher.date)
  r += 3
  sheet.getCell(`G${r}`).value = 'Payee/Authorized Representative'
  return r + 1
}

// ─── Disbursement / Check Voucher — matches the Council's real DV template ───
export async function exportDisbursementVoucher(voucher: Voucher) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('DV')
  sheet.columns = Array.from({ length: 8 }, () => ({ width: 14 }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet, 'DISBURSEMENT VOUCHER')

  boxRange(sheet, 6, 6, 7, 7)
  setCell(sheet, 'F6', 'DV No.', { size: 11 }, true)
  setCell(sheet, 'G6', voucher.voucherNumber, { bold: true, size: 11 }, true)
  setCell(sheet, 'F7', 'Date:', { size: 11 }, true)
  setCell(sheet, 'G7', formatDate(voucher.date), { bold: true, size: 11 }, true)

  sheet.getCell('A9').value = 'Mode of Payment:'
  sheet.getCell('C9').value =
    voucher.modeOfPayment === 'cash' ? 'Cash' : `Check ${voucher.checkNumber ?? ''}`.trim()
  sheet.getCell('A10').value = 'Payee:'
  sheet.getCell('C10').value = voucher.payee
  sheet.getCell('F10').value = 'Address:'
  sheet.getCell('G10').value = voucher.payeeAddress ?? ''

  setCell(sheet, 'A12', 'PARTICULARS', { bold: true, size: 11 }, true)
  setCell(sheet, 'G12', 'AMOUNT', { bold: true, size: 12 }, true)
  addRowRule(sheet, 12, 8, 'top')
  addRowRule(sheet, 12, 8, 'bottom')

  sheet.getCell('A14').value = voucher.particulars
  sheet.mergeCells('A14:F14')
  sheet.getCell('G14').value = voucher.amount
  sheet.getCell('G14').font = { bold: true, size: 12 }
  sheet.getCell('G14').alignment = { horizontal: 'center' }
  sheet.getCell('G14').numFmt = PESO_FMT

  let r = 18
  setCell(sheet, `A${r}`, 'Account', { bold: true, size: 11 }, true)
  setCell(sheet, `F${r}`, 'Debit', { bold: true, size: 11 }, true)
  setCell(sheet, `G${r}`, 'Credit', { bold: true, size: 11 }, true)
  addRowRule(sheet, r, 8, 'top')
  addRowRule(sheet, r, 8, 'bottom')
  r++
  const firstAccountRow = r
  for (const line of voucher.accountLines) {
    sheet.getCell(`A${r}`).value = accountLabel(line)
    if (line.debit) {
      sheet.getCell(`F${r}`).value = line.debit
      sheet.getCell(`F${r}`).numFmt = '#,##0.00'
    }
    if (line.credit) {
      sheet.getCell(`G${r}`).value = line.credit
      sheet.getCell(`G${r}`).numFmt = '#,##0.00'
    }
    r++
  }
  if (voucher.bankAccountRef && !hasExplicitCreditLines(voucher)) {
    sheet.getCell(`A${r}`).value = voucher.bankAccountRef
    sheet.getCell(`G${r}`).value = voucher.amount
    sheet.getCell(`G${r}`).numFmt = '#,##0.00'
    r += 2
  }
  addRowRule(sheet, r - 1, 8, 'bottom')
  for (let tr = firstAccountRow; tr < r; tr++) {
    sheet.getCell(tr, 1).border = { ...sheet.getCell(tr, 1).border, left: THIN_BORDER }
    sheet.getCell(tr, 8).border = { ...sheet.getCell(tr, 8).border, right: THIN_BORDER }
  }

  r = writeSignatureBlock(sheet, r + 2, voucher)
  const ackEndRow = writeAcknowledgment(sheet, voucher, r)

  applyArialFont(sheet)
  addOuterBox(sheet, 8, ackEndRow - 1)

  downloadWorkbook(wb, `DV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

// The cash-advance recap (amount granted / refunded / still owed) that appears directly
// on a liquidating Journal Voucher itself — same figures and shape as the standalone
// Summary of Expenses backup's own recap (expenseSummaryExport.ts), just sourced from the
// JV's own `totalAmountSpent` field instead of an itemized receipt list.
function cashAdvanceRecapRows(voucher: Voucher): (string | number)[][] {
  if (!hasCashAdvance(voucher)) return []
  const spent = voucher.totalAmountSpent ?? 0
  const reimbursement = cashAdvanceReimbursement(voucher, spent)
  return [
    ['TOTAL AMOUNT SPENT', formatAmount(spent)],
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
    ['AMOUNT TO BE REIMBURSED', reimbursement > 0 ? formatAmount(reimbursement) : '']
  ]
}

function accountLinesRows(voucher: Voucher): (string | number)[][] {
  const rows = voucher.accountLines.map((line) => [
    accountLabel(line),
    line.debit ? formatAmount(line.debit) : '',
    line.credit ? formatAmount(line.credit) : ''
  ])
  if (voucher.bankAccountRef && !hasExplicitCreditLines(voucher)) {
    rows.push([voucher.bankAccountRef, '', formatAmount(voucher.amount)])
  }
  return rows
}

// Renders both signature tiers and, for a Disbursement Voucher, the acknowledgment-of-
// receipt stub below them — shared by the CV/JV PDF builders.
function addSignaturesAndAcknowledgment(
  doc: jsPDF,
  startY: number,
  voucher: Voucher,
  includeAcknowledgment: boolean
): number {
  let y = addSignatories(doc, startY, signatoryTier1(voucher))
  y = addSignatories(doc, y, signatoryTier2())
  if (!includeAcknowledgment) return y

  y += 24
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 30
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const lines = doc.splitTextToSize(acknowledgmentText(voucher), pageWidth - margin * 2) as string[]
  doc.text(lines, margin, y)
  y += lines.length * 12 + 10

  doc.text('Check No. _____________________', margin, y)
  doc.text('Date: _____________________', pageWidth - margin - 160, y)
  y += 36
  doc.setFont('helvetica', 'bold')
  doc.text('Payee/Authorized Representative', pageWidth - margin - 200, y, { align: 'left' })
  return y
}

export async function buildDisbursementVoucherPdfDoc(voucher: Voucher) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'DISBURSEMENT VOUCHER', bold: true, size: 12 }
  ])
  y = addTable(doc, {
    startY: y,
    head: [],
    body: [
      ['DV No.', voucher.voucherNumber],
      ['Date', formatDate(voucher.date)],
      [
        'Mode of Payment',
        voucher.modeOfPayment === 'cash' ? 'Cash' : `Check ${voucher.checkNumber ?? ''}`.trim()
      ],
      ['Payee', voucher.payee],
      ['Address', voucher.payeeAddress ?? '']
    ]
  })
  y = addTable(doc, {
    startY: y + 6,
    head: [['PARTICULARS', 'AMOUNT']],
    body: [[voucher.particulars, formatAmount(voucher.amount)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  y = addTable(doc, {
    startY: y + 6,
    head: [['Account', 'Debit', 'Credit']],
    body: accountLinesRows(voucher),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  })
  addSignaturesAndAcknowledgment(doc, y, voucher, true)
  return doc
}

export async function exportDisbursementVoucherPdf(voucher: Voucher) {
  const doc = await buildDisbursementVoucherPdfDoc(voucher)
  savePdf(doc, `DV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

// headerParagraphs is async (it fetches the logo) — the acknowledgment text never needs
// a logo, so it gets its own plain left-aligned paragraph instead of that helper.
function acknowledgmentDocxBlocks(voucher: Voucher) {
  return [
    spacer(),
    new Paragraph({ children: [new TextRun({ text: acknowledgmentText(voucher), size: 18 })] }),
    spacer(),
    buildTable(
      [],
      [
        ['Check No.', voucher.checkNumber ?? ''],
        ['Date:', formatDate(voucher.date)]
      ]
    ),
    spacer(),
    signatoryTable([{ label: '', name: '', role: 'Payee/Authorized Representative' }])
  ]
}

export async function exportDisbursementVoucherDocx(voucher: Voucher) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: 'DISBURSEMENT VOUCHER', bold: true, size: 24 }
    ])),
    spacer(),
    buildTable(
      [],
      [
        ['DV No.', voucher.voucherNumber],
        ['Date', formatDate(voucher.date)],
        [
          'Mode of Payment',
          voucher.modeOfPayment === 'cash' ? 'Cash' : `Check ${voucher.checkNumber ?? ''}`.trim()
        ],
        ['Payee', voucher.payee],
        ['Address', voucher.payeeAddress ?? '']
      ]
    ),
    spacer(),
    buildTable(['PARTICULARS', 'AMOUNT'], [[voucher.particulars, formatAmount(voucher.amount)]]),
    spacer(),
    buildTable(['Account', 'Debit', 'Credit'], accountLinesRows(voucher)),
    spacer(),
    spacer(),
    signatoryTable(signatoryTier1(voucher)),
    spacer(),
    signatoryTable(signatoryTier2()),
    ...acknowledgmentDocxBlocks(voucher)
  ]
  await saveDocx(children, `DV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

// ─── Journal Voucher — matches the Council's real JV template ────────────────
export async function exportJournalVoucher(voucher: Voucher, relatedVoucherNumber?: string) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('JV')
  sheet.columns = Array.from({ length: 8 }, () => ({ width: 14 }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet, 'JOURNAL VOUCHER')

  boxRange(sheet, 6, 6, relatedVoucherNumber ? 8 : 7, 7)
  setCell(sheet, 'F6', 'JV No.', { size: 11 }, true)
  setCell(sheet, 'G6', voucher.voucherNumber, { bold: true, size: 11 }, true)
  if (relatedVoucherNumber) {
    setCell(sheet, 'F7', 'DV No.', { size: 11 }, true)
    setCell(sheet, 'G7', relatedVoucherNumber, { bold: true, size: 11 }, true)
    setCell(sheet, 'F8', 'Date:', { size: 11 }, true)
    setCell(sheet, 'G8', formatDate(voucher.date), { bold: true, size: 11 }, true)
  } else {
    setCell(sheet, 'F7', 'Date:', { size: 11 }, true)
    setCell(sheet, 'G7', formatDate(voucher.date), { bold: true, size: 11 }, true)
  }

  setCell(sheet, 'A11', 'PARTICULARS', { bold: true, size: 11 }, true)
  setCell(sheet, 'G11', 'AMOUNT', { bold: true, size: 12 }, true)
  addRowRule(sheet, 11, 8, 'top')
  addRowRule(sheet, 11, 8, 'bottom')

  sheet.getCell('A13').value = voucher.particulars
  sheet.mergeCells('A13:F13')
  sheet.getCell('G13').value = voucher.amount
  sheet.getCell('G13').font = { bold: true, size: 12 }
  sheet.getCell('G13').alignment = { horizontal: 'center' }
  sheet.getCell('G13').numFmt = PESO_FMT

  let r = 17
  setCell(sheet, `A${r}`, 'Account', { bold: true, size: 11 }, true)
  setCell(sheet, `F${r}`, 'Debit', { bold: true, size: 11 }, true)
  setCell(sheet, `G${r}`, 'Credit', { bold: true, size: 11 }, true)
  addRowRule(sheet, r, 8, 'top')
  addRowRule(sheet, r, 8, 'bottom')
  r++
  const firstAccountRow = r
  for (const line of voucher.accountLines) {
    sheet.getCell(`A${r}`).value = accountLabel(line)
    if (line.debit) {
      sheet.getCell(`F${r}`).value = line.debit
      sheet.getCell(`F${r}`).numFmt = '#,##0.00'
    }
    if (line.credit) {
      sheet.getCell(`G${r}`).value = line.credit
      sheet.getCell(`G${r}`).numFmt = '#,##0.00'
    }
    r++
  }
  addRowRule(sheet, r - 1, 8, 'bottom')
  for (let tr = firstAccountRow; tr < r; tr++) {
    sheet.getCell(tr, 1).border = { ...sheet.getCell(tr, 1).border, left: THIN_BORDER }
    sheet.getCell(tr, 8).border = { ...sheet.getCell(tr, 8).border, right: THIN_BORDER }
  }

  r = writeCashAdvanceRecap(sheet, r + 1, voucher)
  const signatureEndRow = writeSignatureBlock(sheet, r + 2, voucher)

  applyArialFont(sheet)
  addOuterBox(sheet, 8, signatureEndRow - 2)

  downloadWorkbook(wb, `JV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

export async function buildJournalVoucherPdfDoc(voucher: Voucher, relatedVoucherNumber?: string) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'JOURNAL VOUCHER', bold: true, size: 12 }
  ])
  const formRows: (string | number)[][] = [
    ['JV No.', voucher.voucherNumber],
    ...(relatedVoucherNumber ? [['DV No.', relatedVoucherNumber]] : []),
    ['Date', formatDate(voucher.date)]
  ]
  y = addTable(doc, { startY: y, head: [], body: formRows })
  y = addTable(doc, {
    startY: y + 6,
    head: [['PARTICULARS', 'AMOUNT']],
    body: [[voucher.particulars, formatAmount(voucher.amount)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  y = addTable(doc, {
    startY: y + 6,
    head: [['Account', 'Debit', 'Credit']],
    body: voucher.accountLines.map((line) => [
      accountLabel(line),
      line.debit ? formatAmount(line.debit) : '',
      line.credit ? formatAmount(line.credit) : ''
    ]),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  })
  const recap = cashAdvanceRecapRows(voucher)
  if (recap.length > 0) {
    y = addTable(doc, {
      startY: y + 6,
      head: [],
      body: recap,
      columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } }
    })
  }
  addSignaturesAndAcknowledgment(doc, y, voucher, false)
  return doc
}

export async function exportJournalVoucherPdf(voucher: Voucher, relatedVoucherNumber?: string) {
  const doc = await buildJournalVoucherPdfDoc(voucher, relatedVoucherNumber)
  savePdf(doc, `JV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportJournalVoucherDocx(voucher: Voucher, relatedVoucherNumber?: string) {
  const formRows: (string | number)[][] = [
    ['JV No.', voucher.voucherNumber],
    ...(relatedVoucherNumber ? [['DV No.', relatedVoucherNumber]] : []),
    ['Date', formatDate(voucher.date)]
  ]
  const recap = cashAdvanceRecapRows(voucher)

  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: 'JOURNAL VOUCHER', bold: true, size: 24 }
    ])),
    spacer(),
    buildTable([], formRows),
    spacer(),
    buildTable(['PARTICULARS', 'AMOUNT'], [[voucher.particulars, formatAmount(voucher.amount)]]),
    spacer(),
    buildTable(
      ['Account', 'Debit', 'Credit'],
      voucher.accountLines.map((line) => [
        accountLabel(line),
        line.debit ? formatAmount(line.debit) : '',
        line.credit ? formatAmount(line.credit) : ''
      ])
    ),
    ...(recap.length > 0 ? [spacer(), buildTable([], recap)] : []),
    spacer(),
    spacer(),
    signatoryTable(signatoryTier1(voucher)),
    spacer(),
    signatoryTable(signatoryTier2())
  ]
  await saveDocx(children, `JV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

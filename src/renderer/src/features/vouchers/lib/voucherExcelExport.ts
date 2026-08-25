import ExcelJS from 'exceljs'
import { signatories, orgHeader } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import type { Voucher } from '../types/vouchers.types'
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

function addCenteredHeader(sheet: ExcelJS.Worksheet, title: string) {
  const lines = [orgHeader.orgName, `${orgHeader.council}`, orgHeader.city, title]
  lines.forEach((line, i) => {
    const row = sheet.getRow(i + 1)
    row.getCell(1).value = line
    row.getCell(1).font = i === 3 ? { bold: true, size: 12 } : { bold: i === 0, size: 11 }
    row.getCell(1).alignment = { horizontal: 'center' }
    sheet.mergeCells(i + 1, 1, i + 1, 8)
  })
}

// ─── Disbursement / Check Voucher — matches the Council's real DV template ───
export async function exportDisbursementVoucher(voucher: Voucher) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('DV')
  sheet.columns = Array.from({ length: 8 }, () => ({ width: 14 }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet, 'DISBURSEMENT VOUCHER')

  sheet.getCell('F6').value = 'DV No.'
  sheet.getCell('G6').value = voucher.voucherNumber
  sheet.getCell('F7').value = 'Date:'
  sheet.getCell('G7').value = formatDate(voucher.date)

  sheet.getCell('A9').value = 'Mode of Payment:'
  sheet.getCell('C9').value =
    voucher.modeOfPayment === 'cash' ? 'Cash' : `Check ${voucher.checkNumber ?? ''}`.trim()
  sheet.getCell('A10').value = 'Payee:'
  sheet.getCell('C10').value = voucher.payee
  sheet.getCell('F10').value = 'Address:'
  sheet.getCell('G10').value = voucher.payeeAddress ?? ''

  sheet.getCell('A12').value = 'PARTICULARS'
  sheet.getCell('G12').value = 'AMOUNT'
  sheet.getCell('A12').font = { bold: true }
  sheet.getCell('G12').font = { bold: true }

  sheet.getCell('A14').value = voucher.particulars
  sheet.mergeCells('A14:F14')
  sheet.getCell('G14').value = voucher.amount
  sheet.getCell('G14').numFmt = '#,##0.00'

  let r = 18
  sheet.getCell(`A${r}`).value = 'Account'
  sheet.getCell(`F${r}`).value = 'Debit'
  sheet.getCell(`G${r}`).value = 'Credit'
  ;[`A${r}`, `F${r}`, `G${r}`].forEach((addr) => (sheet.getCell(addr).font = { bold: true }))
  r++
  for (const line of voucher.accountLines) {
    sheet.getCell(`A${r}`).value = line.account
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
  if (voucher.bankAccountRef) {
    sheet.getCell(`A${r}`).value = voucher.bankAccountRef
    sheet.getCell(`G${r}`).value = voucher.amount
    sheet.getCell(`G${r}`).numFmt = '#,##0.00'
    r += 2
  }

  r += 2
  sheet.getCell(`A${r}`).value = 'PREPARED BY:'
  sheet.getCell(`D${r}`).value = 'CERTIFIED CORRECT / RECOMMENDING APPROVAL:'
  sheet.getCell(`G${r}`).value = 'VERIFIED CORRECT:'
  r += 3
  sheet.getCell(`A${r}`).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(`D${r}`).value = signatories.councilExecutive.toUpperCase()
  sheet.getCell(`G${r}`).value = signatories.councilAuditor.toUpperCase()
  r++
  sheet.getCell(`A${r}`).value = 'Accounting Clerk'
  sheet.getCell(`D${r}`).value = 'Council Executive'
  sheet.getCell(`G${r}`).value = 'Council Auditor'
  r += 2
  sheet.getCell(`D${r}`).value = 'APPROVED BY:'
  r += 3
  sheet.getCell(`A${r}`).value = signatories.councilTreasurer.toUpperCase()
  sheet.getCell(`D${r}`).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(`A${r}`).value = 'Council Treasurer'
  sheet.getCell(`D${r}`).value = 'Council President'

  downloadWorkbook(wb, `DV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

function accountLinesRows(voucher: Voucher): (string | number)[][] {
  const rows = voucher.accountLines.map((line) => [
    line.account,
    line.debit ? line.debit.toFixed(2) : '',
    line.credit ? line.credit.toFixed(2) : ''
  ])
  if (voucher.bankAccountRef) {
    rows.push([voucher.bankAccountRef, '', voucher.amount.toFixed(2)])
  }
  return rows
}

export async function exportDisbursementVoucherPdf(voucher: Voucher) {
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
    body: [[voucher.particulars, voucher.amount.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  y = addTable(doc, {
    startY: y + 6,
    head: [['Account', 'Debit', 'Credit']],
    body: accountLinesRows(voucher),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  })
  y = addSignatories(doc, y, [
    {
      label: 'Prepared by:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    },
    {
      label: 'Certified Correct / Recommending Approval:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    },
    {
      label: 'Verified Correct:',
      name: signatories.councilAuditor.toUpperCase(),
      role: 'Council Auditor'
    }
  ])
  addSignatories(doc, y, [
    { label: '', name: signatories.councilTreasurer.toUpperCase(), role: 'Council Treasurer' },
    {
      label: 'Approved by:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ])
  savePdf(doc, `DV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.pdf`)
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
    buildTable(['PARTICULARS', 'AMOUNT'], [[voucher.particulars, voucher.amount.toFixed(2)]]),
    spacer(),
    buildTable(['Account', 'Debit', 'Credit'], accountLinesRows(voucher)),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'Prepared by:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      },
      {
        label: 'Certified Correct / Recommending Approval:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
      },
      {
        label: 'Verified Correct:',
        name: signatories.councilAuditor.toUpperCase(),
        role: 'Council Auditor'
      }
    ]),
    spacer(),
    signatoryTable([
      { label: '', name: signatories.councilTreasurer.toUpperCase(), role: 'Council Treasurer' },
      {
        label: 'Approved by:',
        name: signatories.councilPresident.toUpperCase(),
        role: 'Council President'
      }
    ])
  ]
  await saveDocx(children, `DV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

// ─── Journal Voucher — matches the Council's real JV template ────────────────
export async function exportJournalVoucher(voucher: Voucher) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('JV')
  sheet.columns = Array.from({ length: 8 }, () => ({ width: 14 }))
  await addWorksheetLogo(wb, sheet)

  addCenteredHeader(sheet, 'JOURNAL VOUCHER')

  sheet.getCell('F6').value = 'JV No.'
  sheet.getCell('G6').value = voucher.voucherNumber
  sheet.getCell('F7').value = 'Date:'
  sheet.getCell('G7').value = formatDate(voucher.date)
  if (voucher.relatedVoucherNumber) {
    sheet.getCell('A9').value = 'DV No.'
    sheet.getCell('C9').value = voucher.relatedVoucherNumber
  }

  sheet.getCell('A11').value = 'PARTICULARS'
  sheet.getCell('G11').value = 'AMOUNT'
  sheet.getCell('A11').font = { bold: true }
  sheet.getCell('G11').font = { bold: true }

  sheet.getCell('A13').value = voucher.particulars
  sheet.mergeCells('A13:F13')
  sheet.getCell('G13').value = voucher.amount
  sheet.getCell('G13').numFmt = '#,##0.00'

  let r = 17
  sheet.getCell(`A${r}`).value = 'Account'
  sheet.getCell(`F${r}`).value = 'Debit'
  sheet.getCell(`G${r}`).value = 'Credit'
  ;[`A${r}`, `F${r}`, `G${r}`].forEach((addr) => (sheet.getCell(addr).font = { bold: true }))
  r++
  for (const line of voucher.accountLines) {
    sheet.getCell(`A${r}`).value = line.account
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

  if (voucher.cashAdvanceAmount !== undefined) {
    r += 2
    sheet.getCell(`A${r}`).value = 'AMOUNT OF CASH ADVANCE'
    sheet.getCell(`F${r}`).value = voucher.cashAdvanceAmount
    sheet.getCell(`F${r}`).numFmt = '#,##0.00'
    r++
    sheet.getCell(`A${r}`).value = 'AMOUNT REFUNDED'
    sheet.getCell(`F${r}`).value = voucher.amountRefunded ?? 0
    sheet.getCell(`F${r}`).numFmt = '#,##0.00'
    r++
    sheet.getCell(`A${r}`).value = 'AMOUNT TO BE REIMBURSED'
    sheet.getCell(`F${r}`).value = Math.max(
      0,
      (voucher.cashAdvanceAmount ?? 0) - (voucher.amountRefunded ?? 0) - voucher.amount
    )
    sheet.getCell(`F${r}`).numFmt = '#,##0.00'
  }

  r += 3
  sheet.getCell(`A${r}`).value = 'PREPARED BY:'
  sheet.getCell(`D${r}`).value = 'CERTIFIED CORRECT:'
  sheet.getCell(`G${r}`).value = 'VERIFIED CORRECT:'
  r += 3
  sheet.getCell(`A${r}`).value = signatories.accountingClerk.toUpperCase()
  sheet.getCell(`D${r}`).value = signatories.councilExecutive.toUpperCase()
  sheet.getCell(`G${r}`).value = signatories.councilAuditor.toUpperCase()
  r++
  sheet.getCell(`A${r}`).value = 'Accounting Clerk'
  sheet.getCell(`D${r}`).value = 'Council Executive'
  sheet.getCell(`G${r}`).value = 'Council Auditor'

  downloadWorkbook(wb, `JV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

function cashAdvanceRows(voucher: Voucher): (string | number)[][] {
  if (voucher.cashAdvanceAmount === undefined) return []
  const refunded = voucher.amountRefunded ?? 0
  return [
    ['AMOUNT OF CASH ADVANCE', voucher.cashAdvanceAmount.toFixed(2)],
    ['AMOUNT REFUNDED', refunded.toFixed(2)],
    [
      'AMOUNT TO BE REIMBURSED',
      Math.max(0, voucher.cashAdvanceAmount - refunded - voucher.amount).toFixed(2)
    ]
  ]
}

export async function exportJournalVoucherPdf(voucher: Voucher) {
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'JOURNAL VOUCHER', bold: true, size: 12 }
  ])
  const formRows: (string | number)[][] = [
    ['JV No.', voucher.voucherNumber],
    ['Date', formatDate(voucher.date)]
  ]
  if (voucher.relatedVoucherNumber) formRows.push(['DV No.', voucher.relatedVoucherNumber])
  y = addTable(doc, { startY: y, head: [], body: formRows })
  y = addTable(doc, {
    startY: y + 6,
    head: [['PARTICULARS', 'AMOUNT']],
    body: [[voucher.particulars, voucher.amount.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  y = addTable(doc, {
    startY: y + 6,
    head: [['Account', 'Debit', 'Credit']],
    body: voucher.accountLines.map((line) => [
      line.account,
      line.debit ? line.debit.toFixed(2) : '',
      line.credit ? line.credit.toFixed(2) : ''
    ]),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
  })
  const cashAdvance = cashAdvanceRows(voucher)
  if (cashAdvance.length > 0) {
    y = addTable(doc, {
      startY: y + 6,
      head: [],
      body: cashAdvance,
      columnStyles: { 1: { halign: 'right' } }
    })
  }
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
      label: 'Verified Correct:',
      name: signatories.councilAuditor.toUpperCase(),
      role: 'Council Auditor'
    }
  ])
  savePdf(doc, `JV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportJournalVoucherDocx(voucher: Voucher) {
  const formRows: (string | number)[][] = [
    ['JV No.', voucher.voucherNumber],
    ['Date', formatDate(voucher.date)]
  ]
  if (voucher.relatedVoucherNumber) formRows.push(['DV No.', voucher.relatedVoucherNumber])
  const cashAdvance = cashAdvanceRows(voucher)

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
    buildTable(['PARTICULARS', 'AMOUNT'], [[voucher.particulars, voucher.amount.toFixed(2)]]),
    spacer(),
    buildTable(
      ['Account', 'Debit', 'Credit'],
      voucher.accountLines.map((line) => [
        line.account,
        line.debit ? line.debit.toFixed(2) : '',
        line.credit ? line.credit.toFixed(2) : ''
      ])
    ),
    ...(cashAdvance.length > 0 ? [spacer(), buildTable([], cashAdvance)] : []),
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
        label: 'Verified Correct:',
        name: signatories.councilAuditor.toUpperCase(),
        role: 'Council Auditor'
      }
    ])
  ]
  await saveDocx(children, `JV_${voucher.voucherNumber.replace(/[^0-9a-z]/gi, '_')}.docx`)
}

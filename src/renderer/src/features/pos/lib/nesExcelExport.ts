import ExcelJS from 'exceljs'
import { orgHeader, signatories } from '@/shared/data/signatories.data'
import type { Product, Purchase, Sale } from '../types/pos.types'
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
import { type ReportPeriodType, reportPeriodHeading } from './periodRange'

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

function computeSalesReportRows(sales: Sale[]) {
  const byProduct = new Map<string, { qty: number; amount: number; price: number }>()
  for (const sale of sales) {
    if (sale.voided) continue
    for (const item of sale.items) {
      const existing = byProduct.get(item.name) ?? { qty: 0, amount: 0, price: item.unitPrice }
      existing.qty += item.quantity
      existing.amount += item.subtotal
      byProduct.set(item.name, existing)
    }
  }
  let totalQty = 0
  let totalAmount = 0
  const rows: (string | number)[][] = []
  for (const [name, data] of byProduct) {
    rows.push([name, data.qty, data.price.toFixed(2), data.amount.toFixed(2)])
    totalQty += data.qty
    totalAmount += data.amount
  }
  return { rows, totalQty, totalAmount }
}

// Matches the Council's actual "CES/NES Monthly Sales Report" — the report
// submitted for the National Equipment Service (uniform/merchandise store).
export async function exportMonthlySalesReport(
  sales: Sale[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Sales Report')
  sheet.columns = [{ width: 4 }, { width: 34 }, { width: 12 }, { width: 14 }, { width: 14 }]
  await addWorksheetLogo(wb, sheet, { startCol: 2, endCol: 5 })

  const headerLines = [
    orgHeader.orgName,
    orgHeader.region,
    orgHeader.council,
    `CES ${reportPeriodHeading(periodType)} Sales Report for ${monthLabel}`
  ]
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 2, i + 1, 5)
    const cell = sheet.getCell(i + 1, 2)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i === 3, size: i === 3 ? 12 : 11 }
  })

  const headerRow = 7
  ;['Particulars', 'Quantity', 'Selling Price', 'Amount'].forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 2)
    cell.value = label
    cell.font = { bold: true }
  })

  const byProduct = new Map<string, { qty: number; amount: number; price: number }>()
  for (const sale of sales) {
    if (sale.voided) continue
    for (const item of sale.items) {
      const existing = byProduct.get(item.name) ?? { qty: 0, amount: 0, price: item.unitPrice }
      existing.qty += item.quantity
      existing.amount += item.subtotal
      byProduct.set(item.name, existing)
    }
  }

  let r = headerRow + 1
  let totalQty = 0
  let totalAmount = 0
  for (const [name, data] of byProduct) {
    sheet.getCell(r, 2).value = name
    sheet.getCell(r, 3).value = data.qty
    sheet.getCell(r, 4).value = data.price
    sheet.getCell(r, 4).numFmt = '#,##0.00'
    sheet.getCell(r, 5).value = data.amount
    sheet.getCell(r, 5).numFmt = '#,##0.00'
    totalQty += data.qty
    totalAmount += data.amount
    r++
  }

  r++
  sheet.getCell(r, 2).value = 'TOTAL'
  sheet.getCell(r, 2).font = { bold: true }
  sheet.getCell(r, 3).value = totalQty
  sheet.getCell(r, 3).font = { bold: true }
  sheet.getCell(r, 5).value = totalAmount
  sheet.getCell(r, 5).numFmt = '#,##0.00'
  sheet.getCell(r, 5).font = { bold: true }

  r += 3
  sheet.getCell(r, 2).value = 'Prepared by:'
  sheet.getCell(r, 4).value = 'Certified Correct:'
  r += 3
  sheet.getCell(r, 2).value = signatories.cesInCharge.toUpperCase()
  sheet.getCell(r, 4).value = signatories.accountingClerk.toUpperCase()
  r++
  sheet.getCell(r, 2).value = 'C.E.S. In-Charge'
  sheet.getCell(r, 4).value = 'Accounting Clerk'

  downloadWorkbook(
    wb,
    `NES_${reportPeriodHeading(periodType).replace(/\s+/g, '_')}_Sales_Report_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`
  )
}

export async function buildMonthlySalesReportPdfDoc(
  sales: Sale[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const { rows, totalQty, totalAmount } = computeSalesReportRows(sales)
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.region },
    { text: orgHeader.council },
    {
      text: `CES ${reportPeriodHeading(periodType)} Sales Report for ${monthLabel}`,
      bold: true,
      size: 12
    }
  ])
  y = addTable(doc, {
    startY: y,
    head: [['Particulars', 'Quantity', 'Selling Price', 'Amount']],
    body: rows,
    foot: [['TOTAL', totalQty, '', totalAmount.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  })
  addSignatories(doc, y, [
    {
      label: 'Prepared by:',
      name: signatories.cesInCharge.toUpperCase(),
      role: 'C.E.S. In-Charge'
    },
    {
      label: 'Certified Correct:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    }
  ])
  return doc
}

export async function exportMonthlySalesReportPdf(
  sales: Sale[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const doc = await buildMonthlySalesReportPdfDoc(sales, monthLabel, periodType)
  savePdf(
    doc,
    `NES_${reportPeriodHeading(periodType).replace(/\s+/g, '_')}_Sales_Report_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`
  )
}

export async function exportMonthlySalesReportDocx(
  sales: Sale[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const { rows, totalQty, totalAmount } = computeSalesReportRows(sales)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.region },
      { text: orgHeader.council },
      {
        text: `CES ${reportPeriodHeading(periodType)} Sales Report for ${monthLabel}`,
        bold: true,
        size: 24
      }
    ])),
    spacer(),
    buildTable(['Particulars', 'Quantity', 'Selling Price', 'Amount'], rows, [
      'TOTAL',
      totalQty,
      '',
      totalAmount.toFixed(2)
    ]),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'Prepared by:',
        name: signatories.cesInCharge.toUpperCase(),
        role: 'C.E.S. In-Charge'
      },
      {
        label: 'Certified Correct:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      }
    ])
  ]
  await saveDocx(
    children,
    `NES_${reportPeriodHeading(periodType).replace(/\s+/g, '_')}_Sales_Report_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`
  )
}

function incomeStatementPeriodLine(periodType: ReportPeriodType, periodLabel: string) {
  switch (periodType) {
    case 'daily':
      return `For the Day of ${periodLabel}`
    case 'weekly':
      return `For the Week of ${periodLabel}`
    case 'quarterly':
      return `For the Quarter Ended ${periodLabel}`
    case 'annually':
      return `For the Year ${periodLabel}`
    case 'custom':
      return `For the Period ${periodLabel}`
    default:
      return `For the Month of ${periodLabel}`
  }
}

// Matches the Council's actual "NES Income Statement" (periodic inventory method),
// which the Council also produces quarterly using the same layout (see the real
// "Quarterly IS.xlsx" reference — same rows, only the period line changes).
export async function exportNesIncomeStatement(params: {
  monthLabel: string
  periodType?: ReportPeriodType
  beginningInventory: number
  purchases: number
  endingInventory: number
  cashSales: number
}) {
  const periodType = params.periodType ?? 'monthly'
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('NES Income Statement')
  sheet.columns = [
    { width: 4 },
    { width: 4 },
    { width: 30 },
    { width: 6 },
    { width: 6 },
    { width: 6 },
    { width: 16 }
  ]
  await addWorksheetLogo(wb, sheet, { startCol: 3, endCol: 7 })

  const headerLines = [
    orgHeader.orgName,
    orgHeader.council,
    orgHeader.city,
    'National Equipment Services (NES)',
    'Income Statement',
    incomeStatementPeriodLine(periodType, params.monthLabel)
  ]
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 3, i + 1, 7)
    const cell = sheet.getCell(i + 1, 3)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 3 }
  })

  const totalAvailable = params.beginningInventory + params.purchases
  const cogs = totalAvailable - params.endingInventory
  const netIncome = params.cashSales - cogs

  let r = 9
  sheet.getCell(r, 3).value = 'NES Income'
  sheet.getCell(r, 3).font = { bold: true }
  r++
  sheet.getCell(r, 4).value = 'Beginning Inventory'
  sheet.getCell(r, 7).value = params.beginningInventory
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  r++
  sheet.getCell(r, 4).value = 'Add: Purchases'
  sheet.getCell(r, 7).value = params.purchases
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  r++
  sheet.getCell(r, 4).value = 'Total Goods Available for Sale'
  sheet.getCell(r, 7).value = totalAvailable
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  r++
  sheet.getCell(r, 4).value = 'Less: Ending Inventory'
  sheet.getCell(r, 7).value = params.endingInventory
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  r++
  sheet.getCell(r, 4).value = 'Cost of Goods Sold'
  sheet.getCell(r, 7).value = cogs
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  r += 2
  sheet.getCell(r, 4).value = 'Less: Cash Sales'
  sheet.getCell(r, 7).value = params.cashSales
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  r += 2
  sheet.getCell(r, 3).value = 'Net Income'
  sheet.getCell(r, 3).font = { bold: true }
  sheet.getCell(r, 7).value = netIncome
  sheet.getCell(r, 7).numFmt = '#,##0.00'
  sheet.getCell(r, 7).font = { bold: true }

  r += 3
  sheet.getCell(r, 3).value = 'Prepared by:'
  sheet.getCell(r, 7).value = 'Certified Correct:'
  r += 2
  sheet.getCell(r, 3).value = signatories.cesInCharge.toUpperCase()
  sheet.getCell(r, 7).value = signatories.accountingClerk.toUpperCase()
  r++
  sheet.getCell(r, 3).value = 'C.E.S. In-Charge'
  sheet.getCell(r, 7).value = 'Accounting Clerk'
  r += 3
  sheet.getCell(r, 7).value = 'Verified Correct:'
  r += 2
  sheet.getCell(r, 7).value = signatories.councilExecutive.toUpperCase()
  r++
  sheet.getCell(r, 7).value = 'Council Executive'
  r += 3
  sheet.getCell(r, 3).value = 'Recommending Approval:'
  sheet.getCell(r, 7).value = 'Approved:'
  r += 2
  sheet.getCell(r, 3).value = signatories.nesCommitteeChairman.toUpperCase()
  sheet.getCell(r, 7).value = signatories.councilPresident.toUpperCase()
  r++
  sheet.getCell(r, 3).value = 'Chairman - NES Committee'
  sheet.getCell(r, 7).value = 'Council President'

  downloadWorkbook(wb, `NES_Income_Statement_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`)
}

function nesIncomeStatementFigures(params: {
  beginningInventory: number
  purchases: number
  endingInventory: number
  cashSales: number
}) {
  const totalAvailable = params.beginningInventory + params.purchases
  const cogs = totalAvailable - params.endingInventory
  const netIncome = params.cashSales - cogs
  return { totalAvailable, cogs, netIncome }
}

interface NesIncomeStatementParams {
  monthLabel: string
  periodType?: ReportPeriodType
  beginningInventory: number
  purchases: number
  endingInventory: number
  cashSales: number
}

export async function buildNesIncomeStatementPdfDoc(params: NesIncomeStatementParams) {
  const periodType = params.periodType ?? 'monthly'
  const { totalAvailable, cogs, netIncome } = nesIncomeStatementFigures(params)
  const doc = createPdf('portrait')
  let y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'National Equipment Services (NES)', bold: true },
    { text: 'Income Statement', bold: true, size: 12 },
    { text: incomeStatementPeriodLine(periodType, params.monthLabel) }
  ])
  y = addTable(doc, {
    startY: y,
    head: [],
    body: [
      ['Beginning Inventory', params.beginningInventory.toFixed(2)],
      ['Add: Purchases', params.purchases.toFixed(2)],
      ['Total Goods Available for Sale', totalAvailable.toFixed(2)],
      ['Less: Ending Inventory', params.endingInventory.toFixed(2)],
      ['Cost of Goods Sold', cogs.toFixed(2)],
      ['Less: Cash Sales', params.cashSales.toFixed(2)]
    ],
    foot: [['Net Income', netIncome.toFixed(2)]],
    columnStyles: { 1: { halign: 'right' } }
  })
  y = addSignatories(doc, y, [
    {
      label: 'Prepared by:',
      name: signatories.cesInCharge.toUpperCase(),
      role: 'C.E.S. In-Charge'
    },
    {
      label: 'Certified Correct:',
      name: signatories.accountingClerk.toUpperCase(),
      role: 'Accounting Clerk'
    }
  ])
  y = addSignatories(doc, y, [
    { label: '', name: '', role: '' },
    {
      label: 'Verified Correct:',
      name: signatories.councilExecutive.toUpperCase(),
      role: 'Council Executive'
    }
  ])
  addSignatories(doc, y, [
    {
      label: 'Recommending Approval:',
      name: signatories.nesCommitteeChairman.toUpperCase(),
      role: 'Chairman - NES Committee'
    },
    {
      label: 'Approved:',
      name: signatories.councilPresident.toUpperCase(),
      role: 'Council President'
    }
  ])
  return doc
}

export async function exportNesIncomeStatementPdf(params: NesIncomeStatementParams) {
  const doc = await buildNesIncomeStatementPdfDoc(params)
  savePdf(doc, `NES_Income_Statement_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`)
}

export async function exportNesIncomeStatementDocx(params: {
  monthLabel: string
  periodType?: ReportPeriodType
  beginningInventory: number
  purchases: number
  endingInventory: number
  cashSales: number
}) {
  const periodType = params.periodType ?? 'monthly'
  const { totalAvailable, cogs, netIncome } = nesIncomeStatementFigures(params)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: 'National Equipment Services (NES)', bold: true },
      { text: 'Income Statement', bold: true, size: 24 },
      { text: incomeStatementPeriodLine(periodType, params.monthLabel) }
    ])),
    spacer(),
    buildTable(
      [],
      [
        ['Beginning Inventory', params.beginningInventory.toFixed(2)],
        ['Add: Purchases', params.purchases.toFixed(2)],
        ['Total Goods Available for Sale', totalAvailable.toFixed(2)],
        ['Less: Ending Inventory', params.endingInventory.toFixed(2)],
        ['Cost of Goods Sold', cogs.toFixed(2)],
        ['Less: Cash Sales', params.cashSales.toFixed(2)]
      ],
      ['Net Income', netIncome.toFixed(2)]
    ),
    spacer(),
    spacer(),
    signatoryTable([
      {
        label: 'Prepared by:',
        name: signatories.cesInCharge.toUpperCase(),
        role: 'C.E.S. In-Charge'
      },
      {
        label: 'Certified Correct:',
        name: signatories.accountingClerk.toUpperCase(),
        role: 'Accounting Clerk'
      }
    ]),
    spacer(),
    signatoryTable([
      { label: '', name: '', role: '' },
      {
        label: 'Verified Correct:',
        name: signatories.councilExecutive.toUpperCase(),
        role: 'Council Executive'
      }
    ]),
    spacer(),
    signatoryTable([
      {
        label: 'Recommending Approval:',
        name: signatories.nesCommitteeChairman.toUpperCase(),
        role: 'Chairman - NES Committee'
      },
      {
        label: 'Approved:',
        name: signatories.councilPresident.toUpperCase(),
        role: 'Council President'
      }
    ])
  ]
  await saveDocx(
    children,
    `NES_Income_Statement_${params.monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`
  )
}

export interface InventoryMovement {
  product: Product
  beginningQty: number
  purchasesQty: number
  salesQty: number
  endingQty: number
  beginningValue: number
  purchasesValue: number
  salesValue: number
  cogs: number
  endingValue: number
}

// Derives Beginning/Purchases/Sales/Ending movement per product from the
// current stock level plus this month's sales and purchases (Beg = End +
// Sales - Purchases), since a running ledger isn't kept separately.
export function computeInventoryMovements(
  products: Product[],
  sales: Sale[],
  purchases: Purchase[]
): InventoryMovement[] {
  return products.map((product) => {
    const salesQty = sales
      .filter((s) => !s.voided)
      .flatMap((s) => s.items)
      .filter((i) => i.productId === product.id)
      .reduce((sum, i) => sum + i.quantity, 0)
    const purchasesQty = purchases
      .filter((p) => p.productId === product.id)
      .reduce((sum, p) => sum + p.quantity, 0)
    const endingQty = product.stockQuantity
    const beginningQty = endingQty + salesQty - purchasesQty
    const unitCost = product.costPrice

    return {
      product,
      beginningQty,
      purchasesQty,
      salesQty,
      endingQty,
      beginningValue: beginningQty * unitCost,
      purchasesValue: purchases
        .filter((p) => p.productId === product.id)
        .reduce((sum, p) => sum + p.amount, 0),
      salesValue: sales
        .filter((s) => !s.voided)
        .flatMap((s) => s.items)
        .filter((i) => i.productId === product.id)
        .reduce((sum, i) => sum + i.subtotal, 0),
      cogs: salesQty * unitCost,
      endingValue: endingQty * unitCost
    }
  })
}

// Matches the Council's actual "Monthly Inventory Report" — per-item
// Beginning/Purchases/Sales/Ending stock and peso movement.
export async function exportMonthlyInventoryReport(
  products: Product[],
  sales: Sale[],
  purchases: Purchase[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const movements = computeInventoryMovements(products, sales, purchases)

  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Inventory Report')
  sheet.columns = [
    { width: 26 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 }
  ]
  await addWorksheetLogo(wb, sheet)

  const headerLines = [
    orgHeader.orgName,
    orgHeader.council,
    `${reportPeriodHeading(periodType)} Inventory Report`,
    monthLabel
  ]
  headerLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, 12)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 2 }
  })

  const headerRow = 7
  const cols = [
    'ITEM',
    'BEG. INVENTORY',
    'PURCHASES',
    'SALES (UNITS)',
    'END INVENTORY',
    'UNIT COST',
    'SELLING PRICE',
    'BEG. INVENTORY (₱)',
    'PURCHASES (₱)',
    'SALES (₱)',
    'COGS',
    'END INVENTORY (₱)'
  ]
  cols.forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 1)
    cell.value = label
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center', wrapText: true }
  })

  let r = headerRow + 1
  const totals = {
    begQty: 0,
    purQty: 0,
    salesQty: 0,
    endQty: 0,
    begVal: 0,
    purVal: 0,
    salesVal: 0,
    cogs: 0,
    endVal: 0
  }
  for (const m of movements) {
    sheet.getCell(r, 1).value = `${m.product.name} (${m.product.sku})`
    sheet.getCell(r, 2).value = m.beginningQty
    sheet.getCell(r, 3).value = m.purchasesQty
    sheet.getCell(r, 4).value = m.salesQty
    sheet.getCell(r, 5).value = m.endingQty
    sheet.getCell(r, 6).value = m.product.costPrice
    sheet.getCell(r, 7).value = m.product.sellingPrice
    sheet.getCell(r, 8).value = m.beginningValue
    sheet.getCell(r, 9).value = m.purchasesValue
    sheet.getCell(r, 10).value = m.salesValue
    sheet.getCell(r, 11).value = m.cogs
    sheet.getCell(r, 12).value = m.endingValue
    for (let c = 6; c <= 12; c++) sheet.getCell(r, c).numFmt = '#,##0.00'

    totals.begQty += m.beginningQty
    totals.purQty += m.purchasesQty
    totals.salesQty += m.salesQty
    totals.endQty += m.endingQty
    totals.begVal += m.beginningValue
    totals.purVal += m.purchasesValue
    totals.salesVal += m.salesValue
    totals.cogs += m.cogs
    totals.endVal += m.endingValue
    r++
  }

  sheet.getCell(r, 1).value = 'TOTAL'
  sheet.getCell(r, 1).font = { bold: true }
  const totalVals = [
    totals.begQty,
    totals.purQty,
    totals.salesQty,
    totals.endQty,
    null,
    null,
    totals.begVal,
    totals.purVal,
    totals.salesVal,
    totals.cogs,
    totals.endVal
  ]
  totalVals.forEach((val, i) => {
    if (val === null) return
    const cell = sheet.getCell(r, 2 + i)
    cell.value = val
    cell.font = { bold: true }
    if (i >= 6) cell.numFmt = '#,##0.00'
  })

  downloadWorkbook(
    wb,
    `NES_${reportPeriodHeading(periodType).replace(/\s+/g, '_')}_Inventory_Report_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.xlsx`
  )
}

const inventoryReportCols = [
  'ITEM',
  'BEG. INV.',
  'PURCHASES',
  'SALES',
  'END INV.',
  'UNIT COST',
  'SELLING PRICE',
  'BEG. INV. (₱)',
  'PURCHASES (₱)',
  'SALES (₱)',
  'COGS',
  'END INV. (₱)'
]

function inventoryReportRows(movements: InventoryMovement[]) {
  const totals = {
    begQty: 0,
    purQty: 0,
    salesQty: 0,
    endQty: 0,
    begVal: 0,
    purVal: 0,
    salesVal: 0,
    cogs: 0,
    endVal: 0
  }
  const rows: (string | number)[][] = movements.map((m) => {
    totals.begQty += m.beginningQty
    totals.purQty += m.purchasesQty
    totals.salesQty += m.salesQty
    totals.endQty += m.endingQty
    totals.begVal += m.beginningValue
    totals.purVal += m.purchasesValue
    totals.salesVal += m.salesValue
    totals.cogs += m.cogs
    totals.endVal += m.endingValue
    return [
      `${m.product.name} (${m.product.sku})`,
      m.beginningQty,
      m.purchasesQty,
      m.salesQty,
      m.endingQty,
      m.product.costPrice.toFixed(2),
      m.product.sellingPrice.toFixed(2),
      m.beginningValue.toFixed(2),
      m.purchasesValue.toFixed(2),
      m.salesValue.toFixed(2),
      m.cogs.toFixed(2),
      m.endingValue.toFixed(2)
    ]
  })
  const totalsRow = [
    'TOTAL',
    totals.begQty,
    totals.purQty,
    totals.salesQty,
    totals.endQty,
    '',
    '',
    totals.begVal.toFixed(2),
    totals.purVal.toFixed(2),
    totals.salesVal.toFixed(2),
    totals.cogs.toFixed(2),
    totals.endVal.toFixed(2)
  ]
  return { rows, totalsRow }
}

export async function buildMonthlyInventoryReportPdfDoc(
  products: Product[],
  sales: Sale[],
  purchases: Purchase[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const movements = computeInventoryMovements(products, sales, purchases)
  const { rows, totalsRow } = inventoryReportRows(movements)
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: `${reportPeriodHeading(periodType)} Inventory Report`, bold: true, size: 12 },
    { text: monthLabel }
  ])
  addTable(doc, {
    startY: y,
    head: [inventoryReportCols],
    body: rows,
    foot: [totalsRow],
    columnStyles: Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [i + 1, { halign: 'right' as const }])
    )
  })
  return doc
}

export async function exportMonthlyInventoryReportPdf(
  products: Product[],
  sales: Sale[],
  purchases: Purchase[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const doc = await buildMonthlyInventoryReportPdfDoc(
    products,
    sales,
    purchases,
    monthLabel,
    periodType
  )
  savePdf(
    doc,
    `NES_${reportPeriodHeading(periodType).replace(/\s+/g, '_')}_Inventory_Report_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.pdf`
  )
}

export async function exportMonthlyInventoryReportDocx(
  products: Product[],
  sales: Sale[],
  purchases: Purchase[],
  monthLabel: string,
  periodType: ReportPeriodType = 'monthly'
) {
  const movements = computeInventoryMovements(products, sales, purchases)
  const { rows, totalsRow } = inventoryReportRows(movements)
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: `${reportPeriodHeading(periodType)} Inventory Report`, bold: true, size: 24 },
      { text: monthLabel }
    ])),
    spacer(),
    buildTable(inventoryReportCols, rows, totalsRow)
  ]
  await saveDocx(
    children,
    `NES_${reportPeriodHeading(periodType).replace(/\s+/g, '_')}_Inventory_Report_${monthLabel.replace(/[^0-9a-z]/gi, '_')}.docx`,
    true
  )
}

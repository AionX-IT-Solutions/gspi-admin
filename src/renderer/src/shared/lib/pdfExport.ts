import { jsPDF } from 'jspdf'
import autoTable, { type UserOptions } from 'jspdf-autotable'
import { getReportLogoDataUrl } from './reportLogo'

interface AutoTableDoc extends jsPDF {
  lastAutoTable: { finalY: number }
}

export type PdfOrientation = 'portrait' | 'landscape'

export interface PdfHeaderLine {
  text: string
  bold?: boolean
  size?: number
}

export function createPdf(orientation: PdfOrientation = 'portrait'): jsPDF {
  return new jsPDF({ orientation, unit: 'pt', format: 'a4' })
}

export async function addHeaderLines(
  doc: jsPDF,
  lines: PdfHeaderLine[],
  startY = 36
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = startY

  const logo = await getReportLogoDataUrl()
  if (logo) {
    const logoSize = 40
    doc.addImage(logo, 'PNG', pageWidth / 2 - logoSize / 2, y, logoSize, logoSize)
    y += logoSize + 8
  }

  for (const line of lines) {
    const size = line.size ?? 10
    doc.setFont('helvetica', line.bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.text(line.text, pageWidth / 2, y, { align: 'center' })
    y += size + 6
  }
  return y + 8
}

export interface PdfTableOptions {
  head: string[][]
  body: (string | number)[][]
  foot?: (string | number)[][]
  startY: number
  columnStyles?: UserOptions['columnStyles']
}

export function addTable(doc: jsPDF, opts: PdfTableOptions): number {
  autoTable(doc, {
    head: opts.head,
    body: opts.body,
    foot: opts.foot,
    startY: opts.startY,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      valign: 'middle',
      lineColor: [220, 220, 230],
      lineWidth: 0.5
    },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [237, 237, 250], textColor: [18, 18, 42], fontStyle: 'bold' },
    columnStyles: opts.columnStyles,
    margin: { left: 30, right: 30 }
  })
  return (doc as unknown as AutoTableDoc).lastAutoTable.finalY
}

export interface PdfSignatoryColumn {
  label: string
  name: string
  role: string
}

export function addSignatories(doc: jsPDF, startY: number, columns: PdfSignatoryColumn[]): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 30
  const usableWidth = pageWidth - margin * 2
  const colWidth = usableWidth / columns.length
  let y = startY + 30

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  columns.forEach((col, i) => doc.text(col.label, margin + colWidth * i, y))

  y += 34
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  columns.forEach((col, i) => doc.text(col.name, margin + colWidth * i, y))

  y += 12
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  columns.forEach((col, i) => doc.text(col.role, margin + colWidth * i, y))

  return y
}

export function savePdf(doc: jsPDF, filename: string): void {
  doc.save(filename)
}

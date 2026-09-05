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
  head: NonNullable<UserOptions['head']>
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
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [219, 246, 235], textColor: [18, 18, 42], fontStyle: 'bold' },
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
  // Leave a gap so a long signatory name wraps within its own column instead of
  // bleeding into the next one (e.g. long officer full names on the DV/JV templates).
  const textWidth = colWidth - 14
  let y = startY + 30

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  const labelLines = columns.map((col) => doc.splitTextToSize(col.label, textWidth) as string[])
  labelLines.forEach((lines, i) => doc.text(lines, margin + colWidth * i, y))
  y += 34 + (Math.max(1, ...labelLines.map((l) => l.length)) - 1) * 10

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  const nameLines = columns.map((col) => doc.splitTextToSize(col.name, textWidth) as string[])
  nameLines.forEach((lines, i) => doc.text(lines, margin + colWidth * i, y))
  y += 12 + (Math.max(1, ...nameLines.map((l) => l.length)) - 1) * 11

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  const roleLines = columns.map((col) => doc.splitTextToSize(col.role, textWidth) as string[])
  roleLines.forEach((lines, i) => doc.text(lines, margin + colWidth * i, y))
  y += (Math.max(1, ...roleLines.map((l) => l.length)) - 1) * 10

  return y
}

export function savePdf(doc: jsPDF, filename: string): void {
  doc.save(filename)
}

/** Returns a `blob:` URL for an in-app preview instead of forcing a download — Electron's
 *  Chromium renders PDFs natively from a blob URL in an <iframe>, no extra dependency
 *  needed. Caller owns the URL's lifecycle (URL.revokeObjectURL when the preview closes).
 *  jsPDF's types claim 'bloburl' returns a URL object, but at runtime it's the raw string
 *  from URL.createObjectURL() — casting through unknown to match what actually comes back. */
export function previewPdf(doc: jsPDF): string {
  return doc.output('bloburl') as unknown as string
}

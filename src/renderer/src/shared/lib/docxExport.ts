import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  PageOrientation
} from 'docx'
import { getReportLogoDataUrl } from './reportLogo'

export interface DocxHeaderLine {
  text: string
  bold?: boolean
  size?: number
}

export async function headerParagraphs(lines: DocxHeaderLine[]): Promise<Paragraph[]> {
  const logo = await getReportLogoDataUrl()
  const logoParagraph = logo
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new ImageRun({ type: 'png', data: logo, transformation: { width: 60, height: 60 } })
          ]
        })
      ]
    : []

  return [
    ...logoParagraph,
    ...lines.map(
      (line) =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: line.text, bold: line.bold, size: line.size ?? 20 })]
        })
    )
  ]
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

function cell(
  text: string,
  opts?: {
    bold?: boolean
    color?: string
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
  }
): TableCell {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts?.align ?? AlignmentType.LEFT,
        children: [new TextRun({ text, bold: opts?.bold, color: opts?.color, size: 16 })]
      })
    ]
  })
}

export function buildTable(
  head: string[],
  rows: (string | number)[][],
  footRow?: (string | number | null)[]
): Table {
  const headerRow =
    head.length > 0
      ? new TableRow({
          tableHeader: true,
          children: head.map(
            (h) =>
              new TableCell({
                shading: { fill: '6366F1' },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 60, bottom: 60, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 16 })]
                  })
                ]
              })
          )
        })
      : null

  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((value) => cell(String(value)))
      })
  )

  const rowsAll = headerRow ? [headerRow, ...bodyRows] : bodyRows
  if (footRow) {
    rowsAll.push(
      new TableRow({
        children: footRow.map((value) => cell(value === null ? '' : String(value), { bold: true }))
      })
    )
  }

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rowsAll })
}

export interface DocxSignatoryColumn {
  label: string
  name: string
  role: string
}

export function signatoryTable(columns: DocxSignatoryColumn[]): Table {
  const blankCell = () =>
    new TableCell({ borders: noBorders, children: [new Paragraph({ text: '' })] })
  const textCell = (text: string, bold = false) =>
    new TableCell({
      borders: noBorders,
      children: [new Paragraph({ children: [new TextRun({ text, bold, size: 18 })] })]
    })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({ children: columns.map((c) => textCell(c.label)) }),
      new TableRow({ children: columns.map(() => blankCell()) }),
      new TableRow({ children: columns.map((c) => textCell(c.name, true)) }),
      new TableRow({ children: columns.map((c) => textCell(c.role)) })
    ]
  })
}

export function spacer(): Paragraph {
  return new Paragraph({ text: '', spacing: { after: 120 } })
}

export async function saveDocx(
  children: (Paragraph | Table)[],
  filename: string,
  landscape = false
): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: landscape
          ? { page: { size: { orientation: PageOrientation.LANDSCAPE } } }
          : undefined,
        children
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

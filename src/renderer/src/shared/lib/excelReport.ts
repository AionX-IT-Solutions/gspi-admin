import type ExcelJS from 'exceljs'
import { getReportLogoDataUrl } from './reportLogo'

/**
 * Anchors the GSPI/Girl Scouts logo as a small floating image in the top-left corner of a
 * worksheet (row 0, col 0). Floating images sit on top of the grid independent of cell
 * values, so this never disturbs existing header text, merges, or row numbering.
 */
export async function addWorksheetLogo(
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet
): Promise<void> {
  const logo = await getReportLogoDataUrl()
  if (!logo) return
  const imageId = workbook.addImage({ base64: logo, extension: 'png' })
  sheet.addImage(imageId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 48, height: 48 } })
}

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportProgramReportsExcel,
  exportProgramReportsPdf,
  exportProgramReportsDocx,
  buildProgramReportsPdfDoc
} from '../lib/programReportsExport'
import {
  DEFAULT_SECTION_META,
  metaKey,
  useProgramReportSectionMetaStore
} from '../store/programReportSectionMeta.store'
import type { ProgramReportLineItem, ProgramReportSection } from '../types/programReports.types'

interface ProgramReportsExportMenuProps {
  items: ProgramReportLineItem[]
  sectionLabel: string
  section: ProgramReportSection
  year: string
  monthIndex: number
}

export function ProgramReportsExportMenu({
  items,
  sectionLabel,
  section,
  year,
  monthIndex
}: ProgramReportsExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()
  const metaOverride = useProgramReportSectionMetaStore(
    (s) => s.meta[metaKey(section, year, monthIndex)]
  )
  const meta = useMemo(
    () => ({ ...DEFAULT_SECTION_META[section], ...metaOverride }),
    [section, metaOverride]
  )

  return (
    <>
      <ExportMenu
        label={t('programReports.exportLabel')}
        disabled={items.length === 0}
        onView={async () =>
          preview.openPreview(await buildProgramReportsPdfDoc(items, meta, year, monthIndex))
        }
        onExportExcel={() => {
          exportProgramReportsExcel(items, sectionLabel, meta, year, monthIndex, t)
          toast.success(t('programReports.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportProgramReportsPdf(items, sectionLabel, meta, year, monthIndex)
          toast.success(t('programReports.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportProgramReportsDocx(items, sectionLabel, meta, year, monthIndex)
          toast.success(t('programReports.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={sectionLabel}
        onDownloadExcel={() => {
          exportProgramReportsExcel(items, sectionLabel, meta, year, monthIndex, t)
          toast.success(t('programReports.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportProgramReportsPdf(items, sectionLabel, meta, year, monthIndex)
          toast.success(t('programReports.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportProgramReportsDocx(items, sectionLabel, meta, year, monthIndex)
          toast.success(t('programReports.toast.exportedWord'))
        }}
      />
    </>
  )
}

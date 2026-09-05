import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportTrainingReportExcel,
  exportTrainingReportPdf,
  exportTrainingReportDocx,
  buildTrainingReportPdfDoc
} from '../lib/trainingReportsExport'
import type { TrainingReport } from '../types/trainingReports.types'

interface TrainingReportExportMenuProps {
  report: TrainingReport
}

export function TrainingReportExportMenu({ report }: TrainingReportExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        iconOnly
        title={t('trainingReports.exportLabel')}
        onView={async () => preview.openPreview(await buildTrainingReportPdfDoc(report, t))}
        onExportExcel={() => {
          exportTrainingReportExcel(report, t)
          toast.success(t('trainingReports.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportTrainingReportPdf(report, t)
          toast.success(t('trainingReports.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportTrainingReportDocx(report, t)
          toast.success(t('trainingReports.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={`${t('trainingReports.title')} — ${report.title}`}
        onDownloadExcel={() => {
          exportTrainingReportExcel(report, t)
          toast.success(t('trainingReports.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportTrainingReportPdf(report, t)
          toast.success(t('trainingReports.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportTrainingReportDocx(report, t)
          toast.success(t('trainingReports.toast.exportedWord'))
        }}
      />
    </>
  )
}

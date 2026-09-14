import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportTrainingProfilesExcel,
  exportTrainingProfilesPdf,
  exportTrainingProfilesDocx,
  buildTrainingProfilesPdfDoc
} from '../lib/trainingProfilesExport'
import type { TrainingProfile } from '../types/trainingProfiles.types'

interface TrainingProfilesExportMenuProps {
  profiles: TrainingProfile[]
}

export function TrainingProfilesExportMenu({ profiles }: TrainingProfilesExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  function requireRows(): boolean {
    if (profiles.length === 0) {
      toast.error(t('trainingProfiles.toast.noneToExport'))
      return false
    }
    return true
  }

  return (
    <>
      <ExportMenu
        label={t('trainingProfiles.exportButton')}
        onView={async () => {
          if (!requireRows()) return
          preview.openPreview(await buildTrainingProfilesPdfDoc(profiles, t))
        }}
        onExportExcel={() => {
          if (!requireRows()) return
          exportTrainingProfilesExcel(profiles, t)
          toast.success(t('trainingProfiles.toast.listExportedExcel'))
        }}
        onExportPdf={() => {
          if (!requireRows()) return
          exportTrainingProfilesPdf(profiles, t)
          toast.success(t('trainingProfiles.toast.listExportedPdf'))
        }}
        onExportWord={() => {
          if (!requireRows()) return
          exportTrainingProfilesDocx(profiles, t)
          toast.success(t('trainingProfiles.toast.listExportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('trainingProfiles.title')}
        onDownloadExcel={() => {
          exportTrainingProfilesExcel(profiles, t)
          toast.success(t('trainingProfiles.toast.listExportedExcel'))
        }}
        onDownloadPdf={() => {
          exportTrainingProfilesPdf(profiles, t)
          toast.success(t('trainingProfiles.toast.listExportedPdf'))
        }}
        onDownloadWord={() => {
          exportTrainingProfilesDocx(profiles, t)
          toast.success(t('trainingProfiles.toast.listExportedWord'))
        }}
      />
    </>
  )
}

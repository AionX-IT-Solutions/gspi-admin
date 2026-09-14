import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportTrainingProfileExcel,
  exportTrainingProfilePdf,
  exportTrainingProfileDocx,
  buildTrainingProfilePdfDoc
} from '../lib/trainingProfilesExport'
import type { TrainingProfile } from '../types/trainingProfiles.types'

interface TrainingProfileExportMenuProps {
  profile: TrainingProfile
}

export function TrainingProfileExportMenu({ profile }: TrainingProfileExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        iconOnly
        title={t('trainingProfiles.exportLabel')}
        onView={async () => preview.openPreview(await buildTrainingProfilePdfDoc(profile, t))}
        onExportExcel={() => {
          exportTrainingProfileExcel(profile, t)
          toast.success(t('trainingProfiles.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportTrainingProfilePdf(profile, t)
          toast.success(t('trainingProfiles.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportTrainingProfileDocx(profile, t)
          toast.success(t('trainingProfiles.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={`${t('trainingProfiles.title')} — ${profile.name}`}
        onDownloadExcel={() => {
          exportTrainingProfileExcel(profile, t)
          toast.success(t('trainingProfiles.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportTrainingProfilePdf(profile, t)
          toast.success(t('trainingProfiles.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportTrainingProfileDocx(profile, t)
          toast.success(t('trainingProfiles.toast.exportedWord'))
        }}
      />
    </>
  )
}

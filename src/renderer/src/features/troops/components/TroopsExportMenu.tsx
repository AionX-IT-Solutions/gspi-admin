import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportTroopsExcel,
  exportTroopsPdf,
  exportTroopsDocx,
  buildTroopsPdfDoc,
  type TroopExportRow
} from '../lib/troopsExport'

interface TroopsExportMenuProps {
  troops: TroopExportRow[]
  membershipYear: string
}

export function TroopsExportMenu({ troops, membershipYear }: TroopsExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  function requireRows(): boolean {
    if (troops.length === 0) {
      toast.error(t('troops.toast.noneToExport'))
      return false
    }
    return true
  }

  return (
    <>
      <ExportMenu
        label={t('troops.exportButton')}
        onView={async () => {
          if (!requireRows()) return
          preview.openPreview(await buildTroopsPdfDoc(troops, membershipYear))
        }}
        onExportExcel={() => {
          if (!requireRows()) return
          exportTroopsExcel(troops, membershipYear)
          toast.success(t('troops.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          if (!requireRows()) return
          exportTroopsPdf(troops, membershipYear)
          toast.success(t('troops.toast.exportedPdf'))
        }}
        onExportWord={() => {
          if (!requireRows()) return
          exportTroopsDocx(troops, membershipYear)
          toast.success(t('troops.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('troops.title')}
        onDownloadExcel={() => {
          exportTroopsExcel(troops, membershipYear)
          toast.success(t('troops.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportTroopsPdf(troops, membershipYear)
          toast.success(t('troops.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportTroopsDocx(troops, membershipYear)
          toast.success(t('troops.toast.exportedWord'))
        }}
      />
    </>
  )
}

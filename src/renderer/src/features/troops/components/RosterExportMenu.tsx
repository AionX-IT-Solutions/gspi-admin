import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import {
  exportRosterExcel,
  exportRosterPdf,
  exportRosterDocx,
  buildRosterPdfDoc,
  type RosterExportRow
} from '../lib/rosterExport'

interface RosterExportMenuProps {
  roster: RosterExportRow[]
  troopNumber: string
  membershipYear: string
}

export function RosterExportMenu({ roster, troopNumber, membershipYear }: RosterExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const preview = useDocumentPreview()

  function requireRows(): boolean {
    if (roster.length === 0) {
      toast.error(t('troops.roster.toast.noneToExport'))
      return false
    }
    return true
  }

  return (
    <>
      <ExportMenu
        label={t('troops.roster.exportButton')}
        onView={async () => {
          if (!requireRows()) return
          preview.openPreview(await buildRosterPdfDoc(roster, troopNumber, membershipYear))
        }}
        onExportExcel={() => {
          if (!requireRows()) return
          exportRosterExcel(roster, troopNumber, membershipYear)
          toast.success(t('troops.roster.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          if (!requireRows()) return
          exportRosterPdf(roster, troopNumber, membershipYear)
          toast.success(t('troops.roster.toast.exportedPdf'))
        }}
        onExportWord={() => {
          if (!requireRows()) return
          exportRosterDocx(roster, troopNumber, membershipYear)
          toast.success(t('troops.roster.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('troops.roster.heading')}
        onDownloadExcel={() => {
          exportRosterExcel(roster, troopNumber, membershipYear)
          toast.success(t('troops.roster.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportRosterPdf(roster, troopNumber, membershipYear)
          toast.success(t('troops.roster.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportRosterDocx(roster, troopNumber, membershipYear)
          toast.success(t('troops.roster.toast.exportedWord'))
        }}
      />
    </>
  )
}

import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { DocumentPreviewModal } from '@/shared/components/ui/DocumentPreviewModal'
import { useDocumentPreview } from '@/shared/hooks/useDocumentPreview'
import { useToast } from '@/app/hooks/useToast'
import { useGoalsStore } from '../store/goals.store'
import {
  exportGoalsExcel,
  exportGoalsPdf,
  exportGoalsDocx,
  buildGoalsPdfDoc
} from '../lib/goalsExcelExport'
import type { GoalObjective } from '../types/goals.types'

interface GoalsExportMenuProps {
  achievedFor: (objective: GoalObjective) => number
  monthIndex: number
}

export function GoalsExportMenu({ achievedFor, monthIndex }: GoalsExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const goals = useGoalsStore((s) => s.goals)
  const programYear = useGoalsStore((s) => s.programYear)
  const preview = useDocumentPreview()

  return (
    <>
      <ExportMenu
        label={t('goals.exportLabel')}
        onView={async () =>
          preview.openPreview(await buildGoalsPdfDoc(goals, achievedFor, programYear, monthIndex))
        }
        onExportExcel={() => {
          exportGoalsExcel(goals, achievedFor, programYear, monthIndex)
          toast.success(t('goals.toast.exportedExcel'))
        }}
        onExportPdf={() => {
          exportGoalsPdf(goals, achievedFor, programYear, monthIndex)
          toast.success(t('goals.toast.exportedPdf'))
        }}
        onExportWord={() => {
          exportGoalsDocx(goals, achievedFor, programYear, monthIndex)
          toast.success(t('goals.toast.exportedWord'))
        }}
      />
      <DocumentPreviewModal
        open={preview.open}
        onClose={preview.closePreview}
        url={preview.url}
        title={t('goals.title')}
        onDownloadExcel={() => {
          exportGoalsExcel(goals, achievedFor, programYear, monthIndex)
          toast.success(t('goals.toast.exportedExcel'))
        }}
        onDownloadPdf={() => {
          exportGoalsPdf(goals, achievedFor, programYear, monthIndex)
          toast.success(t('goals.toast.exportedPdf'))
        }}
        onDownloadWord={() => {
          exportGoalsDocx(goals, achievedFor, programYear, monthIndex)
          toast.success(t('goals.toast.exportedWord'))
        }}
      />
    </>
  )
}

import { useTranslation } from 'react-i18next'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { useToast } from '@/app/hooks/useToast'
import { useGoalsStore } from '../store/goals.store'
import { exportGoalsExcel, exportGoalsPdf, exportGoalsDocx } from '../lib/goalsExcelExport'
import type { GoalObjective } from '../types/goals.types'

interface GoalsExportMenuProps {
  achievedFor: (objective: GoalObjective) => number
}

export function GoalsExportMenu({ achievedFor }: GoalsExportMenuProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const goals = useGoalsStore((s) => s.goals)
  const programYear = useGoalsStore((s) => s.programYear)

  const objectivesById = new Map(goals.flatMap((g) => g.objectives).map((o) => [o.id, o]))
  function achievedById(id: string): number {
    const objective = objectivesById.get(id)
    return objective ? achievedFor(objective) : 0
  }

  return (
    <ExportMenu
      label={t('goals.exportLabel')}
      onExportExcel={() => {
        exportGoalsExcel(goals, achievedById, programYear)
        toast.success(t('goals.toast.exportedExcel'))
      }}
      onExportPdf={() => {
        exportGoalsPdf(goals, achievedById, programYear)
        toast.success(t('goals.toast.exportedPdf'))
      }}
      onExportWord={() => {
        exportGoalsDocx(goals, achievedById, programYear)
        toast.success(t('goals.toast.exportedWord'))
      }}
    />
  )
}

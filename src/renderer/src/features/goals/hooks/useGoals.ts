import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGoalsStore } from '../store/goals.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import { fiscalMonthIndex, nextFiscalYearLabel } from '@/shared/lib/fiscalYear'
import type { Goal, GoalObjective } from '../types/goals.types'
import type { GoalDialogState } from '../components/GoalFormModal'
import type { ObjectiveDialogState } from '../components/ObjectiveFormModal'

export function useGoals() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:goals')

  const allGoals = useGoalsStore((s) => s.goals)
  const setMonthlyAchieved = useGoalsStore((s) => s.setMonthlyAchieved)
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const deleteObjective = useGoalsStore((s) => s.deleteObjective)
  const addObjective = useGoalsStore((s) => s.addObjective)
  const createProgramYearAction = useGoalsStore((s) => s.createProgramYear)
  const sales = usePOSStore((s) => s.sales)

  const [selectedProgramYear, setSelectedProgramYear] = useState('')
  const availableProgramYears = useMemo(
    () => [...new Set(allGoals.map((g) => g.fiscalYear))].sort(),
    [allGoals]
  )
  // Falls back to the latest known year until the user picks a different one, and
  // recovers automatically if the selected year's data ever disappears.
  const programYear = availableProgramYears.includes(selectedProgramYear)
    ? selectedProgramYear
    : (availableProgramYears.at(-1) ?? '')

  const goals = useMemo(
    () => allGoals.filter((g) => g.fiscalYear === programYear),
    [allGoals, programYear]
  )

  const currentMonthIndex =
    new Date().getMonth() >= 6 ? new Date().getMonth() - 6 : new Date().getMonth() + 6
  const [monthIndex, setMonthIndex] = useState(currentMonthIndex)

  const [activeGoalId, setActiveGoalId] = useState(() => goals[0]?.id ?? '')
  useEffect(() => {
    if (goals.length > 0 && !goals.some((g) => g.id === activeGoalId)) {
      setActiveGoalId(goals[0].id)
    }
  }, [goals, activeGoalId])

  const [goalDialog, setGoalDialog] = useState<GoalDialogState | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)

  const [objectiveDialog, setObjectiveDialog] = useState<ObjectiveDialogState | null>(null)
  const [deletingObjective, setDeletingObjective] = useState<{
    goalId: string
    objective: GoalObjective
  } | null>(null)

  // Scoped to the selected program year (and only through the currently viewed month, same as
  // a manual objective's monthlyAchieved slicing below) — an unscoped all-time sum would show
  // the exact same cumulative figure for every program year, including ones that predate the
  // sale, and would keep climbing well past 100% of a fresh year's target.
  const nesSalesTotal = useMemo(
    () =>
      sales
        .filter((s) => !s.voided)
        .reduce((sum, s) => {
          const idx = fiscalMonthIndex(s.createdAt, programYear)
          return idx !== null && idx <= monthIndex ? sum + s.totalAmount : sum
        }, 0),
    [sales, programYear, monthIndex]
  )

  function achievedFor(objective: GoalObjective): number {
    if (objective.autoSource === 'nesSales') return nesSalesTotal
    return objective.monthlyAchieved.slice(0, monthIndex + 1).reduce((sum, v) => sum + v, 0)
  }

  function handleConfirmDeleteGoal() {
    if (!deletingGoal) return
    const deleted = deletingGoal
    deleteGoal(deleted.id)
    toast.success(t('goals.toast.goalDeleted'), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => addGoal(deleted) }
    })
    setDeletingGoal(null)
  }

  function handleConfirmDeleteObjective() {
    if (!deletingObjective) return
    const { goalId, objective } = deletingObjective
    deleteObjective(goalId, objective.id)
    toast.success(t('goals.toast.objectiveDeleted'), {
      duration: 6000,
      action: { label: t('common.undo'), onClick: () => addObjective(goalId, objective) }
    })
    setDeletingObjective(null)
  }

  function handleCreateProgramYear(newProgramYear: string) {
    if (!canManage) return
    const trimmed = newProgramYear.trim()
    if (!trimmed) {
      toast.error(t('goals.toast.programYearRequired'))
      return
    }
    const result = createProgramYearAction(trimmed)
    if (!result.ok) {
      toast.error(t(result.error))
      return
    }
    setSelectedProgramYear(trimmed)
    toast.success(t('goals.toast.programYearCreated', { year: trimmed }))
  }

  const activeGoal = goals.find((g) => g.id === activeGoalId)

  return {
    canManage,
    programYear,
    setSelectedProgramYear,
    availableProgramYears,
    suggestedNextProgramYear: nextFiscalYearLabel(availableProgramYears.at(-1) ?? ''),
    handleCreateProgramYear,
    goals,
    setMonthlyAchieved,
    monthIndex,
    setMonthIndex,
    activeGoalId,
    setActiveGoalId,
    activeGoal,
    goalDialog,
    setGoalDialog,
    deletingGoal,
    setDeletingGoal,
    objectiveDialog,
    setObjectiveDialog,
    deletingObjective,
    setDeletingObjective,
    achievedFor,
    handleConfirmDeleteGoal,
    handleConfirmDeleteObjective
  }
}

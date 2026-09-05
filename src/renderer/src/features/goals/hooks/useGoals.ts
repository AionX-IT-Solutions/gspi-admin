import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGoalsStore } from '../store/goals.store'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { usePermissions } from '@/app/hooks/usePermissions'
import { useToast } from '@/app/hooks/useToast'
import type { Goal, GoalObjective } from '../types/goals.types'
import type { GoalDialogState } from '../components/GoalFormModal'
import type { ObjectiveDialogState } from '../components/ObjectiveFormModal'

export function useGoals() {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:goals')

  const programYear = useGoalsStore((s) => s.programYear)
  const goals = useGoalsStore((s) => s.goals)
  const setMonthlyAchieved = useGoalsStore((s) => s.setMonthlyAchieved)
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const deleteObjective = useGoalsStore((s) => s.deleteObjective)
  const addObjective = useGoalsStore((s) => s.addObjective)
  const sales = usePOSStore((s) => s.sales)

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

  const nesSalesTotal = useMemo(
    () => sales.filter((s) => !s.voided).reduce((sum, s) => sum + s.totalAmount, 0),
    [sales]
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

  const activeGoal = goals.find((g) => g.id === activeGoalId)

  return {
    canManage,
    programYear,
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

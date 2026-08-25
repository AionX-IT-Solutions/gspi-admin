import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGoalsStore } from '../store/goals.store'
import { useToast } from '@/app/hooks/useToast'
import type { Goal } from '../types/goals.types'
import type { GoalDialogState } from '../components/GoalFormModal'

export function useGoalFormModal(
  dialog: GoalDialogState | null,
  onClose: () => void,
  onCreated: (goalId: string) => void
) {
  const { t } = useTranslation()
  const toast = useToast()
  const goals = useGoalsStore((s) => s.goals)
  const addGoal = useGoalsStore((s) => s.addGoal)
  const updateGoal = useGoalsStore((s) => s.updateGoal)
  const [form, setForm] = useState({ code: '', title: '' })

  useEffect(() => {
    if (!dialog) return
    if (dialog.mode === 'edit' && dialog.goalId) {
      const goal = goals.find((g) => g.id === dialog.goalId)
      setForm({ code: goal?.code ?? '', title: goal?.title ?? '' })
    } else {
      setForm({ code: String(goals.length + 1), title: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog])

  function handleSave() {
    if (!form.title.trim()) {
      toast.error(t('goals.toast.missingTitle'))
      return
    }
    if (dialog?.mode === 'edit' && dialog.goalId) {
      updateGoal(dialog.goalId, {
        code: form.code.trim() || dialog.goalId,
        title: form.title.trim()
      })
      toast.success(t('goals.toast.goalUpdated'))
    } else {
      const goal: Goal = {
        id: crypto.randomUUID(),
        code: form.code.trim() || String(goals.length + 1),
        title: form.title.trim(),
        objectives: []
      }
      addGoal(goal)
      onCreated(goal.id)
      toast.success(t('goals.toast.goalCreated'))
    }
    onClose()
  }

  return { form, setForm, handleSave }
}

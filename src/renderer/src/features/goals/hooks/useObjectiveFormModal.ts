import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGoalsStore } from '../store/goals.store'
import { useToast } from '@/app/hooks/useToast'
import type { GoalObjective } from '../types/goals.types'
import type { ObjectiveDialogState } from '../components/ObjectiveFormModal'

type ObjectiveUnit = '' | 'peso' | 'percent'

export function useObjectiveFormModal(dialog: ObjectiveDialogState | null, onClose: () => void) {
  const { t } = useTranslation()
  const toast = useToast()
  const goals = useGoalsStore((s) => s.goals)
  const addObjective = useGoalsStore((s) => s.addObjective)
  const updateObjective = useGoalsStore((s) => s.updateObjective)
  const [form, setForm] = useState({
    code: '',
    label: '',
    annualTarget: '',
    unit: '' as ObjectiveUnit
  })

  useEffect(() => {
    if (!dialog) return
    if (dialog.mode === 'edit' && dialog.objectiveId) {
      const goal = goals.find((g) => g.id === dialog.goalId)
      const objective = goal?.objectives.find((o) => o.id === dialog.objectiveId)
      setForm({
        code: objective?.code ?? '',
        label: objective?.label ?? '',
        annualTarget: objective ? String(objective.annualTarget) : '',
        unit: objective?.unit ?? ''
      })
    } else {
      setForm({ code: '', label: '', annualTarget: '', unit: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog])

  function handleSave() {
    if (!dialog) return
    if (!form.code.trim() || !form.label.trim()) {
      toast.error(t('goals.toast.missingObjectiveFields'))
      return
    }
    const annualTarget = parseFloat(form.annualTarget) || 0
    const unit: 'peso' | 'percent' | undefined = form.unit || undefined

    if (dialog.mode === 'edit' && dialog.objectiveId) {
      updateObjective(dialog.goalId, dialog.objectiveId, {
        code: form.code.trim(),
        label: form.label.trim(),
        annualTarget,
        unit
      })
      toast.success(t('goals.toast.objectiveUpdated'))
    } else {
      const objective: GoalObjective = {
        id: crypto.randomUUID(),
        code: form.code.trim(),
        label: form.label.trim(),
        annualTarget,
        monthlyAchieved: Array.from({ length: 12 }, () => 0),
        unit
      }
      addObjective(dialog.goalId, objective)
      toast.success(t('goals.toast.objectiveCreated'))
    }
    onClose()
  }

  return { form, setForm, handleSave }
}

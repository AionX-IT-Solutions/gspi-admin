import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import { DEFAULT_PROGRAM_YEAR, type Goal, type GoalObjective } from '../types/goals.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

export type CreateProgramYearResult = { ok: true } | { ok: false; error: string }

interface GoalsState {
  goals: Goal[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  setMonthlyAchieved: (objectiveId: string, monthIndex: number, value: number) => void
  addGoal: (goal: Goal) => void
  updateGoal: (goalId: string, patch: Partial<Pick<Goal, 'code' | 'title'>>) => void
  deleteGoal: (goalId: string) => void
  addObjective: (goalId: string, objective: GoalObjective) => void
  updateObjective: (
    goalId: string,
    objectiveId: string,
    patch: Partial<Pick<GoalObjective, 'code' | 'label' | 'annualTarget' | 'unit'>>
  ) => void
  deleteObjective: (goalId: string, objectiveId: string) => void
  /** Rolls the latest program year's goals/objectives forward into a new one — same
   *  code/title/objective structure, annual targets reset to 0 pending council approval
   *  and monthly progress cleared, matching budget.store.ts's createFiscalYear. */
  createProgramYear: (newProgramYear: string) => CreateProgramYearResult
}

export const useGoalsStore = create<GoalsState>()((set, get) => ({
  goals: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const goals = await hydrateCollection<Goal>('goals')
      // Goal docs created before per-year tracking have no fiscalYear — treat them as
      // belonging to the original program year rather than requiring a migration script.
      const normalized = goals.map((g) => ({
        ...g,
        fiscalYear: g.fiscalYear ?? DEFAULT_PROGRAM_YEAR
      }))
      set({ goals: normalized, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[goals.store] Failed to hydrate', err)
    }
  },

  setMonthlyAchieved: (objectiveId, monthIndex, value) => {
    set((s) => ({
      goals: s.goals.map((goal) => ({
        ...goal,
        objectives: goal.objectives.map((obj) =>
          obj.id === objectiveId
            ? {
                ...obj,
                monthlyAchieved: obj.monthlyAchieved.map((v, i) => (i === monthIndex ? value : v))
              }
            : obj
        )
      }))
    }))
    const goal = get().goals.find((g) => g.objectives.some((o) => o.id === objectiveId))
    if (goal) persistDoc('goals', goal.id, goal)
    const objective = goal?.objectives.find((o) => o.id === objectiveId)
    appendAuditLog({
      action: 'goal_progress_updated',
      actorName: actorName(),
      entityType: 'goal_objective',
      summary: `${objective?.code ?? objectiveId} progress updated for month ${monthIndex + 1}`
    })
  },

  addGoal: (goal) => {
    set((s) => ({ goals: [...s.goals, goal] }))
    persistDoc('goals', goal.id, goal)
    appendAuditLog({
      action: 'goal_created',
      actorName: actorName(),
      entityType: 'goal',
      summary: `Goal ${goal.code} — "${goal.title}" created`
    })
  },

  updateGoal: (goalId, patch) => {
    set((s) => ({ goals: s.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)) }))
    const goal = get().goals.find((g) => g.id === goalId)
    if (goal) persistDoc('goals', goalId, goal)
    appendAuditLog({
      action: 'goal_updated',
      actorName: actorName(),
      entityType: 'goal',
      summary: `Goal ${goal?.code ?? goalId} — "${goal?.title ?? ''}" updated`
    })
  },

  deleteGoal: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) }))
    deleteDocById('goals', goalId)
    appendAuditLog({
      action: 'goal_deleted',
      actorName: actorName(),
      entityType: 'goal',
      summary: `Goal ${goal?.code ?? goalId} — "${goal?.title ?? ''}" deleted`
    })
  },

  addObjective: (goalId, objective) => {
    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === goalId ? { ...g, objectives: [...g.objectives, objective] } : g
      )
    }))
    const goal = get().goals.find((g) => g.id === goalId)
    if (goal) persistDoc('goals', goalId, goal)
    appendAuditLog({
      action: 'goal_objective_created',
      actorName: actorName(),
      entityType: 'goal_objective',
      summary: `Objective ${objective.code} — "${objective.label}" added`
    })
  },

  updateObjective: (goalId, objectiveId, patch) => {
    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              objectives: g.objectives.map((o) => (o.id === objectiveId ? { ...o, ...patch } : o))
            }
          : g
      )
    }))
    const goal = get().goals.find((g) => g.id === goalId)
    if (goal) persistDoc('goals', goalId, goal)
    const objective = goal?.objectives.find((o) => o.id === objectiveId)
    appendAuditLog({
      action: 'goal_objective_updated',
      actorName: actorName(),
      entityType: 'goal_objective',
      summary: `Objective ${objective?.code ?? objectiveId} updated`
    })
  },

  deleteObjective: (goalId, objectiveId) => {
    const objective = get()
      .goals.find((g) => g.id === goalId)
      ?.objectives.find((o) => o.id === objectiveId)
    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === goalId ? { ...g, objectives: g.objectives.filter((o) => o.id !== objectiveId) } : g
      )
    }))
    const goal = get().goals.find((g) => g.id === goalId)
    if (goal) persistDoc('goals', goalId, goal)
    appendAuditLog({
      action: 'goal_objective_deleted',
      actorName: actorName(),
      entityType: 'goal_objective',
      summary: `Objective ${objective?.code ?? objectiveId} deleted`
    })
  },

  createProgramYear: (newProgramYear) => {
    const goals = get().goals
    if (goals.some((g) => g.fiscalYear === newProgramYear)) {
      return { ok: false, error: 'goals.toast.programYearExists' }
    }
    const years = [...new Set(goals.map((g) => g.fiscalYear))].sort()
    const latestYear = years.at(-1)
    const source = goals.filter((g) => g.fiscalYear === latestYear)
    if (source.length === 0) {
      return { ok: false, error: 'goals.toast.noSourceYear' }
    }

    const created: Goal[] = source.map((g) => ({
      id: crypto.randomUUID(),
      fiscalYear: newProgramYear,
      code: g.code,
      title: g.title,
      objectives: g.objectives.map((o) => ({
        id: crypto.randomUUID(),
        code: o.code,
        label: o.label,
        annualTarget: 0,
        unit: o.unit,
        monthlyAchieved: Array(12).fill(0),
        autoSource: o.autoSource
      }))
    }))
    created.forEach((goal) => persistDoc('goals', goal.id, goal))
    set((s) => ({ goals: [...s.goals, ...created] }))
    appendAuditLog({
      action: 'goal_program_year_created',
      actorName: actorName(),
      entityType: 'goal',
      summary: `Program year ${newProgramYear} created, rolled forward from ${latestYear}.`
    })
    return { ok: true }
  }
}))

export type GoalCode = string

export interface GoalObjective {
  id: string
  code: string
  label: string
  annualTarget: number
  unit?: 'peso' | 'percent'
  /** 12 entries, index 0 = July (start of the GSP program year) through index 11 = June. */
  monthlyAchieved: number[]
  /** When set, "achieved" for this objective is computed live from another module's data
   *  instead of manual monthly entry (e.g. NES sales pulled from the POS/Inventory sales log). */
  autoSource?: 'nesSales'
}

export interface Goal {
  id: string
  fiscalYear: string
  code: GoalCode
  title: string
  objectives: GoalObjective[]
}

/** Program year used for any goal doc predating per-year tracking (see goals.store.ts). */
export const DEFAULT_PROGRAM_YEAR = '2025-2026'

export const PROGRAM_MONTHS = [
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun'
] as const

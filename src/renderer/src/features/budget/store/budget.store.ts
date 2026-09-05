import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { BudgetCategory } from '../types/budget.types'
import { STARTING_BUDGET_CATEGORIES, STARTING_BUDGET_FISCAL_YEAR } from '../lib/startingBudget'
import {
  AUTO_ACTUAL_CATEGORY_NAMES,
  LEGACY_SEEDED_MONTHLY_ACTUALS
} from '../lib/legacySeededActuals'
import { actualToDate } from '../lib/budgetCalculations'

function currentUser() {
  return useAppStore.getState().currentUser
}

// Mirrors the Firestore write rule for `budgetCategories` (super_admin/admin/accountant) —
// checked client-side purely to decide whether THIS session is the one that should
// seed starting data, so sessions without write access don't repeatedly attempt
// (and fail) a write.
function canSeedBudget(): boolean {
  const role = currentUser()?.role
  return role === 'super_admin' || role === 'admin' || role === 'accountant'
}

export interface BudgetCategoryEdit {
  budgetedAmount: number
  monthlyActuals: number[]
}

export type CreateFiscalYearResult = { ok: true } | { ok: false; error: string }

interface BudgetState {
  categories: BudgetCategory[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  updateCategory: (id: string, edit: BudgetCategoryEdit) => void
  /** Rolls the latest fiscal year's category structure forward into a new one — same
   *  group/subGroup/name/order, budgetedAmount reset to 0 pending board approval, and
   *  this expiring year's budget/actual-to-date carried into the new year's prior-year
   *  reference columns (same relationship the source workbook itself uses year to year). */
  createFiscalYear: (newFiscalYear: string) => CreateFiscalYearResult
}

// One-off cleanup for sessions that already auto-seeded before these rows were dropped
// from STARTING_BUDGET_CATEGORIES. Matches by name/section rather than id, since seeded
// ids are positional and shift whenever the starting list changes shape.
// - "Service Vehicle": a stray sub-header row in the source workbook, not a real budget
//   line — its one figure was already folded into "9. Acquisition, Registration,
//   Insurance & Maintenance - Vehicle" via a formula in the sheet.
// - "2. Share from Membership Fees with RHQ", "2. Souvenir Items Income", "3. Cash
//   Prizes", "4. Escoda Fund", "5. Thinking Day Fund" (income): rows the workbook
//   itself keeps hidden — the Council doesn't carry them into the active 2026-2027
//   budget, only into the prior-year reference columns.
const REMOVED_LEGACY_CATEGORY_NAMES = new Set([
  'Service Vehicle',
  '2. Share from Membership Fees with RHQ',
  '2. Souvenir Items Income',
  '3. Cash Prizes',
  '4. Escoda Fund',
  '5. Thinking Day Fund'
])

function pruneLegacyCategories(categories: BudgetCategory[]): BudgetCategory[] {
  const stale = categories.filter((c) => REMOVED_LEGACY_CATEGORY_NAMES.has(c.name))
  if (stale.length === 0) return categories
  if (canSeedBudget()) {
    stale.forEach((c) => deleteDocById('budgetCategories', c.id))
  }
  const staleIds = new Set(stale.map((c) => c.id))
  return categories.filter((c) => !staleIds.has(c.id))
}

const LEGACY_MONTHLY_ACTUALS_BY_KEY = new Map(
  LEGACY_SEEDED_MONTHLY_ACTUALS.map((r) => [`${r.section}:${r.name}`, r.monthlyActuals])
)

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

// One-off cleanup for sessions that already auto-seeded with the workbook's "as of
// July 31" actuals pre-filled — those were meant to be entered as real transactions
// happen (or pulled from a live source), not carried over from the old spreadsheet.
// Zeroes a category's monthlyActuals only if it still exactly matches what was
// originally seeded (so a manual edit — including a deliberate zero — is never
// touched) and it isn't one of the categories with a live POS/Rentals/Payroll source
// (see AUTO_ACTUAL_CATEGORY_NAMES / budgetAutoActuals.ts), which are left alone on
// purpose. Naturally becomes a no-op forever after the first successful pass, since
// a zeroed array no longer matches the (mostly non-zero) legacy snapshot.
function pruneStaleManualActuals(categories: BudgetCategory[]): BudgetCategory[] {
  const now = new Date().toISOString()
  let changed = false
  const next = categories.map((c) => {
    if (AUTO_ACTUAL_CATEGORY_NAMES.has(c.name)) return c
    const legacy = LEGACY_MONTHLY_ACTUALS_BY_KEY.get(`${c.section}:${c.name}`)
    if (!legacy || !arraysEqual(c.monthlyActuals, legacy)) return c
    changed = true
    const updated: BudgetCategory = { ...c, monthlyActuals: Array(12).fill(0), updatedAt: now }
    if (canSeedBudget()) persistDoc('budgetCategories', c.id, updated)
    return updated
  })
  if (changed && canSeedBudget()) {
    appendAuditLog({
      action: 'budget_actuals_reset',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'budget',
      summary:
        'Reset manually-entered budget actual-to-date figures to zero (live-sourced lines left as-is).'
    })
  }
  return next
}

function seedStartingBudget(): BudgetCategory[] {
  const now = new Date().toISOString()
  const seeded: BudgetCategory[] = STARTING_BUDGET_CATEGORIES.map((item, i) => ({
    ...item,
    id: `${STARTING_BUDGET_FISCAL_YEAR}-${item.section}-${i}`,
    fiscalYear: STARTING_BUDGET_FISCAL_YEAR,
    createdAt: now,
    updatedAt: now
  }))
  seeded.forEach((category) => persistDoc('budgetCategories', category.id, category))
  return seeded
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  categories: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      let categories = await hydrateCollection<BudgetCategory>('budgetCategories')
      if (categories.length === 0 && canSeedBudget()) {
        categories = seedStartingBudget()
      } else {
        categories = pruneLegacyCategories(categories)
        categories = pruneStaleManualActuals(categories)
      }
      set({ categories, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[budget.store] Failed to hydrate', err)
    }
  },

  updateCategory: (id, edit) => {
    const existing = get().categories.find((c) => c.id === id)
    if (!existing) return
    const updated: BudgetCategory = { ...existing, ...edit, updatedAt: new Date().toISOString() }
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? updated : c)) }))
    persistDoc('budgetCategories', id, updated)
    appendAuditLog({
      action: 'budget_category_updated',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'budget',
      summary: `Budget line "${updated.name}" (${updated.fiscalYear}) updated.`
    })
  },

  createFiscalYear: (newFiscalYear) => {
    const categories = get().categories
    if (categories.some((c) => c.fiscalYear === newFiscalYear)) {
      return { ok: false, error: 'budget.toast.fiscalYearExists' }
    }
    const years = [...new Set(categories.map((c) => c.fiscalYear))].sort()
    const latestYear = years.at(-1)
    const source = categories.filter((c) => c.fiscalYear === latestYear)
    if (source.length === 0) {
      return { ok: false, error: 'budget.toast.noSourceYear' }
    }

    const now = new Date().toISOString()
    const created: BudgetCategory[] = source.map((c) => ({
      id: crypto.randomUUID(),
      fiscalYear: newFiscalYear,
      section: c.section,
      group: c.group,
      subGroup: c.subGroup,
      name: c.name,
      order: c.order,
      budgetedAmount: 0,
      monthlyActuals: Array(12).fill(0),
      priorYearBudget: c.budgetedAmount,
      priorYearActual: actualToDate(c),
      priorYearMonthlyActuals: c.monthlyActuals,
      createdAt: now,
      updatedAt: now
    }))
    created.forEach((category) => persistDoc('budgetCategories', category.id, category))
    set((s) => ({ categories: [...s.categories, ...created] }))
    appendAuditLog({
      action: 'budget_fiscal_year_created',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'budget',
      summary: `Fiscal year ${newFiscalYear} created, rolled forward from ${latestYear}.`
    })
    return { ok: true }
  }
}))

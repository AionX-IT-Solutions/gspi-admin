// Snapshot of the `monthlyActuals` figures this module originally auto-seeded
// (imported from the source workbook's "as of July 31, 2026" actual-to-date column)
// — kept only so `pruneStaleManualActuals` in budget.store.ts can safely zero them
// out once, for any environment that already auto-seeded before actuals were changed
// to start at zero. Categories with a live data source (see budgetAutoActuals.ts /
// AUTO_ACTUAL_CATEGORY_NAMES below) are excluded — those figures stay untouched.
export const LEGACY_SEEDED_MONTHLY_ACTUALS: {
  section: 'income' | 'expense'
  name: string
  monthlyActuals: number[]
}[] = [
  {
    section: 'income',
    name: '1. Council Support Fund',
    monthlyActuals: [750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'income',
    name: '2. Troop, BC/DC Fees',
    monthlyActuals: [510, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'income',
    name: '1. Council Equipment Service',
    monthlyActuals: [3199.82, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'income',
    name: 'C. Interest in Banks',
    monthlyActuals: [110.78, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'income',
    name: '1.1 Space Rental',
    monthlyActuals: [350170.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'income',
    name: '1.2 Hall Rental',
    monthlyActuals: [110000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '1. Salaries',
    monthlyActuals: [113276.98, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '2. SSS Contributions',
    monthlyActuals: [11890, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '3. PhilHealth Contributions',
    monthlyActuals: [2450.06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '4. Pag-IBIG Contributions',
    monthlyActuals: [1400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '5. 13th Month Pay',
    monthlyActuals: [54400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '7. Representation of Executive',
    monthlyActuals: [4500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '8. Cost of Living Allowance',
    monthlyActuals: [24000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '1. Transportation & Travel and Gasoline',
    monthlyActuals: [2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '2. Office Supplies',
    monthlyActuals: [11856.52, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '3. Postage and Freight',
    monthlyActuals: [2483, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '4. Telephone & Communications',
    monthlyActuals: [5140.97, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '6. Trainings',
    monthlyActuals: [23795.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '7. Conferences & Meeting',
    monthlyActuals: [11791.44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '9. Acquisition, Registration, Insurance & Maintenance - Vehicle',
    monthlyActuals: [20700, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '10. Acquisition of Office Equipment',
    monthlyActuals: [122731, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '11. Repair & Maintenance - Office Equipment',
    monthlyActuals: [5157.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '15. Representation',
    monthlyActuals: [541.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '28. Insurance',
    monthlyActuals: [221725, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '31. Miscellaneous',
    monthlyActuals: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '1. Souvenir Book',
    monthlyActuals: [210, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '2. Donations and Contributions',
    monthlyActuals: [30000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    name: '1. Building Repair & Maintenance - Headquarters & Campsite',
    monthlyActuals: [17038.79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
]

// The category names budgetAutoActuals.ts matches unconditionally by name (POS
// equipment-service sales, Rentals space/hall/room bookings, and the payroll-field
// personnel lines) — these are never included in the zero-out cleanup, regardless of
// whether live source data happens to exist yet.
export const AUTO_ACTUAL_CATEGORY_NAMES = new Set([
  '1. Council Equipment Service',
  '1.1 Space Rental',
  '1.2 Hall Rental',
  '1.3 Room Rental',
  '1. Salaries',
  '2. SSS Contributions',
  '3. PhilHealth Contributions',
  '4. Pag-IBIG Contributions',
  '5. 13th Month Pay',
  '8. Cost of Living Allowance',
  '10. Cash Gift'
])

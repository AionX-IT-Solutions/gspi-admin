// Auto-generated starting dataset for fiscal year 2026-2027, mechanically extracted
// (see scripts/_extractBudget.mjs) from the council-approved "2026-2027-Council-Budget.xlsx"
// workbook's "COUNCIL BUDGET" sheet — every category here is a visible (non-hidden) line
// item with real 2026-2027 figures; the workbook's own hidden rows (e.g. "Share from
// Membership Fees with RHQ", "Souvenir Items Income", "Cash Prizes", "Escoda Fund",
// "Thinking Day Fund" under income, "Service Vehicle" under expenses) are intentionally
// excluded since the Council itself doesn't carry them into the active budget. Seeded once
// into the `budgetCategories` Firestore collection by an admin's session when that
// collection is still empty (see budget.store.ts) — the same "ships starting data, seeded
// on first run" convention used elsewhere in the app (e.g. hr.store.ts's Comp Time leave type).
//
// Field notes:
// - budgetedAmount is this fiscal year's board-approved target (the workbook's "Proposed" column).
// - monthlyActuals (this fiscal year's Jul-Jun actuals) all start at 0 — nothing has been
//   tracked in the app yet; each month gets filled in (manually, or via Reports > Council
//   Budget's live-data sync) as it closes.
// - priorYearBudget/priorYearActual/priorYearMonthlyActuals are FY 2025-2026 reference
//   figures ("2025-2026 Budget" / "As of June 30, 2026" / Jul-Jun monthly columns in the
//   workbook), carried over for the variance/comparison columns — never edited going forward.
import type { BudgetCategory } from '../types/budget.types'

export const STARTING_BUDGET_FISCAL_YEAR = '2026-2027'

export type StartingBudgetCategory = Omit<
  BudgetCategory,
  'id' | 'fiscalYear' | 'createdAt' | 'updatedAt'
>

export const STARTING_BUDGET_CATEGORIES: StartingBudgetCategory[] = [
  {
    section: 'income',
    group: 'I. OPERATIONS',
    subGroup: 'A. Fees',
    name: '1. Council Support Fund',
    order: 1,
    budgetedAmount: 300000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 300000,
    priorYearActual: 234247.5,
    priorYearMonthlyActuals: [780, 3730, 52730, 116310, 35850, 20460, 1530, 1960, 370, 517.5, 0, 10]
  },
  {
    section: 'income',
    group: 'I. OPERATIONS',
    subGroup: 'A. Fees',
    name: '2. Troop, BC/DC Fees',
    order: 2,
    budgetedAmount: 25000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 30000,
    priorYearActual: 23277.5,
    priorYearMonthlyActuals: [520, 505, 5410, 9470, 3852.5, 1812.5, 820, 237.5, 285, 45, 260, 60]
  },
  {
    section: 'income',
    group: 'I. OPERATIONS',
    subGroup: 'A. Fees',
    name: '3. Training Fees',
    order: 3,
    budgetedAmount: 50000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 100000,
    priorYearActual: 0,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'income',
    group: 'I. OPERATIONS',
    subGroup: 'A. Fees',
    name: '4. Camping Fees',
    order: 4,
    budgetedAmount: 700000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 600000,
    priorYearActual: 537850,
    priorYearMonthlyActuals: [0, 0, 38150, 0, 445700, 0, 0, 54000, 0, 0, 0, 0]
  },
  {
    section: 'income',
    group: 'I. OPERATIONS',
    subGroup: 'B. Operational Income',
    name: '1. Council Equipment Service',
    order: 5,
    budgetedAmount: 450000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 340000,
    priorYearActual: 436895.82999999996,
    priorYearMonthlyActuals: [
      12829.29, 45081.83, 155539.91, 79091.12, 77807.12, 6294.1, 3454.41, 20871.71, 31872.82,
      1515.47, 2538.05, 0
    ]
  },
  {
    section: 'income',
    group: 'I. OPERATIONS',
    subGroup: 'C. Interest in Banks',
    name: 'C. Interest in Banks',
    order: 6,
    budgetedAmount: 6000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 2500,
    priorYearActual: 5597.88,
    priorYearMonthlyActuals: [
      307.98, 0, 1168.04, 308.96, 309.28, 751.78, 309.92, 310.25, 671.98, 457.16, 296.38, 706.15
    ]
  },
  {
    section: 'income',
    group: 'II. CAPITAL',
    subGroup: 'A. Building Fund',
    name: '1.1 Space Rental',
    order: 7,
    budgetedAmount: 4200000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 4000000,
    priorYearActual: 4055622.48,
    priorYearMonthlyActuals: [
      333495.53, 333495.33, 333495.33, 333495.33, 244034.27, 333495.53, 431902.91, 342441.65,
      342441.65, 342441.65, 342441.65, 342441.65
    ]
  },
  {
    section: 'income',
    group: 'II. CAPITAL',
    subGroup: 'A. Building Fund',
    name: '1.2 Hall Rental',
    order: 8,
    budgetedAmount: 500000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 350000,
    priorYearActual: 385600,
    priorYearMonthlyActuals: [0, 37300, 66000, 25000, 62000, 57000, 41600, 4200, 0, 11000, 81500, 0]
  },
  {
    section: 'income',
    group: 'II. CAPITAL',
    subGroup: 'A. Building Fund',
    name: '1.3 Room Rental',
    order: 9,
    budgetedAmount: 100000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 100000,
    priorYearActual: 37170,
    priorYearMonthlyActuals: [1800, 0, 3690, 1800, 0, 1800, 0, 3600, 0, 0, 24480, 0]
  },
  {
    section: 'income',
    group: 'II. CAPITAL',
    subGroup: 'A. Building Fund',
    name: '2. Proceeds from Fund Drives',
    order: 10,
    budgetedAmount: 500000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 450000,
    priorYearActual: 557304.5,
    priorYearMonthlyActuals: [0, 12616, 8583, 3841.25, 195116.75, 0, 0, 37147.5, 0, 300000, 0, 0]
  },
  {
    section: 'income',
    group: 'III. OTHER INCOME',
    subGroup: '',
    name: '1. Miscellaneous Income',
    order: 11,
    budgetedAmount: 150000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 0,
    priorYearActual: 85097,
    priorYearMonthlyActuals: [13490, 1187, 12933, 9188, 3894, 11340, 30160, 2845, 50, 10, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '1. Salaries',
    order: 12,
    budgetedAmount: 1560000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 1500000,
    priorYearActual: 1407396.91,
    priorYearMonthlyActuals: [
      92227.76, 59212.5, 177637.5, 118425, 59212.5, 175859.5, 113407, 113407, 113407, 101083.65,
      170110.5, 113407
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '2. SSS Contributions',
    order: 13,
    budgetedAmount: 153000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 137000,
    priorYearActual: 127600,
    priorYearMonthlyActuals: [6090, 0, 23760, 11880, 0, 22450, 10570, 10570, 10570, 0, 21140, 10570]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '3. PhilHealth Contributions',
    order: 14,
    budgetedAmount: 30000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 28000,
    priorYearActual: 25812.72,
    priorYearMonthlyActuals: [
      1501.64, 0, 4738.38, 2369.18, 0, 4488.38, 2119.19, 2119.19, 2119.19, 0, 4238.38, 2119.19
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '4. Pag-IBIG Contributions',
    order: 15,
    budgetedAmount: 17000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 16000,
    priorYearActual: 15125.24,
    priorYearMonthlyActuals: [1125.24, 0, 2800, 1400, 0, 2600, 1200, 1200, 1200, 0, 2400, 1200]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '5. 13th Month Pay',
    order: 16,
    budgetedAmount: 110000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 123000,
    priorYearActual: 61851.09,
    priorYearMonthlyActuals: [0, 0, 0, 0, 61851.09, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '7. Representation of Executive',
    order: 17,
    budgetedAmount: 56000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 56000,
    priorYearActual: 36000,
    priorYearMonthlyActuals: [0, 0, 0, 4500, 2250, 6750, 4500, 4500, 4500, 2250, 6750, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '8. Cost of Living Allowance',
    order: 18,
    budgetedAmount: 336000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 348000,
    priorYearActual: 260500,
    priorYearMonthlyActuals: [
      12000, 6000, 18000, 20500, 14500, 39500, 25000, 25000, 25000, 12500, 37500, 25000
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '9. Clothing Allowance',
    order: 19,
    budgetedAmount: 49000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 49000,
    priorYearActual: 42000,
    priorYearMonthlyActuals: [0, 0, 0, 0, 28000, 0, 0, 14000, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '10. Cash Gift',
    order: 20,
    budgetedAmount: 70000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 70000,
    priorYearActual: 60000,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 60000, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '11. Monetized Unused Leaves',
    order: 21,
    budgetedAmount: 60000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 60000,
    priorYearActual: 14400,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 14400, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'A. PERSONNEL SERVICE',
    name: '12. Retirement Fund - Council Executive and Staff',
    order: 22,
    budgetedAmount: 129000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 50000,
    priorYearActual: 113407,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 113407]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '1. Transportation & Travel and Gasoline',
    order: 23,
    budgetedAmount: 45000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 40000,
    priorYearActual: 44745.28,
    priorYearMonthlyActuals: [
      10210, 0, 5310, 2100, 2000, 2150, 2100, 6940, 2000, 3560, 4375, 4000.28
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '2. Office Supplies',
    order: 24,
    budgetedAmount: 150000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 50000,
    priorYearActual: 165770.58,
    priorYearMonthlyActuals: [
      8147.55, 3133, 6831.73, 6019.25, 3988, 5148, 13995.95, 54364.3, 20608.75, 37351, 1710.15,
      4472.9
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '3. Postage and Freight',
    order: 25,
    budgetedAmount: 8000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 6000,
    priorYearActual: 7581,
    priorYearMonthlyActuals: [870, 205, 330, 845, 765, 365, 1435, 330, 330, 565, 724, 817]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '4. Telephone & Communications',
    order: 26,
    budgetedAmount: 45000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 45000,
    priorYearActual: 40847.280000000006,
    priorYearMonthlyActuals: [
      3329, 1490, 3328.64, 0, 7879.88, 5140.97, 4845.94, 3328.97, 3328.97, 3328.97, 0, 4845.94
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '5. Electric Bill',
    order: 27,
    budgetedAmount: 220000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 220000,
    priorYearActual: 180645.87,
    priorYearMonthlyActuals: [
      0, 14611.9, 32018.35, 18008.79, 14220.13, 12759.91, 28989.02, 0, 31624.61, 0, 8286.83,
      20126.33
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '6. Trainings',
    order: 28,
    budgetedAmount: 340000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 350000,
    priorYearActual: 332364.4,
    priorYearMonthlyActuals: [0, 113374.18, 70298.05, 0, 133606.67, 0, 1300, 13785.5, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '7. Conferences & Meeting',
    order: 29,
    budgetedAmount: 170000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 100000,
    priorYearActual: 153574.71,
    priorYearMonthlyActuals: [
      12376.5, 10698.1, 18759.05, 33033.37, 3588.05, 3326, 9968.95, 8129.5, 39008.79, 8697.65, 0,
      5988.75
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '8. Campings',
    order: 30,
    budgetedAmount: 400000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 300000,
    priorYearActual: 674162.15,
    priorYearMonthlyActuals: [0, 0, 0, 0, 275194.35, 258883.9, 0, 15346.65, 124737.25, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '9. Acquisition, Registration, Insurance & Maintenance - Vehicle',
    order: 31,
    budgetedAmount: 100000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 60000,
    priorYearActual: 143728,
    priorYearMonthlyActuals: [0, 0, 5910, 0, 0, 0, 4899, 2100, 0, 0, 0, 130819]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '10. Acquisition of Office Equipment',
    order: 32,
    budgetedAmount: 500000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 620000,
    priorYearActual: 800856,
    priorYearMonthlyActuals: [0, 0, 344900, 265000, 8400, 0, 0, 111556, 71000, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '11. Repair & Maintenance - Office Equipment',
    order: 33,
    budgetedAmount: 50000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 10000,
    priorYearActual: 11000,
    priorYearMonthlyActuals: [0, 0, 0, 0, 11000, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '12. Acquisition of Kitchen Equipment',
    order: 34,
    budgetedAmount: 5000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 5000,
    priorYearActual: 12000,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 12000, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '13. Acquisition & Maintenance of Linens',
    order: 35,
    budgetedAmount: 15000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 15000,
    priorYearActual: 10343.25,
    priorYearMonthlyActuals: [2716.05, 1943.85, 0, 1626.05, 0, 2036, 431.3, 0, 0, 1115, 0, 475]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '14. Furniture and Fixtures',
    order: 36,
    budgetedAmount: 50000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 10000,
    priorYearActual: 184640,
    priorYearMonthlyActuals: [0, 7740, 20125, 0, 6875, 0, 0, 52000, 0, 0, 0, 97900]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '15. Representation',
    order: 37,
    budgetedAmount: 15000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 10000,
    priorYearActual: 14510.689999999999,
    priorYearMonthlyActuals: [
      664.9, 169.65, 2600, 801, 0, 1965, 1540.35, 2597.79, 932, 715, 1489, 1036
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '16. Professional Fees',
    order: 38,
    budgetedAmount: 10000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 25000,
    priorYearActual: 9000,
    priorYearMonthlyActuals: [3000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6000, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '17. Evaluation',
    order: 39,
    budgetedAmount: 20000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 20000,
    priorYearActual: 21519,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 5568.5, 15950.5, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '18. National Girl Scouts Scheme Medalist Award',
    order: 40,
    budgetedAmount: 150000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 150000,
    priorYearActual: 104661.3,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 104661.3, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '19. Educational Trek',
    order: 41,
    budgetedAmount: 600000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 700000,
    priorYearActual: 719656.9600000001,
    priorYearMonthlyActuals: [499500, 39960, 24427.56, 0, 155769.4, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '20. Tulong Bata',
    order: 42,
    budgetedAmount: 50000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 40000,
    priorYearActual: 30145.8,
    priorYearMonthlyActuals: [0, 19999.8, 0, 0, 0, 0, 10146, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '21. World Thinking Day',
    order: 43,
    budgetedAmount: 100000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 50000,
    priorYearActual: 126023.4,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 3015, 123008.4, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '23. Thinking Day Fund',
    order: 44,
    budgetedAmount: 3845,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 3000,
    priorYearActual: 2312.5,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 2312.5, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '24. Escoda Fund',
    order: 45,
    budgetedAmount: 56110,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 25000,
    priorYearActual: 25626,
    priorYearMonthlyActuals: [0, 0, 0, 0, 5640, 0, 28110, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '25. Christmas Program',
    order: 46,
    budgetedAmount: 200000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 200000,
    priorYearActual: 125296.2,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 125296.2, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '26. Taxes and Licenses',
    order: 47,
    budgetedAmount: 20000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 257000,
    priorYearActual: 262511.68,
    priorYearMonthlyActuals: [0, 256911.68, 0, 0, 0, 0, 4560, 1040, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '27. Advertising and Publicity',
    order: 48,
    budgetedAmount: 30000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 0,
    priorYearActual: 9025.7,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 6025.7, 3000, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '28. Insurance',
    order: 49,
    budgetedAmount: 221725,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 221725,
    priorYearActual: 221725,
    priorYearMonthlyActuals: [221725, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '29. Program Expense',
    order: 50,
    budgetedAmount: 110000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 0,
    priorYearActual: 275554.74,
    priorYearMonthlyActuals: [
      24925.86, 0, 31321.5, 139138.43, 40000, 7289.3, 0, 0, 0, 8714.5, 0, 24165.15
    ]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '30. Contingency Fund',
    order: 51,
    budgetedAmount: 75000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 20000,
    priorYearActual: 0,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'I. OPERATIONS',
    subGroup: 'B. MAINTENANCE & OTHER OPERATING EXPENSES',
    name: '31. Miscellaneous',
    order: 52,
    budgetedAmount: 50000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 20000,
    priorYearActual: 21762.2,
    priorYearMonthlyActuals: [2061, 15828.2, 172, 342, 2100, 142, 674, 0, 100, 193, 0, 150]
  },
  {
    section: 'expense',
    group: 'II. OTHER EXPENSES',
    subGroup: '',
    name: '1. Souvenir Book',
    order: 53,
    budgetedAmount: 20000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 60000,
    priorYearActual: 69575,
    priorYearMonthlyActuals: [1375, 495, 310, 215, 0, 315, 0, 285, 66580, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'II. OTHER EXPENSES',
    subGroup: '',
    name: '2. Donations and Contributions',
    order: 54,
    budgetedAmount: 230000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 0,
    priorYearActual: 296471,
    priorYearMonthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'III. CAPITAL OUTLAY',
    subGroup: 'A. BUILDING',
    name: '1. Building Repair & Maintenance - Headquarters & Campsite',
    order: 55,
    budgetedAmount: 100000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 100000,
    priorYearActual: 106570,
    priorYearMonthlyActuals: [0, 49150, 3220, 14731, 13100, 0, 25085, 0, 1284, 0, 0, 0]
  },
  {
    section: 'expense',
    group: 'III. CAPITAL OUTLAY',
    subGroup: 'A. BUILDING',
    name: '2. Building Improvement - Headquarters & Campsite',
    order: 56,
    budgetedAmount: 250000,
    monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    priorYearBudget: 100000,
    priorYearActual: 33000,
    priorYearMonthlyActuals: [0, 0, 17325, 0, 15675, 0, 0, 0, 0, 0, 0, 0]
  }
]

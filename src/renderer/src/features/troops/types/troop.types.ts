export interface Troop {
  id: string
  troopNumber: string
  troopName?: string
  /** Age-based program level (e.g. Star Scout, Junior, Cadette, Senior, Ambassador) — free text, council-defined. */
  level: string
  leaderName: string
  assistantLeaderName?: string
  school?: string
  barangay?: string
  meetingPlace?: string
  isActive: boolean
}

// Matches the Council Budget's own income-line breakdown (see budgetAutoActuals.ts's
// MEMBER_PAYMENT_CATEGORIES_BY_BUDGET_LINE) so a recorded payment posts to the right line —
// 'membership' -> "Troop, BC/DC Fees", 'training' -> "Training Fees", 'camping' -> "Camping Fees".
export type MemberPaymentCategory = 'membership' | 'training' | 'camping'

export interface MemberPayment {
  id: string
  /** ISO date this payment was collected — feeds the Reports > Daily Collections tab. */
  date: string
  amount: number
  category: MemberPaymentCategory
}

export interface ScoutMember {
  id: string
  troopId: string
  fullName: string
  birthdate: string
  /** Age-based program level, same free-text convention as Troop.level. */
  level?: string
  guardianName?: string
  guardianContact?: string
  address?: string
  /** The membership year cycle this member is currently registered for, e.g. "2026-2027". */
  membershipYear: string
  /** ISO date of the last registration/renewal. */
  renewedAt: string
  /** Fees collected for this member over time (membership dues, training fees, etc.) —
   *  recorded one at a time via the roster's "Record Payment" action, each tagged with
   *  a category. Feeds the Reports > Daily Collections tab. Unset on members synced
   *  before this field existed — read as `payments ?? []`. */
  payments?: MemberPayment[]
  isActive: boolean
}

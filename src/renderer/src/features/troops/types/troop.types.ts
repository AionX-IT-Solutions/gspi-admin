// GSP's age-based program levels, offered as a dropdown on the Troop and roster forms.
// Kept as plain strings (not a union type) so a pre-existing troop/member whose `level`
// was typed in before this became a dropdown still displays and saves correctly.
export const TROOP_LEVELS = [
  'Star Scout',
  'Junior Scout',
  'Cadette Scout',
  'Senior Scout',
  'Ambassador Scout'
] as const

/** Dropdown options for a level field — includes `currentValue` as its own option when it's
 *  set but isn't one of TROOP_LEVELS, so a legacy/custom value never gets silently dropped. */
export function troopLevelOptions(currentValue?: string): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = TROOP_LEVELS.map((level) => ({
    value: level,
    label: level
  }))
  if (currentValue && !(TROOP_LEVELS as readonly string[]).includes(currentValue)) {
    options.push({ value: currentValue, label: currentValue })
  }
  return options
}

export interface Troop {
  id: string
  troopNumber: string
  troopName?: string
  /** Age-based program level — one of TROOP_LEVELS, picked from a dropdown. */
  level: string
  leaderName: string
  // Optional link to that leader's own Training Profile record (features/trainingProfiles)
  // — lets the Troop page surface whether the assigned leader has completed the
  // trainings/certificates the role calls for. Older troops (or a leader who isn't in
  // the registry yet) simply have no link; `leaderName` stays the display name either way.
  leaderProfileId?: string
  assistantLeaderName?: string
  assistantLeaderProfileId?: string
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
  /** Age-based program level — one of TROOP_LEVELS, same dropdown as Troop.level. */
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

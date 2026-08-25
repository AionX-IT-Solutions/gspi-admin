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
  isActive: boolean
}

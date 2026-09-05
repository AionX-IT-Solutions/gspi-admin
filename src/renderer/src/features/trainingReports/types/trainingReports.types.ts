/** Maps 1:1 to the Goals & Objectives sheet's training line items (3.a.1.1 – 3.a.1.8) —
 *  see app/lib/permissions.ts-adjacent goals feature. Kept as its own union here rather
 *  than importing from goals/ so this feature has no dependency on that one; the two are
 *  linked only by convention (code comment), not by shared code. */
export const TRAINING_TYPES = [
  'leaders',
  'trainers',
  'dfas',
  'communityWomen',
  'barangayCommittee',
  'districtCommittee',
  'councilBoard',
  'councilStandingCommittee',
  'regionalCouncilStaff',
  'other'
] as const

export type TrainingType = (typeof TRAINING_TYPES)[number]

export interface TrainingReportParticipant {
  id: string
  name: string
  school: string
}

export interface TrainingReport {
  id: string
  reportNo: string
  seriesYear: string
  title: string
  place: string
  dateFrom: string
  dateTo?: string
  objectives: string[]
  trainingType: TrainingType
  hoursPerDay: number
  totalHours: number
  participantClassification: string
  participantCount: number
  feePerParticipant: string
  feeCollectedReserves: string
  feeRemitted: string
  trainers: string[]
  coordinator: string
  assistantCoordinators: string[]
  dieticians: string[]
  observations: string[]
  participants: TrainingReportParticipant[]
  submittedByName: string
  submittedByDesignation: string
  submittedDate: string
  createdAt: string
  createdBy?: string
}

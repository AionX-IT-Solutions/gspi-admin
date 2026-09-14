// A per-person credential registry for the Council's Troop Leaders, Field Advisers, and
// Trainers — distinct from features/trainingReports, which records training EVENTS held
// (one report per session, with a lightweight participant snapshot). This is the other
// direction: one record per person, tracking who they are and what they've completed,
// matching the Council's own "Profile and Training Information Form".

export const EDUCATION_LEVELS = ['elementary', 'high_school'] as const
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

export const COUNCIL_ROLES = [
  'troop_leader',
  'district_field_adviser',
  'field_adviser',
  'assisting_trainer',
  'credentialed_trainer',
  'diplomad'
] as const
export type CouncilRole = (typeof COUNCIL_ROLES)[number]

export const COMPLETED_TRAININGS = [
  'basic_leadership_course',
  'age_level_specialization_course',
  'outdoor_leadership_course',
  'campers_permit_course',
  'quarter_master_course',
  'training_for_trainers'
] as const
export type CompletedTraining = (typeof COMPLETED_TRAININGS)[number]

// Only meaningful once "age_level_specialization_course" is among completedTrainings.
export const AGE_LEVEL_SPECIALIZATIONS = ['star', 'twinkler', 'junior', 'senior'] as const
export type AgeLevelSpecialization = (typeof AGE_LEVEL_SPECIALIZATIONS)[number]

export const COMPLETED_CERTIFICATES = [
  'camp_craft_certificate',
  'campers_permit_certificate'
] as const
export type CompletedCertificate = (typeof COMPLETED_CERTIFICATES)[number]

export interface TrainingProfile {
  id: string
  name: string
  birthday: string
  school: string
  district: string
  level: EducationLevel
  contactNumber: string
  email: string
  homeAddress: string
  roles: CouncilRole[]
  completedTrainings: CompletedTraining[]
  // The form's "Completed Training" question carries an "Others, please specify" option —
  // free text alongside the fixed checkbox list, for a training not covered by COMPLETED_TRAININGS.
  otherCompletedTraining?: string
  ageLevelSpecialization?: AgeLevelSpecialization
  completedCertificates: CompletedCertificate[]
  // Free text on the Council's own form (no fixed format in practice) — kept as plain
  // strings rather than a real date/number so real-world inconsistent entries don't break.
  firstRegistrationDate?: string
  totalYearsInScouting?: string
  createdAt: string
  createdBy: string
}

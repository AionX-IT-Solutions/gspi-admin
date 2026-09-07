export type ActivityCategory =
  | 'meeting'
  | 'camp'
  | 'training'
  | 'communityService'
  | 'ceremony'
  | 'other'

export type ActivityStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

// Mirrors gspi-app's types/activity.ts field-for-field — both apps read/write
// the same Firestore `activities` collection.
export interface Activity {
  id: string
  title: string
  category: ActivityCategory
  description?: string
  location?: string
  // Troop/officer/committee in charge of the activity.
  organizer?: string
  // ISO date, "YYYY-MM-DD".
  startDate: string
  // ISO date, "YYYY-MM-DD" — optional, set for multi-day activities (e.g. camps).
  endDate?: string
  startTime?: string
  endTime?: string
  status: ActivityStatus
  createdById: string
  createdByName: string
  createdAt: string
}

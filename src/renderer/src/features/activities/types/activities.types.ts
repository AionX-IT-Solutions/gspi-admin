export type ActivityCategory =
  | 'meeting'
  | 'camp'
  | 'training'
  | 'communityService'
  | 'ceremony'
  | 'other'

export type ActivityStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

/** One distinct color per category, shared visual language across every place a
 *  category shows up (calendar pills, list badges) — and mirrored in gspi-app's
 *  types/activity.ts so an activity looks the same color in both apps. */
export const ACTIVITY_CATEGORY_COLOR: Record<ActivityCategory, { bg: string; text: string }> = {
  meeting: { bg: 'rgba(99,102,241,0.12)', text: '#818cf8' },
  camp: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
  training: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  communityService: { bg: 'rgba(6,182,212,0.12)', text: '#22d3ee' },
  ceremony: { bg: 'rgba(236,72,153,0.12)', text: '#f472b6' },
  other: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8' }
}

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

export type VisitorStatus = 'checked_in' | 'checked_out'

// Mirrors gspi-app's types/visitor.ts field-for-field — both apps read/write
// the same Firestore `visitors` collection.
export interface VisitorLog {
  id: string
  fullName: string
  purpose: string
  // Host name or office/department being visited.
  personToVisit: string
  contactNumber?: string
  // ISO datetime, set on create.
  timeIn: string
  // ISO datetime, set on check-out; undefined while still on premises.
  timeOut?: string
  status: VisitorStatus
  loggedById: string
  loggedByName: string
  createdAt: string
}

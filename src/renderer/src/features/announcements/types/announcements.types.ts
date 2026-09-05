export type AnnouncementPriority = 'normal' | 'important' | 'urgent'

// Mirrors gspi-app's types/announcement.ts field-for-field — both apps read/write
// the same Firestore `announcements` collection.
export interface Announcement {
  id: string
  title: string
  message: string
  priority: AnnouncementPriority
  // Pinned announcements always sort first, both here and on the dashboard highlight.
  pinned: boolean
  postedById: string
  postedByName: string
  createdAt: string
  updatedAt: string
}

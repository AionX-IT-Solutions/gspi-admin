import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { Announcement, AnnouncementPriority } from '../types/announcements.types'

function currentUser() {
  return useAppStore.getState().currentUser
}

export interface AnnouncementInput {
  title: string
  message: string
  priority: AnnouncementPriority
  pinned: boolean
}

interface AnnouncementsState {
  announcements: Announcement[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  createAnnouncement: (input: AnnouncementInput) => void
  updateAnnouncement: (id: string, input: AnnouncementInput) => void
  deleteAnnouncement: (id: string) => void
  /** Re-inserts an exact previously-deleted announcement (same id) — used by the Undo toast. */
  restoreAnnouncement: (announcement: Announcement) => void
  togglePin: (id: string) => void
}

export const useAnnouncementsStore = create<AnnouncementsState>()((set, get) => ({
  announcements: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const announcements = await hydrateCollection<Announcement>('announcements')
      set({ announcements, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[announcements.store] Failed to hydrate', err)
    }
  },

  createAnnouncement: (input) => {
    const user = currentUser()
    const now = new Date().toISOString()
    const created: Announcement = {
      ...input,
      id: crypto.randomUUID(),
      postedById: user?.id ?? '',
      postedByName: user?.fullName ?? 'System',
      createdAt: now,
      updatedAt: now
    }
    set((s) => ({ announcements: [created, ...s.announcements] }))
    persistDoc('announcements', created.id, created)
    appendAuditLog({
      action: 'announcement_posted',
      actorName: user?.fullName ?? 'System',
      entityType: 'announcement',
      summary: `Announcement "${created.title}" posted.`
    })
  },

  updateAnnouncement: (id, input) => {
    const existing = get().announcements.find((a) => a.id === id)
    if (!existing) return
    const updated: Announcement = { ...existing, ...input, updatedAt: new Date().toISOString() }
    set((s) => ({ announcements: s.announcements.map((a) => (a.id === id ? updated : a)) }))
    persistDoc('announcements', id, updated)
    appendAuditLog({
      action: 'announcement_updated',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'announcement',
      summary: `Announcement "${updated.title}" updated.`
    })
  },

  deleteAnnouncement: (id) => {
    const announcement = get().announcements.find((a) => a.id === id)
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }))
    deleteDocById('announcements', id)
    appendAuditLog({
      action: 'announcement_deleted',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'announcement',
      summary: `Announcement "${announcement?.title ?? id}" removed.`
    })
  },

  restoreAnnouncement: (announcement) => {
    set((s) => ({ announcements: [announcement, ...s.announcements] }))
    persistDoc('announcements', announcement.id, announcement)
    appendAuditLog({
      action: 'announcement_posted',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'announcement',
      summary: `Announcement "${announcement.title}" restored.`
    })
  },

  togglePin: (id) => {
    const existing = get().announcements.find((a) => a.id === id)
    if (!existing) return
    const updated: Announcement = {
      ...existing,
      pinned: !existing.pinned,
      updatedAt: new Date().toISOString()
    }
    set((s) => ({ announcements: s.announcements.map((a) => (a.id === id ? updated : a)) }))
    persistDoc('announcements', id, updated)
    appendAuditLog({
      action: 'announcement_updated',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'announcement',
      summary: `Announcement "${updated.title}" ${updated.pinned ? 'pinned' : 'unpinned'}.`
    })
  }
}))

import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { Activity, ActivityStatus } from '../types/activities.types'

function currentUser() {
  return useAppStore.getState().currentUser
}

export interface ActivityInput {
  title: string
  category: Activity['category']
  description?: string
  location?: string
  organizer?: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
}

interface ActivitiesState {
  activities: Activity[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addActivity: (input: ActivityInput) => void
  updateActivity: (id: string, patch: Partial<Omit<Activity, 'id'>>) => void
  deleteActivity: (id: string) => void
  /** Re-inserts an exact previously-deleted activity (same id) — used by the Undo toast. */
  restoreActivity: (activity: Activity) => void
  setStatus: (id: string, status: ActivityStatus) => void
}

export const useActivitiesStore = create<ActivitiesState>()((set, get) => ({
  activities: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const activities = await hydrateCollection<Activity>('activities')
      set({ activities, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[activities.store] Failed to hydrate', err)
    }
  },

  addActivity: (input) => {
    const user = currentUser()
    const created: Activity = {
      ...input,
      id: crypto.randomUUID(),
      status: 'scheduled',
      createdById: user?.id ?? '',
      createdByName: user?.fullName ?? 'System',
      createdAt: new Date().toISOString()
    }
    set((s) => ({ activities: [created, ...s.activities] }))
    persistDoc('activities', created.id, created)
    appendAuditLog({
      action: 'activity_created',
      actorName: user?.fullName ?? 'System',
      entityType: 'activity',
      summary: `Activity "${created.title}" scheduled for ${created.startDate}.`
    })
  },

  updateActivity: (id, patch) => {
    set((s) => ({
      activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a))
    }))
    const activity = get().activities.find((a) => a.id === id)
    if (activity) persistDoc('activities', id, activity)
    appendAuditLog({
      action: 'activity_updated',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'activity',
      summary: `Activity "${activity?.title ?? id}" updated.`
    })
  },

  deleteActivity: (id) => {
    const activity = get().activities.find((a) => a.id === id)
    set((s) => ({ activities: s.activities.filter((a) => a.id !== id) }))
    deleteDocById('activities', id)
    appendAuditLog({
      action: 'activity_deleted',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'activity',
      summary: `Activity "${activity?.title ?? id}" removed.`
    })
  },

  restoreActivity: (activity) => {
    set((s) => ({ activities: [activity, ...s.activities] }))
    persistDoc('activities', activity.id, activity)
    appendAuditLog({
      action: 'activity_created',
      actorName: currentUser()?.fullName ?? 'System',
      entityType: 'activity',
      summary: `Activity "${activity.title}" restored.`
    })
  },

  setStatus: (id, status) => {
    set((s) => ({
      activities: s.activities.map((a) => (a.id === id ? { ...a, status } : a))
    }))
    const activity = get().activities.find((a) => a.id === id)
    if (activity) persistDoc('activities', id, activity)
  }
}))

import { create } from 'zustand'
import {
  persistDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { TrainingProfile } from '../types/trainingProfiles.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface TrainingProfilesState {
  profiles: TrainingProfile[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  addProfile: (profile: Omit<TrainingProfile, 'id' | 'createdAt' | 'createdBy'>) => void
  updateProfile: (
    id: string,
    patch: Omit<TrainingProfile, 'id' | 'createdAt' | 'createdBy'>
  ) => void
  deleteProfile: (id: string) => void
}

export const useTrainingProfilesStore = create<TrainingProfilesState>()((set, get) => ({
  profiles: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const profiles = await hydrateCollection<TrainingProfile>('trainingProfiles')
      set({ profiles, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[trainingProfiles.store] Failed to hydrate', err)
    }
  },

  addProfile: (profile) => {
    const created: TrainingProfile = {
      ...profile,
      id: crypto.randomUUID(),
      createdBy: actorName(),
      createdAt: new Date().toISOString()
    }
    set((s) => ({ profiles: [created, ...s.profiles] }))
    persistDoc('trainingProfiles', created.id, created)
    appendAuditLog({
      action: 'training_profile_created',
      actorName: actorName(),
      entityType: 'training_profile',
      summary: `Training profile for ${created.name} created.`
    })
  },

  updateProfile: (id, patch) => {
    set((s) => ({
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p))
    }))
    const profile = get().profiles.find((p) => p.id === id)
    if (profile) persistDoc('trainingProfiles', id, profile)
    appendAuditLog({
      action: 'training_profile_updated',
      actorName: actorName(),
      entityType: 'training_profile',
      summary: `Training profile for ${profile?.name ?? id} updated.`
    })
  },

  deleteProfile: (id) => {
    const profile = get().profiles.find((p) => p.id === id)
    set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }))
    deleteDocById('trainingProfiles', id)
    appendAuditLog({
      action: 'training_profile_deleted',
      actorName: actorName(),
      entityType: 'training_profile',
      summary: `Training profile for ${profile?.name ?? id} deleted.`
    })
  }
}))

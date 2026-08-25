import { create } from 'zustand'
import {
  persistDoc as persist,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import { appendAuditLog } from '@/app/store/auditLog.store'
import { useAppStore } from '@/app/store/app.store'
import type { ScoutMember, Troop } from '../types/troop.types'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

interface TroopsState {
  troops: Troop[]
  scoutMembers: ScoutMember[]
  hydrated: boolean

  hydrate: (force?: boolean) => Promise<void>

  addTroop: (troop: Troop) => void
  updateTroop: (id: string, patch: Partial<Troop>) => void
  deleteTroop: (id: string) => void

  addScoutMember: (member: ScoutMember) => void
  updateScoutMember: (id: string, patch: Partial<ScoutMember>) => void
  deleteScoutMember: (id: string) => void
  renewScoutMember: (id: string, membershipYear: string) => void
}

export const useTroopsStore = create<TroopsState>()((set, get) => ({
  troops: [],
  scoutMembers: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const [troops, scoutMembers] = await Promise.all([
        hydrateCollection<Troop>('troops'),
        hydrateCollection<ScoutMember>('scoutMembers')
      ])
      set({ troops, scoutMembers, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[troops.store] Failed to hydrate', err)
    }
  },

  addTroop: (troop) => {
    set((s) => ({ troops: [troop, ...s.troops] }))
    persist('troops', troop.id, troop)
    appendAuditLog({
      action: 'troop_created',
      actorName: actorName(),
      entityType: 'troop',
      summary: `Troop ${troop.troopNumber} (${troop.leaderName}) created.`
    })
  },
  updateTroop: (id, patch) => {
    set((s) => ({ troops: s.troops.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
    const troop = get().troops.find((t) => t.id === id)
    if (troop) persist('troops', id, troop)
    appendAuditLog({
      action: 'troop_updated',
      actorName: actorName(),
      entityType: 'troop',
      summary: `Troop ${troop?.troopNumber ?? id} updated.`
    })
  },
  deleteTroop: (id) => {
    const troop = get().troops.find((t) => t.id === id)
    const orphanedMembers = get().scoutMembers.filter((m) => m.troopId === id)
    set((s) => ({
      troops: s.troops.filter((t) => t.id !== id),
      scoutMembers: s.scoutMembers.filter((m) => m.troopId !== id)
    }))
    deleteDocById('troops', id)
    for (const member of orphanedMembers) deleteDocById('scoutMembers', member.id)
    appendAuditLog({
      action: 'troop_deleted',
      actorName: actorName(),
      entityType: 'troop',
      summary: `Troop ${troop?.troopNumber ?? id} and its ${orphanedMembers.length} member(s) deleted.`
    })
  },

  addScoutMember: (member) => {
    set((s) => ({ scoutMembers: [member, ...s.scoutMembers] }))
    persist('scoutMembers', member.id, member)
    const troop = get().troops.find((t) => t.id === member.troopId)
    appendAuditLog({
      action: 'scout_member_added',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member.fullName} added to Troop ${troop?.troopNumber ?? member.troopId}.`
    })
  },
  updateScoutMember: (id, patch) => {
    set((s) => ({
      scoutMembers: s.scoutMembers.map((m) => (m.id === id ? { ...m, ...patch } : m))
    }))
    const member = get().scoutMembers.find((m) => m.id === id)
    if (member) persist('scoutMembers', id, member)
    appendAuditLog({
      action: 'scout_member_updated',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? id} updated.`
    })
  },
  deleteScoutMember: (id) => {
    const member = get().scoutMembers.find((m) => m.id === id)
    set((s) => ({ scoutMembers: s.scoutMembers.filter((m) => m.id !== id) }))
    deleteDocById('scoutMembers', id)
    appendAuditLog({
      action: 'scout_member_deleted',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? id} removed.`
    })
  },
  renewScoutMember: (id, membershipYear) => {
    const renewedAt = new Date().toISOString().slice(0, 10)
    set((s) => ({
      scoutMembers: s.scoutMembers.map((m) =>
        m.id === id ? { ...m, membershipYear, renewedAt } : m
      )
    }))
    const member = get().scoutMembers.find((m) => m.id === id)
    if (member) persist('scoutMembers', id, member)
    appendAuditLog({
      action: 'scout_member_renewed',
      actorName: actorName(),
      entityType: 'scout_member',
      summary: `${member?.fullName ?? id} renewed for membership year ${membershipYear}.`
    })
  }
}))

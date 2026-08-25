import { create } from 'zustand'
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import { reportHydrateFailure } from '@/shared/lib/firestoreSync'
import type { RoleId } from '@/app/lib/permissions'

export interface StaffUser {
  id: string
  uid: string
  email: string
  fullName: string
  role: RoleId
  isActive: boolean
  photoUrl?: string
}

function toStaffUser(id: string, data: Partial<StaffUser> & { createdAt?: unknown }): StaffUser {
  return {
    id,
    uid: id,
    email: data.email ?? '',
    fullName: data.fullName ?? '',
    role: (data.role as RoleId) ?? 'manager',
    isActive: data.isActive ?? true,
    photoUrl: data.photoUrl
  }
}

interface UsersState {
  users: StaffUser[]
  loading: boolean
  subscribe: () => Unsubscribe
  /** This collection is already kept live via `subscribe()`'s onSnapshot listener — this just
   *  forces one fresh server round-trip for the Refresh button, bypassing any local cache. */
  refetch: () => Promise<void>
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  loading: true,

  subscribe: () => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'asc'))
    return onSnapshot(
      q,
      (snap) => {
        set({ users: snap.docs.map((d) => toStaffUser(d.id, d.data())), loading: false })
      },
      () => set({ loading: false })
    )
  },

  refetch: async () => {
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'asc')))
      set({ users: snap.docs.map((d) => toStaffUser(d.id, d.data())), loading: false })
    } catch (err) {
      reportHydrateFailure('[users.store] Failed to refetch', err)
    }
  }
}))

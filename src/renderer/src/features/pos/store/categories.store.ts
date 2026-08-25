import { create } from 'zustand'
import { hydrateCollection, reportHydrateFailure } from '@/shared/lib/firestoreSync'

/**
 * Read-only mirror of the shared `categories` Firestore collection (seeded
 * system catalog, same one gspi-app's product form/pickers read from — see
 * gspi-app's categoriesStore.ts). Desktop has no create/edit/delete UI for
 * categories; ProductFormModal's category picker just lists whatever this
 * collection has, so a category picked here always resolves correctly when
 * the product is viewed on mobile.
 */
export interface Category {
  id: string
  name: string
  color: string
}

interface CategoriesState {
  categories: Category[]
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
}

export const useCategoriesStore = create<CategoriesState>()((set, get) => ({
  categories: [],
  hydrated: false,

  hydrate: async (force = false) => {
    if (get().hydrated && !force) return
    try {
      const categories = await hydrateCollection<Category>('categories')
      set({ categories, hydrated: true })
    } catch (err) {
      reportHydrateFailure('[categories.store] Failed to hydrate', err)
    }
  }
}))

export function getCategoryById(id: string): Category | undefined {
  return useCategoriesStore.getState().categories.find((c) => c.id === id)
}

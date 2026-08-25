import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from './firebase'

function isPermissionDenied(err: unknown): boolean {
  return (err as { code?: string })?.code === 'permission-denied'
}

function reportFailure(context: string, err: unknown): void {
  if (isPermissionDenied(err)) return
  console.error(`[firestoreSync] ${context}:`, err)
  toast.error('Failed to save changes to the server — check your connection.')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor === Object
  )
}

function deepStripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepStripUndefined)
  if (isPlainObject(value)) {
    const clean: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      if (v !== undefined) clean[key] = deepStripUndefined(v)
    }
    return clean
  }
  return value
}

/**
 * Firestore's `setDoc`/`WriteBatch.set` throw synchronously (not a rejected promise) on any
 * field value of `undefined`, at any nesting depth — e.g. an optional `unit` built as
 * `form.unit || undefined` sitting inside an array of objective objects. That throw happens
 * before any `.catch()` can attach, so the write silently never reaches the server while
 * local Zustand state (already updated by the caller) still shows it as saved. Stripping
 * `undefined` keys here, recursively (Firestore is fine with a missing key), closes that gap
 * for every caller at the source instead of relying on each call site to remember it. Only
 * plain objects/arrays are recursed into — class instances (Date, Firestore FieldValue
 * sentinels, etc.) pass through untouched.
 */
export function stripUndefined<T extends object>(data: T): Partial<T> {
  return deepStripUndefined(data) as Partial<T>
}

/**
 * Fire-and-forget write-through persist. Local Zustand state is already updated by the
 * caller — this just syncs it to Firestore in the background, surfacing a toast only for
 * real failures (permission-denied is expected for roles without access to a collection).
 */
export function persistDoc(collectionName: string, id: string, data: object): void {
  try {
    setDoc(doc(db, collectionName, id), stripUndefined(data as Record<string, unknown>)).catch(
      (err) => reportFailure(`Failed to save ${collectionName}/${id}`, err)
    )
  } catch (err) {
    reportFailure(`Failed to save ${collectionName}/${id}`, err)
  }
}

/** Fire-and-forget delete, mirroring `persistDoc`'s error handling. */
export function deleteDocById(collectionName: string, id: string): void {
  deleteDoc(doc(db, collectionName, id)).catch((err) =>
    reportFailure(`Failed to delete ${collectionName}/${id}`, err)
  )
}

/**
 * One-time hydrate for a store's `hydrate()` action: reads a collection from Firestore,
 * which is the single source of truth. Returns an empty array if nothing's there yet —
 * this never seeds from local data, so an empty collection stays empty until real records
 * are added through the app (or a deliberate one-off import script).
 */
export async function hydrateCollection<T extends { id: string }>(name: string): Promise<T[]> {
  const snap = await getDocs(collection(db, name))
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }))
}

/** Logs+skips a hydrate failure the same way a write failure is handled (quiet on permission-denied). */
export function reportHydrateFailure(context: string, err: unknown): void {
  if (isPermissionDenied(err)) return
  console.error(`[firestoreSync] ${context}:`, err)
}

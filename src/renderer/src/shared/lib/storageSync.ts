import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { toast } from 'sonner'
import { storage } from './firebase'

function isPermissionDenied(err: unknown): boolean {
  return (err as { code?: string })?.code === 'storage/unauthorized'
}

/**
 * Uploads a file to Firebase Storage at `path` and resolves with its public download URL.
 * Throws on failure — callers are expected to catch it and surface their own error state
 * (unlike the fire-and-forget Firestore helpers, an upload's result gates further UI work).
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  try {
    const fileRef = ref(storage, path)
    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  } catch (err) {
    if (!isPermissionDenied(err)) {
      console.error(`[storageSync] Failed to upload ${path}:`, err)
    }
    throw err
  }
}

/**
 * Downloads a previously-uploaded file to the user's machine via a native Save dialog.
 * Delegated to the main process because Firebase Storage doesn't send the CORS headers a
 * renderer-side `fetch` needs to read the response body (Node's fetch isn't CORS-restricted).
 * Falls back to a same-tab blob download outside Electron (e.g. a future web build).
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  if (window.api?.file?.download) {
    await window.api.file.download({ url, filename })
    return
  }

  const res = await fetch(url)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(objectUrl)
}

/** Fire-and-forget delete, mirroring `deleteDocById`'s error handling. A missing file is a no-op. */
export function deleteFile(path: string): void {
  deleteObject(ref(storage, path)).catch((err) => {
    const code = (err as { code?: string })?.code
    if (code === 'storage/object-not-found' || isPermissionDenied(err)) return
    console.error(`[storageSync] Failed to delete ${path}:`, err)
    toast.error('Failed to delete the file from the server — check your connection.')
  })
}

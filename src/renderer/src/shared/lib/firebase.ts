import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { isSupported, getAnalytics, type Analytics } from 'firebase/analytics'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

// Session-only persistence: signed out whenever the app is fully closed and reopened,
// matching the previous local-mock login's behavior (always land on the Login screen).
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.warn('[firebase] Failed to set auth persistence:', err)
})

// Analytics needs a real browser context with measurement support — guard it since
// Electron's renderer (loaded from file:// in production) doesn't always qualify,
// and a failure here must never break app startup.
export let analytics: Analytics | null = null
isSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(firebaseApp)
  })
  .catch(() => {
    // Analytics unsupported in this environment — non-fatal, just skip it.
  })

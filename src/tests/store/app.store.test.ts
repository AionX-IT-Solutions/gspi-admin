import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppStore } from '../../renderer/src/app/store/app.store'

const signInMock = vi.fn()
const signOutMock = vi.fn()
const getDocMock = vi.fn()

vi.mock('@/shared/lib/firebase', () => ({ auth: {}, db: {} }))
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => signInMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args)
}))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: (...args: unknown[]) => getDocMock(...args)
}))

beforeEach(() => {
  signInMock.mockReset()
  signOutMock.mockReset().mockResolvedValue(undefined)
  getDocMock.mockReset()
  useAppStore.setState({
    isAuthenticated: false,
    currentUser: null,
    authLoading: false,
    theme: 'dark',
    language: 'en',
    accentColor: 'indigo',
    notifications: [],
    sidebarCollapsed: false,
    notificationsEnabled: true,
    soundEnabled: false,
    dataCollection: false,
    compactMode: false,
    fontSize: [14],
    updateStatus: null
  })
})

describe('app.store', () => {
  describe('auth', () => {
    it('starts unauthenticated', () => {
      expect(useAppStore.getState().isAuthenticated).toBe(false)
    })

    it('login with a valid account sets isAuthenticated', async () => {
      signInMock.mockResolvedValue({
        user: { uid: 'u1', email: 'admin@gspi.test', displayName: null }
      })
      getDocMock.mockResolvedValue({
        data: () => ({ fullName: 'Admin User', role: 'admin', isActive: true })
      })

      const result = await useAppStore.getState().login('admin@gspi.test', 'correct-password')

      expect(result.ok).toBe(true)
      expect(useAppStore.getState().isAuthenticated).toBe(true)
      expect(useAppStore.getState().currentUser?.role).toBe('admin')
    })

    it('login with wrong credentials returns ok:false and stays unauthenticated', async () => {
      signInMock.mockRejectedValue({ code: 'auth/invalid-credential' })

      const result = await useAppStore.getState().login('admin@gspi.test', 'wrong-password')

      expect(result.ok).toBe(false)
      expect(useAppStore.getState().isAuthenticated).toBe(false)
    })

    it('login for a disabled profile signs the user back out', async () => {
      signInMock.mockResolvedValue({
        user: { uid: 'u2', email: 'disabled@gspi.test', displayName: null }
      })
      getDocMock.mockResolvedValue({ data: () => ({ isActive: false }) })

      const result = await useAppStore.getState().login('disabled@gspi.test', 'password')

      expect(result.ok).toBe(false)
      expect(signOutMock).toHaveBeenCalled()
      expect(useAppStore.getState().isAuthenticated).toBe(false)
    })

    it('logout clears isAuthenticated', () => {
      useAppStore.setState({
        isAuthenticated: true,
        currentUser: { id: 'u1', email: 'a@b.c', fullName: 'A', role: 'admin' }
      })
      useAppStore.getState().logout()
      expect(useAppStore.getState().isAuthenticated).toBe(false)
      expect(signOutMock).toHaveBeenCalled()
    })
  })

  describe('theme', () => {
    it('initial theme is dark', () => {
      expect(useAppStore.getState().theme).toBe('dark')
    })

    it('toggleTheme switches dark → light', () => {
      useAppStore.getState().toggleTheme()
      expect(useAppStore.getState().theme).toBe('light')
    })

    it('toggleTheme switches light → dark', () => {
      useAppStore.getState().setTheme('light')
      useAppStore.getState().toggleTheme()
      expect(useAppStore.getState().theme).toBe('dark')
    })
  })

  describe('language', () => {
    it('initial language is en', () => {
      expect(useAppStore.getState().language).toBe('en')
    })

    it('setLanguage updates language', () => {
      useAppStore.getState().setLanguage('tl')
      expect(useAppStore.getState().language).toBe('tl')
    })
  })

  describe('notifications', () => {
    it('addNotification appends to array', () => {
      useAppStore.getState().addNotification({ type: 'info', message: 'Test' })
      const { notifications } = useAppStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].message).toBe('Test')
      expect(notifications[0].type).toBe('info')
    })

    it('removeNotification removes by id', () => {
      useAppStore.getState().addNotification({ type: 'info', message: 'A' })
      useAppStore.getState().addNotification({ type: 'info', message: 'B' })
      const id = useAppStore.getState().notifications[0].id
      useAppStore.getState().removeNotification(id)
      expect(useAppStore.getState().notifications).toHaveLength(1)
      expect(useAppStore.getState().notifications[0].message).toBe('B')
    })

    it('clearNotifications empties array', () => {
      useAppStore.getState().addNotification({ type: 'info', message: 'X' })
      useAppStore.getState().clearNotifications()
      expect(useAppStore.getState().notifications).toHaveLength(0)
    })
  })

  describe('updateStatus', () => {
    it('initial updateStatus is null', () => {
      expect(useAppStore.getState().updateStatus).toBeNull()
    })

    it('setUpdateStatus stores status', () => {
      useAppStore.getState().setUpdateStatus({ status: 'available', version: '2.0.0' })
      expect(useAppStore.getState().updateStatus?.status).toBe('available')
    })
  })
})

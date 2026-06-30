import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UpdateStatus } from '../../../shared/ipc-types'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
}

export type AccentColor = 'indigo' | 'cyan' | 'emerald' | 'rose'
export type Theme = 'dark' | 'light'
export type Language = 'en' | 'tl'

interface AppState {
  isAuthenticated: boolean
  sidebarCollapsed: boolean
  theme: Theme
  language: Language
  accentColor: AccentColor
  notifications: Notification[]
  notificationsEnabled: boolean
  soundEnabled: boolean
  updateNotifs: boolean
  securityAlerts: boolean
  dataCollection: boolean
  crashReports: boolean
  compactMode: boolean
  fontSize: number[]
  updateStatus: UpdateStatus | null
  login: (username: string, password: string) => boolean
  logout: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
  setAccentColor: (color: AccentColor) => void
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setNotificationsEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setUpdateNotifs: (enabled: boolean) => void
  setSecurityAlerts: (enabled: boolean) => void
  setDataCollection: (enabled: boolean) => void
  setCrashReports: (enabled: boolean) => void
  setCompactMode: (enabled: boolean) => void
  setFontSize: (size: number[]) => void
  setUpdateStatus: (status: UpdateStatus | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      sidebarCollapsed: false,
      theme: 'dark',
      language: 'en',
      accentColor: 'indigo',
      notifications: [],
      notificationsEnabled: true,
      soundEnabled: false,
      updateNotifs: true,
      securityAlerts: true,
      dataCollection: false,
      crashReports: true,
      compactMode: false,
      fontSize: [14],
      updateStatus: null,

      login: (username, password) => {
        const valid = username.trim().length > 0 && password.length >= 4
        if (valid) set({ isAuthenticated: true })
        return valid
      },
      logout: () => set({ isAuthenticated: false }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      setAccentColor: (accentColor) => set({ accentColor }),

      addNotification: (notif) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            {
              ...notif,
              id: Math.random().toString(36).slice(2),
              timestamp: Date.now()
            }
          ]
        })),

      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      clearNotifications: () => set({ notifications: [] }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setUpdateNotifs: (updateNotifs) => set({ updateNotifs }),
      setSecurityAlerts: (securityAlerts) => set({ securityAlerts }),
      setDataCollection: (dataCollection) => set({ dataCollection }),
      setCrashReports: (crashReports) => set({ crashReports }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setFontSize: (fontSize) => set({ fontSize }),
      setUpdateStatus: (updateStatus) => set({ updateStatus })
    }),
    {
      name: 'aionx-app-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        accentColor: state.accentColor,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        updateNotifs: state.updateNotifs,
        securityAlerts: state.securityAlerts,
        dataCollection: state.dataCollection,
        crashReports: state.crashReports,
        compactMode: state.compactMode,
        fontSize: state.fontSize
      })
    }
  )
)

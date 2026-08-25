import { useState } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/app/store/app.store'

export function useAdvancedSection() {
  const setTheme = useAppStore((s) => s.setTheme)
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled)
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled)
  const setSecurityAlerts = useAppStore((s) => s.setSecurityAlerts)
  const setDataCollection = useAppStore((s) => s.setDataCollection)
  const setCrashReports = useAppStore((s) => s.setCrashReports)
  const setCompactMode = useAppStore((s) => s.setCompactMode)
  const setFontSize = useAppStore((s) => s.setFontSize)

  const [resetModalOpen, setResetModalOpen] = useState(false)

  function handleReset() {
    setTheme('dark')
    setNotificationsEnabled(true)
    setSoundEnabled(false)
    setSecurityAlerts(true)
    setDataCollection(false)
    setCompactMode(false)
    setFontSize([14])
    setCrashReports(true)
    setResetModalOpen(false)
    toast.success('Settings reset to defaults')
  }

  return { resetModalOpen, setResetModalOpen, handleReset }
}

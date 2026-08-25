import { toast } from 'sonner'
import { useAppStore } from '@/app/store/app.store'

export function useNotificationsSection() {
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled)
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled)
  const soundEnabled = useAppStore((s) => s.soundEnabled)
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled)
  const securityAlerts = useAppStore((s) => s.securityAlerts)
  const setSecurityAlerts = useAppStore((s) => s.setSecurityAlerts)

  function handleNotificationsChange(v: boolean) {
    setNotificationsEnabled(v)
    toast.success(v ? 'Notifications enabled' : 'Notifications disabled')
  }

  function handleSoundChange(v: boolean) {
    setSoundEnabled(v)
    toast.success(v ? 'Sound alerts ON' : 'Sound alerts OFF')
  }

  function handleSecurityAlertsChange(v: boolean) {
    setSecurityAlerts(v)
    toast.success(v ? 'Security alerts ON' : 'Security alerts OFF')
  }

  return {
    notificationsEnabled,
    soundEnabled,
    securityAlerts,
    handleNotificationsChange,
    handleSoundChange,
    handleSecurityAlertsChange
  }
}

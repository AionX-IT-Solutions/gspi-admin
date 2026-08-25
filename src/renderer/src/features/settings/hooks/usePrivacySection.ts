import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/app/store/app.store'

export function usePrivacySection() {
  const dataCollection = useAppStore((s) => s.dataCollection)
  const setDataCollection = useAppStore((s) => s.setDataCollection)
  const crashReports = useAppStore((s) => s.crashReports)
  const setCrashReports = useAppStore((s) => s.setCrashReports)

  // Inform main process whenever crash-reporting preference changes
  useEffect(() => {
    window.api?.log.info(`[settings] Crash reporting ${crashReports ? 'enabled' : 'disabled'}`)
  }, [crashReports])

  function handleDataCollectionChange(v: boolean) {
    setDataCollection(v)
    toast.success(v ? 'Data collection ON' : 'Data collection OFF')
  }

  function handleCrashReportsChange(v: boolean) {
    setCrashReports(v)
    toast.success(v ? 'Crash reports ON' : 'Crash reports OFF')
  }

  return {
    dataCollection,
    crashReports,
    handleDataCollectionChange,
    handleCrashReportsChange
  }
}

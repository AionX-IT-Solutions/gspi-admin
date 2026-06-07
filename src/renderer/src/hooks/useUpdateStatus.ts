import { useEffect } from 'react'
import { useAppStore } from '../store/app.store'

export function useUpdateStatus() {
  const updateStatus = useAppStore((s) => s.updateStatus)
  const setUpdateStatus = useAppStore((s) => s.setUpdateStatus)

  useEffect(() => {
    const unsubscribe = window.api?.update.onStatus((status) => {
      setUpdateStatus(status)
    })
    return () => unsubscribe?.()
  }, [setUpdateStatus])

  return {
    updateStatus,
    checkForUpdate: () => window.api?.update.check().catch(() => {}),
    installUpdate: () => window.api?.update.install()
  }
}

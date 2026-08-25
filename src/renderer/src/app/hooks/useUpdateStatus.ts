import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '../store/app.store'

export function useUpdateStatus() {
  const updateStatus = useAppStore((s) => s.updateStatus)
  const setUpdateStatus = useAppStore((s) => s.setUpdateStatus)

  useEffect(() => {
    // Update toasts always show, unlike regular in-app notifications — an update
    // (or a failed update check) isn't discretionary, and gating it behind a
    // preference made a failed check look identical to "nothing to report."
    const unsubscribe = window.api?.update.onStatus((status) => {
      setUpdateStatus(status)

      const { addNotification } = useAppStore.getState()

      if (status.status === 'available') {
        const msg = status.version
          ? `Update v${status.version} available`
          : 'A new update is available'
        addNotification({ type: 'info', message: msg })
        toast.info(msg, { duration: 6000 })
      } else if (status.status === 'downloaded') {
        const msg = 'Update ready — restart to install'
        addNotification({ type: 'success', message: msg })
        toast.success(msg, {
          duration: 0,
          action: { label: 'Restart now', onClick: () => window.api?.update.install() }
        })
      } else if (status.status === 'error') {
        const msg = `Update check failed: ${status.error ?? 'unknown error'}`
        addNotification({ type: 'error', message: msg })
        toast.error(msg, { duration: 8000 })
      }
    })
    return () => unsubscribe?.()
  }, [setUpdateStatus])

  return {
    updateStatus,
    checkForUpdate: () => window.api?.update.check().catch(() => {}),
    installUpdate: () => window.api?.update.install()
  }
}

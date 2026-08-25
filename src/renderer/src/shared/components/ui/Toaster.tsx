import { createPortal } from 'react-dom'
import { Toaster as SonnerToaster } from 'sonner'
import { useAppStore } from '@/app/store/app.store'

export { toast } from 'sonner'

export function Toaster() {
  const theme = useAppStore((s) => s.theme)

  // #root has `isolation: isolate` (see globals.css), which traps a normally-rendered
  // Toaster's stacking context below Radix Dialog.Portal content (modals render straight
  // into document.body). Portal it out to body so toasts can stack above open modals.
  return createPortal(
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontFamily: 'inherit',
          boxShadow: 'var(--shadow-card)'
        },
        classNames: {
          error: 'toast-error',
          success: 'toast-success',
          warning: 'toast-warning',
          info: 'toast-info'
        }
      }}
      richColors
      closeButton
      gap={8}
    />,
    document.body
  )
}

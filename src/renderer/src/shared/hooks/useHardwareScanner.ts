import { useEffect, useRef } from 'react'

interface UseHardwareScannerOptions {
  enabled?: boolean
  minLength?: number
  resetThresholdMs?: number
}

/**
 * Listens for input from a USB/Bluetooth barcode scanner acting as a keyboard (HID
 * "keyboard wedge" mode — the most common kind). Such scanners type a code's characters
 * very fast and then send Enter/Tab; we buffer keystrokes and treat a burst ending in
 * Enter/Tab as a scan. Skips keystrokes while focus is on a text input so normal typing
 * (and the manual-scan fallback field) isn't intercepted.
 */
export function useHardwareScanner(
  onScan: (code: string) => void,
  options: UseHardwareScannerOptions = {}
) {
  const { enabled = true, minLength = 3, resetThresholdMs = 60 } = options
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const now = Date.now()
      if (now - lastKeyTimeRef.current > resetThresholdMs) {
        bufferRef.current = ''
      }
      lastKeyTimeRef.current = now

      if (e.key === 'Enter' || e.key === 'Tab') {
        if (bufferRef.current.length >= minLength) {
          e.preventDefault()
          onScanRef.current(bufferRef.current)
        }
        bufferRef.current = ''
        return
      }
      if (e.key.length === 1) {
        bufferRef.current += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, minLength, resetThresholdMs])
}

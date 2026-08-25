import { useState } from 'react'
import { useHardwareScanner } from '@/shared/hooks/useHardwareScanner'

interface ScannedEntry {
  code: string
  at: number
}

export function useBarcodeScannerSection() {
  const [lastScan, setLastScan] = useState<ScannedEntry | null>(null)

  useHardwareScanner((code) => {
    setLastScan({ code, at: Date.now() })
  })

  return {
    lastScan,
    clearLastScan: () => setLastScan(null)
  }
}

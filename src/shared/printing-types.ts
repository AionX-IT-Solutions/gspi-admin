export interface PrinterInfo {
  name: string
  displayName: string
  isDefault: boolean
}

export interface PrinterConfig {
  /** null = use the system's default printer. */
  deviceName: string | null
  autoPrintReceipt: boolean
}

export interface SilentPrintRequest {
  html: string
  deviceName?: string | null
}

export interface SilentPrintResult {
  ok: boolean
  error?: string
}

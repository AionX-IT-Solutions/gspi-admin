import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PrinterConfig } from '../../../shared/printing-types'

const DEFAULTS: PrinterConfig = { deviceName: null, autoPrintReceipt: true }

function configPath(): string {
  return join(app.getPath('userData'), 'printer-config.json')
}

export function getConfig(): PrinterConfig {
  const path = configPath()
  if (!existsSync(path)) return DEFAULTS
  try {
    return { ...DEFAULTS, ...(JSON.parse(readFileSync(path, 'utf-8')) as Partial<PrinterConfig>) }
  } catch {
    return DEFAULTS
  }
}

export function saveConfig(patch: Partial<PrinterConfig>): PrinterConfig {
  const merged = { ...getConfig(), ...patch }
  writeFileSync(configPath(), JSON.stringify(merged, null, 2), 'utf-8')
  return merged
}

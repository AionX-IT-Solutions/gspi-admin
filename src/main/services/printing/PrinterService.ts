import { BrowserWindow } from 'electron'
import log from 'electron-log'
import * as printerConfigStore from './printerConfigStore'
import type {
  PrinterConfig,
  PrinterInfo,
  SilentPrintRequest,
  SilentPrintResult
} from '../../../shared/printing-types'

/**
 * Prints via a hidden BrowserWindow rather than the visible one — this lets checkout
 * silently push a job to the configured receipt printer without stealing focus or
 * showing the OS print dialog. The physical cash drawer (wired into the printer's
 * RJ11/RJ12 port) is opened by the printer's own Windows driver whenever it receives a
 * print job — configured once in that driver's Properties, not something this app
 * controls directly — so a successful silent print is also what pops the drawer.
 */
async function silentPrint(request: SilentPrintRequest): Promise<SilentPrintResult> {
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } })

  try {
    await win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(request.html)}`)
  } catch (err) {
    if (!win.isDestroyed()) win.destroy()
    const error = err instanceof Error ? err.message : String(err)
    log.error('[printer] Failed to load receipt HTML for printing:', error)
    return { ok: false, error }
  }

  return new Promise((resolve) => {
    win.webContents.print(
      {
        silent: true,
        printBackground: true,
        margins: { marginType: 'none' },
        ...(request.deviceName ? { deviceName: request.deviceName } : {})
      },
      (success, failureReason) => {
        if (!win.isDestroyed()) win.close()
        if (!success) log.error('[printer] Silent print failed:', failureReason)
        resolve(success ? { ok: true } : { ok: false, error: failureReason })
      }
    )
  })
}

async function listPrinters(): Promise<PrinterInfo[]> {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return []
  const printers = await win.webContents.getPrintersAsync()
  return printers.map((p) => ({ name: p.name, displayName: p.displayName, isDefault: p.isDefault }))
}

export const printerService = {
  listPrinters,
  getConfig: (): PrinterConfig => printerConfigStore.getConfig(),
  saveConfig: (patch: Partial<PrinterConfig>): PrinterConfig =>
    printerConfigStore.saveConfig(patch),
  silentPrint
}

import { ipcMain, BrowserWindow, app, dialog, shell, Notification } from 'electron'
import { writeFile } from 'node:fs/promises'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import {
  IPC_CHANNELS,
  type NotificationPayload,
  type FileDownloadRequest,
  type FileDownloadResult
} from '../shared/ipc-types'
import { hikvisionService } from './services/hikvision/HikvisionService'
import { printerService } from './services/printing/PrinterService'
import { staffAdminService } from './services/staffAdmin/StaffAdminService'
import type {
  HikvisionDeviceConfigInput,
  HikvisionEnrollFacePayload,
  HikvisionEventSearchRange
} from '../shared/hikvision-types'
import type { PrinterConfig, SilentPrintRequest } from '../shared/printing-types'
import type { CreateStaffUserRequest, UpdateStaffUserRequest } from '../shared/staff-admin-types'

export function registerIpcHandlers(): void {
  // ── App ──────────────────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.APP_VERSION, () => app.getVersion())

  // ── Window ───────────────────────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    BrowserWindow.getFocusedWindow()?.close()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    return BrowserWindow.getFocusedWindow()?.isMaximized() ?? false
  })

  // ── Shell ────────────────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, (_, url: string) => {
    shell.openExternal(url)
  })

  // ── File downloads ───────────────────────────────────────────────────────────
  // Fetched here (not the renderer) since remote storage URLs don't send the
  // CORS headers a renderer-side fetch needs to read the response body.
  ipcMain.handle(
    IPC_CHANNELS.FILE_DOWNLOAD,
    async (event, { url, filename }: FileDownloadRequest): Promise<FileDownloadResult> => {
      const win = BrowserWindow.fromWebContents(event.sender)
      const { canceled, filePath } = await (win
        ? dialog.showSaveDialog(win, { defaultPath: filename })
        : dialog.showSaveDialog({ defaultPath: filename }))
      if (canceled || !filePath) return { canceled: true }

      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to download file: ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      await writeFile(filePath, buffer)
      return { canceled: false, filePath }
    }
  )

  // ── Zoom ─────────────────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.ZOOM_SET, (event, factor: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, factor))
    event.sender.setZoomFactor(clamped)
  })

  // ── Logging ──────────────────────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.LOG_INFO, (_, msg: string) => log.info('[renderer]', msg))
  ipcMain.on(IPC_CHANNELS.LOG_WARN, (_, msg: string) => log.warn('[renderer]', msg))
  ipcMain.on(IPC_CHANNELS.LOG_ERROR, (_, msg: string) => log.error('[renderer]', msg))

  // ── Native Notifications ─────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.NOTIFICATION_SHOW, (_, payload: NotificationPayload) => {
    if (Notification.isSupported()) {
      new Notification({ title: payload.title, body: payload.body }).show()
    }
  })

  // ── Auto-updater ─────────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, async () => {
    try {
      await autoUpdater.checkForUpdates()
    } catch (err) {
      log.error('Manual update check failed:', err)
    }
  })

  ipcMain.on(IPC_CHANNELS.UPDATE_INSTALL, () => {
    autoUpdater.quitAndInstall()
  })

  // ── Hikvision biometric terminal ────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.HIKVISION_GET_CONFIG, () => hikvisionService.getConfigSummary())
  ipcMain.handle(IPC_CHANNELS.HIKVISION_SAVE_CONFIG, (_, config: HikvisionDeviceConfigInput) =>
    hikvisionService.saveConfig(config)
  )
  ipcMain.handle(IPC_CHANNELS.HIKVISION_TEST_CONNECTION, (_, config?: HikvisionDeviceConfigInput) =>
    hikvisionService.testConnection(config)
  )
  ipcMain.handle(IPC_CHANNELS.HIKVISION_CONNECT, () => hikvisionService.connect())
  ipcMain.handle(IPC_CHANNELS.HIKVISION_DISCONNECT, () => hikvisionService.disconnect())
  ipcMain.handle(IPC_CHANNELS.HIKVISION_GET_STATUS, () => hikvisionService.getStatus())
  ipcMain.handle(IPC_CHANNELS.HIKVISION_SEARCH_EVENTS, (_, range: HikvisionEventSearchRange) =>
    hikvisionService.searchAttendanceEvents(range)
  )
  ipcMain.handle(IPC_CHANNELS.HIKVISION_ENROLL_FACE, (_, payload: HikvisionEnrollFacePayload) =>
    hikvisionService.enrollFace(payload)
  )

  // ── Receipt printer & cash drawer ───────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.PRINTER_LIST, () => printerService.listPrinters())
  ipcMain.handle(IPC_CHANNELS.PRINTER_GET_CONFIG, () => printerService.getConfig())
  ipcMain.handle(IPC_CHANNELS.PRINTER_SAVE_CONFIG, (_, patch: Partial<PrinterConfig>) =>
    printerService.saveConfig(patch)
  )
  ipcMain.handle(IPC_CHANNELS.PRINTER_SILENT_PRINT, (_, request: SilentPrintRequest) =>
    printerService.silentPrint(request)
  )

  // ── Staff account admin (Admin SDK, local service account key only) ────────
  ipcMain.handle(IPC_CHANNELS.STAFF_ADMIN_IS_AVAILABLE, () => staffAdminService.isAvailable())
  ipcMain.handle(IPC_CHANNELS.STAFF_ADMIN_CREATE_USER, (_, input: CreateStaffUserRequest) =>
    staffAdminService.createUser(input)
  )
  ipcMain.handle(IPC_CHANNELS.STAFF_ADMIN_UPDATE_USER, (_, input: UpdateStaffUserRequest) =>
    staffAdminService.updateUser(input)
  )
}

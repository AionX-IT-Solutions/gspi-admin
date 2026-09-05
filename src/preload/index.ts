import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  IPC_CHANNELS,
  type UpdateStatus,
  type NotificationPayload,
  type FileDownloadRequest,
  type FileDownloadResult
} from '../shared/ipc-types'
import type {
  HikvisionAttendanceEvent,
  HikvisionDeviceConfigInput,
  HikvisionDeviceConfigSummary,
  HikvisionEnrollFacePayload,
  HikvisionEventSearchRange,
  HikvisionResult,
  HikvisionStatus
} from '../shared/hikvision-types'
import type {
  PrinterConfig,
  PrinterInfo,
  SilentPrintRequest,
  SilentPrintResult
} from '../shared/printing-types'
import type {
  CreateStaffUserRequest,
  StaffAdminResult,
  UpdateStaffUserRequest
} from '../shared/staff-admin-types'

const api = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.APP_VERSION),

  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED)
  },

  shell: {
    openExternal: (url: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, url)
  },

  file: {
    download: (payload: FileDownloadRequest): Promise<FileDownloadResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_DOWNLOAD, payload)
  },

  setZoomFactor: (factor: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.ZOOM_SET, factor),

  log: {
    info: (msg: string) => ipcRenderer.send(IPC_CHANNELS.LOG_INFO, msg),
    warn: (msg: string) => ipcRenderer.send(IPC_CHANNELS.LOG_WARN, msg),
    error: (msg: string) => ipcRenderer.send(IPC_CHANNELS.LOG_ERROR, msg)
  },

  update: {
    check: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK),
    install: () => ipcRenderer.send(IPC_CHANNELS.UPDATE_INSTALL),
    onStatus: (cb: (status: UpdateStatus) => void): (() => void) => {
      const listener = (_: unknown, status: UpdateStatus) => cb(status)
      ipcRenderer.on(IPC_CHANNELS.UPDATE_STATUS, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_STATUS, listener)
    }
  },

  notification: {
    show: (payload: NotificationPayload): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, payload)
  },

  onShortcut: (cb: (key: string) => void): (() => void) => {
    const listener = (_: unknown, key: string) => cb(key)
    ipcRenderer.on(IPC_CHANNELS.SHORTCUT_TRIGGERED, listener)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHORTCUT_TRIGGERED, listener)
  },

  hikvision: {
    getConfig: (): Promise<HikvisionDeviceConfigSummary | null> =>
      ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_GET_CONFIG),
    saveConfig: (config: HikvisionDeviceConfigInput): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_SAVE_CONFIG, config),
    testConnection: (config?: HikvisionDeviceConfigInput): Promise<HikvisionResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_TEST_CONNECTION, config),
    connect: (): Promise<HikvisionResult> => ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_CONNECT),
    disconnect: (): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_DISCONNECT),
    getStatus: (): Promise<HikvisionStatus> =>
      ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_GET_STATUS),
    searchEvents: (range: HikvisionEventSearchRange): Promise<HikvisionAttendanceEvent[]> =>
      ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_SEARCH_EVENTS, range),
    enrollFace: (payload: HikvisionEnrollFacePayload): Promise<HikvisionResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.HIKVISION_ENROLL_FACE, payload),
    onStatus: (cb: (status: HikvisionStatus) => void): (() => void) => {
      const listener = (_: unknown, status: HikvisionStatus) => cb(status)
      ipcRenderer.on(IPC_CHANNELS.HIKVISION_STATUS_PUSH, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.HIKVISION_STATUS_PUSH, listener)
    },
    onAttendanceEvent: (cb: (event: HikvisionAttendanceEvent) => void): (() => void) => {
      const listener = (_: unknown, event: HikvisionAttendanceEvent) => cb(event)
      ipcRenderer.on(IPC_CHANNELS.HIKVISION_EVENT_PUSH, listener)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.HIKVISION_EVENT_PUSH, listener)
    }
  },

  printer: {
    list: (): Promise<PrinterInfo[]> => ipcRenderer.invoke(IPC_CHANNELS.PRINTER_LIST),
    getConfig: (): Promise<PrinterConfig> => ipcRenderer.invoke(IPC_CHANNELS.PRINTER_GET_CONFIG),
    saveConfig: (patch: Partial<PrinterConfig>): Promise<PrinterConfig> =>
      ipcRenderer.invoke(IPC_CHANNELS.PRINTER_SAVE_CONFIG, patch),
    silentPrint: (request: SilentPrintRequest): Promise<SilentPrintResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.PRINTER_SILENT_PRINT, request)
  },

  staffAdmin: {
    isAvailable: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.STAFF_ADMIN_IS_AVAILABLE),
    createUser: (input: CreateStaffUserRequest): Promise<StaffAdminResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.STAFF_ADMIN_CREATE_USER, input),
    updateUser: (input: UpdateStaffUserRequest): Promise<StaffAdminResult> =>
      ipcRenderer.invoke(IPC_CHANNELS.STAFF_ADMIN_UPDATE_USER, input)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error -- window globals not typed outside Electron context
  window.electron = electronAPI
  // @ts-expect-error -- window globals not typed outside Electron context
  window.api = api
}

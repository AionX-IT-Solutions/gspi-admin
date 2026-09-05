import { useEffect, useState } from 'react'
import type {
  UpdateStatus,
  NotificationPayload,
  FileDownloadRequest,
  FileDownloadResult
} from '../../../../shared/ipc-types'
import type {
  HikvisionAttendanceEvent,
  HikvisionDeviceConfigInput,
  HikvisionDeviceConfigSummary,
  HikvisionEnrollFacePayload,
  HikvisionEventSearchRange,
  HikvisionResult,
  HikvisionStatus
} from '../../../../shared/hikvision-types'
import type {
  PrinterConfig,
  PrinterInfo,
  SilentPrintRequest,
  SilentPrintResult
} from '../../../../shared/printing-types'
import type {
  CreateStaffUserRequest,
  StaffAdminResult,
  UpdateStaffUserRequest
} from '../../../../shared/staff-admin-types'

declare global {
  interface Window {
    api: {
      getAppVersion: () => Promise<string>
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        isMaximized: () => Promise<boolean>
      }
      shell: {
        openExternal: (url: string) => Promise<void>
      }
      file: {
        download: (payload: FileDownloadRequest) => Promise<FileDownloadResult>
      }
      setZoomFactor: (factor: number) => Promise<void>
      log: {
        info: (msg: string) => void
        warn: (msg: string) => void
        error: (msg: string) => void
      }
      update: {
        check: () => Promise<void>
        install: () => void
        onStatus: (cb: (status: UpdateStatus) => void) => () => void
      }
      notification: {
        show: (payload: NotificationPayload) => Promise<void>
      }
      onShortcut: (cb: (key: string) => void) => () => void
      hikvision: {
        getConfig: () => Promise<HikvisionDeviceConfigSummary | null>
        saveConfig: (config: HikvisionDeviceConfigInput) => Promise<void>
        testConnection: (config?: HikvisionDeviceConfigInput) => Promise<HikvisionResult>
        connect: () => Promise<HikvisionResult>
        disconnect: () => Promise<void>
        getStatus: () => Promise<HikvisionStatus>
        searchEvents: (range: HikvisionEventSearchRange) => Promise<HikvisionAttendanceEvent[]>
        enrollFace: (payload: HikvisionEnrollFacePayload) => Promise<HikvisionResult>
        onStatus: (cb: (status: HikvisionStatus) => void) => () => void
        onAttendanceEvent: (cb: (event: HikvisionAttendanceEvent) => void) => () => void
      }
      printer: {
        list: () => Promise<PrinterInfo[]>
        getConfig: () => Promise<PrinterConfig>
        saveConfig: (patch: Partial<PrinterConfig>) => Promise<PrinterConfig>
        silentPrint: (request: SilentPrintRequest) => Promise<SilentPrintResult>
      }
      staffAdmin: {
        isAvailable: () => Promise<boolean>
        createUser: (input: CreateStaffUserRequest) => Promise<StaffAdminResult>
        updateUser: (input: UpdateStaffUserRequest) => Promise<StaffAdminResult>
      }
    }
  }
}

export function useElectron() {
  const [appVersion, setAppVersion] = useState<string>('1.0.0')
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api
      ?.getAppVersion()
      .then(setAppVersion)
      .catch(() => {})
    window.api?.window
      .isMaximized()
      .then(setIsMaximized)
      .catch(() => {})
  }, [])

  return {
    appVersion,
    isMaximized,
    minimize: () => window.api?.window.minimize(),
    maximize: () => {
      window.api?.window.maximize()
      setIsMaximized((prev) => !prev)
    },
    close: () => window.api?.window.close(),
    openExternal: (url: string) => window.api?.shell.openExternal(url)
  }
}

export function useLogger() {
  return {
    info: (msg: string) => window.api?.log.info(msg),
    warn: (msg: string) => window.api?.log.warn(msg),
    error: (msg: string) => window.api?.log.error(msg)
  }
}

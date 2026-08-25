// IPC channel constants
export const IPC_CHANNELS = {
  APP_VERSION: 'app:version',
  APP_QUIT: 'app:quit',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:isMaximized',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
  FILE_DOWNLOAD: 'file:download',
  ZOOM_SET: 'zoom:set',
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_INSTALL: 'update:install',
  UPDATE_STATUS: 'update:status',
  LOG_INFO: 'log:info',
  LOG_WARN: 'log:warn',
  LOG_ERROR: 'log:error',
  NOTIFICATION_SHOW: 'notification:show',
  SHORTCUT_TRIGGERED: 'shortcut:triggered',
  TRAY_SHOW: 'tray:show',
  SETTINGS_SET_CRASH_REPORTING: 'settings:setCrashReporting',
  SETTINGS_SET_LOG_LEVEL: 'settings:setLogLevel',
  HIKVISION_GET_CONFIG: 'hikvision:getConfig',
  HIKVISION_SAVE_CONFIG: 'hikvision:saveConfig',
  HIKVISION_TEST_CONNECTION: 'hikvision:testConnection',
  HIKVISION_CONNECT: 'hikvision:connect',
  HIKVISION_DISCONNECT: 'hikvision:disconnect',
  HIKVISION_GET_STATUS: 'hikvision:getStatus',
  HIKVISION_SEARCH_EVENTS: 'hikvision:searchEvents',
  HIKVISION_ENROLL_FACE: 'hikvision:enrollFace',
  HIKVISION_STATUS_PUSH: 'hikvision:statusPush',
  HIKVISION_EVENT_PUSH: 'hikvision:eventPush',
  PRINTER_LIST: 'printer:list',
  PRINTER_GET_CONFIG: 'printer:getConfig',
  PRINTER_SAVE_CONFIG: 'printer:saveConfig',
  PRINTER_SILENT_PRINT: 'printer:silentPrint'
} as const

export type IpcChannels = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  progress?: number
  error?: string
}

export interface NotificationPayload {
  title: string
  body: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

export interface FileDownloadRequest {
  url: string
  filename: string
}

export interface FileDownloadResult {
  canceled: boolean
  filePath?: string
}

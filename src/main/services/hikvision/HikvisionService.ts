import { EventEmitter } from 'node:events'
import log from 'electron-log'
import { HikvisionClient, type ResolvedHikvisionConfig } from './HikvisionClient'
import { HikvisionEventStream } from './eventStream'
import { getConfigSummary, getResolvedConfig, saveConfig } from './configStore'
import type {
  HikvisionAttendanceEvent,
  HikvisionDeviceConfigInput,
  HikvisionDeviceConfigSummary,
  HikvisionEnrollFacePayload,
  HikvisionEventSearchRange,
  HikvisionResult,
  HikvisionStatus
} from '../../../shared/hikvision-types'

interface DeviceInfoResponse {
  DeviceInfo?: {
    deviceName?: string
    model?: string
    serialNumber?: string
    firmwareVersion?: string
  }
}

interface AcsEventInfo {
  major?: number | string
  minor?: number | string
  time?: string
  employeeNoString?: string
  name?: string
  currentVerifyMode?: string
  attendanceStatus?: string
}

interface AcsEventSearchResponse {
  AcsEvent: {
    searchID: string
    responseStatusStrg: 'OK' | 'MORE' | 'NO_MATCHES'
    numOfMatches: number | string
    totalMatches: number | string
    // A device replying in XML collapses a single result down to one object instead of a
    // one-element array (XML has no native array type) — always read this through `toArray()`.
    InfoList?: AcsEventInfo[] | AcsEventInfo
  }
}

/** Coerces XML's "one item is just an object, not a one-element array" quirk into a real array. */
function toArray<T>(value: T[] | T | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** Numeric fields come through as strings from XML responses (see HikvisionClient's `parseTagValue: false`) and as real numbers from JSON ones — this accepts either. */
function toNumber(value: number | string | undefined): number | undefined {
  if (value === undefined) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Orchestrates the Hikvision ISAPI integration end to end: connection lifecycle, the live
 * event stream, historical event search, and face enrollment. A thin layer over
 * HikvisionClient/HikvisionEventStream/configStore — this is what main/ipc.ts talks to.
 *
 * Emits: 'status' (HikvisionStatus) and 'attendance-event' (HikvisionAttendanceEvent).
 */
class HikvisionService extends EventEmitter {
  private client: HikvisionClient | null = null
  private eventStream: HikvisionEventStream | null = null
  private status: HikvisionStatus = { state: 'disconnected', updatedAt: nowIso() }

  getConfigSummary(): HikvisionDeviceConfigSummary | null {
    return getConfigSummary()
  }

  saveConfig(input: HikvisionDeviceConfigInput): void {
    saveConfig(input)
  }

  getStatus(): HikvisionStatus {
    return this.status
  }

  private setStatus(patch: Partial<HikvisionStatus>): void {
    this.status = { ...this.status, ...patch, updatedAt: nowIso() }
    this.emit('status', this.status)
  }

  private buildClient(config: ResolvedHikvisionConfig): HikvisionClient {
    return new HikvisionClient(config)
  }

  private async fetchDeviceInfo(
    client: HikvisionClient
  ): Promise<DeviceInfoResponse['DeviceInfo']> {
    const info = await client.requestJson<DeviceInfoResponse>(
      'GET',
      '/ISAPI/System/deviceInfo?format=json'
    )
    return info.DeviceInfo
  }

  /**
   * Tries a connection without touching the persisted config or the live connection state.
   * When `input` is given (the Settings form's current values), it's tested as-is — using
   * the saved password only if the form's password field was left blank — so editing the
   * host/port/username and testing immediately reflects what's on screen, not stale saved values.
   */
  async testConnection(input?: HikvisionDeviceConfigInput): Promise<HikvisionResult> {
    const saved = getResolvedConfig()
    const config: ResolvedHikvisionConfig | null = input
      ? {
          host: input.host,
          port: input.port,
          useHttps: input.useHttps,
          username: input.username,
          password: input.password || saved?.password || ''
        }
      : saved

    if (!config || !config.password) {
      return { ok: false, message: 'No saved device configuration and no password provided.' }
    }

    try {
      const client = this.buildClient(config)
      const deviceInfo = await this.fetchDeviceInfo(client)
      return {
        ok: true,
        message: deviceInfo?.model
          ? `Connected to ${deviceInfo.model} (${deviceInfo.serialNumber ?? 'unknown S/N'}).`
          : 'Connected successfully.'
      }
    } catch (err) {
      return { ok: false, message: (err as Error).message }
    }
  }

  async connect(): Promise<HikvisionResult> {
    const config = getResolvedConfig()
    if (!config) {
      this.setStatus({ state: 'error', error: 'No device configured yet.' })
      return { ok: false, message: 'No device configured yet.' }
    }

    this.setStatus({ state: 'connecting' })

    try {
      const client = this.buildClient(config)
      const deviceInfo = await this.fetchDeviceInfo(client)
      this.client = client

      this.eventStream?.stop()
      const stream = new HikvisionEventStream(client)
      stream.on('event', (event: HikvisionAttendanceEvent) => this.emit('attendance-event', event))
      stream.on('connected', () => log.info('[hikvision] Event stream connected'))
      stream.on('disconnected', (err?: Error) => {
        if (err) log.warn('[hikvision] Event stream dropped, reconnecting:', err.message)
      })
      stream.start()
      this.eventStream = stream

      this.setStatus({
        state: 'connected',
        deviceModel: deviceInfo?.model,
        serialNumber: deviceInfo?.serialNumber,
        firmwareVersion: deviceInfo?.firmwareVersion,
        error: undefined
      })
      return { ok: true, message: 'Connected.' }
    } catch (err) {
      this.client = null
      this.setStatus({ state: 'error', error: (err as Error).message })
      return { ok: false, message: (err as Error).message }
    }
  }

  disconnect(): void {
    this.eventStream?.stop()
    this.eventStream = null
    this.client = null
    this.setStatus({ state: 'disconnected', error: undefined })
  }

  /** Reconnects automatically on app startup if a device was previously configured. */
  async connectIfConfigured(): Promise<void> {
    if (getResolvedConfig()) {
      const result = await this.connect()
      if (!result.ok) log.warn('[hikvision] Auto-connect on startup failed:', result.message)
    }
  }

  /**
   * Pages through the device's stored access-control event log for a time range — useful for
   * backfilling attendance that happened while the app was closed (the live stream only covers
   * events while connected).
   */
  async searchAttendanceEvents(
    range: HikvisionEventSearchRange
  ): Promise<HikvisionAttendanceEvent[]> {
    if (!this.client) throw new Error('Not connected to the device.')
    const client = this.client

    const results: HikvisionAttendanceEvent[] = []
    let position = 0
    const pageSize = 30
    const searchID = crypto.randomUUID()

    for (let page = 0; page < 200; page += 1) {
      const response = await client.requestJson<AcsEventSearchResponse>(
        'POST',
        '/ISAPI/AccessControl/AcsEvent?format=json',
        {
          AcsEventCond: {
            searchID,
            searchResultPosition: position,
            maxResults: pageSize,
            major: 0,
            minor: 0,
            startTime: range.startTime,
            endTime: range.endTime
          }
        }
      )

      const info = response.AcsEvent
      for (const item of toArray(info.InfoList)) {
        if (!item.employeeNoString) continue
        results.push({
          employeeNo: item.employeeNoString,
          name: item.name,
          time: item.time ?? nowIso(),
          verifyMode: item.currentVerifyMode,
          major: toNumber(item.major),
          minor: toNumber(item.minor),
          attendanceStatus: item.attendanceStatus
        })
      }

      if (info.responseStatusStrg !== 'MORE') break
      position += pageSize
    }

    return results
  }

  /**
   * Registers an employee's face on the terminal: creates/updates their UserInfo record, then
   * uploads the face image. ISAPI field names here follow Hikvision's commonly-documented
   * AccessControl/FDLib shapes but haven't been verified against this exact device/firmware —
   * if this fails, check `GET /ISAPI/AccessControl/capabilities?format=json` on the terminal
   * for the exact schema it expects and adjust accordingly.
   */
  async enrollFace(payload: HikvisionEnrollFacePayload): Promise<HikvisionResult> {
    if (!this.client) return { ok: false, message: 'Not connected to the device.' }
    const client = this.client

    try {
      await client.requestJson('PUT', '/ISAPI/AccessControl/UserInfo/Record?format=json', {
        UserInfo: {
          employeeNo: payload.employeeNo,
          name: payload.name,
          userType: 'normal',
          Valid: {
            enable: true,
            beginTime: '2020-01-01T00:00:00',
            endTime: '2037-12-31T23:59:59',
            timeType: 'local'
          }
        }
      })
    } catch (err) {
      log.warn(
        '[hikvision] UserInfo/Record failed (may already exist, continuing to face upload):',
        (err as Error).message
      )
    }

    try {
      const imageBuffer = Buffer.from(payload.faceImageBase64, 'base64')
      await client.requestMultipart(
        'POST',
        '/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json',
        'FaceDataRecord',
        { faceLibType: 'blackFD', FDID: '1', FPID: payload.employeeNo },
        {
          name: 'img',
          filename: `${payload.employeeNo}.jpg`,
          contentType: 'image/jpeg',
          data: imageBuffer
        }
      )
      return { ok: true, message: `Face enrolled for ${payload.name}.` }
    } catch (err) {
      return { ok: false, message: `Face upload failed: ${(err as Error).message}` }
    }
  }
}

export const hikvisionService = new HikvisionService()

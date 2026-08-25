import { EventEmitter } from 'node:events'
import type { IncomingMessage } from 'node:http'
import log from 'electron-log'
import { XMLParser } from 'fast-xml-parser'
import type { HikvisionClient } from './HikvisionClient'
import type { HikvisionAttendanceEvent } from '../../../shared/hikvision-types'

const ALERT_STREAM_PATH = '/ISAPI/Event/notification/alertStream'
const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000, 15000]

// Mirrors HikvisionClient's parser: some firmware pushes alert-stream parts as XML instead of
// JSON. Keep values as raw strings (no auto number coercion) — see normalizeEvent's toNumber.
const xmlParser = new XMLParser({ ignoreAttributes: true, parseTagValue: false, trimValues: true })

/** Pulls the `boundary` value out of a `Content-Type: multipart/mixed; boundary=xyz` header. */
function extractBoundary(contentType: string | undefined): string | null {
  if (!contentType) return null
  const match = /boundary=("?)([^";]+)\1/i.exec(contentType)
  return match ? match[2] : null
}

/** Numeric fields may arrive as strings (XML) or numbers (JSON) — accept either. */
function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/** Best-effort extraction of an attendance event out of one parsed alert-stream part (JSON or XML). */
function normalizeEvent(json: Record<string, unknown>): HikvisionAttendanceEvent | null {
  const acs = json.AccessControllerEvent as Record<string, unknown> | undefined
  if (!acs) return null

  const employeeNo =
    (typeof acs.employeeNoString === 'string' && acs.employeeNoString) ||
    (acs.employeeNo != null ? String(acs.employeeNo) : undefined)
  if (!employeeNo) return null

  return {
    employeeNo,
    name: typeof acs.name === 'string' ? acs.name : undefined,
    time: typeof json.dateTime === 'string' ? json.dateTime : new Date().toISOString(),
    verifyMode: typeof acs.currentVerifyMode === 'string' ? acs.currentVerifyMode : undefined,
    major: toNumber(acs.majorEventType),
    minor: toNumber(acs.subEventType),
    attendanceStatus: typeof acs.attendanceStatus === 'string' ? acs.attendanceStatus : undefined
  }
}

/** One `multipart/mixed` part: headers block + body, split at the first blank line. */
function splitPart(part: Buffer): { headers: string; body: Buffer } | null {
  const headerEnd = part.indexOf('\r\n\r\n')
  if (headerEnd === -1) return null
  return {
    headers: part.subarray(0, headerEnd).toString('utf-8'),
    body: part.subarray(headerEnd + 4)
  }
}

/**
 * Keeps a persistent connection to the terminal's ISAPI event alert stream open, parses the
 * `multipart/mixed` body incrementally, and emits normalized attendance events as they arrive.
 * Auto-reconnects with backoff if the connection drops.
 */
export class HikvisionEventStream extends EventEmitter {
  private response: IncomingMessage | null = null
  private buffer = Buffer.alloc(0)
  private boundary: string | null = null
  private stopped = true
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(private readonly client: HikvisionClient) {
    super()
  }

  start(): void {
    if (!this.stopped) return
    this.stopped = false
    this.connect()
  }

  stop(): void {
    this.stopped = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.response?.destroy()
    this.response = null
  }

  private async connect(): Promise<void> {
    try {
      const res = await this.client.openStream(ALERT_STREAM_PATH)
      if (this.stopped) {
        res.destroy()
        return
      }
      this.response = res
      this.boundary = extractBoundary(String(res.headers['content-type']))
      this.buffer = Buffer.alloc(0)
      this.reconnectAttempt = 0
      this.emit('connected')

      res.on('data', (chunk: Buffer) => this.onData(chunk))
      res.on('error', (err) => this.onStreamEnded(err))
      res.on('end', () => this.onStreamEnded())
      res.on('close', () => this.onStreamEnded())
    } catch (err) {
      this.onStreamEnded(err as Error)
    }
  }

  private onData(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk])
    if (!this.boundary) return

    const marker = Buffer.from(`--${this.boundary}`)
    let markerIndex = this.buffer.indexOf(marker)

    while (markerIndex !== -1) {
      const nextMarkerIndex = this.buffer.indexOf(marker, markerIndex + marker.length)
      if (nextMarkerIndex === -1) break

      const part = this.buffer.subarray(markerIndex + marker.length, nextMarkerIndex)
      this.processPart(part)

      this.buffer = this.buffer.subarray(nextMarkerIndex)
      markerIndex = this.buffer.indexOf(marker)
    }
  }

  private processPart(part: Buffer): void {
    const split = splitPart(part)
    if (!split) return

    const contentLengthMatch = /Content-Length:\s*(\d+)/i.exec(split.headers)
    let body = split.body
    if (contentLengthMatch) {
      const length = Number(contentLengthMatch[1])
      if (Number.isFinite(length) && length > 0 && length <= body.length) {
        body = body.subarray(0, length)
      }
    }

    const text = body.toString('utf-8').trim()
    if (!text) return

    try {
      let json: Record<string, unknown>
      if (text[0] === '<') {
        json = xmlParser.parse(text) as Record<string, unknown>
      } else if (text[0] === '{') {
        json = JSON.parse(text) as Record<string, unknown>
      } else {
        return
      }
      const event = normalizeEvent(json)
      if (event) this.emit('event', event)
    } catch {
      log.warn('[hikvision] Failed to parse an alert-stream part, skipping it')
    }
  }

  private onStreamEnded(err?: Error): void {
    if (this.response) {
      this.response.removeAllListeners()
      this.response = null
    }
    if (this.stopped) return

    if (err) log.warn('[hikvision] Event stream disconnected:', err.message)
    this.emit('disconnected', err)

    const delay =
      RECONNECT_DELAYS_MS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)]
    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => {
      if (!this.stopped) this.connect()
    }, delay)
  }
}

import http, { type IncomingMessage } from 'node:http'
import https from 'node:https'
import { XMLParser } from 'fast-xml-parser'
import { DigestAuth } from './digestAuth'

// Some ISAPI firmware ignores `?format=json` entirely and always answers in XML — this device
// does. `parseTagValue: false` keeps every value as a raw string (never auto-coerced to a
// number), which matters: fields like `employeeNoString` must stay strings, and callers that
// do need numbers (e.g. event type codes) convert them explicitly with `Number(...)`.
const xmlParser = new XMLParser({ ignoreAttributes: true, parseTagValue: false, trimValues: true })

function looksLikeXml(text: string): boolean {
  return text.startsWith('<')
}

export interface ResolvedHikvisionConfig {
  host: string
  port: number
  useHttps: boolean
  username: string
  password: string
}

interface RawRequestOptions {
  method?: string
  path: string
  body?: Buffer
  headers?: Record<string, string>
  timeoutMs?: number
}

interface HikvisionHttpResponse {
  statusCode: number
  headers: http.IncomingHttpHeaders
  body: Buffer
}

/**
 * Low-level ISAPI (Hikvision's HTTP/JSON device API) client. Handles HTTP Digest auth
 * (RFC 2617) transparently and exposes JSON, multipart, and long-lived-stream helpers.
 *
 * `rejectUnauthorized: false` is intentional: this talks to a single admin-configured
 * device on the local LAN, which almost always presents a self-signed certificate when
 * HTTPS is enabled. Digest auth (not TLS) is the trust boundary here.
 */
export class HikvisionClient {
  private readonly auth: DigestAuth

  constructor(private readonly config: ResolvedHikvisionConfig) {
    this.auth = new DigestAuth(config.username, config.password)
  }

  private transport() {
    return this.config.useHttps ? https : http
  }

  private rawRequest(
    opts: RawRequestOptions,
    authorizationHeader?: string
  ): Promise<HikvisionHttpResponse> {
    return new Promise((resolve, reject) => {
      const req = this.transport().request(
        {
          host: this.config.host,
          port: this.config.port,
          path: opts.path,
          method: opts.method ?? 'GET',
          rejectUnauthorized: false,
          headers: {
            ...opts.headers,
            ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
            ...(opts.body ? { 'Content-Length': String(opts.body.byteLength) } : {})
          },
          timeout: opts.timeoutMs ?? 10000
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => chunks.push(chunk))
          res.on('end', () =>
            resolve({
              statusCode: res.statusCode ?? 0,
              headers: res.headers,
              body: Buffer.concat(chunks)
            })
          )
          res.on('error', reject)
        }
      )
      req.on('timeout', () => req.destroy(new Error('Request to device timed out')))
      req.on('error', reject)
      if (opts.body) req.write(opts.body)
      req.end()
    })
  }

  /** Sends a request, transparently handling the digest-auth challenge/response handshake. */
  async request(opts: RawRequestOptions): Promise<HikvisionHttpResponse> {
    const method = opts.method ?? 'GET'
    const firstAuthHeader = this.auth.hasChallenge()
      ? (this.auth.buildAuthorizationHeader(method, opts.path) ?? undefined)
      : undefined
    let res = await this.rawRequest(opts, firstAuthHeader)

    if (res.statusCode === 401) {
      const challengeHeader = res.headers['www-authenticate']
      const challengeStr = Array.isArray(challengeHeader) ? challengeHeader[0] : challengeHeader
      if (!challengeStr || !this.auth.setChallenge(challengeStr)) {
        throw new Error('Device did not return a usable authentication challenge')
      }
      const retryAuthHeader = this.auth.buildAuthorizationHeader(method, opts.path)
      res = await this.rawRequest(opts, retryAuthHeader ?? undefined)
      if (res.statusCode === 401) {
        throw new Error('Authentication failed — check the device username and password')
      }
    }

    return res
  }

  async requestJson<T>(method: string, path: string, jsonBody?: unknown): Promise<T> {
    const body = jsonBody !== undefined ? Buffer.from(JSON.stringify(jsonBody), 'utf-8') : undefined
    const res = await this.request({
      method,
      path,
      body,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    })
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(
        `ISAPI ${method} ${path} failed: HTTP ${res.statusCode} — ${res.body.toString('utf-8').slice(0, 300)}`
      )
    }
    const text = res.body.toString('utf-8').trim()
    if (!text) return {} as T

    if (looksLikeXml(text)) {
      try {
        return xmlParser.parse(text) as T
      } catch {
        throw new Error(`ISAPI ${method} ${path} returned unparsable XML: ${text.slice(0, 300)}`)
      }
    }
    try {
      return JSON.parse(text) as T
    } catch {
      throw new Error(
        `ISAPI ${method} ${path} returned a response in neither JSON nor XML: ${text.slice(0, 300)}`
      )
    }
  }

  /** Sends a `multipart/form-data` body: one JSON metadata part, optionally one binary file part. */
  async requestMultipart(
    method: string,
    path: string,
    jsonPartName: string,
    jsonPart: unknown,
    filePart?: { name: string; filename: string; contentType: string; data: Buffer }
  ): Promise<HikvisionHttpResponse> {
    const boundary = `----AionXHikvision${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`
    const segments: Buffer[] = [
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(
        `Content-Disposition: form-data; name="${jsonPartName}"\r\nContent-Type: application/json\r\n\r\n`
      ),
      Buffer.from(JSON.stringify(jsonPart)),
      Buffer.from('\r\n')
    ]

    if (filePart) {
      segments.push(
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(
          `Content-Disposition: form-data; name="${filePart.name}"; filename="${filePart.filename}"\r\nContent-Type: ${filePart.contentType}\r\n\r\n`
        ),
        filePart.data,
        Buffer.from('\r\n')
      )
    }

    segments.push(Buffer.from(`--${boundary}--\r\n`))
    const body = Buffer.concat(segments)

    const res = await this.request({
      method,
      path,
      body,
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` }
    })
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(
        `ISAPI ${method} ${path} failed: HTTP ${res.statusCode} — ${res.body.toString('utf-8').slice(0, 300)}`
      )
    }
    return res
  }

  /**
   * Opens a persistent streaming GET (e.g. the ISAPI event alert stream) and resolves with the
   * raw response so the caller can pipe/parse the multipart body as it arrives.
   *
   * Handles the digest challenge/retry itself (unlike a plain passthrough to `request()`,
   * which can't be used here since we need the raw, unbuffered response). This matters beyond
   * the very first connection: if a previously-cached challenge goes stale and a *reconnect*
   * attempt gets a 401, we still need to re-challenge and retry — otherwise the stream's
   * auto-reconnect loop would keep retrying with the same stale credentials forever.
   */
  async openStream(path: string): Promise<IncomingMessage> {
    type StreamAttempt = { res: IncomingMessage } | { unauthorized: true; challengeHeader?: string }

    const attemptOnce = (): Promise<StreamAttempt> => {
      return new Promise((resolve, reject) => {
        const authHeader = this.auth.hasChallenge()
          ? (this.auth.buildAuthorizationHeader('GET', path) ?? undefined)
          : undefined
        const req = this.transport().request(
          {
            host: this.config.host,
            port: this.config.port,
            path,
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
              Accept: 'multipart/mixed',
              ...(authHeader ? { Authorization: authHeader } : {})
            }
          },
          (res) => {
            // Response headers arrived — this becomes a long-lived stream from here, so stop
            // guarding it with a timeout (a healthy stream can be idle between events for a while).
            req.setTimeout(0)

            if (res.statusCode === 401) {
              res.resume()
              const challengeHeader = res.headers['www-authenticate']
              resolve({
                unauthorized: true,
                challengeHeader: Array.isArray(challengeHeader)
                  ? challengeHeader[0]
                  : challengeHeader
              })
              return
            }
            if ((res.statusCode ?? 0) >= 300) {
              res.resume()
              reject(new Error(`Event stream request failed: HTTP ${res.statusCode}`))
              return
            }
            resolve({ res })
          }
        )
        req.on('error', reject)
        // Only guards the connect phase (cleared above once headers arrive) — an unreachable
        // device would otherwise hang this promise forever instead of failing so the caller can retry.
        req.setTimeout(15000, () =>
          req.destroy(new Error('Timed out connecting to the event stream'))
        )
        req.end()
      })
    }

    let result = await attemptOnce()
    if ('unauthorized' in result) {
      if (!result.challengeHeader || !this.auth.setChallenge(result.challengeHeader)) {
        throw new Error('Authentication failed while opening the event stream')
      }
      result = await attemptOnce()
      if ('unauthorized' in result) {
        throw new Error('Authentication failed while opening the event stream')
      }
    }
    return result.res
  }
}

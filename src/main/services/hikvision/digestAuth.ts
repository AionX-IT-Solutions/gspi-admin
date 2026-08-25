import { createHash, randomBytes } from 'node:crypto'

interface DigestChallenge {
  realm: string
  nonce: string
  qop?: string
  opaque?: string
  algorithm?: string
}

function md5(input: string): string {
  return createHash('md5').update(input).digest('hex')
}

/** Parses a `WWW-Authenticate: Digest ...` header (RFC 2617) into its directives. */
export function parseDigestChallenge(header: string): DigestChallenge | null {
  if (!header || !/^digest/i.test(header.trim())) return null

  const directives: Record<string, string> = {}
  const re = /(\w+)=(?:"([^"]*)"|([^\s,]+))/g
  let match: RegExpExecArray | null
  while ((match = re.exec(header)) !== null) {
    directives[match[1].toLowerCase()] = match[2] ?? match[3]
  }

  if (!directives.realm || !directives.nonce) return null
  return {
    realm: directives.realm,
    nonce: directives.nonce,
    qop: directives.qop,
    opaque: directives.opaque,
    algorithm: directives.algorithm
  }
}

/**
 * Stateful HTTP Digest (RFC 2617) credential calculator for a single device/user pair.
 * Caches the last-seen challenge and increments the nonce-count so most requests can send
 * a pre-computed Authorization header on the first try; call `.setChallenge()` again after a
 * fresh 401 (e.g. stale nonce) to resync.
 */
export class DigestAuth {
  private challenge: DigestChallenge | null = null
  private nc = 0

  constructor(
    private readonly username: string,
    private readonly password: string
  ) {}

  setChallenge(wwwAuthenticateHeader: string): boolean {
    const challenge = parseDigestChallenge(wwwAuthenticateHeader)
    if (!challenge) return false
    this.challenge = challenge
    this.nc = 0
    return true
  }

  hasChallenge(): boolean {
    return this.challenge !== null
  }

  /** Builds the `Authorization` header value for a request, using the cached challenge. */
  buildAuthorizationHeader(method: string, uri: string): string | null {
    if (!this.challenge) return null
    const { realm, nonce, qop, opaque } = this.challenge

    this.nc += 1
    const ncValue = this.nc.toString(16).padStart(8, '0')
    const cnonce = randomBytes(8).toString('hex')

    const ha1 = md5(`${this.username}:${realm}:${this.password}`)
    const ha2 = md5(`${method}:${uri}`)

    const qopDirective = qop?.split(',')[0].trim()
    const response = qopDirective
      ? md5(`${ha1}:${nonce}:${ncValue}:${cnonce}:${qopDirective}:${ha2}`)
      : md5(`${ha1}:${nonce}:${ha2}`)

    const parts = [
      `username="${this.username}"`,
      `realm="${realm}"`,
      `nonce="${nonce}"`,
      `uri="${uri}"`,
      `response="${response}"`
    ]
    if (opaque) parts.push(`opaque="${opaque}"`)
    if (qopDirective) {
      parts.push(`qop=${qopDirective}`)
      parts.push(`nc=${ncValue}`)
      parts.push(`cnonce="${cnonce}"`)
    }

    return `Digest ${parts.join(', ')}`
  }
}

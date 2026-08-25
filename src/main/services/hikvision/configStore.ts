import { app, safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  HikvisionDeviceConfigInput,
  HikvisionDeviceConfigSummary
} from '../../../shared/hikvision-types'
import type { ResolvedHikvisionConfig } from './HikvisionClient'

interface StoredConfig {
  host: string
  port: number
  useHttps: boolean
  username: string
  /** Preferred: encrypted via Electron's OS-backed safeStorage (DPAPI on Windows). */
  passwordEncryptedBase64?: string
  /** Fallback only, for the rare case safeStorage is unavailable on this machine. */
  passwordPlain?: string
}

function configPath(): string {
  return join(app.getPath('userData'), 'hikvision-device.json')
}

function loadStored(): StoredConfig | null {
  const path = configPath()
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as StoredConfig
  } catch {
    return null
  }
}

function saveStored(config: StoredConfig): void {
  writeFileSync(configPath(), JSON.stringify(config, null, 2), 'utf-8')
}

function decryptPassword(stored: StoredConfig): string {
  if (stored.passwordEncryptedBase64 && safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(stored.passwordEncryptedBase64, 'base64'))
    } catch {
      return ''
    }
  }
  return stored.passwordPlain ?? ''
}

/** Full config, password decrypted — for the main-process service to actually connect with. */
export function getResolvedConfig(): ResolvedHikvisionConfig | null {
  const stored = loadStored()
  if (!stored) return null
  return {
    host: stored.host,
    port: stored.port,
    useHttps: stored.useHttps,
    username: stored.username,
    password: decryptPassword(stored)
  }
}

/** Renderer-safe summary — never includes the password itself. */
export function getConfigSummary(): HikvisionDeviceConfigSummary | null {
  const stored = loadStored()
  if (!stored) return null
  return {
    host: stored.host,
    port: stored.port,
    useHttps: stored.useHttps,
    username: stored.username,
    hasPassword: !!(stored.passwordEncryptedBase64 || stored.passwordPlain)
  }
}

/** Saves host/port/username always; only touches the stored password when a new one is provided. */
export function saveConfig(input: HikvisionDeviceConfigInput): void {
  const existing = loadStored()
  const stored: StoredConfig = {
    host: input.host,
    port: input.port,
    useHttps: input.useHttps,
    username: input.username,
    passwordEncryptedBase64: existing?.passwordEncryptedBase64,
    passwordPlain: existing?.passwordPlain
  }

  if (input.password) {
    if (safeStorage.isEncryptionAvailable()) {
      stored.passwordEncryptedBase64 = safeStorage.encryptString(input.password).toString('base64')
      stored.passwordPlain = undefined
    } else {
      stored.passwordPlain = input.password
      stored.passwordEncryptedBase64 = undefined
    }
  }

  saveStored(stored)
}

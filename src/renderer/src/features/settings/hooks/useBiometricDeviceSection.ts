import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/app/hooks/useToast'
import type { HikvisionStatus } from '../../../../../shared/hikvision-types'

// Hikvision terminals almost always serve plain HTTP (this one confirmed does) — HTTPS support
// stays in the underlying client/service for a future device that needs it, but isn't exposed
// as a toggle here since it was a source of confusion for a case that never comes up in practice.
const USE_HTTPS = false

function emptyForm() {
  return { host: '', port: 80, username: 'admin', password: '' }
}

export function useBiometricDeviceSection() {
  const { t } = useTranslation()
  const toast = useToast()
  const [form, setForm] = useState(emptyForm())
  const [hasPassword, setHasPassword] = useState(false)
  const [status, setStatus] = useState<HikvisionStatus>({
    state: 'disconnected',
    updatedAt: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [config, currentStatus] = await Promise.all([
        window.api?.hikvision.getConfig(),
        window.api?.hikvision.getStatus()
      ])
      if (cancelled) return
      if (config) {
        setForm({ host: config.host, port: config.port, username: config.username, password: '' })
        setHasPassword(config.hasPassword)
      }
      if (currentStatus) setStatus(currentStatus)
      setLoading(false)
    }
    load()

    const unsubscribe = window.api?.hikvision.onStatus((s) => setStatus(s))
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  function requireHikvisionApi(): NonNullable<Window['api']>['hikvision'] | null {
    const api = window.api?.hikvision
    if (!api) {
      toast.error(t('settings.biometricDevice.toast.apiUnavailable'))
      return null
    }
    return api
  }

  async function persistForm(api: NonNullable<Window['api']>['hikvision']) {
    await api.saveConfig({
      host: form.host.trim(),
      port: form.port,
      useHttps: USE_HTTPS,
      username: form.username.trim(),
      password: form.password || undefined
    })
    if (form.password) setHasPassword(true)
    setForm((f) => ({ ...f, password: '' }))
  }

  async function handleSave() {
    if (!form.host.trim()) {
      toast.error(t('settings.biometricDevice.toast.hostRequired'))
      return
    }
    const api = requireHikvisionApi()
    if (!api) return
    setSaving(true)
    try {
      await persistForm(api)
      toast.success(t('settings.biometricDevice.toast.saved'))
    } catch (err) {
      toast.error((err as Error).message || t('settings.biometricDevice.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleTestConnection() {
    if (!form.host.trim()) {
      toast.error(t('settings.biometricDevice.toast.hostRequired'))
      return
    }
    const api = requireHikvisionApi()
    if (!api) return
    setTesting(true)
    try {
      const result = await api.testConnection({
        host: form.host.trim(),
        port: form.port,
        useHttps: USE_HTTPS,
        username: form.username.trim(),
        password: form.password || undefined
      })
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message || t('settings.biometricDevice.toast.testFailed'))
      }
    } catch (err) {
      toast.error((err as Error).message || t('settings.biometricDevice.toast.testFailed'))
    } finally {
      setTesting(false)
    }
  }

  async function handleConnect() {
    if (!form.host.trim()) {
      toast.error(t('settings.biometricDevice.toast.hostRequired'))
      return
    }
    const api = requireHikvisionApi()
    if (!api) return
    setConnecting(true)
    try {
      // Always save first so Connect never runs against stale settings from a previous edit.
      await persistForm(api)
      const result = await api.connect()
      if (!result.ok)
        toast.error(result.message || t('settings.biometricDevice.toast.connectFailed'))
    } catch (err) {
      toast.error((err as Error).message || t('settings.biometricDevice.toast.connectFailed'))
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    const api = requireHikvisionApi()
    if (!api) return
    await api.disconnect()
  }

  return {
    form,
    setForm,
    hasPassword,
    status,
    loading,
    saving,
    testing,
    connecting,
    handleSave,
    handleTestConnection,
    handleConnect,
    handleDisconnect
  }
}

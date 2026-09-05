import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useHRStore } from '../store/hr.store'
import { useToast } from '@/app/hooks/useToast'
import type { BiometricMethod, Employee } from '../types/hr.types'

export interface EnrollmentRow {
  id: string
  fullName: string
  position: string
  method: string
  enrolled: boolean
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useEnrollmentTab() {
  const { t } = useTranslation()
  const loading = useSkeletonLoading()
  const toast = useToast()
  const employees = useHRStore((s) => s.employees)
  const enrollments = useHRStore((s) => s.enrollments)
  const enrollBiometric = useHRStore((s) => s.enrollBiometric)
  const setEnrollmentActive = useHRStore((s) => s.setEnrollmentActive)

  const [enrollTarget, setEnrollTarget] = useState<Employee | null>(null)
  const [enrollMethod, setEnrollMethod] = useState<BiometricMethod>('both')
  const [facePhoto, setFacePhoto] = useState<File | null>(null)
  const [sendingToDevice, setSendingToDevice] = useState(false)
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [unenrollTarget, setUnenrollTarget] = useState<EnrollmentRow | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    window.api?.hikvision.getStatus().then((s) => setDeviceConnected(s.state === 'connected'))
    const unsubscribe = window.api?.hikvision.onStatus((s) =>
      setDeviceConnected(s.state === 'connected')
    )
    return () => unsubscribe?.()
  }, [])

  const activeEmployees = employees.filter((e) => e.isActive)

  function handleConfirmUnenroll() {
    if (!unenrollTarget) return
    setEnrollmentActive(unenrollTarget.id, false)
    toast.info(t('biometricKiosk.toast.unenrolled', { name: unenrollTarget.fullName }))
    setUnenrollTarget(null)
  }

  async function handleEnroll() {
    if (!enrollTarget) return
    enrollBiometric(enrollTarget.id, enrollMethod)
    toast.success(t('biometricKiosk.toast.enrolled', { name: enrollTarget.fullName }))

    if (facePhoto && enrollMethod !== 'fingerprint' && deviceConnected) {
      setSendingToDevice(true)
      try {
        const faceImageBase64 = await fileToBase64(facePhoto)
        const result = await window.api?.hikvision.enrollFace({
          employeeNo: enrollTarget.employeeNumber,
          name: enrollTarget.fullName,
          faceImageBase64
        })
        if (result?.ok) {
          toast.success(t('biometricKiosk.toast.deviceEnrolled', { name: enrollTarget.fullName }))
        } else {
          toast.error(result?.message ?? t('biometricKiosk.toast.deviceEnrollFailed'))
        }
      } finally {
        setSendingToDevice(false)
      }
    }

    setEnrollTarget(null)
  }

  function openEnroll(emp: Employee) {
    setEnrollTarget(emp)
    setEnrollMethod('both')
    setFacePhoto(null)
  }

  const enrollmentRows: EnrollmentRow[] = activeEmployees.map((emp) => {
    const enrollment = enrollments.find((e) => e.employeeId === emp.id)
    return {
      id: emp.id,
      fullName: emp.fullName,
      position: emp.position,
      method: enrollment?.isActive ? enrollment.method : '—',
      enrolled: !!enrollment?.isActive
    }
  })

  const filteredEnrollmentRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return enrollmentRows
    return enrollmentRows.filter(
      (r) => r.fullName.toLowerCase().includes(q) || r.position.toLowerCase().includes(q)
    )
  }, [enrollmentRows, search])

  return {
    loading,
    employees,
    enrollmentRows: filteredEnrollmentRows,
    search,
    setSearch,
    enrollTarget,
    setEnrollTarget,
    enrollMethod,
    setEnrollMethod,
    facePhoto,
    setFacePhoto,
    sendingToDevice,
    deviceConnected,
    unenrollTarget,
    setUnenrollTarget,
    handleConfirmUnenroll,
    handleEnroll,
    openEnroll
  }
}

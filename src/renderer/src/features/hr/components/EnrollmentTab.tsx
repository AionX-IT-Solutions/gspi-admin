import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { FieldSelect } from '@/shared/components/ui/FormField'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import type { BiometricMethod } from '../types/hr.types'
import { useEnrollmentTab, type EnrollmentRow } from '../hooks/useEnrollmentTab'
import { useHRStore } from '../store/hr.store'

export function EnrollmentTab() {
  const { t } = useTranslation()
  const {
    loading,
    employees,
    enrollmentRows,
    enrollTarget,
    setEnrollTarget,
    enrollMethod,
    setEnrollMethod,
    setFacePhoto,
    sendingToDevice,
    deviceConnected,
    unenrollTarget,
    setUnenrollTarget,
    handleConfirmUnenroll,
    handleEnroll,
    openEnroll
  } = useEnrollmentTab()
  const hydrate = useHRStore((s) => s.hydrate)

  const columns: Column<EnrollmentRow>[] = [
    { key: 'fullName', header: t('biometricKiosk.table.employee') },
    { key: 'position', header: t('biometricKiosk.table.position') },
    {
      key: 'method',
      header: t('biometricKiosk.table.method'),
      render: (r) => <span style={{ textTransform: 'capitalize' }}>{r.method}</span>
    },
    {
      key: 'enrolled',
      header: t('biometricKiosk.table.status'),
      render: (r) => (
        <Badge variant={r.enrolled ? 'success' : 'outline'}>
          {r.enrolled
            ? t('biometricKiosk.status.enrolled')
            : t('biometricKiosk.status.notEnrolled')}
        </Badge>
      )
    },
    {
      key: 'id',
      header: t('biometricKiosk.table.action'),
      sortable: false,
      align: 'right',
      render: (r) => {
        const emp = employees.find((e) => e.id === r.id)
        if (!emp) return null
        return r.enrolled ? (
          <Button size="sm" variant="ghost" onClick={() => setUnenrollTarget(r)}>
            {t('biometricKiosk.unenrollButton')}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => openEnroll(emp)}>
            {t('biometricKiosk.enrollButton')}
          </Button>
        )
      }
    }
  ]

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} color="var(--accent-primary)" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {t('biometricKiosk.enrolledEmployees')}
          </span>
        </div>
        <RefreshButton onRefresh={() => hydrate(true)} />
      </div>
      <Card padding="0px">
        <DataTable
          columns={columns}
          data={enrollmentRows}
          loading={loading}
          emptyMessage={t('biometricKiosk.empty')}
        />
      </Card>

      <Modal
        open={!!enrollTarget}
        onOpenChange={(open) => !open && setEnrollTarget(null)}
        title={t('biometricKiosk.modal.enrollTitle', { name: enrollTarget?.fullName ?? '' })}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEnrollTarget(null)}
              disabled={sendingToDevice}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleEnroll} disabled={sendingToDevice}>
              {t('biometricKiosk.enrollButton')}
            </Button>
          </>
        }
      >
        <FieldSelect
          value={enrollMethod}
          onChange={(e) => setEnrollMethod(e.target.value as BiometricMethod)}
          options={[
            {
              value: 'fingerprint',
              label: t('biometricKiosk.modal.methodOptions.fingerprintOnly')
            },
            { value: 'face', label: t('biometricKiosk.modal.methodOptions.faceOnly') },
            { value: 'both', label: t('biometricKiosk.modal.methodOptions.both') }
          ]}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          {t('biometricKiosk.modal.note')}
        </p>

        {enrollMethod !== 'fingerprint' && (
          <div
            style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 4
              }}
            >
              {t('biometricKiosk.modal.deviceEnrollLabel')}
            </p>
            {deviceConnected ? (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => setFacePhoto(e.target.files?.[0] ?? null)}
                  style={{ fontSize: 12, color: 'var(--text-secondary)' }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {t('biometricKiosk.modal.deviceEnrollNote')}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t('biometricKiosk.modal.deviceNotConnected')}
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!unenrollTarget}
        title={t('biometricKiosk.confirmUnenroll.title')}
        message={t('biometricKiosk.confirmUnenroll.message', {
          name: unenrollTarget?.fullName ?? ''
        })}
        confirmLabel={t('biometricKiosk.unenrollButton')}
        danger
        onConfirm={handleConfirmUnenroll}
        onCancel={() => setUnenrollTarget(null)}
      />
    </>
  )
}

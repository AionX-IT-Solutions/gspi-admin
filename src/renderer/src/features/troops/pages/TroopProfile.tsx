import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Pencil, RefreshCw, UserX, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { actionsColumn } from '@/shared/lib/columnHelpers'
import { formatDate } from '@/shared/lib/utils'
import { useTroopsStore } from '../store/troops.store'
import { useTroopProfile } from '../hooks/useTroopProfile'
import { ScoutMemberFormModal } from '../components/ScoutMemberFormModal'
import type { ScoutMember } from '../types/troop.types'

export function TroopProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const troop = useTroopsStore((s) => s.troops.find((tr) => tr.id === id) ?? null)

  const {
    roster,
    currentMembershipYear,
    isCurrent,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    toggleTarget,
    setToggleTarget,
    handleConfirmToggleActive,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    handleRenew
  } = useTroopProfile(troop)

  if (!troop) return null

  const columns: Column<ScoutMember>[] = [
    { key: 'fullName', header: t('troops.roster.table.fullName') },
    {
      key: 'birthdate',
      header: t('troops.roster.table.birthdate'),
      render: (r) => formatDate(r.birthdate)
    },
    { key: 'level', header: t('troops.roster.table.level'), render: (r) => r.level || '—' },
    {
      key: 'guardianName',
      header: t('troops.roster.table.guardian'),
      render: (r) => r.guardianName || '—'
    },
    {
      key: 'membershipYear',
      header: t('troops.roster.table.membership'),
      render: (r) =>
        isCurrent(r) ? (
          <Badge variant="success">
            {t('troops.roster.table.current', { year: r.membershipYear })}
          </Badge>
        ) : (
          <Badge variant="warning">
            {t('troops.roster.table.needsRenewalBadge', { year: r.membershipYear })}
          </Badge>
        )
    },
    actionsColumn<ScoutMember>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          {!isCurrent(r) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRenew(r)}
              title={t('troops.roster.renewButton')}
            >
              <RefreshCw size={13} />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
            <Pencil size={13} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setToggleTarget(r)}
            title={r.isActive ? t('troops.table.deactivate') : t('troops.table.reactivate')}
          >
            <UserX size={13} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteTarget(r)}
            title={t('common.delete')}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
      t('common.actions')
    )
  ]

  return (
    <div className="page-wrapper">
      <PageHeader
        title={troop.troopNumber}
        subtitle={troop.troopName || troop.level}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/troops')}
            leftIcon={<ArrowLeft size={14} />}
          >
            {t('common.back')}
          </Button>
        }
      />

      <Card padding="16px" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('troops.form.level')}</div>
            <div style={{ fontSize: 14 }}>{troop.level}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.leaderName')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.leaderName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.assistantLeaderName')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.assistantLeaderName || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.school')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.school || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.barangay')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.barangay || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('troops.form.meetingPlace')}
            </div>
            <div style={{ fontSize: 14 }}>{troop.meetingPlace || '—'}</div>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)'
            }}
          >
            {t('troops.roster.heading')}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {t('troops.subtitle', { year: currentMembershipYear })}
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
          {t('troops.roster.addButton')}
        </Button>
      </div>

      <Card padding="0px">
        <DataTable columns={columns} data={roster} emptyMessage={t('troops.roster.empty')} />
      </Card>

      <ScoutMemberFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        troopId={troop.id}
        currentMembershipYear={currentMembershipYear}
        editTarget={editTarget}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('troops.roster.confirmDeactivate.title')
            : t('troops.roster.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('troops.roster.confirmDeactivate.message', { name: toggleTarget?.fullName ?? '' })
            : t('troops.roster.confirmReactivate.message', { name: toggleTarget?.fullName ?? '' })
        }
        confirmLabel={
          toggleTarget?.isActive ? t('troops.table.deactivate') : t('troops.table.reactivate')
        }
        danger={toggleTarget?.isActive}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('troops.roster.confirmDelete.title')}
        message={t('troops.roster.confirmDelete.message', { name: deleteTarget?.fullName ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default TroopProfile

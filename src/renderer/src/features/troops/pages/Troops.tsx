import { motion } from 'framer-motion'
import { Tent, Plus, Pencil, Users, UserX, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { statusColumn, actionsColumn } from '@/shared/lib/columnHelpers'
import type { Troop } from '../types/troop.types'
import { TroopFormModal } from '../components/TroopFormModal'
import { TroopsExportMenu } from '../components/TroopsExportMenu'
import { useTroops } from '../hooks/useTroops'
import { useTroopsStore } from '../store/troops.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Troops() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    loading,
    canManage,
    search,
    setSearch,
    filteredTroops,
    rosterStats,
    currentMembershipYear,
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
    handleConfirmDelete
  } = useTroops()
  const hydrate = useTroopsStore((s) => s.hydrate)

  const columns: Column<Troop>[] = [
    { key: 'troopNumber', header: t('troops.table.troopNumber'), width: 'w-28' },
    { key: 'troopName', header: t('troops.table.troopName'), render: (r) => r.troopName ?? '—' },
    { key: 'level', header: t('troops.table.level') },
    { key: 'leaderName', header: t('troops.table.leaderName') },
    {
      key: 'memberCount',
      header: t('troops.table.members'),
      sortable: false,
      render: (r) => {
        const stats = rosterStats.get(r.id)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{stats?.total ?? 0}</span>
            {!!stats?.needsRenewal && (
              <Badge variant="warning">
                {t('troops.table.needsRenewal', { count: stats.needsRenewal })}
              </Badge>
            )}
          </div>
        )
      }
    },
    statusColumn<Troop>({
      key: 'isActive',
      header: t('troops.table.status'),
      trueLabel: t('common.active'),
      falseLabel: t('common.inactive')
    }),
    actionsColumn<Troop>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/troops/${r.id}`)}
            title={t('troops.viewRoster')}
          >
            <Users size={13} />
          </Button>
          {canManage && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title={t('common.edit')}>
              <Pencil size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setToggleTarget(r)}
              title={r.isActive ? t('troops.table.deactivate') : t('troops.table.reactivate')}
            >
              <UserX size={13} />
            </Button>
          )}
          {canManage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(r)}
              title={t('common.delete')}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      ),
      t('common.actions')
    )
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="troops"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('troops.title')}
        subtitle={t('troops.subtitle', { year: currentMembershipYear })}
        icon={<Tent size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <TroopsExportMenu
              troops={filteredTroops.map((tr) => ({
                ...tr,
                memberCount: rosterStats.get(tr.id)?.total ?? 0
              }))}
              membershipYear={currentMembershipYear}
            />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('troops.addButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('troops.searchPlaceholder')}
        count={filteredTroops.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filteredTroops}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('troops.empty')}
        />
      </Card>

      <TroopFormModal open={showDialog} onOpenChange={setShowDialog} editTarget={editTarget} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? t('troops.confirmDeactivate.title')
            : t('troops.confirmReactivate.title')
        }
        message={
          toggleTarget?.isActive
            ? t('troops.confirmDeactivate.message', {
                troopNumber: toggleTarget?.troopNumber ?? ''
              })
            : t('troops.confirmReactivate.message', {
                troopNumber: toggleTarget?.troopNumber ?? ''
              })
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
        title={t('troops.confirmDelete.title')}
        message={t('troops.confirmDelete.message', {
          troopNumber: deleteTarget?.troopNumber ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}

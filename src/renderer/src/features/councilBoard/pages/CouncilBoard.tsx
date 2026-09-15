import { motion } from 'framer-motion'
import { Landmark, Pencil, Plus, Trash2, UserCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
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
import { avatarColumn, actionsColumn } from '@/shared/lib/columnHelpers'
import { formatDate } from '@/shared/lib/utils'
import type { CouncilBoardMember } from '../types/councilBoard.types'
import { CouncilBoardFormModal } from '../components/CouncilBoardFormModal'
import { useCouncilBoard } from '../hooks/useCouncilBoard'
import { useCouncilBoardStore } from '../store/councilBoard.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function CouncilBoard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    loading,
    canManage,
    members,
    search,
    setSearch,
    showDialog,
    setShowDialog,
    editTarget,
    openAdd,
    openEdit,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete
  } = useCouncilBoard()
  const hydrate = useCouncilBoardStore((s) => s.hydrate)

  const columns: Column<CouncilBoardMember>[] = [
    avatarColumn<CouncilBoardMember>({
      key: 'fullName',
      header: t('councilBoard.table.name'),
      colorKey: 'avatarColor'
    }),
    { key: 'position', header: t('councilBoard.table.position') },
    {
      key: 'contactNumber',
      header: t('councilBoard.table.contactNumber'),
      render: (r) => r.contactNumber || '—'
    },
    { key: 'email', header: t('councilBoard.table.email'), render: (r) => r.email || '—' },
    {
      key: 'birthDate',
      header: t('councilBoard.table.birthDate'),
      render: (r) => (r.birthDate ? formatDate(r.birthDate) : '—')
    },
    actionsColumn<CouncilBoardMember>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/council-board/${r.id}`)}
            title={t('councilBoard.profile.viewProfile')}
          >
            <UserCircle2 size={13} />
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
      key="council-board"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('councilBoard.title')}
        subtitle={t('councilBoard.subtitle')}
        icon={<Landmark size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('councilBoard.addButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('councilBoard.searchPlaceholder')}
        count={members.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={members}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('councilBoard.table.empty')}
        />
      </Card>

      <CouncilBoardFormModal
        open={showDialog}
        onOpenChange={setShowDialog}
        editTarget={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('councilBoard.confirmDelete.title')}
        message={t('councilBoard.confirmDelete.message', { name: deleteTarget?.fullName ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { CreditCard, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { FormField, FieldInput } from '@/shared/components/ui/FormField'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { actionsColumn } from '@/shared/lib/columnHelpers'
import type { Member } from '../types/pos.types'
import { useMembers } from '../hooks/useMembers'
import { usePOSStore } from '../store/pos.store'
import { LoyaltyCardModal } from '../components/LoyaltyCardModal'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Members() {
  const { t } = useTranslation()
  const {
    loading,
    canManage,
    members,
    search,
    setSearch,
    showForm,
    setShowForm,
    editTarget,
    openAdd,
    openEdit,
    form,
    setForm,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    printTarget,
    setPrintTarget,
    printQty,
    setPrintQty,
    handlePrintCard
  } = useMembers()
  const hydrate = usePOSStore((s) => s.hydrate)

  const columns: Column<Member>[] = [
    { key: 'code', header: t('members.table.memberCode') },
    { key: 'name', header: t('members.table.name') },
    { key: 'email', header: t('members.table.email'), render: (r) => r.email ?? '—' },
    {
      key: 'discountRate',
      header: t('members.table.discount'),
      align: 'right',
      render: (r) => `${(r.discountRate * 100).toFixed(0)}%`
    },
    actionsColumn<Member>(
      (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<CreditCard size={12} />}
            onClick={() => setPrintTarget(r)}
          >
            {t('members.printCardButton')}
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
      key="members"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('members.title')}
        icon={<Users size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openAdd}>
                {t('members.addButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('members.searchPlaceholder')}
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
          emptyMessage={t('members.table.emptyMessage')}
        />
      </Card>

      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={editTarget ? t('members.modal.editMemberTitle') : t('members.modal.addMemberTitle')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {t('members.modal.saveMember')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label={t('members.form.memberCode')} required>
            <FieldInput
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="MEM-004"
            />
          </FormField>
          <FormField label={t('members.form.name')} required>
            <FieldInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <FormField label={t('members.form.email')}>
            <FieldInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </FormField>
          <FormField label={t('members.form.discountRate')}>
            <FieldInput
              type="number"
              min={0}
              max={100}
              value={form.discountRate}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountRate: parseFloat(e.target.value) || 0 }))
              }
            />
          </FormField>
        </div>
      </Modal>

      <LoyaltyCardModal
        target={printTarget}
        onClose={() => setPrintTarget(null)}
        printQty={printQty}
        setPrintQty={setPrintQty}
        onPrint={handlePrintCard}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('members.confirmDelete.title')}
        message={t('members.confirmDelete.message', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}

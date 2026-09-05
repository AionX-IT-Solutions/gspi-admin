import { motion } from 'framer-motion'
import { Truck, Plus, Pencil, Eye, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  DataTable,
  useColumnVisibility,
  ColumnsButton,
  type Column
} from '@/shared/components/ui/DataTable'
import { TableToolbar } from '@/shared/components/ui/TableToolbar'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { usePermissions } from '@/app/hooks/usePermissions'
import { formatCurrency } from '@/shared/lib/utils'
import { actionsColumn } from '@/shared/lib/columnHelpers'
import { useToast } from '@/app/hooks/useToast'
import type { Vendor } from '../types/accounting.types'
import { CreateVendorModal } from '../components/CreateVendorModal'
import { useVendors } from '../hooks/useVendors'
import { useAccountingStore } from '../store/accounting.store'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Vendors() {
  const { t } = useTranslation()
  const toast = useToast()
  const { loading, filteredVendors, creating, setCreating, search, setSearch } = useVendors()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:vendors')
  const hydrate = useAccountingStore((s) => s.hydrate)
  const deleteVendor = useAccountingStore((s) => s.deleteVendor)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    vendorId: string
    vendorName: string
  }>({
    open: false,
    vendorId: '',
    vendorName: ''
  })

  const openVendorModal = (mode: 'create' | 'edit' | 'view', vendor: Vendor | null = null) => {
    setModalMode(mode)
    setEditingVendor(vendor)
    setCreating(true)
  }

  const handleDeleteClick = (vendorId: string, vendorName: string) => {
    setDeleteConfirm({ open: true, vendorId, vendorName })
  }

  const handleConfirmDelete = () => {
    deleteVendor(deleteConfirm.vendorId)
    toast.success(`Vendor ${deleteConfirm.vendorName} deleted`)
    setDeleteConfirm({ open: false, vendorId: '', vendorName: '' })
  }

  const columns: Column<Vendor>[] = [
    {
      key: 'name',
      header: t('vendors.columns.vendor'),
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: `${r.avatarColor}22`,
              border: `1px solid ${r.avatarColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: r.avatarColor,
              flexShrink: 0
            }}
          >
            {r.name.slice(0, 2).toUpperCase()}
          </div>
          {r.name}
        </div>
      )
    },
    { key: 'company', header: t('vendors.columns.company') },
    { key: 'email', header: t('vendors.columns.email') },
    { key: 'phone', header: t('vendors.columns.phone') },
    { key: 'category', header: t('vendors.columns.category') },
    {
      key: 'balance',
      header: t('vendors.columns.balance'),
      align: 'right',
      render: (r) => formatCurrency(r.balance)
    },
    {
      key: 'status',
      header: t('vendors.columns.status'),
      render: (r) => (
        <Badge variant={r.status === 'active' ? 'success' : 'default'}>
          {r.status === 'active' ? t('common.active') : t('common.inactive')}
        </Badge>
      )
    },
    actionsColumn<Vendor>((r) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openVendorModal('view', r)}
          title={t('common.view')}
        >
          <Eye size={13} />
        </Button>
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openVendorModal('edit', r)}
            title={t('common.edit')}
          >
            <Pencil size={13} />
          </Button>
        )}
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteClick(r.id, r.name)}
            title={t('common.delete')}
          >
            <Trash2 size={13} />
          </Button>
        )}
      </div>
    ))
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="vendors"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('vendors.title')}
        icon={<Truck size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            {canManage && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setCreating(true)}
              >
                {t('vendors.addButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('vendors.searchPlaceholder')}
        count={filteredVendors.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filteredVendors}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('vendors.emptyMessage')}
        />
      </Card>

      <CreateVendorModal
        open={creating}
        onOpenChange={(open) => {
          setCreating(open)
          if (!open) {
            setEditingVendor(null)
            setModalMode('create')
          }
        }}
        editingVendor={editingVendor}
        mode={modalMode}
      />
      <ConfirmDialog
        open={deleteConfirm.open}
        title={t('vendors.deleteTitle') || 'Delete Vendor'}
        message={
          t('vendors.deleteMessage') ||
          `Are you sure you want to delete vendor ${deleteConfirm.vendorName}? This action cannot be undone.`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, vendorId: '', vendorName: '' })}
        confirmLabel={t('common.delete')}
        danger
      />
    </motion.div>
  )
}

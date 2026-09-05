import { motion } from 'framer-motion'
import { Users, Plus, Pencil, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { usePermissions } from '@/app/hooks/usePermissions'
import { avatarColumn, currencyColumn, actionsColumn } from '@/shared/lib/columnHelpers'
import type { Customer } from '../types/accounting.types'
import { CustomerDetailModal } from '../components/CustomerDetailModal'
import { CreateCustomerModal } from '../components/CreateCustomerModal'
import { useCustomers } from '../hooks/useCustomers'
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

export function Customers() {
  const { t } = useTranslation()
  const {
    loading,
    search,
    setSearch,
    filteredCustomers,
    viewingId,
    setViewingId,
    creating,
    setCreating
  } = useCustomers()
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage:customers')
  const hydrate = useAccountingStore((s) => s.hydrate)

  const columns: Column<Customer>[] = [
    avatarColumn<Customer>({
      key: 'name',
      header: t('customers.table.name'),
      colorKey: 'avatarColor'
    }),
    { key: 'company', header: t('customers.fields.company') },
    { key: 'email', header: t('customers.fields.email') },
    { key: 'phone', header: t('customers.fields.phone') },
    currencyColumn<Customer>({ key: 'balance', header: t('customers.fields.openBalance') }),
    {
      key: 'status',
      header: t('customers.fields.status'),
      render: (r) => (
        <Badge variant={r.status === 'active' ? 'success' : 'default'}>
          {r.status === 'active' ? t('common.active') : t('common.inactive')}
        </Badge>
      )
    },
    actionsColumn<Customer>((r) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setViewingId(r.id)}
          title={t('common.view')}
        >
          <Eye size={13} />
        </Button>
        {canManage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewingId(r.id)}
            title={t('common.edit')}
          >
            <Pencil size={13} />
          </Button>
        )}
      </div>
    ))
  ]

  const { hiddenColumns, toggleColumn } = useColumnVisibility(columns)

  return (
    <motion.div
      key="customers"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('customers.title')}
        icon={<Users size={18} />}
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
                {t('customers.newCustomerButton')}
              </Button>
            )}
          </>
        }
      />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('customers.searchPlaceholder')}
        count={filteredCustomers.length}
        columnsSlot={
          <ColumnsButton columns={columns} hiddenColumns={hiddenColumns} onToggle={toggleColumn} />
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filteredCustomers}
          hiddenColumns={hiddenColumns}
          loading={loading}
          emptyMessage={t('customers.table.empty')}
        />
      </Card>

      <CustomerDetailModal customerId={viewingId} onClose={() => setViewingId(null)} />
      <CreateCustomerModal open={creating} onOpenChange={setCreating} />
    </motion.div>
  )
}

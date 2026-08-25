import { motion } from 'framer-motion'
import { Truck, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency } from '@/shared/lib/utils'
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
  const { loading, vendorList, creating, setCreating } = useVendors()
  const hydrate = useAccountingStore((s) => s.hydrate)

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
    }
  ]

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
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setCreating(true)}
            >
              {t('vendors.addButton')}
            </Button>
          </>
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={vendorList}
          loading={loading}
          emptyMessage={t('vendors.emptyMessage')}
        />
      </Card>

      <CreateVendorModal open={creating} onOpenChange={setCreating} />
    </motion.div>
  )
}

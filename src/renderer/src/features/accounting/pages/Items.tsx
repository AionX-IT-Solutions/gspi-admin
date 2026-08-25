import { motion } from 'framer-motion'
import { Package, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency } from '@/shared/lib/utils'
import type { Item, ItemType } from '../types/accounting.types'
import { CreateItemModal } from '../components/CreateItemModal'
import { useItems } from '../hooks/useItems'
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

const typeBadgeVariant: Record<ItemType, 'primary' | 'cyan' | 'success'> = {
  service: 'primary',
  product: 'cyan',
  inventory: 'success'
}

export function Items() {
  const { t } = useTranslation()
  const { loading, itemList, creating, setCreating } = useItems()
  const hydrate = useAccountingStore((s) => s.hydrate)

  const typeBadgeLabel: Record<ItemType, string> = {
    service: t('items.typeBadge.service'),
    product: t('items.typeBadge.product'),
    inventory: t('items.typeBadge.inventory')
  }

  const columns: Column<Item>[] = [
    { key: 'name', header: t('items.columns.name') },
    { key: 'sku', header: t('items.columns.sku'), width: 'w-24' },
    {
      key: 'type',
      header: t('items.columns.type'),
      render: (r) => <Badge variant={typeBadgeVariant[r.type]}>{typeBadgeLabel[r.type]}</Badge>
    },
    {
      key: 'salesPrice',
      header: t('items.columns.salesPrice'),
      align: 'right',
      render: (r) => formatCurrency(r.salesPrice)
    },
    {
      key: 'cost',
      header: t('items.columns.cost'),
      align: 'right',
      render: (r) => formatCurrency(r.cost)
    },
    {
      key: 'qtyOnHand',
      header: t('items.columns.qtyOnHand'),
      align: 'right',
      render: (r) => (r.qtyOnHand === undefined ? '—' : r.qtyOnHand.toLocaleString())
    },
    { key: 'incomeAccount', header: t('items.columns.incomeAccount') }
  ]

  return (
    <motion.div
      key="items"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('items.title')}
        icon={<Package size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setCreating(true)}
            >
              {t('items.addButton')}
            </Button>
          </>
        }
      />

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={itemList}
          loading={loading}
          emptyMessage={t('items.emptyMessage')}
        />
      </Card>

      <CreateItemModal open={creating} onOpenChange={setCreating} />
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { Receipt, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Expense } from '../types/accounting.types'
import { CreateExpenseModal } from '../components/CreateExpenseModal'
import { useExpenses } from '../hooks/useExpenses'
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

export function Expenses() {
  const { t } = useTranslation()
  const { loading, expenseList, summary, creating, setCreating } = useExpenses()
  const hydrate = useAccountingStore((s) => s.hydrate)

  const columns: Column<Expense>[] = [
    { key: 'date', header: t('expenses.table.date'), render: (r) => formatDate(r.date) },
    { key: 'vendorName', header: t('expenses.table.vendor') },
    { key: 'category', header: t('expenses.table.category') },
    { key: 'paymentMethod', header: t('expenses.table.paymentMethod') },
    {
      key: 'amount',
      header: t('expenses.table.amount'),
      align: 'right',
      render: (r) => formatCurrency(r.amount)
    },
    {
      key: 'status',
      header: t('expenses.table.status'),
      render: (r) => (
        <Badge variant={r.status === 'paid' ? 'success' : 'warning'}>
          {r.status === 'paid' ? t('common.paid') : t('common.unpaid')}
        </Badge>
      )
    }
  ]

  return (
    <motion.div
      key="expenses"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('expenses.title')}
        icon={<Receipt size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setCreating(true)}
            >
              {t('expenses.newExpenseButton')}
            </Button>
          </>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20
        }}
      >
        <Card>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 8
            }}
          >
            {t('expenses.summary.total')}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(summary.total)}
          </p>
        </Card>
        <Card>
          <Badge variant="warning" dot>
            {t('common.unpaid')}
          </Badge>
          <p style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {formatCurrency(summary.unpaid)}
          </p>
        </Card>
        <Card>
          <Badge variant="success" dot>
            {t('common.paid')}
          </Badge>
          <p style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {formatCurrency(summary.paid)}
          </p>
        </Card>
      </div>

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={expenseList}
          loading={loading}
          emptyMessage={t('expenses.table.empty')}
        />
      </Card>

      <CreateExpenseModal open={creating} onOpenChange={setCreating} />
    </motion.div>
  )
}

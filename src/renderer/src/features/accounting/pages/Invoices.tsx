import { motion } from 'framer-motion'
import { FileText, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable, type Column } from '@/shared/components/ui/DataTable'
import { RefreshButton } from '@/shared/components/ui/RefreshButton'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Invoice } from '../types/accounting.types'
import { statusBadgeVariant, invoiceStatusLabel } from '../components/invoiceStatus'
import { InvoiceSummaryCards } from '../components/InvoiceSummaryCards'
import { ViewInvoiceModal } from '../components/ViewInvoiceModal'
import { CreateInvoiceModal } from '../components/CreateInvoiceModal'
import { useInvoices } from '../hooks/useInvoices'
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

export function Invoices() {
  const { t } = useTranslation()
  const {
    loading,
    filter,
    setFilter,
    filterTabs,
    summary,
    filtered,
    viewingId,
    setViewingId,
    creating,
    setCreating
  } = useInvoices()
  const hydrate = useAccountingStore((s) => s.hydrate)

  const columns: Column<Invoice>[] = [
    { key: 'number', header: t('invoices.table.number'), width: 'w-28' },
    { key: 'customerName', header: t('invoices.table.customer') },
    {
      key: 'issueDate',
      header: t('invoices.table.issueDate'),
      render: (r) => formatDate(r.issueDate)
    },
    { key: 'dueDate', header: t('invoices.table.dueDate'), render: (r) => formatDate(r.dueDate) },
    {
      key: 'status',
      header: t('invoices.table.status'),
      render: (r) => (
        <Badge variant={statusBadgeVariant[r.status]}>{invoiceStatusLabel(t, r.status)}</Badge>
      )
    },
    {
      key: 'total',
      header: t('invoices.table.total'),
      align: 'right',
      render: (r) => formatCurrency(r.total)
    },
    {
      key: 'balanceDue',
      header: t('invoices.table.balanceDue'),
      align: 'right',
      render: (r) => formatCurrency(r.balanceDue)
    }
  ]

  return (
    <motion.div
      key="invoices"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      <PageHeader
        title={t('invoices.title')}
        icon={<FileText size={18} />}
        actions={
          <>
            <RefreshButton onRefresh={() => hydrate(true)} />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setCreating(true)}
            >
              {t('invoices.newInvoiceButton')}
            </Button>
          </>
        }
      />

      <InvoiceSummaryCards
        overdue={summary.overdue}
        notDueYet={summary.notDueYet}
        paid={summary.paid}
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border:
                filter === tab.key
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-default)',
              background: filter === tab.key ? 'var(--accent-primary-subtle)' : 'transparent',
              color: filter === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card padding="0px">
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => setViewingId(row.id)}
          loading={loading}
          emptyMessage={t('invoices.table.empty')}
        />
      </Card>

      <ViewInvoiceModal invoiceId={viewingId} onClose={() => setViewingId(null)} />
      <CreateInvoiceModal open={creating} onOpenChange={setCreating} />
    </motion.div>
  )
}

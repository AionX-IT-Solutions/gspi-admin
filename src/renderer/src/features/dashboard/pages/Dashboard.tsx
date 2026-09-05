import { motion } from 'framer-motion'
import { Banknote, Receipt, FileText, Landmark, RefreshCw, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency } from '@/shared/lib/utils'
import { AnnouncementsHighlight } from '../components/AnnouncementsHighlight'
import { BudgetHighlight } from '../components/BudgetHighlight'
import { StatCard, type StatCardProps } from '../components/StatCard'
import { CashFlowChart } from '../components/CashFlowChart'
import { ExpenseCategoryChart } from '../components/ExpenseCategoryChart'
import { InvoicesSummaryCard } from '../components/InvoicesSummaryCard'
import { QuickOverviewRow } from '../components/QuickOverviewRow'
import { RecentActivityCard } from '../components/RecentActivityCard'
import { useDashboard } from '../hooks/useDashboard'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

export function Dashboard() {
  const { t } = useTranslation()
  const {
    toast,
    loading,
    invoices,
    totals,
    outstandingInvoiceCount,
    bankAccountBalances,
    totalBalance
  } = useDashboard()

  const stats: StatCardProps[] = [
    {
      title: t('dashboard.statCashBalance'),
      value: formatCurrency(totalBalance),
      note: t('dashboard.cashBalanceNote', { count: bankAccountBalances.length }),
      icon: <Landmark size={20} />,
      color: '#0ea5e9'
    },
    {
      title: t('dashboard.statIncome'),
      value: formatCurrency(totals.income),
      icon: <Banknote size={20} />,
      color: '#10b981'
    },
    {
      title: t('dashboard.statExpenses'),
      value: formatCurrency(totals.expenseTotal),
      icon: <Receipt size={20} />,
      color: '#ef4444'
    },
    {
      title: t('dashboard.statNetProfit'),
      value: formatCurrency(totals.netProfit),
      icon: <Wallet size={20} />,
      color: '#6366f1'
    },
    {
      title: t('dashboard.statOutstandingInvoices'),
      value: formatCurrency(totals.outstanding),
      note: t('dashboard.outstandingNote', { count: outstandingInvoiceCount }),
      icon: <FileText size={20} />,
      color: '#f59e0b'
    }
  ]

  return (
    <motion.div
      key="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}
          >
            {t('dashboard.title')}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={13} />}
            onClick={() => toast.success(t('dashboard.refreshToast'))}
          >
            {t('dashboard.refreshButton')}
          </Button>
        </div>
      </div>

      {/* Announcements — pinned/latest, kept prominent right under the header */}
      <AnnouncementsHighlight />

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
            ))
          : stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
      </div>

      {/* Council Budget — income/expense vs. actual-to-date at a glance */}
      <BudgetHighlight />

      {/* Bank Balances breakdown */}
      {!loading && bankAccountBalances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          style={{ marginBottom: '20px' }}
        >
          <Card
            header={
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('dashboard.bankBalancesTitle')}
              </h2>
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14
              }}
            >
              {bankAccountBalances.map((b) => (
                <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.account}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(b.closing)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        {/* Cash flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <Card
            header={
              <div>
                <h2
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 2
                  }}
                >
                  {t('dashboard.cashFlowTitle')}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {t('dashboard.cashFlowSubtitle')}
                </p>
              </div>
            }
          >
            {loading ? (
              <div className="skeleton" style={{ height: 240, borderRadius: 10 }} />
            ) : (
              <CashFlowChart invoices={invoices} />
            )}
          </Card>

          {loading ? (
            <div style={{ marginTop: 16 }}>
              <div className="skeleton" style={{ height: 110, borderRadius: 14 }} />
            </div>
          ) : (
            <InvoicesSummaryCard
              overdue={totals.overdue}
              notDueYet={totals.notDueYet}
              draft={totals.draft}
            />
          )}
        </motion.div>

        {/* Expenses by category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.42 }}
          style={{ height: '100%' }}
        >
          <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            header={
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('dashboard.expensesByCategoryTitle')}
              </h2>
            }
          >
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />
              ) : (
                <ExpenseCategoryChart data={totals.topCategories} />
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <QuickOverviewRow loading={loading} />
      <RecentActivityCard loading={loading} />
    </motion.div>
  )
}

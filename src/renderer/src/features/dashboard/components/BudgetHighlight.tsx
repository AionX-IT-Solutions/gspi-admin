import { motion } from 'framer-motion'
import { Wallet, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { formatCurrency } from '@/shared/lib/utils'
import type { BudgetSectionTotals } from '@/features/budget/lib/budgetCalculations'
import { useBudgetHighlight } from '../hooks/useBudgetHighlight'

function ProgressBar({ ratio, color }: { ratio: number; color: string }) {
  const pct = Math.min(100, Math.max(0, ratio * 100))
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: 'var(--border-subtle)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 999,
          background: color,
          transition: 'width 0.4s ease'
        }}
      />
    </div>
  )
}

function BudgetMetricRow({
  label,
  totals,
  color
}: {
  label: string
  totals: BudgetSectionTotals
  color: string
}) {
  const ratio = totals.totalBudgeted > 0 ? totals.totalActual / totals.totalBudgeted : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatCurrency(totals.totalActual)}
          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
            {' '}
            / {formatCurrency(totals.totalBudgeted)}
          </span>
        </span>
      </div>
      <ProgressBar ratio={ratio} color={color} />
    </div>
  )
}

export function BudgetHighlight() {
  const { t } = useTranslation()
  const { navigate, fiscalYear, income, expense, hasData } = useBudgetHighlight()

  if (!hasData) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      style={{ marginBottom: 20 }}
    >
      <Card glow="primary" padding="0px">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)'
            }}
          >
            <Wallet size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 12
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {fiscalYear ? t('dashboard.budgetTitle', { year: fiscalYear }) : t('budget.title')}
              </h2>
              <button
                onClick={() => navigate('/budget')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: 'var(--accent-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {t('dashboard.viewAll')} <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BudgetMetricRow label={t('budget.summary.income')} totals={income} color="#34d399" />
              <BudgetMetricRow
                label={t('budget.summary.expenses')}
                totals={expense}
                color="#f87171"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

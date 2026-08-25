import { motion } from 'framer-motion'
import { ArrowRight, FileText, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Invoice, Expense } from '@/features/accounting/types/accounting.types'
import { useRecentActivityCard } from '../hooks/useRecentActivityCard'

interface RecentActivityCardProps {
  loading?: boolean
}

export function RecentActivityCard({ loading }: RecentActivityCardProps) {
  const { t } = useTranslation()
  const { navigate, recentActivity } = useRecentActivityCard()

  if (loading) {
    return (
      <Card
        header={
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('dashboard.recentActivityTitle')}
          </h2>
        }
        padding="16px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 48, borderRadius: 8, opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.65 }}
    >
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t('dashboard.recentActivityTitle')}
            </h2>
            <button
              onClick={() => navigate('/invoices')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--accent-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t('dashboard.viewAll')} <ArrowRight size={12} />
            </button>
          </div>
        }
        padding="16px"
      >
        <div>
          {recentActivity.map((row, i) => {
            const isInvoice = row.kind === 'invoice'
            const title = isInvoice
              ? `${(row.data as Invoice).number} · ${(row.data as Invoice).customerName}`
              : `${(row.data as Expense).category} · ${(row.data as Expense).vendorName}`
            const amount = isInvoice ? (row.data as Invoice).total : (row.data as Expense).amount
            return (
              <motion.div
                key={`${row.kind}-${row.data.id}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom:
                    i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9px',
                    background: isInvoice ? 'rgba(99,102,241,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${isInvoice ? 'rgba(99,102,241,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isInvoice ? '#818cf8' : '#f87171',
                    flexShrink: 0
                  }}
                >
                  {isInvoice ? <FileText size={14} /> : <Receipt size={14} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {title}
                  </p>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {formatDate(row.date)}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isInvoice ? 'var(--text-primary)' : '#f87171'
                  }}
                >
                  {isInvoice ? '' : '-'}
                  {formatCurrency(amount)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}

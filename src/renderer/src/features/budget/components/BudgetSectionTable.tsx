import type { CSSProperties } from 'react'
import { Pencil, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { formatCurrency } from '@/shared/lib/utils'
import { actualToDate, type BudgetGroupSummary } from '../lib/budgetCalculations'
import type { BudgetCategory, BudgetSection } from '../types/budget.types'

const GRID = '1fr 130px 130px 110px 30px'

const headCellStyle: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--text-muted)'
}
const groupHeadingStyle: CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginTop: 14,
  marginBottom: 4
}
const subGroupHeadingStyle: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginTop: 6,
  marginBottom: 2,
  paddingLeft: 8
}
const amountStyle: CSSProperties = {
  fontSize: 12.5,
  color: 'var(--text-primary)',
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums'
}

function varianceColor(variance: number, section: BudgetSection): string {
  const favorable = section === 'income' ? variance >= 0 : variance <= 0
  if (variance === 0) return 'var(--text-muted)'
  return favorable ? '#34d399' : '#f87171'
}

interface BudgetSectionTableProps {
  section: BudgetSection
  groups: BudgetGroupSummary[]
  canManage: boolean
  onEdit: (category: BudgetCategory) => void
  /** Category ids with a live figure computed from real POS/Rentals/Vouchers/Payroll
   *  data — shown as a small indicator so it's clear which lines are wired up. */
  autoActualCategoryIds?: Set<string>
}

export function BudgetSectionTable({
  section,
  groups,
  canManage,
  onEdit,
  autoActualCategoryIds
}: BudgetSectionTableProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 8,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <span style={headCellStyle} />
        <span style={{ ...headCellStyle, textAlign: 'right' }}>{t('budget.table.budgeted')}</span>
        <span style={{ ...headCellStyle, textAlign: 'right' }}>{t('budget.table.actual')}</span>
        <span style={{ ...headCellStyle, textAlign: 'right' }}>{t('budget.table.variance')}</span>
        <span />
      </div>

      {groups.map((group) => (
        <div key={group.group}>
          <p style={groupHeadingStyle}>{group.group}</p>
          {group.subGroups.map((sg) => (
            <div key={sg.subGroup || group.group}>
              {sg.subGroup && <p style={subGroupHeadingStyle}>{sg.subGroup}</p>}
              {sg.items.map((item) => {
                const actual = actualToDate(item)
                const variance = actual - item.budgetedAmount
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: GRID,
                      gap: 8,
                      alignItems: 'center',
                      padding: '6px 0',
                      paddingLeft: 8,
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      {item.name}
                      {autoActualCategoryIds?.has(item.id) && (
                        <Tooltip content={t('budget.autoSourceHint')}>
                          <Zap size={10} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                        </Tooltip>
                      )}
                    </span>
                    <span style={amountStyle}>{formatCurrency(item.budgetedAmount)}</span>
                    <span style={amountStyle}>{formatCurrency(actual)}</span>
                    <span style={{ ...amountStyle, color: varianceColor(variance, section) }}>
                      {formatCurrency(variance)}
                    </span>
                    {canManage ? (
                      <button
                        onClick={() => onEdit(item)}
                        title={t('common.edit')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 4,
                          borderRadius: 6
                        }}
                      >
                        <Pencil size={12} />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                )
              })}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  gap: 8,
                  padding: '6px 0',
                  paddingLeft: 8
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('budget.table.subtotal')}
                </span>
                <span style={{ ...amountStyle, fontWeight: 700 }}>
                  {formatCurrency(sg.totalBudgeted)}
                </span>
                <span style={{ ...amountStyle, fontWeight: 700 }}>
                  {formatCurrency(sg.totalActual)}
                </span>
                <span
                  style={{
                    ...amountStyle,
                    fontWeight: 700,
                    color: varianceColor(sg.totalActual - sg.totalBudgeted, section)
                  }}
                >
                  {formatCurrency(sg.totalActual - sg.totalBudgeted)}
                </span>
                <span />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/utils'

const CATEGORY_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function CategoryPieTooltip({
  active,
  payload
}: {
  active?: boolean
  payload?: { name: string; value: number; payload: { fill: string } }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      style={{
        background: 'var(--tooltip-bg)',
        border: '1px solid var(--tooltip-border)',
        borderRadius: 10,
        padding: '8px 12px',
        boxShadow: 'var(--tooltip-shadow)',
        fontSize: 12
      }}
    >
      <p style={{ color: item.payload.fill, fontWeight: 600, margin: 0 }}>{item.name}</p>
      <p style={{ color: 'var(--text-primary)', margin: 0 }}>{formatCurrency(item.value)}</p>
    </div>
  )
}

export function ExpenseCategoryChart({ data }: { data: [string, number][] }) {
  const { t } = useTranslation()
  const chartData = data.map(([category, amount]) => ({ category, amount }))

  if (chartData.length === 0) {
    return (
      <p
        style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}
      >
        {t('dashboard.noExpensesRecorded')}
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={3}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <RechartsTooltip content={<CategoryPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {chartData.map((d, i) => (
          <div
            key={d.category}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                color: 'var(--text-secondary)',
                minWidth: 0
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                  flexShrink: 0
                }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.category}
              </span>
            </span>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                flexShrink: 0,
                marginLeft: 8
              }}
            >
              {formatCurrency(d.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

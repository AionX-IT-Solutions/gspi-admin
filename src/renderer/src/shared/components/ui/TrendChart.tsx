import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps
} from 'recharts'

export interface TrendChartSeries {
  key: string
  name: string
  color: string
}

interface TrendChartProps {
  data: Record<string, unknown>[]
  xKey: string
  series: TrendChartSeries[]
  height?: number
  valueFormatter?: (value: number) => string
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter
}: Partial<TooltipContentProps<number, string>> & { valueFormatter?: (value: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--tooltip-bg)',
        border: '1px solid var(--tooltip-border)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'var(--tooltip-shadow)',
        fontSize: 12
      }}
    >
      {label && <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, margin: 0 }}>
          {p.name}:{' '}
          {valueFormatter && typeof p.value === 'number' ? valueFormatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export function TrendChart({ data, xKey, series, height = 220, valueFormatter }: TrendChartProps) {
  const axisStyle = { fill: 'var(--text-muted)', fontSize: 11 } as const

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`trend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            content={<ChartTooltip valueFormatter={valueFormatter} />}
            cursor={{ fill: 'transparent' }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#trend-${s.key})`}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: s.color, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

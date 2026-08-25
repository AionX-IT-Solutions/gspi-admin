import { formatCurrency } from '@/shared/lib/utils'

interface ReportRowProps {
  label: string
  value: number
  bold?: boolean
  indent?: boolean
}

export function ReportRow({ label, value, bold, indent }: ReportRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid var(--border-subtle)',
        paddingLeft: indent ? 16 : 0
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: bold ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: bold ? 700 : 400
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: bold ? 700 : 500 }}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

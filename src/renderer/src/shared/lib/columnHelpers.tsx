import type { ReactNode } from 'react'
import type { Column } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Badge'
import { formatCurrency } from './utils'

interface AvatarColumnOptions<T> {
  key: keyof T & string
  header: string
  colorKey: keyof T & string
}

export function avatarColumn<T>({ key, header, colorKey }: AvatarColumnOptions<T>): Column<T> {
  return {
    key,
    header,
    render: (row) => {
      const record = row as Record<string, unknown>
      const name = String(record[key] ?? '')
      const color = String(record[colorKey] ?? '#6366f1')
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: `${color}22`,
              border: `1px solid ${color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color,
              flexShrink: 0
            }}
          >
            {name.slice(0, 2).toUpperCase()}
          </div>
          {name}
        </div>
      )
    }
  }
}

interface StatusColumnOptions<T> {
  key: keyof T & string
  header: string
  activeValue?: unknown
  trueLabel?: string
  falseLabel?: string
}

export function statusColumn<T>({
  key,
  header,
  activeValue = true,
  trueLabel = 'Active',
  falseLabel = 'Inactive'
}: StatusColumnOptions<T>): Column<T> {
  return {
    key,
    header,
    render: (row) => {
      const value = (row as Record<string, unknown>)[key]
      const active = value === activeValue
      return (
        <Badge variant={active ? 'success' : 'default'}>{active ? trueLabel : falseLabel}</Badge>
      )
    }
  }
}

interface CurrencyColumnOptions<T> {
  key: keyof T & string
  header: string
}

export function currencyColumn<T>({ key, header }: CurrencyColumnOptions<T>): Column<T> {
  return {
    key,
    header,
    align: 'right',
    render: (row) => formatCurrency(Number((row as Record<string, unknown>)[key] ?? 0))
  }
}

export function actionsColumn<T>(render: (row: T) => ReactNode, header = 'Actions'): Column<T> {
  return {
    key: 'id',
    header,
    sortable: false,
    align: 'right',
    render
  }
}

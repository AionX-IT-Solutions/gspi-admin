import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface TableToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  count?: number
  children?: ReactNode
  columnsSlot?: ReactNode
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  count,
  children,
  columnsSlot
}: TableToolbarProps) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        padding: '10px 14px',
        marginBottom: 12,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--glass-border)',
        borderRadius: 12
      }}
    >
      {onSearchChange && (
        <div style={{ position: 'relative', minWidth: 200 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? t('common.search')}
            style={{
              width: '100%',
              height: 32,
              paddingLeft: 30,
              paddingRight: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>
      )}

      {children}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        {typeof count === 'number' && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 999,
              padding: '3px 10px'
            }}
          >
            {count} {count === 1 ? t('common.row') : t('common.rows')}
          </span>
        )}
        {columnsSlot}
      </div>
    </div>
  )
}

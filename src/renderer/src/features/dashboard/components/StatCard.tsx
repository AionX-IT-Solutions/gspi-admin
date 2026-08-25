import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

export interface StatCardProps {
  title: string
  value: string
  change?: string
  positive?: boolean
  note?: string
  icon: ReactNode
  color: string
}

export function StatCard({ title, value, change, positive, note, icon, color }: StatCardProps) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ duration: 0.2 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        borderTop: `2px solid ${color}`,
        cursor: 'default'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: color,
          opacity: 0.06,
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap'
            }}
          >
            {value}
          </p>
        </div>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: `${color}18`,
            border: `1px solid ${color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0
          }}
        >
          {icon}
        </div>
      </div>

      {change ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '12px',
              fontWeight: 600,
              color: positive ? '#10b981' : '#ef4444',
              padding: '2px 6px',
              borderRadius: '6px',
              background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
            }}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {t('dashboard.vsLastPeriod')}
          </span>
        </div>
      ) : note ? (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{note}</p>
      ) : null}
    </motion.div>
  )
}

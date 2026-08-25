import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

export interface QuickStatProps {
  icon: ReactNode
  label: string
  value: string
  detail: string
  color: string
  onClick: () => void
}

export function QuickStatCard({ icon, label, value, detail, color, onClick }: QuickStatProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        width: '100%'
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
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
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {value}
        </p>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {detail}
        </p>
      </div>
      <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
    </motion.button>
  )
}

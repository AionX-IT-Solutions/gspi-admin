import { motion } from 'framer-motion'
import { Megaphone, Pin, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/lib/utils'
import type { AnnouncementPriority } from '@/features/announcements/types/announcements.types'
import { useAnnouncementsHighlight } from '../hooks/useAnnouncementsHighlight'

const PRIORITY_VARIANT: Record<AnnouncementPriority, 'outline' | 'warning' | 'danger'> = {
  normal: 'outline',
  important: 'warning',
  urgent: 'danger'
}

export function AnnouncementsHighlight() {
  const { t } = useTranslation()
  const { navigate, rows, totalCount } = useAnnouncementsHighlight()

  if (rows.length === 0) return null

  const [top, ...others] = rows

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      style={{ marginBottom: 20 }}
    >
      <Card glow={top.priority === 'urgent' ? 'rose' : 'amber'} padding="0px">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 16px rgba(245,158,11,0.4)'
            }}
          >
            <Megaphone size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('dashboard.announcementsTitle')}
                </h2>
                <Badge variant="primary">{totalCount}</Badge>
              </div>
              <button
                onClick={() => navigate('/announcements')}
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

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 4,
                flexWrap: 'wrap'
              }}
            >
              {top.pinned && (
                <Pin size={12} color="#f59e0b" fill="#f59e0b" style={{ marginTop: 2 }} />
              )}
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {top.title}
              </p>
              <Badge variant={PRIORITY_VARIANT[top.priority]}>
                {t(`announcements.priority.${top.priority}`)}
              </Badge>
            </div>
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {top.message}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              {t('announcements.postedBy', {
                name: top.postedByName,
                date: formatDate(top.createdAt)
              })}
            </p>
          </div>
        </div>

        {others.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {others.map((a, i) => (
              <button
                key={a.id}
                onClick={() => navigate('/announcements')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < others.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {a.pinned && (
                  <Pin size={11} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {a.title}
                </span>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {formatDate(a.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}

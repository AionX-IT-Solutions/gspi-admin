import { motion } from 'framer-motion'
import { Cake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/lib/utils'
import { useUpcomingBirthdays, type BirthdayCategory } from '../hooks/useUpcomingBirthdays'

const CATEGORY_VARIANT: Record<BirthdayCategory, 'primary' | 'cyan' | 'warning' | 'outline'> = {
  troopMember: 'primary',
  trainingProfile: 'cyan',
  employee: 'warning',
  userAccount: 'outline'
}

export function BirthdaysHighlight() {
  const { t } = useTranslation()
  const birthdays = useUpcomingBirthdays()

  if (birthdays.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      style={{ minWidth: 0, height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }} padding="0px">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 16px 12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <Cake size={16} color="#ec4899" />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('dashboard.birthdaysTitle')}
          </h2>
          <Badge variant="primary">{birthdays.length}</Badge>
        </div>
        {birthdays.map((b, i) => (
          <div
            key={`${b.category}-${b.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderBottom: i < birthdays.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              background: b.isToday ? 'rgba(236,72,153,0.06)' : 'transparent'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {b.name}
                </span>
                <Badge variant={CATEGORY_VARIANT[b.category]}>
                  {t(`dashboard.birthdayCategory.${b.category}`)}
                </Badge>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {formatDate(b.birthDate)}
                {b.turningAge !== null
                  ? ` · ${t('dashboard.birthdaysTurning', { age: b.turningAge })}`
                  : ''}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: b.isToday ? '#ec4899' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {b.isToday
                ? t('dashboard.birthdaysToday')
                : b.daysUntil === 1
                  ? t('dashboard.birthdaysTomorrow')
                  : t('dashboard.birthdaysInDays', { count: b.daysUntil })}
            </span>
          </div>
        ))}
      </Card>
    </motion.div>
  )
}

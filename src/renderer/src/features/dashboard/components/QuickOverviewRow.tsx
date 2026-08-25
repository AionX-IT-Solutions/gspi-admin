import { motion } from 'framer-motion'
import { AlertTriangle, CalendarClock, Fingerprint } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { QuickStatCard } from './QuickStatCard'
import { useQuickOverviewRow } from '../hooks/useQuickOverviewRow'

interface QuickOverviewRowProps {
  loading?: boolean
}

export function QuickOverviewRow({ loading }: QuickOverviewRowProps) {
  const { t } = useTranslation()
  const { navigate, lowStockProducts, todaysAttendance, pendingLeaveCount } = useQuickOverviewRow()

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14 }} />
        ))}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.48 }}
      >
        <QuickStatCard
          icon={<AlertTriangle size={18} />}
          label={t('dashboard.lowStockLabel')}
          value={String(lowStockProducts.length)}
          detail={
            lowStockProducts[0]
              ? t('dashboard.lowStockExample', { name: lowStockProducts[0].name })
              : t('dashboard.lowStockAllStocked')
          }
          color="#f59e0b"
          onClick={() => navigate('/products')}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.53 }}
      >
        <QuickStatCard
          icon={<Fingerprint size={18} />}
          label={t('dashboard.attendanceLabel')}
          value={`${todaysAttendance.present}/${todaysAttendance.total}`}
          detail={t('dashboard.attendanceDetail', {
            onLeave: todaysAttendance.onLeave,
            absent: todaysAttendance.absent
          })}
          color="#10b981"
          onClick={() => navigate('/attendance')}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.58 }}
      >
        <QuickStatCard
          icon={<CalendarClock size={18} />}
          label={t('dashboard.pendingLeaveLabel')}
          value={String(pendingLeaveCount)}
          detail={
            pendingLeaveCount > 0
              ? t('dashboard.pendingLeaveNeedsReview')
              : t('dashboard.pendingLeaveAllCaughtUp')
          }
          color="#6366f1"
          onClick={() => navigate('/leave')}
        />
      </motion.div>
    </div>
  )
}

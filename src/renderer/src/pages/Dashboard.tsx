import { motion } from 'framer-motion'
import {
  Users,
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Download,
  Bell,
  ArrowRight
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ── Page transition ───────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

/* ── Animated Counter ──────────────────────────────────────── */
function AnimatedCounter({
  target,
  prefix = '',
  suffix = ''
}: {
  target: number
  prefix?: string
  suffix?: string
}) {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const duration = 1200

  useEffect(() => {
    let raf: number
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target])

  const display =
    value >= 1000
      ? value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M`
        : value >= 100_000
          ? `${(value / 1000).toFixed(0)}K`
          : value.toLocaleString()
      : value.toString()

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/* ── Stat Card ─────────────────────────────────────────────── */
interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change: number
  positive: boolean
  icon: ReactNode
  color: string
  glowColor: string
}

function StatCard({
  title,
  value,
  prefix,
  suffix,
  change,
  positive,
  icon,
  color,
  glowColor
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ duration: 0.2 }}
      style={{
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
      {/* Background glow */}
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

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}
      >
        <div>
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
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}
          >
            <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
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
            boxShadow: `0 0 16px ${glowColor}`,
            flexShrink: 0
          }}
        >
          {icon}
        </div>
      </div>

      {/* Change */}
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
          {positive ? '+' : ''}
          {change}%
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>vs last month</span>
      </div>
    </motion.div>
  )
}

/* ── Activity Feed ─────────────────────────────────────────── */
interface ActivityItem {
  id: string
  user: string
  initials: string
  action: string
  target: string
  time: string
  type: 'create' | 'update' | 'delete' | 'deploy' | 'auth' | 'alert'
  avatarColor: string
}

const activities: ActivityItem[] = [
  {
    id: '1',
    user: 'Alex Chen',
    initials: 'AC',
    action: 'deployed',
    target: 'production build v2.4.1',
    time: '2m ago',
    type: 'deploy',
    avatarColor: '#6366f1'
  },
  {
    id: '2',
    user: 'Sarah Kim',
    initials: 'SK',
    action: 'updated',
    target: 'user authentication module',
    time: '8m ago',
    type: 'auth',
    avatarColor: '#06b6d4'
  },
  {
    id: '3',
    user: 'Mike Torres',
    initials: 'MT',
    action: 'created',
    target: 'new API endpoint /v2/users',
    time: '15m ago',
    type: 'create',
    avatarColor: '#10b981'
  },
  {
    id: '4',
    user: 'Emma Davis',
    initials: 'ED',
    action: 'resolved',
    target: 'critical bug in payment flow',
    time: '32m ago',
    type: 'update',
    avatarColor: '#f59e0b'
  },
  {
    id: '5',
    user: 'James Park',
    initials: 'JP',
    action: 'triggered',
    target: 'performance alert threshold',
    time: '1h ago',
    type: 'alert',
    avatarColor: '#ef4444'
  },
  {
    id: '6',
    user: 'Lily Wang',
    initials: 'LW',
    action: 'archived',
    target: 'legacy v1 endpoints',
    time: '2h ago',
    type: 'delete',
    avatarColor: '#8b5cf6'
  }
]

const typeColors = {
  create: '#10b981',
  update: '#6366f1',
  delete: '#ef4444',
  deploy: '#06b6d4',
  auth: '#f59e0b',
  alert: '#ef4444'
}

const typeBadge: Record<string, 'success' | 'primary' | 'danger' | 'cyan' | 'warning'> = {
  create: 'success',
  update: 'primary',
  delete: 'danger',
  deploy: 'cyan',
  auth: 'warning',
  alert: 'danger'
}

/* ── Mock Chart ────────────────────────────────────────────── */
function MockChart() {
  const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88]
  return (
    <div
      style={{
        height: '120px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '6px',
        padding: '0 4px',
        position: 'relative'
      }}
    >
      {/* Horizontal grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => (
        <div
          key={pct}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${pct}%`,
            height: '1px',
            background: 'rgba(255,255,255,0.04)'
          }}
        />
      ))}
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${h}%`, opacity: 1 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
          style={{
            flex: 1,
            background: `linear-gradient(to top, var(--accent-primary), var(--accent-cyan))`,
            borderRadius: '4px 4px 2px 2px',
            boxShadow: '0 0 8px var(--accent-primary-glow)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'opacity 0.15s ease'
          }}
          whileHover={{
            opacity: 0.85,
            scaleX: 1.08,
            boxShadow: '0 0 16px var(--accent-primary-glow)'
          }}
        />
      ))}
    </div>
  )
}

/* ── Quick Actions ─────────────────────────────────────────── */
const quickActions = [
  { label: 'New Project', icon: <Plus size={15} />, variant: 'primary' as const },
  { label: 'Export Data', icon: <Download size={15} />, variant: 'secondary' as const },
  { label: 'Sync Now', icon: <RefreshCw size={15} />, variant: 'secondary' as const },
  { label: 'Alerts', icon: <Bell size={15} />, variant: 'ghost' as const }
]

/* ── Dashboard View ────────────────────────────────────────── */
export function Dashboard() {
  const stats: StatCardProps[] = [
    {
      title: 'Total Users',
      value: 24521,
      change: 12.4,
      positive: true,
      icon: <Users size={20} />,
      color: '#6366f1',
      glowColor: 'rgba(99,102,241,0.3)'
    },
    {
      title: 'Revenue',
      value: 98300,
      prefix: '$',
      change: 8.1,
      positive: true,
      icon: <DollarSign size={20} />,
      color: '#06b6d4',
      glowColor: 'rgba(6,182,212,0.3)'
    },
    {
      title: 'Active Sessions',
      value: 1847,
      change: 3.2,
      positive: false,
      icon: <Activity size={20} />,
      color: '#10b981',
      glowColor: 'rgba(16,185,129,0.3)'
    },
    {
      title: 'Uptime',
      value: 9998,
      suffix: '%',
      change: 0.1,
      positive: true,
      icon: <Zap size={20} />,
      color: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.3)'
    }
  ]

  return (
    <motion.div
      key="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-wrapper"
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px'
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant="success" dot>
            Live
          </Badge>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={13} />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />}>
            New Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        {/* Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <Card
            header={
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '2px'
                    }}
                  >
                    Revenue Overview
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Last 12 months · updated now
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['1M', '3M', '1Y'].map((label, i) => (
                    <button
                      key={label}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border:
                          i === 2
                            ? '1px solid var(--accent-primary)'
                            : '1px solid rgba(255,255,255,0.08)',
                        background: i === 2 ? 'var(--accent-primary-subtle)' : 'transparent',
                        color: i === 2 ? 'var(--accent-primary)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            <div style={{ marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                $98,300
              </span>
              <span
                style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  color: '#10b981',
                  background: 'rgba(16,185,129,0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 600
                }}
              >
                +8.1%
              </span>
            </div>
            <MockChart />
            {/* X-axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {[
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
              ].map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.42 }}
        >
          <Card
            header={
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Activity Feed
                </h2>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--accent-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
            }
            padding="16px"
          >
            <div>
              {activities.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 0',
                    borderBottom:
                      i < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: `${item.avatarColor}22`,
                      border: `1px solid ${item.avatarColor}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: item.avatarColor,
                      flexShrink: 0
                    }}
                  >
                    {item.initials}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.4',
                        marginBottom: '3px'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{item.user}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{item.action}</span>{' '}
                      <span style={{ color: typeColors[item.type] }}>{item.target}</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Badge
                        variant={typeBadge[item.type]}
                        style={{ fontSize: '10px', padding: '1px 6px' }}
                      >
                        {item.type}
                      </Badge>
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          fontFamily: "'JetBrains Mono', monospace"
                        }}
                      >
                        {item.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.55 }}
      >
        <Card
          header={
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Quick Actions
            </h2>
          }
          padding="16px"
        >
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <Button key={action.label} variant={action.variant} size="sm" leftIcon={action.icon}>
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

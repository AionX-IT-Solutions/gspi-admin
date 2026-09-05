import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Home } from 'lucide-react'
import { Tooltip } from './Tooltip'

const routeLabelKeys: Record<string, string> = {
  dashboard: 'sidebar.nav.dashboard',
  announcements: 'sidebar.nav.announcements',
  budget: 'sidebar.nav.budget',
  invoices: 'sidebar.nav.invoices',
  customers: 'sidebar.nav.customers',
  vendors: 'sidebar.nav.vendors',
  items: 'sidebar.nav.items',
  reports: 'sidebar.nav.reports',
  settings: 'sidebar.nav.settings',
  about: 'sidebar.nav.about',
  pos: 'sidebar.nav.pos',
  products: 'sidebar.nav.products',
  members: 'sidebar.nav.members',
  employees: 'sidebar.nav.employees',
  troops: 'sidebar.nav.troops',
  attendance: 'sidebar.nav.attendance',
  enrollment: 'sidebar.nav.enrollment',
  leave: 'sidebar.nav.leave',
  payroll: 'sidebar.nav.payroll',
  'org-chart': 'sidebar.nav.orgChart',
  vouchers: 'sidebar.nav.vouchers',
  rentals: 'sidebar.nav.rentals',
  users: 'sidebar.nav.users',
  'audit-log': 'sidebar.nav.auditLog',
  scrd: 'sidebar.nav.scrd',
  goals: 'sidebar.nav.goals'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function Breadcrumb() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => ({
    label: routeLabelKeys[seg] ? t(routeLabelKeys[seg]) : capitalize(seg),
    path: `/${segments.slice(0, i + 1).join('/')}`
  }))

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 28,
        paddingRight: 28,
        background: 'var(--bg-base)',
        flexShrink: 0
      }}
    >
      {/* Home icon */}
      <Tooltip content={t('titleBar.home')} side="bottom">
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '3px 4px',
            borderRadius: 5,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Home size={13} />
        </button>
      </Tooltip>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <div key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {isLast ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  userSelect: 'none'
                }}
              >
                {crumb.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(crumb.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--text-muted)',
                  padding: '3px 4px',
                  borderRadius: 5,
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {crumb.label}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

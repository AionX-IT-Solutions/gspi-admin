import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Settings, Info, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/app.store'
import { useState, type ReactNode } from 'react'
import { Tooltip } from '../ui/Tooltip'

interface NavItem {
  path: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />
  },
  { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  { path: '/about', label: 'About', icon: <Info size={18} /> }
]

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const logout = useAppStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: 'var(--sidebar-shadow)',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Nav Items */}
      <nav
        style={{
          flex: 1,
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return collapsed ? (
            <Tooltip key={item.path} content={item.label} side="right">
              <SidebarNavItem
                item={item}
                isActive={isActive}
                collapsed={collapsed}
                onClick={() => navigate(item.path)}
              />
            </Tooltip>
          ) : (
            <SidebarNavItem
              key={item.path}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
              onClick={() => navigate(item.path)}
            />
          )
        })}
      </nav>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          margin: '0 12px',
          background: 'linear-gradient(to right, transparent, var(--sidebar-divider), transparent)'
        }}
      />

      {/* Toggle Button — sits just above user info */}
      <button
        onClick={toggleSidebar}
        style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          paddingRight: collapsed ? '0' : '12px',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          transition: 'color 0.15s ease',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.span
              key="right"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight size={16} />
            </motion.span>
          ) : (
            <motion.span
              key="left"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronLeft size={16} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          margin: '0 12px',
          background: 'linear-gradient(to right, transparent, var(--sidebar-divider), transparent)'
        }}
      />

      {/* User + Logout — pinaka-baba */}
      <div
        style={{
          padding: '10px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '8px',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 0 12px var(--accent-primary-glow)'
          }}
        >
          NX
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              style={{
                overflow: 'hidden',
                minWidth: 0,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  AionX User
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  Administrator
                </div>
              </div>

              {/* Logout — only when expanded */}
              <Tooltip content="Sign out" side="top">
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  title="Sign out"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    background: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                    e.currentTarget.style.color = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  <LogOut size={14} />
                </button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

interface SidebarNavItemProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}

function SidebarNavItem({ item, isActive, collapsed, onClick }: SidebarNavItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: collapsed ? '0 11px' : '0 12px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: isActive
          ? 'var(--accent-primary-subtle)'
          : hovered
            ? 'var(--sidebar-nav-hover)'
            : 'transparent',
        transition: 'background 0.15s ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          style={{
            position: 'absolute',
            left: 0,
            top: '6px',
            bottom: '6px',
            width: '3px',
            borderRadius: '0 4px 4px 0',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 10px var(--accent-primary-glow)'
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Icon */}
      <span
        style={{
          color: isActive
            ? 'var(--accent-primary)'
            : hovered
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s ease',
          flexShrink: 0,
          filter: isActive ? 'drop-shadow(0 0 6px var(--accent-primary-glow))' : 'none'
        }}
      >
        {item.icon}
      </span>

      {/* Label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.16 }}
            style={{
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? 'var(--text-primary)'
                : hovered
                  ? 'var(--text-primary)'
                  : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s ease, font-weight 0.15s ease'
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

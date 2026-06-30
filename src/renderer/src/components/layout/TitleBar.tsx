import { Minus, Square, X, Sun, Moon, Bell, Search } from 'lucide-react'
import { useElectron } from '../../hooks/useElectron'
import { useAppStore } from '../../store/app.store'
import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip } from '../ui/Tooltip'

type ElectronStyle = CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' }

// ─── Window Button ────────────────────────────────────────────────────────────

interface WinBtnProps {
  onClick: () => void
  hoverColor: string
  hoverGlow: string
  title: string
  children: ReactNode
}

function WindowButton({ onClick, hoverColor, hoverGlow, title, children }: WinBtnProps) {
  const [hovered, setHovered] = useState(false)

  const style: ElectronStyle = {
    width: '32px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hovered ? hoverColor : 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: hovered ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s ease',
    borderRadius: '6px',
    WebkitAppRegion: 'no-drag',
    boxShadow: hovered ? `0 0 12px ${hoverGlow}` : 'none'
  }

  return (
    <Tooltip content={title} side="bottom">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={style}
      >
        {children}
      </button>
    </Tooltip>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const [hovered, setHovered] = useState(false)
  const isDark = theme === 'dark'

  const style: ElectronStyle = {
    width: '32px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hovered
      ? isDark
        ? 'rgba(251,191,36,0.12)'
        : 'rgba(99,102,241,0.12)'
      : 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: hovered ? (isDark ? '#fbbf24' : 'var(--accent-primary)') : 'var(--text-muted)',
    transition: 'all 0.15s ease',
    borderRadius: '6px',
    WebkitAppRegion: 'no-drag'
  }

  return (
    <Tooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'} side="bottom">
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={style}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </motion.span>
        </AnimatePresence>
      </button>
    </Tooltip>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDark = useAppStore((s) => s.theme) === 'dark'

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      setValue('')
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const wrapStyle: ElectronStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    WebkitAppRegion: 'no-drag'
  }

  return (
    <div ref={containerRef} style={wrapStyle}>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="input"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 8,
                padding: '3px 8px',
                width: 200
              }}
            >
              <Search size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search…"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  width: '100%',
                  caretColor: 'var(--accent-primary)'
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 4,
                  padding: '1px 4px',
                  fontFamily: "'JetBrains Mono', monospace",
                  flexShrink: 0
                }}
              >
                Esc
              </span>
            </div>
          </motion.div>
        ) : (
          <Tooltip key="icon" content="Search (Ctrl+K)" side="bottom">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => setOpen(true)}
              style={{
                width: 32,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                borderRadius: 6,
                transition: 'all 0.15s ease'
              }}
              whileHover={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                color: 'var(--text-primary)'
              }}
            >
              <Search size={13} />
            </motion.button>
          </Tooltip>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const notifications = useAppStore((s) => s.notifications)
  const removeNotification = useAppStore((s) => s.removeNotification)
  const clearNotifications = useAppStore((s) => s.clearNotifications)
  const isDark = useAppStore((s) => s.theme) === 'dark'
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifications.length

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const iconColor = (type: string) => {
    if (type === 'success') return '#10b981'
    if (type === 'error') return '#ef4444'
    if (type === 'warning') return '#f59e0b'
    return 'var(--accent-primary)'
  }

  const wrapStyle: ElectronStyle = {
    position: 'relative',
    WebkitAppRegion: 'no-drag'
  }

  return (
    <div ref={ref} style={wrapStyle}>
      <Tooltip content="Notifications" side="bottom">
        <button
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            width: 32,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: open
              ? 'rgba(99,102,241,0.12)'
              : hovered
                ? isDark
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(0,0,0,0.06)'
                : 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: open
              ? 'var(--accent-primary)'
              : hovered
                ? 'var(--text-primary)'
                : 'var(--text-muted)',
            borderRadius: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <Bell size={13} />
          {unread > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: unread > 9 ? 14 : 8,
                height: 8,
                minWidth: 8,
                borderRadius: 999,
                background: 'var(--accent-primary)',
                boxShadow: '0 0 6px var(--accent-primary-glow)',
                fontSize: 8,
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                padding: unread > 9 ? '0 2px' : 0
              }}
            >
              {unread > 9 ? '9+' : ''}
            </span>
          )}
        </button>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: 300,
              background: 'var(--popover-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--popover-border)',
              borderRadius: 12,
              boxShadow: 'var(--popover-shadow)',
              zIndex: 500,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px 10px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)'
                }}
              >
                Notifications
                {unread > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '1px 6px',
                      fontSize: 9,
                      fontWeight: 700
                    }}
                  >
                    {unread}
                  </span>
                )}
              </span>
              {unread > 0 && (
                <button
                  onClick={clearNotifications}
                  style={{
                    fontSize: 11,
                    color: 'var(--accent-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: 4,
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: '28px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Bell size={20} color="var(--text-muted)" strokeWidth={1.5} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 14px',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--popover-item-hover)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: iconColor(n.type),
                        flexShrink: 0,
                        marginTop: 5
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {n.message}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(n.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(n.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: 2,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── TitleBar ─────────────────────────────────────────────────────────────────

export function TitleBar() {
  const { minimize, maximize, close } = useElectron()
  const theme = useAppStore((s) => s.theme)
  const isDark = theme === 'dark'

  const containerStyle: ElectronStyle = {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: isDark ? 'rgba(8,8,16,0.9)' : 'rgba(240,240,248,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
    boxShadow: 'var(--titlebar-shadow)',
    flexShrink: 0,
    WebkitAppRegion: 'drag',
    userSelect: 'none',
    paddingLeft: '14px',
    paddingRight: '4px',
    position: 'relative',
    zIndex: 100
  }

  const logoAreaStyle: ElectronStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    WebkitAppRegion: 'drag'
  }

  const controlsStyle: ElectronStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    WebkitAppRegion: 'no-drag'
  }

  const divider = (
    <div
      style={{
        width: '1px',
        height: '16px',
        background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
        margin: '0 2px'
      }}
    />
  )

  return (
    <div style={containerStyle}>
      {/* Left — Logo + App Name */}
      <div style={logoAreaStyle}>
        <img
          src={`${import.meta.env.BASE_URL}aionx-logo.png`}
          alt="AionX"
          style={{ height: '22px', width: 'auto', objectFit: 'contain', display: 'block' }}
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          AionX
        </span>
        <div
          style={{
            width: '1px',
            height: '14px',
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            marginLeft: '4px'
          }}
        />
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          v1.0.0
        </span>
      </div>

      {/* Center — Drag region */}
      <div style={{ flex: 1 }} />

      {/* Right — Search + Bell + Theme + Window Controls */}
      <div style={controlsStyle}>
        <SearchBar />
        <NotificationBell />

        {divider}
        <ThemeToggle />
        {divider}

        <WindowButton
          onClick={minimize}
          hoverColor="rgba(251,191,36,0.15)"
          hoverGlow="rgba(251,191,36,0.5)"
          title="Minimize"
        >
          <Minus size={12} />
        </WindowButton>

        <WindowButton
          onClick={maximize}
          hoverColor="rgba(34,197,94,0.15)"
          hoverGlow="rgba(34,197,94,0.5)"
          title="Maximize"
        >
          <Square size={10} />
        </WindowButton>

        <WindowButton
          onClick={close}
          hoverColor="rgba(239,68,68,0.2)"
          hoverGlow="rgba(239,68,68,0.5)"
          title="Close"
        >
          <X size={13} />
        </WindowButton>
      </div>
    </div>
  )
}

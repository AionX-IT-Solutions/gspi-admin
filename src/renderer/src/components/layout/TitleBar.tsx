import { Minus, Square, X, Sun, Moon } from 'lucide-react'
import { useElectron } from '../../hooks/useElectron'
import { useAppStore } from '../../store/app.store'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ElectronStyle = CSSProperties & { WebkitAppRegion?: 'drag' | 'no-drag' }

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
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
    >
      {children}
    </button>
  )
}

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
    WebkitAppRegion: 'no-drag',
    marginRight: '4px'
  }

  return (
    <button
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
  )
}

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

      {/* Right — Theme toggle + Window Controls */}
      <div style={controlsStyle}>
        <ThemeToggle />

        <div
          style={{
            width: '1px',
            height: '16px',
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
            marginRight: '2px'
          }}
        />

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

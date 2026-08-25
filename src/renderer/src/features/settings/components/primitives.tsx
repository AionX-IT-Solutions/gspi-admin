import * as Switch from '@radix-ui/react-switch'
import * as Slider from '@radix-ui/react-slider'
import type { ReactNode } from 'react'
import { Badge } from '@/shared/components/ui/Badge'

/* ── Setting Row ────────────────────────────────────────────── */
interface SettingRowProps {
  label: string
  description?: string
  children: ReactNode
  badge?: string
}

export function SettingRow({ label, description, children, badge }: SettingRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '14px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: description ? '3px' : 0
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}
          </span>
          {badge && (
            <Badge variant="primary" style={{ fontSize: '9px' }}>
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

/* ── Section Header ─────────────────────────────────────────── */
interface SectionHeaderProps {
  icon: ReactNode
  title: string
  description?: string
}

export function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div>
        <h2
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '2px'
          }}
        >
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
    </div>
  )
}

/* ── Styled Switch ──────────────────────────────────────────── */
interface StyledSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}

export function StyledSwitch({ checked, onCheckedChange, id }: StyledSwitchProps) {
  return (
    <Switch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      style={{
        position: 'relative',
        display: 'inline-flex',
        height: '22px',
        width: '40px',
        cursor: 'pointer',
        borderRadius: '999px',
        border: `1px solid ${checked ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
        background: checked ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        outline: 'none',
        boxShadow: checked ? '0 0 12px var(--accent-primary-glow)' : 'none'
      }}
    >
      <Switch.Thumb
        style={{
          display: 'block',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s ease',
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          willChange: 'transform',
          marginTop: '2px'
        }}
      />
    </Switch.Root>
  )
}

/* ── Styled Slider ──────────────────────────────────────────── */
interface StyledSliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  onValueCommit?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

export function StyledSlider({
  value,
  onValueChange,
  onValueCommit,
  min = 10,
  max = 20,
  step = 1
}: StyledSliderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '200px' }}>
      <Slider.Root
        value={value}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        min={min}
        max={max}
        step={step}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
          touchAction: 'none',
          flex: 1,
          height: '20px'
        }}
      >
        <Slider.Track
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            flexGrow: 1,
            borderRadius: '999px',
            height: '5px'
          }}
        >
          <Slider.Range
            style={{
              position: 'absolute',
              background: 'var(--accent-primary)',
              borderRadius: '999px',
              height: '100%',
              boxShadow: '0 0 8px var(--accent-primary-glow)'
            }}
          />
        </Slider.Track>
        <Slider.Thumb
          style={{
            display: 'block',
            width: '16px',
            height: '16px',
            background: 'white',
            border: '2px solid var(--accent-primary)',
            borderRadius: '50%',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 0 0 0 var(--accent-primary-glow)',
            transition: 'box-shadow 0.15s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-primary-glow)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 0 var(--accent-primary-glow)'
          }}
        />
      </Slider.Root>
      <span
        style={{
          fontSize: '12px',
          color: 'var(--accent-primary)',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          minWidth: '28px'
        }}
      >
        {value[0]}px
      </span>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { FieldInput } from './FormField'

export interface SuggestInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

// Free-text input with a searchable, scrollable suggestion list — pick an existing value
// or type a new one. A native <datalist> renders as an unstyled, unbounded browser popup
// that clashes with the rest of the form, so this rolls its own.
export function SuggestInput({ value, onChange, suggestions, placeholder }: SuggestInputProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    const list = q ? suggestions.filter((s) => s.toLowerCase().includes(q)) : suggestions
    return list.slice(0, 50)
  }, [suggestions, value])

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <FieldInput
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            maxHeight: 220,
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
        >
          {filtered.map((name) => (
            <div
              key={name}
              onClick={() => {
                onChange(name)
                setOpen(false)
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                backgroundColor: '#ffffff',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

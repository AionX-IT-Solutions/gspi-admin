import { createContext, useContext, useState, type ReactNode } from 'react'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export function Tabs({ defaultValue, value, onValueChange, children }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  function setValue(next: string) {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      {children}
    </TabsContext.Provider>
  )
}

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 10,
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-subtle)',
        width: 'fit-content'
      }}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useTabsContext()
  const active = ctx.value === value
  return (
    <button
      onClick={() => ctx.setValue(value)}
      style={{
        padding: '6px 14px',
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        transition: 'all 0.15s ease'
      }}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const ctx = useTabsContext()
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}

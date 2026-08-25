import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import { useAppStore, type AccentColor } from '@/app/store/app.store'

const accentOptions: { value: AccentColor; color: string; label: string }[] = [
  { value: 'indigo', color: '#6366f1', label: 'Indigo' },
  { value: 'cyan', color: '#06b6d4', label: 'Cyan' },
  { value: 'emerald', color: '#10b981', label: 'Emerald' },
  { value: 'rose', color: '#f43f5e', label: 'Rose' }
]

export function AccentPicker() {
  const accentColor = useAppStore((s) => s.accentColor)
  const setAccentColor = useAppStore((s) => s.setAccentColor)

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {accentOptions.map((opt) => (
        <Tooltip key={opt.value} content={opt.label} side="top">
          <button
            onClick={() => {
              setAccentColor(opt.value)
              toast.success(`Accent: ${opt.label}`)
            }}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: opt.color,
              border: accentColor === opt.value ? `3px solid white` : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: accentColor === opt.value ? `0 0 12px ${opt.color}80` : 'none',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
          >
            {accentColor === opt.value && <Check size={12} color="white" strokeWidth={3} />}
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

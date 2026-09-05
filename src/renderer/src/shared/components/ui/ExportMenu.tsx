import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Download, ChevronDown, Eye, FileSpreadsheet, FileText, FileType } from 'lucide-react'
import { Button } from './Button'

interface ExportMenuProps {
  label?: string
  /** Opens an in-app preview instead of downloading — shown first, above the download
   *  options, when provided. See shared/hooks/useDocumentPreview.ts + DocumentPreviewModal. */
  onView?: () => void
  onExportExcel: () => void
  onExportPdf: () => void
  onExportWord: () => void
  disabled?: boolean
  iconOnly?: boolean
  title?: string
}

export function ExportMenu({
  label,
  onView,
  onExportExcel,
  onExportPdf,
  onExportWord,
  disabled,
  iconOnly,
  title
}: ExportMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggleOpen() {
    if (disabled) return
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen((v) => !v)
  }

  function pick(fn: () => void) {
    setOpen(false)
    fn()
  }

  const items: { key: string; label: string; icon: ReactNode; onClick: () => void }[] = [
    ...(onView
      ? [{ key: 'view', label: t('common.view'), icon: <Eye size={14} />, onClick: onView }]
      : []),
    {
      key: 'excel',
      label: 'Excel (.xlsx)',
      icon: <FileSpreadsheet size={14} />,
      onClick: onExportExcel
    },
    { key: 'pdf', label: 'PDF (.pdf)', icon: <FileText size={14} />, onClick: onExportPdf },
    { key: 'word', label: 'Word (.docx)', icon: <FileType size={14} />, onClick: onExportWord }
  ]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {iconOnly ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          leftIcon={<Download size={12} />}
          title={title ?? 'Export'}
          onClick={toggleOpen}
        />
      ) : (
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          leftIcon={<Download size={13} />}
          rightIcon={<ChevronDown size={12} style={{ opacity: 0.6 }} />}
          onClick={toggleOpen}
        >
          {label}
        </Button>
      )}

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 9999,
              background: 'var(--popover-bg)',
              border: '1px solid var(--popover-border)',
              borderRadius: 10,
              padding: '6px 0',
              minWidth: 180,
              boxShadow: 'var(--popover-shadow)'
            }}
          >
            {items.map((item) => (
              <button
                key={item.key}
                onClick={() => pick(item.onClick)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--c-text-1)',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--popover-item-hover)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

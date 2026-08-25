import { useRef } from 'react'
import { FileText, Loader2, Upload, X } from 'lucide-react'

interface FileDropzoneProps {
  files: File[]
  onSelect: (files: File[]) => void
  onRemove: (index: number) => void
  label?: string
  uploading?: boolean
}

export function FileDropzone({ files, onSelect, onRemove, label, uploading }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? [])
          if (selected.length) onSelect(selected)
          e.target.value = ''
        }}
      />

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)'
              }}
            >
              <FileText size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={file.name}
              >
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  flexShrink: 0
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          border: '1px dashed var(--border-strong)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: 12,
          cursor: uploading ? 'default' : 'pointer',
          transition: 'border-color 0.15s ease, color 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (uploading) return
          e.currentTarget.style.borderColor = 'var(--accent-primary)'
          e.currentTarget.style.color = 'var(--accent-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
      >
        {uploading ? (
          <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <Upload size={14} />
        )}
        {uploading ? 'Uploading…' : (label ?? 'Click to upload a file')}
      </button>
    </div>
  )
}

export default FileDropzone

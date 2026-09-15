import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CouncilBoardTreeNode } from '../lib/councilBoardOrgChart'

const CONNECTOR_COLOR = 'var(--border-default)'

interface CouncilBoardOrgChartNodeProps {
  node: CouncilBoardTreeNode
  editMode?: boolean
  draggedId?: string | null
  invalidDropIds?: Set<string>
  onDragStartNode?: (memberId: string) => void
  onDragEndNode?: () => void
  onReparent?: (memberId: string, newReportsToId: string | undefined) => void
}

export function CouncilBoardOrgChartNode({
  node,
  editMode = false,
  draggedId = null,
  invalidDropIds,
  onDragStartNode,
  onDragEndNode,
  onReparent
}: CouncilBoardOrgChartNodeProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { member, children } = node
  const hasChildren = children.length > 0
  const [dragOver, setDragOver] = useState(false)

  const isBeingDragged = editMode && draggedId === member.id
  const isValidDropTarget =
    editMode && !!draggedId && draggedId !== member.id && !invalidDropIds?.has(member.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <button
        draggable={editMode}
        onClick={() => {
          if (editMode) return
          navigate(`/council-board/${member.id}`)
        }}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', member.id)
          onDragStartNode?.(member.id)
        }}
        onDragEnd={() => {
          setDragOver(false)
          onDragEndNode?.()
        }}
        onDragOver={(e) => {
          if (!isValidDropTarget) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDragEnter={(e) => {
          if (!isValidDropTarget) return
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!isValidDropTarget || !draggedId) return
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
          onReparent?.(draggedId, member.id)
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          width: 172,
          padding: '14px 10px',
          borderRadius: 12,
          background: dragOver ? 'var(--accent-primary-subtle)' : 'var(--glass-bg)',
          border: `1px solid ${dragOver ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
          cursor: editMode ? (isBeingDragged ? 'grabbing' : 'grab') : 'pointer',
          textAlign: 'center',
          flexShrink: 0,
          opacity: isBeingDragged ? 0.4 : 1,
          transition:
            'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, opacity 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (dragOver) return
          e.currentTarget.style.borderColor = 'var(--accent-primary)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-primary-subtle)'
        }}
        onMouseLeave={(e) => {
          if (dragOver) return
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            overflow: 'hidden',
            background: `${member.avatarColor}22`,
            border: `1px solid ${member.avatarColor}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            color: member.avatarColor,
            flexShrink: 0
          }}
        >
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.fullName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            member.fullName.slice(0, 2).toUpperCase()
          )}
        </div>
        <div style={{ minWidth: 0, width: '100%' }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {member.fullName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {member.position}
          </div>
        </div>
        {hasChildren && (
          <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
            {t('orgChart.directReportsCount', { count: children.length })}
          </span>
        )}
      </button>

      {hasChildren && (
        <>
          <div style={{ width: 1, height: 20, background: CONNECTOR_COLOR, flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {children.map((child, i) => (
              <div
                key={child.member.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0 16px',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    height: 1,
                    background: CONNECTOR_COLOR,
                    left: i === 0 ? '50%' : 0,
                    right: i === children.length - 1 ? '50%' : 0
                  }}
                />
                <div style={{ width: 1, height: 20, background: CONNECTOR_COLOR, flexShrink: 0 }} />
                <CouncilBoardOrgChartNode
                  node={child}
                  editMode={editMode}
                  draggedId={draggedId}
                  invalidDropIds={invalidDropIds}
                  onDragStartNode={onDragStartNode}
                  onDragEndNode={onDragEndNode}
                  onReparent={onReparent}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

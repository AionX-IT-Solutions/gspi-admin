import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAnnouncementsStore } from '@/features/announcements/store/announcements.store'

export function useAnnouncementsHighlight() {
  const navigate = useNavigate()
  const announcements = useAnnouncementsStore((s) => s.announcements)

  const rows = useMemo(
    () =>
      [...announcements]
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return a.createdAt < b.createdAt ? 1 : -1
        })
        .slice(0, 3),
    [announcements]
  )

  return { navigate, rows, totalCount: announcements.length }
}

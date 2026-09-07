import { useMemo } from 'react'
import { useTroopsStore } from '../store/troops.store'

export function useViewMemberModal(memberId: string | null) {
  const member = useTroopsStore((s) => s.scoutMembers.find((m) => m.id === memberId) ?? null)
  const payments = useMemo(
    () => [...(member?.payments ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [member]
  )
  return { member, payments }
}

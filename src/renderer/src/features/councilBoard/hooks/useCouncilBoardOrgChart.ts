import { useMemo } from 'react'
import { useCouncilBoardStore } from '../store/councilBoard.store'
import { buildCouncilBoardTree } from '../lib/councilBoardOrgChart'

export function useCouncilBoardOrgChart() {
  const members = useCouncilBoardStore((s) => s.members)
  const tree = useMemo(() => buildCouncilBoardTree(members), [members])
  return { tree, totalCount: members.length }
}

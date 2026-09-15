import type { CouncilBoardMember } from '../types/councilBoard.types'

export interface CouncilBoardTreeNode {
  member: CouncilBoardMember
  children: CouncilBoardTreeNode[]
}

/**
 * Builds a forest from the flat, `reportsToId`-referencing board member list. Same algorithm
 * as buildOrgTree in features/hr/lib/orgChart.ts (kept separate rather than shared/genericized
 * since the two trees render very differently — see CouncilBoardOrgChartNode vs OrgChartNode).
 * A member is a root when they have no `reportsToId`, or it points at someone outside this
 * list; `reached` doubles as a cycle guard.
 */
export function buildCouncilBoardTree(members: CouncilBoardMember[]): CouncilBoardTreeNode[] {
  const byId = new Map(members.map((m) => [m.id, m]))
  const childrenOf = new Map<string, CouncilBoardMember[]>()
  const roots: CouncilBoardMember[] = []

  for (const member of members) {
    const parentId = member.reportsToId
    if (parentId && parentId !== member.id && byId.has(parentId)) {
      const siblings = childrenOf.get(parentId)
      if (siblings) siblings.push(member)
      else childrenOf.set(parentId, [member])
    } else {
      roots.push(member)
    }
  }

  const byName = (a: CouncilBoardMember, b: CouncilBoardMember) =>
    a.fullName.localeCompare(b.fullName)
  const reached = new Set<string>()

  function toNode(member: CouncilBoardMember): CouncilBoardTreeNode {
    reached.add(member.id)
    const children = (childrenOf.get(member.id) ?? [])
      .filter((child) => !reached.has(child.id))
      .sort(byName)
    return { member, children: children.map(toNode) }
  }

  const tree = [...roots].sort(byName).map(toNode)
  const orphans = members.filter((m) => !reached.has(m.id)).sort(byName)
  const orphanNodes: CouncilBoardTreeNode[] = []
  for (const orphan of orphans) {
    if (reached.has(orphan.id)) continue
    orphanNodes.push(toNode(orphan))
  }
  return [...tree, ...orphanNodes]
}

function findNode(
  tree: CouncilBoardTreeNode[],
  memberId: string
): CouncilBoardTreeNode | undefined {
  for (const node of tree) {
    if (node.member.id === memberId) return node
    const found = findNode(node.children, memberId)
    if (found) return found
  }
  return undefined
}

/** The set of ids that are invalid drop targets / "reports to" picks for `memberId` — itself
 *  plus every descendant, to avoid a reporting-line cycle. */
export function collectCouncilBoardDescendantIds(
  tree: CouncilBoardTreeNode[],
  memberId: string
): Set<string> {
  const ids = new Set<string>([memberId])
  const node = findNode(tree, memberId)
  function walk(n: CouncilBoardTreeNode) {
    for (const child of n.children) {
      ids.add(child.member.id)
      walk(child)
    }
  }
  if (node) walk(node)
  return ids
}

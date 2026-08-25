import type { Employee } from '../types/hr.types'

export interface OrgChartTreeNode {
  employee: Employee
  children: OrgChartTreeNode[]
}

/**
 * Builds a forest from the flat, manager-referencing employee list. An employee is a root
 * when they have no `managerId`, or it points at someone outside this list (inactive/deleted).
 * `reached` doubles as a cycle guard — bad data (e.g. two employees managing each other) would
 * otherwise recurse forever; anyone a cycle keeps from being reached still surfaces as their
 * own root afterward, so no one silently disappears from the chart.
 */
export function buildOrgTree(employees: Employee[]): OrgChartTreeNode[] {
  const byId = new Map(employees.map((e) => [e.id, e]))
  const childrenOf = new Map<string, Employee[]>()
  const roots: Employee[] = []

  for (const emp of employees) {
    const managerId = emp.managerId
    if (managerId && managerId !== emp.id && byId.has(managerId)) {
      const siblings = childrenOf.get(managerId)
      if (siblings) siblings.push(emp)
      else childrenOf.set(managerId, [emp])
    } else {
      roots.push(emp)
    }
  }

  const byName = (a: Employee, b: Employee) => a.fullName.localeCompare(b.fullName)
  const reached = new Set<string>()

  function toNode(emp: Employee): OrgChartTreeNode {
    reached.add(emp.id)
    const children = (childrenOf.get(emp.id) ?? [])
      .filter((child) => !reached.has(child.id))
      .sort(byName)
    return { employee: emp, children: children.map(toNode) }
  }

  const tree = [...roots].sort(byName).map(toNode)
  const orphans = employees.filter((e) => !reached.has(e.id)).sort(byName)
  return [...tree, ...orphans.map(toNode)]
}

function findNode(tree: OrgChartTreeNode[], employeeId: string): OrgChartTreeNode | undefined {
  for (const node of tree) {
    if (node.employee.id === employeeId) return node
    const found = findNode(node.children, employeeId)
    if (found) return found
  }
  return undefined
}

/**
 * The set of ids that are invalid drop targets for reparenting `employeeId` — itself plus every
 * descendant. Dropping onto any of these would either be a no-op or create a management cycle
 * (which `buildOrgTree`'s `reached` guard would silently flatten into orphan roots on the next
 * render, so we head it off in the UI instead of letting that happen).
 */
export function collectDescendantIds(tree: OrgChartTreeNode[], employeeId: string): Set<string> {
  const ids = new Set<string>([employeeId])
  const node = findNode(tree, employeeId)
  function walk(n: OrgChartTreeNode) {
    for (const child of n.children) {
      ids.add(child.employee.id)
      walk(child)
    }
  }
  if (node) walk(node)
  return ids
}

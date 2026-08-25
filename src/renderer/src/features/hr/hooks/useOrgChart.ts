import { useMemo } from 'react'
import { useSkeletonLoading } from '@/shared/hooks/useSkeletonLoading'
import { useHRStore } from '../store/hr.store'
import { buildOrgTree } from '../lib/orgChart'

export function useOrgChart() {
  const loading = useSkeletonLoading()
  const employees = useHRStore((s) => s.employees)

  const activeEmployees = useMemo(() => employees.filter((e) => e.isActive), [employees])
  const tree = useMemo(() => buildOrgTree(activeEmployees), [activeEmployees])

  return { loading, tree, totalCount: activeEmployees.length }
}

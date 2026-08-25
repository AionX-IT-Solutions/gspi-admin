import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePOSStore } from '@/features/pos/store/pos.store'
import { useHRStore } from '@/features/hr/store/hr.store'

export function useQuickOverviewRow() {
  const navigate = useNavigate()
  const products = usePOSStore((s) => s.products)
  const employees = useHRStore((s) => s.employees)
  const attendance = useHRStore((s) => s.attendance)
  const leaveRequests = useHRStore((s) => s.leaveRequests)

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.isActive && p.stockQuantity <= p.reorderLevel),
    [products]
  )

  const todaysAttendance = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const records = attendance.filter((a) => a.date === today)
    const present = records.filter((r) => r.status === 'present').length
    const absent = records.filter((r) => r.status === 'absent').length
    const onLeave = records.filter((r) => r.status === 'leave').length
    const activeEmployees = employees.filter((e) => e.isActive).length
    return { present, absent, onLeave, total: activeEmployees }
  }, [attendance, employees])

  const pendingLeaveCount = useMemo(
    () => leaveRequests.filter((r) => r.status === 'pending').length,
    [leaveRequests]
  )

  return { navigate, lowStockProducts, todaysAttendance, pendingLeaveCount }
}

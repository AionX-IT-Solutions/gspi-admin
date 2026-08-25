import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppStore } from '../store/app.store'
import { usePermissions } from '../hooks/usePermissions'
import { ROLE_HOME, type Permission, type UserRole } from '../lib/permissions'

interface RequirePermissionProps {
  permission?: Permission
  children: ReactNode
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const role = useAppStore((s) => s.currentUser?.role)
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    const home = (role && ROLE_HOME[role as UserRole]) || '/dashboard'
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}

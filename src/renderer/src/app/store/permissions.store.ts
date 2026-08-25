import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_LABELS,
  USER_ROLES,
  type CustomRole,
  type Permission,
  type RoleId,
  type UserRole
} from '../lib/permissions'
import { appendAuditLog } from './auditLog.store'
import { useAppStore } from './app.store'

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

type AddCustomRoleResult = { ok: true; id: string } | { ok: false; error: string }

interface PermissionsState {
  rolePermissions: Record<string, Permission[]>
  customRoles: CustomRole[]
  setRolePermissions: (role: RoleId, permissions: Permission[]) => void
  togglePermission: (role: RoleId, permission: Permission) => void
  addCustomRole: (label: string) => AddCustomRoleResult
  deleteCustomRole: (id: string) => void
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      customRoles: [],

      setRolePermissions: (role, permissions) => {
        set((s) => ({ rolePermissions: { ...s.rolePermissions, [role]: permissions } }))
        const label =
          ROLE_LABELS[role as UserRole] ??
          get().customRoles.find((r) => r.id === role)?.label ??
          role
        appendAuditLog({
          action: 'role_permissions_updated',
          actorName: actorName(),
          entityType: 'role',
          summary: `Permissions for role "${label}" updated.`
        })
      },

      togglePermission: (role, permission) => {
        const current = get().rolePermissions[role] ?? []
        const next = current.includes(permission)
          ? current.filter((p) => p !== permission)
          : [...current, permission]
        get().setRolePermissions(role, next)
      },

      addCustomRole: (label) => {
        const trimmed = label.trim()
        if (!trimmed) return { ok: false, error: 'users.rolePermissions.addRole.errors.required' }

        const id = slugify(trimmed)
        if (!id) return { ok: false, error: 'users.rolePermissions.addRole.errors.invalid' }

        const state = get()
        const taken =
          id === 'super_admin' ||
          (USER_ROLES as readonly string[]).includes(id) ||
          state.customRoles.some((r) => r.id === id)
        if (taken) return { ok: false, error: 'users.rolePermissions.addRole.errors.duplicate' }

        set((s) => ({
          customRoles: [...s.customRoles, { id, label: trimmed }],
          rolePermissions: { ...s.rolePermissions, [id]: [] }
        }))
        appendAuditLog({
          action: 'role_created',
          actorName: actorName(),
          entityType: 'role',
          summary: `Role "${trimmed}" created.`
        })
        return { ok: true, id }
      },

      deleteCustomRole: (id) => {
        const role = get().customRoles.find((r) => r.id === id)
        set((s) => {
          const rolePermissions = { ...s.rolePermissions }
          delete rolePermissions[id]
          return { customRoles: s.customRoles.filter((r) => r.id !== id), rolePermissions }
        })
        if (role) {
          appendAuditLog({
            action: 'role_deleted',
            actorName: actorName(),
            entityType: 'role',
            summary: `Role "${role.label}" deleted.`
          })
        }
      }
    }),
    {
      name: 'aionx-permissions-store',
      partialize: (state) => ({
        rolePermissions: state.rolePermissions,
        customRoles: state.customRoles
      }),
      version: 5,
      migrate: (persistedState) => {
        const state = persistedState as PermissionsState
        const rolePermissions = { ...state.rolePermissions }
        for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[]) {
          if (!rolePermissions[role]) {
            // Role didn't exist in a previously-persisted store (e.g. super_admin added later) — seed its defaults.
            rolePermissions[role] = [...DEFAULT_ROLE_PERMISSIONS[role]]
            continue
          }
          const existing = rolePermissions[role]
          const newDefaults = DEFAULT_ROLE_PERMISSIONS[role].filter(
            (p) =>
              !existing.includes(p) &&
              (p.endsWith(':goals') || p.endsWith(':orgChart') || p.endsWith(':troops'))
          )
          rolePermissions[role] = [...existing, ...newDefaults]
        }
        return { ...state, rolePermissions }
      }
    }
  )
)

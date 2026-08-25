export const USER_ROLES = [
  'super_admin',
  'admin',
  'cashier',
  'accountant',
  'hr',
  'inventory_clerk',
  'manager'
] as const

export type UserRole = (typeof USER_ROLES)[number]

/** A role id — one of the built-in `UserRole` literals, or a custom role's slug.
 *  `string & {}` keeps literal-type autocomplete for the built-ins while still
 *  accepting any custom role string. */
export type RoleId = UserRole | (string & {})

/** A role added at runtime via the "Role Permissions" screen (Super Admin/Admin only). */
export interface CustomRole {
  id: string
  label: string
}

export function isBuiltInRole(role: string): role is UserRole {
  return (USER_ROLES as readonly string[]).includes(role)
}

/** Resolves a role id to its display label — built-in roles go through i18n,
 *  custom roles use their stored (user-entered) label. */
export function resolveRoleLabel(
  role: string,
  t: (key: string) => string,
  customRoles: CustomRole[]
): string {
  if (isBuiltInRole(role)) return t(`roles.${role}`)
  return customRoles.find((r) => r.id === role)?.label ?? role
}

export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: '/dashboard',
  admin: '/dashboard',
  accountant: '/dashboard',
  cashier: '/pos',
  hr: '/employees',
  inventory_clerk: '/products',
  manager: '/dashboard'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  cashier: 'Cashier',
  accountant: 'Accountant',
  hr: 'HR',
  inventory_clerk: 'Inventory Clerk',
  manager: 'Manager'
}

/** Every capability the app understands — `view:x` (page visibility) and `manage:x` (create/edit/delete on that module). */
export const ALL_PERMISSIONS = [
  'view:dashboard',
  'view:pos',
  'manage:pos',
  'view:products',
  'manage:products',
  'view:members',
  'manage:members',
  'view:invoices',
  'manage:invoices',
  'view:customers',
  'manage:customers',
  'view:expenses',
  'manage:expenses',
  'view:vendors',
  'manage:vendors',
  'view:items',
  'manage:items',
  'view:reports',
  'view:employees',
  'manage:employees',
  'view:troops',
  'manage:troops',
  'view:attendance',
  'manage:attendance',
  'view:leave',
  'manage:leave',
  'view:payroll',
  'manage:payroll',
  'view:orgChart',
  'view:vouchers',
  'manage:vouchers',
  'view:rentals',
  'manage:rentals',
  'view:scrd',
  'manage:scrd',
  'manage:users',
  'view:auditLog',
  'view:goals',
  'manage:goals'
] as const

export type Permission = (typeof ALL_PERMISSIONS)[number]

/** Route key -> permission required to reach it. `undefined` = reachable by any signed-in user
 *  (Settings/About are personal preferences, not system config — intentionally ungated). */
export const MODULE_PERMISSIONS: Record<string, Permission | undefined> = {
  dashboard: 'view:dashboard',
  pos: 'view:pos',
  products: 'view:products',
  members: 'view:members',
  invoices: 'view:invoices',
  customers: 'view:customers',
  expenses: 'view:expenses',
  vendors: 'view:vendors',
  items: 'view:items',
  reports: 'view:reports',
  employees: 'view:employees',
  troops: 'view:troops',
  attendance: 'view:attendance',
  leave: 'view:leave',
  payroll: 'view:payroll',
  orgChart: 'view:orgChart',
  vouchers: 'view:vouchers',
  rentals: 'view:rentals',
  scrd: 'view:scrd',
  users: 'manage:users',
  auditLog: 'view:auditLog',
  goals: 'view:goals',
  settings: undefined,
  about: undefined
}

/** Human-readable module names, keyed the same as `MODULE_PERMISSIONS` — used by the Role Permissions editor. */
export const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale',
  products: 'Inventory',
  members: 'Members',
  invoices: 'Invoices',
  customers: 'Customers',
  expenses: 'Expenses',
  vendors: 'Vendors',
  items: 'Products & Services',
  reports: 'Reports',
  employees: 'Employees',
  troops: 'Troops & Membership',
  attendance: 'Attendance',
  leave: 'Leave Requests',
  payroll: 'Payroll',
  orgChart: 'Organizational Chart',
  vouchers: 'Vouchers',
  rentals: 'Rental Bookings',
  scrd: 'Cash Receipts & Disb.',
  users: 'User Accounts',
  auditLog: 'Audit Log',
  goals: 'Goals & Objectives'
}

/** Every module that has a real permission requirement, in nav order (excludes Settings/About). */
export const PERMISSION_MODULES = Object.keys(MODULE_PERMISSIONS).filter(
  (key) => MODULE_PERMISSIONS[key] !== undefined
)

/** Roles staff accounts can be assigned to. Excludes `super_admin`, which is always
 *  full-access and reserved for the bootstrap owner account (not assignable/editable via the UI). */
export const ASSIGNABLE_USER_ROLES = USER_ROLES.filter((role) => role !== 'super_admin')

export function permissionsForModule(moduleKey: string): Permission[] {
  return ALL_PERMISSIONS.filter((p) => p.endsWith(`:${moduleKey}`))
}

/** Default permission set per role — seed data for the permissions store, one-to-one with the
 *  access every role already had under the old route->role[] map, so default behavior doesn't change. */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  admin: [...ALL_PERMISSIONS],
  cashier: [
    'view:pos',
    'manage:pos',
    'view:products',
    'manage:products',
    'view:members',
    'manage:members',
    'view:rentals',
    'manage:rentals'
  ],
  accountant: [
    'view:dashboard',
    'view:products',
    'manage:products',
    'view:invoices',
    'manage:invoices',
    'view:customers',
    'manage:customers',
    'view:expenses',
    'manage:expenses',
    'view:vendors',
    'manage:vendors',
    'view:items',
    'manage:items',
    'view:reports',
    'view:payroll',
    'manage:payroll',
    'view:vouchers',
    'manage:vouchers',
    'view:scrd',
    'manage:scrd',
    'view:goals',
    'manage:goals'
  ],
  hr: [
    'view:dashboard',
    'view:employees',
    'manage:employees',
    'view:attendance',
    'manage:attendance',
    'view:leave',
    'manage:leave',
    'view:payroll',
    'manage:payroll',
    'view:orgChart',
    'view:troops',
    'manage:troops'
  ],
  inventory_clerk: ['view:products', 'manage:products', 'view:items', 'manage:items'],
  manager: [
    'view:dashboard',
    'view:members',
    'manage:members',
    'view:reports',
    'view:orgChart',
    'view:troops',
    'manage:troops',
    'view:vouchers',
    'manage:vouchers',
    'view:rentals',
    'manage:rentals',
    'view:scrd',
    'manage:scrd',
    'view:goals',
    'manage:goals'
  ]
}

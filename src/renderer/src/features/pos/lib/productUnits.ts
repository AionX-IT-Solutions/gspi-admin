/**
 * Same value set as gspi-app's `ProductUnit` union (src/types/product.ts) —
 * kept as plain strings here since desktop has no per-business-type unit
 * list, just one fixed picker covering everything mobile can display.
 */
export const PRODUCT_UNITS = [
  'pcs',
  'kg',
  'g',
  'l',
  'ml',
  'box',
  'pack',
  'set',
  'case',
  'dozen',
  'sack',
  'carton',
  'bundle',
  'roll',
  'm',
  'yard',
  'gallon',
  'pair',
  'session'
] as const

// One-time backfill: unifies the `expenses` Firestore collection onto the shared
// desktop/mobile Expense schema (see gspi_desktop_app's features/accounting/types/
// accounting.types.ts and gspi-app's features/accounting/types/expense.ts — both were
// independently-built shapes on the same collection until now).
//
// Old desktop docs (have `vendorId`, no `description`): backfill `description`
// (synthesized from category + vendor), `createdAt` (real creation time isn't tracked
// pre-migration, so it falls back to `date`).
// Old mobile docs (have `description`, no `date`): backfill `date` (= `createdAt`),
// `status: 'paid'`.
// Every doc: remap any old mobile lowercase `category` value to the new shared
// display-string taxonomy.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node --env-file=.env scripts/migrateExpenseSchema.mjs           (dry run)
//   node --env-file=.env scripts/migrateExpenseSchema.mjs --apply   (writes for real)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')
const apply = process.argv.includes('--apply')

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  console.error('Generate one via Firebase Console → Project Settings → Service accounts.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// Old mobile enum value -> new shared display-string category. Desktop's existing
// values (Utilities, Office Supplies, Shipping & Freight, Maintenance, Vehicle
// Maintenance, Other) are already valid shared values and need no remapping.
const CATEGORY_REMAP = {
  rent: 'Rent',
  utilities: 'Utilities',
  supplies: 'Office Supplies',
  payroll: 'Payroll',
  marketing: 'Marketing',
  maintenance: 'Maintenance',
  other: 'Other'
}

function planUpdate(id, data) {
  const isDesktopShaped = data.vendorId !== undefined && data.description === undefined
  const isMobileShaped = data.description !== undefined && data.date === undefined
  const updates = {}

  if (typeof data.category === 'string' && CATEGORY_REMAP[data.category]) {
    updates.category = CATEGORY_REMAP[data.category]
  }

  if (isDesktopShaped) {
    const category = data.category ?? 'Expense'
    const vendor = data.vendorName ?? 'Unknown vendor'
    updates.description = `${category} – ${vendor}`
    updates.createdAt = data.date ?? null
  } else if (isMobileShaped) {
    updates.date = data.createdAt ?? null
    updates.status = 'paid'
  }

  const stillMissingCore =
    (updates.description ?? data.description) === undefined ||
    (updates.date ?? data.date) === undefined ||
    (updates.createdAt ?? data.createdAt) === undefined

  if (stillMissingCore) {
    console.warn(`  ! expenses/${id}: unrecognized shape, still missing description/date/createdAt after remap — skipping, needs manual review`)
    return null
  }

  return Object.keys(updates).length > 0 ? updates : null
}

async function main() {
  const snap = await db.collection('expenses').get()
  console.log(`${snap.size} document(s) in expenses. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  let changed = 0
  for (const doc of snap.docs) {
    const update = planUpdate(doc.id, doc.data())
    if (!update) continue
    changed++
    console.log(`expenses/${doc.id}:`, update)
    if (apply) {
      await doc.ref.update({ ...update, updatedAt: FieldValue.serverTimestamp() })
    }
  }

  console.log(`\n${changed} document(s) ${apply ? 'updated' : 'would be updated'}.`)
  if (!apply && changed > 0) console.log('Re-run with --apply to write these changes.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })

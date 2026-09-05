// One-time reset: zeroes `budgetedAmount` on every budgetCategories doc for a given
// fiscal year, so admins can re-enter board-approved figures from scratch via the
// Budget screen's Edit modal instead of carrying over the pre-seeded starting figures
// (see src/renderer/src/features/budget/lib/startingBudget.ts). Only budgetedAmount is
// touched — monthlyActuals and the priorYear* reference columns are left as-is.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node --env-file=.env scripts/zeroBudgetAmounts.mjs --fiscalYear=2026-2027           (dry run)
//   node --env-file=.env scripts/zeroBudgetAmounts.mjs --fiscalYear=2026-2027 --apply   (writes for real)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(repoRoot, 'serviceAccountKey.json')
const apply = process.argv.includes('--apply')
const fiscalYearArg = process.argv.find((a) => a.startsWith('--fiscalYear='))
const fiscalYear = fiscalYearArg?.split('=')[1]

if (!fiscalYear) {
  console.error('Usage: node --env-file=.env scripts/zeroBudgetAmounts.mjs --fiscalYear=2026-2027 [--apply]')
  process.exit(1)
}

if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`)
  console.error('Generate one via Firebase Console → Project Settings → Service accounts.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function main() {
  const snap = await db.collection('budgetCategories').where('fiscalYear', '==', fiscalYear).get()
  console.log(`${snap.size} document(s) in budgetCategories for FY ${fiscalYear}. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  let changed = 0
  for (const doc of snap.docs) {
    const data = doc.data()
    if (data.budgetedAmount === 0) continue
    changed++
    console.log(`  ${doc.id} — "${data.name}": ${data.budgetedAmount} -> 0`)
    if (apply) {
      await doc.ref.update({ budgetedAmount: 0, updatedAt: FieldValue.serverTimestamp() })
    }
  }

  console.log(`\n${changed} document(s) ${apply ? 'updated' : 'would be updated'}.`)
  if (!apply && changed > 0) console.log('Re-run with --apply to write these changes.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reset failed:', err)
    process.exit(1)
  })

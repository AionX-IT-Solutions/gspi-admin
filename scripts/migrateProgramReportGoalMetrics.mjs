// Adds REPORTS.xls's "Total No. of Girls" (population) / "Against Goal" tracking to the
// 4 Badgework-sheet line items that have it in the real form: 1.b.1 (Badgework), 1.b.2
// (Other WAGGGS Badges), 1.b.3 (Free Being Me), 1.b.4 (Girl Powered Nutrition). Purely
// additive — sets `tracksGoalMetrics: true` and initializes empty population maps; no
// existing field is renamed, restructured, or deleted, so there's nothing to lose here.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Run with:
//   node scripts/migrateProgramReportGoalMetrics.mjs           (dry run)
//   node scripts/migrateProgramReportGoalMetrics.mjs --apply   (writes for real)

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
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const TARGET_CODES = new Set(['1.b.1', '1.b.2', '1.b.3', '1.b.4'])

async function main() {
  const snap = await db.collection('programReportLineItems').get()
  console.log(`${snap.size} document(s) in programReportLineItems. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  let changed = 0
  for (const doc of snap.docs) {
    const d = doc.data()
    if (!TARGET_CODES.has(d.code) || d.tracksGoalMetrics) continue
    changed++
    const isDistrict = d.scope === 'district'
    const update = {
      tracksGoalMetrics: true,
      ...(isDistrict ? { districtMonthlyPopulation: d.districtMonthlyPopulation ?? {} } : { monthlyPopulation: d.monthlyPopulation ?? Array.from({ length: 12 }, () => ({})) }),
      updatedAt: FieldValue.serverTimestamp()
    }
    console.log(`  ~ update programReportLineItems/${doc.id} (${d.code}): tracksGoalMetrics -> true`)
    if (apply) await doc.ref.update(update)
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

// Splits "1.b.1"'s category matrix data off into its own "1.1" line item — per the
// latest direction, 1.b.1 ("1.b.1 BADGEWORK") and its "1.1 NUMBER OF GIRLS EARNED
// BADGES" detail table are entered as two independent documents now, not one derived
// from the other. Concretely:
//   - Creates a new "1.1" doc, copying 1.b.1's current districtMonthlyCategoryBreakdowns
//     + districtMonthlyPopulation + categories as-is (no data lost).
//   - Patches "1.b.1" itself: shape -> 'ageLevelBreakdown', with districtMonthlyBreakdowns
//     seeded from the OLD category data (summed across categories per age level, so the
//     summary starts populated rather than blank), keeping the same population figures
//     (that field's shape is identical either way). categories/districtMonthlyCategoryBreakdowns
//     are removed from 1.b.1 since that shape no longer uses them.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Run with:
//   node scripts/migrateBadgeworkSplitDetail.mjs           (dry run)
//   node scripts/migrateBadgeworkSplitDetail.mjs --apply   (writes for real)

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

const AGE_LEVELS = ['twinkler', 'star', 'junior', 'senior', 'cadet']

function rollUpAcrossCategories(monthlyCategoryBreakdowns) {
  return (monthlyCategoryBreakdowns ?? []).map((monthCounts) => {
    const rolled = {}
    for (const level of AGE_LEVELS) {
      const sum = Object.values(monthCounts ?? {}).reduce((s, cat) => s + (cat?.[level] ?? 0), 0)
      if (sum) rolled[level] = sum
    }
    return rolled
  })
}

async function main() {
  const snap = await db.collection('programReportLineItems').where('code', '==', '1.b.1').get()
  console.log(`${snap.size} doc(s) with code=1.b.1. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  for (const doc of snap.docs) {
    const d = doc.data()
    if (d.shape !== 'categoryAgeLevelBreakdown') {
      console.log(`  (1.b.1/${doc.id} is already shape=${d.shape} — nothing to split, skipping)`)
      continue
    }

    const districtMonthlyBreakdowns = {}
    for (const [district, monthly] of Object.entries(d.districtMonthlyCategoryBreakdowns ?? {})) {
      districtMonthlyBreakdowns[district] = rollUpAcrossCategories(monthly)
    }

    const newDetailDoc = {
      section: 'badgework',
      code: '1.1',
      label: 'Number of Girls Earned Badges',
      shape: 'categoryAgeLevelBreakdown',
      scope: 'district',
      categories: d.categories,
      districtMonthlyCategoryBreakdowns: d.districtMonthlyCategoryBreakdowns ?? {},
      districtMonthlyPopulation: d.districtMonthlyPopulation ?? {},
      tracksGoalMetrics: true
    }

    console.log(`  + create programReportLineItems/<new-id> (1.1) — copied from 1.b.1/${doc.id}'s category data`)
    console.log(`  ~ update programReportLineItems/${doc.id} (1.b.1): shape -> ageLevelBreakdown, districtMonthlyBreakdowns seeded from rolled-up category data`)
    console.log(`    districtMonthlyBreakdowns:`, JSON.stringify(districtMonthlyBreakdowns))

    if (apply) {
      const newRef = db.collection('programReportLineItems').doc()
      await newRef.set({ id: newRef.id, ...newDetailDoc, updatedAt: FieldValue.serverTimestamp() })
      await doc.ref.update({
        shape: 'ageLevelBreakdown',
        districtMonthlyBreakdowns,
        categories: FieldValue.delete(),
        districtMonthlyCategoryBreakdowns: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      })
    }
  }

  console.log(`\n${apply ? 'Applied.' : 'Re-run with --apply to write these changes.'}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })

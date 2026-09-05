// One-time conversion of the "1.1 NUMBER OF GIRLS EARNED BADGES" line item
// (code '1.1') from District-scoped to Council-scoped, per the admin's explicit
// request — this table no longer tracks a District breakdown at all, only Age Level.
//
// Sums any existing per-district data (districtMonthlyCategoryBreakdowns,
// districtMonthlyPopulation, districtMonthlyAwardedAgainstGoal) across all of its
// districts into the equivalent council-wide fields (monthlyCategoryBreakdowns,
// monthlyPopulation, monthlyAwardedAgainstGoal) for every year|month key present, then
// clears the district-keyed fields and flips `scope` to 'council'. Nothing is dropped —
// if there were multiple districts with real data, their entries are added together.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the update.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node scripts/migrateBadgeworkDetailToCouncilScope.mjs           (dry run)
//   node scripts/migrateBadgeworkDetailToCouncilScope.mjs --apply   (writes for real)

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

function sumCategoryMatrix(a, b) {
  const result = { ...a }
  for (const [category, levels] of Object.entries(b ?? {})) {
    const existing = { ...(result[category] ?? {}) }
    for (const [level, value] of Object.entries(levels ?? {})) {
      existing[level] = (existing[level] ?? 0) + (value ?? 0)
    }
    result[category] = existing
  }
  return result
}

function sumAgeLevelCounts(a, b) {
  const result = { ...a }
  for (const [level, value] of Object.entries(b ?? {})) {
    result[level] = (result[level] ?? 0) + (value ?? 0)
  }
  return result
}

async function main() {
  const snap = await db.collection('programReportLineItems').where('code', '==', '1.1').get()
  console.log(`${snap.size} document(s) with code '1.1'. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  if (snap.empty) {
    console.log('No matching document found — nothing to do.')
    return
  }

  for (const doc of snap.docs) {
    const d = doc.data()
    if (d.scope !== 'district') {
      console.log(`  (${doc.id}: already scope '${d.scope}' — skipping)`)
      continue
    }

    let monthlyCategoryBreakdowns = { ...(d.monthlyCategoryBreakdowns ?? {}) }
    for (const districtData of Object.values(d.districtMonthlyCategoryBreakdowns ?? {})) {
      for (const [key, matrix] of Object.entries(districtData ?? {})) {
        monthlyCategoryBreakdowns[key] = sumCategoryMatrix(monthlyCategoryBreakdowns[key] ?? {}, matrix)
      }
    }

    let monthlyPopulation = { ...(d.monthlyPopulation ?? {}) }
    for (const districtData of Object.values(d.districtMonthlyPopulation ?? {})) {
      for (const [key, counts] of Object.entries(districtData ?? {})) {
        monthlyPopulation[key] = sumAgeLevelCounts(monthlyPopulation[key] ?? {}, counts)
      }
    }

    let monthlyAwardedAgainstGoal = { ...(d.monthlyAwardedAgainstGoal ?? {}) }
    for (const districtData of Object.values(d.districtMonthlyAwardedAgainstGoal ?? {})) {
      for (const [key, value] of Object.entries(districtData ?? {})) {
        monthlyAwardedAgainstGoal[key] = (monthlyAwardedAgainstGoal[key] ?? 0) + (value ?? 0)
      }
    }

    console.log(`  ~ update programReportLineItems/${doc.id} (1.1): scope 'district' -> 'council', merging district data into council-wide fields`)
    console.log(`    districts merged: ${Object.keys(d.districtMonthlyCategoryBreakdowns ?? {}).join(', ') || '(none)'}`)
    if (apply) {
      await doc.ref.update({
        scope: 'council',
        monthlyCategoryBreakdowns,
        monthlyPopulation,
        monthlyAwardedAgainstGoal,
        districtMonthlyCategoryBreakdowns: FieldValue.delete(),
        districtMonthlyPopulation: FieldValue.delete(),
        districtMonthlyAwardedAgainstGoal: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      })
    }
  }

  console.log(`\n${apply ? 'Changes written.' : 'Re-run with --apply to write these changes.'}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })

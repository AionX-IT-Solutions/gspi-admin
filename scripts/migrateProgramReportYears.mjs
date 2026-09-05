// One-time restructure of the `programReportLineItems` Firestore collection to add a
// Year dimension to every monthly-data field. Before this, `monthlyCounts` (and its 9
// siblings: `monthlyBreakdowns`, `monthlyCategoryBreakdowns`, `monthlyPopulation`,
// `monthlyAwardedAgainstGoal`, and their `districtMonthly*` counterparts) were flat
// 12-slot arrays indexed by month only — there was no way to tell "November 2025" apart
// from "November 2026", both were the exact same array slot. The app now keys each of
// these fields by a composite `"<programYear>|<monthIndex>"` string instead (see
// monthKey() in types/programReports.types.ts) — district-scoped fields keep the exact
// same nesting depth (district -> value), just "value" is now a keyed map instead of a
// 12-slot array; council-scoped fields go from a 12-slot array straight to a keyed map.
//
// This script converts every existing flat array into that keyed-map shape, mapping
// each of its 12 slots to the CURRENT program year (there was no year concept before,
// so all existing data implicitly belongs to whichever program year is running right
// now) — nothing is dropped, every slot (including explicit zeros) carries over.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node scripts/migrateProgramReportYears.mjs           (dry run)
//   node scripts/migrateProgramReportYears.mjs --apply   (writes for real)

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

// Same July-start logic as programYearLabel() in types/programReports.types.ts.
function currentProgramYear() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startYear = month >= 7 ? year : year - 1
  return `${startYear}-${startYear + 1}`
}

function monthKey(year, monthIndex) {
  return `${year}|${monthIndex}`
}

const COUNCIL_ARRAY_FIELDS = [
  'monthlyCounts',
  'monthlyBreakdowns',
  'monthlyCategoryBreakdowns',
  'monthlyPopulation',
  'monthlyAwardedAgainstGoal'
]
const DISTRICT_ARRAY_FIELDS = [
  'districtMonthlyCounts',
  'districtMonthlyBreakdowns',
  'districtMonthlyCategoryBreakdowns',
  'districtMonthlyPopulation',
  'districtMonthlyAwardedAgainstGoal'
]

function convertCouncilArray(arr, year) {
  const map = {}
  arr.forEach((value, idx) => {
    map[monthKey(year, idx)] = value
  })
  return map
}

function convertDistrictMap(districtMap, year) {
  const result = {}
  for (const [district, arr] of Object.entries(districtMap)) {
    result[district] = Array.isArray(arr) ? convertCouncilArray(arr, year) : arr
  }
  return result
}

async function main() {
  const year = currentProgramYear()
  const snap = await db.collection('programReportLineItems').get()
  console.log(`${snap.size} document(s) in programReportLineItems. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}`)
  console.log(`Migrating existing data to program year: ${year}\n`)

  let changed = 0
  for (const doc of snap.docs) {
    const d = doc.data()
    const update = {}
    const changedFields = []

    for (const field of COUNCIL_ARRAY_FIELDS) {
      if (Array.isArray(d[field])) {
        update[field] = convertCouncilArray(d[field], year)
        changedFields.push(field)
      }
    }
    for (const field of DISTRICT_ARRAY_FIELDS) {
      const val = d[field]
      if (val && typeof val === 'object' && Object.values(val).some((v) => Array.isArray(v))) {
        update[field] = convertDistrictMap(val, year)
        changedFields.push(field)
      }
    }

    if (changedFields.length === 0) continue
    changed++
    console.log(`  ~ update programReportLineItems/${doc.id} (${d.code}): ${changedFields.join(', ')}`)
    if (apply) {
      update.updatedAt = FieldValue.serverTimestamp()
      await doc.ref.update(update)
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

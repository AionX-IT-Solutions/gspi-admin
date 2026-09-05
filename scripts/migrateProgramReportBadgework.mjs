// One-time restructure of the `programReportLineItems` Firestore collection so its
// Badgework codes match REPORTS.xls exactly (National HQ's actual monthly
// accomplishment-report form) instead of an earlier, incorrect seeding:
//
// - 1.b.1a..1.b.1h ("Badgework — <category>", ageLevelBreakdown) never existed as
//   codes in REPORTS.xls — the real form has ONE code "1.b.1" whose table crosses age
//   level against the 8 Eight Point Challenge categories as columns. This script merges
//   the 8 docs into a single 1.b.1 doc (shape: categoryAgeLevelBreakdown) and deletes
//   the 8 old docs. Any data already entered under 1.b.1c/1.b.1g (etc.) was recorded
//   before this app had per-District tracking, so it landed in the council-wide
//   `monthlyBreakdowns` field with no district attached — that data is carried over
//   into the merged doc under a placeholder "Unspecified" district so nothing is
//   silently dropped; an admin can reassign it to the correct District afterward.
// - 1.b.2 ("Other WAGGGS Badges") gets the same category treatment (5 badge-type
//   columns: YUNGA/WTD/IDG/STV/SURF SMART) — code unchanged, shape/categories patched
//   in place.
// - 1.b.9 ("Senior-Cadet Planning Board") was seeded as a plain monthly count, but
//   REPORTS.xls actually wants a listing of named projects — shape patched to 'log'
//   with a "Project Initiated" field.
// - 1.b.10 ("More Learner-Led Activities...") was missing the activity name/title
//   column REPORTS.xls has — a "Learner-Led Activity Conducted" field is prepended.
//
// Defaults to a DRY RUN — prints what would change, writes nothing. Pass --apply to
// actually perform the updates.
//
// Prerequisites: same as scripts/bootstrapSuperAdmin.mjs — serviceAccountKey.json at the repo root.
//
// Run with:
//   node scripts/migrateProgramReportBadgework.mjs           (dry run)
//   node scripts/migrateProgramReportBadgework.mjs --apply   (writes for real)

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

const UNSPECIFIED_DISTRICT = 'Unspecified'

const OLD_BADGEWORK_CATEGORY_BY_CODE = {
  '1.b.1a': 'spiritualityWellBeing',
  '1.b.1b': 'preparedness',
  '1.b.1c': 'familyLife',
  '1.b.1d': 'heritageCitizenship',
  '1.b.1e': 'arts',
  '1.b.1f': 'environment',
  '1.b.1g': 'worldCommunity',
  '1.b.1h': 'economicSelfSufficiency'
}

const BADGEWORK_CATEGORIES = [
  { key: 'spiritualityWellBeing', label: 'Spirituality & Well Being' },
  { key: 'preparedness', label: 'Preparedness' },
  { key: 'familyLife', label: 'Family Life' },
  { key: 'heritageCitizenship', label: 'Heritage & Citizenship' },
  { key: 'arts', label: 'Arts' },
  { key: 'environment', label: 'Environment' },
  { key: 'worldCommunity', label: 'World Community' },
  { key: 'economicSelfSufficiency', label: 'Economic Self-Sufficiency' }
]

const WAGGGS_BADGE_CATEGORIES = [
  { key: 'yunga', label: 'YUNGA' },
  { key: 'wtd', label: 'WTD' },
  { key: 'idg', label: 'IDG' },
  { key: 'stv', label: 'STV' },
  { key: 'surfSmart', label: 'Surf Smart' }
]

function hasAnyBreakdownData(monthlyBreakdowns) {
  return (monthlyBreakdowns ?? []).some((m) => m && Object.values(m).some((v) => v))
}

async function main() {
  const snap = await db.collection('programReportLineItems').get()
  const docsByCode = new Map()
  for (const doc of snap.docs) {
    docsByCode.set(doc.data().code, { id: doc.id, ref: doc.ref, data: doc.data() })
  }
  console.log(`${snap.size} document(s) in programReportLineItems. Mode: ${apply ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`)

  // --- 1. Merge 1.b.1a..1.b.1h into a single 1.b.1 (categoryAgeLevelBreakdown) ---
  const oldBadgeworkDocs = Object.keys(OLD_BADGEWORK_CATEGORY_BY_CODE)
    .map((code) => docsByCode.get(code))
    .filter(Boolean)

  if (oldBadgeworkDocs.length > 0) {
    const districtMonthlyCategoryBreakdowns = {}

    for (const { data, ...rest } of oldBadgeworkDocs) {
      const category = OLD_BADGEWORK_CATEGORY_BY_CODE[data.code]

      // Already-district-scoped data (if any admin used the district picker before
      // this migration) carries straight over, per district.
      for (const [district, monthly] of Object.entries(data.districtMonthlyBreakdowns ?? {})) {
        districtMonthlyCategoryBreakdowns[district] ??= Array.from({ length: 12 }, () => ({}))
        monthly.forEach((counts, i) => {
          if (!counts) return
          districtMonthlyCategoryBreakdowns[district][i][category] = counts
        })
      }

      // Legacy council-wide data (entered before per-District tracking existed) —
      // carried over under a placeholder district so it isn't dropped.
      if (hasAnyBreakdownData(data.monthlyBreakdowns)) {
        districtMonthlyCategoryBreakdowns[UNSPECIFIED_DISTRICT] ??= Array.from({ length: 12 }, () => ({}))
        ;(data.monthlyBreakdowns ?? []).forEach((counts, i) => {
          if (!counts || Object.values(counts).every((v) => !v)) return
          districtMonthlyCategoryBreakdowns[UNSPECIFIED_DISTRICT][i][category] = counts
        })
        console.log(`  ! ${data.code}: legacy council-wide data found — migrated under district "${UNSPECIFIED_DISTRICT}", review/reassign manually`)
      }

      console.log(`  - delete programReportLineItems/${rest.id} (${data.code})`)
      if (apply) await rest.ref.delete()
    }

    const existing1b1 = docsByCode.get('1.b.1')
    const merged1b1 = {
      section: 'badgework',
      code: '1.b.1',
      label: 'Badgework — Eight Point Challenge',
      shape: 'categoryAgeLevelBreakdown',
      scope: 'district',
      categories: BADGEWORK_CATEGORIES,
      districtMonthlyCategoryBreakdowns,
      updatedAt: FieldValue.serverTimestamp()
    }
    console.log(`  + write programReportLineItems/${existing1b1?.id ?? '(new id)'} (1.b.1) — merged from ${oldBadgeworkDocs.length} doc(s)`)
    if (apply) {
      const ref = existing1b1?.ref ?? db.collection('programReportLineItems').doc()
      await ref.set({ id: ref.id, ...merged1b1 }, { merge: false })
    }
  } else {
    console.log('  (no 1.b.1a..1.b.1h docs found — already migrated or never seeded)')
  }

  // --- 2. Patch 1.b.2 in place: ageLevelBreakdown -> categoryAgeLevelBreakdown ---
  const item2 = docsByCode.get('1.b.2')
  if (item2 && item2.data.shape !== 'categoryAgeLevelBreakdown') {
    console.log(`  ~ update programReportLineItems/${item2.id} (1.b.2): shape -> categoryAgeLevelBreakdown, add categories`)
    if (apply) {
      await item2.ref.update({
        shape: 'categoryAgeLevelBreakdown',
        categories: WAGGGS_BADGE_CATEGORIES,
        districtMonthlyCategoryBreakdowns: item2.data.districtMonthlyCategoryBreakdowns ?? {},
        monthlyBreakdowns: FieldValue.delete(),
        districtMonthlyBreakdowns: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      })
    }
    if (hasAnyBreakdownData(item2.data.monthlyBreakdowns) || Object.keys(item2.data.districtMonthlyBreakdowns ?? {}).length > 0) {
      console.log(`  ! 1.b.2: had existing ageLevelBreakdown data — NOT auto-migrated (no per-category source to map it to), review manually before/after applying`)
    }
  }

  // --- 3. Patch 1.b.9 in place: count -> log ---
  const item9 = docsByCode.get('1.b.9')
  if (item9 && item9.data.shape !== 'log') {
    console.log(`  ~ update programReportLineItems/${item9.id} (1.b.9): shape -> log, fields -> [Project Initiated]`)
    if (apply) {
      await item9.ref.update({
        shape: 'log',
        fields: [{ key: 'project', label: 'Project Initiated', type: 'text' }],
        entries: item9.data.entries ?? [],
        monthlyCounts: FieldValue.delete(),
        districtMonthlyCounts: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      })
    }
    if ((item9.data.monthlyCounts ?? []).some((v) => v) || Object.keys(item9.data.districtMonthlyCounts ?? {}).length > 0) {
      console.log('  ! 1.b.9: had existing count data — NOT convertible to a project log entry, review manually')
    }
  }

  // --- 4. Patch 1.b.10 in place: add missing "activity" field ---
  const item10 = docsByCode.get('1.b.10')
  if (item10 && !(item10.data.fields ?? []).some((f) => f.key === 'activity')) {
    const fields = [{ key: 'activity', label: 'Learner-Led Activity Conducted', type: 'text' }, ...(item10.data.fields ?? [])]
    console.log(`  ~ update programReportLineItems/${item10.id} (1.b.10): prepend "activity" field`)
    if (apply) {
      await item10.ref.update({ fields, updatedAt: FieldValue.serverTimestamp() })
    }
  }

  console.log(`\nDone. ${apply ? 'Changes written.' : 'Re-run with --apply to write these changes.'}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })

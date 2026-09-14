import ExcelJS from 'exceljs'
import { orgHeader } from '@/shared/data/signatories.data'
import { formatDate } from '@/shared/lib/utils'
import { addWorksheetLogo } from '@/shared/lib/excelReport'
import { createPdf, addHeaderLines, addTable, savePdf } from '@/shared/lib/pdfExport'
import { headerParagraphs, buildTable, spacer, saveDocx } from '@/shared/lib/docxExport'
import type { TrainingProfile } from '../types/trainingProfiles.types'

function fileBase(profile: TrainingProfile): string {
  return `Training_Profile_${profile.name}`.replace(/[^0-9a-zA-Z_]/g, '_')
}

// Field/value rows for the profile card — same order as the Council's own "Profile and
// Training Information Form", shared by the PDF/Excel/Word builders below.
function profileRows(profile: TrainingProfile, t: (key: string) => string): [string, string][] {
  const rows: [string, string][] = [
    ['Name', profile.name],
    ['Birthday', profile.birthday ? formatDate(profile.birthday) : ''],
    ['School', profile.school],
    ['District', profile.district],
    [
      'Level',
      t(`trainingProfiles.level.${profile.level === 'high_school' ? 'highSchool' : 'elementary'}`)
    ],
    ['Contact Number', profile.contactNumber],
    ['Email', profile.email],
    ['Home Address', profile.homeAddress],
    ['Position/Role(s)', profile.roles.map((r) => t(`trainingProfiles.role.${r}`)).join(', ')],
    [
      'Completed Training(s)',
      [
        ...profile.completedTrainings.map((tr) => t(`trainingProfiles.training.${tr}`)),
        ...(profile.otherCompletedTraining ? [profile.otherCompletedTraining] : [])
      ].join(', ')
    ]
  ]
  if (profile.ageLevelSpecialization) {
    rows.push([
      'Age-Level Specialization',
      t(`trainingProfiles.ageLevel.${profile.ageLevelSpecialization}`)
    ])
  }
  rows.push([
    'Certificate(s) Completed',
    profile.completedCertificates.map((c) => t(`trainingProfiles.certificate.${c}`)).join(', ')
  ])
  if (profile.firstRegistrationDate)
    rows.push(['First Registration Date', profile.firstRegistrationDate])
  if (profile.totalYearsInScouting)
    rows.push(['Total Years in Scouting', profile.totalYearsInScouting])
  return rows
}

export async function buildTrainingProfilePdfDoc(
  profile: TrainingProfile,
  t: (key: string) => string
) {
  const doc = createPdf('portrait')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'TRAINING PROFILE', bold: true, size: 12 }
  ])

  addTable(doc, {
    startY: y,
    head: [['Field', 'Details']],
    body: profileRows(profile, t),
    columnStyles: { 0: { cellWidth: 150, fontStyle: 'bold' } }
  })

  return doc
}

export async function exportTrainingProfilePdf(
  profile: TrainingProfile,
  t: (key: string) => string
) {
  const doc = await buildTrainingProfilePdfDoc(profile, t)
  savePdf(doc, `${fileBase(profile)}.pdf`)
}

export async function exportTrainingProfileExcel(
  profile: TrainingProfile,
  t: (key: string) => string
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Training Profile'.slice(0, 31))
  sheet.columns = [{ width: 26 }, { width: 46 }]
  await addWorksheetLogo(wb, sheet)

  const headLines = [orgHeader.orgName, orgHeader.council, orgHeader.city, 'TRAINING PROFILE']
  headLines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, 2)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.font = i === 3 ? { bold: true, size: 13 } : { bold: i === 0 }
    cell.alignment = { horizontal: 'center' }
  })

  let r = 6
  for (const [label, value] of profileRows(profile, t)) {
    sheet.getCell(r, 1).value = label
    sheet.getCell(r, 1).font = { bold: true }
    sheet.getCell(r, 2).value = value
    sheet.getCell(r, 2).alignment = { wrapText: true }
    r++
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileBase(profile)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportTrainingProfileDocx(
  profile: TrainingProfile,
  t: (key: string) => string
) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: 'TRAINING PROFILE', bold: true, size: 24 }
    ])),
    spacer(),
    buildTable(['Field', 'Details'], profileRows(profile, t))
  ]
  await saveDocx(children, `${fileBase(profile)}.docx`)
}

// ---------------------------------------------------------------------------
// List export — every profile currently on record (or filtered by the search box),
// one row per profile, same column order as the Training Profiles list table.
// ---------------------------------------------------------------------------

const LIST_HEADERS = [
  'Name',
  'School',
  'District',
  'Level',
  'Contact Number',
  'Email',
  'Home Address',
  'Position/Role',
  'Completed Training',
  'Age-Level Specialization',
  'Certificate Completed',
  'Birthday',
  'First Reg. Date',
  'Total Yrs. in Scouting'
]

function listRow(profile: TrainingProfile, t: (key: string) => string): (string | number)[] {
  return [
    profile.name,
    profile.school,
    profile.district,
    t(`trainingProfiles.level.${profile.level === 'high_school' ? 'highSchool' : 'elementary'}`),
    profile.contactNumber,
    profile.email,
    profile.homeAddress,
    profile.roles.map((r) => t(`trainingProfiles.role.${r}`)).join(', '),
    [
      ...profile.completedTrainings.map((tr) => t(`trainingProfiles.training.${tr}`)),
      ...(profile.otherCompletedTraining ? [profile.otherCompletedTraining] : [])
    ].join(', '),
    profile.ageLevelSpecialization
      ? t(`trainingProfiles.ageLevel.${profile.ageLevelSpecialization}`)
      : '—',
    profile.completedCertificates.map((c) => t(`trainingProfiles.certificate.${c}`)).join(', '),
    profile.birthday ? formatDate(profile.birthday) : '—',
    profile.firstRegistrationDate ?? '—',
    profile.totalYearsInScouting ?? '—'
  ]
}

function listFileBase(): string {
  return `Training_Profiles_${formatDate(new Date().toISOString()).replace(/[^0-9a-zA-Z]/g, '_')}`
}

export async function exportTrainingProfilesExcel(
  profiles: TrainingProfile[],
  t: (key: string) => string
) {
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet('Training Profiles')
  sheet.columns = LIST_HEADERS.map(() => ({ width: 20 }))
  await addWorksheetLogo(wb, sheet)

  const totalCols = LIST_HEADERS.length
  const lines = [orgHeader.orgName, orgHeader.council, orgHeader.city, 'TRAINING PROFILES']
  lines.forEach((line, i) => {
    sheet.mergeCells(i + 1, 1, i + 1, totalCols)
    const cell = sheet.getCell(i + 1, 1)
    cell.value = line
    cell.alignment = { horizontal: 'center' }
    cell.font = { bold: i >= 3, size: i === 3 ? 13 : 11 }
  })

  const headerRowIdx = lines.length + 2
  const headerRow = sheet.getRow(headerRowIdx)
  LIST_HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }
    cell.alignment = { horizontal: 'center' }
  })

  let r = headerRowIdx + 1
  for (const profile of profiles) {
    listRow(profile, t).forEach((val, i) => {
      sheet.getCell(r, i + 1).value = val
    })
    r++
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${listFileBase()}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function buildTrainingProfilesPdfDoc(
  profiles: TrainingProfile[],
  t: (key: string) => string
) {
  const doc = createPdf('landscape')
  const y = await addHeaderLines(doc, [
    { text: orgHeader.orgName, bold: true },
    { text: orgHeader.council },
    { text: orgHeader.city },
    { text: 'TRAINING PROFILES', bold: true, size: 13 }
  ])
  addTable(doc, {
    startY: y,
    head: [LIST_HEADERS],
    body: profiles.map((p) => listRow(p, t))
  })
  return doc
}

export async function exportTrainingProfilesPdf(
  profiles: TrainingProfile[],
  t: (key: string) => string
) {
  const doc = await buildTrainingProfilesPdfDoc(profiles, t)
  savePdf(doc, `${listFileBase()}.pdf`)
}

export async function exportTrainingProfilesDocx(
  profiles: TrainingProfile[],
  t: (key: string) => string
) {
  const children = [
    ...(await headerParagraphs([
      { text: orgHeader.orgName, bold: true },
      { text: orgHeader.council },
      { text: orgHeader.city },
      { text: 'TRAINING PROFILES', bold: true, size: 26 }
    ])),
    spacer(),
    buildTable(
      LIST_HEADERS,
      profiles.map((p) => listRow(p, t))
    )
  ]
  await saveDocx(children, `${listFileBase()}.docx`, true)
}

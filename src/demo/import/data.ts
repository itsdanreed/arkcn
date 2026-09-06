import * as React from "react"

export type ObjectId = "company" | "contact" | "deal" | "note"
export type FieldDef = { id: string; label: string; required?: boolean; identity?: boolean }
export type ObjectDef = {
  id: ObjectId
  label: string
  plural: string
  fields: FieldDef[]
  parents: ObjectId[]
  nameFields: string[]
}

/** The objects the CRM knows about. A mapping's structure is assembled from these. */
export const objectDefs: Record<ObjectId, ObjectDef> = {
  company: {
    id: "company",
    label: "Company",
    plural: "Companies",
    parents: [],
    nameFields: ["name", "domain"],
    fields: [
      { id: "name", label: "Name", required: true, identity: true },
      { id: "domain", label: "Website" },
      { id: "industry", label: "Industry" },
    ],
  },
  contact: {
    id: "contact",
    label: "Contact",
    plural: "Contacts",
    parents: ["company"],
    nameFields: ["name", "email"],
    fields: [
      { id: "name", label: "Full name", required: true },
      { id: "email", label: "Email", required: true, identity: true },
      { id: "title", label: "Job title" },
    ],
  },
  deal: {
    id: "deal",
    label: "Deal",
    plural: "Deals",
    parents: ["company", "contact"],
    nameFields: ["title"],
    fields: [
      { id: "title", label: "Deal name", required: true, identity: true },
      { id: "value", label: "Value" },
      { id: "stage", label: "Stage" },
    ],
  },
  note: {
    id: "note",
    label: "Note",
    plural: "Notes",
    parents: ["company", "contact", "deal"],
    nameFields: ["body"],
    fields: [{ id: "body", label: "Text", required: true, identity: true }],
  },
}

/** One object a mapping produces per row. The same type can appear twice (e.g. a second contact on the row). */
export type Instance = {
  id: string
  objectId: ObjectId
  parentId: string | null
  label: string
  mapping: Record<string, string | null>
}

export type CsvFile = { name: string; size: string; rows: number; columns: string[]; sample: string[][] }

/** A saved, reusable mapping: the column signature it was built from plus the structure. */
export type SavedMapping = {
  id: string
  name: string
  columns: string[]
  instances: Instance[]
  createdAt: Date
  lastUsedAt: Date | null
  uses: number
}

/* -------------------------------- files ----------------------------------- */

export const sampleFiles: CsvFile[] = [
  {
    name: "crm-export-2026-09.csv",
    size: "52 KB",
    rows: 1_284,
    columns: [
      "Company",
      "Website",
      "Industry",
      "Contact Name",
      "Contact Email",
      "Contact Title",
      "Secondary Contact",
      "Secondary Email",
      "Opportunity",
      "Amount",
      "Stage",
      "Notes",
    ],
    sample: [
      [
        "Acme Corp",
        "acme.com",
        "Manufacturing",
        "Ava Patel",
        "ava@acme.com",
        "VP Sales",
        "Liam Chen",
        "liam@acme.com",
        "Platform license",
        "48000",
        "Proposal",
        "Met at expo",
      ],
      [
        "Acme Corp",
        "acme.com",
        "Manufacturing",
        "Ava Patel",
        "ava@acme.com",
        "VP Sales",
        "",
        "",
        "API add-on",
        "12000",
        "Qualified",
        "",
      ],
      [
        "Globex",
        "globex.io",
        "Software",
        "Noah Garcia",
        "noah@globex.io",
        "Founder",
        "Zoe Reyes",
        "zoe@globex.io",
        "Enterprise plan",
        "96000",
        "Negotiation",
        "Needs security review",
      ],
      ["Initech", "initech.com", "Finance", "Emma Kim", "", "Ops lead", "", "", "Seats upgrade", "8000", "Lead", ""],
      [
        "Hooli",
        "hooli.xyz",
        "Software",
        "Mia Turner",
        "mia@hooli.xyz",
        "Head of RevOps",
        "Lucas Walker",
        "lucas@hooli.xyz",
        "Annual renewal",
        "36000",
        "Closed Won",
        "",
      ],
      [
        "Globex",
        "globex.io",
        "Software",
        "Ethan Brooks",
        "ethan@globex.io",
        "Procurement",
        "",
        "",
        "Onboarding package",
        "5000",
        "Lead",
        "",
      ],
    ],
  },
  {
    name: "crm-export-2026-10.csv",
    size: "61 KB",
    rows: 1_502,
    columns: [
      "Company",
      "Website",
      "Industry",
      "Contact Name",
      "Contact Email",
      "Contact Title",
      "Secondary Contact",
      "Secondary Email",
      "Opportunity",
      "Amount",
      "Stage",
      "Notes",
    ],
    sample: [
      [
        "Stark Industries",
        "stark.com",
        "Manufacturing",
        "Pepper Potts",
        "pepper@stark.com",
        "CEO",
        "Happy Hogan",
        "happy@stark.com",
        "Arc reactor pilot",
        "120000",
        "Proposal",
        "",
      ],
      [
        "Wayne Enterprises",
        "wayne.co",
        "Conglomerate",
        "Lucius Fox",
        "lucius@wayne.co",
        "CTO",
        "",
        "",
        "Security suite",
        "64000",
        "Qualified",
        "Referred by Alfred",
      ],
      [
        "Wayne Enterprises",
        "wayne.co",
        "Conglomerate",
        "Lucius Fox",
        "lucius@wayne.co",
        "CTO",
        "",
        "",
        "Renewal",
        "30000",
        "Lead",
        "",
      ],
    ],
  },
  {
    name: "webinar-leads.csv",
    size: "9 KB",
    rows: 212,
    columns: ["Name", "Email", "Company", "Job Title", "Attended", "Questions asked"],
    sample: [
      ["Sofia Davis", "sofia@pied.piper", "Pied Piper", "Marketing lead", "yes", "2"],
      ["Dinesh Chugtai", "dinesh@pied.piper", "Pied Piper", "Engineer", "yes", "0"],
      ["Jared Dunn", "jared@hooli.xyz", "Hooli", "Operations", "no", "0"],
    ],
  },
  {
    name: "support-contacts.csv",
    size: "14 KB",
    rows: 388,
    columns: ["Full Name", "Work Email", "Organisation", "Phone", "Plan"],
    sample: [
      ["Ava Patel", "ava@acme.com", "Acme Corp", "+1 415 555 0101", "Enterprise"],
      ["Noah Garcia", "noah@globex.io", "Globex", "+1 212 555 0102", "Team"],
    ],
  },
]

/* ------------------------------ suggestions ------------------------------- */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()

const hints: Record<ObjectId, Record<string, string[]>> = {
  company: {
    name: ["company", "company name", "account", "organization", "organisation"],
    domain: ["website", "domain", "url"],
    industry: ["industry", "sector"],
  },
  contact: {
    name: ["contact name", "name", "full name", "contact"],
    email: ["contact email", "email", "email address", "work email"],
    title: ["contact title", "job title", "title", "role"],
  },
  deal: {
    title: ["opportunity", "deal", "deal name"],
    value: ["amount", "value", "deal value"],
    stage: ["stage", "deal stage"],
  },
  note: { body: ["notes", "note", "comments"] },
}

export function suggestMapping(
  objectId: ObjectId,
  columns: string[],
  used: Set<string>,
  prefix?: string
): Record<string, string | null> {
  const mapping: Record<string, string | null> = {}
  for (const field of objectDefs[objectId].fields) {
    const candidates = hints[objectId][field.id] ?? [normalize(field.label)]
    const match = columns.find((c) => {
      if (used.has(c)) return false
      const n = normalize(c)
      if (prefix) return n.startsWith(prefix) && candidates.some((k) => n.endsWith(k.split(" ").pop()!))
      return candidates.includes(n)
    })
    mapping[field.id] = match ?? null
    if (match) used.add(match)
  }
  return mapping
}

/** Propose a structure for a set of columns: whichever objects have their required columns, nested parent → child. */
export function suggestStructure(columns: string[]): Instance[] {
  const used = new Set<string>()
  const out: Instance[] = []
  const order: ObjectId[] = ["company", "contact", "deal", "note"]
  for (const objectId of order) {
    const mapping = suggestMapping(objectId, columns, used)
    const def = objectDefs[objectId]
    if (!def.fields.filter((f) => f.required).every((f) => mapping[f.id])) {
      for (const c of Object.values(mapping)) if (c) used.delete(c)
      continue
    }
    const parent = [...out].reverse().find((i) => def.parents.includes(i.objectId))
    out.push({ id: `i-${objectId}`, objectId, parentId: parent?.id ?? null, label: def.label, mapping })
  }
  return out
}

export function detectExtraCopies(columns: string[], instances: Instance[]) {
  const used = new Set(instances.flatMap((i) => Object.values(i.mapping).filter(Boolean) as string[]))
  const free = columns.filter((c) => !used.has(c))
  const prefixes = new Set(
    free
      .map((c) => normalize(c).split(" ")[0])
      .filter((p) => free.filter((c) => normalize(c).startsWith(p)).length >= 2)
  )
  const copies: { objectId: ObjectId; prefix: string; label: string; mapping: Record<string, string | null> }[] = []
  for (const prefix of prefixes) {
    for (const objectId of ["contact", "company", "deal"] as ObjectId[]) {
      const mapping = suggestMapping(objectId, free, new Set(), prefix)
      const def = objectDefs[objectId]
      if (def.fields.filter((f) => f.required).every((f) => mapping[f.id])) {
        copies.push({
          objectId,
          prefix,
          label: `${prefix[0].toUpperCase()}${prefix.slice(1)} ${def.label.toLowerCase()}`,
          mapping,
        })
        break
      }
    }
  }
  return copies
}

/* ------------------------------- matching --------------------------------- */

export type Match = { mapping: SavedMapping; matched: string[]; missing: string[]; extra: string[]; score: number }

/** Score every saved mapping against a file's columns. Exact header names, case-insensitive. */
export function matchMappings(file: CsvFile, mappings: SavedMapping[]): Match[] {
  const fileCols = new Map(file.columns.map((c) => [normalize(c), c]))
  return mappings
    .map((mapping) => {
      const needed = [
        ...new Set(mapping.instances.flatMap((i) => Object.values(i.mapping).filter(Boolean) as string[])),
      ]
      const matched = needed.filter((c) => fileCols.has(normalize(c)))
      const missing = needed.filter((c) => !fileCols.has(normalize(c)))
      const extra = file.columns.filter((c) => !needed.some((n) => normalize(n) === normalize(c)))
      return { mapping, matched, missing, extra, score: needed.length ? matched.length / needed.length : 0 }
    })
    .sort((a, b) => b.score - a.score)
}

/* -------------------------------- estimates ------------------------------- */

export function estimateCounts(instances: Instance[], file: CsvFile): Record<string, number> {
  const col = (row: string[], column: string | null) => (column ? (row[file.columns.indexOf(column)] ?? "") : "")
  const counts: Record<string, number> = {}
  const walk = (instance: Instance, rows: string[][]) => {
    const identity = objectDefs[instance.objectId].fields.find((f) => f.identity)!
    const groups = new Map<string, string[][]>()
    for (const row of rows) {
      const key = col(row, instance.mapping[identity.id]).trim()
      if (key) groups.set(key, [...(groups.get(key) ?? []), row])
    }
    counts[instance.id] = (counts[instance.id] ?? 0) + groups.size
    for (const [, groupRows] of groups)
      for (const child of instances.filter((i) => i.parentId === instance.id)) walk(child, groupRows)
  }
  for (const root of instances.filter((i) => i.parentId === null)) walk(root, file.sample)
  const scale = file.rows / Math.max(1, file.sample.length)
  for (const k of Object.keys(counts)) counts[k] = Math.round(counts[k] * scale)
  return counts
}

/* --------------------------------- store ---------------------------------- */

const day = 86_400_000
const seedCrm = (() => {
  const columns = sampleFiles[0].columns
  const instances = suggestStructure(columns)
  const copy = detectExtraCopies(columns, instances)[0]
  if (copy)
    instances.push({
      id: "i-contact-2",
      objectId: copy.objectId,
      parentId: "i-company",
      label: copy.label,
      mapping: copy.mapping,
    })
  return instances
})()

let mappings: SavedMapping[] = [
  {
    id: "m-crm",
    name: "CRM export",
    columns: sampleFiles[0].columns,
    instances: seedCrm,
    createdAt: new Date(Date.now() - 40 * day),
    lastUsedAt: new Date(Date.now() - 2 * day),
    uses: 6,
  },
  {
    id: "m-leads",
    name: "Event leads",
    columns: ["Name", "Email", "Company", "Job Title"],
    instances: [
      {
        id: "l-company",
        objectId: "company",
        parentId: null,
        label: "Company",
        mapping: { name: "Company", domain: null, industry: null },
      },
      {
        id: "l-contact",
        objectId: "contact",
        parentId: "l-company",
        label: "Contact",
        mapping: { name: "Name", email: "Email", title: "Job Title" },
      },
    ],
    createdAt: new Date(Date.now() - 12 * day),
    lastUsedAt: new Date(Date.now() - 9 * day),
    uses: 2,
  },
]
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function useMappings() {
  return React.useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => mappings
  )
}
export function saveMapping(mapping: Omit<SavedMapping, "id" | "createdAt" | "lastUsedAt" | "uses"> & { id?: string }) {
  const existing = mapping.id ? mappings.find((m) => m.id === mapping.id) : undefined
  const next: SavedMapping = existing
    ? { ...existing, ...mapping }
    : { ...mapping, id: `m-${Date.now()}`, createdAt: new Date(), lastUsedAt: null, uses: 0 }
  mappings = existing ? mappings.map((m) => (m.id === next.id ? next : m)) : [next, ...mappings]
  emit()
  return next
}
export function deleteMapping(id: string) {
  mappings = mappings.filter((m) => m.id !== id)
  emit()
}
export function recordUse(id: string) {
  mappings = mappings.map((m) => (m.id === id ? { ...m, uses: m.uses + 1, lastUsedAt: new Date() } : m))
  emit()
}

/* -------------------------------- history --------------------------------- */

export type Actor = { id: string; name: string; initials: string; avatar?: string }
export type ImportStatus = "running" | "completed" | "failed" | "undone"
export type ConflictField = {
  field: string
  existing: string
  imported: string
  choice: "existing" | "imported" | null
}
/** A row whose identity matched an existing record, but with different values. */
export type Conflict = {
  id: string
  objectLabel: string
  identity: string
  row: number
  fields: ConflictField[]
  resolvedAt: Date | null
}
export type SkippedRow = { row: number; reason: string }

export type ImportRecord = {
  id: string
  file: string
  rows: number
  mappingId: string
  mappingName: string
  actor: Actor
  startedAt: Date
  status: ImportStatus
  /** Per instance label: created/updated counts once completed. */
  results: { label: string; plural: string; created: number; updated: number }[]
  conflicts: Conflict[]
  skipped: SkippedRow[]
  error?: string
}

const conflictSeeds: Omit<Conflict, "id" | "resolvedAt">[] = [
  {
    objectLabel: "Company",
    identity: "Acme Corp",
    row: 12,
    fields: [
      { field: "Website", existing: "acme-corp.com", imported: "acme.com", choice: null },
      { field: "Industry", existing: "Industrial", imported: "Manufacturing", choice: null },
    ],
  },
  {
    objectLabel: "Contact",
    identity: "ava@acme.com",
    row: 12,
    fields: [
      { field: "Full name", existing: "Ava K. Patel", imported: "Ava Patel", choice: null },
      { field: "Job title", existing: "Director of Sales", imported: "VP Sales", choice: null },
    ],
  },
  {
    objectLabel: "Company",
    identity: "Globex",
    row: 31,
    fields: [{ field: "Industry", existing: "SaaS", imported: "Software", choice: null }],
  },
  {
    objectLabel: "Contact",
    identity: "noah@globex.io",
    row: 31,
    fields: [{ field: "Job title", existing: "Co-founder", imported: "Founder", choice: null }],
  },
  {
    objectLabel: "Deal",
    identity: "Enterprise plan",
    row: 31,
    fields: [
      { field: "Value", existing: "84000", imported: "96000", choice: null },
      { field: "Stage", existing: "Proposal", imported: "Negotiation", choice: null },
    ],
  },
  {
    objectLabel: "Contact",
    identity: "mia@hooli.xyz",
    row: 58,
    fields: [{ field: "Full name", existing: "Mia Turner-Lee", imported: "Mia Turner", choice: null }],
  },
]

const skippedSeeds: SkippedRow[] = [
  { row: 4, reason: "No contact email; contact and its deal were skipped" },
  { row: 77, reason: "No contact email; contact and its deal were skipped" },
  { row: 140, reason: "Company name is empty" },
  { row: 213, reason: 'Amount is not a number ("48k")' },
]

/** Deterministic mock conflicts for a record, scaled by size. */
export function mockConflicts(prefix: string, rows: number): { conflicts: Conflict[]; skipped: SkippedRow[] } {
  const n = Math.max(1, Math.min(conflictSeeds.length, Math.round(rows / 250)))
  return {
    conflicts: conflictSeeds
      .slice(0, n)
      .map((c, i) => ({ ...c, id: `${prefix}-c${i}`, resolvedAt: null, fields: c.fields.map((f) => ({ ...f })) })),
    skipped: skippedSeeds.slice(0, Math.max(1, Math.min(skippedSeeds.length, Math.round(rows / 350)))),
  }
}

export const currentUser: Actor = {
  id: "me",
  name: "Alex Morgan",
  initials: "AM",
}
const olivia: Actor = { id: "olivia", name: "Olivia Martin", initials: "OM" }
const jackson: Actor = { id: "jackson", name: "Jackson Lee", initials: "JL" }

let history: ImportRecord[] = [
  {
    id: "imp-1",
    file: "crm-export-2026-08.csv",
    rows: 1_190,
    mappingId: "m-crm",
    mappingName: "CRM export",
    actor: olivia,
    startedAt: new Date(Date.now() - 2 * day),
    status: "completed",
    results: [
      { label: "Company", plural: "Companies", created: 61, updated: 334 },
      { label: "Contact", plural: "Contacts", created: 402, updated: 588 },
      { label: "Deal", plural: "Deals", created: 1_190, updated: 0 },
    ],
    ...mockConflicts("imp-1", 1_190),
  },
  {
    id: "imp-2",
    file: "webinar-leads-aug.csv",
    rows: 180,
    mappingId: "m-leads",
    mappingName: "Event leads",
    actor: currentUser,
    startedAt: new Date(Date.now() - 9 * day),
    status: "completed",
    results: [
      { label: "Company", plural: "Companies", created: 44, updated: 12 },
      { label: "Contact", plural: "Contacts", created: 171, updated: 9 },
    ],
    conflicts: [],
    skipped: [{ row: 22, reason: 'Email is not valid ("jared@hooli")' }],
  },
  {
    id: "imp-3",
    file: "crm-export-2026-07.csv",
    rows: 1_040,
    mappingId: "m-crm",
    mappingName: "CRM export",
    actor: jackson,
    startedAt: new Date(Date.now() - 33 * day),
    status: "undone",
    results: [
      { label: "Company", plural: "Companies", created: 58, updated: 290 },
      { label: "Contact", plural: "Contacts", created: 371, updated: 502 },
      { label: "Deal", plural: "Deals", created: 1_040, updated: 0 },
    ],
    conflicts: [],
    skipped: [],
  },
  {
    id: "imp-4",
    file: "partners.csv",
    rows: 96,
    mappingId: "m-leads",
    mappingName: "Event leads",
    actor: olivia,
    startedAt: new Date(Date.now() - 41 * day),
    status: "failed",
    results: [],
    conflicts: [],
    skipped: [],
    error: "Row 57: email is not valid",
  },
]
const historyListeners = new Set<() => void>()
const emitHistory = () => historyListeners.forEach((l) => l())

export function useImportHistory() {
  return React.useSyncExternalStore(
    (l) => (historyListeners.add(l), () => historyListeners.delete(l)),
    () => history
  )
}
export function addImport(
  record: Omit<ImportRecord, "id" | "startedAt" | "status" | "results" | "conflicts" | "skipped">
): ImportRecord {
  const next: ImportRecord = {
    ...record,
    id: `imp-${Date.now()}`,
    startedAt: new Date(),
    status: "running",
    results: [],
    conflicts: [],
    skipped: [],
  }
  history = [next, ...history]
  emitHistory()
  return next
}
export function updateImport(id: string, patch: Partial<ImportRecord>) {
  history = history.map((r) => (r.id === id ? { ...r, ...patch } : r))
  emitHistory()
}

/** Choose a value for one conflicting field (or every field of the conflict when `field` is omitted). */
export function chooseConflict(recordId: string, conflictId: string, choice: "existing" | "imported", field?: string) {
  history = history.map((r) =>
    r.id !== recordId
      ? r
      : {
          ...r,
          conflicts: r.conflicts.map((c) =>
            c.id !== conflictId
              ? c
              : { ...c, fields: c.fields.map((f) => (field && f.field !== field ? f : { ...f, choice })) }
          ),
        }
  )
  emitHistory()
}
/** Mark every fully chosen, unresolved conflict as applied. */
export function applyResolutions(recordId: string) {
  let applied = 0
  history = history.map((r) =>
    r.id !== recordId
      ? r
      : {
          ...r,
          conflicts: r.conflicts.map((c) => {
            if (c.resolvedAt || c.fields.some((f) => !f.choice)) return c
            applied++
            return { ...c, resolvedAt: new Date() }
          }),
        }
  )
  emitHistory()
  return applied
}

/** Hand a just-uploaded file to the mapping editor page (the Import tab links there). */
let pendingFile: CsvFile | null = null
export function setPendingFile(file: CsvFile | null) {
  pendingFile = file
}
export function takePendingFile(): CsvFile | null {
  const f = pendingFile
  pendingFile = null
  return f
}

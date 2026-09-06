import type { CanvasDropDetails } from "@/components/ui/canvas"
import { applyRowDrop, resizeRowItems } from "@/lib/row-layout"
import type { QueryField, QueryGroup } from "@/components/ui/query-builder"

/* ------------------------------- Model ------------------------------------ */

export type FieldType =
  | "text"
  | "email"
  | "url"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "date"
  | "heading"
  | "paragraph"
  | "divider"

export type FieldOption = { value: string; label: string }

export type FieldValidation = {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  patternMessage?: string
}

export type FormField = {
  id: string
  type: FieldType
  /** Submission key. Derived from the label until the user edits it. */
  name: string
  nameLocked?: boolean
  label: string
  placeholder: string
  description: string
  required: boolean
  defaultValue?: string | number | boolean | string[]
  options: FieldOption[]
  validation: FieldValidation
  /** Flex-grow share inside its row. */
  width: number
  /** Show only when this query matches the current values. `null` = always. */
  condition: QueryGroup | null
}

export type FormRow = { id: string; fields: FormField[] }
export type FormSchema = { title: string; description: string; rows: FormRow[] }

export type PaletteGroup = "Inputs" | "Choices" | "Layout"
export type PaletteEntry = { type: FieldType; label: string; group: PaletteGroup }

export const palette: PaletteEntry[] = [
  { type: "text", label: "Text", group: "Inputs" },
  { type: "email", label: "Email", group: "Inputs" },
  { type: "phone", label: "Phone", group: "Inputs" },
  { type: "url", label: "URL", group: "Inputs" },
  { type: "number", label: "Number", group: "Inputs" },
  { type: "textarea", label: "Long text", group: "Inputs" },
  { type: "date", label: "Date", group: "Inputs" },
  { type: "select", label: "Dropdown", group: "Choices" },
  { type: "multiselect", label: "Multi-select", group: "Choices" },
  { type: "radio", label: "Radio group", group: "Choices" },
  { type: "checkbox", label: "Checkbox", group: "Choices" },
  { type: "switch", label: "Switch", group: "Choices" },
  { type: "heading", label: "Heading", group: "Layout" },
  { type: "paragraph", label: "Paragraph", group: "Layout" },
  { type: "divider", label: "Divider", group: "Layout" },
]

export const paletteGroups: PaletteGroup[] = ["Inputs", "Choices", "Layout"]

export const isInput = (type: FieldType) => !["heading", "paragraph", "divider"].includes(type)
export const hasOptions = (type: FieldType) => ["select", "multiselect", "radio"].includes(type)
export const isBoolean = (type: FieldType) => type === "checkbox" || type === "switch"
export const hasPlaceholder = (type: FieldType) =>
  ["text", "email", "url", "phone", "number", "textarea", "select", "multiselect", "date"].includes(type)

let seq = 1
export const uid = (prefix: string) => `${prefix}-${seq++}`

export const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "field"

export function createField(type: FieldType, patch: Partial<FormField> = {}): FormField {
  const meta = palette.find((p) => p.type === type)
  const label = patch.label ?? meta?.label ?? "Field"
  return {
    id: uid("field"),
    type,
    name: slugify(label),
    label,
    placeholder: "",
    description: "",
    required: false,
    options: hasOptions(type)
      ? [
          { value: "option_1", label: "Option 1" },
          { value: "option_2", label: "Option 2" },
        ]
      : [],
    validation: {},
    width: 1,
    condition: null,
    ...patch,
  }
}

export function createSchema(): FormSchema {
  return {
    title: "Contact us",
    description: "We usually reply within one business day.",
    rows: [
      {
        id: uid("row"),
        fields: [
          createField("text", { label: "First name", required: true }),
          createField("text", { label: "Last name", required: true }),
        ],
      },
      { id: uid("row"), fields: [createField("email", { label: "Email", required: true })] },
      {
        id: uid("row"),
        fields: [
          createField("select", {
            label: "Topic",
            options: [
              { value: "sales", label: "Sales" },
              { value: "support", label: "Support" },
              { value: "other", label: "Something else" },
            ],
          }),
        ],
      },
      { id: uid("row"), fields: [createField("textarea", { label: "Message", placeholder: "How can we help?" })] },
    ],
  }
}

/* ------------------------------ Mutations --------------------------------- */

export const allFields = (schema: FormSchema) => schema.rows.flatMap((r) => r.fields)

export function updateField(schema: FormSchema, id: string, patch: Partial<FormField>): FormSchema {
  return {
    ...schema,
    rows: schema.rows.map((r) => ({
      ...r,
      fields: r.fields.map((f) => {
        if (f.id !== id) return f
        const next = { ...f, ...patch }
        // Keep the key following the label until it is edited by hand.
        if (patch.label !== undefined && !next.nameLocked) next.name = slugify(patch.label)
        if (patch.name !== undefined) next.nameLocked = true
        return next
      }),
    })),
  }
}

export function removeField(schema: FormSchema, id: string): FormSchema {
  return {
    ...schema,
    rows: schema.rows
      .map((r) => ({ ...r, fields: r.fields.filter((f) => f.id !== id) }))
      .filter((r) => r.fields.length > 0),
  }
}

export function duplicateField(schema: FormSchema, id: string): { schema: FormSchema; id: string } {
  const rowIndex = schema.rows.findIndex((r) => r.fields.some((f) => f.id === id))
  if (rowIndex < 0) return { schema, id }
  const source = schema.rows[rowIndex].fields.find((f) => f.id === id)!
  const copy: FormField = {
    ...source,
    id: uid("field"),
    label: `${source.label} copy`,
    name: `${source.name}_copy`,
    nameLocked: source.nameLocked,
    options: source.options.map((o) => ({ ...o })),
    validation: { ...source.validation },
    width: 1,
  }
  const rows = [...schema.rows]
  rows.splice(rowIndex + 1, 0, { id: uid("row"), fields: [copy] })
  return { schema: { ...schema, rows }, id: copy.id }
}

export function applyDrop(schema: FormSchema, details: CanvasDropDetails): FormSchema {
  const rows = applyRowDrop(
    schema.rows.map((r) => ({ id: r.id, items: r.fields })),
    details,
    { create: (data) => createField(data as FieldType), rowId: () => uid("row") }
  )
  return { ...schema, rows: rows.map((r) => ({ id: r.id, fields: r.items })) }
}

export function resizeRow(row: FormRow, index: number, deltaFraction: number): FormRow {
  const next = resizeRowItems({ id: row.id, items: row.fields }, index, deltaFraction)
  return { id: next.id, fields: next.items }
}

/* ----------------------------- Conditions --------------------------------- */

/** Other fields as query-builder fields, so a condition can reference them. */
export function conditionFields(schema: FormSchema, excludeId: string): QueryField[] {
  return allFields(schema)
    .filter((f) => f.id !== excludeId && isInput(f.type))
    .map((f) => {
      const base = { name: f.name, label: f.label || f.name }
      if (hasOptions(f.type)) return { ...base, type: "select" as const, options: f.options }
      if (isBoolean(f.type)) return { ...base, type: "boolean" as const }
      if (f.type === "number") return { ...base, type: "number" as const }
      if (f.type === "date") return { ...base, type: "date" as const }
      return { ...base, type: "text" as const }
    })
}

/* ------------------------------ Problems ---------------------------------- */

export type Problem = { fieldId: string; message: string }

export function findProblems(schema: FormSchema): Problem[] {
  const problems: Problem[] = []
  const seen = new Map<string, string>()
  for (const f of allFields(schema)) {
    if (!isInput(f.type)) continue
    if (!f.label.trim()) problems.push({ fieldId: f.id, message: "Missing label" })
    if (seen.has(f.name)) problems.push({ fieldId: f.id, message: `Key "${f.name}" is also used by another field` })
    seen.set(f.name, f.id)
    if (hasOptions(f.type) && f.options.length === 0) problems.push({ fieldId: f.id, message: "No options" })
    if (f.validation.pattern) {
      try {
        new RegExp(f.validation.pattern)
      } catch {
        problems.push({ fieldId: f.id, message: "Invalid pattern" })
      }
    }
  }
  return problems
}

/* ------------------------------ Serialize --------------------------------- */

export function serializeSchema(schema: FormSchema) {
  return JSON.stringify(
    {
      version: 1,
      title: schema.title,
      description: schema.description,
      rows: schema.rows.map((r) =>
        r.fields.map(({ id: _id, nameLocked: _locked, width, ...f }) => ({ ...f, width: Number(width.toFixed(2)) }))
      ),
    },
    null,
    2
  )
}

export function parseSchema(text: string): FormSchema {
  const data = JSON.parse(text) as { title?: string; description?: string; rows?: Partial<FormField>[][] }
  if (!Array.isArray(data.rows)) throw new Error("Expected { rows: [...] }")
  return {
    title: String(data.title ?? "Untitled form"),
    description: String(data.description ?? ""),
    rows: data.rows
      .filter((fields) => Array.isArray(fields) && fields.length)
      .map((fields) => ({
        id: uid("row"),
        fields: fields.map((f) => createField((f.type as FieldType) ?? "text", { ...f, nameLocked: !!f.name })),
      })),
  }
}

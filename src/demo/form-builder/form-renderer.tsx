import * as React from "react"
import { createListCollection } from "@ark-ui/react/collection"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/demo/lib/date-picker"
import { matches } from "@/demo/query-builder/interpret"
import { useForm } from "@/lib/form"
import { cn } from "@/lib/utils"
import { allFields, conditionFields, isBoolean, isInput, type FormField, type FormSchema } from "./model"

type Values = Record<string, unknown>

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlRe = /^https?:\/\/\S+$/i

function defaultsFor(schema: FormSchema): Values {
  const values: Values = {}
  for (const f of allFields(schema)) {
    if (!isInput(f.type)) continue
    if (f.defaultValue !== undefined) values[f.name] = f.defaultValue
    else if (isBoolean(f.type)) values[f.name] = false
    else if (f.type === "multiselect") values[f.name] = []
    else values[f.name] = ""
  }
  return values
}

/** Which fields are visible for the current values (conditions reference other fields by key). */
export function visibleFields(schema: FormSchema, values: Values) {
  const visible = new Set<string>()
  for (const f of allFields(schema)) {
    if (!f.condition) {
      visible.add(f.id)
      continue
    }
    if (matches(f.condition, values, conditionFields(schema, f.id))) visible.add(f.id)
  }
  return visible
}

function validateSchema(schema: FormSchema, values: Values, visible: Set<string>) {
  const errors: Record<string, string> = {}
  for (const f of allFields(schema)) {
    if (!isInput(f.type) || !visible.has(f.id)) continue
    const v = values[f.name]
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0) || v === false
    if (f.required && empty) {
      errors[f.name] = isBoolean(f.type) ? "This must be checked" : "This field is required"
      continue
    }
    if (empty) continue
    const rules = f.validation
    const text = typeof v === "string" ? v : ""
    if (f.type === "email" && !emailRe.test(text)) errors[f.name] = "Enter a valid email address"
    else if (f.type === "url" && !urlRe.test(text)) errors[f.name] = "Enter a valid URL (https://…)"
    else if (f.type === "number") {
      const n = Number(v)
      if (Number.isNaN(n)) errors[f.name] = "Enter a number"
      else if (rules.min !== undefined && n < rules.min) errors[f.name] = `Must be at least ${rules.min}`
      else if (rules.max !== undefined && n > rules.max) errors[f.name] = `Must be at most ${rules.max}`
    } else if (typeof v === "string") {
      if (rules.minLength !== undefined && text.length < rules.minLength)
        errors[f.name] = `Use at least ${rules.minLength} characters`
      else if (rules.maxLength !== undefined && text.length > rules.maxLength)
        errors[f.name] = `Use at most ${rules.maxLength} characters`
      else if (rules.pattern) {
        try {
          if (!new RegExp(rules.pattern).test(text))
            errors[f.name] = rules.patternMessage || "Doesn't match the expected format"
        } catch {
          // An invalid pattern is reported by the builder's problem list instead.
        }
      }
    }
  }
  return errors
}

/**
 * Renders a schema as a working form on the toolkit controls: rows become
 * flex rows with the configured widths, conditions hide fields live, and
 * validation comes from each field's settings.
 */
export function FormRenderer({
  schema,
  onSubmit,
  className,
}: {
  schema: FormSchema
  onSubmit: (values: Values) => void
  className?: string
}) {
  const form = useForm<Values>(
    defaultsFor(schema),
    (values) => validateSchema(schema, values, visibleFields(schema, values)),
    (values) => {
      // Submit only what is visible; hidden fields are dropped like a real form would.
      const visible = visibleFields(schema, values)
      const keys = new Set(
        allFields(schema)
          .filter((f) => visible.has(f.id))
          .map((f) => f.name)
      )
      onSubmit(Object.fromEntries(Object.entries(values).filter(([k]) => keys.has(k))))
    }
  )
  const visible = visibleFields(schema, form.values)

  return (
    <form onSubmit={form.handleSubmit} className={cn("flex flex-col gap-5", className)} noValidate>
      {(schema.title || schema.description) && (
        <div className="space-y-1">
          {schema.title && <h3 className="text-lg font-semibold">{schema.title}</h3>}
          {schema.description && <p className="text-sm text-muted-foreground">{schema.description}</p>}
        </div>
      )}
      {schema.rows.map((row) => {
        const fields = row.fields.filter((f) => visible.has(f.id))
        if (!fields.length) return null
        return (
          <div key={row.id} className="flex flex-wrap gap-4">
            {fields.map((field) => (
              <div key={field.id} style={{ flexGrow: field.width, flexBasis: 0 }} className="min-w-40">
                <RenderedField
                  field={field}
                  value={form.values[field.name]}
                  error={form.errors[field.name]}
                  onChange={(v) => form.setValue(field.name, v)}
                />
              </div>
            ))}
          </div>
        )
      })}
      <div>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}

function RenderedField({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField
  value: unknown
  error?: string
  onChange: (value: unknown) => void
}) {
  const id = `form-${field.id}`
  const invalid = !!error
  const label = (
    <FieldLabel htmlFor={id}>
      {field.label}
      {field.required && <span className="text-destructive"> *</span>}
    </FieldLabel>
  )
  const extras = (
    <>
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </>
  )
  const collection = React.useMemo(
    () => createListCollection({ items: field.options, itemToValue: (o) => o.value, itemToString: (o) => o.label }),
    [field.options]
  )

  switch (field.type) {
    case "heading":
      return <h4 className="pt-2 text-base font-semibold">{field.label}</h4>
    case "paragraph":
      return <p className="text-sm text-muted-foreground">{field.description || field.label}</p>
    case "divider":
      return <FieldSeparator />
    case "textarea":
      return (
        <Field data-invalid={invalid || undefined}>
          {label}
          <Textarea
            id={id}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            aria-invalid={invalid || undefined}
            className="min-h-24"
          />
          {extras}
        </Field>
      )
    case "select":
    case "multiselect": {
      const many = field.type === "multiselect"
      const selected = many ? ((value as string[]) ?? []) : value ? [String(value)] : []
      const labels = selected.map((v) => field.options.find((o) => o.value === v)?.label ?? v)
      return (
        <Field data-invalid={invalid || undefined}>
          {label}
          <Select
            ids={{ trigger: id }}
            collection={collection}
            multiple={many}
            closeOnSelect={!many}
            value={selected}
            onValueChange={({ value: next }) => onChange(many ? next : (next[0] ?? ""))}
            invalid={invalid}
          >
            <SelectControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder || "Choose…"}>
                  {labels.length ? labels.join(", ") : undefined}
                </SelectValue>
              </SelectTrigger>
            </SelectControl>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} item={o}>
                  <SelectItemText>{o.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {extras}
        </Field>
      )
    }
    case "radio":
      return (
        <Field data-invalid={invalid || undefined}>
          <FieldLabel>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <RadioGroup
            value={value ? String(value) : null}
            onValueChange={({ value: next }) => onChange(next ?? "")}
            className="flex flex-col gap-2 pt-1"
          >
            {field.options.map((o) => (
              <RadioGroupItem key={o.value} value={o.value}>
                {o.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
          {extras}
        </Field>
      )
    case "checkbox":
      return (
        <Field data-invalid={invalid || undefined}>
          <Field orientation="horizontal">
            <Checkbox
              ids={{ hiddenInput: id }}
              checked={!!value}
              onCheckedChange={({ checked }) => onChange(checked === true)}
              invalid={invalid}
            />
            {label}
          </Field>
          {extras}
        </Field>
      )
    case "switch":
      return (
        <Field data-invalid={invalid || undefined}>
          <Field orientation="horizontal" className="justify-between">
            {label}
            <Switch
              ids={{ hiddenInput: id }}
              checked={!!value}
              onCheckedChange={({ checked }) => onChange(checked)}
              invalid={invalid}
            />
          </Field>
          {extras}
        </Field>
      )
    case "date":
      return (
        <Field data-invalid={invalid || undefined}>
          {label}
          <DatePicker
            id={id}
            selected={value instanceof Date ? value : undefined}
            onSelect={(date) => onChange(date ?? "")}
            placeholder={field.placeholder || "Pick a date"}
            invalid={invalid}
          />
          {extras}
        </Field>
      )
    default:
      return (
        <Field data-invalid={invalid || undefined}>
          {label}
          <Input
            id={id}
            type={field.type === "phone" ? "tel" : field.type}
            inputMode={field.type === "number" ? "decimal" : field.type === "phone" ? "tel" : undefined}
            value={String(value ?? "")}
            onChange={(e) =>
              onChange(field.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value)
            }
            placeholder={field.placeholder}
            aria-invalid={invalid || undefined}
          />
          {extras}
        </Field>
      )
  }
}

import * as React from "react"
import { createListCollection } from "@ark-ui/react/collection"
import {
  AlignLeftIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  CircleDotIcon,
  CopyIcon,
  DownloadIcon,
  HashIcon,
  HeadingIcon,
  LayoutTemplateIcon,
  LinkIcon,
  ListChecksIcon,
  MailIcon,
  MinusIcon,
  PencilIcon,
  PhoneIcon,
  PilcrowIcon,
  PlusIcon,
  Redo2Icon,
  ToggleLeftIcon,
  Trash2Icon,
  TriangleAlertIcon,
  TypeIcon,
  Undo2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Canvas,
  CanvasArea,
  CanvasEmpty,
  CanvasNode,
  CanvasNodeActions,
  CanvasNodeHandle,
  CanvasNodeHeader,
  CanvasNodeTitle,
  CanvasPalette,
  CanvasPaletteItem,
  CanvasResizeHandle,
  CanvasRow,
} from "@/components/ui/canvas"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import {
  Popconfirm,
  PopconfirmCancelTrigger,
  PopconfirmConfirmTrigger,
  PopconfirmContent,
  PopconfirmDescription,
  PopconfirmFooter,
  PopconfirmHeader,
  PopconfirmIcon,
  PopconfirmTitle,
  PopconfirmTrigger,
} from "@/components/ui/popconfirm"
import {
  QueryBuilder,
  QueryBuilderAddRuleTrigger,
  QueryBuilderFieldSelect,
  QueryBuilderGroup,
  QueryBuilderGroupBody,
  QueryBuilderGroupFooter,
  QueryBuilderGroupHeader,
  QueryBuilderMatch,
  QueryBuilderOperatorSelect,
  QueryBuilderRemoveTrigger,
  QueryBuilderRule,
  QueryBuilderRuleActions,
  QueryBuilderSummary,
  QueryBuilderValueEditor,
  createGroup,
  createRule,
  isGroup,
  type QueryGroup,
} from "@/components/ui/query-builder"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useHistory } from "@/lib/history"
import { cn } from "@/lib/utils"
import { FormRenderer } from "./form-renderer"
import {
  allFields,
  applyDrop,
  conditionFields,
  createSchema,
  duplicateField,
  findProblems,
  hasOptions,
  hasPlaceholder,
  isBoolean,
  isInput,
  palette,
  paletteGroups,
  parseSchema,
  removeField,
  resizeRow,
  serializeSchema,
  slugify,
  updateField,
  type FieldOption,
  type FieldType,
  type FormField,
  type FormSchema,
} from "./model"

/* ------------------------------- Palette ---------------------------------- */

const icons: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  text: TypeIcon,
  email: MailIcon,
  url: LinkIcon,
  phone: PhoneIcon,
  number: HashIcon,
  textarea: AlignLeftIcon,
  date: CalendarDaysIcon,
  select: ChevronsUpDownIcon,
  multiselect: ListChecksIcon,
  radio: CircleDotIcon,
  checkbox: CheckSquareIcon,
  switch: ToggleLeftIcon,
  heading: HeadingIcon,
  paragraph: PilcrowIcon,
  divider: MinusIcon,
}

const typeLabel = (type: FieldType) => palette.find((p) => p.type === type)?.label ?? type

/* ---------------------------- Canvas preview ------------------------------ */

/** Static look of a field inside the builder; the real controls live in the preview. */
function FieldPreview({ field }: { field: FormField }) {
  if (field.type === "heading") return <p className="text-base font-semibold">{field.label || "Heading"}</p>
  if (field.type === "paragraph")
    return <p className="text-sm text-muted-foreground">{field.description || field.label || "Paragraph"}</p>
  if (field.type === "divider") return <FieldSeparator className="my-1" />
  const label = (
    <FieldLabel>
      {field.label || <span className="text-muted-foreground italic">Untitled</span>}
      {field.required && <span className="text-destructive"> *</span>}
    </FieldLabel>
  )
  const box = (text: string, tall = false) => (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-sm text-muted-foreground",
        tall ? "h-16 items-start py-2" : "h-8"
      )}
    >
      <span className="truncate">{text}</span>
      {(field.type === "select" || field.type === "multiselect") && (
        <ChevronsUpDownIcon className="ms-auto size-4 opacity-50" />
      )}
      {field.type === "date" && <CalendarDaysIcon className="ms-auto size-4 opacity-50" />}
    </div>
  )
  if (isBoolean(field.type)) {
    return (
      <Field orientation="horizontal" className={cn(field.type === "switch" && "justify-between")}>
        {field.type === "checkbox" && <Checkbox disabled className="opacity-100" />}
        {label}
        {field.type === "switch" && <Switch disabled className="opacity-100" />}
      </Field>
    )
  }
  if (field.type === "radio") {
    return (
      <Field>
        {label}
        <RadioGroup disabled className="flex flex-col gap-1.5 pt-1 opacity-100">
          {field.options.slice(0, 3).map((o) => (
            <RadioGroupItem key={o.value} value={o.value} className="opacity-100">
              {o.label}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </Field>
    )
  }
  return (
    <Field>
      {label}
      {box(field.placeholder || (hasOptions(field.type) ? "Choose…" : ""), field.type === "textarea")}
      {field.description && <FieldDescription>{field.description}</FieldDescription>}
    </Field>
  )
}

/* ---------------------------- Options editor ------------------------------ */

function OptionsEditor({ options, onChange }: { options: FieldOption[]; onChange: (options: FieldOption[]) => void }) {
  const update = (index: number, patch: Partial<FieldOption>) =>
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)))
  const move = (index: number, delta: number) => {
    const to = index + delta
    if (to < 0 || to >= options.length) return
    const next = [...options]
    const [item] = next.splice(index, 1)
    next.splice(to, 0, item)
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <Input
            value={option.label}
            onChange={(e) => update(index, { label: e.target.value, value: slugify(e.target.value) })}
            placeholder={`Option ${index + 1}`}
            aria-label={`Option ${index + 1} label`}
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => move(index, -1)}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Move down"
            disabled={index === options.length - 1}
            onClick={() => move(index, 1)}
          >
            <ArrowDownIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remove option"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onChange(options.filter((_, i) => i !== index))}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => {
          const n = options.length + 1
          onChange([...options, { value: `option_${n}`, label: `Option ${n}` }])
        }}
      >
        <PlusIcon /> Add option
      </Button>
    </div>
  )
}

/* ------------------------------ Conditions -------------------------------- */

/** Recursive group rendering from the query-builder parts. */
function ConditionGroup({ group }: { group: QueryGroup }) {
  return (
    <QueryBuilderGroup group={group}>
      <QueryBuilderGroupHeader>
        <QueryBuilderMatch before="Show when" after="of these are true" />
      </QueryBuilderGroupHeader>
      <QueryBuilderGroupBody>
        {group.rules.map((node) =>
          isGroup(node) ? (
            <ConditionGroup key={node.id} group={node} />
          ) : (
            <QueryBuilderRule key={node.id} rule={node} className="flex-col items-stretch gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <QueryBuilderFieldSelect />
                <QueryBuilderOperatorSelect />
                <QueryBuilderRuleActions>
                  <QueryBuilderRemoveTrigger />
                </QueryBuilderRuleActions>
              </div>
              <QueryBuilderValueEditor className="**:data-[slot=select-trigger]:w-full [&_input]:w-full" />
            </QueryBuilderRule>
          )
        )}
      </QueryBuilderGroupBody>
      <QueryBuilderGroupFooter>
        <QueryBuilderAddRuleTrigger />
      </QueryBuilderGroupFooter>
    </QueryBuilderGroup>
  )
}

/* -------------------------------- Inspector ------------------------------- */

const patternPresets = [
  { value: "none", label: "None" },
  { value: "letters", label: "Letters only", pattern: "^[A-Za-z ]+$", message: "Letters and spaces only" },
  { value: "digits", label: "Digits only", pattern: "^[0-9]+$", message: "Digits only" },
  { value: "zip", label: "ZIP code", pattern: "^[0-9]{5}(-[0-9]{4})?$", message: "Enter a ZIP code like 94103" },
  { value: "custom", label: "Custom regex" },
]
const patternCollection = createListCollection({ items: patternPresets, itemToValue: (o) => o.value })

function Inspector({
  schema,
  field,
  onChange,
  onDelete,
  onDuplicate,
  onClose,
}: {
  schema: FormSchema
  field: FormField | null
  onChange: (patch: Partial<FormField>) => void
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}) {
  const Icon = field ? icons[field.type] : null
  const presetOf = (f: FormField) =>
    !f.validation.pattern ? "none" : (patternPresets.find((p) => p.pattern === f.validation.pattern)?.value ?? "custom")
  const fields = field ? conditionFields(schema, field.id) : []
  return (
    <Drawer direction="right" open={!!field} onOpenChange={({ open }) => !open && onClose()}>
      <DrawerContent data-inspector className="w-96 max-w-full">
        {field && (
          <>
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:text-muted-foreground">
                {Icon && <Icon />}
                {typeLabel(field.type)}
              </DrawerTitle>
              <DrawerDescription>Changes apply as you type.</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <FieldGroup className="gap-6">
                <FieldSet>
                  <FieldLegend>Basics</FieldLegend>
                  <FieldGroup className="gap-3">
                    <Field>
                      <FieldLabel htmlFor="inspector-label">
                        {field.type === "paragraph" ? "Heading (optional)" : "Label"}
                      </FieldLabel>
                      <Input
                        id="inspector-label"
                        value={field.label}
                        onChange={(e) => onChange({ label: e.currentTarget.value })}
                      />
                    </Field>
                    {isInput(field.type) && (
                      <Field>
                        <FieldLabel htmlFor="inspector-name">Key</FieldLabel>
                        <Input
                          id="inspector-name"
                          value={field.name}
                          onChange={(e) => onChange({ name: slugify(e.currentTarget.value) })}
                          className="font-mono"
                        />
                        <FieldDescription>Used as the property name in submitted data.</FieldDescription>
                      </Field>
                    )}
                    {hasPlaceholder(field.type) && (
                      <Field>
                        <FieldLabel htmlFor="inspector-placeholder">Placeholder</FieldLabel>
                        <Input
                          id="inspector-placeholder"
                          value={field.placeholder}
                          onChange={(e) => onChange({ placeholder: e.currentTarget.value })}
                        />
                      </Field>
                    )}
                    {field.type !== "divider" && field.type !== "heading" && (
                      <Field>
                        <FieldLabel htmlFor="inspector-description">
                          {field.type === "paragraph" ? "Text" : "Help text"}
                        </FieldLabel>
                        <Textarea
                          id="inspector-description"
                          value={field.description}
                          onChange={(e) => onChange({ description: e.currentTarget.value })}
                          className="min-h-16"
                        />
                      </Field>
                    )}
                    {isInput(field.type) &&
                      !hasOptions(field.type) &&
                      !isBoolean(field.type) &&
                      field.type !== "date" && (
                        <Field>
                          <FieldLabel htmlFor="inspector-default">Default value</FieldLabel>
                          <Input
                            id="inspector-default"
                            type={field.type === "number" ? "number" : "text"}
                            value={String(field.defaultValue ?? "")}
                            onChange={(e) =>
                              onChange({
                                defaultValue:
                                  e.currentTarget.value === ""
                                    ? undefined
                                    : field.type === "number"
                                      ? Number(e.currentTarget.value)
                                      : e.currentTarget.value,
                              })
                            }
                          />
                        </Field>
                      )}
                    {isBoolean(field.type) && (
                      <Field orientation="horizontal" className="justify-between">
                        <FieldLabel htmlFor="inspector-default-on">On by default</FieldLabel>
                        <Switch
                          ids={{ hiddenInput: "inspector-default-on" }}
                          checked={field.defaultValue === true}
                          onCheckedChange={({ checked }) => onChange({ defaultValue: checked || undefined })}
                        />
                      </Field>
                    )}
                  </FieldGroup>
                </FieldSet>

                {hasOptions(field.type) && (
                  <>
                    <FieldSeparator />
                    <FieldSet>
                      <FieldLegend>Options</FieldLegend>
                      <OptionsEditor options={field.options} onChange={(options) => onChange({ options })} />
                    </FieldSet>
                  </>
                )}

                {isInput(field.type) && (
                  <>
                    <FieldSeparator />
                    <FieldSet>
                      <FieldLegend>Validation</FieldLegend>
                      <FieldGroup className="gap-3">
                        <Field orientation="horizontal" className="justify-between">
                          <FieldLabel htmlFor="inspector-required">Required</FieldLabel>
                          <Switch
                            ids={{ hiddenInput: "inspector-required" }}
                            checked={field.required}
                            onCheckedChange={({ checked }) => onChange({ required: checked })}
                          />
                        </Field>
                        {field.type === "number" && (
                          <div className="grid grid-cols-2 gap-3">
                            <Field>
                              <FieldLabel htmlFor="inspector-min">Min</FieldLabel>
                              <Input
                                id="inspector-min"
                                type="number"
                                value={field.validation.min ?? ""}
                                onChange={(e) =>
                                  onChange({
                                    validation: {
                                      ...field.validation,
                                      min: e.currentTarget.value === "" ? undefined : Number(e.currentTarget.value),
                                    },
                                  })
                                }
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="inspector-max">Max</FieldLabel>
                              <Input
                                id="inspector-max"
                                type="number"
                                value={field.validation.max ?? ""}
                                onChange={(e) =>
                                  onChange({
                                    validation: {
                                      ...field.validation,
                                      max: e.currentTarget.value === "" ? undefined : Number(e.currentTarget.value),
                                    },
                                  })
                                }
                              />
                            </Field>
                          </div>
                        )}
                        {["text", "textarea", "email", "url", "phone"].includes(field.type) && (
                          <div className="grid grid-cols-2 gap-3">
                            <Field>
                              <FieldLabel htmlFor="inspector-minlength">Min length</FieldLabel>
                              <Input
                                id="inspector-minlength"
                                type="number"
                                min={0}
                                value={field.validation.minLength ?? ""}
                                onChange={(e) =>
                                  onChange({
                                    validation: {
                                      ...field.validation,
                                      minLength:
                                        e.currentTarget.value === "" ? undefined : Number(e.currentTarget.value),
                                    },
                                  })
                                }
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="inspector-maxlength">Max length</FieldLabel>
                              <Input
                                id="inspector-maxlength"
                                type="number"
                                min={0}
                                value={field.validation.maxLength ?? ""}
                                onChange={(e) =>
                                  onChange({
                                    validation: {
                                      ...field.validation,
                                      maxLength:
                                        e.currentTarget.value === "" ? undefined : Number(e.currentTarget.value),
                                    },
                                  })
                                }
                              />
                            </Field>
                          </div>
                        )}
                        {["text", "textarea", "phone"].includes(field.type) && (
                          <Field>
                            <FieldLabel>Format</FieldLabel>
                            <Select
                              collection={patternCollection}
                              value={[presetOf(field)]}
                              onValueChange={({ value }) => {
                                const preset = patternPresets.find((p) => p.value === value[0])
                                if (!preset) return
                                onChange({
                                  validation: {
                                    ...field.validation,
                                    pattern:
                                      preset.value === "custom" ? (field.validation.pattern ?? "") : preset.pattern,
                                    patternMessage: preset.message,
                                  },
                                })
                              }}
                            >
                              <SelectControl>
                                <SelectTrigger className="w-full" aria-label="Format">
                                  <SelectValue>
                                    {patternPresets.find((p) => p.value === presetOf(field))?.label}
                                  </SelectValue>
                                </SelectTrigger>
                              </SelectControl>
                              <SelectContent>
                                {patternPresets.map((p) => (
                                  <SelectItem key={p.value} item={p}>
                                    <SelectItemText>{p.label}</SelectItemText>
                                    <SelectItemIndicator />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {presetOf(field) === "custom" && (
                              <>
                                <Input
                                  value={field.validation.pattern ?? ""}
                                  onChange={(e) =>
                                    onChange({ validation: { ...field.validation, pattern: e.currentTarget.value } })
                                  }
                                  placeholder="^[A-Z]{3}-[0-9]+$"
                                  aria-label="Pattern"
                                  className="font-mono"
                                />
                                <Input
                                  value={field.validation.patternMessage ?? ""}
                                  onChange={(e) =>
                                    onChange({
                                      validation: { ...field.validation, patternMessage: e.currentTarget.value },
                                    })
                                  }
                                  placeholder="Message when it doesn't match"
                                  aria-label="Pattern message"
                                />
                              </>
                            )}
                          </Field>
                        )}
                      </FieldGroup>
                    </FieldSet>
                  </>
                )}

                <FieldSeparator />
                <FieldSet>
                  <FieldLegend>Visibility</FieldLegend>
                  <FieldGroup className="gap-3">
                    <Field orientation="horizontal" className="justify-between">
                      <FieldLabel htmlFor="inspector-conditional">Only show when…</FieldLabel>
                      <Switch
                        ids={{ hiddenInput: "inspector-conditional" }}
                        checked={!!field.condition}
                        disabled={!field.condition && fields.length === 0}
                        onCheckedChange={({ checked }) =>
                          onChange({
                            condition: checked ? createGroup("all", [createRule(fields)]) : null,
                          })
                        }
                      />
                    </Field>
                    {fields.length === 0 && !field.condition && (
                      <FieldDescription>Add another input field first to reference it.</FieldDescription>
                    )}
                    {field.condition && (
                      <QueryBuilder
                        fields={fields}
                        value={field.condition}
                        onValueChange={(condition) => onChange({ condition })}
                        maxDepth={1}
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <ConditionGroup group={field.condition} />
                        <QueryBuilderSummary className="text-xs" prefix="Shown when ">
                          <span className="text-muted-foreground">Always shown until a condition is filled in.</span>
                        </QueryBuilderSummary>
                      </QueryBuilder>
                    )}
                  </FieldGroup>
                </FieldSet>
              </FieldGroup>
            </div>
            <DrawerFooter className="flex-row justify-between">
              <div className="flex gap-1">
                <Popconfirm positioning={{ placement: "top-start" }}>
                  <PopconfirmTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2Icon /> Remove
                    </Button>
                  </PopconfirmTrigger>
                  <PopconfirmContent>
                    <PopconfirmHeader>
                      <PopconfirmIcon />
                      <PopconfirmTitle>Remove "{field.label || typeLabel(field.type)}"?</PopconfirmTitle>
                      <PopconfirmDescription>
                        The field and its settings will be removed from the form.
                      </PopconfirmDescription>
                    </PopconfirmHeader>
                    <PopconfirmFooter>
                      <PopconfirmCancelTrigger />
                      <PopconfirmConfirmTrigger onConfirm={onDelete}>Remove</PopconfirmConfirmTrigger>
                    </PopconfirmFooter>
                  </PopconfirmContent>
                </Popconfirm>
                <Button variant="outline" size="sm" onClick={onDuplicate}>
                  <CopyIcon /> Duplicate
                </Button>
              </div>
              <DrawerClose asChild>
                <Button size="sm">Done</Button>
              </DrawerClose>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

/* ------------------------------- Import ----------------------------------- */

function ImportDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (schema: FormSchema) => void
}) {
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  return (
    <Dialog open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import form JSON</DialogTitle>
          <DialogDescription>Paste JSON exported from this builder. The current form is replaced.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
          placeholder='{ "title": "…", "rows": [[ … ]] }'
          aria-invalid={!!error || undefined}
          className="min-h-48 font-mono text-xs"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!text.trim()}
            onClick={() => {
              try {
                onImport(parseSchema(text))
                setText("")
                onOpenChange(false)
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not parse that JSON")
              }
            }}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------- Page ----------------------------------- */

/** Form builder demo on the Canvas primitive: drop edges decide rows vs. columns. */
export function FormBuilderPage() {
  const history = useHistory<FormSchema>(createSchema)
  const schema = history.present
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<"build" | "preview">("build")
  const [importOpen, setImportOpen] = React.useState(false)
  const selected = allFields(schema).find((f) => f.id === selectedId) ?? null
  const problems = React.useMemo(() => findProblems(schema), [schema])
  const problemsByField = React.useMemo(() => {
    const map = new Map<string, string[]>()
    for (const p of problems) map.set(p.fieldId, [...(map.get(p.fieldId) ?? []), p.message])
    return map
  }, [problems])

  const change = (patch: Partial<FormField>) => selected && history.set((s) => updateField(s, selected.id, patch))
  const remove = (id: string) => {
    history.set((s) => removeField(s, id))
    setSelectedId((current) => (current === id ? null : current))
  }
  const duplicate = (id: string) => {
    const result = duplicateField(schema, id)
    history.set(result.schema)
    setSelectedId(result.id)
  }

  const exportJson = () => {
    const json = serializeSchema(schema)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slugify(schema.title) || "form"}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Form JSON downloaded")
  }
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(serializeSchema(schema))
      toast.success("Form JSON copied")
    } catch {
      toast.error("Could not copy to the clipboard")
    }
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return
      if ((event.target as HTMLElement).closest("input, textarea, [contenteditable]")) return
      event.preventDefault()
      if (event.shiftKey) history.redo()
      else history.undo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [history])

  const fieldCount = allFields(schema).filter((f) => isInput(f.type)).length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Form builder</h2>
          <p className="text-muted-foreground">
            Drag fields from the palette. Drop above or below a field for a new row, beside it for a column. Hover a
            field to edit it, or switch to Preview to try the form.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentGroup value={mode} onValueChange={({ value }) => value && setMode(value as typeof mode)}>
            <SegmentGroupIndicator />
            <SegmentGroupItem value="build">Build</SegmentGroupItem>
            <SegmentGroupItem value="preview">Preview</SegmentGroupItem>
          </SegmentGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Undo"
                disabled={!history.canUndo}
                onClick={history.undo}
              >
                <Undo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <Kbd>⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Redo"
                disabled={!history.canRedo}
                onClick={history.redo}
              >
                <Redo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <Kbd>⇧⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <UploadIcon /> Import
          </Button>
          <Button variant="outline" onClick={copyJson} aria-label="Copy JSON" size="icon">
            <CopyIcon />
          </Button>
          <Button onClick={exportJson}>
            <DownloadIcon /> Export JSON
          </Button>
        </div>
      </div>

      {mode === "preview" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 text-card-foreground">
            <FormRenderer
              key={JSON.stringify(schema)}
              schema={schema}
              onSubmit={(values) => showSubmittedData(values)}
            />
          </div>
        </div>
      ) : (
        <Canvas onDrop={(details) => history.set((s) => applyDrop(s, details))}>
          <CanvasPalette>
            {paletteGroups.map((group) => (
              <React.Fragment key={group}>
                <p className="w-full px-1 pt-2 pb-1 text-xs font-medium text-muted-foreground first:pt-0">{group}</p>
                {palette
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = icons[item.type]
                    return (
                      <CanvasPaletteItem key={item.type} data={item.type}>
                        <Icon />
                        {item.label}
                      </CanvasPaletteItem>
                    )
                  })}
              </React.Fragment>
            ))}
          </CanvasPalette>

          <CanvasArea>
            {schema.rows.length === 0 && (
              <CanvasEmpty>
                <LayoutTemplateIcon />
                Drop a field here to start
              </CanvasEmpty>
            )}
            {schema.rows.map((row, rowIndex) => (
              <CanvasRow key={row.id}>
                {row.fields.map((field, index) => {
                  const Icon = icons[field.type]
                  const issues = problemsByField.get(field.id)
                  return (
                    <React.Fragment key={field.id}>
                      {index > 0 && (
                        <CanvasResizeHandle
                          onResize={(delta) =>
                            history.set(
                              (s) => ({
                                ...s,
                                rows: s.rows.map((r, i) => (i === rowIndex ? resizeRow(r, index - 1, delta) : r)),
                              }),
                              { commit: false }
                            )
                          }
                        />
                      )}
                      <CanvasNode
                        value={field.id}
                        width={field.width}
                        selected={field.id === selectedId}
                        data-conditional={field.condition ? "" : undefined}
                        data-problem={issues ? "" : undefined}
                        className="data-conditional:border-dashed data-problem:border-amber-500/60"
                      >
                        <CanvasNodeHeader>
                          <CanvasNodeHandle />
                          <Icon className="size-3.5 text-muted-foreground" />
                          <CanvasNodeTitle>
                            {typeLabel(field.type)}
                            {field.condition && <span className="text-muted-foreground/70"> · conditional</span>}
                          </CanvasNodeTitle>
                          {issues && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex text-amber-600 dark:text-amber-400" aria-label="Problems">
                                  <TriangleAlertIcon className="size-3.5" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{issues.join(". ")}</TooltipContent>
                            </Tooltip>
                          )}
                          <CanvasNodeActions className="has-data-[state=open]:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Edit field"
                              onClick={() => setSelectedId(field.id)}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Duplicate field"
                              onClick={() => duplicate(field.id)}
                            >
                              <CopyIcon />
                            </Button>
                            <Popconfirm>
                              <PopconfirmTrigger asChild>
                                <Button variant="ghost" size="icon-xs" aria-label="Remove field">
                                  <Trash2Icon />
                                </Button>
                              </PopconfirmTrigger>
                              <PopconfirmContent>
                                <PopconfirmHeader>
                                  <PopconfirmIcon />
                                  <PopconfirmTitle>Remove "{field.label || typeLabel(field.type)}"?</PopconfirmTitle>
                                  <PopconfirmDescription>
                                    The field and its settings will be removed from the form.
                                  </PopconfirmDescription>
                                </PopconfirmHeader>
                                <PopconfirmFooter>
                                  <PopconfirmCancelTrigger />
                                  <PopconfirmConfirmTrigger onConfirm={() => remove(field.id)}>
                                    Remove
                                  </PopconfirmConfirmTrigger>
                                </PopconfirmFooter>
                              </PopconfirmContent>
                            </Popconfirm>
                          </CanvasNodeActions>
                        </CanvasNodeHeader>
                        <FieldPreview field={field} />
                      </CanvasNode>
                    </React.Fragment>
                  )
                })}
              </CanvasRow>
            ))}
          </CanvasArea>
        </Canvas>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {fieldCount} input{fieldCount === 1 ? "" : "s"} · {schema.rows.length} row
          {schema.rows.length === 1 ? "" : "s"}
        </span>
        {problems.length > 0 && (
          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-700 dark:text-amber-300">
            <TriangleAlertIcon className="size-3" />
            {problems.length} problem{problems.length === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      <Inspector
        schema={schema}
        field={selected}
        onChange={change}
        onDelete={() => selected && remove(selected.id)}
        onDuplicate={() => selected && duplicate(selected.id)}
        onClose={() => setSelectedId(null)}
      />
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={(next) => {
          history.set(next)
          setSelectedId(null)
          toast.success("Form imported")
        }}
      />
    </div>
  )
}

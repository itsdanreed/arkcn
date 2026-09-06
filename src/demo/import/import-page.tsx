import * as React from "react"
import { formatDistanceToNowStrict } from "date-fns"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  ContactIcon,
  FileUpIcon,
  HandshakeIcon,
  KeyRoundIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  StickyNoteIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popconfirm,
  PopconfirmConfirmTrigger,
  PopconfirmCancelTrigger,
  PopconfirmContent,
  PopconfirmDescription,
  PopconfirmFooter,
  PopconfirmHeader,
  PopconfirmIcon,
  PopconfirmTitle,
  PopconfirmTrigger,
} from "@/components/ui/popconfirm"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from "@/components/ui/select"
import { Steps, StepsIndicator, StepsItem, StepsList, StepsSeparator, StepsTrigger } from "@/components/ui/steps"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress, ProgressLabel, ProgressValueText } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  addImport,
  applyResolutions,
  chooseConflict,
  currentUser,
  deleteMapping,
  detectExtraCopies,
  estimateCounts,
  matchMappings,
  mockConflicts,
  objectDefs,
  recordUse,
  sampleFiles,
  saveMapping,
  setPendingFile,
  suggestMapping,
  suggestStructure,
  takePendingFile,
  updateImport,
  useImportHistory,
  useMappings,
  type Actor,
  type Conflict,
  type CsvFile,
  type ImportRecord,
  type Instance,
  type Match,
  type ObjectId,
  type SavedMapping,
} from "./data"

const icons: Record<ObjectId, React.ReactNode> = {
  company: <Building2Icon />,
  contact: <ContactIcon />,
  deal: <HandshakeIcon />,
  note: <StickyNoteIcon />,
}

const SKIP = "__skip__"

const missingRequired = (instance: Instance) =>
  objectDefs[instance.objectId].fields.filter((f) => f.required && !instance.mapping[f.id])

const depthOf = (instances: Instance[], id: string | null): number => {
  let depth = 0
  let current = instances.find((i) => i.id === id)
  while (current?.parentId) {
    depth++
    current = instances.find((i) => i.id === current!.parentId)
  }
  return depth
}

const ordered = (instances: Instance[]) => {
  const out: Instance[] = []
  const visit = (parentId: string | null) => {
    for (const i of instances.filter((i) => i.parentId === parentId)) {
      out.push(i)
      visit(i.id)
    }
  }
  visit(null)
  return out
}

const chain = (instances: Instance[]) =>
  ordered(instances)
    .map((i) => i.label)
    .join(" → ")

const ago = (date: Date | null) => (date ? `${formatDistanceToNowStrict(date)} ago` : "never")

/* ------------------------------ file picker ------------------------------- */

function FilePicker({
  file,
  onChange,
  hint,
}: {
  file: CsvFile | null
  onChange: (file: CsvFile) => void
  hint: string
}) {
  const trigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={file ? "outline" : "default"}>
          <UploadIcon /> {file ? "Replace file" : "Choose a CSV"} <ChevronDownIcon className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sample files</DropdownMenuLabel>
          {sampleFiles.map((f) => (
            <DropdownMenuItem key={f.name} value={f.name} onSelect={() => onChange(f)}>
              <FileUpIcon />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">{f.rows.toLocaleString()} rows</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
  if (!file) {
    return (
      <div
        data-dropzone
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-muted [&_svg]:size-5 [&_svg]:text-muted-foreground">
          <FileUpIcon />
        </div>
        <div>
          <p className="font-medium">Drop a CSV here</p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
        {trigger}
      </div>
    )
  }
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted [&_svg]:size-5 [&_svg]:text-muted-foreground">
          <FileUpIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {file.size} · {file.rows.toLocaleString()} rows · {file.columns.length} columns
          </p>
        </div>
        {trigger}
      </CardContent>
    </Card>
  )
}

function FilePreview({ file }: { file: CsvFile }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {file.columns.map((c) => (
              <TableHead key={c} className="whitespace-nowrap">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {file.sample.map((row, i) => (
            <TableRow key={i}>
              {row.map((v, j) => (
                <TableCell key={j} className={cn("whitespace-nowrap", !v && "text-muted-foreground/50")}>
                  {v || "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ---------------------------- structure summary --------------------------- */

/** Read-only view of a mapping's structure: what each row becomes, nested. */
function StructureSummary({ instances, missingColumns = [] }: { instances: Instance[]; missingColumns?: string[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {ordered(instances).map((instance) => {
        const def = objectDefs[instance.objectId]
        const depth = depthOf(instances, instance.id)
        const identity = def.fields.find((f) => f.identity)!
        const mapped = def.fields.filter((f) => instance.mapping[f.id])
        return (
          <li key={instance.id} className="relative flex items-start gap-2" style={{ marginLeft: depth * 20 }}>
            {depth > 0 && <span aria-hidden className="absolute top-4 -left-3 h-px w-3 bg-border" />}
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground [&_svg]:size-3.5">
              {icons[instance.objectId]}
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-medium">
                {instance.label}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · one per {depth ? "row" : `distinct ${instance.mapping[identity.id] ?? identity.label}`}
                </span>
              </p>
              <p className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                {mapped.map((f) => {
                  const column = instance.mapping[f.id]!
                  const gone = missingColumns.includes(column)
                  return (
                    <span key={f.id} className={cn(gone && "text-destructive line-through")}>
                      {f.label}: <span className={cn(!gone && "text-foreground")}>{column}</span>
                    </span>
                  )
                })}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------ editor steps ------------------------------ */

function InstanceCard({
  instance,
  instances,
  onRemove,
  onAddChild,
}: {
  instance: Instance
  instances: Instance[]
  onRemove: () => void
  onAddChild: (objectId: ObjectId) => void
}) {
  const def = objectDefs[instance.objectId]
  const parent = instances.find((i) => i.id === instance.parentId)
  const identity = def.fields.find((f) => f.identity)!
  const identityColumn = instance.mapping[identity.id]
  const childOptions = (Object.values(objectDefs) as ObjectDefList).filter((d) => d.parents.includes(instance.objectId))
  const depth = depthOf(instances, instance.id)
  const missing = missingRequired(instance)
  return (
    <div className="relative" style={{ marginLeft: depth * 24 }}>
      {depth > 0 && <span aria-hidden className="absolute top-6 -left-4 h-px w-4 bg-border" />}
      <Card className="gap-2 py-3">
        <CardHeader className="flex flex-row items-start gap-3 px-4">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground [&_svg]:size-4">
            {icons[instance.objectId]}
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{instance.label}</CardTitle>
            <CardDescription>
              {parent
                ? `Each row adds one under the row's ${parent.label.toLowerCase()}.`
                : `Rows with the same ${identity.label.toLowerCase()} become one ${def.label.toLowerCase()}.`}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {childOptions.length > 0 && (
              <DropdownMenu positioning={{ placement: "bottom-end" }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Add something under ${instance.label}`}>
                        <PlusIcon />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Add under this</TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Each {def.label.toLowerCase()} also gets…</DropdownMenuLabel>
                    {childOptions.map((d) => (
                      <DropdownMenuItem key={d.id} value={d.id} onSelect={() => onAddChild(d.id)}>
                        {icons[d.id]} a {d.label.toLowerCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${instance.label}`} onClick={onRemove}>
                  <Trash2Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove, including anything under it</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <KeyRoundIcon className="size-3" /> Identified by{" "}
            {identityColumn ? (
              <span className="text-foreground">{identityColumn}</span>
            ) : (
              <span className="text-destructive">no column yet</span>
            )}
          </span>
          <span>
            {def.fields.filter((f) => instance.mapping[f.id]).length}/{def.fields.length} columns mapped
          </span>
          {missing.length > 0 && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <CircleAlertIcon className="size-3" /> needs {missing.map((f) => f.label.toLowerCase()).join(", ")}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
type ObjectDefList = (typeof objectDefs)[ObjectId][]

function StructureStep({
  file,
  instances,
  setInstances,
}: {
  file: CsvFile
  instances: Instance[]
  setInstances: React.Dispatch<React.SetStateAction<Instance[]>>
}) {
  const copies = detectExtraCopies(file.columns, instances)
  const used = new Set(instances.flatMap((i) => Object.values(i.mapping).filter(Boolean) as string[]))
  const addInstance = (
    objectId: ObjectId,
    parentId: string | null,
    mapping?: Record<string, string | null>,
    label?: string
  ) => {
    const def = objectDefs[objectId]
    const count = instances.filter((i) => i.objectId === objectId).length
    setInstances((prev) => [
      ...prev,
      {
        id: `i-${objectId}-${Date.now()}`,
        objectId,
        parentId,
        label: label ?? (count ? `${def.label} ${count + 1}` : def.label),
        mapping: mapping ?? suggestMapping(objectId, file.columns, new Set(used)),
      },
    ])
  }
  const remove = (id: string) =>
    setInstances((prev) => {
      const doomed = new Set([id])
      let grew = true
      while (grew) {
        grew = false
        for (const i of prev) {
          if (i.parentId && doomed.has(i.parentId) && !doomed.has(i.id)) {
            doomed.add(i.id)
            grew = true
          }
        }
      }
      return prev.filter((i) => !doomed.has(i.id))
    })
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Every row is read top to bottom through this structure. Rows that repeat an identity feed the same record, so
        one company can collect many contacts.
      </p>
      {ordered(instances).length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Start by adding what a row represents.
        </div>
      )}
      {ordered(instances).map((instance) => (
        <InstanceCard
          key={instance.id}
          instance={instance}
          instances={instances}
          onRemove={() => remove(instance.id)}
          onAddChild={(objectId) => addInstance(objectId, instance.id)}
        />
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon /> Add a top-level object
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.values(objectDefs) as ObjectDefList).map((d) => (
              <DropdownMenuItem key={d.id} value={d.id} onSelect={() => addInstance(d.id, null)}>
                {icons[d.id]} {d.plural}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {copies.map((copy) => {
          const parent = instances.find((i) => objectDefs[copy.objectId].parents.includes(i.objectId))
          return (
            <Button
              key={copy.prefix}
              variant="outline"
              size="sm"
              className="border-primary/40 bg-primary/5"
              onClick={() => addInstance(copy.objectId, parent?.id ?? null, copy.mapping, copy.label)}
            >
              <SparklesIcon className="text-primary" /> Also import the {copy.label.toLowerCase()} on each row
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function MapStep({
  file,
  instances,
  setInstances,
}: {
  file: CsvFile
  instances: Instance[]
  setInstances: React.Dispatch<React.SetStateAction<Instance[]>>
}) {
  const collection = React.useMemo(
    () =>
      createListCollection({
        items: [{ value: SKIP, label: "Don't import" }, ...file.columns.map((c) => ({ value: c, label: c }))],
        itemToString: (i) => i.label,
        itemToValue: (i) => i.value,
      }),
    [file]
  )
  const setColumn = (instanceId: string, fieldId: string, column: string | null) =>
    setInstances((prev) =>
      prev.map((i) => {
        const mapping = { ...i.mapping }
        if (column)
          for (const k of Object.keys(mapping))
            if (mapping[k] === column && (i.id !== instanceId || k !== fieldId)) mapping[k] = null
        if (i.id === instanceId) mapping[fieldId] = column
        return { ...i, mapping }
      })
    )
  const missing = instances.flatMap((i) => missingRequired(i).map((f) => `${i.label} ${f.label.toLowerCase()}`))
  const used = new Set(instances.flatMap((i) => Object.values(i.mapping).filter(Boolean) as string[]))
  const skipped = file.columns.filter((c) => !used.has(c))
  return (
    <div className="flex flex-col gap-3">
      {missing.length > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium">
              {missing.length} required {missing.length === 1 ? "column" : "columns"} missing
            </p>
            <p className="text-xs text-muted-foreground">{missing.join(", ")}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
          <CheckIcon className="size-4 text-emerald-600" />
          <p className="font-medium">All required columns are mapped</p>
        </div>
      )}
      {ordered(instances).map((instance) => {
        const def = objectDefs[instance.objectId]
        return (
          <Card key={instance.id} className="gap-1 py-3">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-base [&_svg]:size-4 [&_svg]:text-muted-foreground">
                {icons[instance.objectId]} {instance.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col px-2">
              {def.fields.map((field) => {
                const value = instance.mapping[field.id]
                const isMissing = field.required && !value
                const sample = value ? file.sample.map((r) => r[file.columns.indexOf(value)]).find(Boolean) : null
                return (
                  <div
                    key={field.id}
                    data-missing={isMissing || undefined}
                    className="grid grid-cols-1 items-center gap-x-4 gap-y-1 rounded-lg px-2 py-1.5 data-missing:bg-destructive/5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="truncate font-medium">{field.label}</span>
                        {field.required && <span className="text-destructive">*</span>}
                        {field.identity && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px] font-normal">
                                <KeyRoundIcon className="size-3" /> Identity
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Rows with the same value become one {def.label.toLowerCase()}; existing records with this
                              value are updated.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {isMissing ? "Required" : sample ? `e.g. ${sample}` : ""}
                      </p>
                    </div>
                    <Select
                      collection={collection}
                      value={[value ?? SKIP]}
                      onValueChange={({ value }) =>
                        setColumn(instance.id, field.id, value[0] && value[0] !== SKIP ? value[0] : null)
                      }
                      invalid={isMissing}
                    >
                      <SelectControl>
                        <SelectTrigger className={cn("w-full", !value && "text-muted-foreground")}>
                          <SelectValue placeholder="Choose a column" />
                        </SelectTrigger>
                      </SelectControl>
                      <SelectContent>
                        {collection.items.map((item) => (
                          <SelectItem
                            key={item.value}
                            item={item}
                            className={cn(item.value === SKIP && "text-muted-foreground")}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
      <p className="px-1 text-xs text-muted-foreground">
        {skipped.length === 0 ? "Every column is used." : `Not imported: ${skipped.join(", ")}`}
      </p>
    </div>
  )
}

/* ------------------------------ mapping editor ---------------------------- */

const editorSteps = ["Sample file", "Structure", "Columns", "Save"]

function MappingEditor({
  initial,
  onDone,
}: {
  initial: { mapping?: SavedMapping; file?: CsvFile }
  onDone: () => void
}) {
  return <MappingEditorInner initial={initial} onDone={onDone} />
}

function MappingEditorInner({
  initial,
  onDone,
}: {
  initial: { mapping?: SavedMapping; file?: CsvFile }
  onDone: () => void
}) {
  const startFile =
    initial.file ??
    (initial.mapping
      ? (sampleFiles.find((f) => f.columns.join() === initial.mapping!.columns.join()) ?? {
          name: `${initial.mapping.name} (saved columns)`,
          size: "—",
          rows: 0,
          columns: initial.mapping.columns,
          sample: [],
        })
      : null)
  const [file, setFile] = React.useState<CsvFile | null>(startFile)
  const [step, setStep] = React.useState(initial.mapping || initial.file ? 1 : 0)
  const [instances, setInstances] = React.useState<Instance[]>(
    () => initial.mapping?.instances ?? (startFile ? suggestStructure(startFile.columns) : [])
  )
  const suggestName = (f: CsvFile) =>
    f.name
      .replace(/\.csv$/, "")
      .replace(/[-_]\d{4}-\d{2}.*$/, "")
      .replace(/[-_]/g, " ")
  const [name, setName] = React.useState(initial.mapping?.name ?? (initial.file ? suggestName(initial.file) : ""))
  const missing = instances.flatMap((i) => missingRequired(i))
  const canSave = file && instances.length > 0 && missing.length === 0 && name.trim()

  const chooseFile = (f: CsvFile) => {
    setFile(f)
    setInstances(suggestStructure(f.columns))
    if (!name) setName(suggestName(f))
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" aria-label="Back to mappings" onClick={onDone}>
            <ArrowLeftIcon />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {initial.mapping ? `Edit “${initial.mapping.name}”` : "New mapping"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {initial.mapping
                ? "Changes apply to future imports only."
                : "Built from a sample file; reused by every matching import."}
            </p>
          </div>
        </div>
        <Steps
          step={step}
          onStepChange={({ step }) => setStep(step)}
          count={editorSteps.length}
          className="w-auto sm:max-w-lg"
        >
          <StepsList>
            {editorSteps.map((title, index) => (
              <StepsItem key={title} index={index}>
                <StepsTrigger disabled={index > 0 && !file}>
                  <StepsIndicator />
                  <span className="hidden sm:inline">{title}</span>
                </StepsTrigger>
                <StepsSeparator />
              </StepsItem>
            ))}
          </StepsList>
        </Steps>
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <FilePicker
            file={file}
            onChange={chooseFile}
            hint="A small sample is enough. Its headers define which files this mapping will recognise."
          />
          {file && file.sample.length > 0 && <FilePreview file={file} />}
        </div>
      )}
      {step === 1 && file && <StructureStep file={file} instances={instances} setInstances={setInstances} />}
      {step === 2 && file && <MapStep file={file} instances={instances} setInstances={setInstances} />}
      {step === 3 && file && (
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="mapping-name">Mapping name</FieldLabel>
            <Input
              id="mapping-name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="e.g. CRM export"
              className="max-w-sm"
            />
            <FieldDescription>
              Files whose headers match these {file.columns.length} columns will use this mapping automatically.
            </FieldDescription>
          </Field>
          <Card className="gap-3">
            <CardHeader>
              <CardTitle>Each row becomes</CardTitle>
              <CardDescription>{chain(instances)}</CardDescription>
            </CardHeader>
            <CardContent>
              <StructureSummary instances={instances} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (step === 0 ? onDone() : setStep(step - 1))}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!file || (step === 1 && instances.length === 0) || (step === 2 && missing.length > 0)}
          >
            {editorSteps[step + 1]} <ArrowRightIcon />
          </Button>
        ) : (
          <Button
            disabled={!canSave}
            onClick={() => {
              saveMapping({ id: initial.mapping?.id, name: name.trim(), columns: file!.columns, instances })
              toast.success(`Mapping “${name.trim()}” saved`)
              onDone()
            }}
          >
            Save mapping
          </Button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ mappings tab ------------------------------ */

function MappingsTab({ navigate }: { navigate: (to: string) => void }) {
  const mappings = useMappings()
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          A mapping remembers a file's headers and what to build from them. Imports pick the best match automatically.
        </p>
        <Button onClick={() => navigate("/import/mappings/new")}>
          <PlusIcon /> New mapping
        </Button>
      </div>
      {mappings.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No mappings yet</EmptyTitle>
            <EmptyDescription>Create one from a sample file and every matching import will reuse it.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {mappings.map((m) => (
        <Card key={m.id} className="gap-3 py-4">
          <CardHeader className="flex flex-row items-start gap-3 px-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base">{m.name}</CardTitle>
              <CardDescription>{chain(m.instances)}</CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${m.name}`}
                onClick={() => navigate(`/import/mappings/${m.id}`)}
              >
                <PencilIcon />
              </Button>
              <Popconfirm>
                <PopconfirmTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Delete ${m.name}`}>
                    <Trash2Icon />
                  </Button>
                </PopconfirmTrigger>
                <PopconfirmContent>
                  <PopconfirmHeader>
                    <PopconfirmIcon />
                    <PopconfirmTitle>Delete “{m.name}”?</PopconfirmTitle>
                    <PopconfirmDescription>Files that matched it will need a new mapping.</PopconfirmDescription>
                  </PopconfirmHeader>
                  <PopconfirmFooter>
                    <PopconfirmCancelTrigger />
                    <PopconfirmConfirmTrigger onConfirm={() => deleteMapping(m.id)}>Delete</PopconfirmConfirmTrigger>
                  </PopconfirmFooter>
                </PopconfirmContent>
              </Popconfirm>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-x-4 gap-y-1 px-4 text-xs text-muted-foreground">
            <span>{m.columns.length} columns</span>
            <span>
              Used {m.uses} {m.uses === 1 ? "time" : "times"}
            </span>
            <span>Last used {ago(m.lastUsedAt)}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* -------------------------------- import tab ------------------------------ */

const importSteps = ["Select file", "Mapping", "Status"]

function ActorChip({ actor }: { actor: Actor }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className="size-6">
        {actor.avatar && <AvatarImage src={actor.avatar} alt={actor.name} />}
        <AvatarFallback className="text-[10px]">{actor.initials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{actor.name}</span>
    </span>
  )
}

/** Simulated run: progress fills, then per-object results appear and the history record completes. */
function ImportStatus({
  record,
  file,
  match,
  onReset,
  onViewResults,
}: {
  record: ImportRecord
  file: CsvFile
  match: Match
  onReset: () => void
  onViewResults: () => void
}) {
  const [progress, setProgress] = React.useState(0)
  const done = progress >= 100
  React.useEffect(() => {
    const timer = setInterval(() => setProgress((p) => Math.min(100, p + 9 + Math.random() * 12)), 250)
    return () => clearInterval(timer)
  }, [])
  // Complete exactly once: completing bumps the mapping store, which recomputes `match`.
  const latest = React.useRef({ file, match, record })
  React.useEffect(() => {
    latest.current = { file, match, record }
  })
  const completed = React.useRef(false)
  React.useEffect(() => {
    if (!done || completed.current) return
    completed.current = true
    const { file, match, record } = latest.current
    const counts = estimateCounts(match.mapping.instances, file)
    updateImport(record.id, {
      status: "completed",
      ...mockConflicts(record.id, file.rows),
      results: ordered(match.mapping.instances).map((i) => {
        const total = counts[i.id] ?? 0
        const updated = Math.round(total * (i.parentId ? 0.15 : 0.35))
        const plural = i.label === objectDefs[i.objectId].label ? objectDefs[i.objectId].plural : `${i.label}s`
        return { label: i.label, plural, created: total - updated, updated }
      }),
    })
    recordUse(match.mapping.id)
    toast.success(`Imported ${file.rows.toLocaleString()} rows from ${file.name}`)
  }, [done])
  const live = useImportHistory().find((r) => r.id === record.id)
  const results = live?.results ?? []
  const conflicts = live?.conflicts.length ?? 0
  const skipped = live?.skipped.length ?? 0
  const processed = Math.round((file.rows * Math.min(progress, 100)) / 100)

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {done ? (
              <CheckIcon className="size-4 text-emerald-600" />
            ) : (
              <span className="size-2 animate-pulse rounded-full bg-primary" />
            )}
            {done ? "Import complete" : "Importing…"}
          </CardTitle>
          <CardDescription>
            {file.name} · {match.mapping.name} · started by <ActorChip actor={record.actor} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={Math.min(progress, 100)}>
            <div className="flex items-center justify-between text-sm">
              <ProgressLabel>
                {done ? "All rows processed" : `${processed.toLocaleString()} of ${file.rows.toLocaleString()} rows`}
              </ProgressLabel>
              <ProgressValueText />
            </div>
          </Progress>
          {done && (
            <div className="grid gap-3 sm:grid-cols-3">
              {results.map((r) => (
                <div key={r.label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                  <p className="text-xl font-bold tabular-nums">{(r.created + r.updated).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {r.created.toLocaleString()} new · {r.updated.toLocaleString()} updated
                  </p>
                </div>
              ))}
            </div>
          )}
          {done && (conflicts > 0 || skipped > 0) && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium">
                  {conflicts > 0 && `${conflicts} ${conflicts === 1 ? "conflict needs" : "conflicts need"} a decision`}
                  {conflicts > 0 && skipped > 0 && " · "}
                  {skipped > 0 && `${skipped} ${skipped === 1 ? "row was" : "rows were"} skipped`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Existing records were kept as they are until you choose which values win.
                </p>
              </div>
            </div>
          )}
          {done && (
            <p className="text-xs text-muted-foreground">
              You can undo this import from History for the next 24 hours.
            </p>
          )}
        </CardContent>
      </Card>
      {done && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>
            Import another file
          </Button>
          <Button onClick={onViewResults}>View results{conflicts > 0 ? ` · ${conflicts} conflicts` : ""}</Button>
        </div>
      )}
    </div>
  )
}

function ImportTab({
  onCreateMapping,
  onViewResults,
}: {
  onCreateMapping: (file: CsvFile) => void
  onViewResults: (id: string) => void
}) {
  const mappings = useMappings()
  const [step, setStep] = React.useState(0)
  const [file, setFile] = React.useState<CsvFile | null>(null)
  const [chosenId, setChosenId] = React.useState<string | null>(null)
  const [record, setRecord] = React.useState<ImportRecord | null>(null)

  const matches = React.useMemo(() => (file ? matchMappings(file, mappings) : []), [file, mappings])
  const best = matches[0]?.score >= 0.6 ? matches[0] : null
  const match: Match | null = (chosenId ? matches.find((m) => m.mapping.id === chosenId) : null) ?? best
  const mappingCollection = React.useMemo(
    () =>
      createListCollection({
        items: matches.map((m) => ({
          value: m.mapping.id,
          label: `${m.mapping.name} · ${Math.round(m.score * 100)}%`,
        })),
        itemToString: (i) => i.label,
        itemToValue: (i) => i.value,
      }),
    [matches]
  )
  const requiredBroken = match
    ? match.mapping.instances.flatMap((i) =>
        objectDefs[i.objectId].fields
          .filter((f) => f.required && i.mapping[f.id] && match.missing.includes(i.mapping[f.id]!))
          .map((f) => `${i.label} ${f.label.toLowerCase()}`)
      )
    : []
  const counts = match && file ? estimateCounts(match.mapping.instances, file) : {}

  const reset = () => {
    setStep(0)
    setFile(null)
    setChosenId(null)
    setRecord(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Steps
        step={step}
        onStepChange={({ step: next }) => next < step && setStep(next)}
        count={importSteps.length}
        className="sm:max-w-md"
      >
        <StepsList>
          {importSteps.map((title, index) => (
            <StepsItem key={title} index={index}>
              <StepsTrigger disabled={index > step || !!record}>
                <StepsIndicator />
                <span className="hidden sm:inline">{title}</span>
              </StepsTrigger>
              <StepsSeparator />
            </StepsItem>
          ))}
        </StepsList>
      </Steps>

      {step === 0 && (
        <>
          <FilePicker
            file={file}
            onChange={(f) => {
              setFile(f)
              setChosenId(null)
            }}
            hint="We'll recognise the headers and pick a saved mapping for you."
          />
          {file && (
            <Card className="gap-3">
              <CardHeader>
                <CardTitle>First rows</CardTitle>
                <CardDescription>A quick look before anything is mapped.</CardDescription>
              </CardHeader>
              <CardContent>
                <FilePreview file={file} />
              </CardContent>
            </Card>
          )}
          <div className="flex justify-end">
            <Button disabled={!file} onClick={() => setStep(1)}>
              Detect mapping <ArrowRightIcon />
            </Button>
          </div>
        </>
      )}

      {step === 1 && file && (
        <>
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {match ? (
                  <>
                    <SparklesIcon className="size-4 text-primary" /> Recognised as “{match.mapping.name}”
                  </>
                ) : (
                  <>
                    <CircleAlertIcon className="size-4 text-amber-600" /> No saved mapping fits this file
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {match
                  ? `${match.matched.length} of ${match.matched.length + match.missing.length} expected columns found${match.extra.length ? `; ${match.extra.length} extra ${match.extra.length === 1 ? "column" : "columns"} ignored` : ""}.`
                  : matches[0]
                    ? `The closest is “${matches[0].mapping.name}” at ${Math.round(matches[0].score * 100)}%. Create a mapping from this file instead.`
                    : "Create a mapping from this file to import it."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {matches.length > 0 && (
                  <Select
                    collection={mappingCollection}
                    value={match ? [match.mapping.id] : []}
                    onValueChange={({ value }) => setChosenId(value[0] ?? null)}
                    positioning={{ sameWidth: false }}
                  >
                    <SelectControl>
                      <SelectTrigger className="min-w-56">
                        <SelectValue placeholder="Pick a mapping" />
                      </SelectTrigger>
                    </SelectControl>
                    <SelectContent>
                      {mappingCollection.items.map((item) => (
                        <SelectItem key={item.value} item={item}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant={match ? "ghost" : "default"}
                  size={match ? "sm" : "default"}
                  onClick={() => onCreateMapping(file)}
                >
                  <PlusIcon /> {match ? "Create a new mapping instead" : "Create a mapping from this file"}
                </Button>
              </div>
              {match && (
                <>
                  {match.missing.length > 0 && (
                    <div
                      className={cn(
                        "flex items-start gap-2 rounded-lg border p-3 text-sm",
                        requiredBroken.length
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      )}
                    >
                      <CircleAlertIcon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          requiredBroken.length ? "text-destructive" : "text-amber-600"
                        )}
                      />
                      <div>
                        <p className="font-medium">
                          {requiredBroken.length
                            ? "This file is missing required columns"
                            : "Some columns the mapping expects aren't in this file"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {requiredBroken.length
                            ? `${requiredBroken.join(", ")} would be empty. Pick another mapping or edit this one.`
                            : `Missing: ${match.missing.join(", ")}. Those fields are left blank.`}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-2 text-sm font-medium">Each row becomes</p>
                    <StructureSummary instances={match.mapping.instances} missingColumns={match.missing} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {ordered(match.mapping.instances).map((i) => (
                      <div key={i.id} className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">{i.label}</p>
                        <p className="text-xl font-bold tabular-nums">≈ {(counts[i.id] ?? 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estimated from the first {file.sample.length} rows. Records whose identity already exists are
                    updated, never duplicated. Imports can be undone for 24 hours.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            {match && (
              <Button
                disabled={requiredBroken.length > 0}
                onClick={() => {
                  setRecord(
                    addImport({
                      file: file.name,
                      rows: file.rows,
                      mappingId: match.mapping.id,
                      mappingName: match.mapping.name,
                      actor: currentUser,
                    })
                  )
                  setStep(2)
                }}
              >
                Import {file.rows.toLocaleString()} rows <ArrowRightIcon />
              </Button>
            )}
          </div>
        </>
      )}

      {step === 2 && file && match && record && (
        <ImportStatus
          record={record}
          file={file}
          match={match}
          onReset={reset}
          onViewResults={() => onViewResults(record.id)}
        />
      )}
    </div>
  )
}

/* ------------------------------- history tab ------------------------------ */

const statusStyles: Record<ImportRecord["status"], string> = {
  running: "border-primary/40 text-primary",
  completed: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
  failed: "border-destructive/40 text-destructive",
  undone: "text-muted-foreground",
}

function HistoryTab({ onView }: { onView: (id: string) => void }) {
  const history = useImportHistory()
  const [now] = React.useState(() => Date.now())
  const canUndo = (r: ImportRecord) => r.status === "completed" && now - r.startedAt.getTime() < 24 * 3_600_000
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Every import, who ran it, and what it changed. Completed imports can be undone for 24 hours.
      </p>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Mapping</TableHead>
              <TableHead>By</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attention</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => onView(r.id)}>
                <TableCell className="font-medium whitespace-nowrap">{r.file}</TableCell>
                <TableCell className="whitespace-nowrap">{r.mappingName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <ActorChip actor={r.actor} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{ago(r.startedAt)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.rows.toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.status === "failed"
                    ? r.error
                    : r.results.length
                      ? r.results
                          .map(
                            (x) =>
                              `${(x.created + x.updated).toLocaleString()} ${(x.created + x.updated === 1 ? x.label : x.plural).toLowerCase()}`
                          )
                          .join(" · ")
                      : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", statusStyles[r.status])}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {(() => {
                    const open = r.conflicts.filter((c) => !c.resolvedAt).length
                    return open > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <CircleAlertIcon className="size-3.5" /> {open} {open === 1 ? "conflict" : "conflicts"}
                      </span>
                    ) : r.skipped.length > 0 ? (
                      <span className="text-muted-foreground">{r.skipped.length} skipped</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {canUndo(r) && (
                    <Popconfirm positioning={{ placement: "top-end" }}>
                      <PopconfirmTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Undo
                        </Button>
                      </PopconfirmTrigger>
                      <PopconfirmContent>
                        <PopconfirmHeader>
                          <PopconfirmIcon />
                          <PopconfirmTitle>Undo this import?</PopconfirmTitle>
                          <PopconfirmDescription>
                            Records it created are removed and updated ones are restored.
                          </PopconfirmDescription>
                        </PopconfirmHeader>
                        <PopconfirmFooter>
                          <PopconfirmCancelTrigger />
                          <PopconfirmConfirmTrigger
                            onConfirm={() => {
                              updateImport(r.id, { status: "undone" })
                              toast.success(`Undid import of ${r.file}`)
                            }}
                          >
                            Undo import
                          </PopconfirmConfirmTrigger>
                        </PopconfirmFooter>
                      </PopconfirmContent>
                    </Popconfirm>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ------------------------------- results view ----------------------------- */

function ValueOption({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string
  value: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md border px-2.5 py-1.5 text-start text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border"
      )}
    >
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      <span className="truncate font-medium">{value || "—"}</span>
    </button>
  )
}

function ConflictCard({ conflict, recordId }: { conflict: Conflict; recordId: string }) {
  const resolved = !!conflict.resolvedAt
  const chosen = conflict.fields.filter((f) => f.choice).length
  return (
    <Card data-resolved={resolved || undefined} className="gap-3 py-3 data-resolved:opacity-70">
      <CardHeader className="flex flex-row items-center gap-3 px-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="font-normal">
              {conflict.objectLabel}
            </Badge>
            <span className="truncate">{conflict.identity}</span>
            <span className="text-xs font-normal text-muted-foreground">row {conflict.row}</span>
          </CardTitle>
          <CardDescription>
            {resolved
              ? `Resolved · ${conflict.fields.filter((f) => f.choice === "imported").length} of ${conflict.fields.length} fields updated`
              : `${conflict.fields.length} ${conflict.fields.length === 1 ? "field differs" : "fields differ"} · ${chosen}/${conflict.fields.length} decided`}
          </CardDescription>
        </div>
        {!resolved && (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={() => chooseConflict(recordId, conflict.id, "existing")}>
              Keep all
            </Button>
            <Button variant="outline" size="sm" onClick={() => chooseConflict(recordId, conflict.id, "imported")}>
              Use imported
            </Button>
          </div>
        )}
        {resolved && <CheckIcon className="size-4 text-emerald-600" />}
      </CardHeader>
      {!resolved && (
        <CardContent className="flex flex-col gap-2 px-4">
          {conflict.fields.map((f) => (
            <div
              key={f.field}
              role="radiogroup"
              aria-label={f.field}
              className="grid items-center gap-2 sm:grid-cols-[7rem_1fr_1fr]"
            >
              <span className="text-xs font-medium text-muted-foreground">{f.field}</span>
              <ValueOption
                label="Existing"
                value={f.existing}
                selected={f.choice === "existing"}
                onSelect={() => chooseConflict(recordId, conflict.id, "existing", f.field)}
              />
              <ValueOption
                label="Imported"
                value={f.imported}
                selected={f.choice === "imported"}
                onSelect={() => chooseConflict(recordId, conflict.id, "imported", f.field)}
              />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

function ResultsPage({ record, onBack }: { record: ImportRecord; onBack: () => void }) {
  const open = record.conflicts.filter((c) => !c.resolvedAt)
  const ready = open.filter((c) => c.fields.every((f) => f.choice))
  const [section, setSection] = React.useState<"summary" | "conflicts" | "skipped">(
    open.length ? "conflicts" : "summary"
  )
  const totals = record.results.reduce(
    (acc, r) => ({ created: acc.created + r.created, updated: acc.updated + r.updated }),
    { created: 0, updated: 0 }
  )

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon-sm" aria-label="Back to history" onClick={onBack}>
          <ArrowLeftIcon />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Import details</p>
          <h2 className="truncate text-xl font-bold tracking-tight">{record.file}</h2>
          <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>{record.mappingName}</span>·<ActorChip actor={record.actor} />·<span>{ago(record.startedAt)}</span>·
            <Badge variant="outline" className={cn("capitalize", statusStyles[record.status])}>
              {record.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Rows", value: record.rows },
          { label: "Created", value: totals.created },
          { label: "Updated", value: totals.updated },
          { label: "Skipped", value: record.skipped.length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold tabular-nums">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentGroup value={section} onValueChange={({ value }) => value && setSection(value as typeof section)}>
          <SegmentGroupIndicator />
          <SegmentGroupItem value="summary">Summary</SegmentGroupItem>
          <SegmentGroupItem value="conflicts">
            Conflicts
            {open.length > 0 && <Badge className="ms-1 h-4 min-w-4 px-1 text-[10px]">{open.length}</Badge>}
          </SegmentGroupItem>
          <SegmentGroupItem value="skipped">
            Skipped{record.skipped.length ? ` (${record.skipped.length})` : ""}
          </SegmentGroupItem>
        </SegmentGroup>
        {section === "conflicts" && open.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => open.forEach((c) => chooseConflict(record.id, c.id, "imported"))}
            >
              Use imported for all
            </Button>
            <Button
              size="sm"
              disabled={ready.length === 0}
              onClick={() => {
                const n = applyResolutions(record.id)
                toast.success(`Applied ${n} ${n === 1 ? "resolution" : "resolutions"}`)
              }}
            >
              Apply {ready.length > 0 ? `${ready.length} of ${open.length}` : ""}
            </Button>
          </div>
        )}
      </div>

      {section === "summary" && (
        <Card className="gap-3">
          <CardHeader>
            <CardTitle>What changed</CardTitle>
            <CardDescription>
              {record.status === "undone"
                ? "This import was undone; the counts below are what it had changed."
                : "Per object, how many records were created or updated in place."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Object</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {record.results.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell className="font-medium">{r.plural}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.created.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.updated.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(r.created + r.updated).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {record.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {record.error ?? "Nothing was written."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {section === "conflicts" && (
        <div className="flex flex-col gap-3">
          {record.conflicts.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No conflicts</EmptyTitle>
                <EmptyDescription>Every matched record agreed with the file.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {open.length > 0 && (
            <p className="text-sm text-muted-foreground">
              These rows matched an existing record but disagree on some fields. Pick the value that should win;
              existing values stay until you apply.
            </p>
          )}
          {[...open, ...record.conflicts.filter((c) => c.resolvedAt)].map((c) => (
            <ConflictCard key={c.id} conflict={c} recordId={record.id} />
          ))}
        </div>
      )}

      {section === "skipped" && (
        <Card className="gap-3">
          <CardHeader>
            <CardTitle>Skipped rows</CardTitle>
            <CardDescription>
              Rows that could not be imported and why. Fix them in the file and import again; matched records are
              updated, not duplicated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {record.skipped.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rows were skipped.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.skipped.map((r) => (
                    <TableRow key={r.row}>
                      <TableCell className="tabular-nums">{r.row}</TableCell>
                      <TableCell>{r.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* --------------------------------- page ----------------------------------- */

/** Import mock: reusable mappings, applied automatically to matching imports.
 *  Routes: /import · /import/mappings · /import/mappings/new · /import/mappings/:id ·
 *  /import/history · /import/history/:id (each is linkable, e.g. from notifications). */
export function ImportPage({ path, navigate }: { path: string; navigate: (to: string) => void }) {
  const segments = path
    .split("?")[0]
    .replace(/^\/import\/?/, "")
    .split("/")
    .filter(Boolean)
  const history = useImportHistory()
  const mappings = useMappings()
  const [pending] = React.useState(() => takePendingFile())

  if (segments[0] === "history" && segments[1]) {
    const record = history.find((r) => r.id === segments[1])
    if (!record) {
      return (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyTitle>Import not found</EmptyTitle>
            <EmptyDescription>It may have been removed.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => navigate("/import/history")}>
            Back to history
          </Button>
        </Empty>
      )
    }
    return <ResultsPage key={record.id} record={record} onBack={() => navigate("/import/history")} />
  }

  if (segments[0] === "mappings" && segments[1]) {
    const mapping = segments[1] === "new" ? undefined : mappings.find((m) => m.id === segments[1])
    if (segments[1] !== "new" && !mapping) {
      return (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyTitle>Mapping not found</EmptyTitle>
            <EmptyDescription>It may have been deleted.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => navigate("/import/mappings")}>
            Back to mappings
          </Button>
        </Empty>
      )
    }
    return (
      <MappingEditor
        key={segments[1]}
        initial={{ mapping, file: pending ?? undefined }}
        onDone={() => navigate("/import/mappings")}
      />
    )
  }

  const tab = segments[0] === "mappings" ? "mappings" : segments[0] === "history" ? "history" : "import"
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Import</h2>
          <p className="text-muted-foreground">
            Upload a CSV and we apply the mapping that fits its headers. Mappings are built once from a sample and
            reused.
          </p>
        </div>
        <SegmentGroup
          value={tab}
          onValueChange={({ value }) => navigate(value === "import" ? "/import" : `/import/${value}`)}
        >
          <SegmentGroupIndicator />
          <SegmentGroupItem value="import">Import</SegmentGroupItem>
          <SegmentGroupItem value="mappings">Mappings</SegmentGroupItem>
          <SegmentGroupItem value="history">History</SegmentGroupItem>
        </SegmentGroup>
      </div>
      {tab === "import" ? (
        <ImportTab
          onCreateMapping={(file) => {
            setPendingFile(file)
            navigate("/import/mappings/new")
          }}
          onViewResults={(id) => navigate(`/import/history/${id}`)}
        />
      ) : tab === "mappings" ? (
        <MappingsTab navigate={navigate} />
      ) : (
        <HistoryTab onView={(id) => navigate(`/import/history/${id}`)} />
      )}
    </div>
  )
}

import * as React from "react"
import { ark } from "@ark-ui/react"
import { createListCollection } from "@ark-ui/react/collection"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"

/**
 * QueryBuilder — a compositional filter builder that reads like a sentence.
 *
 * Every group opens with "Match all / any of the following" and each condition
 * reads field → plain-language operator → value. Incomplete conditions (no
 * value yet) are flagged with `data-incomplete` and dropped by `pruneQuery`
 * instead of erroring, negation lives in the operator wording ("is not",
 * "does not contain") and order is irrelevant, so there is no NOT toggle and
 * no drag-reorder to learn.
 *
 * The consumer owns the query tree (`value`/`onValueChange`) and renders the
 * parts recursively; the root applies all edits (add, remove, update). The
 * primitive never interprets the tree: turning it into SQL, an API filter, or
 * an in-memory predicate is the consumer's job (see `src/demo/query-builder`).
 *
 * Anatomy:
 *   QueryBuilder
 *     QueryBuilderGroup          { group }
 *       QueryBuilderGroupHeader
 *         QueryBuilderMatch      "all" | "any" select
 *         QueryBuilderRemoveTrigger (nested groups)
 *       QueryBuilderGroupBody
 *         QueryBuilderRule       { rule } → FieldSelect + OperatorSelect + ValueEditor + RuleActions
 *         QueryBuilderGroup      (nested)
 *       QueryBuilderGroupFooter
 *         QueryBuilderAddRuleTrigger / QueryBuilderAddGroupTrigger
 *     QueryBuilderSummary        natural-language sentence
 */

/* ---------------------------------------------------------------------------
 * Model
 * ------------------------------------------------------------------------- */

type QueryFieldType = "text" | "number" | "date" | "boolean" | "select"
type QueryOption = { value: string; label: string }
type QueryField = {
  name: string
  label: string
  type?: QueryFieldType
  /** For `select` fields. */
  options?: QueryOption[]
  /** Restrict the operators offered (names from `operators`). */
  operators?: string[]
  /** Placeholder for the value editor. */
  placeholder?: string
}
/** How many values an operator takes. */
type QueryArity = "none" | "one" | "two" | "many"
type QueryOperator = { name: string; label: string; arity: QueryArity; types: QueryFieldType[] }

type QueryRule = { id: string; field: string; operator: string; value?: unknown }
type QueryGroup = { id: string; match: "all" | "any"; rules: QueryNode[] }
type QueryNode = QueryRule | QueryGroup

const isGroup = (node: QueryNode): node is QueryGroup => "rules" in node

let seq = 0
const uid = (prefix: string) => `${prefix}-${(seq++).toString(36)}${Date.now().toString(36).slice(-3)}`

const op = (name: string, label: string, arity: QueryArity, types: QueryFieldType[]): QueryOperator => ({
  name,
  label,
  arity,
  types,
})

/** Plain-language operators; negation is part of the wording. */
const defaultOperators: QueryOperator[] = [
  op("is", "is", "one", ["text", "number", "date", "select"]),
  op("isNot", "is not", "one", ["text", "number", "date", "select"]),
  op("contains", "contains", "one", ["text"]),
  op("doesNotContain", "does not contain", "one", ["text"]),
  op("startsWith", "starts with", "one", ["text"]),
  op("endsWith", "ends with", "one", ["text"]),
  op("greaterThan", "is greater than", "one", ["number"]),
  op("lessThan", "is less than", "one", ["number"]),
  op("atLeast", "is at least", "one", ["number"]),
  op("atMost", "is at most", "one", ["number"]),
  op("before", "is before", "one", ["date"]),
  op("after", "is after", "one", ["date"]),
  op("between", "is between", "two", ["number", "date"]),
  op("anyOf", "is any of", "many", ["select", "text"]),
  op("noneOf", "is none of", "many", ["select", "text"]),
  op("isTrue", "is true", "none", ["boolean"]),
  op("isFalse", "is false", "none", ["boolean"]),
  op("isEmpty", "is empty", "none", ["text", "number", "date", "select"]),
  op("isNotEmpty", "is not empty", "none", ["text", "number", "date", "select"]),
]

function operatorsFor(field: QueryField | undefined, operators: QueryOperator[]) {
  if (!field) return []
  const type = field.type ?? "text"
  const allowed = operators.filter((o) => o.types.includes(type))
  return field.operators
    ? (field.operators.map((n) => allowed.find((o) => o.name === n)).filter(Boolean) as QueryOperator[])
    : allowed
}

function createRule(fields: QueryField[], operators = defaultOperators, patch?: Partial<QueryRule>): QueryRule {
  const field = fields.find((f) => f.name === patch?.field) ?? fields[0]
  const operator = patch?.operator ?? operatorsFor(field, operators)[0]?.name ?? ""
  return { id: uid("rule"), field: field?.name ?? "", operator, value: undefined, ...patch }
}

function createGroup(match: QueryGroup["match"] = "all", rules: QueryNode[] = []): QueryGroup {
  return { id: uid("group"), match, rules }
}

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)

/** A rule counts once it has everything its operator needs. */
function isComplete(rule: QueryRule, operators = defaultOperators) {
  const operator = operators.find((o) => o.name === rule.operator)
  if (!operator || !rule.field) return false
  if (operator.arity === "none") return true
  if (operator.arity === "two") return Array.isArray(rule.value) && hasValue(rule.value[0]) && hasValue(rule.value[1])
  return hasValue(rule.value)
}

/* Tree edits (pure) */

function mapTree(node: QueryGroup, fn: (node: QueryNode) => QueryNode | null): QueryGroup {
  const rules = node.rules
    .map((child) => {
      const next = fn(child)
      if (next === null) return null
      return isGroup(next) ? mapTree(next, fn) : next
    })
    .filter((n): n is QueryNode => n !== null)
  return { ...node, rules }
}

function updateNode(root: QueryGroup, id: string, patch: Partial<QueryRule> | Partial<QueryGroup>): QueryGroup {
  if (root.id === id) return { ...root, ...(patch as Partial<QueryGroup>) }
  return mapTree(root, (n) => (n.id === id ? ({ ...n, ...patch } as QueryNode) : n))
}

function removeNode(root: QueryGroup, id: string): QueryGroup {
  return mapTree(root, (n) => (n.id === id ? null : n))
}

function insertNode(root: QueryGroup, groupId: string, node: QueryNode): QueryGroup {
  if (root.id === groupId) return { ...root, rules: [...root.rules, node] }
  return mapTree(root, (n) => (isGroup(n) && n.id === groupId ? { ...n, rules: [...n.rules, node] } : n))
}

/* ---------------------------------------------------------------------------
 * Describing the tree (presentation only; interpreting it is the consumer's job)
 * ------------------------------------------------------------------------- */

type DescribeOptions = { fields: QueryField[]; operators?: QueryOperator[] }

function valueLabel(rule: QueryRule, field: QueryField | undefined): string {
  const label = (v: unknown) => field?.options?.find((o) => o.value === String(v))?.label ?? String(v)
  if (Array.isArray(rule.value)) {
    const values = rule.value.map(label)
    if (rule.operator === "between") return `${values[0]} and ${values[1]}`
    if (values.length <= 3) return values.join(", ")
    return `${values.slice(0, 2).join(", ")} and ${values.length - 2} more`
  }
  return label(rule.value)
}

/** Natural-language sentence, e.g. "Status is Active and Created is after 2026-01-01". */
function describeQuery(
  group: QueryGroup,
  { fields, operators = defaultOperators }: DescribeOptions,
  depth = 0
): string {
  const parts = group.rules
    .map((n) => {
      if (isGroup(n)) return describeQuery(n, { fields, operators }, depth + 1)
      if (!isComplete(n, operators)) return ""
      const field = fields.find((f) => f.name === n.field)
      const operator = operators.find((o) => o.name === n.operator)
      const value = operator?.arity === "none" ? "" : ` ${valueLabel(n, field)}`
      return `${field?.label ?? n.field} ${operator?.label ?? n.operator}${value}`
    })
    .filter(Boolean)
  if (!parts.length) return ""
  const joined = parts.join(group.match === "all" ? " and " : " or ")
  return depth > 0 && parts.length > 1 ? `(${joined})` : joined
}

/** The tree without incomplete rules and empty groups: what an interpreter should consume. */
function pruneQuery(group: QueryGroup, operators = defaultOperators): QueryGroup {
  const rules = group.rules
    .map((n) => (isGroup(n) ? pruneQuery(n, operators) : isComplete(n, operators) ? n : null))
    .filter((n): n is QueryNode => n !== null && (!isGroup(n) || n.rules.length > 0))
  return { ...group, rules }
}

/* ---------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------- */

type QueryBuilderContextValue = {
  fields: QueryField[]
  operators: QueryOperator[]
  value: QueryGroup
  disabled: boolean
  maxDepth: number
  addRule: (groupId: string, patch?: Partial<QueryRule>) => void
  addGroup: (groupId: string) => void
  remove: (id: string) => void
  updateRule: (id: string, patch: Partial<QueryRule>) => void
  setMatch: (groupId: string, match: QueryGroup["match"]) => void
}

const QueryBuilderContext = React.createContext<QueryBuilderContextValue | null>(null)
const GroupContext = React.createContext<{ group: QueryGroup; depth: number } | null>(null)
const RuleContext = React.createContext<{ rule: QueryRule } | null>(null)

function useQueryBuilder() {
  const ctx = React.useContext(QueryBuilderContext)
  if (!ctx) throw new Error("QueryBuilder parts must be used within <QueryBuilder>")
  return ctx
}
function useQueryBuilderGroup() {
  const ctx = React.useContext(GroupContext)
  if (!ctx) throw new Error("Group parts must be used within <QueryBuilderGroup>")
  return ctx
}
function useQueryBuilderRule() {
  const ctx = React.useContext(RuleContext)
  if (!ctx) throw new Error("Rule parts must be used within <QueryBuilderRule>")
  return ctx
}

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

function QueryBuilder({
  fields,
  operators = defaultOperators,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  maxDepth = 3,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  fields: QueryField[]
  operators?: QueryOperator[]
  value?: QueryGroup
  defaultValue?: QueryGroup
  onValueChange?: (value: QueryGroup) => void
  disabled?: boolean
  /** Nesting limit for "Add group"; the trigger hides past it. */
  maxDepth?: number
}) {
  const [initial] = React.useState<QueryGroup>(
    () => defaultValue ?? createGroup("all", [createRule(fields, operators)])
  )
  const [value, setValue] = useControllable<QueryGroup>(valueProp, initial, onValueChange)
  const update = React.useCallback((fn: (prev: QueryGroup) => QueryGroup) => setValue(fn), [setValue])

  const ctx = React.useMemo<QueryBuilderContextValue>(
    () => ({
      fields,
      operators,
      value,
      disabled,
      maxDepth,
      addRule: (groupId, patch) => update((prev) => insertNode(prev, groupId, createRule(fields, operators, patch))),
      addGroup: (groupId) =>
        update((prev) => {
          // A nested group starts with the opposite match so it adds meaning ("…and any of these").
          const match = groupIn(prev, groupId)?.match === "any" ? "all" : "any"
          return insertNode(prev, groupId, createGroup(match, [createRule(fields, operators)]))
        }),
      remove: (id) => update((prev) => removeNode(prev, id)),
      updateRule: (id, patch) =>
        update((prev) => {
          if (patch.field !== undefined) {
            // Changing the field resets the operator to the first valid one and clears the value.
            const field = fields.find((f) => f.name === patch.field)
            const current = operators.find((o) => o.name === patch.operator)
            const options = operatorsFor(field, operators)
            const operator = current && options.includes(current) ? current.name : (options[0]?.name ?? "")
            return updateNode(prev, id, { field: patch.field, operator, value: undefined })
          }
          if (patch.operator !== undefined && patch.value === undefined) {
            const prevRule = findRule(prev, id)
            const before = operators.find((o) => o.name === prevRule?.operator)?.arity
            const after = operators.find((o) => o.name === patch.operator)?.arity
            return updateNode(prev, id, {
              operator: patch.operator,
              value: before === after ? prevRule?.value : undefined,
            })
          }
          return updateNode(prev, id, patch)
        }),
      setMatch: (groupId, match) => update((prev) => updateNode(prev, groupId, { match })),
    }),
    [fields, operators, value, disabled, maxDepth, update]
  )

  return (
    <QueryBuilderContext.Provider value={ctx}>
      <div
        data-slot="query-builder"
        data-disabled={disabled ? "" : undefined}
        className={cn("flex flex-col gap-3 text-sm", className)}
        {...props}
      >
        {children}
      </div>
    </QueryBuilderContext.Provider>
  )
}

function groupIn(root: QueryGroup, id: string): QueryGroup | null {
  if (root.id === id) return root
  for (const child of root.rules) {
    if (isGroup(child)) {
      const found = groupIn(child, id)
      if (found) return found
    }
  }
  return null
}

function findRule(root: QueryGroup, id: string): QueryRule | null {
  for (const child of root.rules) {
    if (isGroup(child)) {
      const found = findRule(child, id)
      if (found) return found
    } else if (child.id === id) return child
  }
  return null
}

/* ---------------------------------------------------------------------------
 * Group parts
 * ------------------------------------------------------------------------- */

function QueryBuilderGroup({
  group,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { group: QueryGroup }) {
  const parent = React.useContext(GroupContext)
  const depth = parent ? parent.depth + 1 : 0
  const ctx = React.useMemo(() => ({ group, depth }), [group, depth])
  return (
    <GroupContext.Provider value={ctx}>
      <div
        data-slot="query-builder-group"
        data-match={group.match}
        data-depth={depth}
        data-empty={group.rules.length === 0 ? "" : undefined}
        className={cn(
          "group/query-group flex flex-col gap-2",
          depth > 0 && "rounded-lg border border-dashed bg-muted/30 p-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </GroupContext.Provider>
  )
}

function QueryBuilderGroupHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="query-builder-group-header"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

const matchOptions: QueryOption[] = [
  { value: "all", label: "all" },
  { value: "any", label: "any" },
]
const matchCollection = createListCollection({ items: matchOptions, itemToValue: (o) => o.value })

/** "Match [all ▾] of the following" — the only combinator control, once per group. */
function QueryBuilderMatch({
  className,
  before,
  after = "of the following",
  ...props
}: Omit<React.ComponentProps<typeof Select>, "collection" | "value" | "onValueChange"> & {
  /** Text before the select. Defaults to "Match" at the top level and "Where" in nested groups. */
  before?: React.ReactNode
  after?: React.ReactNode
}) {
  const { setMatch, disabled } = useQueryBuilder()
  const { group, depth } = useQueryBuilderGroup()
  return (
    <span data-slot="query-builder-match" className="inline-flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground">{before ?? (depth === 0 ? "Match" : "Where")}</span>
      <Select
        collection={matchCollection}
        value={[group.match]}
        onValueChange={({ value }) => value[0] && setMatch(group.id, value[0] as QueryGroup["match"])}
        disabled={disabled}
        positioning={{ sameWidth: false }}
        {...props}
      >
        <SelectControl>
          <SelectTrigger size="sm" className={cn("font-medium", className)} aria-label="Match all or any">
            <SelectValue>{group.match}</SelectValue>
          </SelectTrigger>
        </SelectControl>
        <SelectContent className="min-w-24">
          {matchOptions.map((o) => (
            <SelectItem key={o.value} item={o}>
              <SelectItemText>{o.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">{after}</span>
    </span>
  )
}

/** Indented list of conditions with a guide line. */
function QueryBuilderGroupBody({ className, ...props }: React.ComponentProps<"div">) {
  const { group } = useQueryBuilderGroup()
  return (
    <div
      data-slot="query-builder-group-body"
      data-empty={group.rules.length === 0 ? "" : undefined}
      className={cn(
        "relative flex flex-col gap-2 ps-4 before:absolute before:inset-y-1 before:inset-s-1 before:w-px before:bg-border",
        className
      )}
      {...props}
    />
  )
}

function QueryBuilderGroupFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="query-builder-group-footer"
      className={cn("flex flex-wrap items-center gap-1 ps-4", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Rule parts
 * ------------------------------------------------------------------------- */

function QueryBuilderRule({ rule, className, children, ...props }: React.ComponentProps<"div"> & { rule: QueryRule }) {
  const { operators } = useQueryBuilder()
  const complete = isComplete(rule, operators)
  const ctx = React.useMemo(() => ({ rule }), [rule])
  return (
    <RuleContext.Provider value={ctx}>
      <div
        data-slot="query-builder-rule"
        data-incomplete={complete ? undefined : ""}
        className={cn(
          "group/query-rule -ms-1 flex flex-wrap items-center gap-1.5 rounded-lg py-0.5 ps-1 pe-1 hover:bg-muted/40 has-focus-visible:bg-muted/40",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </RuleContext.Provider>
  )
}

type PickerProps = Omit<React.ComponentProps<typeof Select>, "collection" | "value" | "onValueChange">

function QueryBuilderFieldSelect({ className, ...props }: PickerProps & { className?: string }) {
  const { fields, updateRule, disabled } = useQueryBuilder()
  const { rule } = useQueryBuilderRule()
  const collection = React.useMemo(
    () => createListCollection({ items: fields, itemToValue: (f) => f.name, itemToString: (f) => f.label }),
    [fields]
  )
  const field = fields.find((f) => f.name === rule.field)
  return (
    <Select
      collection={collection}
      value={[rule.field]}
      onValueChange={({ value }) => value[0] && updateRule(rule.id, { field: value[0] })}
      disabled={disabled}
      positioning={{ sameWidth: false }}
      {...props}
    >
      <SelectControl>
        <SelectTrigger
          size="sm"
          className={cn("font-medium", className)}
          data-slot="query-builder-field-select"
          aria-label="Field"
        >
          <SelectValue placeholder="Field">{field?.label}</SelectValue>
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {fields.map((f) => (
          <SelectItem key={f.name} item={f}>
            <SelectItemText>{f.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function QueryBuilderOperatorSelect({ className, ...props }: PickerProps & { className?: string }) {
  const { fields, operators, updateRule, disabled } = useQueryBuilder()
  const { rule } = useQueryBuilderRule()
  const field = fields.find((f) => f.name === rule.field)
  const options = React.useMemo(() => operatorsFor(field, operators), [field, operators])
  const collection = React.useMemo(
    () => createListCollection({ items: options, itemToValue: (o) => o.name, itemToString: (o) => o.label }),
    [options]
  )
  const current = options.find((o) => o.name === rule.operator)
  return (
    <Select
      collection={collection}
      value={[rule.operator]}
      onValueChange={({ value }) => value[0] && updateRule(rule.id, { operator: value[0] })}
      disabled={disabled}
      positioning={{ sameWidth: false }}
      {...props}
    >
      <SelectControl>
        <SelectTrigger
          size="sm"
          className={cn("text-muted-foreground", className)}
          data-slot="query-builder-operator-select"
          aria-label="Operator"
        >
          <SelectValue placeholder="Operator">{current?.label}</SelectValue>
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.name} item={o}>
            <SelectItemText>{o.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type ValueEditorRenderProps = {
  rule: QueryRule
  field: QueryField | undefined
  operator: QueryOperator | undefined
  value: unknown
  setValue: (value: unknown) => void
  disabled: boolean
}

/**
 * Renders an editor for the rule's value based on the field type and operator
 * arity. Pass a render-prop child to take over for specific cases and fall back
 * to the default by returning `undefined`.
 */
function QueryBuilderValueEditor({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  children?: (props: ValueEditorRenderProps) => React.ReactNode | undefined
}) {
  const { fields, operators, updateRule, disabled } = useQueryBuilder()
  const { rule } = useQueryBuilderRule()
  const field = fields.find((f) => f.name === rule.field)
  const operator = operators.find((o) => o.name === rule.operator)
  const setValue = React.useCallback((value: unknown) => updateRule(rule.id, { value }), [updateRule, rule.id])
  const custom = children?.({ rule, field, operator, value: rule.value, setValue, disabled })
  if (custom !== undefined) return <>{custom}</>
  if (!operator || operator.arity === "none") return null
  const type = field?.type ?? "text"
  const inputType = type === "number" ? "number" : type === "date" ? "date" : "text"
  const inputClass = cn("h-7 w-40 text-sm md:text-sm", type === "number" && "w-24", type === "date" && "w-36")

  if (operator.arity === "two") {
    const pair = Array.isArray(rule.value) ? (rule.value as unknown[]) : [undefined, undefined]
    const set = (index: 0 | 1, v: string) => {
      const next = [...pair]
      next[index] = v
      setValue(next)
    }
    return (
      <div
        data-slot="query-builder-value-editor"
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        <Input
          type={inputType}
          value={String(pair[0] ?? "")}
          onChange={(e) => set(0, e.target.value)}
          disabled={disabled}
          aria-label="From"
          className={inputClass}
        />
        <span className="text-muted-foreground">and</span>
        <Input
          type={inputType}
          value={String(pair[1] ?? "")}
          onChange={(e) => set(1, e.target.value)}
          disabled={disabled}
          aria-label="To"
          className={inputClass}
        />
      </div>
    )
  }

  if (type === "select" && field?.options) {
    const many = operator.arity === "many"
    const selected = many ? ((rule.value as string[] | undefined) ?? []) : rule.value ? [String(rule.value)] : []
    return (
      <div data-slot="query-builder-value-editor" className={cn("inline-flex", className)} {...props}>
        <OptionPicker
          options={field.options}
          value={selected}
          multiple={many}
          disabled={disabled}
          placeholder="Choose…"
          onChange={(values) => setValue(many ? values : values[0])}
        />
      </div>
    )
  }

  if (operator.arity === "many") {
    // Free-text lists: comma separated, shown as-is.
    const list = Array.isArray(rule.value) ? (rule.value as string[]) : []
    return (
      <div data-slot="query-builder-value-editor" className={cn("inline-flex", className)} {...props}>
        <Input
          value={list.join(", ")}
          onChange={(e) =>
            setValue(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder={field?.placeholder ?? "Comma separated"}
          disabled={disabled}
          aria-label="Values"
          className={cn(inputClass, "w-56")}
        />
      </div>
    )
  }

  return (
    <div data-slot="query-builder-value-editor" className={cn("inline-flex", className)} {...props}>
      <Input
        type={inputType}
        value={String(rule.value ?? "")}
        onChange={(e) => setValue(e.target.value)}
        placeholder={field?.placeholder ?? (type === "text" ? "Value" : undefined)}
        disabled={disabled}
        aria-label="Value"
        className={inputClass}
      />
    </div>
  )
}

function OptionPicker({
  options,
  value,
  multiple,
  disabled,
  placeholder,
  onChange,
}: {
  options: QueryOption[]
  value: string[]
  multiple: boolean
  disabled: boolean
  placeholder: string
  onChange: (values: string[]) => void
}) {
  const collection = React.useMemo(
    () => createListCollection({ items: options, itemToValue: (o) => o.value, itemToString: (o) => o.label }),
    [options]
  )
  const labels = value.map((v) => options.find((o) => o.value === v)?.label ?? v)
  return (
    <Select
      collection={collection}
      value={value}
      multiple={multiple}
      closeOnSelect={!multiple}
      onValueChange={({ value }) => onChange(value)}
      disabled={disabled}
      positioning={{ sameWidth: false }}
    >
      <SelectControl>
        <SelectTrigger size="sm" className="max-w-64" aria-label="Value">
          <SelectValue placeholder={placeholder}>
            {labels.length
              ? labels.length > 3
                ? `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`
                : labels.join(", ")
              : undefined}
          </SelectValue>
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} item={o}>
            <SelectItemText>{o.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Hover-revealed slot at the end of a rule row (remove trigger, extras). */
function QueryBuilderRuleActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="query-builder-rule-actions"
      className={cn(
        "ms-auto inline-flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/query-rule:opacity-100 group-hover/query-rule:opacity-100",
        className
      )}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Triggers (polymorphic via asChild)
 * ------------------------------------------------------------------------- */

function QueryBuilderAddRuleTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { addRule, disabled } = useQueryBuilder()
  const { group } = useQueryBuilderGroup()
  return (
    <Button
      data-slot="query-builder-add-rule-trigger"
      variant="ghost"
      size="sm"
      asChild={asChild}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) addRule(group.id)
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <PlusIcon /> Add condition
            </>
          ))}
    </Button>
  )
}

function QueryBuilderAddGroupTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { addGroup, disabled, maxDepth } = useQueryBuilder()
  const { group, depth } = useQueryBuilderGroup()
  if (depth >= maxDepth) return null
  return (
    <Button
      data-slot="query-builder-add-group-trigger"
      variant="ghost"
      size="sm"
      asChild={asChild}
      disabled={disabled}
      className="text-muted-foreground"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) addGroup(group.id)
      }}
      {...props}
    >
      {asChild ? children : (children ?? <>Add a nested group</>)}
    </Button>
  )
}

/** Removes the enclosing rule, or the enclosing group when used in a group header. */
function QueryBuilderRemoveTrigger({
  asChild,
  children,
  onClick,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { remove, disabled } = useQueryBuilder()
  const rule = React.useContext(RuleContext)
  const group = React.useContext(GroupContext)
  const target = rule?.rule.id ?? group?.group.id
  const label = rule ? "Remove condition" : "Remove group"
  return (
    <Button
      data-slot="query-builder-remove-trigger"
      variant="ghost"
      size="icon-xs"
      asChild={asChild}
      disabled={disabled}
      aria-label={label}
      className={cn("text-muted-foreground hover:text-destructive", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && target) remove(target)
      }}
      {...props}
    >
      {asChild ? children : (children ?? <XIcon />)}
    </Button>
  )
}

/* ---------------------------------------------------------------------------
 * Summary and empty state
 * ------------------------------------------------------------------------- */

/** The query as a sentence; `children` overrides the fallback when nothing is set. */
function QueryBuilderSummary({
  className,
  children,
  prefix = "Showing results where ",
  ...props
}: React.ComponentProps<"p"> & { prefix?: React.ReactNode }) {
  const { value, fields, operators } = useQueryBuilder()
  const text = describeQuery(value, { fields, operators })
  return (
    <p
      data-slot="query-builder-summary"
      data-empty={text ? undefined : ""}
      className={cn("text-sm", className)}
      {...props}
    >
      {text ? (
        <>
          <span className="text-muted-foreground">{prefix}</span>
          <span className="font-medium">{text}</span>
        </>
      ) : (
        (children ?? (
          <span className="text-muted-foreground">Showing everything. Add a condition to narrow it down.</span>
        ))
      )}
    </p>
  )
}

function QueryBuilderEmpty({ className, ...props }: React.ComponentProps<typeof ark.div>) {
  return (
    <ark.div
      data-slot="query-builder-empty"
      className={cn("rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  QueryBuilder,
  QueryBuilderGroup,
  QueryBuilderGroupHeader,
  QueryBuilderMatch,
  QueryBuilderGroupBody,
  QueryBuilderGroupFooter,
  QueryBuilderRule,
  QueryBuilderFieldSelect,
  QueryBuilderOperatorSelect,
  QueryBuilderValueEditor,
  QueryBuilderRuleActions,
  QueryBuilderAddRuleTrigger,
  QueryBuilderAddGroupTrigger,
  QueryBuilderRemoveTrigger,
  QueryBuilderSummary,
  QueryBuilderEmpty,
  useQueryBuilder,
  useQueryBuilderGroup,
  useQueryBuilderRule,
  createRule,
  createGroup,
  isGroup,
  isComplete,
  operatorsFor,
  defaultOperators,
  describeQuery,
  pruneQuery,
  type QueryField,
  type QueryFieldType,
  type QueryOption,
  type QueryOperator,
  type QueryRule,
  type QueryGroup,
  type QueryNode,
}

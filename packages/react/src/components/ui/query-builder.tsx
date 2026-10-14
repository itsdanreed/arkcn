import * as React from "react"
import { ark } from "@ark-ui/react"
import { createListCollection } from "@ark-ui/react/collection"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "./button"
import { DatePicker, parseDate } from "./date-picker"
import type { DateValue } from "@ark-ui/react"
import { Portal } from "./portal"
import { Input } from "./input"
import { Select } from "./select"
import { cn } from "../../lib/utils"
import { useControllable } from "../../lib/controllable"

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

/** A piece of the summary sentence; `value` segments are the user's values, rendered emphasised. */
type QuerySegment = { text: string; value?: boolean }

const dateFormat = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" })

/** One value as the sentence shows it: text and options quoted, numbers bare, dates in a readable form. */
function formatValue(v: unknown, field: QueryField | undefined): string {
  const type = field?.type ?? "text"
  if (type === "date") {
    // Date-only strings are local calendar days (as the date input gives them), not UTC instants.
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v))
    const date = ymd ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])) : new Date(String(v))
    return Number.isNaN(date.getTime()) ? String(v) : dateFormat.format(date)
  }
  if (type === "number" || type === "boolean") return String(v)
  const label = field?.options?.find((o) => o.value === String(v))?.label ?? String(v)
  return `“${label}”`
}

function valueSegments(rule: QueryRule, field: QueryField | undefined): QuerySegment[] {
  const value = (v: unknown): QuerySegment => ({ text: formatValue(v, field), value: true })
  if (Array.isArray(rule.value)) {
    const values = rule.value.map(value)
    if (rule.operator === "between") return [values[0], { text: " and " }, values[1]]
    const shown = values.length <= 3 ? values : values.slice(0, 2)
    const out: QuerySegment[] = []
    shown.forEach((segment, i) => {
      if (i > 0) out.push({ text: i === shown.length - 1 && values.length <= 3 ? " or " : ", " })
      out.push(segment)
    })
    if (values.length > 3) out.push({ text: ` or ${values.length - 2} more` })
    return out
  }
  return [value(rule.value)]
}

/**
 * The query as sentence segments: "Name contains “Ada” and either (Plan is “Pro”, or Seats is at
 * least 10)". Any-groups read "either A, or B"; nested groups with more than one part are
 * parenthesised. Incomplete rules are skipped (the Summary counts them separately).
 */
function describeQuerySegments(
  group: QueryGroup,
  { fields, operators = defaultOperators }: DescribeOptions,
  depth = 0
): QuerySegment[] {
  const parts = group.rules
    .map((n): QuerySegment[] => {
      if (isGroup(n)) return describeQuerySegments(n, { fields, operators }, depth + 1)
      if (!isComplete(n, operators)) return []
      const field = fields.find((f) => f.name === n.field)
      const operator = operators.find((o) => o.name === n.operator)
      // List operators read as "Plan is “Free” or “Pro”" rather than "is any of Free, Pro".
      const verb =
        operator?.name === "anyOf" ? "is" : operator?.name === "noneOf" ? "is not" : (operator?.label ?? n.operator)
      const head: QuerySegment = { text: `${field?.label ?? n.field} ${verb}` }
      if (operator?.arity === "none") return [head]
      return [head, { text: " " }, ...valueSegments(n, field)]
    })
    .filter((segments) => segments.length > 0)
  if (!parts.length) return []
  const any = group.match === "any" && parts.length > 1
  const out: QuerySegment[] = []
  parts.forEach((segments, i) => {
    // Two parts: "A and B" / "either A, or B". More: "A, B, and C" / "either A, B, or C".
    if (i > 0) {
      const last = i === parts.length - 1
      out.push({ text: any ? (last ? ", or " : ", ") : parts.length > 2 ? (last ? ", and " : ", ") : " and " })
    }
    out.push(...segments)
  })
  if (any) out.unshift({ text: "either " })
  if (depth > 0 && parts.length > 1) {
    const open = any ? 1 : 0
    out.splice(open, 0, { text: "(" })
    out.push({ text: ")" })
  }
  return out
}

/** Natural-language sentence, e.g. "Status is “Active” and Created is after Jan 1, 2026". */
function describeQuery(
  /** The group node this part renders. */
  group: QueryGroup,
  options: DescribeOptions,
  depth = 0
): string {
  return describeQuerySegments(group, options, depth)
    .map((s) => s.text)
    .join("")
}

/** How many rules `pruneQuery` would drop: shown by the summary so a half-built filter is not mistaken for a complete one. */
function countIncomplete(group: QueryGroup, operators = defaultOperators): number {
  return group.rules.reduce(
    (n, node) => n + (isGroup(node) ? countIncomplete(node, operators) : isComplete(node, operators) ? 0 : 1),
    0
  )
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
  /** Fields the user can filter on: `{ name, label, type, options, operators, placeholder }`. */
  fields: QueryField[]
  /** Operator definitions; defaults to `defaultOperators`. */
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

function QueryBuilderRoot({
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
}: QueryBuilderRootProps) {
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
      <ark.div
        data-slot="query-builder"
        data-disabled={disabled ? "" : undefined}
        className={cn("flex flex-col gap-3 text-sm", className)}
        {...props}
      >
        {children}
      </ark.div>
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

function QueryBuilderGroup({ group, className, children, ...props }: QueryBuilderGroupProps) {
  const parent = React.useContext(GroupContext)
  const depth = parent ? parent.depth + 1 : 0
  const ctx = React.useMemo(() => ({ group, depth }), [group, depth])
  return (
    <GroupContext.Provider value={ctx}>
      <ark.div
        data-slot="query-builder-group"
        data-match={group.match}
        data-depth={depth}
        data-empty={group.rules.length === 0 ? "" : undefined}
        // Every depth gets the same treatment: a header sentence, then one continuous thread line
        // running from under the header past the conditions to the add row (body and footer each
        // draw their segment, flush, so it reads as one line). No cards; nested groups get extra
        // room above and below so each block stands apart.
        className={cn("group/query-group col-span-full flex flex-col", depth > 0 && "my-2", className)}
        {...props}
      >
        {children}
      </ark.div>
    </GroupContext.Provider>
  )
}

function QueryBuilderGroupHeader({ className, ...props }: QueryBuilderGroupHeaderProps) {
  return (
    <ark.div
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
function QueryBuilderMatch({ className, before, after = "of the following", ...props }: QueryBuilderMatchProps) {
  const { setMatch, disabled } = useQueryBuilder()
  const { group, depth } = useQueryBuilderGroup()
  return (
    <span data-slot="query-builder-match" className="inline-flex flex-wrap items-center gap-1.5 font-medium">
      <span>{before ?? (depth === 0 ? "Match" : "Where")}</span>
      <Select.Root
        collection={matchCollection}
        value={[group.match]}
        onValueChange={({ value }) => value[0] && setMatch(group.id, value[0] as QueryGroup["match"])}
        disabled={disabled}
        positioning={{ sameWidth: false }}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(props.children) ? (
            props.children
          ) : null
        ) : (
          <>
            <Select.Control>
              {/* The header is a label, not a field: smaller and medium so it reads apart from the rows. */}
              <Select.Trigger size="sm" className={cn("font-medium", className)} aria-label="Match all or any">
                <Select.ValueText>{group.match}</Select.ValueText>
              </Select.Trigger>
            </Select.Control>
            <Select.Content className="min-w-24">
              {matchOptions.map((o) => (
                <Select.Item key={o.value} item={o}>
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </>
        )}
      </Select.Root>
      <span>{after}</span>
    </span>
  )
}

/**
 * Indented list of conditions. It is a four-column grid (field, operator, value, actions) and each `QueryBuilderRule`
 * is a subgrid row, so the columns line up across the group and the value
 * editor takes the remaining width instead of wrapping under the field.
 */
function QueryBuilderGroupBody({ className, ...props }: QueryBuilderGroupBodyProps) {
  const { group } = useQueryBuilderGroup()
  return (
    <ark.div
      data-slot="query-builder-group-body"
      data-empty={group.rules.length === 0 ? "" : undefined}
      className={cn(
        "@container/query-body ms-2.5 mt-2.5 grid grid-cols-[max-content_max-content_minmax(6rem,1fr)_auto] gap-2.5 border-s ps-3.5 pb-2.5",
        className
      )}
      {...props}
    />
  )
}

function QueryBuilderGroupFooter({ className, ...props }: QueryBuilderGroupFooterProps) {
  return (
    <ark.div
      data-slot="query-builder-group-footer"
      // Continues the body's thread line; ps-1 + the ghost button's 10px padding aligns the plus with the rows.
      className={cn("ms-2.5 flex flex-wrap items-center gap-1 border-s ps-1", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Rule parts
 * ------------------------------------------------------------------------- */

function QueryBuilderRule({ rule, className, children, ...props }: QueryBuilderRuleProps) {
  const { operators } = useQueryBuilder()
  const complete = isComplete(rule, operators)
  const ctx = React.useMemo(() => ({ rule }), [rule])
  return (
    <RuleContext.Provider value={ctx}>
      <ark.div
        data-slot="query-builder-rule"
        data-incomplete={complete ? undefined : ""}
        // Below ~28rem the row wraps instead: field, operator and trash on one line, the value below.
        className={cn(
          "group/query-rule col-span-full grid grid-cols-subgrid items-start @max-md/query-body:flex @max-md/query-body:flex-wrap @max-md/query-body:gap-2",
          className
        )}
        {...props}
      >
        {children}
      </ark.div>
    </RuleContext.Provider>
  )
}

type PickerProps = Omit<React.ComponentProps<typeof Select.Root>, "collection" | "value" | "onValueChange">

function QueryBuilderFieldSelect({ className, ...props }: QueryBuilderFieldSelectProps) {
  const { fields, updateRule, disabled } = useQueryBuilder()
  const { rule } = useQueryBuilderRule()
  const collection = React.useMemo(
    () => createListCollection({ items: fields, itemToValue: (f) => f.name, itemToString: (f) => f.label }),
    [fields]
  )
  const field = fields.find((f) => f.name === rule.field)
  return (
    <Select.Root
      collection={collection}
      value={[rule.field]}
      onValueChange={({ value }) => value[0] && updateRule(rule.id, { field: value[0] })}
      disabled={disabled}
      positioning={{ sameWidth: false }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Select.Control>
            <Select.Trigger className={className} data-query-builder-part="field-select" aria-label="Field">
              <Select.ValueText placeholder="Field">{field?.label}</Select.ValueText>
            </Select.Trigger>
          </Select.Control>
          <Select.Content>
            {fields.map((f) => (
              <Select.Item key={f.name} item={f}>
                <Select.ItemText>{f.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </>
      )}
    </Select.Root>
  )
}

function QueryBuilderOperatorSelect({ className, ...props }: QueryBuilderOperatorSelectProps) {
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
    <Select.Root
      collection={collection}
      value={[rule.operator]}
      onValueChange={({ value }) => value[0] && updateRule(rule.id, { operator: value[0] })}
      disabled={disabled}
      positioning={{ sameWidth: false }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Select.Control>
            <Select.Trigger className={className} data-query-builder-part="operator-select" aria-label="Operator">
              <Select.ValueText placeholder="Operator">{current?.label}</Select.ValueText>
            </Select.Trigger>
          </Select.Control>
          <Select.Content>
            {options.map((o) => (
              <Select.Item key={o.name} item={o}>
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </>
      )}
    </Select.Root>
  )
}

type ValueEditorRenderProps = {
  /** The rule node this part renders. */
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
function QueryBuilderValueEditor({ className, children, ...props }: QueryBuilderValueEditorProps) {
  const { fields, operators, updateRule, disabled } = useQueryBuilder()
  const { rule } = useQueryBuilderRule()
  const field = fields.find((f) => f.name === rule.field)
  const operator = operators.find((o) => o.name === rule.operator)
  const setValue = React.useCallback((value: unknown) => updateRule(rule.id, { value }), [updateRule, rule.id])
  const custom =
    typeof children === "function"
      ? children?.({ rule, field, operator, value: rule.value, setValue, disabled })
      : children
  if (custom !== undefined) return <>{custom}</>
  if (!operator || operator.arity === "none") return null
  const type = field?.type ?? "text"
  const inputType = type === "number" ? "number" : type === "date" ? "date" : "text"
  // Only constrain layout; Input owns its height, typography, and state styles. Editors fill
  // the value column (so rows stay aligned) up to a width that suits the type.
  const inputClass = cn("w-full max-w-72", type === "number" && "max-w-32", type === "date" && "max-w-44")
  const placeholder =
    field?.placeholder ?? (type === "number" ? "Enter a number" : type === "text" ? "Enter a value" : undefined)

  const editorClass = cn("col-start-3 flex min-w-0", narrowEditor)

  if (type === "date") {
    // Dates use the toolkit DatePicker (typed input + calendar) rather than the native control.
    // "Between" is two separate pickers, each with its own calendar, joined by "and".
    if (operator.arity === "two") {
      const pair = Array.isArray(rule.value) ? (rule.value as unknown[]) : [undefined, undefined]
      const set = (index: 0 | 1, v: string | undefined) => {
        const next = [...pair]
        next[index] = v
        setValue(next)
      }
      return (
        <ark.div
          data-slot="query-builder-value-editor"
          // Two pickers that wrap as a pair when the column is narrow, rather than clipping.
          className={cn("col-start-3 flex max-w-md min-w-0 flex-wrap items-center gap-2", narrowEditor, className)}
          {...props}
        >
          {props.asChild ? (
            React.isValidElement(children) ? (
              children
            ) : null
          ) : (
            <>
              <QueryDatePicker
                value={pair[0]}
                disabled={disabled}
                label="From"
                className="min-w-28 flex-1"
                onChange={(v) => set(0, v)}
              />
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="text-muted-foreground">and</span>
                <QueryDatePicker
                  value={pair[1]}
                  disabled={disabled}
                  label="To"
                  className="min-w-28 flex-1"
                  onChange={(v) => set(1, v)}
                />
              </span>
            </>
          )}
        </ark.div>
      )
    }
    return (
      <ark.div data-slot="query-builder-value-editor" className={cn(editorClass, "max-w-56", className)} {...props}>
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <QueryDatePicker value={rule.value} disabled={disabled} label="Date" onChange={setValue} />
        )}
      </ark.div>
    )
  }

  if (operator.arity === "two") {
    const pair = Array.isArray(rule.value) ? (rule.value as unknown[]) : [undefined, undefined]
    const set = (index: 0 | 1, v: string) => {
      const next = [...pair]
      next[index] = v
      setValue(next)
    }
    return (
      <ark.div
        data-slot="query-builder-value-editor"
        // The pair shares the value column as one unit, so it shrinks instead of wrapping.
        className={cn(
          "col-start-3 grid max-w-md min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2",
          narrowEditor,
          className
        )}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            <Input.Root
              type={inputType}
              value={String(pair[0] ?? "")}
              onChange={(e) => set(0, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              aria-label="From"
              className="w-full"
            />
            <span className="text-muted-foreground">and</span>
            <Input.Root
              type={inputType}
              value={String(pair[1] ?? "")}
              onChange={(e) => set(1, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              aria-label="To"
              className="w-full"
            />
          </>
        )}
      </ark.div>
    )
  }

  if (type === "select" && field?.options) {
    const many = operator.arity === "many"
    const selected = many ? ((rule.value as string[] | undefined) ?? []) : rule.value ? [String(rule.value)] : []
    return (
      <ark.div data-slot="query-builder-value-editor" className={cn(editorClass, className)} {...props}>
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            <OptionPicker
              options={field.options}
              value={selected}
              multiple={many}
              disabled={disabled}
              placeholder={field.placeholder ?? "Choose a value…"}
              onChange={(values) => setValue(many ? values : values[0])}
            />
          </>
        )}
      </ark.div>
    )
  }

  if (operator.arity === "many") {
    // Free-text lists: comma separated, shown as-is.
    const list = Array.isArray(rule.value) ? (rule.value as string[]) : []
    return (
      <ark.div data-slot="query-builder-value-editor" className={cn(editorClass, className)} {...props}>
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            <Input.Root
              value={list.join(", ")}
              onChange={(e) =>
                setValue(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder={field?.placeholder ?? "Comma separated values"}
              disabled={disabled}
              aria-label="Values"
              className="w-full max-w-md"
            />
          </>
        )}
      </ark.div>
    )
  }

  return (
    <ark.div data-slot="query-builder-value-editor" className={cn(editorClass, className)} {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Input.Root
            type={inputType}
            value={String(rule.value ?? "")}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Value"
            className={inputClass}
          />
        </>
      )}
    </ark.div>
  )
}

/** In the wrapped (narrow) row layout the value editor drops to its own full-width line, after the trash. */
const narrowEditor = "@max-md/query-body:order-last @max-md/query-body:basis-full"

/** Converts a stored ISO day string to a calendar value; anything unparsable is an empty picker. */
function toDateValue(value: unknown): DateValue[] {
  if (value == null || value === "") return []
  try {
    return ([] as DateValue[]).concat(parseDate(String(value)))
  } catch {
    // Not a date yet (half-typed or foreign input): show an empty picker rather than throw.
    return []
  }
}

/**
 * The toolkit DatePicker composed for one date value: a typed input with calendar
 * and clear triggers in a Control, and day/month/year views in a portal.
 */
function QueryDatePicker({
  value,
  disabled,
  label,
  className,
  onChange,
}: {
  value: unknown
  disabled: boolean
  label: string
  className?: string
  onChange: (value: string | undefined) => void
}) {
  const dates = React.useMemo(() => toDateValue(value), [value])
  return (
    <DatePicker.Root
      value={dates}
      // Store the calendar value's own ISO day ("2026-10-01"), not `valueAsString`, which is the
      // locale display format and would not parse back.
      onValueChange={({ value }) => onChange(value[0]?.toString())}
      disabled={disabled}
      positioning={{ sameWidth: false }}
      className={cn("w-full", className)}
    >
      <DatePicker.Control>
        <DatePicker.Input aria-label={label} />
        <DatePicker.Trigger aria-label="Open calendar" />
        <DatePicker.ClearTrigger aria-label="Clear" />
      </DatePicker.Control>
      <Portal.Root>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger aria-label="Previous month">
                        <ChevronLeftIcon />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger aria-label="Next month">
                        <ChevronRightIcon />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {api.weekDays.map((day, index) => (
                            <DatePicker.TableHeader key={index}>{day.short}</DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {api.weeks.map((week, index) => (
                          <DatePicker.TableRow key={index}>
                            {week.map((day) => (
                              <DatePicker.TableCell key={day.toString()} value={day}>
                                <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger aria-label="Previous year">
                        <ChevronLeftIcon />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger aria-label="Next year">
                        <ChevronRightIcon />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table columns={3}>
                      <DatePicker.TableBody>
                        {api.getMonthsGrid({ columns: 3, format: "short" }).map((months, index) => (
                          <DatePicker.TableRow key={index}>
                            {months.map((month) => (
                              <DatePicker.TableCell key={month.value} value={month.value}>
                                <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger aria-label="Previous decade">
                        <ChevronLeftIcon />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger aria-label="Next decade">
                        <ChevronRightIcon />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table columns={3}>
                      <DatePicker.TableBody>
                        {api.getYearsGrid({ columns: 3 }).map((years, index) => (
                          <DatePicker.TableRow key={index}>
                            {years.map((year) => (
                              <DatePicker.TableCell key={year.value} value={year.value}>
                                <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal.Root>
    </DatePicker.Root>
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
    <Select.Root
      collection={collection}
      value={value}
      multiple={multiple}
      closeOnSelect={!multiple}
      onValueChange={({ value }) => onChange(value)}
      disabled={disabled}
      positioning={{ sameWidth: false }}
    >
      <Select.Control>
        <Select.Trigger className="max-w-64" aria-label="Value">
          <Select.ValueText placeholder={placeholder}>
            {labels.length
              ? labels.length > 3
                ? `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`
                : labels.join(", ")
              : undefined}
          </Select.ValueText>
        </Select.Trigger>
      </Select.Control>
      <Select.Content>
        {options.map((o) => (
          <Select.Item key={o.value} item={o}>
            <Select.ItemText>{o.label}</Select.ItemText>
            <Select.ItemIndicator />
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

/** Trailing column of a rule row (remove trigger, extras): sits right after the value so it reads as the row's own, always visible. */
function QueryBuilderRuleActions({ className, ...props }: QueryBuilderRuleActionsProps) {
  return (
    <ark.div
      data-slot="query-builder-rule-actions"
      className={cn(
        "col-start-4 inline-flex h-8 items-center gap-0.5 justify-self-start @max-md/query-body:ms-auto",
        className
      )}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Triggers (polymorphic via asChild)
 * ------------------------------------------------------------------------- */

function QueryBuilderAddRuleTrigger({ asChild, children, onClick, ...props }: QueryBuilderAddRuleTriggerProps) {
  const { addRule, disabled } = useQueryBuilder()
  const { group } = useQueryBuilderGroup()
  return (
    <Button
      data-slot="query-builder-add-rule-trigger"
      type={asChild ? undefined : "button"}
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

function QueryBuilderAddGroupTrigger({
  asChild,
  children,
  onClick,
  className,
  ...props
}: QueryBuilderAddGroupTriggerProps) {
  const { addGroup, disabled, maxDepth } = useQueryBuilder()
  const { group, depth } = useQueryBuilderGroup()
  if (depth >= maxDepth) return null
  return (
    <Button
      data-slot="query-builder-add-group-trigger"
      type={asChild ? undefined : "button"}
      variant="ghost"
      size="sm"
      asChild={asChild}
      disabled={disabled}
      // Quieter than "Add condition": one visual weight per footer keeps deep trees readable.
      className={cn("text-muted-foreground", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) addGroup(group.id)
      }}
      {...props}
    >
      {asChild ? children : (children ?? <>Add group</>)}
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
}: QueryBuilderRemoveTriggerProps) {
  const { remove, disabled } = useQueryBuilder()
  const rule = React.useContext(RuleContext)
  const group = React.useContext(GroupContext)
  const target = rule?.rule.id ?? group?.group.id
  const label = rule ? "Remove condition" : "Remove group"
  return (
    <Button
      data-slot="query-builder-remove-trigger"
      type={asChild ? undefined : "button"}
      variant="ghost"
      size="icon-xs"
      asChild={asChild}
      disabled={disabled}
      aria-label={label}
      // Visible at rest (muted) so it is discoverable on touch; hover and focus bring it forward.
      className={cn("text-muted-foreground hover:text-foreground focus-visible:text-foreground", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && target) remove(target)
      }}
      {...props}
    >
      {asChild ? children : (children ?? <Trash2Icon />)}
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
}: QueryBuilderSummaryProps) {
  const { value, fields, operators } = useQueryBuilder()
  const segments = describeQuerySegments(value, { fields, operators })
  const text = segments.length > 0
  const incomplete = countIncomplete(value, operators)
  return (
    <ark.p
      data-slot="query-builder-summary"
      data-empty={text ? undefined : ""}
      data-incomplete={incomplete ? incomplete : undefined}
      // A footer under the rows, not a second copy of them: hairline above, muted sentence.
      className={cn("border-t pt-3 text-sm text-muted-foreground", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {text ? (
            <>
              {prefix}
              <span className="text-foreground">
                {segments.map((s, i) =>
                  s.value ? (
                    // Values are emphasised and kept on one line so a date or quoted name never breaks mid-value.
                    <strong key={i} className="font-medium whitespace-nowrap">
                      {s.text}
                    </strong>
                  ) : (
                    <React.Fragment key={i}>{s.text}</React.Fragment>
                  )
                )}
              </span>
              {incomplete ? "." : null}
            </>
          ) : incomplete ? (
            "No complete conditions yet."
          ) : (
            (children ?? "Showing everything. Add a condition to narrow it down.")
          )}
          {incomplete ? (
            <span data-slot="query-builder-summary-incomplete">
              {" "}
              {incomplete === 1
                ? "1 incomplete condition not applied."
                : `${incomplete} incomplete conditions not applied.`}
            </span>
          ) : null}
        </>
      )}
    </ark.p>
  )
}

function QueryBuilderEmpty({ className, ...props }: QueryBuilderEmptyProps) {
  return (
    <ark.div
      data-slot="query-builder-empty"
      className={cn("col-span-full py-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

type QueryBuilderRootProps = Omit<React.ComponentProps<typeof ark.div>, "defaultValue" | "onChange"> & {
  /** Fields the user can filter on: `{ name, label, type, options, operators, placeholder }`. */
  fields: QueryField[]
  /** Operator definitions; defaults to `defaultOperators`. */
  operators?: QueryOperator[]
  value?: QueryGroup
  defaultValue?: QueryGroup
  onValueChange?: (value: QueryGroup) => void
  disabled?: boolean
  /** Nesting limit for "Add group"; the trigger hides past it. */
  maxDepth?: number
}

type QueryBuilderGroupProps = React.ComponentProps<typeof ark.div> & { group: QueryGroup }

type QueryBuilderGroupHeaderProps = React.ComponentProps<typeof ark.div>

type QueryBuilderMatchProps = Omit<
  React.ComponentProps<typeof Select.Root>,
  "collection" | "value" | "onValueChange"
> & {
  /** Text before the select. Defaults to "Match" at the top level and "Where" in nested groups. */
  before?: React.ReactNode
  /** Text rendered after the match select. */
  after?: React.ReactNode
}

type QueryBuilderGroupBodyProps = React.ComponentProps<typeof ark.div>

type QueryBuilderGroupFooterProps = React.ComponentProps<typeof ark.div>

type QueryBuilderRuleProps = React.ComponentProps<typeof ark.div> & { rule: QueryRule }

type QueryBuilderFieldSelectProps = PickerProps & { className?: string }

type QueryBuilderOperatorSelectProps = PickerProps & { className?: string }

type QueryBuilderValueEditorProps = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  children?: ((props: ValueEditorRenderProps) => React.ReactNode | undefined) | React.ReactElement
}

type QueryBuilderRuleActionsProps = React.ComponentProps<typeof ark.div>

type QueryBuilderAddRuleTriggerProps = React.ComponentProps<typeof Button>

type QueryBuilderAddGroupTriggerProps = React.ComponentProps<typeof Button>

type QueryBuilderRemoveTriggerProps = React.ComponentProps<typeof Button>

type QueryBuilderSummaryProps = React.ComponentProps<typeof ark.p> & { prefix?: React.ReactNode }

type QueryBuilderEmptyProps = React.ComponentProps<typeof ark.div>

const QueryBuilder = {
  Root: QueryBuilderRoot,
  Group: QueryBuilderGroup,
  GroupHeader: QueryBuilderGroupHeader,
  Match: QueryBuilderMatch,
  GroupBody: QueryBuilderGroupBody,
  GroupFooter: QueryBuilderGroupFooter,
  Rule: QueryBuilderRule,
  FieldSelect: QueryBuilderFieldSelect,
  OperatorSelect: QueryBuilderOperatorSelect,
  ValueEditor: QueryBuilderValueEditor,
  RuleActions: QueryBuilderRuleActions,
  AddRuleTrigger: QueryBuilderAddRuleTrigger,
  AddGroupTrigger: QueryBuilderAddGroupTrigger,
  RemoveTrigger: QueryBuilderRemoveTrigger,
  Summary: QueryBuilderSummary,
  Empty: QueryBuilderEmpty,
}

export {
  QueryBuilder,
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
  describeQuerySegments,
  type QuerySegment,
  pruneQuery,
  countIncomplete,
  type QueryField,
  type QueryFieldType,
  type QueryOption,
  type QueryOperator,
  type QueryRule,
  type QueryGroup,
  type QueryNode,
  type QueryBuilderRootProps,
  type QueryBuilderGroupProps,
  type QueryBuilderGroupHeaderProps,
  type QueryBuilderMatchProps,
  type QueryBuilderGroupBodyProps,
  type QueryBuilderGroupFooterProps,
  type QueryBuilderRuleProps,
  type QueryBuilderFieldSelectProps,
  type QueryBuilderOperatorSelectProps,
  type QueryBuilderValueEditorProps,
  type QueryBuilderRuleActionsProps,
  type QueryBuilderAddRuleTriggerProps,
  type QueryBuilderAddGroupTriggerProps,
  type QueryBuilderRemoveTriggerProps,
  type QueryBuilderSummaryProps,
  type QueryBuilderEmptyProps,
}

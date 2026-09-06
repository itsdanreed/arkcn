import {
  defaultOperators,
  isComplete,
  isGroup,
  pruneQuery,
  type QueryField,
  type QueryGroup,
  type QueryRule,
} from "@/components/ui/query-builder"

/**
 * Demo-only interpreters for the query tree. The toolkit primitive builds the
 * tree; what it means (SQL, an API payload, an in-memory filter) lives here.
 */

const sqlString = (v: unknown) => `'${String(v).replace(/'/g, "''")}'`
const sqlValue = (v: unknown, field?: QueryField) =>
  field?.type === "number" && v !== "" && !Number.isNaN(Number(v)) ? String(Number(v)) : sqlString(v)

function ruleToSql(rule: QueryRule, fields: QueryField[]): string | null {
  const field = fields.find((f) => f.name === rule.field)
  const col = rule.field
  const v = rule.value
  const one = () => sqlValue(v, field)
  const list = () => (v as unknown[]).map((x) => sqlValue(x, field)).join(", ")
  const pair = () => (v as unknown[]).map((x) => sqlValue(x, field))
  switch (rule.operator) {
    case "is":
      return `${col} = ${one()}`
    case "isNot":
      return `${col} <> ${one()}`
    case "contains":
      return `${col} LIKE ${sqlString(`%${v}%`)}`
    case "doesNotContain":
      return `${col} NOT LIKE ${sqlString(`%${v}%`)}`
    case "startsWith":
      return `${col} LIKE ${sqlString(`${v}%`)}`
    case "endsWith":
      return `${col} LIKE ${sqlString(`%${v}`)}`
    case "greaterThan":
    case "after":
      return `${col} > ${one()}`
    case "lessThan":
    case "before":
      return `${col} < ${one()}`
    case "atLeast":
      return `${col} >= ${one()}`
    case "atMost":
      return `${col} <= ${one()}`
    case "between":
      return `${col} BETWEEN ${pair()[0]} AND ${pair()[1]}`
    case "anyOf":
      return `${col} IN (${list()})`
    case "noneOf":
      return `${col} NOT IN (${list()})`
    case "isTrue":
      return `${col} = TRUE`
    case "isFalse":
      return `${col} = FALSE`
    case "isEmpty":
      return `${col} IS NULL`
    case "isNotEmpty":
      return `${col} IS NOT NULL`
    default:
      return null
  }
}

function groupToSql(group: QueryGroup, fields: QueryField[], depth = 0): string | null {
  const parts = group.rules
    .map((n) => (isGroup(n) ? groupToSql(n, fields, depth + 1) : ruleToSql(n, fields)))
    .filter((s): s is string => !!s)
  if (!parts.length) return null
  const joined = parts.join(group.match === "all" ? " AND " : " OR ")
  return depth > 0 && parts.length > 1 ? `(${joined})` : joined
}

/** SQL WHERE clause for the complete conditions. */
export function toSql(query: QueryGroup, fields: QueryField[]) {
  return groupToSql(pruneQuery(query), fields) ?? ""
}

/** The pruned tree as JSON, the shape an API would receive. */
export function toJson(query: QueryGroup) {
  return JSON.stringify(pruneQuery(query), null, 2)
}

const toNumber = (v: unknown) => (v instanceof Date ? v.getTime() : Number(v))
const toDay = (v: unknown) => {
  const d = v instanceof Date ? v : new Date(String(v))
  return Number.isNaN(d.getTime()) ? NaN : Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Evaluate the tree against a plain object in memory. Incomplete rules are ignored. */
export function matches(query: QueryGroup, row: Record<string, unknown>, fields: QueryField[]): boolean {
  const results = query.rules
    .map((n) => {
      if (isGroup(n)) return n.rules.length ? matches(n, row, fields) : null
      if (!isComplete(n, defaultOperators)) return null
      const field = fields.find((f) => f.name === n.field)
      const type = field?.type ?? "text"
      const raw = row[n.field]
      const value = n.value
      const empty = raw === undefined || raw === null || raw === ""
      const str = (x: unknown) => String(x ?? "").toLowerCase()
      const cmp = type === "date" ? toDay : type === "number" ? toNumber : str
      const eq = (a: unknown, b: unknown) =>
        type === "text" || type === "select" ? str(a) === str(b) : cmp(a) === cmp(b)
      switch (n.operator) {
        case "is":
          return eq(raw, value)
        case "isNot":
          return !eq(raw, value)
        case "contains":
          return str(raw).includes(str(value))
        case "doesNotContain":
          return !str(raw).includes(str(value))
        case "startsWith":
          return str(raw).startsWith(str(value))
        case "endsWith":
          return str(raw).endsWith(str(value))
        case "greaterThan":
        case "after":
          return cmp(raw) > cmp(value)
        case "lessThan":
        case "before":
          return cmp(raw) < cmp(value)
        case "atLeast":
          return cmp(raw) >= cmp(value)
        case "atMost":
          return cmp(raw) <= cmp(value)
        case "between": {
          const [a, b] = value as unknown[]
          return cmp(raw) >= cmp(a) && cmp(raw) <= cmp(b)
        }
        case "anyOf":
          return (value as unknown[]).some((v) => eq(raw, v))
        case "noneOf":
          return !(value as unknown[]).some((v) => eq(raw, v))
        case "isTrue":
          return raw === true
        case "isFalse":
          return raw === false
        case "isEmpty":
          return empty
        case "isNotEmpty":
          return !empty
        default:
          return null
      }
    })
    .filter((r): r is boolean => r !== null)
  if (!results.length) return true
  return query.match === "all" ? results.every(Boolean) : results.some(Boolean)
}

/**
 * Dependency-free spreadsheet formula layer. A cell whose text starts with `=` is a formula:
 * cell references (`A1`, `$B$2`), ranges (`A1:B3`), `+ - * /`, parentheses, unary minus,
 * numbers, quoted strings, and the functions SUM, AVERAGE, MIN, MAX, and COUNT (extend them
 * through `functions`). Evaluation is lazy and memoized per evaluator; cycles report `#CYCLE!`,
 * references outside the sheet `#REF!`, unknown names `#NAME?`, bad syntax `#ERROR!`, text in
 * arithmetic `#VALUE!`, and division by zero `#DIV/0!`.
 */

type FormulaValue = number | string | boolean | null
type FormulaError = "#REF!" | "#CYCLE!" | "#ERROR!" | "#DIV/0!" | "#VALUE!" | "#NAME?"
type FormulaResult = { value: FormulaValue; error?: FormulaError }
type CellAddress = { row: number; column: number }
/** A function receives its arguments with ranges flattened into the list. */
type FormulaFunction = (args: FormulaValue[]) => FormulaValue

const errorSet = new Set<string>(["#REF!", "#CYCLE!", "#ERROR!", "#DIV/0!", "#VALUE!", "#NAME?"])

/** 0 → "A", 25 → "Z", 26 → "AA". */
function columnLabel(index: number) {
  let label = ""
  let n = index
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}

/** "A" → 0, "AA" → 26; -1 when the label is not letters. */
function columnIndex(label: string) {
  if (!/^[A-Za-z]+$/.test(label)) return -1
  let n = 0
  for (const ch of label.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

/** `{ row: 2, column: 1 }` → "B3". */
function cellName(cell: CellAddress) {
  return `${columnLabel(cell.column)}${cell.row + 1}`
}

/** "B3" → `{ row: 2, column: 1 }`; `$` markers are accepted and ignored. */
function parseCellName(name: string): CellAddress | null {
  const m = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(name.trim())
  if (!m) return null
  const row = Number(m[2]) - 1
  const column = columnIndex(m[1])
  return row < 0 || column < 0 ? null : { row, column }
}

function isFormula(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("=")
}

function isFormulaError(value: unknown): value is FormulaError {
  return typeof value === "string" && errorSet.has(value)
}

/* --------------------------------- tokens -------------------------------- */

type Token =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "ref"; column: number; row: number; absColumn: boolean; absRow: boolean; text: string }
  | { type: "name"; value: string }
  | { type: "error"; value: FormulaError }
  | { type: "op"; value: string }

const refPattern = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_])/
const namePattern = /^[A-Za-z_][A-Za-z0-9_.]*/
const numberPattern = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < source.length) {
    const ch = source[i]
    if (ch === " " || ch === "\t" || ch === "\n") {
      i++
      continue
    }
    const rest = source.slice(i)
    let m = numberPattern.exec(rest)
    if (m) {
      tokens.push({ type: "number", value: Number(m[0]) })
      i += m[0].length
      continue
    }
    if (ch === '"') {
      let j = i + 1
      let text = ""
      while (j < source.length) {
        if (source[j] === '"') {
          if (source[j + 1] === '"') {
            text += '"'
            j += 2
            continue
          }
          break
        }
        text += source[j++]
      }
      if (source[j] !== '"') throw new SyntaxError("Unterminated string")
      tokens.push({ type: "string", value: text })
      i = j + 1
      continue
    }
    m = /^#(?:REF!|CYCLE!|ERROR!|DIV\/0!|VALUE!|NAME\?)/.exec(rest)
    if (m) {
      tokens.push({ type: "error", value: m[0] as FormulaError })
      i += m[0].length
      continue
    }
    m = refPattern.exec(rest)
    if (m) {
      tokens.push({
        type: "ref",
        column: columnIndex(m[2]),
        row: Number(m[4]) - 1,
        absColumn: m[1] === "$",
        absRow: m[3] === "$",
        text: m[0],
      })
      i += m[0].length
      continue
    }
    m = namePattern.exec(rest)
    if (m) {
      tokens.push({ type: "name", value: m[0].toUpperCase() })
      i += m[0].length
      continue
    }
    if ("+-*/(),:^".includes(ch)) {
      tokens.push({ type: "op", value: ch })
      i++
      continue
    }
    throw new SyntaxError(`Unexpected character ${ch}`)
  }
  return tokens
}

/* ---------------------------------- AST ---------------------------------- */

type Node =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "error"; value: FormulaError }
  | { kind: "ref"; cell: CellAddress }
  | { kind: "range"; from: CellAddress; to: CellAddress }
  | { kind: "unary"; op: "-" | "+"; operand: Node }
  | { kind: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: Node; right: Node }
  | { kind: "call"; name: string; args: Node[] }

function parse(tokens: Token[]): Node {
  let pos = 0
  const peek = () => tokens[pos]
  const isOp = (value: string) => {
    const t = peek()
    return t?.type === "op" && t.value === value
  }
  const expect = (value: string) => {
    if (!isOp(value)) throw new SyntaxError(`Expected ${value}`)
    pos++
  }
  const expression = (): Node => {
    let left = term()
    while (isOp("+") || isOp("-")) {
      const op = (tokens[pos++] as { value: "+" | "-" }).value
      left = { kind: "binary", op, left, right: term() }
    }
    return left
  }
  const term = (): Node => {
    let left = power()
    while (isOp("*") || isOp("/")) {
      const op = (tokens[pos++] as { value: "*" | "/" }).value
      left = { kind: "binary", op, left, right: power() }
    }
    return left
  }
  const power = (): Node => {
    const base = unary()
    if (isOp("^")) {
      pos++
      return { kind: "binary", op: "^", left: base, right: power() }
    }
    return base
  }
  const unary = (): Node => {
    if (isOp("-") || isOp("+")) {
      const op = (tokens[pos++] as { value: "-" | "+" }).value
      return { kind: "unary", op, operand: unary() }
    }
    return primary()
  }
  const primary = (): Node => {
    const t = peek()
    if (!t) throw new SyntaxError("Unexpected end")
    if (t.type === "number") {
      pos++
      return { kind: "number", value: t.value }
    }
    if (t.type === "string") {
      pos++
      return { kind: "string", value: t.value }
    }
    if (t.type === "error") {
      pos++
      return { kind: "error", value: t.value }
    }
    if (t.type === "ref") {
      pos++
      const from = { row: t.row, column: t.column }
      if (isOp(":")) {
        pos++
        const to = peek()
        if (to?.type !== "ref") throw new SyntaxError("Expected a cell after :")
        pos++
        return { kind: "range", from, to: { row: to.row, column: to.column } }
      }
      return { kind: "ref", cell: from }
    }
    if (t.type === "name") {
      pos++
      expect("(")
      const args: Node[] = []
      if (!isOp(")")) {
        args.push(expression())
        while (isOp(",")) {
          pos++
          args.push(expression())
        }
      }
      expect(")")
      return { kind: "call", name: t.value, args }
    }
    if (t.type === "op" && t.value === "(") {
      pos++
      const inner = expression()
      expect(")")
      return inner
    }
    throw new SyntaxError("Unexpected token")
  }
  const node = expression()
  if (pos < tokens.length) throw new SyntaxError("Unexpected token")
  return node
}

/** Parses `=…` source into an AST; throws `SyntaxError` on bad input. */
function parseFormula(source: string): Node {
  return parse(tokenize(source.startsWith("=") ? source.slice(1) : source))
}

/* -------------------------------- functions ------------------------------- */

const numbers = (args: FormulaValue[]) => args.filter((v): v is number => typeof v === "number")

/** The built-in functions; spread them into `functions` to extend the set. */
const formulaFunctions: Record<string, FormulaFunction> = {
  SUM: (args) => numbers(args).reduce((sum, n) => sum + n, 0),
  AVERAGE: (args) => {
    const ns = numbers(args)
    return ns.length ? ns.reduce((sum, n) => sum + n, 0) / ns.length : 0
  },
  MIN: (args) => {
    const ns = numbers(args)
    return ns.length ? Math.min(...ns) : 0
  },
  MAX: (args) => {
    const ns = numbers(args)
    return ns.length ? Math.max(...ns) : 0
  },
  COUNT: (args) => numbers(args).length,
}

/* -------------------------------- evaluator ------------------------------- */

class FormulaFailure extends Error {
  code: FormulaError
  constructor(code: FormulaError) {
    super(code)
    this.code = code
  }
}

/** Coerces a cell value for arithmetic: empty is 0, numeric text is a number, other text fails. */
function toNumber(value: FormulaValue): number {
  if (typeof value === "number") return value
  if (value === null || value === "") return 0
  if (typeof value === "boolean") return value ? 1 : 0
  const n = Number(value)
  if (Number.isNaN(n)) throw new FormulaFailure("#VALUE!")
  return n
}

/** Raw cell text to a formula value: numeric text becomes a number. */
function toFormulaValue(raw: unknown): FormulaValue {
  if (raw === null || raw === undefined) return null
  if (typeof raw === "number" || typeof raw === "boolean") return raw
  const text = String(raw)
  if (text.trim() !== "" && !Number.isNaN(Number(text))) return Number(text)
  return text
}

type EvaluatorOptions = {
  rowCount: number
  columnCount: number
  functions?: Record<string, FormulaFunction>
}

/**
 * Builds a memoizing evaluator over `getRaw`. Create a new one whenever the data changes;
 * `evaluate` resolves a cell (formula or not) and `display` formats it for rendering.
 */
function createFormulaEvaluator(getRaw: (cell: CellAddress) => unknown, options: EvaluatorOptions) {
  const cache = new Map<number, FormulaResult>()
  const visiting = new Set<number>()
  const parsed = new Map<string, Node | SyntaxError>()
  const functions = { ...formulaFunctions, ...options.functions }
  const key = (cell: CellAddress) => cell.row * 1_048_576 + cell.column
  const inBounds = (cell: CellAddress) =>
    cell.row >= 0 && cell.column >= 0 && cell.row < options.rowCount && cell.column < options.columnCount

  const ast = (source: string) => {
    let node = parsed.get(source)
    if (!node) {
      try {
        node = parseFormula(source)
      } catch (error) {
        node = error as SyntaxError
      }
      parsed.set(source, node)
    }
    if (node instanceof SyntaxError) throw new FormulaFailure("#ERROR!")
    return node
  }

  const resolve = (cell: CellAddress): FormulaValue => {
    if (!inBounds(cell)) throw new FormulaFailure("#REF!")
    const result = evaluate(cell)
    if (result.error) throw new FormulaFailure(result.error)
    return result.value
  }

  const flatten = (node: Node, out: FormulaValue[]) => {
    if (node.kind === "range") {
      const r0 = Math.min(node.from.row, node.to.row)
      const r1 = Math.max(node.from.row, node.to.row)
      const c0 = Math.min(node.from.column, node.to.column)
      const c1 = Math.max(node.from.column, node.to.column)
      if (!inBounds({ row: r0, column: c0 }) || !inBounds({ row: r1, column: c1 })) throw new FormulaFailure("#REF!")
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push(resolve({ row: r, column: c }))
      return
    }
    out.push(run(node))
  }

  const run = (node: Node): FormulaValue => {
    switch (node.kind) {
      case "number":
      case "string":
        return node.value
      case "error":
        throw new FormulaFailure(node.value)
      case "ref":
        return resolve(node.cell)
      case "range":
        throw new FormulaFailure("#VALUE!")
      case "unary": {
        const v = toNumber(run(node.operand))
        return node.op === "-" ? -v : v
      }
      case "binary": {
        const a = toNumber(run(node.left))
        const b = toNumber(run(node.right))
        switch (node.op) {
          case "+":
            return a + b
          case "-":
            return a - b
          case "*":
            return a * b
          case "/":
            if (b === 0) throw new FormulaFailure("#DIV/0!")
            return a / b
          case "^":
            return a ** b
        }
        break
      }
      case "call": {
        const fn = functions[node.name]
        if (!fn) throw new FormulaFailure("#NAME?")
        const args: FormulaValue[] = []
        for (const arg of node.args) flatten(arg, args)
        return fn(args)
      }
    }
    throw new FormulaFailure("#ERROR!")
  }

  const evaluate = (cell: CellAddress): FormulaResult => {
    const k = key(cell)
    const cached = cache.get(k)
    if (cached) return cached
    const raw = getRaw(cell)
    let result: FormulaResult
    if (!isFormula(raw)) {
      result = { value: toFormulaValue(raw) }
    } else if (visiting.has(k)) {
      return { value: "#CYCLE!", error: "#CYCLE!" }
    } else {
      visiting.add(k)
      try {
        const value = run(ast(raw))
        result = { value: typeof value === "number" && !Number.isFinite(value) ? "#DIV/0!" : value }
        if (result.value === "#DIV/0!") result.error = "#DIV/0!"
      } catch (error) {
        const code = error instanceof FormulaFailure ? error.code : "#ERROR!"
        result = { value: code, error: code }
      } finally {
        visiting.delete(k)
      }
    }
    cache.set(k, result)
    return result
  }

  return { evaluate, display: (cell: CellAddress) => formatFormulaValue(evaluate(cell).value) }
}

/** Formats a value for a cell: numbers without float noise, booleans as TRUE/FALSE. */
function formatFormulaValue(value: FormulaValue) {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(12)))
  return value
}

/** Rewrites relative references in a formula by an offset (fill handle); `$` parts stay put. */
function shiftFormula(formula: string, deltaRow: number, deltaColumn: number) {
  if (!isFormula(formula) || (deltaRow === 0 && deltaColumn === 0)) return formula
  return (
    "=" +
    formula
      .slice(1)
      .split(/("(?:[^"]|"")*")/)
      .map((part, index) => {
        // Odd parts are quoted strings and stay untouched.
        if (index % 2) return part
        return part.replace(/(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_(])/g, (_, absC, col, absR, row) => {
          const c = absC ? columnIndex(col) : columnIndex(col) + deltaColumn
          const r = absR ? Number(row) : Number(row) + deltaRow
          if (c < 0 || r < 1) return "#REF!"
          return `${absC}${columnLabel(c)}${absR}${r}`
        })
      })
      .join("")
  )
}

export {
  columnLabel,
  columnIndex,
  cellName,
  parseCellName,
  isFormula,
  isFormulaError,
  parseFormula,
  formulaFunctions,
  createFormulaEvaluator,
  formatFormulaValue,
  shiftFormula,
  toFormulaValue,
  type FormulaValue,
  type FormulaError,
  type FormulaResult,
  type FormulaFunction,
  type CellAddress as FormulaCellAddress,
}

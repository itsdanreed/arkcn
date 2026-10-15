"use client"

import * as React from "react"
import { ark } from "@ark-ui/react"
import { Input } from "./input"
import { cn } from "../../lib/utils"
import { useControllable } from "../../lib/controllable"
import { useHistory } from "../../lib/history"
import {
  cellName,
  columnLabel,
  createFormulaEvaluator,
  isFormula,
  shiftFormula,
  type FormulaCellAddress,
  type FormulaFunction,
  type FormulaResult,
} from "../../lib/formula"
import { rowMetrics, rowAtOffset } from "../../lib/spreadsheet-layout"
import { LiveRegion, useLiveRegion } from "./live-region"

/**
 * Spreadsheet — a compositional, data-agnostic sheet. The consumer owns the cells
 * (`data`, rows of values); the root owns the selection, the editing draft, the
 * viewport window, column widths, and an undo stack of intents. Every edit is an
 * intent: `onCellsChange([{ row, column, value, previous }])`, and the consumer
 * applies it. Cells whose text starts with `=` are formulas (`lib/formula.ts`).
 *
 * Anatomy:
 *   Spreadsheet.Root { data, onCellsChange, frozenRows, frozenColumns }
 *     Spreadsheet.FormulaBar > Spreadsheet.NameBox + Spreadsheet.FormulaInput
 *     Spreadsheet.Container                      scroll viewport, role="grid", keyboard target
 *       Spreadsheet.Header > Spreadsheet.HeaderRow > Spreadsheet.Corner + Spreadsheet.ColumnHeader column=
 *       Spreadsheet.Body                         virtualized rows
 *         Spreadsheet.Row row= > Spreadsheet.RowHeader + Spreadsheet.Cell row= column= (+ Spreadsheet.FillHandle)
 *       Spreadsheet.Empty
 *     Spreadsheet.UndoTrigger / Spreadsheet.RedoTrigger
 *
 * Keyboard: arrows move, Shift+arrows extend, ⌘/Ctrl+arrows jump to the edge, Home/End
 * and ⌘Home/End, PageUp/PageDown, Enter/F2/typing edit, Enter commits and moves down,
 * Tab commits and moves right, Escape cancels, Delete clears, ⌘C/⌘X/⌘V copy/cut/paste
 * TSV, ⌘Z/⇧⌘Z undo/redo, ⌘A selects all, Shift+Space / Ctrl+Space select a row / column.
 */

type SpreadsheetValue = string | number | boolean | null
type SpreadsheetCellAddress = FormulaCellAddress
type SpreadsheetSelection = { anchor: SpreadsheetCellAddress; focus: SpreadsheetCellAddress }
type SpreadsheetBounds = { r0: number; r1: number; c0: number; c1: number }
type SpreadsheetChange = { row: number; column: number; value: SpreadsheetValue; previous: SpreadsheetValue }
type SpreadsheetData = readonly (readonly (SpreadsheetValue | undefined)[])[]

type Editing = { row: number; column: number; draft: string; via: "cell" | "bar" }

const DEFAULT_COLUMN_WIDTH = 100
const MIN_COLUMN_WIDTH = 40
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/* ---------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------- */

type SpreadsheetContextValue = {
  id: string
  rowCount: number
  columnCount: number
  rowHeight: number
  heights: number[]
  rowOffsets: number[]
  minRowHeight: number
  setHeight: (row: number, height: number) => void
  resetHeight: (row: number) => void
  rowHeaderWidth: number
  frozenRows: number
  frozenColumns: number
  readOnly: boolean
  /** Column widths in order. */
  widths: number[]
  /** Left offset of each column, not counting the row header. */
  offsets: number[]
  totalWidth: number
  templateColumns: string
  setWidth: (column: number, width: number) => void
  resetWidth: (column: number) => void
  minColumnWidth: number
  getRaw: (cell: SpreadsheetCellAddress) => SpreadsheetValue
  /** The raw value as editor text. */
  getText: (cell: SpreadsheetCellAddress) => string
  getResult: (cell: SpreadsheetCellAddress) => FormulaResult
  getDisplay: (cell: SpreadsheetCellAddress) => string
  selection: SpreadsheetSelection | null
  bounds: SpreadsheetBounds | null
  focusCell: (cell: SpreadsheetCellAddress, options?: { extend?: boolean; scroll?: boolean }) => void
  select: (selection: SpreadsheetSelection | null) => void
  selectRow: (row: number, extend?: boolean) => void
  selectColumn: (column: number, extend?: boolean) => void
  selectAll: () => void
  editing: Editing | null
  startEditing: (cell: SpreadsheetCellAddress, seed?: string, via?: Editing["via"]) => void
  setDraft: (draft: string) => void
  commitEditing: (options?: { move?: "down" | "up" | "right" | "left" | "none" }) => void
  cancelEditing: () => void
  applyChanges: (changes: SpreadsheetChange[], label?: string) => void
  clearRange: () => void
  copyRange: () => string
  pasteText: (text: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  fillPreview: SpreadsheetBounds | null
  startDrag: (kind: "select" | "fill", event: React.PointerEvent) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  focusContainer: () => void
  window: { start: number; end: number }
  visibleColumns: number[]
  setScrollLeft: (left: number) => void
  setViewportWidth: (width: number) => void
  setScrollTop: (top: number) => void
  setViewportHeight: (height: number) => void
  announce: (message: string) => void
}

const SpreadsheetContext = React.createContext<SpreadsheetContextValue | null>(null)
const RowContext = React.createContext<number | null>(null)

function useSpreadsheet() {
  const ctx = React.useContext(SpreadsheetContext)
  if (!ctx) throw new Error("Spreadsheet parts must be used within <Spreadsheet.Root>")
  return ctx
}

const boundsOf = (selection: SpreadsheetSelection | null): SpreadsheetBounds | null =>
  selection
    ? {
        r0: Math.min(selection.anchor.row, selection.focus.row),
        r1: Math.max(selection.anchor.row, selection.focus.row),
        c0: Math.min(selection.anchor.column, selection.focus.column),
        c1: Math.max(selection.anchor.column, selection.focus.column),
      }
    : null

const sameCell = (a: SpreadsheetCellAddress | null | undefined, b: SpreadsheetCellAddress | null | undefined) =>
  !!a && !!b && a.row === b.row && a.column === b.column

const rawText = (value: SpreadsheetValue | undefined) =>
  value === null || value === undefined ? "" : typeof value === "boolean" ? (value ? "TRUE" : "FALSE") : String(value)

/** Editor text to a cell value: empty is null, numeric text is a number, the rest (formulas included) is text. */
function parseInput(text: string): SpreadsheetValue {
  if (text === "") return null
  if (text.trim() !== "" && !text.startsWith("=") && /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(text.trim()))
    return Number(text)
  return text
}

const cellId = (id: string, cell: SpreadsheetCellAddress) => `${id}-r${cell.row}-c${cell.column}`

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

function SpreadsheetRoot({
  data,
  rowCount: rowCountProp,
  columnCount: columnCountProp,
  onCellsChange,
  rowHeight = 32,
  minRowHeight = 24,
  rowHeights,
  defaultRowHeights,
  onRowHeightsChange,
  rowHeaderWidth = 48,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  minColumnWidth = MIN_COLUMN_WIDTH,
  columnWidths: widthsProp,
  defaultColumnWidths,
  onColumnWidthsChange,
  selection: selectionProp,
  defaultSelection,
  onSelectionChange,
  frozenRows = 0,
  frozenColumns = 0,
  overscan = 6,
  readOnly = false,
  functions,
  historyLimit = 100,
  className,
  children,
  ...props
}: SpreadsheetRootProps) {
  const id = React.useId()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const rowCount = rowCountProp ?? data.length
  const longestRow = React.useMemo(() => {
    let longest = 0
    for (const row of data) if (row.length > longest) longest = row.length
    return longest
  }, [data])
  const columnCount = columnCountProp ?? longestRow

  const [rowSizing, setRowSizing] = useControllable(rowHeights, defaultRowHeights ?? {}, onRowHeightsChange)
  const { heights, offsets: rowOffsets } = React.useMemo(
    () => rowMetrics(rowCount, rowHeight, minRowHeight, rowSizing),
    [rowCount, rowHeight, minRowHeight, rowSizing]
  )
  const setHeight = React.useCallback(
    (row: number, height: number) => {
      if (Number.isFinite(height))
        setRowSizing((prev) => ({ ...prev, [row]: Math.max(minRowHeight, Math.round(height)) }))
    },
    [minRowHeight, setRowSizing]
  )
  const resetHeight = React.useCallback(
    (row: number) =>
      setRowSizing((prev) => {
        const next = { ...prev }
        delete next[row]
        return next
      }),
    [setRowSizing]
  )

  /* Column widths (controllable) */
  const [initialWidths] = React.useState<Record<number, number>>(() => defaultColumnWidths ?? {})
  const [sizing, setSizing] = useControllable(widthsProp, initialWidths, onColumnWidthsChange)
  const setWidth = React.useCallback(
    (column: number, width: number) =>
      setSizing((prev) => ({ ...prev, [column]: Math.max(minColumnWidth, Math.round(width)) })),
    [setSizing, minColumnWidth]
  )
  const resetWidth = React.useCallback(
    (column: number) =>
      setSizing((prev) => {
        if (!(column in prev)) return prev
        const next = { ...prev }
        delete next[column]
        return next
      }),
    [setSizing]
  )
  const { widths, offsets, totalWidth, templateColumns } = React.useMemo(() => {
    const widths: number[] = []
    const offsets: number[] = []
    let offset = 0
    for (let c = 0; c < columnCount; c++) {
      const w = Math.max(minColumnWidth, sizing[c] ?? columnWidth)
      widths.push(w)
      offsets.push(offset)
      offset += w
    }
    return {
      widths,
      offsets,
      totalWidth: rowHeaderWidth + offset,
      templateColumns: [`${rowHeaderWidth}px`, ...widths.map((w) => `${w}px`)].join(" "),
    }
  }, [columnCount, sizing, columnWidth, minColumnWidth, rowHeaderWidth])

  /* Values and formulas */
  const getRaw = React.useCallback(
    (cell: SpreadsheetCellAddress): SpreadsheetValue => {
      const value = data[cell.row]?.[cell.column]
      return value === undefined ? null : value
    },
    [data]
  )
  const evaluator = React.useMemo(
    () => createFormulaEvaluator(getRaw, { rowCount, columnCount, functions }),
    [getRaw, rowCount, columnCount, functions]
  )
  const getText = React.useCallback((cell: SpreadsheetCellAddress) => rawText(getRaw(cell)), [getRaw])
  const getResult = React.useCallback((cell: SpreadsheetCellAddress) => evaluator.evaluate(cell), [evaluator])
  const getDisplay = React.useCallback((cell: SpreadsheetCellAddress) => evaluator.display(cell), [evaluator])

  /* Selection (controllable) */
  const [initialSelection] = React.useState<SpreadsheetSelection | null>(() => defaultSelection ?? null)
  const [selection, setSelection] = useControllable<SpreadsheetSelection | null>(
    selectionProp,
    initialSelection,
    onSelectionChange
  )
  const bounds = React.useMemo(() => boundsOf(selection), [selection])

  /* Editing, fill, window, announcements */
  const [editing, setEditingState] = React.useState<Editing | null>(null)
  const editingRef = React.useRef<Editing | null>(null)
  const setEditing = React.useCallback((next: Editing | null) => {
    editingRef.current = next
    setEditingState(next)
  }, [])
  const [fillPreview, setFillPreview] = React.useState<SpreadsheetBounds | null>(null)
  const [scrollTop, setScrollTopState] = React.useState(0)
  const [viewportHeight, setViewportHeight] = React.useState(0)
  const [scrollLeft, setScrollLeft] = React.useState(0)
  const [viewportWidth, setViewportWidth] = React.useState(0)
  const setScrollTop = React.useCallback((top: number) => setScrollTopState(top), [])
  const { message: announcement, announce } = useLiveRegion({ clearAfter: 4000 })

  const window = React.useMemo(() => {
    const scrollable = Math.max(0, rowCount - frozenRows)
    const start = clamp(
      rowAtOffset(rowOffsets, scrollTop + rowOffsets[frozenRows]) - frozenRows - overscan,
      0,
      scrollable
    )
    const end = clamp(
      rowAtOffset(rowOffsets, scrollTop + viewportHeight + rowOffsets[frozenRows]) - frozenRows + 1 + overscan,
      0,
      scrollable
    )
    return { start, end }
  }, [scrollTop, viewportHeight, rowOffsets, overscan, rowCount, frozenRows])

  // Search measured boundaries so resized columns use the same geometry as scrolling.
  const columnOffsets = React.useMemo(
    () => [...offsets, totalWidth - rowHeaderWidth],
    [offsets, totalWidth, rowHeaderWidth]
  )
  const visibleColumns = React.useMemo(() => {
    const frozen = Math.min(frozenColumns, columnCount)
    const start = Math.max(frozen, rowAtOffset(columnOffsets, scrollLeft + columnOffsets[frozen]) - overscan)
    const end = Math.min(
      columnCount,
      rowAtOffset(columnOffsets, Math.max(0, scrollLeft + viewportWidth - rowHeaderWidth)) + 1 + overscan
    )
    const columns = new Set<number>()
    for (let column = 0; column < frozen; column++) columns.add(column)
    for (let column = start; column < end; column++) columns.add(column)
    // Keep the editor mounted and the active descendant available offscreen.
    if (editing) columns.add(editing.column)
    if (selection) columns.add(selection.focus.column)
    return [...columns].filter((column) => column >= 0 && column < columnCount).sort((a, b) => a - b)
  }, [
    columnOffsets,
    frozenColumns,
    columnCount,
    scrollLeft,
    viewportWidth,
    rowHeaderWidth,
    overscan,
    editing,
    selection,
  ])

  /* Undo stack: `present` is how many of the recorded batches are applied. */
  const history = useHistory<number>(0, historyLimit)
  const batches = React.useRef<SpreadsheetChange[][]>([])

  const latest = React.useRef({
    data,
    rowCount,
    columnCount,
    selection,
    bounds,
    onCellsChange,
    getRaw,
    getDisplay,
    widths,
    offsets,
    frozenRows,
    frozenColumns,
    rowHeight,
    heights,
    rowOffsets,
    rowHeaderWidth,
    readOnly,
    present: history.present,
  })
  latest.current = {
    data,
    rowCount,
    columnCount,
    selection,
    bounds,
    onCellsChange,
    getRaw,
    getDisplay,
    widths,
    offsets,
    frozenRows,
    frozenColumns,
    rowHeight,
    heights,
    rowOffsets,
    rowHeaderWidth,
    readOnly,
    present: history.present,
  }

  const focusContainer = React.useCallback(() => containerRef.current?.focus({ preventScroll: true }), [])

  const scrollCellIntoView = React.useCallback((cell: SpreadsheetCellAddress) => {
    const el = containerRef.current
    const { frozenRows, frozenColumns, rowHeight, heights, rowOffsets, rowHeaderWidth, widths, offsets } =
      latest.current
    if (!el) return
    const headerHeight = el.querySelector<HTMLElement>("[data-slot=spreadsheet-header]")?.offsetHeight ?? rowHeight
    if (cell.row >= frozenRows) {
      const top = rowOffsets[cell.row] - rowOffsets[frozenRows]
      const bottom = top + heights[cell.row]
      const viewHeight = el.clientHeight - headerHeight
      if (top < el.scrollTop) el.scrollTop = top
      else if (bottom > el.scrollTop + viewHeight) el.scrollTop = bottom - viewHeight
    }
    if (cell.column >= frozenColumns) {
      const frozenWidth = offsets[frozenColumns] ?? 0
      const left = offsets[cell.column] - frozenWidth
      const right = left + widths[cell.column]
      const viewWidth = el.clientWidth - rowHeaderWidth - frozenWidth
      if (left < el.scrollLeft) el.scrollLeft = left
      else if (right > el.scrollLeft + viewWidth) el.scrollLeft = right - viewWidth
    }
  }, [])

  const applyChanges = React.useCallback(
    (changes: SpreadsheetChange[], label?: string) => {
      const real = changes.filter((c) => !Object.is(c.previous, c.value))
      if (!real.length) return
      latest.current.onCellsChange?.(real)
      batches.current = [...batches.current.slice(0, latest.current.present), real]
      history.set((n) => n + 1)
      if (label) announce(label)
    },
    [history, announce]
  )

  const commitEditing = React.useCallback(
    (options?: { move?: "down" | "up" | "right" | "left" | "none" }) => {
      const current = editingRef.current
      if (!current) return
      setEditing(null)
      const cell = { row: current.row, column: current.column }
      const previous = latest.current.getRaw(cell)
      applyChanges([{ ...cell, value: parseInput(current.draft), previous }])
      const move = options?.move ?? "none"
      const next =
        move === "down"
          ? { row: cell.row + 1, column: cell.column }
          : move === "up"
            ? { row: cell.row - 1, column: cell.column }
            : move === "right"
              ? { row: cell.row, column: cell.column + 1 }
              : move === "left"
                ? { row: cell.row, column: cell.column - 1 }
                : cell
      focusCellRef.current(next)
      focusContainer()
    },
    [applyChanges, setEditing, focusContainer]
  )

  const focusCell = React.useCallback(
    (cell: SpreadsheetCellAddress, options?: { extend?: boolean; scroll?: boolean }) => {
      const { rowCount, columnCount, selection } = latest.current
      if (!rowCount || !columnCount) return
      if (editingRef.current) commitEditing()
      const next = { row: clamp(cell.row, 0, rowCount - 1), column: clamp(cell.column, 0, columnCount - 1) }
      const anchor = options?.extend && selection ? selection.anchor : next
      setSelection((prev) =>
        sameCell(prev?.anchor, anchor) && sameCell(prev?.focus, next) ? prev : { anchor, focus: next }
      )
      if (options?.scroll !== false) scrollCellIntoView(next)
    },
    [setSelection, scrollCellIntoView, commitEditing]
  )
  const focusCellRef = React.useRef(focusCell)
  focusCellRef.current = focusCell

  const select = React.useCallback(
    (next: SpreadsheetSelection | null) => {
      if (editingRef.current) commitEditing()
      setSelection(next)
    },
    [setSelection, commitEditing]
  )
  const selectRow = React.useCallback(
    (row: number, extend = false) => {
      const { columnCount, selection } = latest.current
      const anchorRow = extend && selection ? selection.anchor.row : row
      select({ anchor: { row: anchorRow, column: 0 }, focus: { row, column: columnCount - 1 } })
    },
    [select]
  )
  const selectColumn = React.useCallback(
    (column: number, extend = false) => {
      const { rowCount, selection } = latest.current
      const anchorColumn = extend && selection ? selection.anchor.column : column
      select({ anchor: { row: 0, column: anchorColumn }, focus: { row: rowCount - 1, column } })
    },
    [select]
  )
  const selectAll = React.useCallback(() => {
    const { rowCount, columnCount } = latest.current
    if (rowCount && columnCount)
      select({ anchor: { row: 0, column: 0 }, focus: { row: rowCount - 1, column: columnCount - 1 } })
  }, [select])

  const startEditing = React.useCallback(
    (cell: SpreadsheetCellAddress, seed?: string, via: Editing["via"] = "cell") => {
      if (latest.current.readOnly) return
      if (editingRef.current && !sameCell(editingRef.current, cell)) commitEditing()
      setEditing({ ...cell, draft: seed ?? rawText(latest.current.getRaw(cell)), via })
    },
    [setEditing, commitEditing]
  )
  const setDraft = React.useCallback(
    (draft: string) => {
      const current = editingRef.current
      if (current) setEditing({ ...current, draft })
    },
    [setEditing]
  )
  const cancelEditing = React.useCallback(() => {
    if (!editingRef.current) return
    setEditing(null)
    focusContainer()
  }, [setEditing, focusContainer])

  const clearRange = React.useCallback(() => {
    const { bounds, getRaw, readOnly } = latest.current
    if (!bounds || readOnly) return
    const changes: SpreadsheetChange[] = []
    for (let r = bounds.r0; r <= bounds.r1; r++)
      for (let c = bounds.c0; c <= bounds.c1; c++) {
        const previous = getRaw({ row: r, column: c })
        if (previous !== null) changes.push({ row: r, column: c, value: null, previous })
      }
    applyChanges(changes, `Cleared ${changes.length} cell${changes.length === 1 ? "" : "s"}.`)
  }, [applyChanges])

  const copyRange = React.useCallback(() => {
    const { bounds, getDisplay } = latest.current
    if (!bounds) return ""
    const lines: string[] = []
    for (let r = bounds.r0; r <= bounds.r1; r++) {
      const cells: string[] = []
      for (let c = bounds.c0; c <= bounds.c1; c++) cells.push(getDisplay({ row: r, column: c }))
      lines.push(cells.join("\t"))
    }
    const n = (bounds.r1 - bounds.r0 + 1) * (bounds.c1 - bounds.c0 + 1)
    announce(`Copied ${n} cell${n === 1 ? "" : "s"}.`)
    return lines.join("\n")
  }, [announce])

  const pasteText = React.useCallback(
    (text: string) => {
      const { selection, bounds, rowCount, columnCount, getRaw, readOnly } = latest.current
      if (!selection || !bounds || readOnly) return
      const lines = text
        .replace(/\r/g, "")
        .split("\n")
        .filter((l, i, arr) => l !== "" || i < arr.length - 1)
      const rows = lines.map((line) => line.split("\t"))
      if (!rows.length) return
      const changes: SpreadsheetChange[] = []
      let r1 = bounds.r0
      let c1 = bounds.c0
      // A single value fills the whole selection; a block pastes from its top-left corner.
      const single = rows.length === 1 && rows[0].length === 1
      const targetRows = single ? bounds.r1 - bounds.r0 + 1 : rows.length
      const targetCols = single ? bounds.c1 - bounds.c0 + 1 : Math.max(...rows.map((r) => r.length))
      for (let dr = 0; dr < targetRows; dr++) {
        const row = bounds.r0 + dr
        if (row >= rowCount) break
        for (let dc = 0; dc < targetCols; dc++) {
          const column = bounds.c0 + dc
          if (column >= columnCount) break
          const text = single ? rows[0][0] : rows[dr][dc]
          if (text === undefined) continue
          r1 = Math.max(r1, row)
          c1 = Math.max(c1, column)
          changes.push({ row, column, value: parseInput(text), previous: getRaw({ row, column }) })
        }
      }
      applyChanges(changes, `Pasted into ${changes.length} cell${changes.length === 1 ? "" : "s"}.`)
      setSelection({ anchor: { row: bounds.r0, column: bounds.c0 }, focus: { row: r1, column: c1 } })
    },
    [applyChanges, setSelection]
  )

  const undo = React.useCallback(() => {
    const batch = batches.current[latest.current.present - 1]
    if (!batch) return
    history.undo()
    latest.current.onCellsChange?.(batch.map((c) => ({ ...c, value: c.previous, previous: c.value })))
    announce("Undid the last change.")
  }, [history, announce])
  const redo = React.useCallback(() => {
    const batch = batches.current[latest.current.present]
    if (!batch) return
    history.redo()
    latest.current.onCellsChange?.(batch)
    announce("Redid the last change.")
  }, [history, announce])

  /* Pointer drags: range selection and the fill handle. */
  const cellAt = React.useCallback((clientX: number, clientY: number): SpreadsheetCellAddress | null => {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const x = clamp(clientX, rect.left + latest.current.rowHeaderWidth + 1, rect.right - 2)
    const y = clamp(clientY, rect.top + latest.current.rowHeight + 1, rect.bottom - 2)
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-slot=spreadsheet-cell]")
    if (!target || !el.contains(target)) return null
    return { row: Number(target.dataset.row), column: Number(target.dataset.column) }
  }, [])

  const fillTarget = React.useCallback((source: SpreadsheetBounds, cell: SpreadsheetCellAddress): SpreadsheetBounds => {
    const down = cell.row - source.r1
    const up = source.r0 - cell.row
    const right = cell.column - source.c1
    const left = source.c0 - cell.column
    const best = Math.max(down, up, right, left)
    if (best <= 0) return source
    if (best === down) return { ...source, r1: cell.row }
    if (best === up) return { ...source, r0: cell.row }
    if (best === right) return { ...source, c1: cell.column }
    return { ...source, c0: cell.column }
  }, [])

  const applyFill = React.useCallback(
    (source: SpreadsheetBounds, target: SpreadsheetBounds) => {
      const { getRaw } = latest.current
      const changes: SpreadsheetChange[] = []
      const vertical = target.r0 !== source.r0 || target.r1 !== source.r1
      const h = source.r1 - source.r0 + 1
      const w = source.c1 - source.c0 + 1
      for (let r = target.r0; r <= target.r1; r++) {
        for (let c = target.c0; c <= target.c1; c++) {
          if (r >= source.r0 && r <= source.r1 && c >= source.c0 && c <= source.c1) continue
          const line: SpreadsheetValue[] = []
          if (vertical) for (let i = source.r0; i <= source.r1; i++) line.push(getRaw({ row: i, column: c }))
          else for (let i = source.c0; i <= source.c1; i++) line.push(getRaw({ row: r, column: i }))
          const step = seriesStep(line)
          let value: SpreadsheetValue
          let srcRow = r
          let srcCol = c
          if (vertical) {
            const after = r > source.r1
            const k = after ? r - source.r1 : source.r0 - r
            if (step !== null)
              value = after ? (line[line.length - 1] as number) + step * k : (line[0] as number) - step * k
            else {
              srcRow = after ? source.r0 + ((r - source.r0) % h) : source.r1 - ((source.r1 - r) % h)
              value = getRaw({ row: srcRow, column: c })
            }
          } else {
            const after = c > source.c1
            const k = after ? c - source.c1 : source.c0 - c
            if (step !== null)
              value = after ? (line[line.length - 1] as number) + step * k : (line[0] as number) - step * k
            else {
              srcCol = after ? source.c0 + ((c - source.c0) % w) : source.c1 - ((source.c1 - c) % w)
              value = getRaw({ row: r, column: srcCol })
            }
          }
          if (isFormula(value)) value = shiftFormula(value, r - srcRow, c - srcCol)
          changes.push({ row: r, column: c, value, previous: getRaw({ row: r, column: c }) })
        }
      }
      applyChanges(changes, `Filled ${changes.length} cell${changes.length === 1 ? "" : "s"}.`)
      setSelection({ anchor: { row: target.r0, column: target.c0 }, focus: { row: target.r1, column: target.c1 } })
    },
    [applyChanges, setSelection]
  )

  const startDrag = React.useCallback(
    (kind: "select" | "fill", event: React.PointerEvent) => {
      const el = containerRef.current
      const source = latest.current.bounds
      if (!el || (kind === "fill" && (!source || latest.current.readOnly))) return
      let pointer = { x: event.clientX, y: event.clientY }
      let target: SpreadsheetBounds | null = null
      let frame = 0
      const update = () => {
        const cell = cellAt(pointer.x, pointer.y)
        if (!cell) return
        if (kind === "select") {
          setSelection((prev) => (prev && !sameCell(prev.focus, cell) ? { anchor: prev.anchor, focus: cell } : prev))
        } else if (source) {
          target = fillTarget(source, cell)
          setFillPreview(target)
        }
      }
      const tick = () => {
        const rect = el.getBoundingClientRect()
        const { rowHeaderWidth, rowHeight } = latest.current
        let scrolled = false
        if (pointer.y > rect.bottom - 8) {
          el.scrollTop += rowHeight
          scrolled = true
        } else if (pointer.y < rect.top + rowHeight + 8) {
          el.scrollTop -= rowHeight
          scrolled = true
        }
        if (pointer.x > rect.right - 8) {
          el.scrollLeft += 24
          scrolled = true
        } else if (pointer.x < rect.left + rowHeaderWidth + 8) {
          el.scrollLeft -= 24
          scrolled = true
        }
        if (scrolled) update()
        frame = requestAnimationFrame(tick)
      }
      const move = (e: PointerEvent) => {
        pointer = { x: e.clientX, y: e.clientY }
        update()
      }
      const up = (e: PointerEvent) => {
        cancelAnimationFrame(frame)
        globalThis.removeEventListener("pointermove", move)
        globalThis.removeEventListener("pointerup", up)
        // The release point counts too, so a drop with no intermediate moves still lands.
        move(e)
        if (kind === "fill") {
          setFillPreview(null)
          if (
            source &&
            target &&
            (target.r0 !== source.r0 || target.r1 !== source.r1 || target.c0 !== source.c0 || target.c1 !== source.c1)
          )
            applyFill(source, target)
        }
        focusContainer()
      }
      globalThis.addEventListener("pointermove", move)
      globalThis.addEventListener("pointerup", up)
      frame = requestAnimationFrame(tick)
    },
    [cellAt, fillTarget, applyFill, setSelection, focusContainer]
  )

  const ctx = React.useMemo<SpreadsheetContextValue>(
    () => ({
      id,
      rowCount,
      columnCount,
      rowHeight,
      heights,
      rowOffsets,
      minRowHeight,
      setHeight,
      resetHeight,
      rowHeaderWidth,
      frozenRows,
      frozenColumns,
      readOnly,
      widths,
      offsets,
      totalWidth,
      templateColumns,
      setWidth,
      resetWidth,
      minColumnWidth,
      getRaw,
      getText,
      getResult,
      getDisplay,
      selection,
      bounds,
      focusCell,
      select,
      selectRow,
      selectColumn,
      selectAll,
      editing,
      startEditing,
      setDraft,
      commitEditing,
      cancelEditing,
      applyChanges,
      clearRange,
      copyRange,
      pasteText,
      undo,
      redo,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      fillPreview,
      startDrag,
      containerRef,
      focusContainer,
      window,
      visibleColumns,
      setScrollLeft,
      setViewportWidth,
      setScrollTop,
      setViewportHeight,
      announce,
    }),
    [
      id,
      rowCount,
      columnCount,
      rowHeight,
      heights,
      rowOffsets,
      minRowHeight,
      setHeight,
      resetHeight,
      rowHeaderWidth,
      frozenRows,
      frozenColumns,
      readOnly,
      widths,
      offsets,
      totalWidth,
      templateColumns,
      setWidth,
      resetWidth,
      minColumnWidth,
      getRaw,
      getText,
      getResult,
      getDisplay,
      selection,
      bounds,
      focusCell,
      select,
      selectRow,
      selectColumn,
      selectAll,
      editing,
      startEditing,
      setDraft,
      commitEditing,
      cancelEditing,
      applyChanges,
      clearRange,
      copyRange,
      pasteText,
      undo,
      redo,
      history.canUndo,
      history.canRedo,
      fillPreview,
      startDrag,
      focusContainer,
      window,
      visibleColumns,
      setScrollLeft,
      setViewportWidth,
      setScrollTop,
      announce,
    ]
  )

  return (
    <SpreadsheetContext.Provider value={ctx}>
      <ark.div
        data-slot="spreadsheet"
        data-editing={editing ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        className={cn("flex min-h-0 flex-col gap-2", className)}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {children}
            <LiveRegion.Root data-slot="spreadsheet-live-region" message={announcement} />
          </>
        )}
      </ark.div>
    </SpreadsheetContext.Provider>
  )
}

/** The constant step of a numeric series of two or more values, or null when the line is not one. */
function seriesStep(line: SpreadsheetValue[]): number | null {
  if (line.length < 2 || !line.every((v) => typeof v === "number")) return null
  const step = line[1] - line[0]
  for (let i = 2; i < line.length; i++) if (Math.abs(line[i] - line[i - 1] - step) > 1e-9) return null
  return step
}

/* ---------------------------------------------------------------------------
 * Formula bar
 * ------------------------------------------------------------------------- */

function SpreadsheetFormulaBar({ className, ...props }: SpreadsheetFormulaBarProps) {
  return <ark.div data-slot="spreadsheet-formula-bar" className={cn("flex items-center gap-2", className)} {...props} />
}

/** Shows the focused cell's name ("B3") or the selected range ("A1:C4"). */
function SpreadsheetNameBox({ className, ...props }: SpreadsheetNameBoxProps) {
  const { selection, bounds } = useSpreadsheet()
  const text =
    !selection || !bounds
      ? ""
      : bounds.r0 === bounds.r1 && bounds.c0 === bounds.c1
        ? cellName(selection.focus)
        : `${cellName({ row: bounds.r0, column: bounds.c0 })}:${cellName({ row: bounds.r1, column: bounds.c1 })}`
  return (
    <Input.Root
      data-slot="spreadsheet-name-box"
      readOnly
      value={text}
      aria-label="Cell name"
      className={cn("w-24 shrink-0", className)}
      {...props}
    />
  )
}

/** Edits the focused cell's raw text: typing starts an edit, Enter commits, Escape cancels. */
function SpreadsheetFormulaInput({ className, onChange, onKeyDown, onFocus, ...props }: SpreadsheetFormulaInputProps) {
  const sheet = useSpreadsheet()
  const focus = sheet.selection?.focus ?? null
  const value = sheet.editing ? sheet.editing.draft : focus ? sheet.getText(focus) : ""
  return (
    <Input.Root
      data-slot="spreadsheet-formula-input"
      aria-label="Formula"
      placeholder={focus ? undefined : "Select a cell"}
      value={value}
      disabled={!focus}
      readOnly={sheet.readOnly}
      className={cn("flex-1", className)}
      onChange={(event) => {
        onChange?.(event)
        if (event.defaultPrevented || !focus) return
        if (!sheet.editing) sheet.startEditing(focus, event.target.value, "bar")
        else sheet.setDraft(event.target.value)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === "Enter") {
          event.preventDefault()
          if (sheet.editing) sheet.commitEditing({ move: "down" })
          else sheet.focusContainer()
        } else if (event.key === "Tab" && sheet.editing) {
          event.preventDefault()
          sheet.commitEditing({ move: event.shiftKey ? "left" : "right" })
        } else if (event.key === "Escape") {
          event.preventDefault()
          sheet.cancelEditing()
        }
      }}
      onFocus={(event) => {
        onFocus?.(event)
        if (!event.defaultPrevented && focus && sheet.editing && sheet.editing.via !== "bar")
          sheet.startEditing(focus, sheet.editing.draft, "bar")
      }}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Container, header, body
 * ------------------------------------------------------------------------- */

const isPrintable = (event: React.KeyboardEvent) =>
  event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey

function SpreadsheetContainer({
  className,
  onScroll,
  onKeyDown,
  onCopy,
  onCut,
  onPaste,
  ...props
}: SpreadsheetContainerProps) {
  const sheet = useSpreadsheet()
  const { containerRef, setScrollTop, setViewportHeight, setScrollLeft, setViewportWidth } = sheet
  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setViewportHeight(el.clientHeight)
      setViewportWidth(el.clientWidth)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef, setViewportHeight, setViewportWidth])

  const focus = sheet.selection?.focus ?? null
  const move = (dr: number, dc: number, extend: boolean) => {
    const base = extend ? sheet.selection?.focus : focus
    if (!base) {
      sheet.focusCell({ row: 0, column: 0 })
      return
    }
    sheet.focusCell({ row: base.row + dr, column: base.column + dc }, { extend })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || sheet.editing) return
    if (event.target !== event.currentTarget) return
    const meta = event.metaKey || event.ctrlKey
    const pageRows = Math.max(1, Math.floor((containerRef.current?.clientHeight ?? 0) / sheet.rowHeight) - 2)
    const last = { row: sheet.rowCount - 1, column: sheet.columnCount - 1 }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        if (meta && focus) sheet.focusCell({ row: last.row, column: focus.column }, { extend: event.shiftKey })
        else move(1, 0, event.shiftKey)
        return
      case "ArrowUp":
        event.preventDefault()
        if (meta && focus) sheet.focusCell({ row: 0, column: focus.column }, { extend: event.shiftKey })
        else move(-1, 0, event.shiftKey)
        return
      case "ArrowRight":
        event.preventDefault()
        if (meta && focus) sheet.focusCell({ row: focus.row, column: last.column }, { extend: event.shiftKey })
        else move(0, 1, event.shiftKey)
        return
      case "ArrowLeft":
        event.preventDefault()
        if (meta && focus) sheet.focusCell({ row: focus.row, column: 0 }, { extend: event.shiftKey })
        else move(0, -1, event.shiftKey)
        return
      case "Home":
        event.preventDefault()
        sheet.focusCell({ row: meta || !focus ? 0 : focus.row, column: 0 }, { extend: event.shiftKey })
        return
      case "End":
        event.preventDefault()
        sheet.focusCell({ row: meta || !focus ? last.row : focus.row, column: last.column }, { extend: event.shiftKey })
        return
      case "PageDown":
        event.preventDefault()
        move(pageRows, 0, event.shiftKey)
        return
      case "PageUp":
        event.preventDefault()
        move(-pageRows, 0, event.shiftKey)
        return
      case "Tab":
        if (!focus || (event.shiftKey ? focus.column === 0 : focus.column === last.column)) return
        event.preventDefault()
        move(0, event.shiftKey ? -1 : 1, false)
        return
      case "Enter":
      case "F2":
        event.preventDefault()
        if (!focus) return
        if (sheet.readOnly) {
          if (event.key === "Enter") move(event.shiftKey ? -1 : 1, 0, false)
        } else sheet.startEditing(focus)
        return
      case "Escape":
        if (focus) sheet.focusCell(focus, { scroll: false })
        return
      case "Delete":
      case "Backspace":
        event.preventDefault()
        sheet.clearRange()
        return
      case " ":
        if (event.shiftKey && focus) {
          event.preventDefault()
          sheet.selectRow(focus.row)
        } else if (event.ctrlKey && focus) {
          event.preventDefault()
          sheet.selectColumn(focus.column)
        }
        return
      case "a":
      case "A":
        if (meta) {
          event.preventDefault()
          sheet.selectAll()
        }
        return
      case "z":
      case "Z":
        if (meta) {
          event.preventDefault()
          if (event.shiftKey) sheet.redo()
          else sheet.undo()
        }
        return
      case "y":
      case "Y":
        if (meta) {
          event.preventDefault()
          sheet.redo()
        }
        return
    }
    if (focus && isPrintable(event) && !sheet.readOnly) {
      event.preventDefault()
      sheet.startEditing(focus, event.key)
    }
  }

  const active = focus && !sheet.editing ? cellId(sheet.id, focus) : undefined
  return (
    <ark.div
      ref={containerRef}
      data-slot="spreadsheet-container"
      role="grid"
      tabIndex={0}
      aria-rowcount={sheet.rowCount + 1}
      aria-colcount={sheet.columnCount + 1}
      aria-activedescendant={active}
      aria-readonly={sheet.readOnly || undefined}
      aria-multiselectable
      className={cn(
        "relative min-h-0 flex-1 overflow-auto rounded-lg border bg-background text-sm outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      onScroll={(event) => {
        onScroll?.(event)
        setScrollTop(event.currentTarget.scrollTop)
        setScrollLeft(event.currentTarget.scrollLeft)
      }}
      onKeyDown={handleKeyDown}
      onCopy={(event) => {
        onCopy?.(event)
        if (event.defaultPrevented || sheet.editing || event.target !== event.currentTarget) return
        event.preventDefault()
        event.clipboardData.setData("text/plain", sheet.copyRange())
      }}
      onCut={(event) => {
        onCut?.(event)
        if (event.defaultPrevented || sheet.editing || event.target !== event.currentTarget) return
        event.preventDefault()
        event.clipboardData.setData("text/plain", sheet.copyRange())
        sheet.clearRange()
      }}
      onPaste={(event) => {
        onPaste?.(event)
        if (event.defaultPrevented || sheet.editing || event.target !== event.currentTarget) return
        event.preventDefault()
        sheet.pasteText(event.clipboardData.getData("text/plain"))
      }}
      {...props}
    />
  )
}

/** Sticky block: the column-letter row and any frozen rows. */
function SpreadsheetHeader({ className, children, ...props }: SpreadsheetHeaderProps) {
  const sheet = useSpreadsheet()
  return (
    <ark.div
      data-slot="spreadsheet-header"
      role="rowgroup"
      className={cn("sticky top-0 z-30 w-fit min-w-full bg-background", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}
          {Array.from({ length: Math.min(sheet.frozenRows, sheet.rowCount) }, (_, row) => (
            <SpreadsheetRow key={row} row={row}>
              <SpreadsheetRowHeader />
              {sheet.visibleColumns.map((column) => (
                <SpreadsheetCell key={column} row={row} column={column} />
              ))}
            </SpreadsheetRow>
          ))}
        </>
      )}
    </ark.div>
  )
}

/** The column-letter row. Renders the corner and one header per column unless given children. */
function SpreadsheetHeaderRow({ className, style, children, ...props }: SpreadsheetHeaderRowProps) {
  const { templateColumns, totalWidth, rowHeight, visibleColumns } = useSpreadsheet()
  return (
    <ark.div
      data-slot="spreadsheet-header-row"
      role="row"
      aria-rowindex={1}
      className={cn("grid border-b bg-muted", className)}
      style={{ gridTemplateColumns: templateColumns, minWidth: totalWidth, height: rowHeight, ...style }}
      {...props}
    >
      {props.asChild
        ? React.isValidElement(children)
          ? children
          : null
        : (children ?? (
            <>
              <SpreadsheetCorner />
              {visibleColumns.map((column) => (
                <SpreadsheetColumnHeader key={column} column={column} />
              ))}
            </>
          ))}
    </ark.div>
  )
}

/** The top-left cell; clicking it selects every cell. */
function SpreadsheetCorner({ className, onPointerDown, ...props }: SpreadsheetCornerProps) {
  const sheet = useSpreadsheet()
  return (
    <ark.div
      data-slot="spreadsheet-corner"
      role="columnheader"
      aria-colindex={1}
      className={cn("sticky left-0 z-20 border-e bg-muted", className)}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        event.preventDefault()
        sheet.selectAll()
        sheet.focusContainer()
      }}
      {...props}
    />
  )
}

const ColumnHeaderContext = React.createContext<number | null>(null)

/** A column letter; clicking selects the column, Shift+click extends. Includes a resize handle by default. */
function SpreadsheetColumnHeader({
  column,
  className,
  style,
  children,
  onPointerDown,
  ...props
}: SpreadsheetColumnHeaderProps) {
  const sheet = useSpreadsheet()
  if (!sheet.visibleColumns.includes(column)) return null
  const frozen = column < sheet.frozenColumns
  const selected = !!sheet.bounds && column >= sheet.bounds.c0 && column <= sheet.bounds.c1
  const whole = selected && !!sheet.bounds && sheet.bounds.r0 === 0 && sheet.bounds.r1 === sheet.rowCount - 1
  return (
    <ColumnHeaderContext.Provider value={column}>
      <ark.div
        data-slot="spreadsheet-column-header"
        data-column={column}
        data-frozen={frozen ? "" : undefined}
        data-selected={selected ? "" : undefined}
        data-whole={whole ? "" : undefined}
        role="columnheader"
        aria-colindex={column + 2}
        aria-selected={whole || undefined}
        className={cn(
          "relative flex min-w-0 items-center justify-center border-e font-medium text-muted-foreground data-whole:bg-primary/20 data-selected:bg-primary/10 data-selected:text-foreground",
          frozen && "sticky z-10 bg-muted",
          className
        )}
        style={{
          gridColumn: column + 2,
          gridRow: 1,
          ...(frozen ? { left: sheet.rowHeaderWidth + sheet.offsets[column] } : {}),
          ...style,
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest("[data-slot=spreadsheet-resize-handle]")) return
          event.preventDefault()
          sheet.selectColumn(column, event.shiftKey)
          sheet.focusContainer()
        }}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            <span className="truncate">{children ?? columnLabel(column)}</span>
            <SpreadsheetResizeHandle />
          </>
        )}
      </ark.div>
    </ColumnHeaderContext.Provider>
  )
}

/** Pointer-driven column resizer; double-click or Home resets, arrows adjust by 1px (10px with Shift). */
function SpreadsheetResizeHandle({
  withHandle = true,
  className,
  children,
  onPointerDown,
  onDoubleClick,
  onKeyDown,
  ...props
}: SpreadsheetResizeHandleProps) {
  const sheet = useSpreadsheet()
  const column = React.useContext(ColumnHeaderContext)
  const width = column === null ? undefined : sheet.widths[column]
  return (
    <ark.div
      data-slot="spreadsheet-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={column === null ? "Resize column" : `Resize column ${columnLabel(column)}`}
      aria-valuemin={sheet.minColumnWidth}
      aria-valuenow={width}
      aria-valuetext={width === undefined ? undefined : `${width}px`}
      tabIndex={-1}
      className={cn(
        "absolute inset-y-0 inset-e-0 z-10 flex w-px cursor-col-resize touch-none items-center justify-center ring-offset-background select-none after:absolute after:inset-y-0 after:left-1/2 after:w-1.5 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0 || column === null) return
        event.preventDefault()
        event.stopPropagation()
        const start = event.clientX
        const startWidth = sheet.widths[column]
        const move = (e: PointerEvent) => sheet.setWidth(column, startWidth + e.clientX - start)
        const up = () => {
          globalThis.removeEventListener("pointermove", move)
          globalThis.removeEventListener("pointerup", up)
        }
        globalThis.addEventListener("pointermove", move)
        globalThis.addEventListener("pointerup", up)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || column === null) return
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home") return
        event.preventDefault()
        event.stopPropagation()
        if (event.key === "Home") {
          sheet.resetWidth(column)
          return
        }
        const direction = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1
        const delta = (event.key === "ArrowRight" ? 1 : -1) * direction * (event.shiftKey ? 10 : 1)
        sheet.setWidth(column, sheet.widths[column] + delta)
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event)
        if (!event.defaultPrevented && column !== null) sheet.resetWidth(column)
      }}
      {...props}
    >
      {props.asChild ? (
        children
      ) : (
        <>
          {withHandle && <div className="z-10 flex h-4 w-0.5 shrink-0 rounded-lg bg-border" />}
          {children}
        </>
      )}
    </ark.div>
  )
}

/** Virtualized rows after the frozen ones. `children` renders one row (defaults to a row header plus visible cells). */
function SpreadsheetBody({ className, style, children, ...props }: SpreadsheetBodyProps) {
  const sheet = useSpreadsheet()
  const { window: win, rowOffsets, totalWidth, frozenRows, rowCount, visibleColumns, editing } = sheet
  const rows: number[] = []
  for (let i = win.start; i < win.end; i++) rows.push(frozenRows + i)
  // The editing row stays mounted even when scrolled out, so the editor keeps its focus.
  const pinned =
    editing && editing.row >= frozenRows && (editing.row < rows[0] || editing.row > rows[rows.length - 1])
      ? editing.row
      : null
  const render = (row: number) =>
    typeof children === "function" ? (
      children(row)
    ) : (
      <SpreadsheetRow row={row}>
        <SpreadsheetRowHeader />
        {visibleColumns.map((column) => (
          <SpreadsheetCell key={column} row={row} column={column} />
        ))}
      </SpreadsheetRow>
    )
  return (
    <ark.div
      data-slot="spreadsheet-body"
      role="rowgroup"
      className={cn("relative", className)}
      style={{ height: rowOffsets[rowCount] - rowOffsets[frozenRows], minWidth: totalWidth, ...style }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div style={{ transform: `translateY(${rowOffsets[win.start + frozenRows] - rowOffsets[frozenRows]}px)` }}>
            {rows.map((row) => (
              <React.Fragment key={row}>{render(row)}</React.Fragment>
            ))}
          </div>
          {pinned !== null && (
            <div
              className="absolute inset-x-0 top-0"
              style={{ transform: `translateY(${rowOffsets[pinned] - rowOffsets[frozenRows]}px)` }}
            >
              {render(pinned)}
            </div>
          )}
        </>
      )}
    </ark.div>
  )
}

function SpreadsheetRow({ row, className, style, ...props }: SpreadsheetRowProps) {
  const { templateColumns, heights, bounds, frozenRows, rowCount } = useSpreadsheet()
  const selected = !!bounds && row >= bounds.r0 && row <= bounds.r1
  return (
    <RowContext.Provider value={row}>
      <ark.div
        data-slot="spreadsheet-row"
        data-row={row}
        data-frozen={row < frozenRows ? "" : undefined}
        data-last={row === rowCount - 1 ? "" : undefined}
        data-selected={selected ? "" : undefined}
        role="row"
        aria-rowindex={row + 2}
        className={cn(
          "grid border-b bg-background data-last:border-b-0",
          row === frozenRows - 1 && "border-b-2",
          className
        )}
        style={{ gridTemplateColumns: templateColumns, height: heights[row], ...style }}
        {...props}
      />
    </RowContext.Provider>
  )
}

/** The row number; clicking selects the row, Shift+click extends. */
function SpreadsheetRowHeader({ className, children, onPointerDown, ...props }: SpreadsheetRowHeaderProps) {
  const sheet = useSpreadsheet()
  const row = React.useContext(RowContext)
  if (row === null) throw new Error("Spreadsheet.RowHeader must be used within <Spreadsheet.Row>")
  const selected = !!sheet.bounds && row >= sheet.bounds.r0 && row <= sheet.bounds.r1
  const whole = selected && !!sheet.bounds && sheet.bounds.c0 === 0 && sheet.bounds.c1 === sheet.columnCount - 1
  return (
    <ark.div
      data-slot="spreadsheet-row-header"
      data-selected={selected ? "" : undefined}
      data-whole={whole ? "" : undefined}
      role="rowheader"
      aria-colindex={1}
      aria-selected={whole || undefined}
      className={cn(
        "sticky left-0 z-20 flex items-center justify-center border-e bg-muted text-xs text-muted-foreground tabular-nums data-whole:bg-primary/20 data-selected:bg-primary/10 data-selected:text-foreground",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        event.preventDefault()
        sheet.selectRow(row, event.shiftKey)
        sheet.focusContainer()
      }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? row + 1}
          <SpreadsheetRowResizeHandle />
        </>
      )}
    </ark.div>
  )
}

type SpreadsheetRowResizeHandleProps = React.ComponentProps<typeof ark.div> & { withHandle?: boolean }
function SpreadsheetRowResizeHandle({
  withHandle = true,
  children,
  className,
  onPointerDown,
  onDoubleClick,
  onKeyDown,
  ...props
}: SpreadsheetRowResizeHandleProps) {
  const sheet = useSpreadsheet(),
    row = React.useContext(RowContext)
  if (row === null) throw new Error("Spreadsheet.RowResizeHandle requires Spreadsheet.Row")
  return (
    <ark.div
      data-slot="spreadsheet-row-resize-handle"
      role="separator"
      aria-orientation="horizontal"
      aria-label={`Resize row ${row + 1}`}
      aria-valuemin={sheet.minRowHeight}
      aria-valuenow={sheet.heights[row]}
      tabIndex={-1}
      className={cn(
        "absolute inset-x-0 bottom-0 z-30 flex h-px cursor-row-resize touch-none items-center justify-center select-none after:absolute after:inset-x-0 after:top-1/2 after:h-1.5 after:-translate-y-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        const start = event.clientY,
          height = sheet.heights[row]
        const move = (e: PointerEvent) => sheet.setHeight(row, height + e.clientY - start)
        const up = () => {
          globalThis.removeEventListener("pointermove", move)
          globalThis.removeEventListener("pointerup", up)
        }
        globalThis.addEventListener("pointermove", move)
        globalThis.addEventListener("pointerup", up)
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event)
        if (!event.defaultPrevented) sheet.resetHeight(row)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || !["ArrowUp", "ArrowDown", "Home"].includes(event.key)) return
        event.preventDefault()
        event.stopPropagation()
        if (event.key === "Home") sheet.resetHeight(row)
        else sheet.setHeight(row, sheet.heights[row] + (event.key === "ArrowDown" ? 1 : -1) * (event.shiftKey ? 10 : 1))
      }}
      {...props}
    >
      {props.asChild ? (
        children
      ) : (
        <>
          {withHandle && <div className="z-10 h-0.5 w-4 shrink-0 rounded-lg bg-border" />}
          {children}
        </>
      )}
    </ark.div>
  )
}

/* ---------------------------------------------------------------------------
 * Cells
 * ------------------------------------------------------------------------- */

function SpreadsheetCell({
  row: rowProp,
  column,
  className,
  style,
  children,
  onPointerDown,
  onDoubleClick,
  ...props
}: SpreadsheetCellProps) {
  const sheet = useSpreadsheet()
  const rowCtx = React.useContext(RowContext)
  const row = rowProp ?? rowCtx
  if (row === null || row === undefined) throw new Error("Spreadsheet.Cell needs a `row` or a <Spreadsheet.Row>")
  const cell = React.useMemo(() => ({ row, column }), [row, column])
  if (!sheet.visibleColumns.includes(column)) return null
  const focused = sameCell(sheet.selection?.focus, cell)
  const isEditing = !!sheet.editing && sameCell(sheet.editing, cell)
  const b = sheet.bounds
  const selected = !!b && row >= b.r0 && row <= b.r1 && column >= b.c0 && column <= b.c1
  const multi = !!b && (b.r0 !== b.r1 || b.c0 !== b.c1)
  const f = sheet.fillPreview
  const filling = !!f && !selected && row >= f.r0 && row <= f.r1 && column >= f.c0 && column <= f.c1
  const frozen = column < sheet.frozenColumns
  const raw = sheet.getRaw(cell)
  const result = sheet.getResult(cell)
  const formula = isFormula(raw)
  const type = result.error
    ? "error"
    : typeof result.value === "number"
      ? "number"
      : typeof result.value === "boolean"
        ? "boolean"
        : "text"
  const corner = !!b && row === b.r1 && column === b.c1 && !sheet.readOnly && !sheet.editing

  return (
    <ark.div
      id={cellId(sheet.id, cell)}
      data-slot="spreadsheet-cell"
      data-row={row}
      data-column={column}
      data-type={type}
      data-frozen={frozen ? "" : undefined}
      data-formula={formula ? "" : undefined}
      data-error={result.error}
      data-focused={focused && !isEditing ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-range={selected && multi ? "" : undefined}
      data-editing={isEditing ? "" : undefined}
      data-fill-preview={filling ? "" : undefined}
      role="gridcell"
      aria-colindex={column + 2}
      aria-selected={selected || undefined}
      aria-readonly={sheet.readOnly || undefined}
      className={cn(
        "relative flex min-w-0 items-center overflow-hidden border-e px-2 whitespace-nowrap outline-none",
        "data-fill-preview:bg-primary/5 data-fill-preview:ring-1 data-fill-preview:ring-primary/40 data-fill-preview:ring-inset data-range:bg-primary/10",
        "data-focused:z-10 data-focused:ring-2 data-focused:ring-primary data-focused:ring-inset",
        "data-editing:z-10 data-editing:overflow-visible data-editing:p-0",
        frozen && "sticky z-20 bg-background",
        frozen && column === sheet.frozenColumns - 1 && "border-e-2",
        type === "number" && "justify-end tabular-nums",
        type === "error" && "text-destructive",
        className
      )}
      style={{
        gridColumn: column + 2,
        gridRow: 1,
        ...(frozen ? { left: sheet.rowHeaderWidth + sheet.offsets[column] } : {}),
        ...style,
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0 || isEditing) return
        if ((event.target as HTMLElement).closest("[data-slot=spreadsheet-fill-handle], button, a, input")) return
        event.preventDefault()
        sheet.focusCell(cell, { extend: event.shiftKey, scroll: false })
        sheet.focusContainer()
        if (!event.shiftKey) sheet.startDrag("select", event)
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event)
        if (!event.defaultPrevented && !sheet.readOnly) sheet.startEditing(cell)
      }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {isEditing ? (
            <CellEditor cell={cell} />
          ) : (
            (children ?? <span className="truncate">{sheet.getDisplay(cell)}</span>)
          )}
          {corner && <SpreadsheetFillHandle />}
        </>
      )}
    </ark.div>
  )
}

function CellEditor({ cell }: { cell: SpreadsheetCellAddress }) {
  const sheet = useSpreadsheet()
  const editing = sheet.editing
  const ref = React.useRef<HTMLInputElement>(null)
  const via = editing?.via
  const seeded = React.useRef(editing?.draft !== sheet.getText(cell))
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || via !== "cell") return
    el.focus()
    if (seeded.current) el.setSelectionRange(el.value.length, el.value.length)
    else el.select()
  }, [via])
  if (!editing) return null
  return (
    <Input.Root
      ref={ref}
      data-slot="spreadsheet-editor"
      aria-label={`Edit ${cellName(cell)}`}
      value={editing.draft}
      className="rounded-none"
      onChange={(event) => sheet.setDraft(event.target.value)}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === "Enter") {
          event.preventDefault()
          sheet.commitEditing({ move: event.shiftKey ? "up" : "down" })
        } else if (event.key === "Tab") {
          event.preventDefault()
          sheet.commitEditing({ move: event.shiftKey ? "left" : "right" })
        } else if (event.key === "Escape") {
          event.preventDefault()
          sheet.cancelEditing()
        }
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as HTMLElement | null
        if (next?.closest("[data-slot=spreadsheet-formula-input]")) return
        if (sheet.editing && sameCell(sheet.editing, cell) && sheet.editing.via === "cell") sheet.commitEditing()
      }}
      onPointerDown={(event) => event.stopPropagation()}
    />
  )
}

/** The square at the bottom-right of the selection; drag it to extend values into neighbouring cells. */
function SpreadsheetFillHandle({ className, onPointerDown, ...props }: SpreadsheetFillHandleProps) {
  const sheet = useSpreadsheet()
  return (
    <ark.div
      data-slot="spreadsheet-fill-handle"
      aria-hidden
      className={cn(
        "absolute -right-1 -bottom-1 z-30 size-2 cursor-crosshair border border-background bg-primary",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        sheet.startDrag("fill", event)
      }}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Empty, undo/redo
 * ------------------------------------------------------------------------- */

function SpreadsheetEmpty({ className, ...props }: SpreadsheetEmptyProps) {
  const { rowCount, columnCount } = useSpreadsheet()
  if (rowCount && columnCount) return null
  return (
    <ark.div
      data-slot="spreadsheet-empty"
      className={cn("flex h-24 items-center justify-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SpreadsheetUndoTrigger({ children, onClick, ...props }: SpreadsheetUndoTriggerProps) {
  const { undo, canUndo } = useSpreadsheet()
  return (
    <ark.button
      type="button"
      data-slot="spreadsheet-undo-trigger"
      disabled={!canUndo}
      aria-keyshortcuts="Meta+Z Control+Z"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) undo()
      }}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? "Undo"}</>}
    </ark.button>
  )
}

function SpreadsheetRedoTrigger({ children, onClick, ...props }: SpreadsheetRedoTriggerProps) {
  const { redo, canRedo } = useSpreadsheet()
  return (
    <ark.button
      type="button"
      data-slot="spreadsheet-redo-trigger"
      disabled={!canRedo}
      aria-keyshortcuts="Meta+Shift+Z Control+Shift+Z"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) redo()
      }}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? "Redo"}</>}
    </ark.button>
  )
}

/* ---------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

type SpreadsheetRootProps = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  /** The cells, as rows of values; `null` or a missing entry is an empty cell. Replace the array on change. */
  data: SpreadsheetData
  /** Number of rows; defaults to `data.length`. Set it to show empty rows past the data. */
  rowCount?: number
  /** Number of columns; defaults to the longest row in `data`. */
  columnCount?: number
  /** Called with a batch of `{ row, column, value, previous }` for every edit, paste, clear, fill, undo, and redo. */
  onCellsChange?: (changes: SpreadsheetChange[]) => void
  /** Default row height in px; also the column-letter header height. */
  rowHeight?: number
  /** Smallest resizable row height, defaults to 24px. */
  minRowHeight?: number
  rowHeights?: Record<number, number>
  defaultRowHeights?: Record<number, number>
  onRowHeightsChange?: (heights: Record<number, number>) => void
  /** Width of the row-number gutter in px. */
  rowHeaderWidth?: number
  /** Default width of a column in px. */
  columnWidth?: number
  /** Narrowest a column can be resized to, in px. */
  minColumnWidth?: number
  /** Controlled column widths by column index. */
  columnWidths?: Record<number, number>
  /** Initial column widths when uncontrolled. */
  defaultColumnWidths?: Record<number, number>
  /** Called when a column is resized. */
  onColumnWidthsChange?: (widths: Record<number, number>) => void
  /** Controlled selection: `anchor` and `focus` cells (equal for a single cell). */
  selection?: SpreadsheetSelection | null
  /** Initial selection when uncontrolled. */
  defaultSelection?: SpreadsheetSelection | null
  /** Called whenever the selection changes. */
  onSelectionChange?: (selection: SpreadsheetSelection | null) => void
  /** Rows kept visible below the column letters while scrolling. */
  frozenRows?: number
  /** Columns kept visible after the row numbers while scrolling sideways. */
  frozenColumns?: number
  /** Rows and columns rendered beyond the visible window on each side. */
  overscan?: number
  /** Disables editing, clearing, pasting, and the fill handle; selection and copy still work. */
  readOnly?: boolean
  /** Extra formula functions by upper-case name, merged over SUM, AVERAGE, MIN, MAX, and COUNT. */
  functions?: Record<string, FormulaFunction>
  /** How many edit batches the undo stack keeps. */
  historyLimit?: number
  children?: React.ReactNode
}

type SpreadsheetFormulaBarProps = React.ComponentProps<typeof ark.div>

type SpreadsheetNameBoxProps = React.ComponentProps<typeof Input.Root>

type SpreadsheetFormulaInputProps = React.ComponentProps<typeof Input.Root>

type SpreadsheetContainerProps = React.ComponentProps<typeof ark.div>

type SpreadsheetHeaderProps = React.ComponentProps<typeof ark.div>

type SpreadsheetHeaderRowProps = React.ComponentProps<typeof ark.div>

type SpreadsheetCornerProps = React.ComponentProps<typeof ark.div>

type SpreadsheetColumnHeaderProps = React.ComponentProps<typeof ark.div> & {
  /** Zero-based column index. */
  column: number
}

type SpreadsheetResizeHandleProps = React.ComponentProps<typeof ark.div> & {
  /** Render the visible grip. Defaults to true. */
  withHandle?: boolean
}

type SpreadsheetBodyProps = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  /** Renders one row by index; defaults to a row header followed by every cell. */
  children?: ((row: number) => React.ReactNode) | React.ReactElement
}

type SpreadsheetRowProps = React.ComponentProps<typeof ark.div> & {
  /** Zero-based row index. */
  row: number
}

type SpreadsheetRowHeaderProps = React.ComponentProps<typeof ark.div>

type SpreadsheetCellProps = React.ComponentProps<typeof ark.div> & {
  /** Zero-based row index; defaults to the enclosing `Spreadsheet.Row`. */
  row?: number
  /** Zero-based column index. */
  column: number
}

type SpreadsheetFillHandleProps = React.ComponentProps<typeof ark.div>

type SpreadsheetEmptyProps = React.ComponentProps<typeof ark.div>

type SpreadsheetUndoTriggerProps = React.ComponentProps<typeof ark.button>

type SpreadsheetRedoTriggerProps = React.ComponentProps<typeof ark.button>

const Spreadsheet = {
  Root: SpreadsheetRoot,
  FormulaBar: SpreadsheetFormulaBar,
  NameBox: SpreadsheetNameBox,
  FormulaInput: SpreadsheetFormulaInput,
  Container: SpreadsheetContainer,
  Header: SpreadsheetHeader,
  HeaderRow: SpreadsheetHeaderRow,
  Corner: SpreadsheetCorner,
  ColumnHeader: SpreadsheetColumnHeader,
  ResizeHandle: SpreadsheetResizeHandle,
  RowResizeHandle: SpreadsheetRowResizeHandle,
  Body: SpreadsheetBody,
  Row: SpreadsheetRow,
  RowHeader: SpreadsheetRowHeader,
  Cell: SpreadsheetCell,
  FillHandle: SpreadsheetFillHandle,
  Empty: SpreadsheetEmpty,
  UndoTrigger: SpreadsheetUndoTrigger,
  RedoTrigger: SpreadsheetRedoTrigger,
}

export {
  Spreadsheet,
  useSpreadsheet,
  cellName,
  columnLabel,
  type SpreadsheetValue,
  type SpreadsheetCellAddress,
  type SpreadsheetData,
  type SpreadsheetSelection,
  type SpreadsheetBounds,
  type SpreadsheetChange,
  type SpreadsheetRootProps,
  type SpreadsheetFormulaBarProps,
  type SpreadsheetNameBoxProps,
  type SpreadsheetFormulaInputProps,
  type SpreadsheetContainerProps,
  type SpreadsheetHeaderProps,
  type SpreadsheetHeaderRowProps,
  type SpreadsheetCornerProps,
  type SpreadsheetColumnHeaderProps,
  type SpreadsheetResizeHandleProps,
  type SpreadsheetRowResizeHandleProps,
  type SpreadsheetBodyProps,
  type SpreadsheetRowProps,
  type SpreadsheetRowHeaderProps,
  type SpreadsheetCellProps,
  type SpreadsheetFillHandleProps,
  type SpreadsheetEmptyProps,
  type SpreadsheetUndoTriggerProps,
  type SpreadsheetRedoTriggerProps,
}

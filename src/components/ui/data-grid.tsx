import * as React from "react"
import { ark } from "@ark-ui/react"
import { CheckIcon, MinusIcon, ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"
import { createListCollection } from "@ark-ui/react/collection"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import type { DataTableInstance, DataTableRow } from "@/lib/data-table-adapter"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

/**
 * DataGrid — an editable, keyboard-driven grid on the same source-agnostic
 * `DataTableInstance` contract as the data table. The instance supplies rows,
 * columns, sorting, filtering and selection; the grid adds cell focus, range
 * selection, inline editing, copy/paste, row virtualization, column resizing
 * and pinning. Edits are intents: `onCellChange({ row, columnId, value })`
 * and the consumer owns the data.
 *
 * Column behaviour is data (`columns` prop, keyed by column id):
 * `{ id, type, editable, options, width, minWidth, pinned, format, parse }`.
 *
 * Anatomy:
 *   DataGrid { table, columns, onCellChange }
 *     DataGridContainer                 scroll viewport, role="grid"
 *       DataGridHeader > DataGridHeaderRow > DataGridHead column=… (+ DataGridResizeHandle)
 *       DataGridBody children={(row) => cells}   virtualized rows
 *         DataGridRow > DataGridCell column=…    focusable, editable
 *       DataGridEmpty
 *   DataGridSelectAll / DataGridSelectRow  checkbox cells
 *
 * Keyboard: arrows move, Shift+arrows extend the range, Home/End and
 * Ctrl+Home/End jump, PageUp/PageDown scroll, Enter or F2 or typing edits,
 * Enter commits and moves down, Tab commits and moves right, Escape cancels,
 * Space toggles booleans, Delete clears the range, ⌘C/⌘V copy and paste TSV.
 */

type DataGridColumnType = "text" | "number" | "boolean" | "select" | "date"
type DataGridOption = { value: string; label: string }
type DataGridColumnConfig = {
  id: string
  type?: DataGridColumnType
  editable?: boolean
  options?: DataGridOption[]
  width?: number
  minWidth?: number
  pinned?: "left" | "right"
  /** Value → text for display and for seeding the editor. */
  format?: (value: unknown) => string
  /** Editor text → value on commit. */
  parse?: (input: string, previous: unknown) => unknown
}

type CellAddress = { rowIndex: number; columnId: string }
type CellRange = { anchor: CellAddress; focus: CellAddress }
type DataGridCellChange<TData> = {
  row: DataTableRow<TData>
  columnId: string
  value: unknown
  previous: unknown
}

type EditorRenderProps = {
  value: string
  onChange: (value: string) => void
  commit: (value?: string) => void
  cancel: () => void
  column: DataGridColumnConfig
  row: DataTableRow<unknown>
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & { ref: React.Ref<HTMLInputElement> }
}

const DEFAULT_WIDTH = 160
const MIN_WIDTH = 60

/* ---------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------- */

type ColumnLayout = {
  id: string
  width: number
  pinned?: "left" | "right"
  /** Sticky offset for pinned columns. */
  offset: number
  config: DataGridColumnConfig
}

type DataGridContextValue<TData = unknown> = {
  table: DataTableInstance<TData>
  rows: DataTableRow<TData>[]
  layout: ColumnLayout[]
  layoutById: Map<string, ColumnLayout>
  templateColumns: string
  totalWidth: number
  /** Fixed height of every row in px. */
  rowHeight: number
  setWidth: (columnId: string, width: number) => void
  focus: CellAddress | null
  range: CellRange | null
  editing: (CellAddress & { seed?: string }) | null
  focusCell: (address: CellAddress, options?: { extend?: boolean; scroll?: boolean }) => void
  startEditing: (address: CellAddress, seed?: string) => void
  stopEditing: (options?: { refocus?: boolean }) => void
  commit: (address: CellAddress, value: unknown) => void
  clearRange: () => void
  copyRange: () => Promise<void>
  paste: () => Promise<void>
  isInRange: (address: CellAddress) => boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Bumped whenever a cell should take DOM focus; cells act on it in a layout effect. */
  focusRequest: number
  /** Editors register so the grid can close them when the viewport scrolls. */
  registerEditor: (handle: { close: () => void }) => () => void
  closeEditor: () => void
  window: { start: number; end: number }
  setScrollTop: (top: number) => void
  setViewportHeight: (height: number) => void
  announce: (message: string) => void
}

const DataGridContext = React.createContext<DataGridContextValue | null>(null)
const RowContext = React.createContext<{ row: DataTableRow<unknown>; index: number } | null>(null)

function useDataGrid<TData = unknown>() {
  const ctx = React.useContext(DataGridContext)
  if (!ctx) throw new Error("DataGrid parts must be used within <DataGrid>")
  return ctx as DataGridContextValue<TData>
}
function useDataGridRow() {
  const ctx = React.useContext(RowContext)
  if (!ctx) throw new Error("DataGridCell must be used within <DataGridRow>")
  return ctx
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const defaultFormat = (value: unknown) => {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10)
  return String(value)
}

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

function DataGridRoot<TData>({
  table,
  columns = [],
  rowHeight = 36,
  overscan = 6,
  onCellChange,
  columnSizing: sizingProp,
  defaultColumnSizing,
  onColumnSizingChange,
  className,
  children,
  ...props
}: DataGridRootProps<TData>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const rows = table.getRowModel().rows
  const visibleColumns = table.getAllColumns().filter((c) => c.getIsVisible())

  /* Column sizing (controllable) */
  const [initialSizing] = React.useState<Record<string, number>>(() => defaultColumnSizing ?? {})
  const [sizing, setSizing] = useControllable(sizingProp, initialSizing, onColumnSizingChange)
  const setWidth = React.useCallback(
    (columnId: string, width: number) => setSizing((prev) => ({ ...prev, [columnId]: width })),
    [setSizing]
  )

  const configById = React.useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])

  /* Layout: order = visible engine columns; pinned left first, right last */
  const { layout, layoutById, templateColumns, totalWidth } = React.useMemo(() => {
    const base = visibleColumns.map((c) => {
      const config = configById.get(c.id) ?? { id: c.id }
      const width = Math.max(config.minWidth ?? MIN_WIDTH, sizing[c.id] ?? config.width ?? DEFAULT_WIDTH)
      return { id: c.id, width, pinned: config.pinned, offset: 0, config }
    })
    const left = base.filter((c) => c.pinned === "left")
    const middle = base.filter((c) => !c.pinned)
    const right = base.filter((c) => c.pinned === "right")
    let offset = 0
    for (const c of left) {
      c.offset = offset
      offset += c.width
    }
    offset = 0
    for (const c of [...right].reverse()) {
      c.offset = offset
      offset += c.width
    }
    const ordered: ColumnLayout[] = [...left, ...middle, ...right]
    return {
      layout: ordered,
      layoutById: new Map(ordered.map((c) => [c.id, c])),
      templateColumns: ordered.map((c) => `${c.width}px`).join(" "),
      totalWidth: ordered.reduce((sum, c) => sum + c.width, 0),
    }
    // visibleColumns is derived from table state; its identity changes with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns.map((c) => c.id).join("|"), configById, sizing])

  /* Virtual window */
  const [scrollTop, setScrollTopState] = React.useState(0)
  const [viewportHeight, setViewportHeight] = React.useState(0)
  const setScrollTop = React.useCallback((top: number) => setScrollTopState(top), [])
  const window = React.useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const end = Math.min(rows.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan)
    return { start, end }
  }, [scrollTop, viewportHeight, rowHeight, overscan, rows.length])

  /* Focus, range, editing */
  const [focus, setFocus] = React.useState<CellAddress | null>(null)
  const [range, setRange] = React.useState<CellRange | null>(null)
  const [editing, setEditing] = React.useState<(CellAddress & { seed?: string }) | null>(null)
  const { message: announcement, announce } = useLiveRegion()
  const [focusRequest, setFocusRequest] = React.useState(0)
  const activeEditor = React.useRef<{ close: () => void } | null>(null)
  const registerEditor = React.useCallback((handle: { close: () => void }) => {
    activeEditor.current = handle
    return () => {
      if (activeEditor.current === handle) activeEditor.current = null
    }
  }, [])
  const closeEditor = React.useCallback(() => activeEditor.current?.close(), [])

  const latest = React.useRef({ rows, layout, focus, range, editing, onCellChange, rowHeight })
  React.useEffect(() => {
    latest.current = { rows, layout, focus, range, editing, onCellChange, rowHeight }
  })

  const scrollRowIntoView = React.useCallback(
    (rowIndex: number) => {
      const el = containerRef.current
      if (!el) return
      const headerHeight = el.querySelector<HTMLElement>("[data-slot=data-grid-header]")?.offsetHeight ?? 0
      const top = rowIndex * rowHeight
      const bottom = top + rowHeight
      const viewTop = el.scrollTop
      const viewBottom = el.scrollTop + el.clientHeight - headerHeight
      if (top < viewTop) el.scrollTop = top
      else if (bottom > viewBottom) el.scrollTop = bottom - (el.clientHeight - headerHeight)
    },
    [rowHeight]
  )

  const scrollColumnIntoView = React.useCallback((columnId: string) => {
    const el = containerRef.current
    const col = latest.current.layout.find((c) => c.id === columnId)
    if (!el || !col || col.pinned) return
    const left = latest.current.layout.slice(0, latest.current.layout.indexOf(col)).reduce((s, c) => s + c.width, 0)
    const pinnedLeft = latest.current.layout.filter((c) => c.pinned === "left").reduce((s, c) => s + c.width, 0)
    const pinnedRight = latest.current.layout.filter((c) => c.pinned === "right").reduce((s, c) => s + c.width, 0)
    if (left < el.scrollLeft + pinnedLeft) el.scrollLeft = left - pinnedLeft
    else if (left + col.width > el.scrollLeft + el.clientWidth - pinnedRight)
      el.scrollLeft = left + col.width - el.clientWidth + pinnedRight
  }, [])

  const focusCell = React.useCallback(
    (address: CellAddress, options?: { extend?: boolean; scroll?: boolean }) => {
      const { rows, layout } = latest.current
      if (!rows.length || !layout.length) return
      const rowIndex = clamp(address.rowIndex, 0, rows.length - 1)
      const columnId = layout.some((c) => c.id === address.columnId) ? address.columnId : layout[0].id
      const next = { rowIndex, columnId }
      setFocus(next)
      setRange((prev) =>
        options?.extend && (prev?.anchor ?? latest.current.focus)
          ? { anchor: prev?.anchor ?? latest.current.focus!, focus: next }
          : null
      )
      setFocusRequest((n) => n + 1)
      if (options?.scroll !== false) {
        scrollRowIntoView(rowIndex)
        scrollColumnIntoView(columnId)
      }
    },
    [scrollRowIntoView, scrollColumnIntoView]
  )

  const startEditing = React.useCallback((address: CellAddress, seed?: string) => {
    const config = latest.current.layout.find((c) => c.id === address.columnId)?.config
    if (!config?.editable) return
    setEditing({ ...address, seed })
  }, [])

  const stopEditing = React.useCallback((options?: { refocus?: boolean }) => {
    setEditing(null)
    if (options?.refocus !== false) setFocusRequest((n) => n + 1)
  }, [])

  const commit = React.useCallback((address: CellAddress, value: unknown) => {
    const row = latest.current.rows[address.rowIndex]
    if (!row) return
    const previous = row.getValue(address.columnId)
    if (Object.is(previous, value)) return
    latest.current.onCellChange?.({ row, columnId: address.columnId, value, previous })
  }, [])

  const rangeBounds = React.useCallback(
    () => boundsOf(latest.current.range, latest.current.focus, latest.current.layout),
    []
  )

  const isInRange = React.useCallback(
    (address: CellAddress) => {
      if (!range) return false
      const b = boundsOf(range, focus, layout)
      const ci = layout.findIndex((c) => c.id === address.columnId)
      return !!b && address.rowIndex >= b.r0 && address.rowIndex <= b.r1 && ci >= b.c0 && ci <= b.c1
    },
    [range, focus, layout]
  )

  const clearRange = React.useCallback(() => {
    const b = rangeBounds()
    if (!b) return
    const { rows, layout } = latest.current
    let count = 0
    for (let r = b.r0; r <= b.r1; r++) {
      for (let c = b.c0; c <= b.c1; c++) {
        const col = layout[c]
        if (!col?.config.editable) continue
        const row = rows[r]
        const empty = col.config.type === "boolean" ? false : col.config.type === "number" ? null : ""
        if (row && !Object.is(row.getValue(col.id), empty)) {
          latest.current.onCellChange?.({ row, columnId: col.id, value: empty, previous: row.getValue(col.id) })
          count++
        }
      }
    }
    if (count) announce(`Cleared ${count} cell${count === 1 ? "" : "s"}.`)
  }, [rangeBounds, announce])

  const copyRange = React.useCallback(async () => {
    const b = rangeBounds()
    if (!b) return
    const { rows, layout } = latest.current
    const lines: string[] = []
    for (let r = b.r0; r <= b.r1; r++) {
      const cells: string[] = []
      for (let c = b.c0; c <= b.c1; c++) {
        const col = layout[c]
        const value = rows[r]?.getValue(col.id)
        cells.push((col.config.format ?? defaultFormat)(value))
      }
      lines.push(cells.join("\t"))
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"))
      const n = (b.r1 - b.r0 + 1) * (b.c1 - b.c0 + 1)
      announce(`Copied ${n} cell${n === 1 ? "" : "s"}.`)
    } catch {
      announce("Could not copy to the clipboard.")
    }
  }, [rangeBounds, announce])

  const paste = React.useCallback(async () => {
    const { focus, rows, layout } = latest.current
    if (!focus) return
    let text = ""
    try {
      text = await navigator.clipboard.readText()
    } catch {
      announce("Could not read the clipboard.")
      return
    }
    const lines = text
      .replace(/\r/g, "")
      .split("\n")
      .filter((l, i, arr) => l !== "" || i < arr.length - 1)
    const startCol = layout.findIndex((c) => c.id === focus.columnId)
    let count = 0
    lines.forEach((line, dr) => {
      const row = rows[focus.rowIndex + dr]
      if (!row) return
      line.split("\t").forEach((cell, dc) => {
        const col = layout[startCol + dc]
        if (!col?.config.editable) return
        const previous = row.getValue(col.id)
        const value = parseInput(col.config, cell, previous)
        if (!Object.is(previous, value)) {
          latest.current.onCellChange?.({ row, columnId: col.id, value, previous })
          count++
        }
      })
    })
    announce(`Pasted into ${count} cell${count === 1 ? "" : "s"}.`)
  }, [announce])

  const ctx = React.useMemo<DataGridContextValue<TData>>(
    () => ({
      table,
      rows,
      layout,
      layoutById,
      templateColumns,
      totalWidth,
      rowHeight,
      setWidth,
      focus,
      range,
      editing,
      focusCell,
      startEditing,
      stopEditing,
      commit,
      clearRange,
      copyRange,
      paste,
      isInRange,
      containerRef,
      focusRequest,
      registerEditor,
      closeEditor,
      window,
      setScrollTop,
      setViewportHeight,
      announce,
    }),
    [
      table,
      rows,
      layout,
      layoutById,
      templateColumns,
      totalWidth,
      rowHeight,
      setWidth,
      focus,
      range,
      editing,
      focusCell,
      startEditing,
      stopEditing,
      commit,
      clearRange,
      copyRange,
      paste,
      isInRange,
      focusRequest,
      registerEditor,
      closeEditor,
      window,
      setScrollTop,
      announce,
    ]
  )

  return (
    <DataGridContext.Provider value={ctx as DataGridContextValue}>
      <ark.div
        data-slot="data-grid"
        data-editing={editing ? "" : undefined}
        className={cn("flex min-h-0 flex-1 flex-col", className)}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {children}
            <LiveRegion.Root data-slot="data-grid-live-region" message={announcement} />
          </>
        )}
      </ark.div>
    </DataGridContext.Provider>
  )
}

function boundsOf(range: CellRange | null, focus: CellAddress | null, layout: ColumnLayout[]) {
  const a = range?.anchor ?? focus
  const b = range?.focus ?? focus
  if (!a || !b) return null
  const ca = layout.findIndex((c) => c.id === a.columnId)
  const cb = layout.findIndex((c) => c.id === b.columnId)
  return {
    r0: Math.min(a.rowIndex, b.rowIndex),
    r1: Math.max(a.rowIndex, b.rowIndex),
    c0: Math.min(ca, cb),
    c1: Math.max(ca, cb),
  }
}

function parseInput(config: DataGridColumnConfig, input: string, previous: unknown): unknown {
  if (config.parse) return config.parse(input, previous)
  switch (config.type) {
    case "number": {
      if (input.trim() === "") return null
      const n = Number(input)
      return Number.isNaN(n) ? previous : n
    }
    case "boolean":
      return /^(true|yes|1|on|x)$/i.test(input.trim())
    case "date": {
      if (!input) return null
      const d = new Date(input)
      return Number.isNaN(d.getTime()) ? previous : previous instanceof Date ? d : input
    }
    default:
      return input
  }
}

/* ---------------------------------------------------------------------------
 * Container, header, body
 * ------------------------------------------------------------------------- */

function DataGridContainer({ className, onScroll, ...props }: DataGridContainerProps) {
  const { containerRef, setScrollTop, setViewportHeight, rows, closeEditor } = useDataGrid()
  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setViewportHeight(el.clientHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef, setViewportHeight])
  return (
    <ark.div
      ref={containerRef}
      data-slot="data-grid-container"
      role="grid"
      aria-rowcount={rows.length}
      className={cn("relative min-h-0 flex-1 overflow-auto rounded-lg border bg-background text-sm", className)}
      onScroll={(event) => {
        onScroll?.(event)
        // An open editor (and its portaled popover) must not drift away from its cell.
        closeEditor()
        setScrollTop(event.currentTarget.scrollTop)
      }}
      {...props}
    />
  )
}

function DataGridHeader({ className, ...props }: DataGridHeaderProps) {
  return (
    <ark.div
      data-slot="data-grid-header"
      role="rowgroup"
      className={cn("sticky top-0 z-30 w-fit min-w-full bg-muted", className)}
      {...props}
    />
  )
}

function DataGridHeaderRow({ className, style, ...props }: DataGridHeaderRowProps) {
  const { templateColumns, totalWidth } = useDataGrid()
  return (
    <ark.div
      data-slot="data-grid-header-row"
      role="row"
      className={cn("grid border-b bg-muted", className)}
      style={{ gridTemplateColumns: templateColumns, minWidth: totalWidth, ...style }}
      {...props}
    />
  )
}

const pinnedStyle = (col: ColumnLayout | undefined): React.CSSProperties | undefined =>
  col?.pinned === "left" ? { left: col.offset } : col?.pinned === "right" ? { right: col.offset } : undefined

/** A header cell. Sortable columns get a sort button with `children` as the title. */
function DataGridHead({ column: columnId, className, children, style, ...props }: DataGridHeadProps) {
  const { table, layoutById } = useDataGrid()
  const column = table.getColumn(columnId)
  const layout = layoutById.get(columnId)
  if (!column || !layout) return null
  const sorted = column.getIsSorted()
  const sortable = column.getCanSort()
  return (
    <ark.div
      data-slot="data-grid-head"
      data-column={columnId}
      data-pinned={layout.pinned}
      role="columnheader"
      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
      className={cn(
        "group/head relative flex h-9 items-center gap-1 overflow-hidden px-2 font-medium whitespace-nowrap text-muted-foreground",
        layout.pinned && "sticky z-10 bg-muted",
        layout.pinned === "left" && "border-e",
        layout.pinned === "right" && "border-s",
        className
      )}
      style={{ ...pinnedStyle(layout), ...style }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {sortable ? (
            <ark.button
              type="button"
              data-slot="data-grid-sort-trigger"
              className="-ms-1 flex h-7 min-w-0 items-center gap-1 rounded-md px-1 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={() => column.toggleSorting()}
            >
              <span className="truncate">{children}</span>
              {sorted === "desc" ? (
                <ArrowDownIcon className="size-3.5 shrink-0" />
              ) : sorted === "asc" ? (
                <ArrowUpIcon className="size-3.5 shrink-0" />
              ) : (
                <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
              )}
            </ark.button>
          ) : (
            <span className="truncate">{children}</span>
          )}
        </>
      )}
    </ark.div>
  )
}

/** Pointer-driven column resizer; double-click resets to the configured width. */
function DataGridResizeHandle({ className, onPointerDown, onDoubleClick, ...props }: DataGridResizeHandleProps) {
  const { setWidth, layoutById } = useDataGrid()
  const head = React.useContext(HeadColumnContext)
  return (
    <ark.div
      data-slot="data-grid-resize-handle"
      role="separator"
      aria-orientation="vertical"
      className={cn(
        "absolute inset-y-0 inset-e-0 z-10 w-2 cursor-col-resize touch-none select-none after:absolute after:inset-y-2 after:inset-e-0.5 after:w-px after:bg-border group-hover/head:after:bg-foreground/40 hover:after:bg-primary",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0 || !head) return
        event.preventDefault()
        event.stopPropagation()
        const start = event.clientX
        const startWidth = layoutById.get(head)?.width ?? DEFAULT_WIDTH
        const min = layoutById.get(head)?.config.minWidth ?? MIN_WIDTH
        const move = (e: PointerEvent) => setWidth(head, Math.max(min, startWidth + e.clientX - start))
        const up = () => {
          window.removeEventListener("pointermove", move)
          window.removeEventListener("pointerup", up)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event)
        if (!event.defaultPrevented && head) {
          const config = layoutById.get(head)?.config
          setWidth(head, config?.width ?? DEFAULT_WIDTH)
        }
      }}
      {...props}
    />
  )
}

const HeadColumnContext = React.createContext<string | null>(null)

/** Wraps `DataGridHead` so `DataGridResizeHandle` knows its column. */
function DataGridHeadWithResize({ column, children, ...props }: DataGridHeadWithResizeProps) {
  return (
    <HeadColumnContext.Provider value={column}>
      <DataGridHead column={column} {...props}>
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {children}
            <DataGridResizeHandle />
          </>
        )}
      </DataGridHead>
    </HeadColumnContext.Provider>
  )
}

/** Virtualized rows. `children` renders the cells for a row. */
function DataGridBody<TData>({ className, children, style, ...props }: DataGridBodyProps<TData>) {
  const { rows, window: win, rowHeight, totalWidth } = useDataGrid<TData>()
  const visible = rows.slice(win.start, win.end)
  return (
    <ark.div
      data-slot="data-grid-body"
      role="rowgroup"
      className={cn("relative", className)}
      style={{ height: rows.length * rowHeight, minWidth: totalWidth, ...style }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div style={{ transform: `translateY(${win.start * rowHeight}px)` }}>
            {visible.map((row, i) => (
              <DataGridRow key={row.id} row={row} index={win.start + i}>
                {typeof children === "function" ? children(row, win.start + i) : children}
              </DataGridRow>
            ))}
          </div>
        </>
      )}
    </ark.div>
  )
}

function DataGridRow<TData>({ row, index, className, style, ...props }: DataGridRowProps<TData>) {
  const { templateColumns, rowHeight, focus } = useDataGrid()
  const ctx = React.useMemo(() => ({ row: row as DataTableRow<unknown>, index }), [row, index])
  const selected = row.getIsSelected()
  return (
    <RowContext.Provider value={ctx}>
      <ark.div
        data-slot="data-grid-row"
        data-index={index}
        data-state={selected ? "selected" : undefined}
        data-focused={focus?.rowIndex === index ? "" : undefined}
        role="row"
        aria-rowindex={index + 1}
        aria-selected={selected || undefined}
        className={cn(
          "group/row grid border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/60",
          className
        )}
        style={{ gridTemplateColumns: templateColumns, height: rowHeight, ...style }}
        {...props}
      />
    </RowContext.Provider>
  )
}

/* ---------------------------------------------------------------------------
 * Cells
 * ------------------------------------------------------------------------- */

const isPrintable = (event: React.KeyboardEvent) =>
  event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey

function DataGridCell({
  column: columnId,
  editable: editableProp,
  editor,
  className,
  children,
  style,
  onClick,
  onDoubleClick,
  onKeyDown,
  onPointerDown,
  ...props
}: DataGridCellProps) {
  const grid = useDataGrid()
  const { row, index } = useDataGridRow()
  const layout = grid.layoutById.get(columnId)
  const address = React.useMemo(() => ({ rowIndex: index, columnId }), [index, columnId])
  const ref = React.useRef<HTMLDivElement>(null)
  const focused = grid.focus?.rowIndex === index && grid.focus.columnId === columnId
  const isEditing = grid.editing?.rowIndex === index && grid.editing.columnId === columnId
  // Take DOM focus when this cell is the focused one and a focus request is pending
  // (after navigation, after an editor closes, or once a virtualized row mounts).
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!focused || isEditing || !el) return
    if (document.activeElement !== el && !el.contains(document.activeElement)) el.focus({ preventScroll: true })
  }, [focused, isEditing, grid.focusRequest])
  if (!layout) return null
  const config = layout.config
  const editable = editableProp ?? !!config.editable
  const inRange = grid.isInRange(address)
  const value = row.getValue(columnId)
  const format = config.format ?? defaultFormat
  const columnIndex = grid.layout.indexOf(layout)

  const move = (dr: number, dc: number, extend = false) => {
    // Navigate from the focused address in state; DOM focus can lag a frame after an edit.
    const base = grid.focus ?? address
    const baseCol = Math.max(
      0,
      grid.layout.findIndex((c) => c.id === base.columnId)
    )
    const nextCol = grid.layout[clamp(baseCol + dc, 0, grid.layout.length - 1)]
    grid.focusCell({ rowIndex: base.rowIndex + dr, columnId: nextCol.id }, { extend })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || isEditing) return
    const meta = event.metaKey || event.ctrlKey
    const pageRows = Math.max(1, Math.floor((grid.containerRef.current?.clientHeight ?? 0) / grid.rowHeight) - 1)
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        move(1, 0, event.shiftKey)
        return
      case "ArrowUp":
        event.preventDefault()
        move(-1, 0, event.shiftKey)
        return
      case "ArrowRight":
        event.preventDefault()
        move(0, 1, event.shiftKey)
        return
      case "ArrowLeft":
        event.preventDefault()
        move(0, -1, event.shiftKey)
        return
      case "Home":
        event.preventDefault()
        grid.focusCell({ rowIndex: meta ? 0 : index, columnId: grid.layout[0].id }, { extend: event.shiftKey })
        return
      case "End":
        event.preventDefault()
        grid.focusCell(
          { rowIndex: meta ? grid.rows.length - 1 : index, columnId: grid.layout[grid.layout.length - 1].id },
          { extend: event.shiftKey }
        )
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
        event.preventDefault()
        move(0, event.shiftKey ? -1 : 1)
        return
      case "Enter":
      case "F2":
        event.preventDefault()
        if (editable) grid.startEditing(address)
        else if (event.key === "Enter") move(1, 0)
        return
      case " ":
        if (editable && config.type === "boolean") {
          event.preventDefault()
          grid.commit(address, !value)
        }
        return
      case "Escape":
        grid.focusCell(address)
        return
      case "Delete":
      case "Backspace":
        event.preventDefault()
        grid.clearRange()
        return
      case "c":
      case "C":
        if (meta) {
          event.preventDefault()
          void grid.copyRange()
        }
        return
      case "v":
      case "V":
        if (meta) {
          event.preventDefault()
          void grid.paste()
        }
        return
    }
    if (editable && isPrintable(event) && config.type !== "boolean") {
      event.preventDefault()
      grid.startEditing(address, event.key)
    }
  }

  return (
    <ark.div
      ref={ref}
      data-slot="data-grid-cell"
      data-column={columnId}
      data-row-index={index}
      data-type={config.type}
      data-pinned={layout.pinned}
      data-editable={editable ? "" : undefined}
      data-focused={focused ? "" : undefined}
      data-editing={isEditing ? "" : undefined}
      data-selected={inRange ? "" : undefined}
      role="gridcell"
      aria-colindex={columnIndex + 1}
      aria-readonly={editable ? undefined : true}
      tabIndex={focused ? 0 : -1}
      className={cn(
        "relative flex min-w-0 items-center overflow-hidden px-2 whitespace-nowrap outline-none",
        "data-selected:bg-primary/10",
        "data-focused:z-10 data-focused:ring-2 data-focused:ring-primary data-focused:ring-inset",
        "data-editing:bg-background data-editing:p-0",
        layout.pinned && "sticky z-20 bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
        layout.pinned === "left" && "border-e",
        layout.pinned === "right" && "border-s",
        config.type === "number" && "justify-end tabular-nums",
        className
      )}
      style={{ ...pinnedStyle(layout), ...style }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0 || isEditing) return
        if ((event.target as HTMLElement).closest("button, a, input, select, textarea, [role=checkbox]")) return
        grid.focusCell(address, { extend: event.shiftKey, scroll: false })
      }}
      onClick={onClick}
      onDoubleClick={(event) => {
        onDoubleClick?.(event)
        if (!event.defaultPrevented && editable && config.type !== "boolean") grid.startEditing(address)
      }}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {isEditing ? (
            <CellEditor
              address={address}
              config={config}
              row={row}
              value={value}
              format={format}
              editor={editor}
              display={children}
            />
          ) : children !== undefined ? (
            children
          ) : config.type === "boolean" ? (
            <Checkbox.Root
              checked={!!value}
              disabled={!editable}
              onCheckedChange={({ checked }) => grid.commit(address, checked === true)}
              aria-label={columnId}
            >
              <Checkbox.Control>
                <Checkbox.Indicator>
                  <CheckIcon />
                </Checkbox.Indicator>
                <Checkbox.Indicator indeterminate>
                  <MinusIcon />
                </Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
          ) : (
            <span className="truncate">{format(value)}</span>
          )}
        </>
      )}
    </ark.div>
  )
}

function CellEditor({
  address,
  config,
  row,
  value,
  format,
  editor,
  display,
}: {
  address: CellAddress
  config: DataGridColumnConfig
  row: DataTableRow<unknown>
  value: unknown
  format: (value: unknown) => string
  editor?: (props: EditorRenderProps) => React.ReactNode | undefined
  display?: React.ReactNode
}) {
  const grid = useDataGrid()
  const seed = grid.editing?.seed
  const [text, setText] = React.useState(() => seed ?? format(value))
  const inputRef = React.useRef<HTMLInputElement>(null)
  const done = React.useRef(false)
  React.useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
    if (seed === undefined && "select" in el && typeof el.select === "function" && el.type !== "date") el.select()
  }, [seed])

  const commit = (next?: string, then?: () => void) => {
    if (done.current) return
    done.current = true
    grid.commit(address, parseInput(config, next ?? text, value))
    grid.stopEditing({ refocus: !then })
    then?.()
  }
  const cancel = () => {
    if (done.current) return
    done.current = true
    grid.stopEditing()
  }
  const isSelect = config.type === "select" && !!config.options
  const commitRef = React.useRef(commit)
  const cancelRef = React.useRef(cancel)
  React.useEffect(() => {
    commitRef.current = commit
    cancelRef.current = cancel
  })
  const { registerEditor } = grid
  // Scrolling the grid closes the editor (text commits, an unpicked select cancels) before its
  // row can leave the virtual window, so the editor never unmounts mid-edit.
  React.useEffect(
    () => registerEditor({ close: () => (isSelect ? cancelRef.current() : commitRef.current()) }),
    [registerEditor, isSelect]
  )
  const moveAfter = (dr: number, dc: number) => () => {
    const col = grid.layout.findIndex((c) => c.id === address.columnId)
    const next = grid.layout[clamp(col + dc, 0, grid.layout.length - 1)]
    grid.focusCell({ rowIndex: address.rowIndex + dr, columnId: next.id })
  }
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      commit(undefined, moveAfter(1, 0))
    } else if (event.key === "Tab") {
      event.preventDefault()
      commit(undefined, moveAfter(0, event.shiftKey ? -1 : 1))
    } else if (event.key === "Escape") {
      event.preventDefault()
      cancel()
    }
    event.stopPropagation()
  }
  const inputProps: EditorRenderProps["inputProps"] = {
    ref: inputRef,
    value: text,
    onChange: (e) => setText(e.target.value),
    onKeyDown,
    onBlur: () => commit(),
    className: "size-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground",
    "aria-label": "Edit value",
  }
  const custom = editor?.({ value: text, onChange: setText, commit, cancel, column: config, row, inputProps })
  if (custom !== undefined) return <>{custom}</>

  if (config.type === "select" && config.options) {
    return (
      <SelectEditor
        options={config.options}
        value={text}
        display={display}
        onCommit={(v) => commit(v, moveAfter(1, 0))}
        onCancel={cancel}
      />
    )
  }
  const type = config.type === "number" ? "number" : config.type === "date" ? "date" : "text"
  return <ark.input data-slot="data-grid-editor" type={type} {...inputProps} />
}

/** Opens the toolkit Select immediately; picking commits, closing without a pick cancels. */
function SelectEditor({
  options,
  value,
  display,
  onCommit,
  onCancel,
}: {
  options: DataGridOption[]
  value: string
  /** What the cell normally shows, so the open editor looks like the cell. */
  display?: React.ReactNode
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  const collection = React.useMemo(
    () => createListCollection({ items: options, itemToValue: (o) => o.value, itemToString: (o) => o.label }),
    [options]
  )
  const picked = React.useRef(false)
  const contentId = React.useId()
  // Ark handles list navigation on the open content, so focus it (it is portaled) once mounted.
  React.useLayoutEffect(() => {
    const focusContent = () => document.getElementById(contentId)?.focus({ preventScroll: true })
    focusContent()
    const timer = setTimeout(focusContent, 0)
    return () => clearTimeout(timer)
  }, [contentId])
  const label = options.find((o) => o.value === value)?.label ?? value
  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      defaultOpen
      ids={{ content: contentId }}
      positioning={{ sameWidth: true, gutter: 2 }}
      onValueChange={({ value: next }) => {
        if (next[0] === undefined) return
        picked.current = true
        onCommit(next[0])
      }}
      onOpenChange={({ open }) => {
        if (!open && !picked.current) onCancel()
      }}
      onPointerDown={(event) => event.stopPropagation()}
      className="size-full"
    >
      <Select.Control className="size-full">
        <Select.Trigger
          variant="unstyled"
          data-slot="data-grid-select-editor"
          className="size-full px-2 [&_svg]:text-muted-foreground"
          aria-label="Edit value"
        >
          <Select.ValueText placeholder="Choose…">{display ?? label}</Select.ValueText>
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

/* ---------------------------------------------------------------------------
 * Selection cells, empty
 * ------------------------------------------------------------------------- */

function DataGridSelectAll({ className, ...props }: DataGridSelectAllProps) {
  const { table, layoutById } = useDataGrid()
  const layout = layoutById.get("select")
  const t = table as DataTableInstance<unknown> & {
    getIsAllPageRowsSelected?: () => boolean
    getIsSomePageRowsSelected?: () => boolean
    toggleAllPageRowsSelected?: (v?: boolean) => void
  }
  const all = t.getIsAllPageRowsSelected?.() ?? false
  const some = t.getIsSomePageRowsSelected?.() ?? false
  return (
    <ark.div
      data-slot="data-grid-select-all"
      role="columnheader"
      className={cn(
        "flex items-center justify-center",
        layout?.pinned && "sticky z-10 bg-muted",
        layout?.pinned === "left" && "border-e",
        className
      )}
      style={pinnedStyle(layout)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Checkbox.Root
            checked={all ? true : some ? "indeterminate" : false}
            onCheckedChange={({ checked }) => t.toggleAllPageRowsSelected?.(checked === true)}
            aria-label="Select all"
          >
            <Checkbox.Control>
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
              <Checkbox.Indicator indeterminate>
                <MinusIcon />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        </>
      )}
    </ark.div>
  )
}

function DataGridSelectRow({ className, ...props }: DataGridSelectRowProps) {
  const { layoutById } = useDataGrid()
  const { row } = useDataGridRow()
  const layout = layoutById.get("select")
  return (
    <ark.div
      data-slot="data-grid-select-row"
      role="gridcell"
      className={cn(
        "flex items-center justify-center",
        layout?.pinned && "sticky z-20 bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
        layout?.pinned === "left" && "border-e",
        className
      )}
      style={pinnedStyle(layout)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Checkbox.Root
            checked={row.getIsSelected()}
            onCheckedChange={({ checked }) => row.toggleSelected(checked === true)}
            aria-label="Select row"
          >
            <Checkbox.Control>
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
              <Checkbox.Indicator indeterminate>
                <MinusIcon />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        </>
      )}
    </ark.div>
  )
}

function DataGridEmpty({ className, ...props }: DataGridEmptyProps) {
  const { rows } = useDataGrid()
  if (rows.length) return null
  return (
    <ark.div
      data-slot="data-grid-empty"
      className={cn("flex h-24 items-center justify-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

type DataGridRootProps<TData = unknown> = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  table: DataTableInstance<TData>
  /** Per-column grid behaviour keyed by column id: editor type, width, pinning, options, format and parse. */
  columns?: DataGridColumnConfig[]
  /** Fixed height of every row in px. */
  rowHeight?: number
  /** Rows rendered beyond the visible window on each side. */
  overscan?: number
  /** Called with `{ row, columnId, value, previous }` when a cell edit commits; the consumer applies it. */
  onCellChange?: (change: DataGridCellChange<TData>) => void
  /** Controlled column widths by column id. */
  columnSizing?: Record<string, number>
  /** Initial column widths when uncontrolled. */
  defaultColumnSizing?: Record<string, number>
  /** Called when a column is resized. */
  onColumnSizingChange?: (sizing: Record<string, number>) => void
  children?: React.ReactNode
}

type DataGridContainerProps = React.ComponentProps<typeof ark.div>

type DataGridHeaderProps = React.ComponentProps<typeof ark.div>

type DataGridHeaderRowProps = React.ComponentProps<typeof ark.div>

type DataGridHeadProps = React.ComponentProps<typeof ark.div> & { column: string }

type DataGridHeadWithResizeProps = React.ComponentProps<typeof DataGridHead>

type DataGridResizeHandleProps = React.ComponentProps<typeof ark.div>

type DataGridBodyProps<TData = unknown> = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  children: ((row: DataTableRow<TData>, index: number) => React.ReactNode) | React.ReactElement
}

type DataGridRowProps<TData = unknown> = React.ComponentProps<typeof ark.div> & {
  row: DataTableRow<TData>
  index: number
}

type DataGridCellProps = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  column: string
  /** Override the column config for this cell. */
  editable?: boolean
  /** Custom editor; return `undefined` to use the default for the column type. */
  editor?: (props: EditorRenderProps) => React.ReactNode | undefined
  children?: React.ReactNode
}

type DataGridSelectAllProps = React.ComponentProps<typeof ark.div>

type DataGridSelectRowProps = React.ComponentProps<typeof ark.div>

type DataGridEmptyProps = React.ComponentProps<typeof ark.div>

const DataGrid = {
  Root: DataGridRoot,
  Container: DataGridContainer,
  Header: DataGridHeader,
  HeaderRow: DataGridHeaderRow,
  Head: DataGridHead,
  HeadWithResize: DataGridHeadWithResize,
  ResizeHandle: DataGridResizeHandle,
  Body: DataGridBody,
  Row: DataGridRow,
  Cell: DataGridCell,
  SelectAll: DataGridSelectAll,
  SelectRow: DataGridSelectRow,
  Empty: DataGridEmpty,
}

export {
  DataGrid,
  useDataGrid,
  useDataGridRow,
  type DataGridColumnConfig,
  type DataGridColumnType,
  type DataGridCellChange,
  type DataGridOption,
  type DataGridRootProps,
  type DataGridContainerProps,
  type DataGridHeaderProps,
  type DataGridHeaderRowProps,
  type DataGridHeadProps,
  type DataGridHeadWithResizeProps,
  type DataGridResizeHandleProps,
  type DataGridBodyProps,
  type DataGridRowProps,
  type DataGridCellProps,
  type DataGridSelectAllProps,
  type DataGridSelectRowProps,
  type DataGridEmptyProps,
}

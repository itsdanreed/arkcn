/** Native, virtualized spreadsheet with shared formulas, frozen panes, editing, and intent-based history. */
import {
  Children,
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentRef,
  type ReactNode,
} from "react"
import { Platform, Pressable, ScrollView, Text, View, type ViewStyle } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedReaction,
} from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import { AnimatedPressable } from "../../lib/motion"
import { rowMetrics, rowAtOffset } from "../../lib/spreadsheet-layout"
import * as Clipboard from "expo-clipboard"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { cellName, columnLabel, createFormulaEvaluator, type FormulaFunction } from "../../lib/formula"
import {
  boundsOf,
  sameCell,
  parseInput,
  rawText,
  fillTarget,
  fillChanges,
  type SpreadsheetValue,
  type SpreadsheetData,
  type SpreadsheetCellAddress,
  type SpreadsheetSelection,
  type SpreadsheetChange,
} from "../../lib/spreadsheet"
import { useNativeTheme, withOpacity } from "../../lib/theme"
import { Input } from "./input"
import { Button, type ButtonProps } from "./button"
export * from "../../lib/spreadsheet"
export { cellName, columnLabel }
type ViewProps = ComponentPropsWithRef<typeof View>
type PressProps = Omit<ComponentPropsWithRef<typeof Pressable>, "children"> & { children?: ReactNode }
type InputProps = ComponentPropsWithRef<typeof Input.Root>
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
type Editing = SpreadsheetCellAddress & { draft: string; via: "bar" | "cell" }
export type SpreadsheetRootProps = ViewProps & {
  data: SpreadsheetData
  rowCount?: number
  columnCount?: number
  onCellsChange?: (changes: SpreadsheetChange[]) => void
  rowHeight?: number
  minRowHeight?: number
  rowHeights?: Record<number, number>
  defaultRowHeights?: Record<number, number>
  onRowHeightsChange?: (heights: Record<number, number>) => void
  rowHeaderWidth?: number
  columnWidth?: number
  minColumnWidth?: number
  columnWidths?: Record<number, number>
  defaultColumnWidths?: Record<number, number>
  onColumnWidthsChange?: (widths: Record<number, number>) => void
  selection?: SpreadsheetSelection | null
  defaultSelection?: SpreadsheetSelection | null
  onSelectionChange?: (selection: SpreadsheetSelection | null) => void
  frozenRows?: number
  frozenColumns?: number
  overscan?: number
  readOnly?: boolean
  functions?: Record<string, FormulaFunction>
  historyLimit?: number
}
function useSheet({
  data,
  rowCount: rowsProp,
  columnCount: colsProp,
  onCellsChange,
  rowHeight = 32,
  minRowHeight = 24,
  rowHeights,
  defaultRowHeights = {},
  onRowHeightsChange,
  rowHeaderWidth = 48,
  columnWidth = 100,
  minColumnWidth = 40,
  columnWidths,
  defaultColumnWidths = {},
  onColumnWidthsChange,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  frozenRows: frozenRowsProp = 0,
  frozenColumns: frozenColumnsProp = 0,
  overscan = 6,
  readOnly = false,
  functions,
  historyLimit = 100,
}: SpreadsheetRootProps) {
  const rowCount = rowsProp ?? data.length
  const columnCount = colsProp ?? data.reduce((max, row) => Math.max(max, row.length), 0)
  if (
    !Number.isInteger(rowCount) ||
    rowCount < 0 ||
    !Number.isInteger(columnCount) ||
    columnCount < 0 ||
    !Number.isFinite(minRowHeight) ||
    minRowHeight <= 0 ||
    !Number.isFinite(rowHeight) ||
    rowHeight <= 0 ||
    !Number.isFinite(columnWidth) ||
    columnWidth <= 0 ||
    !Number.isFinite(minColumnWidth) ||
    minColumnWidth <= 0 ||
    !Number.isFinite(rowHeaderWidth) ||
    rowHeaderWidth < 0 ||
    !Number.isFinite(frozenRowsProp) ||
    !Number.isFinite(frozenColumnsProp) ||
    !Number.isInteger(overscan) ||
    overscan < 0 ||
    !Number.isInteger(historyLimit) ||
    historyLimit < 1
  )
    throw new RangeError(
      "Spreadsheet dimensions must be finite and positive; row/column counts must be nonnegative integers"
    )
  const frozenRows = clamp(Math.floor(frozenRowsProp), 0, rowCount)
  const frozenColumns = clamp(Math.floor(frozenColumnsProp), 0, columnCount)
  const [rowSizing, setRowSizing] = useControllable(rowHeights, defaultRowHeights, onRowHeightsChange)
  const { heights, offsets: rowOffsets } = useMemo(
    () => rowMetrics(rowCount, rowHeight, minRowHeight, rowSizing),
    [rowCount, rowHeight, minRowHeight, rowSizing]
  )
  const frozenHeight = rowOffsets[frozenRows]
  const [sizing, setSizing] = useControllable(columnWidths, defaultColumnWidths, onColumnWidthsChange)
  const widths = Array.from({ length: columnCount }, (_, c) =>
    Math.max(minColumnWidth, Number.isFinite(sizing[c]) ? sizing[c] : columnWidth)
  )
  const offsets: number[] = []
  let totalWidth = rowHeaderWidth
  for (const width of widths) {
    offsets.push(totalWidth)
    totalWidth += width
  }
  const [selectionState, setSelection] = useControllable(selectionProp, defaultSelection, onSelectionChange)
  const validCell = (cell: SpreadsheetCellAddress) => ({
    row: clamp(Math.floor(cell.row), 0, Math.max(0, rowCount - 1)),
    column: clamp(Math.floor(cell.column), 0, Math.max(0, columnCount - 1)),
  })
  const selection =
    rowCount && columnCount && selectionState
      ? { anchor: validCell(selectionState.anchor), focus: validCell(selectionState.focus) }
      : null
  const bounds = boundsOf(selection)
  const [editing, setEditingState] = useState<Editing | null>(null)
  const editingRef = useRef(editing)
  const setEditing = (next: Editing | null) => {
    editingRef.current = next
    setEditingState(next)
  }
  const [extend, setExtend] = useState(false)
  const [filling, setFilling] = useState(false)
  const [message, announce] = useState("")
  const resizePreview = useSharedValue({ axis: "none", index: -1, delta: 0 })
  const [resizeRevision, finishResize] = useState(0)
  useLayoutEffect(() => {
    resizePreview.set({ axis: "none", index: -1, delta: 0 })
  }, [resizeRevision, resizePreview])
  const scrollX = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const [scroll, setScroll] = useState({ x: 0, y: 0 })
  const [viewport, setViewport] = useState({ width: 0, height: 320 })
  const horizontalRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const verticalRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const formulaRef = useRef<ComponentRef<typeof Input.Root>>(null)
  const getRaw = (cell: SpreadsheetCellAddress): SpreadsheetValue => data[cell.row]?.[cell.column] ?? null
  const evaluator = useMemo(
    () => createFormulaEvaluator((cell) => data[cell.row]?.[cell.column] ?? null, { rowCount, columnCount, functions }),
    [data, rowCount, columnCount, functions]
  )
  const history = useRef<{ batches: SpreadsheetChange[][]; cursor: number }>({ batches: [], cursor: 0 })
  const [, refreshHistory] = useState(0)
  const applyChanges = (changes: SpreadsheetChange[]) => {
    if (readOnly || !onCellsChange) return
    const real = changes.filter(
      (c) =>
        c.row >= 0 && c.row < rowCount && c.column >= 0 && c.column < columnCount && !Object.is(c.value, c.previous)
    )
    if (!real.length) return
    onCellsChange(real)
    const batches = [...history.current.batches.slice(0, history.current.cursor), real].slice(
      -Math.max(1, historyLimit)
    )
    history.current = { batches, cursor: batches.length }
    refreshHistory((n) => n + 1)
    announce(`Changed ${real.length} cells`)
  }
  const undo = () => {
    if (readOnly || !onCellsChange || !history.current.cursor) return
    setEditing(null)
    const batch = history.current.batches[--history.current.cursor]
    onCellsChange(batch.map((c) => ({ ...c, value: c.previous, previous: c.value })))
    refreshHistory((n) => n + 1)
    announce("Undid the last change")
  }
  const redo = () => {
    if (readOnly || !onCellsChange || history.current.cursor >= history.current.batches.length) return
    setEditing(null)
    onCellsChange(history.current.batches[history.current.cursor++])
    refreshHistory((n) => n + 1)
    announce("Redid the last change")
  }
  const scrollToCell = (cell: SpreadsheetCellAddress) => {
    let x = scrollX.get(),
      y = scrollY.get()
    const frozenWidth = offsets[frozenColumns] ?? totalWidth
    const height = Math.max(rowHeight, viewport.height - frozenHeight - rowHeight)
    if (cell.row >= frozenRows) {
      const top = rowOffsets[cell.row] - frozenHeight
      if (top < y) y = top
      else if (top + heights[cell.row] > y + height) y = top + heights[cell.row] - height
    }
    if (cell.column >= frozenColumns) {
      const left = offsets[cell.column] - frozenWidth
      const width = Math.max(1, viewport.width - frozenWidth)
      if (left < x) x = left
      else if (left + widths[cell.column] > x + width) x = left + widths[cell.column] - width
    }
    horizontalRef.current?.scrollTo({ x: Math.max(0, x), animated: false })
    verticalRef.current?.scrollTo({ y: Math.max(0, y), animated: false })
  }
  const commitEditing = (options?: { move?: "down" | "up" | "left" | "right" | "none" }) => {
    const current = editingRef.current
    if (!current) return
    setEditing(null)
    applyChanges([
      { row: current.row, column: current.column, previous: getRaw(current), value: parseInput(current.draft) },
    ])
    const move = options?.move
    const cell = validCell({
      row: current.row + (move === "down" ? 1 : move === "up" ? -1 : 0),
      column: current.column + (move === "right" ? 1 : move === "left" ? -1 : 0),
    })
    setSelection({ anchor: cell, focus: cell })
    scrollToCell(cell)
  }
  const select = (next: SpreadsheetSelection | null) => {
    commitEditing()
    setSelection(
      next && rowCount && columnCount ? { anchor: validCell(next.anchor), focus: validCell(next.focus) } : null
    )
    setFilling(false)
  }
  const focusCell = (address: SpreadsheetCellAddress, options?: { extend?: boolean; scroll?: boolean }) => {
    if (!rowCount || !columnCount) return
    const cell = validCell(address)
    if (filling && bounds) {
      const target = fillTarget(bounds, cell)
      applyChanges(fillChanges(bounds, target, getRaw))
      setSelection({ anchor: { row: target.r0, column: target.c0 }, focus: { row: target.r1, column: target.c1 } })
      setFilling(false)
    } else select({ anchor: (options?.extend ?? extend) && selection ? selection.anchor : cell, focus: cell })
    if (options?.scroll !== false) scrollToCell(cell)
  }
  const startEditing = (cell: SpreadsheetCellAddress, seed?: string, via: Editing["via"] = "cell") => {
    if (readOnly || !onCellsChange || !rowCount || !columnCount) return
    if (editingRef.current && !sameCell(cell, editingRef.current)) commitEditing()
    const address = validCell(cell)
    setSelection({ anchor: address, focus: address })
    setEditing({ ...address, draft: seed ?? rawText(getRaw(address)), via })
    setFilling(false)
    setExtend(false)
  }
  const clearRange = () => {
    if (!bounds) return
    const changes: SpreadsheetChange[] = []
    for (let row = bounds.r0; row <= bounds.r1; row++)
      for (let column = bounds.c0; column <= bounds.c1; column++)
        changes.push({ row, column, value: null, previous: getRaw({ row, column }) })
    applyChanges(changes)
  }
  const copyRange = () => {
    if (!bounds) return ""
    return Array.from({ length: bounds.r1 - bounds.r0 + 1 }, (_, r) =>
      Array.from({ length: bounds.c1 - bounds.c0 + 1 }, (_, c) =>
        evaluator.display({ row: bounds.r0 + r, column: bounds.c0 + c })
      ).join("\t")
    ).join("\n")
  }
  const pasteText = (text: string) => {
    if (!bounds || readOnly) return
    const rows = text
      .replace(/\r/g, "")
      .replace(/\n$/, "")
      .split("\n")
      .map((line) => line.split("\t"))
    const single = rows.length === 1 && rows[0].length === 1
    const changes: SpreadsheetChange[] = []
    let r1 = bounds.r0,
      c1 = bounds.c0
    for (let r = 0; r < (single ? bounds.r1 - bounds.r0 + 1 : rows.length); r++)
      for (let c = 0; c < (single ? bounds.c1 - bounds.c0 + 1 : rows[r].length); c++) {
        const row = bounds.r0 + r,
          column = bounds.c0 + c
        if (row >= rowCount || column >= columnCount) continue
        changes.push({
          row,
          column,
          value: parseInput(single ? rows[0][0] : rows[r][c]),
          previous: getRaw({ row, column }),
        })
        r1 = Math.max(r1, row)
        c1 = Math.max(c1, column)
      }
    applyChanges(changes)
    setSelection({ anchor: { row: bounds.r0, column: bounds.c0 }, focus: { row: r1, column: c1 } })
  }
  const start = clamp(
    rowAtOffset(rowOffsets, scroll.y + frozenHeight) - frozenRows - overscan,
    0,
    Math.max(0, rowCount - frozenRows)
  )
  const end = clamp(
    rowAtOffset(rowOffsets, scroll.y + frozenHeight + viewport.height) - frozenRows + 1 + overscan,
    start,
    Math.max(0, rowCount - frozenRows)
  )
  const visibleColumns = widths.flatMap((width, column) =>
    column < frozenColumns ||
    (offsets[column] + width >= scroll.x && offsets[column] <= scroll.x + viewport.width + columnWidth)
      ? [column]
      : []
  )
  return {
    data,
    rowCount,
    columnCount,
    rowHeight,
    rowHeaderWidth,
    heights,
    rowOffsets,
    frozenHeight,
    minRowHeight,
    setHeight: (row: number, height: number) => {
      if (Number.isFinite(height))
        setRowSizing((prev) => ({ ...prev, [row]: Math.max(minRowHeight, Math.round(height)) }))
    },
    resetHeight: (row: number) =>
      setRowSizing((prev) => {
        const next = { ...prev }
        delete next[row]
        return next
      }),
    frozenRows,
    frozenColumns,
    widths,
    offsets,
    totalWidth,
    minColumnWidth,
    readOnly: readOnly || !onCellsChange,
    selection,
    bounds,
    editing,
    extend,
    setExtend,
    filling,
    setFilling,
    message,
    announce,
    scroll,
    scrollX,
    scrollY,
    resizePreview,
    finishResize,
    setScroll,
    viewport,
    setViewport,
    horizontalRef,
    verticalRef,
    formulaRef,
    visibleRows: { start, end },
    visibleColumns,
    getRaw,
    getText: (cell: SpreadsheetCellAddress) => rawText(getRaw(cell)),
    getResult: evaluator.evaluate,
    getDisplay: evaluator.display,
    setWidth: (column: number, width: number) => {
      if (Number.isFinite(width)) setSizing({ ...sizing, [column]: Math.max(minColumnWidth, Math.round(width)) })
    },
    resetWidth: (column: number) => {
      const next = { ...sizing }
      delete next[column]
      setSizing(next)
    },
    select,
    focusCell,
    scrollToCell,
    startEditing,
    commitEditing,
    cancelEditing: () => setEditing(null),
    setDraft: (draft: string) => {
      if (editingRef.current && !readOnly) setEditing({ ...editingRef.current, draft })
    },
    selectRow: (row: number) => select({ anchor: { row, column: 0 }, focus: { row, column: columnCount - 1 } }),
    selectColumn: (column: number) => select({ anchor: { row: 0, column }, focus: { row: rowCount - 1, column } }),
    selectAll: () => select({ anchor: { row: 0, column: 0 }, focus: { row: rowCount - 1, column: columnCount - 1 } }),
    applyChanges,
    clearRange,
    copyRange,
    pasteText,
    undo,
    redo,
    canUndo: history.current.cursor > 0 && !readOnly,
    canRedo: history.current.cursor < history.current.batches.length && !readOnly,
  }
}
type SheetApi = ReturnType<typeof useSheet>
const [Provider, useSpreadsheet] = createRequiredContext<SheetApi>("Spreadsheet")
export { useSpreadsheet }
const RowContext = createContext<number | null>(null)
const ColumnContext = createContext<number | null>(null)
const PaneContext = createContext<"frozen" | "scrolling" | null>(null)
function Root(props: SpreadsheetRootProps) {
  const api = useSheet(props)
  const {
    children,
    style,
    data: _data,
    rowCount: _rowCount,
    columnCount: _columnCount,
    onCellsChange: _onCellsChange,
    rowHeight: _rowHeight,
    minRowHeight: _minRowHeight,
    rowHeights: _rowHeights,
    defaultRowHeights: _defaultRowHeights,
    onRowHeightsChange: _onRowHeightsChange,
    rowHeaderWidth: _rowHeaderWidth,
    columnWidth: _columnWidth,
    minColumnWidth: _minColumnWidth,
    columnWidths: _columnWidths,
    defaultColumnWidths: _defaultColumnWidths,
    onColumnWidthsChange: _onColumnWidthsChange,
    selection: _selection,
    defaultSelection: _defaultSelection,
    onSelectionChange: _onSelectionChange,
    frozenRows: _frozenRows,
    frozenColumns: _frozenColumns,
    overscan: _overscan,
    readOnly: _readOnly,
    functions: _functions,
    historyLimit: _historyLimit,
    ...viewProps
  } = props
  return (
    <Provider value={api}>
      <GestureHandlerRootView {...viewProps} style={[{ gap: 8, minHeight: 0, width: "100%" }, style]}>
        {children ?? <Container />}
      </GestureHandlerRootView>
    </Provider>
  )
}
export type SpreadsheetContextProps = { children: (api: SheetApi) => ReactNode }
function Context({ children }: SpreadsheetContextProps) {
  return children(useSpreadsheet())
}
export type SpreadsheetFormulaBarProps = ViewProps
function FormulaBar({ style, ...props }: SpreadsheetFormulaBarProps) {
  return <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }, style]} />
}
export type SpreadsheetNameBoxProps = InputProps
function NameBox({ style, ...props }: SpreadsheetNameBoxProps) {
  const { selection, bounds } = useSpreadsheet()
  const value =
    !selection || !bounds
      ? ""
      : sameCell(selection.anchor, selection.focus)
        ? cellName(selection.focus)
        : `${cellName({ row: bounds.r0, column: bounds.c0 })}:${cellName({ row: bounds.r1, column: bounds.c1 })}`
  return <Input.Root accessibilityLabel="Cell name" {...props} value={value} readOnly style={[{ width: 96 }, style]} />
}
export type SpreadsheetFormulaInputProps = InputProps
function FormulaInput({
  style,
  onChangeText,
  onSubmitEditing,
  onKeyPress,
  ref,
  ...props
}: SpreadsheetFormulaInputProps) {
  const sheet = useSpreadsheet()
  const focus = sheet.selection?.focus
  return (
    <Input.Root
      accessibilityLabel="Formula"
      placeholder={focus ? undefined : "Select a cell"}
      {...props}
      ref={(node) => {
        sheet.formulaRef.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      value={sheet.editing?.draft ?? (focus ? sheet.getText(focus) : "")}
      disabled={!focus}
      readOnly={sheet.readOnly}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="done"
      style={[{ flex: 1, minWidth: 100 }, style]}
      onChangeText={(text) => {
        onChangeText?.(text)
        if (!focus) return
        if (sheet.editing) sheet.setDraft(text)
        else sheet.startEditing(focus, text, "bar")
      }}
      onSubmitEditing={(event) => {
        // React Native Web prevents the browser form submission before this callback.
        const alreadyPrevented = event.defaultPrevented
        onSubmitEditing?.(event)
        if (alreadyPrevented || !event.defaultPrevented) sheet.commitEditing({ move: "down" })
      }}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (event.nativeEvent.key === "Escape") sheet.cancelEditing()
      }}
    />
  )
}
export type SpreadsheetContainerProps = ViewProps
function Container({ children, style, onLayout, ...props }: SpreadsheetContainerProps) {
  const sheet = useSpreadsheet()
  const { colors, radius } = useNativeTheme()
  const { scrollX, scrollY, setScroll } = sheet
  const horizontalScroll = useAnimatedScrollHandler(
    (event) => {
      scrollX.set(event.contentOffset.x)
    },
    [scrollX]
  )
  const verticalScroll = useAnimatedScrollHandler(
    (event) => {
      scrollY.set(event.contentOffset.y)
    },
    [scrollY]
  )
  // React only receives coarse virtualization boundaries. Frozen cells never move horizontally.
  useAnimatedReaction(
    () => ({ x: Math.floor(scrollX.get() / 64), y: Math.floor(scrollY.get() / 64) }),
    (current, previous) => {
      if (!previous || current.x !== previous.x || current.y !== previous.y) {
        scheduleOnRN(setScroll, { x: current.x * 64, y: current.y * 64 })
      }
    },
    [setScroll, scrollX, scrollY]
  )
  const contentLayout = useResizeLayout("content")
  const bodyViewportLayout = useResizeLayout("viewport-body")
  const frozenLayout = useResizeLayout("frozen")
  const headerTranslation = useAnimatedStyle(() => ({ transform: [{ translateX: -scrollX.get() }] }), [scrollX])
  const [header, ...body] = Children.toArray(
    children ?? [
      <Header key="header">
        <HeaderRow />
      </Header>,
      <Body key="body" />,
      <Empty key="empty">No cells</Empty>,
    ]
  )
  return (
    <View
      {...props}
      onLayout={(event) => {
        sheet.setViewport({ width: event.nativeEvent.layout.width - 2, height: event.nativeEvent.layout.height - 2 })
        onLayout?.(event)
      }}
      {...(Platform.OS === "web" && {
        tabIndex: 0,
        role: "grid" as const,
        "aria-rowcount": sheet.rowCount,
        "aria-colcount": sheet.columnCount,
        onKeyDown: (event: {
          nativeEvent: { key: string; shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }
          target?: unknown
          preventDefault: () => void
        }) => {
          if ((event.target as { tagName?: string })?.tagName === "INPUT") return
          const { key, shiftKey, metaKey, ctrlKey } = event.nativeEvent
          const cell = sheet.selection?.focus
          if ((metaKey || ctrlKey) && key.toLowerCase() === "z") {
            event.preventDefault()
            if (shiftKey) sheet.redo()
            else sheet.undo()
            return
          }
          if ((metaKey || ctrlKey) && key.toLowerCase() === "a") {
            event.preventDefault()
            sheet.selectAll()
            return
          }
          if (!cell) return
          if (key === "Escape") {
            sheet.cancelEditing()
            sheet.setFilling(false)
            return
          }
          if (key === "Delete" || key === "Backspace") {
            event.preventDefault()
            sheet.clearRange()
            return
          }
          if (key === "Enter" || key === "F2") {
            event.preventDefault()
            sheet.startEditing(cell)
            return
          }
          let next = { ...cell }
          if (key === "ArrowDown") next.row++
          else if (key === "ArrowUp") next.row--
          else if (key === "ArrowRight" || (key === "Tab" && !shiftKey)) next.column++
          else if (key === "ArrowLeft" || key === "Tab") next.column--
          else if (key === "Home") {
            next.column = 0
            sheet.horizontalRef.current?.scrollTo({ x: 0, animated: false })
            if (metaKey || ctrlKey) {
              next.row = 0
              sheet.verticalRef.current?.scrollTo({ y: 0, animated: false })
            }
          } else if (key === "End") {
            next.column = sheet.columnCount - 1
            if (metaKey || ctrlKey) next.row = sheet.rowCount - 1
          } else if (key === "PageDown") next.row += Math.floor(sheet.viewport.height / sheet.rowHeight)
          else if (key === "PageUp") next.row -= Math.floor(sheet.viewport.height / sheet.rowHeight)
          else return
          event.preventDefault()
          sheet.focusCell(next, { extend: key !== "Tab" && shiftKey, scroll: key !== "Home" })
        },
      })}
      style={[
        {
          minHeight: 0,
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          backgroundColor: colors.background,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View style={{ overflow: "hidden", zIndex: 30 }}>
        <PaneContext.Provider value="scrolling">
          <Animated.View style={headerTranslation}>{header}</Animated.View>
        </PaneContext.Provider>
        <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, left: 0, overflow: "hidden" }, frozenLayout]}>
          <PaneContext.Provider value="frozen">{header}</PaneContext.Provider>
        </Animated.View>
      </View>
      <Animated.ScrollView
        ref={sheet.verticalRef}
        nestedScrollEnabled
        directionalLockEnabled
        bounces={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        onScroll={verticalScroll}
        style={{ flex: 1, minHeight: 0 }}
      >
        <Animated.View style={[{ width: sheet.viewport.width }, bodyViewportLayout]}>
          <Animated.ScrollView
            horizontal
            ref={sheet.horizontalRef}
            nestedScrollEnabled
            directionalLockEnabled
            bounces={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            scrollEventThrottle={16}
            onScroll={horizontalScroll}
            style={bodyViewportLayout}
          >
            <PaneContext.Provider value="scrolling">
              <Animated.View style={contentLayout}>{body}</Animated.View>
            </PaneContext.Provider>
          </Animated.ScrollView>
          <Animated.View
            pointerEvents="box-none"
            style={[{ position: "absolute", top: 0, bottom: 0, left: 0, overflow: "hidden" }, frozenLayout]}
          >
            <PaneContext.Provider value="frozen">{body}</PaneContext.Provider>
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>
      <Text accessibilityLiveRegion="polite" style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>
        {sheet.message}
      </Text>
    </View>
  )
}
// The native recognizer owns the touch. Geometry previews run on the UI thread;
// React and controlled sizing callbacks receive one committed change on release.
function useResizeGesture(axis: "x" | "y", index: number) {
  const sheet = useSpreadsheet()
  const { resizePreview } = sheet
  const size = axis === "x" ? sheet.widths[index] : sheet.heights[index]
  const minimum = axis === "x" ? sheet.minColumnWidth : sheet.minRowHeight
  const commit = (next: number) => {
    if (axis === "x") sheet.setWidth(index, next)
    else sheet.setHeight(index, next)
    sheet.finishResize((revision) => revision + 1)
  }
  return Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .cancelsTouchesInView(true)
    .onStart(() => {
      resizePreview.set({ axis, index, delta: 0 })
    })
    .onUpdate((event) => {
      const delta = axis === "x" ? event.translationX : event.translationY
      resizePreview.set({ axis, index, delta: Math.max(minimum - size, Math.round(delta)) })
    })
    .onEnd((event, success) => {
      if (success) {
        const delta = axis === "x" ? event.translationX : event.translationY
        scheduleOnRN(commit, Math.max(minimum, size + Math.round(delta)))
      }
    })
    .onFinalize((_event, success) => {
      if (!success) resizePreview.set({ axis: "none", index: -1, delta: 0 })
    })
}
function useResizeLayout(
  part: "content" | "viewport-body" | "body" | "frozen" | "header" | "row" | "position" | "column",
  index = 0
) {
  const sheet = useSpreadsheet()
  const { resizePreview, totalWidth, frozenColumns, frozenRows, rowHeight, frozenHeight } = sheet
  const frozenWidth = sheet.offsets[frozenColumns] ?? totalWidth
  const bodyHeight = sheet.rowOffsets[sheet.rowCount] - frozenHeight
  const viewportWidth = sheet.viewport.width
  const viewportHeight = sheet.viewport.height - rowHeight - frozenHeight
  const size = part === "row" ? sheet.heights[index] : sheet.widths[index]
  const offset = part === "position" ? sheet.rowOffsets[index] - frozenHeight : sheet.offsets[index]
  return useAnimatedStyle((): ViewStyle => {
    const preview = resizePreview.get()
    const dx = preview.axis === "x" ? preview.delta : 0
    const dy = preview.axis === "y" ? preview.delta : 0
    const bodyDelta = preview.index >= frozenRows ? dy : 0
    const viewportDelta = preview.index < frozenRows ? -dy : 0
    const height = Math.max(bodyHeight + bodyDelta, viewportHeight + viewportDelta, 0)
    if (part === "content") return { width: Math.max(viewportWidth, totalWidth + dx), height }
    if (part === "viewport-body") return { height }
    if (part === "body") return { width: totalWidth + dx, height: bodyHeight + bodyDelta }
    if (part === "frozen") return { width: frozenWidth + (preview.index < frozenColumns ? dx : 0) }
    if (part === "header") return { width: totalWidth + dx }
    if (part === "row") return { width: totalWidth + dx, height: size + (preview.index === index ? dy : 0) }
    if (part === "position") return { top: offset + (preview.index < index ? bodyDelta : 0) }
    return { left: offset + (preview.index < index ? dx : 0), width: size + (preview.index === index ? dx : 0) }
  }, [
    resizePreview,
    part,
    index,
    totalWidth,
    frozenWidth,
    frozenColumns,
    frozenRows,
    bodyHeight,
    viewportWidth,
    viewportHeight,
    size,
    offset,
  ])
}
export type SpreadsheetHeaderProps = ViewProps
function Header({ children, style, ...props }: SpreadsheetHeaderProps) {
  const sheet = useSpreadsheet(),
    { colors } = useNativeTheme()
  return (
    <View {...props} style={[{ backgroundColor: colors.background, zIndex: 30 }, style]}>
      {children ?? <HeaderRow />}
      {Array.from({ length: sheet.frozenRows }, (_, row) => (
        <Row key={row} row={row} />
      ))}
    </View>
  )
}
export type SpreadsheetHeaderRowProps = ViewProps
function HeaderRow({ children, style, ...props }: SpreadsheetHeaderRowProps) {
  const sheet = useSpreadsheet(),
    { colors } = useNativeTheme()
  const layout = useResizeLayout("header")
  return (
    <Animated.View
      {...props}
      style={[
        {
          width: sheet.totalWidth,
          height: sheet.rowHeight,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
        },
        layout,
        style,
      ]}
    >
      {children ?? (
        <>
          <Corner />
          {sheet.visibleColumns.map((column) => (
            <ColumnHeader key={column} column={column} />
          ))}
        </>
      )}
    </Animated.View>
  )
}
function TextValue({
  children,
  muted = false,
  medium = false,
  size = 14,
}: {
  children: ReactNode
  muted?: boolean
  medium?: boolean
  size?: number
}) {
  const { colors, typography } = useNativeTheme()
  return (
    <Text
      numberOfLines={1}
      style={{
        ...(medium ? typography.medium : typography.regular),
        fontSize: size,
        lineHeight: 20,
        color: muted ? colors.mutedForeground : colors.foreground,
      }}
    >
      {children}
    </Text>
  )
}
function PinnedPressable({
  pinned,
  overlay,
  column,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressProps & { pinned: boolean; overlay?: ReactNode; column?: number }) {
  const pane = useContext(PaneContext)
  const layout = useResizeLayout("column", column ?? 0)
  const [pressed, setPressed] = useState(false)
  if ((pane === "frozen" && !pinned) || (pane === "scrolling" && pinned)) return null
  // Each control belongs to exactly one pane; frozen hosts are outside the horizontal scroller.
  if (overlay)
    return (
      <Animated.View
        collapsable={false}
        style={[typeof style === "function" ? style({ pressed }) : style, column === undefined ? undefined : layout]}
      >
        <Pressable
          {...props}
          onPressIn={(event) => {
            setPressed(true)
            onPressIn?.(event)
          }}
          onPressOut={(event) => {
            setPressed(false)
            onPressOut?.(event)
          }}
          style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}
        />
        {overlay}
      </Animated.View>
    )
  return (
    <AnimatedPressable
      collapsable={false}
      {...props}
      onPressIn={(event) => {
        setPressed(true)
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        onPressOut?.(event)
      }}
      style={[typeof style === "function" ? style({ pressed }) : style, column === undefined ? undefined : layout]}
    />
  )
}
export type SpreadsheetCornerProps = PressProps
function Corner({ style, onPress, ...props }: SpreadsheetCornerProps) {
  const sheet = useSpreadsheet(),
    { colors } = useNativeTheme()
  return (
    <PinnedPressable
      pinned={true}
      accessibilityRole="button"
      accessibilityLabel="Select all cells"
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) sheet.selectAll()
      }}
      style={(state) => [
        {
          position: "absolute",
          left: 0,
          width: sheet.rowHeaderWidth,
          height: "100%",
          zIndex: 30,
          borderRightWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  )
}
export type SpreadsheetColumnHeaderProps = PressProps & { column: number }
function ColumnHeader({ column, style, children, onPress, ...props }: SpreadsheetColumnHeaderProps) {
  const sheet = useSpreadsheet(),
    { colors } = useNativeTheme()
  const selected = !!sheet.bounds && column >= sheet.bounds.c0 && column <= sheet.bounds.c1
  return (
    <ColumnContext.Provider value={column}>
      <PinnedPressable
        column={column}
        overlay={<ResizeHandle />}
        pinned={column < sheet.frozenColumns}
        accessibilityRole="button"
        accessibilityLabel={`Select column ${columnLabel(column)}`}
        {...props}
        onPress={(event) => {
          onPress?.(event)
          if (!event.defaultPrevented) sheet.selectColumn(column)
        }}
        style={(state) => [
          {
            position: "absolute",
            left: sheet.offsets[column],
            width: sheet.widths[column],
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            zIndex: column < sheet.frozenColumns ? 20 : 1,
            borderRightWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.muted,
          },
          typeof style === "function" ? style(state) : style,
        ]}
      >
        {selected && (
          <View
            pointerEvents="none"
            style={{ position: "absolute", inset: 0, backgroundColor: withOpacity(colors.primary, 0.1) }}
          />
        )}
        {children ?? (
          <TextValue medium muted={!selected}>
            {columnLabel(column)}
          </TextValue>
        )}
      </PinnedPressable>
    </ColumnContext.Provider>
  )
}
export type SpreadsheetResizeHandleProps = ViewProps & { withHandle?: boolean }
function ResizeHandle({ withHandle = true, style, ...props }: SpreadsheetResizeHandleProps) {
  const sheet = useSpreadsheet(),
    column = useContext(ColumnContext),
    { colors } = useNativeTheme()
  const gesture = useResizeGesture("x", column ?? 0)
  if (column === null) throw new Error("Spreadsheet.ResizeHandle requires ColumnHeader")
  return (
    <GestureDetector gesture={gesture} touchAction="none">
      <View
        collapsable={false}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Width of column ${columnLabel(column)}`}
        accessibilityValue={{
          min: sheet.minColumnWidth,
          now: sheet.widths[column],
          text: `${sheet.widths[column]} pixels`,
        }}
        accessibilityActions={[
          { name: "increment" },
          { name: "decrement" },
          { name: "activate", label: "Reset width" },
        ]}
        {...props}
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName
          if (action === "activate") sheet.resetWidth(column)
          else if (action === "increment" || action === "decrement")
            sheet.setWidth(column, sheet.widths[column] + (action === "increment" ? 10 : -10))
        }}
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 9,
            zIndex: 40,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        {withHandle && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -0.5,
              top: "50%",
              transform: [{ translateY: -8 }],
              width: 2,
              height: 16,
              borderRadius: 8,
              backgroundColor: colors.border,
            }}
          />
        )}
      </View>
    </GestureDetector>
  )
}
export type SpreadsheetBodyProps = Omit<ViewProps, "children"> & { children?: (row: number) => ReactNode }
function Body({ children, style, ...props }: SpreadsheetBodyProps) {
  const sheet = useSpreadsheet()
  const layout = useResizeLayout("body")
  if (!sheet.columnCount) return null
  const rows = Array.from(
    { length: sheet.visibleRows.end - sheet.visibleRows.start },
    (_, i) => sheet.frozenRows + sheet.visibleRows.start + i
  )
  const editing = sheet.editing
  if (editing && editing.row >= sheet.frozenRows && editing.row < sheet.rowCount && !rows.includes(editing.row))
    rows.push(editing.row)
  return (
    <Animated.View {...props} style={[layout, style]}>
      {rows.map((row) => (
        <BodyRow key={row} row={row}>
          {children ? children(row) : <Row row={row} />}
        </BodyRow>
      ))}
    </Animated.View>
  )
}
function BodyRow({ row, children }: { row: number; children: ReactNode }) {
  const layout = useResizeLayout("position", row)
  return <Animated.View style={[{ position: "absolute", left: 0, right: 0 }, layout]}>{children}</Animated.View>
}
export type SpreadsheetRowProps = ViewProps & { row: number }
function Row({ row, children, style, ...props }: SpreadsheetRowProps) {
  const sheet = useSpreadsheet(),
    { colors } = useNativeTheme()
  const layout = useResizeLayout("row", row)
  const columns = [...sheet.visibleColumns]
  if (sheet.editing?.row === row && !columns.includes(sheet.editing.column)) columns.push(sheet.editing.column)
  return (
    <RowContext.Provider value={row}>
      <Animated.View
        {...props}
        style={[
          {
            width: sheet.totalWidth,
            height: sheet.heights[row],
            borderBottomWidth: row === sheet.frozenRows - 1 ? 2 : row === sheet.rowCount - 1 ? 0 : 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
          },
          layout,
          style,
        ]}
      >
        {children ?? (
          <>
            <RowHeader />
            {columns.map((column) => (
              <Cell key={column} column={column} />
            ))}
          </>
        )}
      </Animated.View>
    </RowContext.Provider>
  )
}
export type SpreadsheetRowHeaderProps = PressProps
function RowHeader({ children, style, onPress, ...props }: SpreadsheetRowHeaderProps) {
  const sheet = useSpreadsheet(),
    row = useContext(RowContext),
    { colors } = useNativeTheme()
  if (row === null) throw new Error("Spreadsheet.RowHeader requires Row")
  const selected = !!sheet.bounds && row >= sheet.bounds.r0 && row <= sheet.bounds.r1
  return (
    <PinnedPressable
      overlay={<RowResizeHandle />}
      pinned={true}
      accessibilityRole="button"
      accessibilityLabel={`Select row ${row + 1}`}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) sheet.selectRow(row)
      }}
      style={(state) => [
        {
          position: "absolute",
          left: 0,
          width: sheet.rowHeaderWidth,
          height: "100%",
          zIndex: 30,
          borderRightWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
          justifyContent: "center",
          alignItems: "center",
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {selected && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", inset: 0, backgroundColor: withOpacity(colors.primary, 0.1) }}
        />
      )}
      <TextValue muted={!selected} size={12}>
        {children ?? row + 1}
      </TextValue>
    </PinnedPressable>
  )
}
export type SpreadsheetRowResizeHandleProps = ViewProps & { withHandle?: boolean }
function RowResizeHandle({ style, withHandle = true, ...props }: SpreadsheetRowResizeHandleProps) {
  const sheet = useSpreadsheet(),
    row = useContext(RowContext),
    { colors } = useNativeTheme()
  const gesture = useResizeGesture("y", row ?? 0)
  if (row === null) throw new Error("Spreadsheet.RowResizeHandle requires Row")
  return (
    <GestureDetector gesture={gesture} touchAction="none">
      <View
        collapsable={false}
        {...props}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Resize row ${row + 1}`}
        accessibilityValue={{ min: sheet.minRowHeight, now: sheet.heights[row], text: `${sheet.heights[row]}px` }}
        accessibilityActions={[
          { name: "increment" },
          { name: "decrement" },
          { name: "activate", label: "Reset row height" },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "activate") sheet.resetHeight(row)
          else sheet.setHeight(row, sheet.heights[row] + (event.nativeEvent.actionName === "increment" ? 8 : -8))
        }}
        {...(Platform.OS === "web" && {
          tabIndex: 0,
          onKeyDown: (event: {
            nativeEvent: { key: string; shiftKey?: boolean }
            preventDefault: () => void
            stopPropagation: () => void
          }) => {
            const { key, shiftKey } = event.nativeEvent
            if (!["ArrowUp", "ArrowDown", "Home"].includes(key)) return
            event.preventDefault()
            event.stopPropagation()
            if (key === "Home") sheet.resetHeight(row)
            else sheet.setHeight(row, sheet.heights[row] + (key === "ArrowDown" ? 1 : -1) * (shiftKey ? 10 : 1))
          },
        })}
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 9,
            zIndex: 40,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        {withHandle && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -0.5,
              left: "50%",
              transform: [{ translateX: -8 }],
              width: 16,
              height: 2,
              borderRadius: 8,
              backgroundColor: colors.border,
            }}
          />
        )}
      </View>
    </GestureDetector>
  )
}
export type SpreadsheetCellProps = PressProps & { row?: number; column: number }
function Cell({ row: rowProp, column, style, children, onPress, onLongPress, ...props }: SpreadsheetCellProps) {
  const sheet = useSpreadsheet(),
    rowContext = useContext(RowContext),
    { colors, typography } = useNativeTheme()
  const row = rowProp ?? rowContext
  const lastTap = useRef(0)
  if (row === null) throw new Error("Spreadsheet.Cell requires a row")
  const cell = { row, column },
    b = sheet.bounds
  const focused = sameCell(sheet.selection?.focus, cell)
  const selected = !!b && row >= b.r0 && row <= b.r1 && column >= b.c0 && column <= b.c1
  const multi = !!b && (b.r0 !== b.r1 || b.c0 !== b.c1)
  const isEditing = sheet.editing?.via === "cell" && sameCell(sheet.editing, cell)
  const result = sheet.getResult(cell)
  const frozen = column < sheet.frozenColumns
  return (
    <PinnedPressable
      pinned={frozen}
      column={column}
      accessibilityRole={Platform.OS === "web" ? "none" : "button"}
      {...(Platform.OS === "web" && { role: "cell" as const })}
      accessibilityLabel={`${cellName(cell)}: ${sheet.getDisplay(cell) || "empty"}`}
      accessibilityHint={
        sheet.readOnly ? "Read only" : "Tap to select. Double tap to edit. Long press to extend selection."
      }
      accessibilityState={{ selected }}
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (event.defaultPrevented || isEditing) return
        const now = Date.now()
        if (focused && !sheet.filling && now - lastTap.current < 350) sheet.startEditing(cell)
        else sheet.focusCell(cell, { scroll: false })
        lastTap.current = now
      }}
      onLongPress={(event) => {
        onLongPress?.(event)
        if (!event.defaultPrevented) sheet.focusCell(cell, { extend: true, scroll: false })
      }}
      style={(state) => [
        {
          position: "absolute",
          left: sheet.offsets[column],
          width: sheet.widths[column],
          height: "100%",
          borderRightWidth: frozen && column === sheet.frozenColumns - 1 ? 2 : 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          justifyContent: "center",
          paddingHorizontal: isEditing ? 0 : 8,
          zIndex: frozen ? 20 : focused ? 10 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {selected && multi && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", inset: 0, backgroundColor: withOpacity(colors.primary, 0.1) }}
        />
      )}
      {isEditing ? (
        <Input.Root
          autoFocus
          selectTextOnFocus
          accessibilityLabel={`Edit ${cellName(cell)}`}
          autoCorrect={false}
          autoCapitalize="none"
          value={sheet.editing!.draft}
          onChangeText={sheet.setDraft}
          onSubmitEditing={() => sheet.commitEditing({ move: "down" })}
          onKeyPress={(event) => {
            if (event.nativeEvent.key === "Escape") sheet.cancelEditing()
          }}
          style={{ borderRadius: 0, width: "100%", height: "100%", minHeight: 0 }}
        />
      ) : (
        (children ?? (
          <Text
            numberOfLines={1}
            style={{
              ...typography.regular,
              fontSize: 14,
              lineHeight: 20,
              color: result.error ? colors.destructive : colors.foreground,
              textAlign: typeof result.value === "number" ? "right" : "left",
              fontVariant: ["tabular-nums"],
            }}
          >
            {sheet.getDisplay(cell)}
          </Text>
        ))
      )}
      {focused && !isEditing && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", inset: 0, borderWidth: 2, borderColor: colors.primary }}
        />
      )}
      {b && row === b.r1 && column === b.c1 && !sheet.readOnly && !sheet.editing && <FillHandle />}
    </PinnedPressable>
  )
}
export type SpreadsheetFillHandleProps = PressProps
function FillHandle({ style, onPress, ...props }: SpreadsheetFillHandleProps) {
  const sheet = useSpreadsheet(),
    { colors } = useNativeTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sheet.filling ? "Cancel fill" : "Fill selection"}
      accessibilityHint="Then tap a destination cell to extend the selected values or formulas"
      hitSlop={8}
      {...props}
      onPress={(event) => {
        event.stopPropagation()
        onPress?.(event)
        if (!event.defaultPrevented) {
          sheet.setFilling(!sheet.filling)
          sheet.announce(sheet.filling ? "Fill cancelled" : "Tap a destination cell to fill")
        }
      }}
      style={(state) => [
        {
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 8,
          height: 8,
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: colors.background,
          zIndex: 40,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  )
}
export type SpreadsheetEmptyProps = ComponentPropsWithRef<typeof Text>
function Empty({ style, ...props }: SpreadsheetEmptyProps) {
  const pane = useContext(PaneContext)
  const sheet = useSpreadsheet(),
    { colors, typography } = useNativeTheme()
  return pane === "frozen" || (sheet.rowCount && sheet.columnCount) ? null : (
    <Text
      {...props}
      style={[{ ...typography.regular, fontSize: 14, color: colors.mutedForeground, padding: 24 }, style]}
    />
  )
}
export type SpreadsheetUndoTriggerProps = ButtonProps
function UndoTrigger({ children, ...props }: SpreadsheetUndoTriggerProps) {
  const sheet = useSpreadsheet()
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      disabled={props.disabled || !sheet.canUndo}
      onPress={(e) => {
        props.onPress?.(e)
        if (!e.defaultPrevented) sheet.undo()
      }}
    >
      {children ?? "Undo"}
    </Button>
  )
}
export type SpreadsheetRedoTriggerProps = ButtonProps
function RedoTrigger({ children, ...props }: SpreadsheetRedoTriggerProps) {
  const sheet = useSpreadsheet()
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      disabled={props.disabled || !sheet.canRedo}
      onPress={(e) => {
        props.onPress?.(e)
        if (!e.defaultPrevented) sheet.redo()
      }}
    >
      {children ?? "Redo"}
    </Button>
  )
}
export type SpreadsheetToolbarProps = ViewProps
/** Touch equivalents for keyboard operations; clipboard failures never clear or change cells. */
function Toolbar({ style, ...props }: SpreadsheetToolbarProps) {
  const sheet = useSpreadsheet(),
    { colors, typography } = useNativeTheme()
  const [busy, setBusy] = useState(false)
  const latest = useRef(sheet)
  latest.current = sheet
  const clipboard = async (action: "copy" | "cut" | "paste") => {
    if (busy) return
    const selection = JSON.stringify(sheet.selection)
    setBusy(true)
    try {
      if (action === "paste") {
        const text = await Clipboard.getStringAsync()
        if (JSON.stringify(latest.current.selection) === selection) latest.current.pasteText(text)
      } else {
        const ok = await Clipboard.setStringAsync(sheet.copyRange())
        if (!ok) throw new Error("Clipboard unavailable")
        if (action === "cut" && JSON.stringify(latest.current.selection) === selection) latest.current.clearRange()
      }
      latest.current.announce(action === "paste" ? "Pasted cells" : "Copied cells")
    } catch {
      latest.current.announce("Clipboard unavailable. Try again.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <View {...props} style={[{ gap: 8 }, style]}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          disabled={!sheet.selection || sheet.readOnly}
          onPress={() => {
            if (sheet.selection) sheet.startEditing(sheet.selection.focus)
          }}
        >
          Edit
        </Button>
        <Button
          variant={sheet.extend ? "secondary" : "outline"}
          size="sm"
          disabled={!sheet.selection}
          onPress={() => sheet.setExtend(!sheet.extend)}
        >
          Select range
        </Button>
        <Button
          variant={sheet.filling ? "secondary" : "outline"}
          size="sm"
          disabled={!sheet.selection || sheet.readOnly}
          onPress={() => sheet.setFilling(!sheet.filling)}
        >
          Fill
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !sheet.selection}
          onPress={() => {
            void clipboard("copy")
          }}
        >
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !sheet.selection || sheet.readOnly}
          onPress={() => {
            void clipboard("cut")
          }}
        >
          Cut
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || !sheet.selection || sheet.readOnly}
          onPress={() => {
            void clipboard("paste")
          }}
        >
          Paste
        </Button>
        <Button variant="outline" size="sm" disabled={!sheet.selection || sheet.readOnly} onPress={sheet.clearRange}>
          Clear
        </Button>
        {sheet.editing && (
          <>
            <Button size="sm" onPress={() => sheet.commitEditing()}>
              Apply
            </Button>
            <Button variant="outline" size="sm" onPress={sheet.cancelEditing}>
              Cancel
            </Button>
          </>
        )}
      </View>
      {(sheet.filling || sheet.extend) && (
        <Text style={{ ...typography.regular, fontSize: 12, lineHeight: 16, color: colors.mutedForeground }}>
          {sheet.filling
            ? "Tap a destination cell to fill. Tap Fill again to cancel."
            : "Tap another cell to extend the range. Tap Select range to finish."}
        </Text>
      )}
    </View>
  )
}
export const Spreadsheet = {
  Root,
  Context,
  FormulaBar,
  NameBox,
  FormulaInput,
  Container,
  Header,
  HeaderRow,
  Corner,
  ColumnHeader,
  ResizeHandle,
  RowResizeHandle,
  Body,
  Row,
  RowHeader,
  Cell,
  FillHandle,
  Empty,
  UndoTrigger,
  RedoTrigger,
  Toolbar,
}

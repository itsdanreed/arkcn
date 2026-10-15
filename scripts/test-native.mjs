import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import React from "react"
import { act, create } from "react-test-renderer"

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@expo/ui/community/masked-view")
      return { url: new URL("./fixtures/native-mask.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native-gesture-handler")
      return { url: new URL("./fixtures/native-gesture.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "expo-clipboard")
      return { url: new URL("./fixtures/native-clipboard.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "expo-blur")
      return { url: new URL("./fixtures/native-blur.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native-worklets")
      return { url: new URL("./fixtures/native-worklets.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native-reanimated")
      return { url: new URL("./fixtures/native-motion.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native-svg")
      return { url: new URL("./fixtures/native-svg.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native")
      return { url: new URL("./fixtures/native-host.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier.startsWith(".") && context.parentURL) {
      const base = fileURLToPath(new URL(specifier, context.parentURL))
      const file = [`${base}.ts`, `${base}.tsx`].find(existsSync)
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url) && !url.includes("node_modules")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 },
      }).outputText
      return { format: "module", source, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
globalThis.IS_REACT_ACT_ENVIRONMENT = true
// Exercise Hermes' missing relative-time API, rather than relying on Node's Intl.
Object.defineProperty(Intl, "RelativeTimeFormat", { value: undefined, writable: true, configurable: true })
delete Intl.RelativeTimeFormat
const {
  Spreadsheet,
  Slider,
  ScrollArea,
  PasswordInput,
  usePasswordInput,
  Button,
  Clipboard,
  ActivityFeed,
  Timer,
  Message,
  Bubble,
  Marker,
  Attachment,
  Table,
  Dialog,
  Sheet,
  AlertDialog,
  Input,
  Textarea,
  Card,
  Badge,
  Spinner,
  Skeleton,
  Separator,
  NativeThemeProvider,
  Checkbox,
  Switch,
  RadioGroup,
  Tabs,
  Collapsible,
  Progress,
  Alert,
  Avatar,
  Toggle,
  ToggleGroup,
  Accordion,
  InputGroup,
  ButtonGroup,
  Label,
  Field,
  Fieldset,
  NumberInput,
  RatingGroup,
  Editable,
  Pagination,
  usePagination,
  SegmentGroup,
  Breadcrumb,
  Empty,
  PinInput,
  Steps,
  Highlight,
  useHighlight,
  Format,
  AppShell,
  useAppShell,
  TagsInput,
  useTagsInput,
  useSegmentGroup,
} = await import("@multicomma/arkcn-react-native")
const { emitReducedMotion, emitColorScheme, emitAppState, Platform } = await import("./fixtures/native-host.mjs")
const { timingCalls } = await import("./fixtures/native-motion.mjs")
const { nativeColors } = await import("@multicomma/arkcn-react-native/lib/theme")
const { applyRowDrop, resizeRowItems } = await import("@multicomma/arkcn-core/row-layout")
const { useHistory } = await import("@multicomma/arkcn-react-shared/history")
const h = React.createElement
const flatten = (style) => Object.assign({}, ...[style].flat(Infinity).filter(Boolean))
let tree
const render = async (node) => {
  await act(() => {
    if (tree) tree.update(node)
    else tree = create(node)
  })
  return tree.root
}
try {
  // Spreadsheet uses the shared evaluator and emits reversible batches over virtualized data.
  {
    const { rowMetrics, rowAtOffset } = await import("@multicomma/arkcn-core/spreadsheet-layout")
    const geometry = rowMetrics(4, 32, 24, { 0: 48, 2: 80 })
    assert.deepEqual(geometry.offsets, [0, 48, 80, 160, 192])
    assert.equal(rowAtOffset(geometry.offsets, 79), 1)
    assert.equal(rowAtOffset(geometry.offsets, 80), 2)
    assert.equal(rowAtOffset(geometry.offsets, 192), 4)
    const { fillChanges, fillTarget, parseInput } = await import("@multicomma/arkcn-react-native/lib/spreadsheet")
    let data = [
      ["Item", "Qty", "Price", "Total"],
      ["Desk", 2, 320, "=B2*C2"],
      ["Chair", 4, 150, "=B3*C3"],
      [null, null, null, "=SUM(D2:D3)"],
      ["=A5", "=1/0"],
    ]
    let api
    const batches = []
    const change = (changes) => {
      batches.push(changes)
      data = data.map((r) => [...r])
      for (const c of changes) {
        data[c.row] ??= []
        data[c.row][c.column] = c.value
      }
    }
    const fixture = (extra = {}) =>
      h(
        Spreadsheet.Root,
        {
          data,
          rowCount: 10000,
          columnCount: 26,
          frozenRows: 1,
          frozenColumns: 1,
          onCellsChange: change,
          defaultSelection: { anchor: { row: 1, column: 3 }, focus: { row: 1, column: 3 } },
          ...extra,
        },
        h(Spreadsheet.Context, null, (value) => {
          api = value
          return null
        }),
        h(Spreadsheet.FormulaInput),
        h(Spreadsheet.Container)
      )
    await render(fixture())
    assert.equal(api.getDisplay({ row: 1, column: 3 }), "640")
    assert.equal(api.getDisplay({ row: 3, column: 3 }), "1240")
    assert.equal(api.getResult({ row: 4, column: 0 }).error, "#CYCLE!")
    assert.equal(api.getResult({ row: 4, column: 1 }).error, "#DIV/0!")
    assert.ok(
      tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityLabel?.startsWith("Select row ")).length <
        30,
      "10,000 rows are windowed"
    )
    const hostAncestors = (node) => {
      const result = []
      for (let p = node.parent; p; p = p.parent) if (p.type === "ScrollView") result.push(p)
      return result
    }
    const frozenCell = () =>
      tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityLabel === "A2: Desk")
    assert.equal(frozenCell().length, 1, "frozen cells are rendered/accessibility-exposed once")
    const frozenHost = frozenCell()[0]
    const frozenScrolls = hostAncestors(frozenHost)
    assert.equal(frozenScrolls.length, 1, "frozen column shares only the vertical scroll owner")
    assert.notEqual(frozenScrolls[0].props.horizontal, true)
    const rowGutter = tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityLabel === "Select row 2")
    assert.equal(rowGutter.length, 1)
    assert.deepEqual(hostAncestors(rowGutter[0]), frozenScrolls)
    // Simulate a distant horizontal window: the native frozen host must stay mounted.
    await act(() => api.setScroll({ x: 2000, y: 0 }))
    assert.equal(frozenCell()[0], frozenHost, "horizontal virtualization keeps the frozen host mounted")
    assert.deepEqual(hostAncestors(frozenCell()[0]), frozenScrolls)
    await act(() => api.setScroll({ x: 0, y: 0 }))
    await act(() => api.startEditing({ row: 1, column: 1 }))
    await act(() => api.setDraft("3"))
    await act(() => api.commitEditing())
    assert.deepEqual(batches.at(-1), [{ row: 1, column: 1, value: 3, previous: 2 }])
    await render(fixture())
    assert.equal(api.getDisplay({ row: 1, column: 3 }), "960")
    await act(() => api.undo())
    await render(fixture())
    assert.equal(data[1][1], 2)
    await act(() => api.redo())
    await render(fixture())
    assert.equal(data[1][1], 3)
    await act(() => api.startEditing({ row: 1, column: 1 }, "999"))
    await act(() => api.cancelEditing())
    assert.equal(data[1][1], 3)
    await act(() => api.select({ anchor: { row: 1, column: 1 }, focus: { row: 2, column: 2 } }))
    await act(() => api.pasteText("7"))
    await render(fixture())
    assert.deepEqual(data[1].slice(1, 3), [7, 7])
    assert.deepEqual(data[2].slice(1, 3), [7, 7])
    assert.equal(api.copyRange(), "7\t7\n7\t7")
    await act(() => api.pasteText("8\t9\n10\t11\n"))
    await render(fixture())
    assert.deepEqual(data[2].slice(1, 3), [10, 11])
    const source = { r0: 1, r1: 2, c0: 1, c1: 1 }
    const target = fillTarget(source, { row: 4, column: 1 })
    assert.deepEqual(
      fillChanges(source, target, api.getRaw).map((c) => c.value),
      [12, 14]
    )
    const formulaFill = fillChanges({ r0: 1, r1: 1, c0: 3, c1: 3 }, { r0: 1, r1: 2, c0: 3, c1: 3 }, api.getRaw)
    assert.equal(formulaFill[0].value, "=B3*C3")
    await act(() => api.select({ anchor: { row: 1, column: 1 }, focus: { row: 2, column: 1 } }))
    await act(() => api.setFilling(true))
    await act(() => api.focusCell({ row: 4, column: 1 }))
    await render(fixture())
    assert.equal(data[4][1], 14)
    assert.equal(api.filling, false)
    // Live resize previews on the UI thread without relaying movement into scroll
    // views or repeatedly updating React sizing state. Release commits once;
    // native cancellation drops the preview without changing dimensions/selection.
    await act(() => api.setViewport({ width: 500, height: 320 }))
    const { readAnimatedStyle } = await import("./fixtures/native-motion.mjs")
    const rowLayout = (label) => {
      let node = tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityLabel === label)[0]
      while (node) {
        const style = readAnimatedStyle(node.props.style)
        if (node.type === "View" && typeof style.height === "number" && typeof style.width === "number") return style
        node = node.parent
      }
      throw new Error("Missing row layout")
    }
    const resizeGesture = (label) =>
      tree.root
        .findAllByType("GestureDetector")
        .find((node) => node.findAllByType("View").some((view) => view.props.accessibilityLabel === label)).props
        .gesture
    for (const [label, axis, index, delta] of [
      ["Resize row 2", "y", 1, 28],
      ["Resize row 1", "y", 0, 16],
      ["Width of column A", "x", 0, 36],
    ]) {
      const gesture = resizeGesture(label)
      assert.equal(gesture.config.minDistance, 0)
      assert.equal(gesture.config.cancelsTouchesInView, true)
      assert.equal(gesture.config.shouldCancelWhenOutside, false)
      const before = axis === "y" ? api.heights[index] : api.widths[index]
      const selectionBefore = api.selection
      gesture.handlers.onStart()
      gesture.handlers.onUpdate({ translationX: delta, translationY: delta })
      assert.deepEqual(api.resizePreview.get(), { axis, index, delta })
      assert.equal(axis === "y" ? api.heights[index] : api.widths[index], before)
      if (axis === "y")
        assert.equal(
          rowLayout(index === 0 ? "A1: Item" : "A2: Desk").height,
          before + delta,
          "cells resize before commit"
        )
      else {
        const cell = tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityLabel === "A2: Desk")[0]
        assert.equal(readAnimatedStyle(cell.props.style).width, before + delta, "frozen cells resize before commit")
        const nextCell = tree.root.findAll(
          (n) => n.type === "Pressable" && n.props.accessibilityLabel?.startsWith("B2:")
        )[0]
        assert.equal(
          readAnimatedStyle(nextCell.props.style).left,
          api.offsets[1] + delta,
          "neighboring columns follow live sizing"
        )
      }

      await act(() => gesture.handlers.onEnd({ translationX: delta, translationY: delta }, true))
      gesture.handlers.onFinalize({}, true)
      assert.equal(axis === "y" ? api.heights[index] : api.widths[index], before + delta)
      assert.deepEqual(api.selection, selectionBefore)
      assert.equal(api.resizePreview.get().axis, "none")
      const cancelled = resizeGesture(label)
      cancelled.handlers.onStart()
      cancelled.handlers.onUpdate({ translationX: 90, translationY: 90 })
      await act(() => cancelled.handlers.onEnd({ translationX: 90, translationY: 90 }, false))
      cancelled.handlers.onFinalize({}, false)
      assert.equal(axis === "y" ? api.heights[index] : api.widths[index], before + delta)
      assert.equal(api.resizePreview.get().axis, "none")
      const clamped = resizeGesture(label)
      clamped.handlers.onStart()
      await act(() => clamped.handlers.onEnd({ translationX: -1000, translationY: -1000 }, true))
      clamped.handlers.onFinalize({}, true)
      assert.equal(
        axis === "y" ? api.heights[index] : api.widths[index],
        axis === "y" ? api.minRowHeight : api.minColumnWidth
      )
      await act(() => (axis === "y" ? api.resetHeight(index) : api.resetWidth(index)))
    }
    await act(() => api.setHeight(1, 64))
    assert.equal(api.heights[1], 64)
    assert.equal(api.rowOffsets[2], 96)
    await act(() => api.setHeight(2, 5))
    assert.equal(api.heights[2], 24)
    await act(() => api.resetHeight(1))
    assert.equal(api.heights[1], 32)
    await act(() => api.resetHeight(2))
    await act(() => api.setWidth(1, 20))
    assert.equal(api.widths[1], 40)
    await act(() => api.setScroll({ x: 1200, y: 319000 }))
    assert.ok(api.visibleRows.start > 9900)
    assert.ok(api.visibleColumns.includes(0), "frozen column stays rendered far from the horizontal origin")
    assert.ok(
      tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityLabel?.startsWith("Select row ")).length <
        35
    )
    let resizedRows
    await render(
      fixture({
        rowHeights: { 1: 48 },
        onRowHeightsChange: (value) => {
          resizedRows = value
        },
      })
    )
    await act(() => api.setHeight(1, 80))
    assert.equal(api.heights[1], 48, "controlled row height waits for the consumer")
    assert.deepEqual(resizedRows, { 1: 80 })
    await render(fixture({ rowHeights: resizedRows }))
    assert.equal(api.rowOffsets[2], 112)
    const count = batches.length
    await render(fixture({ readOnly: true }))
    await act(() => {
      api.pasteText("bad")
      api.clearRange()
      api.undo()
      api.startEditing({ row: 1, column: 1 })
    })
    assert.equal(batches.length, count)
    assert.equal(api.editing, null)
    await render(fixture({ data: [], rowCount: 0, columnCount: 0 }))
    assert.equal(api.selection, null)
    assert.equal(api.visibleRows.end, 0)
    await render(fixture({ defaultSelection: null }))
    await act(() => api.focusCell({ row: 1, column: 1 }))
    await act(() => api.startEditing({ row: 1, column: 1 }, "13", "bar"))
    // RN Web prevents the underlying Enter event before emitting submit.
    await act(() =>
      tree.root
        .findByType(Spreadsheet.FormulaInput)
        .findByType("TextInput")
        .props.onSubmitEditing({ defaultPrevented: true })
    )
    assert.equal(data[1][1], 13)
    assert.equal(parseInput("1e2"), 100)
    assert.equal(parseInput(""), null)
    await act(() => tree.unmount())
    tree = null
  }
  // Slider gestures preserve thumb order, snap decimals, and commit exactly once.
  {
    const { sliderCenter, sliderValueAt, snapSliderValue } = await import("@multicomma/arkcn-react-native/lib/slider")
    assert.equal(sliderCenter(0, 0, 100, 288), 6)
    assert.equal(sliderCenter(100, 0, 100, 288), 282)
    assert.equal(sliderValueAt(6, 288, 0, 100, 1, true), 100)
    assert.equal(sliderValueAt(282, 288, 0, 100, 1, true), 0)
    assert.equal(snapSliderValue(0.31, -1, 1, 0.1), 0.3)
    let api
    const changes = []
    const commits = []
    const fixture = (props = {}) =>
      h(
        Slider.Root,
        {
          defaultValue: [20, 80],
          minStepsBetweenThumbs: 10,
          onValueChange: ({ value }) => changes.push(value),
          onValueChangeEnd: ({ value }) => commits.push(value),
          ...props,
        },
        h(Slider.Label, null, "Price"),
        h(
          Slider.Control,
          { testID: "slider-control" },
          h(Slider.Track, null, h(Slider.Range)),
          h(Slider.Thumb, { index: 0 }),
          h(Slider.Thumb, { index: 1 })
        ),
        h(Slider.Context, null, (value) => {
          api = value
          return null
        })
      )
    await render(fixture())
    const control = () => tree.root.findAllByType("View").find((node) => node.props.testID === "slider-control")
    await act(() => control().props.onLayout({ nativeEvent: { layout: { width: 288, height: 12 } } }))
    await act(() => api.setThumbValue(0, 99, true))
    assert.deepEqual(api.value, [70, 80])
    assert.deepEqual(commits.at(-1), [70, 80])
    await act(() => api.setThumbValue(1, 0, true))
    assert.deepEqual(api.value, [70, 80])
    const thumbs = () =>
      tree.root.findAll((node) => node.type === "View" && node.props.accessibilityRole === "adjustable")
    assert.equal(thumbs()[0].props.accessibilityLabel, "Price 1")
    assert.equal(thumbs()[0].props.accessibilityValue.max, 70)
    // Native measurement can complete after a quick tap is released.
    let measure
    control().props.ref({
      measure: (callback) => {
        measure = callback
      },
    })
    const beforeCommit = commits.length
    await act(() => control().props.onResponderGrant({ nativeEvent: { pageX: 106, pageY: 20 } }))
    await act(() => control().props.onResponderRelease())
    await act(() => measure(0, 0, 288, 12, 100, 20))
    assert.deepEqual(api.value, [0, 80])
    assert.equal(commits.length, beforeCommit + 1)
    // Move several times before releasing; crossing clamps the same thumb.
    control().props.ref({ measure: (callback) => callback(0, 0, 288, 12, 100, 20) })
    await act(() => control().props.onResponderGrant({ nativeEvent: { pageX: 106, pageY: 20 } }))
    await act(() => control().props.onResponderMove({ nativeEvent: { pageX: 500, pageY: 20 } }))
    assert.deepEqual(api.value, [70, 80])
    await act(() => control().props.onResponderRelease())
    assert.equal(api.draggingIndex, null)
    const count = changes.length
    await render(fixture({ disabled: true }))
    await act(() => api.setThumbValue(0, 10, true))
    assert.equal(changes.length, count)
    assert.equal(control().props.onStartShouldSetResponder(), false)
    await render(fixture({ readOnly: true }))
    await act(() => thumbs()[0].props.onAccessibilityAction({ nativeEvent: { actionName: "decrement" } }))
    assert.equal(changes.length, count)
    await render(fixture({ value: [25, 65] }))
    await act(() => api.setThumbValue(0, 40, true))
    assert.deepEqual(changes.at(-1), [40, 65])
    await render(fixture({ value: [25, 65] }))
    assert.deepEqual(api.value, [25, 65], "controlled value remains owned by the caller")
    await render(fixture({ value: [-0.5, 0.5], min: -1, max: 1, step: 0.1, minStepsBetweenThumbs: 1 }))
    await act(() => thumbs()[0].props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }))
    assert.deepEqual(changes.at(-1), [-0.4, 0.5])
    await act(() => tree.unmount())
    tree = null
  }
  // Scroll metrics react to viewport/content changes, preserve callbacks, and guard disabled gestures.
  {
    const { scrollGeometry } = await import("@multicomma/arkcn-react-native/lib/scroll-area")
    assert.equal(scrollGeometry(200, 100, 0).overflow, false)
    assert.equal(scrollGeometry(200, 1000, -20).thumbOffset, 0)
    const end = scrollGeometry(200, 1000, 900)
    assert.equal(end.thumbOffset + end.thumbSize, 198)
    assert.equal(scrollGeometry(10, 1000, 90).thumbSize, 8)
    let api
    let callback = 0
    const fixture = (disabled = false) =>
      h(
        ScrollArea.Root,
        {
          disabled,
          orientation: "horizontal",
          composed: true,
        },
        h(ScrollArea.Viewport, { onScroll: () => callback++ }, h(ScrollArea.Content, null, h("Text", null, "Rows"))),
        h(ScrollArea.Scrollbar),
        h(ScrollArea.Context, null, (value) => {
          api = value
          return null
        })
      )
    await render(fixture())
    const viewport = () => tree.root.findByType("ScrollView")
    await act(() => {
      viewport().props.onLayout({ nativeEvent: { layout: { width: 200, height: 100 } } })
      viewport().props.onContentSizeChange(1000, 100)
    })
    assert.equal(api.overflow, true)
    assert.equal(api.maxOffset, 800)
    await act(() => viewport().props.onScroll({ nativeEvent: { contentOffset: { x: 400, y: 0 } } }))
    assert.equal(api.offset, 400)
    assert.equal(callback, 1)
    const commands = []
    api.ref.current = { scrollTo: (args) => commands.push(args) }
    api.scrollTo(9999)
    assert.deepEqual(commands.at(-1), { x: 800, y: 0, animated: false })
    const enabledBar = tree.root.findAllByType("View").find((node) => node.props.accessibilityRole === "adjustable")
    assert.equal(enabledBar.props.accessible, true)
    enabledBar.props.ref({ measure: (done) => done(0, 0, 200, 10, 100, 200) })
    enabledBar.props.onResponderGrant({ nativeEvent: { pageX: 200, pageY: 205 } })
    enabledBar.props.onResponderMove({ nativeEvent: { pageX: 240, pageY: 205 } })
    assert(commands.at(-1).x > 400 && commands.at(-1).x < 800, "dragging advances from the existing offset")
    enabledBar.props.onResponderMove({ nativeEvent: { pageX: 10000, pageY: 205 } })
    assert.equal(commands.at(-1).x, 800, "dragging clamps to the end")
    enabledBar.props.onAccessibilityAction({ nativeEvent: { actionName: "decrement" } })
    assert.equal(commands.at(-1).x, 240, "accessibility scrolls a page backward")
    await render(fixture(true))
    assert.equal(viewport().props.scrollEnabled, false)
    const bar = tree.root.findAllByType("View").find((node) => node.props.accessibilityRole === "adjustable")
    assert.equal(bar.props.onStartShouldSetResponder(), false)
    const before = commands.length
    api.scrollTo(0)
    assert.equal(commands.length, before)
    await act(() => viewport().props.onContentSizeChange(100, 100))
    assert.equal(api.overflow, false)
    assert.equal(
      tree.root.findAllByType("View").some((node) => node.props.accessibilityRole === "adjustable"),
      false
    )
    await render(h("View"))
  }
  // Two-axis areas keep offsets independent and reserve only the shared corner.
  {
    let api
    let sizes = []
    const fixture = () =>
      h(
        ScrollArea.Root,
        { orientation: "both", composed: true },
        h(
          ScrollArea.Viewport,
          { onContentSizeChange: (...size) => sizes.push(size) },
          h(ScrollArea.Content, null, h("Text", null, "Grid"))
        ),
        h(ScrollArea.Scrollbar, { orientation: "horizontal" }),
        h(ScrollArea.Scrollbar, { orientation: "vertical" }),
        h(ScrollArea.Corner, { testID: "corner" }),
        h(ScrollArea.Context, null, (value) => {
          api = value
          return null
        })
      )
    await render(fixture())
    const outer = () => tree.root.findAllByType("ScrollView").find((n) => !n.props.horizontal)
    const inner = () => tree.root.findAllByType("ScrollView").find((n) => n.props.horizontal)
    await act(() => {
      outer().props.onLayout({ nativeEvent: { layout: { width: 320, height: 180 } } })
      inner().props.onContentSizeChange(640, 480)
    })
    assert.equal(api.corner, 10)
    assert.equal(api.axes.horizontal.maxOffset, 320)
    assert.equal(api.axes.vertical.maxOffset, 300)
    assert.deepEqual(sizes, [[640, 480]])
    await act(() => {
      inner().props.onScroll({ nativeEvent: { contentOffset: { x: 120, y: 0 } } })
      outer().props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 75 } } })
    })
    assert.deepEqual(api.position, { x: 120, y: 75 })
    let xCalls = [],
      yCalls = []
    api.ref.current = { scrollTo: (point) => yCalls.push(point) }
    api.horizontalRef.current = { scrollTo: (point) => xCalls.push(point) }
    api.scrollTo({ x: 250 })
    assert.equal(yCalls.length, 0, "horizontal command must not reset vertical scroll")
    api.scrollTo({ y: 200 })
    assert.equal(xCalls.length, 1, "vertical command must not reset horizontal scroll")
    api.scrollTo({ x: 9999, y: 9999 })
    assert.deepEqual(xCalls.at(-1), { x: 320, y: 0, animated: false })
    assert.deepEqual(yCalls.at(-1), { x: 0, y: 300, animated: false })
    const before = api.axes.vertical.thumbSize
    await act(() => inner().props.onContentSizeChange(260, 480))
    assert.equal(api.corner, 0)
    assert.equal(api.axes.horizontal.overflow, false)
    assert(api.axes.vertical.thumbSize > before, "remaining track expands into the former corner")
    assert.equal(
      tree.root.findAllByType("View").some((n) => n.props.testID === "corner"),
      false
    )
    await act(() => inner().props.onContentSizeChange(260, 80))
    assert.equal(api.axes.vertical.overflow, false)
    assert.equal(
      tree.root.findAllByType("View").some((n) => n.props.accessibilityRole === "adjustable"),
      false
    )
    await render(h("View"))
  }
  // Password visibility is independent of value and honors controlled/blocked states.
  let visibilityChanges = []
  let passwordChanges = []
  let passwordApi
  const passwordFixture = (props = {}) =>
    h(
      PasswordInput.Root,
      { onVisibilityChange: (v) => visibilityChanges.push(v.visible), ...props },
      h(PasswordInput.Label, null, "Account password"),
      h(
        PasswordInput.Control,
        null,
        h(PasswordInput.Input, { defaultValue: "Example-42", onChangeText: (v) => passwordChanges.push(v) }),
        h(PasswordInput.VisibilityTrigger)
      ),
      h(PasswordInput.Context, null, (api) => {
        passwordApi = api
        return null
      })
    )
  await render(passwordFixture())
  const passwordInput = () => tree.root.findByType("TextInput")
  const visibilityButton = () =>
    tree.root.findAll((n) => n.type === "Pressable" && /^(Show|Hide) password$/.test(n.props.accessibilityLabel))[0]
  const passwordPress = () => ({ defaultPrevented: false, stopPropagation() {} })
  assert.equal(passwordInput().props.secureTextEntry, true)
  assert.equal(passwordInput().props.accessibilityLabel, "Account password")
  await act(() => passwordInput().props.onChangeText("Changed-123"))
  await act(() => visibilityButton().props.onPress(passwordPress()))
  assert.equal(passwordInput().props.secureTextEntry, false)
  assert.equal(passwordInput().props.value, "Changed-123")
  assert.deepEqual(visibilityChanges, [true])
  assert.deepEqual(passwordChanges, ["Changed-123"])
  await render(passwordFixture({ visible: false }))
  await act(() => visibilityButton().props.onPress(passwordPress()))
  assert.equal(passwordInput().props.secureTextEntry, true, "controlled visibility waits for the owner")
  await render(passwordFixture({ visible: true }))
  assert.equal(passwordInput().props.secureTextEntry, false)
  for (const blocked of [{ disabled: true }, { readOnly: true }]) {
    await render(passwordFixture({ ...blocked, visible: false }))
    const changes = visibilityChanges.length
    await act(() => {
      visibilityButton().props.onPress(passwordPress())
      passwordApi.toggleVisible()
      passwordInput().props.onChangeText("blocked")
    })
    assert.equal(visibilityChanges.length, changes)
    assert.equal(passwordInput().props.editable, false)
    assert.equal(passwordInput().props.value, "Changed-123")
  }
  function PasswordProviderFixture() {
    const api = usePasswordInput({ defaultVisible: true })
    return h(PasswordInput.RootProvider, { value: api })
  }
  await render(h(PasswordProviderFixture))
  assert.equal(passwordInput().props.secureTextEntry, false)
  await act(() => visibilityButton().props.onPress(passwordPress()))
  assert.equal(passwordInput().props.secureTextEntry, true)
  // Table columns stay aligned across sections and discard measurements from removed rows.
  const tableFixture = (long = true) =>
    h(
      Table.Root,
      { testID: "invoice-table" },
      h(Table.Caption, null, "Invoices"),
      h(
        Table.Header,
        null,
        h(Table.Row, null, h(Table.Head, { testID: "table-heading" }, "Invoice"), h(Table.Head, null, "Amount"))
      ),
      h(
        Table.Body,
        null,
        h(
          React.Fragment,
          null,
          h(
            Table.Row,
            { testID: "table-first", selected: true },
            h(Table.Cell, null, "INV001"),
            h(Table.Cell, null, "$10")
          ),
          long &&
            h(Table.Row, { testID: "table-last" }, h(Table.Cell, null, "Long invoice"), h(Table.Cell, null, "$20"))
        )
      ),
      h(Table.Footer, null, h(Table.Row, null, h(Table.Cell, { testID: "table-total", colSpan: 2 }, "Total")))
    )
  let tableRoot = await render(tableFixture())
  const tableHost = (id) => tableRoot.findAll((node) => typeof node.type === "string" && node.props.testID === id)[0]
  await act(() => tableHost("invoice-table").props.onLayout({ nativeEvent: { layout: { width: 300 } } }))
  await act(() =>
    tableRoot
      .findAllByType("Text")
      .filter((node) => node.props.onLayout)
      .forEach((node) =>
        node.props.onLayout({ nativeEvent: { layout: { width: node.props.children === "Long invoice" ? 200 : 60 } } })
      )
  )
  assert.ok(Math.abs(flatten(tableHost("table-total").props.style).width - 300) < 0.001)
  assert.equal(flatten(tableHost("table-last").props.style).borderBottomWidth, 0)
  assert.equal(flatten(tableHost("table-first").props.style).borderBottomWidth, 1)
  assert.equal(tableHost("table-first").props.accessibilityState.selected, true)
  const wideHeading = flatten(tableHost("table-heading").props.style).width
  tableRoot = await render(tableFixture(false))
  assert.equal(flatten(tableHost("table-first").props.style).borderBottomWidth, 0)
  assert.ok(flatten(tableHost("table-heading").props.style).width < wideHeading)
  assert.equal(flatten(tableHost("table-heading").props.style).width, 150)
  assert.ok(Math.abs(flatten(tableHost("table-total").props.style).width - 300) < 0.001)
  // Upload shimmer follows state/reduced motion; card and action callbacks stay independent.
  let attachmentOpens = 0
  let attachmentCancels = 0
  const attachmentFixture = (state = "uploading", reducedMotion = false, disabled = false) =>
    h(
      NativeThemeProvider,
      { reducedMotion },
      h(
        Attachment.Root,
        { state },
        h(Attachment.Content, null, h(Attachment.Title, { testID: "attachment-title" }, "Report.pdf")),
        h(Attachment.Trigger, { accessibilityLabel: "Open file", disabled, onPress: () => attachmentOpens++ }),
        h(
          Attachment.Actions,
          null,
          h(
            Attachment.ActionTrigger,
            { accessibilityLabel: "Cancel file", onPress: () => attachmentCancels++ },
            "Cancel"
          )
        )
      )
    )
  let attachmentRoot = await render(attachmentFixture())
  const attachmentAction = (label) =>
    attachmentRoot.findAll((node) => typeof node.type === "string" && node.props.accessibilityLabel === label)[0]
  const uploadText = attachmentRoot.findAll(
    (node) => node.type === "Text" && node.props.testID === "attachment-title"
  )[0]
  await act(() => uploadText.props.onLayout({ nativeEvent: { layout: { width: 180, height: 18 } } }))
  assert.equal(attachmentRoot.findAllByType("MaskedView").length, 1)
  await act(() => attachmentAction("Cancel file").props.onPress({}))
  assert.equal(attachmentCancels, 1)
  assert.equal(attachmentOpens, 0)
  await act(() => attachmentAction("Open file").props.onPress({}))
  assert.equal(attachmentOpens, 1)
  attachmentRoot = await render(attachmentFixture("processing", true, true))
  assert.equal(attachmentRoot.findAllByType("MaskedView").length, 0)
  await act(() => attachmentAction("Open file").props.onPress({}))
  assert.equal(attachmentOpens, 1)
  attachmentRoot = await render(attachmentFixture("processing"))
  assert.equal(attachmentRoot.findAllByType("MaskedView").length, 1)
  attachmentRoot = await render(attachmentFixture("done"))
  assert.equal(attachmentRoot.findAllByType("MaskedView").length, 0)
  // Horizontal groups measure their tallest card and discard removed snap points.
  let measuredLayout = 0
  const attachmentGroupFixture = (count) =>
    h(
      Attachment.Group,
      null,
      ...Array.from({ length: count }, (_, index) =>
        h(
          Attachment.Root,
          { key: index, testID: `attachment-card-${index}`, onLayout: () => measuredLayout++ },
          h(Attachment.Title, null, "File")
        )
      )
    )
  let attachmentGroupRoot = await render(attachmentGroupFixture(2))
  const cardHost = (index) =>
    attachmentGroupRoot.findAll(
      (node) => typeof node.type === "string" && node.props.testID === `attachment-card-${index}`
    )[0]
  await act(() => cardHost(0).props.onLayout({ nativeEvent: { layout: { x: 0, height: 58 } } }))
  await act(() => cardHost(1).props.onLayout({ nativeEvent: { layout: { x: 240, height: 80 } } }))
  assert.equal(flatten(attachmentGroupRoot.findByType("MaskedView").props.style).height, 88)
  assert.equal(measuredLayout, 2)
  attachmentGroupRoot = await render(attachmentGroupFixture(1))
  assert.equal(flatten(attachmentGroupRoot.findByType("MaskedView").props.style).height, 66)
  assert.deepEqual(attachmentGroupRoot.findByType("ScrollView").props.snapToOffsets, [0])
  // A marker remains passive until an action is supplied; disabled links never navigate.
  let markerVisits = 0
  const markerFixture = (disabled = false, interactive = true) =>
    h(
      Marker.Root,
      {
        testID: "location-marker",
        accessibilityRole: interactive ? "link" : undefined,
        disabled,
        onPress: interactive ? () => markerVisits++ : undefined,
      },
      h(Marker.Content, { testID: "location-label" }, "Office")
    )
  let markerRoot = await render(markerFixture())
  const markerHost = () =>
    markerRoot.findAll((node) => typeof node.type === "string" && node.props.testID === "location-marker")[0]
  const markerLabel = () =>
    markerRoot.findAll((node) => typeof node.type === "string" && node.props.testID === "location-label")[0]
  assert.equal(markerHost().props.accessibilityRole, "link")
  assert.equal(flatten(markerLabel().props.style).textDecorationLine, "underline")
  await act(() => markerHost().props.onPress({}))
  assert.equal(markerVisits, 1)
  markerRoot = await render(markerFixture(true))
  await act(() => markerHost().props.onPress({}))
  assert.equal(markerVisits, 1)
  assert.equal(markerHost().props.accessibilityState.disabled, true)
  markerRoot = await render(markerFixture(false, false))
  assert.equal(markerHost().type, "View")
  assert.equal(markerHost().props.onPress, undefined)
  assert.equal(flatten(markerLabel().props.style).textDecorationLine, "none")
  // Conversation layout follows dynamic composition and preserves independent nested controls.
  let messagePresses = 0
  let reactionPresses = 0
  const conversation = (footer = true, align = "end") =>
    h(
      Message.Root,
      { align },
      h(Message.Avatar, { testID: "message-avatar" }, h(Avatar.Root, null, h(Avatar.Fallback, null, "AC"))),
      h(
        Message.Content,
        null,
        h(Message.Header, { testID: "message-header" }, "Ava"),
        h(
          React.Fragment,
          null,
          h(
            Bubble.Root,
            { variant: "ghost", testID: "message-bubble" },
            h(Bubble.Content, { onPress: () => messagePresses++, accessibilityLabel: "Message" }, "Hello"),
            h(
              Bubble.Reactions,
              { testID: "reactions", interactive: true },
              h(Button, { onPress: () => reactionPresses++, accessibilityLabel: "Like" }, "Like")
            )
          )
        ),
        footer && h(React.Fragment, null, h(Message.Footer, null, "9:12 AM"))
      )
    )
  let conversationRoot = await render(conversation())
  const host = (id) => conversationRoot.findAll((node) => typeof node.type === "string" && node.props.testID === id)[0]
  assert.equal(flatten(host("message-bubble").props.style).alignSelf, "flex-end")
  assert.deepEqual(flatten(host("message-avatar").props.style).transform, [{ translateY: -32 }])
  assert.equal(flatten(host("message-header").props.style).paddingHorizontal, 0)
  const messageAction = conversationRoot.findAll(
    (node) => typeof node.type === "string" && node.props.accessibilityLabel === "Message"
  )[0]
  const likeAction = conversationRoot.findAll(
    (node) => typeof node.type === "string" && node.props.accessibilityLabel === "Like"
  )[0]
  await act(() => likeAction.props.onPress({}))
  assert.equal(reactionPresses, 1)
  assert.equal(messagePresses, 0)
  await act(() => messageAction.props.onPress({}))
  assert.equal(messagePresses, 1)
  await act(() => host("reactions").props.onLayout({ nativeEvent: { layout: { height: 40 } } }))
  assert.deepEqual(flatten(host("reactions").props.style).transform, [{ translateY: 30 }])
  conversationRoot = await render(conversation(false, "start"))
  assert.equal(flatten(host("message-bubble").props.style).alignSelf, "flex-start")
  assert.equal(flatten(host("message-avatar").props.style).transform, undefined)
  // Timer uses elapsed wall time rather than counting scheduled callbacks.
  const timerRealNow = Date.now
  const timerRealInterval = globalThis.setInterval
  const timerRealClearInterval = globalThis.clearInterval
  let timerNow = 0
  let timerApi
  let timerCompletes = 0
  const timerTicks = []
  const timerIntervals = new Map()
  let timerId = 0
  Date.now = () => timerNow
  globalThis.setInterval = (callback) => {
    const id = ++timerId
    timerIntervals.set(id, callback)
    return id
  }
  globalThis.clearInterval = (id) => timerIntervals.delete(id)
  const timerFixture = (props = {}) =>
    h(
      Timer.Root,
      {
        startMs: 5000,
        countdown: true,
        onComplete: () => timerCompletes++,
        onTick: (details) => timerTicks.push(details),
        ...props,
      },
      h(Timer.Context, null, (api) => {
        timerApi = api
        return null
      }),
      h(Timer.Area, null, h(Timer.Item, { type: "seconds" })),
      h(
        Timer.Control,
        null,
        ...["start", "pause", "resume", "reset"].map((action) => h(Timer.ActionTrigger, { action, key: action }))
      )
    )
  const advanceTimer = async (ms) => {
    timerNow += ms
    await act(() => [...timerIntervals.values()].forEach((callback) => callback()))
  }
  try {
    await render(timerFixture())
    assert.equal(timerApi.formattedTime.seconds, "05")
    assert.equal(timerApi.progressPercent, 1)
    await act(() => timerApi.start())
    await advanceTimer(2400)
    assert.equal(timerApi.value, 3000)
    await act(() => timerApi.pause())
    assert.equal(timerApi.value, 2600)
    assert.equal(timerApi.paused, true)
    await advanceTimer(10000)
    assert.equal(timerApi.value, 2600)
    await act(() => timerApi.resume())
    await advanceTimer(1000)
    assert.equal(timerApi.value, 1600)
    timerNow += 10000
    await act(() => emitAppState("active"))
    assert.equal(timerApi.value, 0)
    assert.equal(timerApi.running, false)
    assert.equal(timerCompletes, 1)
    await act(() => emitAppState("active"))
    assert.equal(timerCompletes, 1)
    assert.equal(timerApi.progressPercent, 0)
    assert.equal(timerTicks.at(-1).formattedTime.seconds, "00")
    await act(() => timerApi.restart())
    await advanceTimer(1000)
    await act(() => timerApi.reset())
    assert.equal(timerApi.running, true)
    assert.equal(timerApi.value, 5000)
    await act(() => timerApi.pause())
    await act(() => timerApi.reset())
    assert.equal(timerApi.paused, false)
    assert.equal(timerApi.running, false)
    await render(timerFixture({ countdown: false, startMs: 1000, targetMs: 4000 }))
    assert.equal(timerApi.running, true)
    await advanceTimer(1000)
    assert.equal(timerApi.value, 2000)
    assert.equal(timerApi.progressPercent, 1 / 3)
    await advanceTimer(6000)
    assert.equal(timerApi.value, 4000)
    assert.equal(timerCompletes, 2)
    await act(() => timerApi.restart())
    await render(timerFixture({ countdown: false, startMs: 1000, targetMs: 4000, interval: 400 }))
    await advanceTimer(1200)
    assert.equal(timerApi.value, 2200)
    await render(timerFixture({ countdown: false, startMs: 1000, targetMs: 4000, interval: 1000 }))
    assert.equal(timerApi.value, 2200)
    await advanceTimer(800)
    assert.equal(timerApi.value, 3000)
    await act(() => tree.unmount())
    tree = undefined
    assert.equal(timerIntervals.size, 0)
    await act(() => emitAppState("active"))
    assert.equal(timerCompletes, 2)
  } finally {
    Date.now = timerRealNow
    globalThis.setInterval = timerRealInterval
    globalThis.clearInterval = timerRealClearInterval
  }

  // Timeline connectors must follow dynamic/fragment children and stop at every group boundary.
  const feedNow = new Date("2026-10-14T12:00:00Z")
  let feedLoads = 0
  let feedReplies = 0
  const feedItem = (value) =>
    h(
      ActivityFeed.Item,
      { value, key: value },
      h(ActivityFeed.ItemMarker),
      h(
        ActivityFeed.ItemContent,
        null,
        h(ActivityFeed.ItemHeader, null, h(ActivityFeed.ItemActor, null, "Ava"), "commented"),
        h(ActivityFeed.ItemTime, { date: new Date("2026-10-14T10:00:00Z"), now: feedNow }),
        h(ActivityFeed.ItemActions, null, h(Button, { onPress: () => feedReplies++ }, "Reply"))
      )
    )
  const feed = (count, disabled = false) =>
    h(
      ActivityFeed.Root,
      { busy: disabled },
      h(
        ActivityFeed.Group,
        null,
        h(
          ActivityFeed.Items,
          null,
          h(React.Fragment, null, ...Array.from({ length: count }, (_, index) => feedItem(String(index))))
        ),
        h(ActivityFeed.LoadMoreTrigger, { disabled, onPress: () => feedLoads++ })
      ),
      h(ActivityFeed.Group, null, h(ActivityFeed.Items, null, feedItem("other")))
    )
  await render(feed(1))
  const connectors = () => tree.root.findAll((n) => n.type === "View" && n.props.testID === "activity-feed-connector")
  assert.equal(connectors().length, 0)
  assert.ok(tree.root.findAll((n) => n.type === "Text" && n.children.includes("2 hours ago")).length)
  await render(feed(3))
  assert.equal(connectors().length, 2)
  await act(() =>
    tree.root.findAll((n) => n.type === "Pressable" && n.props.accessibilityRole === "button")[0].props.onPress({})
  )
  assert.equal(feedReplies, 1)
  const loadFeed = () =>
    tree.root
      .findAll((n) => n.type === "Pressable")
      .find((n) => n.findAll((x) => x.type === "Text" && x.children.includes("Load older activity")).length)
  await act(() => loadFeed().props.onPress({}))
  assert.equal(feedLoads, 1)
  await render(feed(0, true))
  assert.equal(connectors().length, 0)
  assert.equal(
    tree.root.findAll((n) => n.type === "View" && n.props.role === "feed")[0].props.accessibilityState.busy,
    true
  )
  assert.equal(loadFeed().props.disabled, true)

  // Clipboard: only confirmed writes count; failures, stale completions and retries are observable.
  const clipboardHost = await import("./fixtures/native-clipboard.mjs")
  let clipboardApi
  const copyStatuses = []
  const copySuccesses = []
  const copyErrors = []
  const clipboard = (props = {}) =>
    h(
      Clipboard.Root,
      {
        defaultValue: "Native ✓",
        timeout: 40,
        onStatusChange: ({ copied }) => copyStatuses.push(copied),
        onCopy: ({ value }) => copySuccesses.push(value),
        onCopyError: ({ error }) => copyErrors.push(error.message),
        ...props,
      },
      h(Clipboard.Label, null, "Command"),
      h(Clipboard.Control, null, h(Clipboard.Input), h(Clipboard.Trigger)),
      h(Clipboard.Context, null, (api) => {
        clipboardApi = api
        return null
      })
    )
  await render(clipboard())
  assert.equal(tree.root.findByType("TextInput").props.accessibilityLabel, "Command")
  assert.equal(tree.root.findByType("TextInput").props.editable, false)
  let copied
  await act(async () => {
    copied = await clipboardApi.copy()
  })
  assert.equal(copied, true)
  assert.equal(clipboardApi.copied, true)
  assert.equal(clipboardHost.writes.at(-1), "Native ✓")
  assert.equal(copySuccesses.at(-1), "Native ✓")
  assert.equal(tree.root.findByType("Pressable").props.accessibilityLabel, "Copied to clipboard")
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60))
  })
  assert.equal(clipboardApi.copied, false)
  assert.deepEqual(copyStatuses, [true, false])
  clipboardHost.setWriter(async () => false)
  await act(async () => {
    copied = await clipboardApi.copy()
  })
  assert.equal(copied, false)
  assert.equal(clipboardApi.copied, false)
  assert.equal(copyErrors.length, 1)
  assert.equal(tree.root.findByType("Pressable").props.accessibilityLabel, "Copy failed. Try again")
  clipboardHost.setWriter(async () => {
    throw new Error("Denied")
  })
  await act(async () => {
    await clipboardApi.copy()
  })
  assert.equal(copyErrors.at(-1), "Denied")
  clipboardHost.setWriter(async () => true)
  await act(async () => {
    await clipboardApi.copy()
  })
  assert.equal(clipboardApi.error, null)
  assert.equal(clipboardApi.copied, true)
  await act(() => clipboardApi.setValue("Changed"))
  assert.equal(clipboardApi.value, "Changed")
  assert.equal(clipboardApi.copied, false)
  assert.equal(tree.root.findByType("TextInput").props.value, "Changed")
  let finishWrite
  clipboardHost.setWriter(
    () =>
      new Promise((resolve) => {
        finishWrite = resolve
      })
  )
  let write
  await act(() => {
    write = clipboardApi.copy()
  })
  assert.equal(clipboardApi.pending, true)
  const callsBeforeRepeat = clipboardHost.writes.length
  await act(async () => {
    assert.equal(await clipboardApi.copy(), false)
  })
  assert.equal(clipboardHost.writes.length, callsBeforeRepeat)
  await render(clipboard({ value: "New controlled value" }))
  await act(async () => {
    finishWrite(true)
    await write
  })
  assert.equal(clipboardApi.copied, false)
  assert.equal(clipboardApi.pending, false)
  assert.equal(copySuccesses.length, 2)
  await render(clipboard({ disabled: true }))
  await act(async () => {
    assert.equal(await clipboardApi.copy(), false)
  })
  assert.equal(clipboardHost.writes.length, callsBeforeRepeat)
  assert.equal(tree.root.findByType("Pressable").props.disabled, true)
  await render(h(Fieldset.Root, { disabled: true }, clipboard()))
  assert.equal(clipboardApi.disabled, true)
  await render(clipboard())
  await act(() => {
    write = clipboardApi.copy()
  })
  await render(h("View"))
  await act(async () => {
    finishWrite(true)
    assert.equal(await write, false)
  })
  assert.equal(copySuccesses.length, 2)
  clipboardHost.setWriter(async () => true)
  // App Shell contracts: responsive drawers, controlled state and collapse modes.
  let shellApi
  function ShellProbe() {
    const api = useAppShell()
    React.useEffect(() => {
      shellApi = api
    }, [api])
    return null
  }
  const shell = (props = {}) =>
    h(
      NativeThemeProvider,
      { reducedMotion: true },
      h(
        AppShell.Root,
        props,
        h(ShellProbe),
        h(
          AppShell.Sidebar,
          null,
          h(AppShell.NavLink, { label: "Inbox", onPress: () => {} }),
          h(
            AppShell.NavCollapsible,
            { label: "Resources", defaultOpen: true },
            h(AppShell.NavSubLink, { label: "Docs" })
          )
        ),
        h(AppShell.Content, null, h(AppShell.Header), h(AppShell.Main, null, "Content"))
      )
    )
  await render(shell())
  const shellLayout = () => tree.root.findAllByType("View").find((node) => node.props.onLayout)
  const shellPress = (label) =>
    tree.root.findAllByType("Pressable").find((node) => node.props.accessibilityLabel === label)
  const tapEvent = () => ({
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
  })
  assert.equal(shellApi.isMobile, false)
  await act(() => shellPress("Toggle Sidebar").props.onPress(tapEvent()))
  assert.equal(shellApi.open, false)
  assert.equal(tree.root.findAllByType("Modal").length, 0, "collapsing expanded navigation must not open its menu")
  await act(() => shellPress("Resources").props.onPress(tapEvent()))
  assert.equal(tree.root.findAllByType("Modal").length, 1)
  await act(async () => {
    shellPress("Docs").props.onPress(tapEvent())
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  assert.equal(tree.root.findAllByType("Modal").length, 0)
  await act(() => shellLayout().props.onLayout({ nativeEvent: { layout: { width: 390 } } }))
  assert.equal(shellApi.isMobile, true)
  await act(() => shellPress("Toggle Sidebar").props.onPress(tapEvent()))
  assert.equal(shellApi.mobileOpen, true)
  await act(async () => {
    shellPress("Inbox").props.onPress(tapEvent())
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  assert.equal(shellApi.mobileOpen, false)
  await act(() => shellApi.setMobileOpen(true))
  await act(async () => {
    tree.root.findByType("Modal").props.onRequestClose()
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
  assert.equal(shellApi.mobileOpen, false)
  await act(() => shellApi.setCollapsible("none"))
  assert.equal(shellPress("Toggle Sidebar"), undefined)
  assert.ok(shellPress("Inbox"), "none keeps navigation visible on small screens")
  let requestedOpen
  await render(
    shell({
      open: true,
      onOpenChange: (value) => {
        requestedOpen = value
      },
      collapsible: "offcanvas",
    })
  )
  await act(() => shellLayout().props.onLayout({ nativeEvent: { layout: { width: 1000 } } }))
  await act(() => shellPress("Toggle Sidebar").props.onPress(tapEvent()))
  assert.equal(requestedOpen, false)
  assert.equal(shellApi.open, true, "controlled shell stays open until the parent changes it")
  await act(() => tree.unmount())
  tree = undefined
  let presses = 0
  await render(h(Button, { onPress: () => presses++, style: ({ pressed }) => ({ margin: pressed ? 7 : 3 }) }, "Save"))
  const pressable = tree.root.findByType("Pressable")
  assert.equal(pressable.props.accessibilityRole, "button")
  await act(() => pressable.props.onPressIn({}))
  assert.equal(flatten(pressable.props.style).margin, 7)
  assert.equal(flatten(pressable.props.style).transform[0].translateY, 1)
  assert.equal(flatten(pressable.props.style).minHeight, 32)
  assert.equal(pressable.props.hitSlop, 6)
  await act(() => pressable.props.onPress())
  assert.equal(presses, 1)
  await render(h(Button, null, "Pressed ", 1, " times"))
  assert.deepEqual(
    tree.root.findByType("Text").props.children,
    ["Pressed ", 1, " times"],
    "composed text labels stay inside native Text"
  )
  await render(h(Button, null, h("Icon"), "Save"))
  assert.equal(tree.root.findByType("Text").props.children, "Save", "icon labels stay inside native Text")
  await render(h(Button, { loading: true, accessibilityLabel: "Save profile" }, "Save"))
  const busy = tree.root.findByType("Pressable")
  assert.equal(busy.props.disabled, true)
  assert.equal(busy.props.accessibilityState.busy, true)
  assert.equal(busy.props.accessibilityLabel, "Save profile")
  assert.equal(flatten(busy.props.style).opacity, 0.5)
  assert.equal(tree.root.findByType("Text").props.children, "Save", "loading retains the text label")

  await render(h(Button, { variant: "outline", invalid: true }, "Invalid action"))
  const invalidButton = tree.root.findByType("Pressable")
  assert.equal(flatten(invalidButton.props.style).borderColor, nativeColors.light.destructive)
  assert.equal(flatten(invalidButton.props.style).boxShadow[0].spreadDistance, 3)
  await render(h(Button, { variant: "outline", accessibilityState: { expanded: true } }, "Open"))
  const expandedButton = tree.root.findByType("Pressable")
  assert.equal(expandedButton.props["aria-expanded"], true)
  assert.equal(flatten(expandedButton.findByType("View").props.style).backgroundColor, nativeColors.light.muted)

  let focus = 0
  let change
  await render(
    h(Input.Root, {
      value: "original",
      onChangeText: (value) => (change = value),
      onFocus: () => focus++,
      accessibilityLabel: "Name",
      style: { margin: 8 },
    })
  )
  let input = tree.root.findByType("TextInput")
  await act(() => input.props.onFocus({}))
  input = tree.root.findByType("TextInput")
  assert.equal(focus, 1)
  assert.equal(flatten(input.props.style).borderColor, nativeColors.light.ring)
  assert.match(
    flatten(input.props.style).boxShadow,
    /^0px 0px 0px 3px /,
    "native focus rings have a sharp, immediate 3px spread"
  )
  assert.deepEqual(
    flatten(input.props.style).transitionProperty,
    ["borderColor", "backgroundColor"],
    "color-only input transitions do not animate the ring"
  )
  await act(() => input.props.onChangeText("changed"))
  assert.equal(change, "changed")
  assert.equal(input.props.value, "original", "controlled inputs leave state with the caller")
  await render(h(Input.Root, { disabled: true, invalid: true }))
  input = tree.root.findByType("TextInput")
  assert.equal(input.props.editable, false)
  assert.equal(input.props.accessibilityState.disabled, true)
  assert.equal(flatten(input.props.style).borderColor, nativeColors.light.destructive)
  await render(h(Textarea.Root, { style: { minHeight: 200 } }))
  input = tree.root.findByType("TextInput")
  assert.equal(input.props.multiline, true)
  assert.equal(flatten(input.props.style).minHeight, 200)

  Platform.OS = "web"
  await render(h(Input.Root, { key: "web-focus" }))
  input = tree.root.findByType("TextInput")
  await act(() => input.props.onFocus({}))
  assert.match(
    flatten(input.props.style).boxShadow,
    /^0px 0px 0px 3px /,
    "web serialization does not turn ring spread into blur"
  )
  await act(() => input.props.onBlur({}))
  assert.equal(flatten(input.props.style).boxShadow, "none", "web ring updates when focus leaves")
  Platform.OS = "ios"
  await render(h(NativeThemeProvider, { reducedMotion: true }, h(Input.Root)))
  input = tree.root.findByType("TextInput")
  await act(() => input.props.onFocus({}))
  assert.equal(flatten(input.props.style).transitionDuration, 0, "reduced motion disables input color transitions")

  await render(
    h(
      NativeThemeProvider,
      { colorScheme: "dark", colors: { border: "custom-border" } },
      h(Card.Root, null, h(Card.Title, null, "Title"), h(Badge.Root, null, "Badge"), h(Separator.Root))
    )
  )
  assert.equal(flatten(tree.root.findAllByType("View")[0].props.style).backgroundColor, nativeColors.dark.card)
  assert.equal(flatten(tree.root.findAllByType("View").at(-1).props.style).backgroundColor, "custom-border")
  assert.equal(tree.root.findAllByType("Text")[0].props.accessibilityRole, "header")
  await render(h(Spinner.Root, { accessibilityLabel: "Saving" }))
  const spinnerStyle = flatten(tree.root.findByType("View").props.style)
  assert.equal(spinnerStyle.width, 16)
  assert.equal(spinnerStyle.animationDuration, 1000)
  assert.equal(spinnerStyle.animationTimingFunction, "linear")
  assert.equal(tree.root.findByType("Path").props.d, "M21 12a9 9 0 1 1-6.219-8.56")
  assert.equal(tree.root.findByType("View").props.accessibilityState.busy, true)
  await act(() => emitReducedMotion(true))
  assert.equal(
    flatten(tree.root.findByType("View").props.style).animationName,
    "none",
    "live system changes stop the loop"
  )
  await act(() => emitReducedMotion(false))
  assert.notEqual(
    flatten(tree.root.findByType("View").props.style).animationName,
    "none",
    "motion resumes when preference is restored"
  )
  await render(h(NativeThemeProvider, { reducedMotion: true }, h(Spinner.Root)))
  assert.equal(flatten(tree.root.findByType("View").props.style).animationName, "none")
  await render(h(Skeleton.Root))
  assert.equal(tree.root.findByType("View").props.importantForAccessibility, "no-hide-descendants")

  assert.equal(flatten(tree.root.findByType("View").props.style).animationDuration, 2000)
  assert.equal(
    flatten(tree.root.findByType("View").props.style).animationTimingFunction,
    "cubic-bezier(0.4, 0, 0.6, 1)",
    "the loading pulse uses shadcn's symmetric easing, not the control transition curve"
  )
  await render(h(NativeThemeProvider, { reducedMotion: true }, h(Skeleton.Root)))
  assert.equal(flatten(tree.root.findByType("View").props.style).animationName, "none")

  const { palettes, nativeColor, designTokens } = await import("@multicomma/arkcn-core/tokens")
  assert.equal(nativeColor([1, 0, 0]), "rgba(255, 255, 255, 1)")
  assert.equal(nativeColor([0, 0, 0]), "rgba(0, 0, 0, 1)")
  assert.equal(nativeColors.dark.card, nativeColor(palettes.dark.card))
  await render(h(Button, { variant: "destructive", size: "xs" }, "Delete"))
  const destructive = tree.root.findByType("Pressable")
  assert.equal(flatten(destructive.props.style).minHeight, designTokens.controlHeight.xs)
  assert.equal(flatten(tree.root.findByType("Text").props.style).color, nativeColors.light.destructive)
  assert.notEqual(flatten(destructive.props.style).backgroundColor, nativeColors.light.destructive)
  await render(
    h(
      NativeThemeProvider,
      { fonts: { regular: "Geist_400Regular", medium: "Geist_500Medium" } },
      h(Button, null, "Save")
    )
  )
  assert.equal(flatten(tree.root.findByType("Text").props.style).fontFamily, "Geist_500Medium")
  assert.equal(
    flatten(tree.root.findByType("Text").props.style).fontWeight,
    "400",
    "loaded font faces avoid synthetic weights"
  )

  const press = (id) => tree.root.findAllByType("Pressable").find((node) => node.props.testID === id)
  const click = async (id, event = { defaultPrevented: false }) => act(() => press(id).props.onPress(event))
  for (const Control of [Checkbox, Switch]) {
    const changes = []
    const control = (props) =>
      h(
        Control.Root,
        { testID: "selection", onCheckedChange: (details) => changes.push(details.checked), ...props },
        h(Control.Control),
        h(Control.Label, null, "Option")
      )
    await render(control({ defaultChecked: false }))
    await click("selection")
    assert.equal(press("selection").props.accessibilityState.checked, true)
    assert.equal(press("selection").props["aria-checked"], true, "React Native Web exposes checked state too")
    assert.deepEqual(changes, [true])
    await render(control({ checked: false }))
    await click("selection")
    assert.equal(press("selection").props.accessibilityState.checked, false, "controlled selection stays with caller")
    assert.deepEqual(changes, [true, true])
    await render(control({ checked: false, readOnly: true }))
    await click("selection")
    await render(control({ checked: false, disabled: true }))
    await click("selection")
    assert.equal(press("selection").props.accessibilityState.disabled, true)
    assert.deepEqual(changes, [true, true], "read-only and disabled controls never fire changes")
    await render(control({ checked: false }))
    await click("selection", { defaultPrevented: true })
    assert.equal(changes.length, 2, "caller can cancel a press")
  }
  await render(h(Checkbox.Root, { testID: "mixed", defaultChecked: "indeterminate" }, h(Checkbox.Control)))
  assert.equal(press("mixed").props.accessibilityState.checked, "mixed")
  assert.equal(press("mixed").props["aria-checked"], "mixed")
  assert.equal(press("mixed").props.hitSlop, 14)
  await click("mixed")
  assert.equal(press("mixed").props.accessibilityState.checked, true)

  await render(
    h(
      Switch.Root,
      { testID: "motion-switch", defaultChecked: false },
      h(Switch.Control, null, h(Switch.Thumb, { testID: "thumb" }))
    )
  )
  const thumb = () => tree.root.findAllByType("View").find((node) => node.props.testID === "thumb")
  assert.equal(flatten(thumb().props.style).transform[0].translateX, 0)
  await click("motion-switch")
  assert.equal(flatten(thumb().props.style).transform[0].translateX, 14)
  assert.equal(flatten(thumb().props.style).transitionDuration, 150)
  assert.equal(flatten(thumb().props.style).transitionTimingFunction, "cubic-bezier(0.4, 0, 0.2, 1)")
  await act(() => emitReducedMotion(true))
  assert.equal(flatten(thumb().props.style).transitionDuration, 0)
  await click("motion-switch")
  assert.equal(flatten(thumb().props.style).transform[0].translateX, 0, "reduced motion still updates selection")
  await act(() => emitReducedMotion(false))

  const radioChanges = []
  const radios = (props = {}) =>
    h(
      RadioGroup.Root,
      { defaultValue: "a", onValueChange: ({ value }) => radioChanges.push(value), ...props },
      h(RadioGroup.Item, { value: "a", testID: "a" }, "A"),
      h(RadioGroup.Item, { value: "b", testID: "b" }, "B"),
      h(RadioGroup.Item, { value: "c", testID: "c", disabled: true }, "C")
    )
  await render(radios())
  await click("b")
  assert.equal(press("a").props.accessibilityState.checked, false)
  assert.equal(press("b").props.accessibilityState.checked, true)
  await click("b")
  await click("c")
  assert.deepEqual(radioChanges, ["b"], "selecting the same or disabled radio does not emit changes")
  await render(radios({ value: "a" }))
  await click("b")
  assert.equal(press("a").props.accessibilityState.checked, true)
  assert.deepEqual(radioChanges, ["b", "b"])

  let mounts = 0
  function StatefulPanel() {
    React.useEffect(() => {
      mounts++
    }, [])
    return h("Text", null, "Panel")
  }
  const tabSet = (props = {}) =>
    h(
      Tabs.Root,
      { defaultValue: "a", ...props },
      h(
        Tabs.List,
        null,
        h(Tabs.Trigger, { value: "a", testID: "tab-a" }, "A"),
        h(Tabs.Trigger, { value: "b", testID: "tab-b" }, "B"),
        h(Tabs.Trigger, { value: "c", testID: "tab-c", disabled: true }, "C")
      ),
      h(Tabs.Content, { value: "a", testID: "panel-a" }, h(StatefulPanel)),
      h(Tabs.Content, { value: "b", testID: "panel-b" }, h("Text", null, "B panel"))
    )
  await render(tabSet({ unmountOnExit: false }))
  assert.equal(mounts, 1)
  assert.equal(
    tree.root.findAllByType("View").some((node) => node.props.testID === "panel-b"),
    false,
    "inactive tabs mount lazily"
  )
  await click("tab-b")
  const hidden = tree.root.findAllByType("View").find((node) => node.props.testID === "panel-a")
  assert.equal(flatten(hidden.props.style).display, "none")
  assert.equal(hidden.props.importantForAccessibility, "no-hide-descendants")
  assert.equal(press("tab-b").props.accessibilityState.selected, true)
  assert.equal(press("tab-b").props["aria-selected"], true)
  await click("tab-c")
  assert.equal(press("tab-b").props.accessibilityState.selected, true)
  await click("tab-a")
  assert.equal(mounts, 1, "preserved panels keep local state")
  await render(tabSet())
  await click("tab-b")
  assert.equal(
    tree.root.findAllByType("View").some((node) => node.props.testID === "panel-a"),
    false
  )
  await click("tab-a")
  assert.equal(mounts, 2, "default exit unmounts the inactive panel")
  await render(tabSet({ value: "a" }))
  await click("tab-b")
  assert.equal(press("tab-a").props.accessibilityState.selected, true)

  const disclosure = (props = {}) =>
    h(
      Collapsible.Root,
      props,
      h(Collapsible.Trigger, { testID: "disclosure" }, "Details"),
      h(Collapsible.Content, { testID: "details" }, h("Text", null, "Content"))
    )
  await render(disclosure({ unmountOnExit: false }))
  assert.equal(press("disclosure").props.accessibilityState.expanded, false)
  await click("disclosure")
  assert.equal(press("disclosure").props.accessibilityState.expanded, true)
  assert.equal(press("disclosure").props["aria-expanded"], true)
  await click("disclosure")
  assert.equal(
    flatten(tree.root.findAllByType("View").find((node) => node.props.testID === "details").props.style).display,
    "none"
  )
  await render(disclosure({ open: false }))
  await click("disclosure")
  assert.equal(press("disclosure").props.accessibilityState.expanded, false)
  await render(disclosure({ disabled: true }))
  await click("disclosure")
  assert.equal(press("disclosure").props.accessibilityState.disabled, true)

  const progress = (value) =>
    h(
      Progress.Root,
      { value, min: 10, max: 20 },
      h(Progress.ValueText),
      h(Progress.Track, null, h(Progress.Range, { testID: "range" }))
    )
  await render(progress(15))
  assert.deepEqual(tree.root.findAllByType("View")[0].props.accessibilityValue, { min: 10, max: 20, now: 15 })
  assert.equal(tree.root.findByType("Text").props.children, "50%")
  assert.equal(
    flatten(tree.root.findAllByType("View").find((node) => node.props.testID === "range").props.style).width,
    "50%"
  )
  await render(progress(100))
  assert.equal(tree.root.findAllByType("View")[0].props.accessibilityValue.now, 20)
  await render(progress(-10))
  assert.equal(tree.root.findAllByType("View")[0].props.accessibilityValue.now, 10)

  await render(
    h(Alert.Root, { variant: "destructive" }, h(Alert.Title, null, "Failed"), h(Alert.Description, null, "Try again"))
  )
  assert.equal(flatten(tree.root.findAllByType("Text")[0].props.style).color, nativeColors.light.destructive)
  assert.equal(tree.root.findByType("View").props.accessibilityRole, "alert")
  const avatar = (uri) => h(Avatar.Root, null, h(Avatar.Image, { source: { uri } }), h(Avatar.Fallback, null, "AR"))
  await render(avatar("first.png"))
  assert.equal(tree.root.findByType("Text").props.children, "AR")
  const firstLoad = tree.root.findByType("Image").props.onLoad
  await act(() => firstLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 0)
  await render(avatar("second.png"))
  await act(() => firstLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 1, "stale image requests cannot hide fallback")
  await render(avatar("first.png"))
  await act(() => firstLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 1, "returning to an earlier URL still starts a new request")
  await act(() => tree.root.findByType("Image").props.onLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 0)
  await act(() => tree.root.findByType("Image").props.onError({}))
  assert.equal(tree.root.findAllByType("Text").length, 1, "failed images restore fallback")

  let nextPressed
  await render(
    h(
      Toggle.Root,
      { onPressedChange: (value) => (nextPressed = value) },
      h(Toggle.Indicator, { fallback: h("Text", null, "Off") }, h("Text", null, "On"))
    )
  )
  let toggle = tree.root.findByType("Pressable")
  assert.equal(tree.root.findByType("Text").props.children, "Off")
  await act(() => toggle.props.onPress({ defaultPrevented: true }))
  assert.equal(nextPressed, undefined, "cancelled press does not change the toggle")
  await act(() => toggle.props.onPress({}))
  assert.equal(nextPressed, true, "Toggle callback matches Ark's boolean contract")
  assert.equal(tree.root.findByType("Text").props.children, "On")
  await render(h(Toggle.Root, { pressed: false, onPressedChange: (value) => (nextPressed = value) }, "Bold"))
  await act(() => tree.root.findByType("Pressable").props.onPress({}))
  assert.equal(
    tree.root.findByType("Pressable").props.accessibilityState.selected,
    false,
    "controlled toggles wait for their owner"
  )
  assert.equal(nextPressed, true)
  nextPressed = undefined
  await render(h(Toggle.Root, { disabled: true, onPressedChange: (value) => (nextPressed = value) }, "Bold"))
  await act(() => tree.root.findByType("Pressable").props.onPress({}))
  assert.equal(nextPressed, undefined)

  const group = (props) =>
    h(
      ToggleGroup.Root,
      { key: JSON.stringify(props), ...props },
      ...["a", "b", "c"].map((value) => h(ToggleGroup.Item, { value, key: value, disabled: value === "c" }, value))
    )
  await render(group({ defaultValue: ["a"], spacing: 0, variant: "outline" }))
  let groupButtons = tree.root.findAllByType("Pressable")
  assert.equal(flatten(groupButtons[0].props.style).borderTopLeftRadius, 10)
  assert.equal(flatten(groupButtons[1].props.style).borderLeftWidth, 0)
  assert.equal(flatten(groupButtons[2].props.style).borderTopRightRadius, 10)
  await act(() => groupButtons[1].props.onPress({}))
  assert.deepEqual(
    tree.root
      .findAllByType("Pressable")
      .map((item) => item.props.accessibilityState.checked ?? item.props.accessibilityState.selected),
    [false, true, false]
  )
  await act(() => groupButtons[2].props.onPress({}))
  assert.deepEqual(
    tree.root
      .findAllByType("Pressable")
      .map((item) => item.props.accessibilityState.checked ?? item.props.accessibilityState.selected),
    [false, true, false]
  )
  await render(group({ defaultValue: ["a"], multiple: true, deselectable: false }))
  groupButtons = tree.root.findAllByType("Pressable")
  await act(() => groupButtons[1].props.onPress({}))
  await act(() => groupButtons[0].props.onPress({}))
  assert.deepEqual(
    tree.root
      .findAllByType("Pressable")
      .map((item) => item.props.accessibilityState.checked ?? item.props.accessibilityState.selected),
    [false, true, false],
    "multiple groups can deselect even with deselectable=false, matching Ark"
  )
  await render(group({ defaultValue: ["a"], deselectable: false }))
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.equal(tree.root.findAllByType("Pressable")[0].props.accessibilityState.checked, true)

  const accordion = (props, reduced = false) =>
    h(
      NativeThemeProvider,
      { reducedMotion: reduced },
      h(
        Accordion.Root,
        { key: JSON.stringify(props), ...props },
        ...["a", "b"].map((value) =>
          h(
            Accordion.Item,
            { value, key: value },
            h(Accordion.ItemTrigger, null, value),
            h(Accordion.ItemContent, { testID: `accordion-${value}` }, h("Text", null, `Panel ${value}`))
          )
        )
      )
    )
  await render(accordion({ defaultValue: ["a"], collapsible: true }))
  const panel = () => tree.root.findAllByType("View").find((view) => view.props.testID === "accordion-a")
  const measure = tree.root.findAllByType("View").find((view) => view.props.onLayout)
  await act(() => measure.props.onLayout({ nativeEvent: { layout: { height: 70 } } }))
  assert.equal(flatten(panel().props.style).height, 70)
  assert.ok(
    timingCalls.some(
      (call) =>
        call.value === 70 && call.config.duration === 200 && call.config.easing === "cubic-bezier(0, 0, 0.58, 1)"
    )
  )
  assert.equal(tree.root.findAllByType("Pressable")[0].props.accessibilityState.expanded, true)
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.equal(panel().props.accessibilityElementsHidden, true)
  assert.equal(flatten(panel().props.style).height, 0)
  assert.ok(panel(), "content stays mounted during the close animation")
  await act(async () => new Promise((resolve) => setTimeout(resolve, 220)))
  assert.equal(panel(), undefined, "content unmounts after the exit animation")
  await render(accordion({ defaultValue: ["a"], collapsible: false }, true))
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.equal(tree.root.findAllByType("Pressable")[0].props.accessibilityState.expanded, true)
  await act(() => tree.root.findAllByType("Pressable")[1].props.onPress({}))
  assert.deepEqual(
    tree.root.findAllByType("Pressable").map((item) => item.props.accessibilityState.expanded),
    [false, true]
  )
  assert.equal(panel(), undefined, "reduced motion removes the exit delay")
  await render(accordion({ defaultValue: ["a"], multiple: true, unmountOnExit: false }, true))
  await act(() => tree.root.findAllByType("Pressable")[1].props.onPress({}))
  assert.deepEqual(
    tree.root.findAllByType("Pressable").map((item) => item.props.accessibilityState.expanded),
    [true, true]
  )
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.ok(panel(), "retained panels preserve content when closed")

  await render(
    h(
      Progress.Root,
      { value: null },
      h(Progress.Track, null, h(Progress.Range, { testID: "unknown" })),
      h(Progress.ValueText),
      h(Progress.View, { state: "indeterminate", testID: "loading-state" }),
      h(Progress.View, { state: "complete", testID: "complete-state" })
    )
  )
  const progressRoot = tree.root.findAllByType("View").find((view) => view.props.accessibilityRole === "progressbar")
  assert.equal(progressRoot.props.accessibilityValue.now, undefined)
  assert.equal(progressRoot.props.accessibilityState.busy, true)
  assert.equal(tree.root.findByType("Text").props.children, "loading...")
  assert.ok(tree.root.findAllByType("View").some((view) => view.props.testID === "loading-state"))
  assert.ok(!tree.root.findAllByType("View").some((view) => view.props.testID === "complete-state"))
  const unknown = flatten(tree.root.findAllByType("View").find((view) => view.props.testID === "unknown").props.style)
  assert.equal(unknown.width, "33.333333%")
  assert.equal(unknown.animationDuration, 2000)
  await render(
    h(Progress.Root, { value: 25 }, h(Progress.Circle, null, h(Progress.CircleTrack), h(Progress.CircleRange)))
  )
  const circles = tree.root.findAllByType("Circle")
  assert.equal(circles[0].props.r, 18.5)
  assert.equal(circles[1].props.transform, "rotate(-90 20 20)")
  assert.equal(circles[1].props.animatedProps.strokeDashoffset, 2 * 3.14159 * 18.5 * 0.75)

  await render(
    h(
      Avatar.Group,
      null,
      h(Avatar.Root, { size: "lg" }, h(Avatar.Fallback, null, "AM")),
      h(
        Avatar.Root,
        { size: "sm" },
        h(Avatar.Fallback, null, "DR"),
        h(Avatar.Badge, { testID: "small-badge" }, h("Icon"))
      ),
      h(Avatar.GroupCount, { testID: "group-count" }, "+3")
    )
  )
  const views = tree.root.findAllByType("View")
  assert.equal(flatten(views.find((view) => view.props.testID === "group-count").props.style).width, 24)
  assert.equal(flatten(views.find((view) => view.props.testID === "group-count").props.style).marginLeft, -8)
  assert.equal(flatten(views.find((view) => view.props.testID === "small-badge").props.style).width, 8)
  assert.equal(tree.root.findAllByType("Icon").length, 0, "small avatar badges hide their icon")
  let liftedBadge = tree.root.findAllByType("View").find((view) => view.props.testID === "small-badge")
  assert.equal(flatten(liftedBadge.parent.parent.props.style).zIndex, 10, "group badges render above following avatars")
  const avatarMeasure = tree.root.findAllByType("View").find((view) => view.props.onLayout)
  await act(() => avatarMeasure.props.onLayout({ nativeEvent: { layout: { x: 33, y: 2, width: 24, height: 24 } } }))
  liftedBadge = tree.root.findAllByType("View").find((view) => view.props.testID === "small-badge")
  assert.equal(flatten(liftedBadge.parent.parent.props.style).left, 33, "lifted badges follow actual avatar layout")

  let groupFocus = 0
  const groupInputRef = { current: null }
  const groupExample = (invalid = false, disabled = false, showInput = true) =>
    h(
      InputGroup.Root,
      { testID: "input-group" },
      h(InputGroup.Addon, { testID: "addon" }, "Prefix"),
      showInput && h(InputGroup.Input, { ref: groupInputRef, invalid, disabled, accessibilityLabel: "Grouped input" }),
      h(InputGroup.Addon, { align: "inline-end" }, h(InputGroup.Trigger, { testID: "action" }, "Go"))
    )
  await render(groupExample())
  const groupRoot = () => tree.root.findAllByType("View").find((node) => node.props.testID === "input-group")
  const groupedInput = () => tree.root.findByType("TextInput")
  await act(() => groupedInput().props.ref({ focus: () => groupFocus++ }))
  assert.equal(typeof groupInputRef.current.focus, "function", "group controls forward their native input ref")
  await act(() =>
    tree.root
      .findAllByType("Pressable")
      .find((node) => node.props.testID === "addon")
      .props.onPress({})
  )
  assert.equal(groupFocus, 1, "addon activation focuses the associated input")
  await act(() => groupedInput().props.onFocus({}))
  assert.match(flatten(groupRoot().props.style).boxShadow, /3px/, "focus outline belongs to the whole group")
  assert.equal(flatten(groupedInput().props.style).boxShadow, "none", "inner controls suppress their own focus ring")
  assert.deepEqual(
    groupedInput().props.style[0].transitionProperty,
    ["borderColor", "backgroundColor"],
    "input focus rings appear immediately while colors transition"
  )
  await act(() => groupedInput().props.onBlur({}))
  assert.equal(flatten(groupRoot().props.style).boxShadow, "none")
  await render(groupExample(true, true))
  assert.equal(flatten(groupRoot().props.style).borderColor, nativeColors.light.destructive)
  assert.equal(flatten(groupRoot().props.style).opacity, 0.5)
  assert.equal(flatten(groupedInput().props.style).opacity, 1, "disabled opacity applies once to the shared group")
  assert.equal(groupedInput().props.editable, false)
  await act(() =>
    tree.root
      .findAllByType("Pressable")
      .find((node) => node.props.testID === "addon")
      .props.onPress({})
  )
  assert.equal(groupFocus, 1, "disabled controls cannot be focused by their addon")
  let stopped = 0
  await act(() =>
    tree.root
      .findAllByType("Pressable")
      .find((node) => node.props.testID === "action")
      .props.onPress({ stopPropagation: () => stopped++ })
  )
  assert.equal(stopped, 1, "actions do not bubble into addon input activation")
  await render(groupExample(false, false, false))
  assert.equal(flatten(groupRoot().props.style).opacity, 1, "unmounted controls clear disabled registration")
  assert.equal(flatten(groupRoot().props.style).boxShadow, "none", "unmounted controls clear validation registration")

  let joinedPresses = 0
  await render(
    h(
      ButtonGroup.Root,
      null,
      h(Button, { testID: "first", variant: "outline" }, "First"),
      h(
        Button,
        { testID: "last", onPress: () => joinedPresses++, style: ({ pressed }) => ({ marginTop: pressed ? 2 : 0 }) },
        "Last"
      )
    )
  )
  const lastJoined = tree.root.findAllByType("Pressable").find((node) => node.props.testID === "last")
  assert.equal(flatten(lastJoined.props.style).borderLeftWidth, 0)
  assert.equal(
    flatten(lastJoined.findByType("View").props.style).borderTopLeftRadius,
    0,
    "joined backgrounds follow squared corners"
  )
  await act(() => lastJoined.props.onPressIn({}))
  assert.equal(flatten(lastJoined.props.style).marginTop, 2, "group composition retains press style callbacks")
  await act(() => lastJoined.props.onPress({}))
  assert.equal(joinedPresses, 1)

  let labelFocus = 0
  const labelRef = { current: { focus: () => labelFocus++ } }
  await render(h(Label.Root, { controlRef: labelRef }, "Name"))
  await act(() => tree.root.findByType("Text").props.onPress({}))
  assert.equal(labelFocus, 1)
  await render(h(Label.Root, { controlRef: labelRef, disabled: true }, "Name"))
  await act(() => tree.root.findByType("Text").props.onPress({}))
  assert.equal(labelFocus, 1, "disabled labels cannot activate their controls")
  await render(
    h(
      Label.Root,
      {
        controlRef: labelRef,
        onPress: (event) => {
          event.defaultPrevented = true
        },
      },
      "Name"
    )
  )
  await act(() => tree.root.findByType("Text").props.onPress({}))
  assert.equal(labelFocus, 1, "label consumers can cancel default focus")

  let history
  function HistoryHarness() {
    const state = useHistory(0)
    React.useEffect(() => {
      history = state
    })
    return null
  }
  await render(h(HistoryHarness))
  await act(() => history.set(1))
  await act(() => history.undo())
  assert.equal(history.present, 0)
  await act(() => history.redo())
  assert.equal(history.present, 1)
  const rows = [
    {
      id: "row",
      items: [
        { id: "a", width: 1 },
        { id: "b", width: 1 },
      ],
    },
  ]
  const moved = applyRowDrop(
    rows,
    { source: { type: "node", id: "b" }, target: { type: "node", id: "a", edge: "top" } },
    { create: () => null, rowId: () => "new" }
  )
  assert.deepEqual(
    moved.map((row) => row.items.map((item) => item.id)),
    [["b"], ["a"]]
  )
  const resized = resizeRowItems(rows[0], 0, 0.1)
  assert.deepEqual(
    resized.items.map((item) => item.width),
    [1.2, 0.8]
  )
  assert.deepEqual(
    rows[0].items.map((item) => item.width),
    [1, 1]
  )
  // Form context propagates semantics without replacing the standalone input recipe.
  await render(h(Input.Root, {}))
  const baseInputStyle = flatten(tree.root.findByType("TextInput").props.style)
  assert.equal(baseInputStyle.fontSize, 14)
  await render(
    h(
      Field.Root,
      { required: true },
      h(Field.Label, null, "Email ", h(Field.RequiredIndicator)),
      h(Field.Input, { defaultValue: "alex@example.com" }),
      h(Field.HelperText, null, "Used for receipts")
    )
  )
  let fieldInput = tree.root.findByType("TextInput")
  assert.equal(fieldInput.props.accessibilityLabel, "Email ")
  assert.equal(fieldInput.props.accessibilityHint, "Required. Used for receipts")
  assert.deepEqual(flatten(fieldInput.props.style), baseInputStyle)
  let fieldFocus = 0
  fieldInput.props.ref({ focus: () => fieldFocus++ })
  const fieldLabel = tree.root.findAllByType("Text").find((node) => node.props.nativeID)
  await act(() => fieldLabel.props.onPress({}))
  assert.equal(fieldFocus, 1, "a field label focuses its associated input")
  await render(
    h(
      Field.Root,
      { invalid: true },
      h(Field.Label, null, "Email"),
      h(Field.Input),
      h(Field.ErrorText, { errors: [{ message: "Invalid email" }, { message: "Invalid email" }, undefined] })
    )
  )
  assert.equal(tree.root.findByProps({ accessibilityRole: "alert" }).props.children, "Invalid email")
  assert.equal(tree.root.findByType("TextInput").props.accessibilityHint, "Invalid email")
  await render(h(Field.Root, null, h(Field.Input), h(Field.ErrorText, null, "Hidden error")))
  assert.equal(tree.root.findAllByProps({ accessibilityRole: "alert" }).length, 0)
  await render(h(Field.Root, { readOnly: true }, h(Field.Textarea, { defaultValue: "Read only" })))
  assert.equal(tree.root.findByType("TextInput").props.editable, false)
  assert.equal(tree.root.findByType("TextInput").props.multiline, true)
  await render(
    h(
      Fieldset.Root,
      { disabled: true },
      h(Fieldset.Root, { disabled: false }, h(Field.Root, { disabled: false }, h(Field.Input)))
    )
  )
  assert.ok(tree.root.findAllByType("TextInput").every((node) => node.props.editable === false))
  await render(h(Fieldset.Root, { invalid: true }, h(Fieldset.ErrorText, null, "Review these fields")))
  assert.equal(tree.root.findByProps({ accessibilityRole: "alert" }).props.children, "Review these fields")

  // System appearance changes must update a mounted form without resetting its value.
  function ThemeForm() {
    const [value, setValue] = React.useState("")
    return h(
      Fieldset.Root,
      null,
      h(Fieldset.Legend, null, "Account"),
      h(Field.Root, null, h(Field.Label, null, "Email"), h(Field.Input, { value, onChangeText: setValue }))
    )
  }
  await render(h(ThemeForm))
  await act(() => tree.root.findByType("TextInput").props.onChangeText("alex@example.com"))
  for (const scheme of ["dark", "light", "dark"]) {
    await act(() => emitColorScheme(scheme))
    const themedInput = tree.root.findByType("TextInput")
    assert.equal(themedInput.props.value, "alex@example.com", "theme changes retain entered text")
    assert.equal(flatten(themedInput.props.style).color, nativeColors[scheme].foreground)
    assert.equal(flatten(themedInput.props.style).borderColor, nativeColors[scheme].input)
    assert.equal(themedInput.props.placeholderTextColor, nativeColors[scheme].mutedForeground)
    assert.equal(flatten(tree.root.findAllByType("Text")[0].props.style).color, nativeColors[scheme].foreground)
  }
  await render(h(NativeThemeProvider, { colorScheme: "light" }, h(ThemeForm)))
  assert.equal(flatten(tree.root.findByType("TextInput").props.style).color, nativeColors.light.foreground)
  await render(h(NativeThemeProvider, { colorScheme: "dark" }, h(ThemeForm)))
  await act(() => emitColorScheme("light"))
  assert.equal(
    flatten(tree.root.findByType("TextInput").props.style).color,
    nativeColors.dark.foreground,
    "an explicit dark theme takes precedence over system appearance"
  )

  const numberInput = () => tree.root.findByType("TextInput")
  const stepButton = (direction) =>
    tree.root.findByProps({ accessibilityLabel: `${direction} value`, accessibilityRole: "button" })
  const event = () => ({
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
  })
  let numberChanges = []
  await render(
    h(NumberInput.Root, {
      key: "decimal",
      defaultValue: "0.1",
      min: -1,
      max: 0.3,
      step: 0.1,
      onValueChange: (value) => numberChanges.push(value),
    })
  )
  await act(() => stepButton("Increase").props.onPress(event()))
  assert.equal(numberInput().props.value, "0.2")
  await act(() => stepButton("Increase").props.onPress(event()))
  assert.deepEqual(numberChanges.at(-1), { value: "0.3", valueAsNumber: 0.3 })
  assert.equal(stepButton("Increase").props.disabled, true)
  await act(() => stepButton("Increase").props.onPress(event()))
  assert.equal(numberChanges.length, 2, "stepping at the bound does not emit duplicate changes")
  await act(() => stepButton("Decrease").props.onPress(event()))
  assert.equal(numberInput().props.value, "0.2")
  await act(() => numberInput().props.onChangeText("-"))
  assert.equal(numberInput().props.value, "-", "partial signs remain editable")
  assert.ok(Number.isNaN(numberChanges.at(-1).valueAsNumber))
  await act(() => numberInput().props.onChangeText("-0,5"))
  assert.equal(numberChanges.at(-1).valueAsNumber, -0.5)
  await act(() => numberInput().props.onBlur(event()))
  assert.equal(numberInput().props.value, "-0.5")
  await act(() => numberInput().props.onChangeText("garbage"))
  assert.equal(numberInput().props.value, "-0.5", "nonnumeric paste is rejected")
  await act(() => numberInput().props.onChangeText("99"))
  assert.equal(numberInput().props.value, "99", "bounds do not interrupt typing")
  await act(() => numberInput().props.onBlur(event()))
  assert.equal(numberInput().props.value, "0.3", "blur clamps to the maximum")
  await act(() => numberInput().props.onChangeText("-99"))
  await act(() => numberInput().props.onSubmitEditing(event()))
  assert.equal(numberInput().props.value, "-1", "submit clamps to the minimum")
  await act(() => numberInput().props.onChangeText(""))
  await act(() => numberInput().props.onBlur(event()))
  assert.equal(numberInput().props.value, "", "clearing does not turn the value into zero")
  await act(() => stepButton("Increase").props.onPress(event()))
  assert.equal(numberInput().props.value, "0", "stepping an empty input starts at zero")
  await act(() => numberInput().props.onKeyPress({ ...event(), nativeEvent: { key: "ArrowDown" } }))
  assert.equal(numberInput().props.value, "-0.1")
  await act(() => numberInput().props.onAccessibilityAction({ ...event(), nativeEvent: { actionName: "increment" } }))
  assert.equal(numberInput().props.value, "0")

  numberChanges = []
  await render(
    h(NumberInput.Root, { key: "controlled-number", value: "4", onValueChange: (next) => numberChanges.push(next) })
  )
  await act(() => stepButton("Increase").props.onPress(event()))
  assert.equal(numberInput().props.value, "4", "controlled values remain owned by the caller")
  assert.deepEqual(numberChanges, [{ value: "5", valueAsNumber: 5 }])
  for (const state of [{ disabled: true }, { readOnly: true }]) {
    await render(h(NumberInput.Root, { key: "blocked-number", ...state, defaultValue: "2" }))
    assert.equal(numberInput().props.editable, false)
    assert.ok(tree.root.findAllByType("Pressable").every((button) => button.props.disabled))
    await act(() => numberInput().props.onChangeText("6"))
    await act(() => stepButton("Increase").props.onPress(event()))
    assert.equal(numberInput().props.value, "2")
  }
  await render(h(NumberInput.Root, { key: "unclamped-number", defaultValue: "20", max: 10, clampValueOnBlur: false }))
  await act(() => numberInput().props.onBlur(event()))
  assert.equal(numberInput().props.value, "20")
  await render(h(Fieldset.Root, { disabled: true }, h(NumberInput.Root, { disabled: false, defaultValue: "2" })))
  assert.equal(numberInput().props.editable, false, "disabled fieldsets disable number entry and stepping")
  assert.equal(stepButton("Increase").props.disabled, true)
  await render(
    h(
      NativeThemeProvider,
      { colorScheme: "dark", reducedMotion: true },
      h(NumberInput.Root, { min: 0, max: 10, defaultValue: "3" })
    )
  )
  assert.equal(numberInput().props.keyboardType, "decimal-pad")
  assert.equal(flatten(numberInput().props.style).color, nativeColors.dark.foreground)
  assert.deepEqual(numberInput().props.accessibilityValue, { text: "3", min: 0, max: 10, now: 3 })
  await act(() => numberInput().props.onFocus(event()))
  const numberControl = tree.root.findAllByType("View").find((node) => flatten(node.props.style).borderWidth === 1)
  assert.equal(flatten(numberControl.props.style).borderColor, nativeColors.dark.ring)
  assert.equal(flatten(numberControl.props.style).transitionDuration, 0)

  // Exercise repeat lifecycle deterministically, including release and disabling mid-press.
  const realInterval = globalThis.setInterval
  const realClearInterval = globalThis.clearInterval
  let repeat
  globalThis.setInterval = (callback) => {
    repeat = callback
    return 123
  }
  globalThis.clearInterval = (id) => {
    if (id === 123) repeat = undefined
  }
  try {
    await render(h(NumberInput.Root, { key: "repeat-number", defaultValue: "1" }))
    await act(() => stepButton("Increase").props.onPressIn(event()))
    await act(() => stepButton("Increase").props.onLongPress(event()))
    await act(() => repeat())
    assert.equal(numberInput().props.value, "3")
    await act(() => stepButton("Increase").props.onPressOut(event()))
    await act(() => stepButton("Increase").props.onPress(event()))
    assert.equal(numberInput().props.value, "3", "release after repeating does not add an extra step")
    assert.equal(repeat, undefined)
    await act(() => stepButton("Increase").props.onLongPress(event()))
    await render(h(NumberInput.Root, { key: "repeat-number", disabled: true }))
    assert.equal(repeat, undefined, "disabling cancels pending repeats")
    await render(h(NumberInput.Root, { key: "repeat-number" }))
    await act(() => stepButton("Increase").props.onLongPress(event()))
    await render(h("View"))
    assert.equal(repeat, undefined, "unmount cancels pending repeats")
  } finally {
    globalThis.setInterval = realInterval
    globalThis.clearInterval = realClearInterval
  }

  const stars = () => tree.root.findAllByType("Pressable")
  const ratingControl = () => tree.root.findByProps({ accessibilityRole: "adjustable" })
  const tap = (x) => ({ ...event(), nativeEvent: { locationX: x } })
  let ratingChanges = []
  let rating
  let ratingItem
  await render(
    h(
      RatingGroup.Root,
      { key: "half-rating", defaultValue: 3, allowHalf: true, onValueChange: (next) => ratingChanges.push(next.value) },
      h(RatingGroup.Label, null, "Rate this component"),
      h(
        RatingGroup.Control,
        null,
        h(RatingGroup.Context, null, (state) => {
          rating = state
          return state.items.map((index) =>
            h(
              RatingGroup.Item,
              { key: index, index },
              h(RatingGroup.ItemContext, null, (item) => {
                if (index === 4) ratingItem = item
                return null
              })
            )
          )
        })
      )
    )
  )
  assert.equal(stars().length, 5)
  assert.equal(ratingControl().props.accessibilityLabel, "Rate this component")
  assert.deepEqual(ratingControl().props.accessibilityValue, { min: 0, max: 5, now: 3, text: "3 of 5 stars" })
  await act(() => stars()[3].props.onPressIn(tap(5)))
  assert.equal(rating.value, 3, "press preview does not commit")
  assert.deepEqual(ratingItem, { index: 4, half: true, highlighted: true, checked: false })
  await act(() => stars()[3].props.onPressOut(tap(5)))
  assert.equal(ratingItem.highlighted, false, "cancelled presses restore selected stars")
  assert.deepEqual(ratingChanges, [])
  await act(() => stars()[3].props.onPress(tap(5)))
  assert.equal(rating.value, 3.5)
  assert.equal(ratingItem.checked, true)
  await act(() => stars()[3].props.onPress(tap(15)))
  assert.equal(rating.value, 4)
  await act(() => ratingControl().props.onAccessibilityAction({ ...event(), nativeEvent: { actionName: "decrement" } }))
  assert.equal(rating.value, 3.5)
  assert.deepEqual(ratingChanges, [3.5, 4, 3.5])
  await act(() => rating.setValue(20))
  assert.equal(rating.value, 5)
  await act(() => rating.increment())
  assert.equal(rating.value, 5)
  await act(() => rating.clearValue())
  assert.equal(rating.value, 0)
  await act(() => rating.decrement())
  assert.equal(rating.value, 0)

  await render(h(RatingGroup.Root, { key: "rtl-rating", allowHalf: true, dir: "rtl" }))
  await act(() => stars()[1].props.onPress(tap(15)))
  assert.equal(ratingControl().props.accessibilityValue.now, 1.5, "RTL uses the right half as the leading half")
  await act(() => stars()[1].props.onPress(tap(5)))
  assert.equal(ratingControl().props.accessibilityValue.now, 2)
  await render(h(RatingGroup.Root, { key: "whole-rating" }))
  await act(() => stars()[1].props.onPress(tap(5)))
  assert.equal(ratingControl().props.accessibilityValue.now, 2, "whole ratings ignore tap position")

  for (const state of [{ disabled: true }, { readOnly: true }]) {
    await render(h(RatingGroup.Root, { key: "blocked-rating", defaultValue: 3, ...state }))
    await act(() => stars()[0].props.onPress(tap(5)))
    await act(() =>
      ratingControl().props.onAccessibilityAction({ ...event(), nativeEvent: { actionName: "increment" } })
    )
    assert.equal(ratingControl().props.accessibilityValue.now, 3)
    assert.equal(ratingControl().props.accessibilityActions.length, 0)
    assert.ok(stars().every((star) => star.props.disabled))
  }
  await render(h(Fieldset.Root, { disabled: true }, h(RatingGroup.Root, { disabled: false })))
  assert.ok(stars().every((star) => star.props.disabled))
  ratingChanges = []
  await render(
    h(RatingGroup.Root, { key: "controlled-rating", value: 2, onValueChange: (next) => ratingChanges.push(next.value) })
  )
  await act(() => stars()[3].props.onPress(tap(15)))
  assert.equal(ratingControl().props.accessibilityValue.now, 2, "controlled rating remains owned by its caller")
  assert.deepEqual(ratingChanges, [4])
  timingCalls.length = 0
  await render(
    h(NativeThemeProvider, { colorScheme: "dark", reducedMotion: true }, h(RatingGroup.Root, { defaultValue: 2 }))
  )
  assert.ok(timingCalls.some((call) => call.value === nativeColors.dark.primary && call.config.duration === 0))
  const starPaths = tree.root.findAllByType("Path").filter((path) => path.props.animatedProps)
  assert.equal(starPaths.length, 5)
  assert.ok(
    starPaths.every((path) => path.props.animatedProps.fill !== "none"),
    "animated SVG fills must be valid colors for native Reanimated"
  )
  assert.equal(starPaths[4].props.animatedProps.fill, "transparent")
  Platform.OS = "web"
  await render(h(RatingGroup.Root, { key: "keyboard-rating", allowHalf: true, defaultValue: 2 }))
  await act(() => ratingControl().props.onKeyDown({ ...event(), nativeEvent: { key: "ArrowRight" } }))
  assert.equal(ratingControl().props["aria-valuenow"], 2.5)
  await act(() => ratingControl().props.onKeyDown({ ...event(), nativeEvent: { key: "Home" } }))
  assert.equal(ratingControl().props["aria-valuenow"], 0)
  await act(() =>
    stars()[1].props.onPress({
      ...event(),
      nativeEvent: { clientX: 105 },
      currentTarget: { getBoundingClientRect: () => ({ left: 100, width: 20 }) },
    })
  )
  assert.equal(
    ratingControl().props["aria-valuenow"],
    1.5,
    "browser clicks calculate the half from the press target, not a nested SVG path"
  )
  await act(() =>
    stars()[3].props.onPointerMove({
      ...event(),
      nativeEvent: { clientX: 115, pointerType: "mouse" },
      currentTarget: { getBoundingClientRect: () => ({ left: 100, width: 20 }) },
    })
  )
  assert.equal(ratingControl().props["aria-valuenow"], 1.5, "hover previews never change the committed rating")
  await act(() => ratingControl().props.onPointerLeave(event()))
  Platform.OS = "ios"

  {
    let editor
    const commits = [],
      reverts = [],
      edits = [],
      drafts = []
    const editableParts = () =>
      h(
        React.Fragment,
        null,
        h(Editable.Label, null, "Title"),
        h(Editable.Area, null, h(Editable.Input), h(Editable.Preview)),
        h(
          Editable.Control,
          null,
          h(Editable.EditTrigger, null, "Edit"),
          h(Editable.SubmitTrigger, null, "Save"),
          h(Editable.CancelTrigger, null, "Cancel")
        ),
        h(Editable.Context, null, (state) => {
          editor = state
          return null
        })
      )
    const input = () => tree.root.findByType("TextInput")
    await render(
      h(
        Editable.Root,
        {
          defaultValue: "Original",
          onValueCommit: (d) => commits.push(d.value),
          onValueRevert: (d) => reverts.push(d.value),
          onEditChange: (d) => edits.push(d.edit),
          onValueChange: (d) => drafts.push(d.value),
        },
        editableParts()
      )
    )
    assert.equal(tree.root.findAllByType("TextInput").length, 0)
    const previewButton = () => tree.root.findAllByType("Pressable").find((n) => n.props.accessibilityLabel === "Title")
    await act(() => previewButton().props.onPressIn(event()))
    await act(() => previewButton().props.onPress(event()))
    assert.equal(input().props.accessibilityLabel, "Title")
    assert.equal(input().props.selectTextOnFocus, true)
    assert.equal(flatten(input().props.style).fontSize, 14)
    await act(() => input().props.onChangeText("Draft"))
    assert.equal(editor.value, "Draft")
    await act(() => editor.cancel())
    assert.equal(editor.value, "Original")
    assert.deepEqual(reverts, ["Original"])
    assert.equal(
      flatten(previewButton().props.style).backgroundColor,
      "transparent",
      "editing must clear the preview press state even without press-out"
    )
    assert.deepEqual(commits, [])
    await act(() => editor.edit())
    await act(() => input().props.onChangeText("Saved"))
    await act(() => input().props.onSubmitEditing(event()))
    assert.equal(editor.editing, false)
    assert.deepEqual(commits, ["Saved"])
    await act(() => editor.edit())
    await act(() => input().props.onChangeText("Escape me"))
    await act(() => input().props.onKeyPress({ ...event(), nativeEvent: { key: "Escape" } }))
    assert.equal(editor.value, "Saved", "cancel snapshots the latest committed session")
    await act(() => editor.edit())
    await act(() => input().props.onChangeText("Blur saved"))
    await act(async () => {
      input().props.onBlur(event())
      await new Promise((r) => setTimeout(r, 5))
    })
    assert.equal(editor.editing, false)
    assert.deepEqual(commits, ["Saved", "Blur saved"])
    await act(() => editor.edit())
    await act(() => input().props.onChangeText("Do not save"))
    const cancelButton = () => tree.root.findAllByType("Pressable").find((n) => n.props.accessibilityLabel === "Cancel")
    await act(async () => {
      cancelButton().props.onPressIn(event())
      input().props.onBlur(event())
      await new Promise((r) => setTimeout(r, 5))
    })
    assert.equal(editor.editing, true, "pressing Cancel takes priority over blur")
    await act(() => cancelButton().props.onPress(event()))
    assert.equal(editor.value, "Blur saved")
    assert.deepEqual(commits, ["Saved", "Blur saved"])
    assert.ok(drafts.includes("Draft"))
    assert.ok(edits.includes(true) && edits.includes(false))
    for (const mode of ["enter", "none"]) {
      await render(h(Editable.Root, { key: mode, defaultEdit: true, submitMode: mode }, editableParts()))
      await act(async () => {
        input().props.onBlur(event())
        await new Promise((r) => setTimeout(r, 5))
      })
      assert.equal(editor.editing, true)
      if (mode === "none") {
        await act(() => input().props.onSubmitEditing(event()))
        assert.equal(editor.editing, true)
      }
    }
    for (const blocked of [{ disabled: true }, { readOnly: true }]) {
      await render(h(Editable.Root, { key: "blocked", ...blocked }, editableParts()))
      await act(() => {
        editor.edit()
        editor.setValue("Blocked")
      })
      assert.equal(editor.editing, false)
      assert.equal(editor.value, "")
    }
    await render(h(Fieldset.Root, { disabled: true }, h(Editable.Root, null, editableParts())))
    await act(() => editor.edit())
    assert.equal(editor.editing, false)
    let controlledText, controlledEdit
    await render(
      h(
        Editable.Root,
        {
          key: "controlled",
          value: "Owned",
          edit: false,
          onValueChange: (d) => {
            controlledText = d.value
          },
          onEditChange: (d) => {
            controlledEdit = d.edit
          },
        },
        editableParts()
      )
    )
    await act(() => {
      editor.setValue("Requested")
      editor.edit()
    })
    assert.equal(controlledText, "Requested")
    assert.equal(controlledEdit, true)
    assert.equal(editor.value, "Owned")
    assert.equal(editor.editing, false)
    await render(
      h(
        NativeThemeProvider,
        { colorScheme: "dark", reducedMotion: true },
        h(Editable.Root, { defaultValue: "Dark" }, editableParts())
      )
    )
    const preview = tree.root.findAllByType("Pressable").find((n) => n.props.accessibilityLabel === "Title")
    assert.equal(flatten(preview.findByType("Text").props.style).color, nativeColors.dark.foreground)
    assert.equal(flatten(preview.props.style).transitionDuration, 0)
  }
  {
    let api
    const observe = h(Pagination.Context, null, (value) => {
      api = value
      return null
    })
    const parts = () =>
      h(
        React.Fragment,
        null,
        observe,
        h(Pagination.FirstTrigger),
        h(Pagination.PrevTrigger),
        h(Pagination.Context, null, (value) =>
          value.pages.map((item, index) =>
            item.type === "page"
              ? h(Pagination.Item, { key: item.value, ...item })
              : h(Pagination.Ellipsis, { key: `ellipsis-${index}`, index })
          )
        ),
        h(Pagination.NextTrigger),
        h(Pagination.LastTrigger)
      )
    const labels = () => api.pages.map((item) => (item.type === "page" ? item.value : "…"))
    const trigger = (name) =>
      tree.root.findAllByType("Pressable").find((node) => node.props.accessibilityLabel === name)
    let changes = []
    await render(
      h(Pagination.Root, { key: "pages", count: 100, defaultPage: 2, onPageChange: (d) => changes.push(d) }, parts())
    )
    assert.deepEqual(labels(), [1, 2, 3, 4, 5, "…", 10])
    await act(() => trigger("Go to last page").props.onPress(event()))
    assert.equal(api.page, 10)
    assert.deepEqual(labels(), [1, "…", 6, 7, 8, 9, 10])
    assert.equal(trigger("Go to next page").props.disabled, true)
    await act(() => trigger("Go to next page").props.onPress(event()))
    assert.equal(changes.length, 1, "disabled triggers cannot request navigation")
    await act(() => api.setPage(5))
    assert.deepEqual(labels(), [1, "…", 4, 5, 6, "…", 10])
    assert.deepEqual(api.pageRange, { start: 40, end: 50 })
    assert.deepEqual(
      api.slice(Array.from({ length: 100 }, (_, i) => i)),
      Array.from({ length: 10 }, (_, i) => 40 + i)
    )
    await act(() => trigger("Page 6 of 10").props.onPress(event()))
    assert.equal(api.page, 6)
    assert.equal(trigger("Page 6 of 10").props.accessibilityState.selected, true)
    await act(() => trigger("Go to previous page").props.onPress(event()))
    assert.equal(api.page, 5)
    await act(() => trigger("Go to first page").props.onPress(event()))
    assert.equal(api.page, 1)
    assert.equal(trigger("Go to previous page").props.disabled, true)
    for (const value of [0, -1, 11, NaN, Infinity, 1.5]) await act(() => api.setPage(value))
    assert.equal(api.page, 1)
    await act(() => api.setPage(10))
    await render(h(Pagination.Root, { key: "pages", count: 23 }, parts()))
    assert.equal(api.page, 3)
    assert.deepEqual(api.pageRange, { start: 20, end: 23 })
    await render(h(Pagination.Root, { key: "pages", count: 100 }, parts()))
    assert.equal(api.page, 3, "shrinking data permanently clamps uncontrolled page")
    await act(() => api.setPageSize(50))
    assert.equal(api.page, 2)
    assert.equal(api.totalPages, 2)
    await render(h(Pagination.Root, { key: "empty", count: 0 }, parts()))
    assert.deepEqual(labels(), [])
    assert.deepEqual(api.pageRange, { start: 0, end: 0 })
    assert.deepEqual(api.slice([1, 2]), [])
    assert.ok(tree.root.findAllByType("Pressable").every((node) => node.props.disabled))
    for (const count of [1, 6, 50, 100]) {
      for (const boundaryCount of [0, 1, 2]) {
        for (const siblingCount of [0, 1, 2]) {
          for (const page of [1, Math.ceil(count / 2), count]) {
            await render(h(Pagination.Root, { count, pageSize: 1, page, boundaryCount, siblingCount }, observe))
            const numbers = api.pages.filter((item) => item.type === "page").map((item) => item.value)
            assert.ok(numbers.includes(page), "current page always visible")
            assert.deepEqual(
              numbers,
              [...new Set(numbers)].sort((a, b) => a - b)
            )
            assert.ok(numbers.every((n) => n >= 1 && n <= count))
            assert.ok(!labels().some((n, i, all) => n === "…" && all[i + 1] === "…"))
          }
        }
      }
    }
    let requestedPage, requestedSize
    await render(
      h(
        Pagination.Root,
        {
          key: "controlled",
          count: 100,
          page: 2,
          pageSize: 10,
          onPageChange: (d) => {
            requestedPage = d
          },
          onPageSizeChange: (d) => {
            requestedSize = d
          },
        },
        parts()
      )
    )
    await act(() => api.goToNextPage())
    await act(() => api.setPageSize(20))
    assert.deepEqual(requestedPage, { page: 3, pageSize: 10 })
    assert.deepEqual(requestedSize, { pageSize: 20 })
    assert.equal(api.page, 2)
    assert.equal(api.pageSize, 10)
    await render(h(Fieldset.Root, { disabled: true }, h(Pagination.Root, { count: 100 }, parts())))
    await act(() => {
      api.setPage(2)
      api.setPageSize(20)
    })
    assert.equal(api.page, 1)
    assert.equal(api.pageSize, 10)
    assert.ok(tree.root.findAllByType("Pressable").every((node) => node.props.disabled))
    await render(
      h(Pagination.Root, { count: 100 }, observe, h(Pagination.Item, { value: 2, onPress: (e) => e.preventDefault() }))
    )
    await act(() => trigger("Page 2 of 10").props.onPress(event()))
    assert.equal(api.page, 1, "consumer can cancel a page action")
    function HookExample() {
      const state = usePagination({
        count: 10,
        defaultPageSize: 1,
        dir: "rtl",
        translations: { nextTriggerLabel: "التالي" },
      })
      return h(Pagination.RootProvider, { value: state }, parts())
    }
    await render(h(NativeThemeProvider, { colorScheme: "dark", reducedMotion: true }, h(HookExample)))
    const next = trigger("التالي")
    assert.equal(next.findByType("Text").props.children, "‹")
    assert.equal(flatten(next.props.style).transitionDuration, 0)
    assert.equal(flatten(next.findByType("Text").props.style).color, nativeColors.dark.foreground)
    await render(h(Pagination.Previous))
    assert.equal(
      tree.root.findByType("Text").props.children,
      "Previous",
      "static navigation labels render within native Text"
    )
    await render(h(Pagination.Next))
    assert.equal(tree.root.findByType("Text").props.children, "Next")
  }
  {
    let api, itemState
    const observe = h(SegmentGroup.Context, null, (value) => {
      api = value
      return null
    })
    const parts = (hideWeek = false) =>
      h(
        React.Fragment,
        null,
        observe,
        h(SegmentGroup.Indicator, { testID: "segment-indicator" }),
        h(SegmentGroup.Item, { value: "day", testID: "day" }, "Day"),
        !hideWeek &&
          h(
            SegmentGroup.Item,
            { value: "week", testID: "week" },
            h(SegmentGroup.ItemText, null, "Week"),
            h(SegmentGroup.ItemContext, null, (v) => {
              itemState = v
              return null
            })
          ),
        h(SegmentGroup.Item, { value: "month", disabled: true, testID: "month" }, "Month")
      )
    const item = (value) => tree.root.findAllByType("Pressable").find((node) => node.props.testID === value)
    const indicator = () => tree.root.findAllByType("View").find((node) => node.props.testID === "segment-indicator")
    const layout = (x, y, width, height) => ({ nativeEvent: { layout: { x, y, width, height } } })
    let changes = []
    await render(
      h(
        SegmentGroup.Root,
        { key: "segments", defaultValue: "week", onValueChange: (d) => changes.push(d.value) },
        parts()
      )
    )
    assert.equal(indicator(), undefined, "indicator waits for its selected item's measurement")
    await act(() => item("day").props.onLayout(layout(3, 3.5, 40, 25)))
    assert.equal(indicator(), undefined)
    await act(() => item("week").props.onLayout(layout(43, 3.5, 50.5, 25)))
    assert.deepEqual(flatten(indicator().props.style).transform, [{ translateX: 43 }, { translateY: 3.5 }])
    assert.equal(flatten(indicator().props.style).width, 50.5, "fractional bounds are retained")
    assert.equal(flatten(indicator().props.style).transitionDuration, 150)
    assert.equal(item("week").props.accessibilityState.checked, true)
    await act(() => item("week").props.onPress(event()))
    assert.deepEqual(changes, [], "selected segment cannot deselect itself")
    await act(() => item("day").props.onPress(event()))
    assert.equal(api.value, "day")
    assert.equal(itemState.checked, false)
    assert.deepEqual(changes, ["day"])
    assert.deepEqual(flatten(indicator().props.style).transform, [{ translateX: 3 }, { translateY: 3.5 }])
    await act(() => item("month").props.onPress(event()))
    assert.equal(api.value, "day", "disabled items cannot select")
    await act(() => item("day").props.onLayout(layout(3, 3.5, 70, 25)))
    assert.equal(flatten(indicator().props.style).width, 70, "selected indicator follows resized labels")
    await act(() => api.setValue("week"))
    await render(h(SegmentGroup.Root, { key: "segments" }, parts(true)))
    assert.equal(indicator(), undefined, "removed items cannot leave a stale indicator")
    await render(h(SegmentGroup.Root, { key: "segments" }, parts()))
    assert.equal(indicator(), undefined, "remount waits for a fresh measurement")
    await act(() => item("week").props.onLayout(layout(3, 29, 90, 26)))
    assert.equal(flatten(indicator().props.style).height, 26)
    await act(() => api.clearValue())
    assert.equal(api.value, null)
    assert.equal(indicator(), undefined)
    let requested
    await render(
      h(
        SegmentGroup.Root,
        {
          key: "owned",
          value: "week",
          onValueChange: (d) => {
            requested = d.value
          },
        },
        parts()
      )
    )
    await act(() => item("day").props.onPress(event()))
    assert.equal(requested, "day")
    assert.equal(api.value, "week")
    for (const blocked of [{ disabled: true }, { readOnly: true }]) {
      await render(h(SegmentGroup.Root, { key: "blocked", defaultValue: "week", ...blocked }, parts()))
      await act(() => {
        item("day").props.onPress(event())
        api.clearValue()
      })
      assert.equal(api.value, "week")
    }
    await render(h(Fieldset.Root, { disabled: true }, h(SegmentGroup.Root, { defaultValue: "week" }, parts())))
    await act(() => api.setValue("day"))
    assert.equal(api.value, "week")
    assert.equal(item("day").props.accessibilityState.disabled, true)
    await render(
      h(
        SegmentGroup.Root,
        { key: "cancelled", defaultValue: "week" },
        observe,
        h(SegmentGroup.Item, { value: "day", testID: "day", onPress: (e) => e.preventDefault() }, "Day")
      )
    )
    await act(() => item("day").props.onPress(event()))
    assert.equal(api.value, "week")
    function HookExample({ orientation = "horizontal" }) {
      const state = useSegmentGroup({ defaultValue: "week", orientation, dir: "rtl" })
      return h(SegmentGroup.RootProvider, { value: state, testID: "segments" }, parts())
    }
    await render(h(NativeThemeProvider, { colorScheme: "dark", reducedMotion: true }, h(HookExample)))
    await act(() => item("week").props.onLayout(layout(40, 3.5, 50, 25)))
    const root = tree.root.findAllByType("View").find((node) => node.props.testID === "segments")
    assert.equal(flatten(root.props.style).flexDirection, "row-reverse")
    assert.equal(flatten(indicator().props.style).transitionDuration, 0)
    assert.equal(flatten(indicator().props.style).borderColor, nativeColors.dark.input)
    assert.equal(flatten(item("week").findByType("Text").props.style).color, nativeColors.dark.foreground)
    assert.equal(flatten(item("day").findByType("Text").props.style).color, nativeColors.dark.mutedForeground)
    await act(() => item("day").props.onHoverIn(event()))
    assert.equal(flatten(item("day").findByType("Text").props.style).color, nativeColors.dark.foreground)
    await render(
      h(NativeThemeProvider, { colorScheme: "dark", reducedMotion: true }, h(HookExample, { orientation: "vertical" }))
    )
    assert.equal(
      flatten(tree.root.findAllByType("View").find((node) => node.props.testID === "segments").props.style)
        .flexDirection,
      "column"
    )
    assert.equal(flatten(item("day").props.style).justifyContent, "flex-start")
    assert.equal(
      flatten(item("day").props.style).flexGrow,
      0,
      "intrinsic native segments must not consume the parent scroll height"
    )
  }
  {
    let activations = 0
    await render(
      h(
        Breadcrumb.Root,
        null,
        h(
          Breadcrumb.List,
          null,
          h(Breadcrumb.Item, null, h(Breadcrumb.Link, { onPress: () => activations++ }, "Home")),
          h(Breadcrumb.Separator, { testID: "separator" }),
          h(Breadcrumb.Item, null, h(Breadcrumb.Page, null, "Components"))
        )
      )
    )
    const link = tree.root.findByType("Pressable")
    assert.equal(link.props.accessibilityRole, "link")
    assert.equal(flatten(link.findByType("Text").props.style).fontSize, 14)
    await act(() => link.props.onPress(event()))
    assert.equal(activations, 1)
    const page = tree.root.findAllByType("Text").find((node) => node.props.children === "Components")
    assert.deepEqual(page.props.accessibilityState, { disabled: true, selected: true })
    assert.equal(page.props.accessibilityHint, "Current page")
    const separator = tree.root.findAllByType("View").find((node) => node.props.testID === "separator")
    assert.equal(separator.props.accessibilityElementsHidden, true)
    await render(h(Breadcrumb.Link, { disabled: true, onPress: () => activations++ }, "Disabled"))
    await act(() => tree.root.findByType("Pressable").props.onPress(event()))
    assert.equal(activations, 1)
    await render(h(Breadcrumb.Link, { accessibilityLabel: "More ancestors" }, h(Breadcrumb.Ellipsis)))
    assert.equal(tree.root.findByType("Pressable").props.accessibilityLabel, "More ancestors")
    assert.equal(tree.root.findByType("View").props.accessibilityElementsHidden, true)
    await render(h(Breadcrumb.Separator, null, "/"))
    assert.equal(tree.root.findByType("Text").props.children, "/", "custom separators remain valid native text")
    await render(
      h(
        NativeThemeProvider,
        { colorScheme: "dark", reducedMotion: true },
        h(
          Breadcrumb.Root,
          { dir: "rtl" },
          h(
            Breadcrumb.List,
            { testID: "path" },
            h(Breadcrumb.Item, null, h(Breadcrumb.Link, null, "Home")),
            h(Breadcrumb.Separator)
          )
        )
      )
    )
    const path = tree.root.findAllByType("View").find((node) => node.props.testID === "path")
    assert.equal(flatten(path.props.style).flexDirection, "row-reverse")
    assert.equal(flatten(path.props.style).flexWrap, "wrap")
    const text = tree.root.findByType("Text")
    assert.equal(flatten(text.props.style).color, nativeColors.dark.mutedForeground)
    assert.equal(flatten(text.props.style).transitionDuration, 0)
    await act(() => tree.root.findByType("Pressable").props.onPressIn(event()))
    assert.equal(flatten(text.props.style).color, nativeColors.dark.foreground)
    await act(() => tree.root.findByType("Pressable").props.onPressOut(event()))
    assert.equal(flatten(text.props.style).color, nativeColors.dark.mutedForeground)
  }
  {
    let callbacks = 0
    const description = (text = "A description that wraps", style) =>
      h(Empty.Header, null, h(Empty.Description, { style, onTextLayout: () => callbacks++ }, text))
    await render(description())
    const layout = (width) => tree.root.findByType("View").props.onLayout({ nativeEvent: { layout: { width } } })
    await act(() => layout(300))
    const textNode = () => tree.root.findByType("Text")
    const width = () => flatten(textNode().props.style).width
    // Simulate native word wrapping: below 180px this text gains a third line.
    for (let pass = 0; pass < 15; pass++) {
      const count = width() < 180 ? 3 : 2
      await act(() => textNode().props.onTextLayout({ nativeEvent: { lines: Array(count).fill({}) } }))
    }
    assert.ok(width() >= 180 && width() <= 181.5, "balance converges without adding a line")
    assert.equal(callbacks, 15, "consumer layout callbacks are preserved")
    const balancedWidth = width()
    await act(() => textNode().props.onTextLayout({ nativeEvent: { lines: [{}, {}] } }))
    assert.equal(width(), balancedWidth, "completed layout stops measuring")
    await act(() => layout(250))
    assert.equal(width(), 250, "rotation/parent resizing restarts at full width")
    await render(description("Updated text"))
    assert.equal(width(), 250, "changed text restarts the layout search")
    await act(() => textNode().props.onTextLayout({ nativeEvent: { lines: [{}] } }))
    assert.equal(width(), 250, "single-line text is left alone")
    await render(description("Explicit width", { width: 120 }))
    await act(() => textNode().props.onTextLayout({ nativeEvent: { lines: [{}, {}] } }))
    assert.equal(width(), 120, "caller dimensions are preserved")
    await render(h(Empty.Description, null, h("Text", null, "Rich content")))
    assert.equal(tree.root.findAllByType("Text").length, 2, "rich text remains composable")
  }
  {
    const previousRAF = globalThis.requestAnimationFrame
    const previousCancel = globalThis.cancelAnimationFrame
    const frames = new Map()
    let frameId = 0
    globalThis.requestAnimationFrame = (fn) => {
      frames.set(++frameId, fn)
      return frameId
    }
    globalThis.cancelAnimationFrame = (id) => frames.delete(id)
    try {
      let api
      const changes = [],
        completions = [],
        invalid = [],
        focus = [],
        selections = []
      let blurs = 0
      const pin = (props = {}) =>
        h(
          PinInput.Root,
          {
            count: 4,
            onValueChange: (v) => changes.push(v.valueAsString),
            onValueComplete: (v) => completions.push(v.valueAsString),
            onValueInvalid: (v) => invalid.push(v),
            ...props,
          },
          h(PinInput.Label, null, "Access code"),
          h(
            PinInput.Control,
            null,
            Array.from({ length: 4 }, (_, index) => h(PinInput.Input, { key: index, index }))
          ),
          h(PinInput.Context, null, (state) => {
            api = state
            return null
          })
        )
      const cells = () => tree.root.findAllByType("TextInput")
      await act(() => tree.unmount())
      await act(() => {
        tree = create(pin(), {
          createNodeMock: (element) => {
            if (element.type !== "TextInput" || !/character \d+/.test(element.props.accessibilityLabel)) return null
            const i = Number(element.props.accessibilityLabel.match(/character (\d+)/)[1]) - 1
            return {
              focus: () => focus.push(i),
              blur: () => blurs++,
              setSelection: (a, b) => selections.push([i, a, b]),
            }
          },
        })
      })
      assert.equal(cells()[0].props.accessibilityLabel, "Access code, character 1 of 4")
      await act(() => cells()[0].props.onChangeText("1"))
      assert.deepEqual(api.value, ["1", "", "", ""])
      assert.equal(focus.at(-1), 1)
      await act(() => cells()[1].props.onChangeText("2"))
      assert.equal(focus.at(-1), 2)
      await act(() => cells()[2].props.onKeyPress({ nativeEvent: { key: "Backspace" }, preventDefault() {} }))
      assert.deepEqual(api.value, ["1", "", "", ""], "backspace from an empty cell clears the preceding character")
      assert.equal(focus.at(-1), 1)
      await act(() => cells()[2].props.onChangeText("12-34"))
      assert.deepEqual(api.value, ["1", "2", "3", "4"], "full-code paste starts at the first cell")
      assert.deepEqual(completions, ["1234"])
      await act(() => cells()[3].props.onChangeText("4"))
      assert.deepEqual(completions, ["1234"], "unchanged values do not repeat completion")
      await act(() => cells()[0].props.onChangeText("A"))
      assert.equal(api.valueAsString, "1234")
      assert.deepEqual(invalid.at(-1), { value: "A", index: 0 })
      await act(() => cells()[2].props.onChangeText(""))
      assert.deepEqual(api.value, ["1", "2", "", "4"])
      assert.equal(focus.at(-1), 1)
      await act(() => cells()[1].props.onChangeText("56"))
      assert.deepEqual(api.value, ["1", "5", "6", "4"], "partial paste preserves cells outside its range")
      await act(() => {
        frames.forEach((fn) => fn())
        frames.clear()
      })
      assert.deepEqual(selections.at(-1), [3, 0, 1], "next cell is selected for replacement")
      await render(pin({ value: ["9", "8", "7", "6"] }))
      await act(() => cells()[0].props.onChangeText("1"))
      assert.equal(changes.at(-1), "1876")
      assert.equal(cells()[0].props.value, "9", "controlled state remains owned by the parent")
      await render(pin({ value: [], readOnly: true }))
      const before = changes.length
      await act(() => cells()[0].props.onChangeText("1"))
      assert.equal(changes.length, before)
      assert.ok(cells().every((cell) => cell.props.editable === false))
      await render(h(Fieldset.Root, { disabled: true, invalid: true }, pin()))
      assert.ok(
        cells().every((cell) => cell.props.editable === false && cell.props.accessibilityHint === "Invalid code")
      )
      await render(pin({ type: "alphanumeric", blurOnComplete: true, otp: true }))
      await act(() => cells()[1].props.onChangeText("aB12"))
      assert.equal(api.valueAsString, "aB12")
      assert.equal(blurs, 4)
      assert.equal(cells()[0].props.textContentType, "oneTimeCode")
      assert.equal(cells()[0].props.autoComplete, "one-time-code")
    } finally {
      await render(h("View"))
      globalThis.requestAnimationFrame = previousRAF
      globalThis.cancelAnimationFrame = previousCancel
    }
  }
  {
    let api,
      complete = 0
    const changes = [],
      invalid = []
    const fixture = (props = {}) =>
      h(
        Steps.Root,
        {
          count: 3,
          onStepChange: ({ step }) => changes.push(step),
          onStepComplete: () => complete++,
          onStepInvalid: (event) => invalid.push(event),
          ...props,
        },
        h(Steps.Context, null, (value) => {
          api = value
          return null
        }),
        h(
          Steps.List,
          null,
          [0, 1, 2].map((index) =>
            h(
              Steps.Item,
              { index, key: index },
              h(Steps.Trigger, { testID: `step-${index}` }, h(Steps.Indicator), `Step ${index}`),
              h(Steps.Separator)
            )
          )
        ),
        [0, 1, 2].map((index) =>
          h(Steps.Content, { index, key: index, testID: `panel-${index}` }, h(Input.Root, { testID: `input-${index}` }))
        ),
        h(Steps.CompletedContent, { testID: "complete" }, "Complete"),
        h(Steps.Progress),
        h(Steps.PrevTrigger, { testID: "previous" }, "Back"),
        h(Steps.NextTrigger, { testID: "next" }, "Next")
      )
    const button = (id) => tree.root.findAllByType("Pressable").find((node) => node.props.testID === id)
    const click = async (id) => act(() => button(id).props.onPress({ defaultPrevented: false }))
    await render(fixture())
    assert.equal(button("previous").props.disabled, true)
    assert.equal(tree.root.findAllByType("TextInput").length, 3, "panels preserve input state by default")
    await click("step-2")
    assert.equal(api.value, 2)
    assert.equal(button("step-2").props.accessibilityState.selected, true)
    await click("next")
    assert.equal(api.isCompleted, true)
    assert.equal(api.percent, 100)
    assert.equal(complete, 1)
    assert.equal(button("next").props.disabled, true)
    await click("next")
    assert.equal(complete, 1)
    await click("previous")
    assert.equal(api.value, 2)
    await act(() => api.resetStep())
    await render(fixture({ linear: true, isStepValid: () => false }))
    await click("step-2")
    assert.equal(api.value, 0, "linear steps cannot be skipped by clicking")
    await click("next")
    assert.equal(api.value, 0)
    assert.equal(invalid.at(-1).action, "next")
    await act(() => api.setStep(2))
    assert.equal(invalid.at(-1).targetStep, 2)
    await render(fixture({ isStepValid: () => false, isStepSkippable: () => true }))
    await click("next")
    assert.equal(api.value, 1)
    await render(fixture({ isStepValid: () => false }))
    await click("previous")
    assert.equal(api.value, 0, "validation must not trap backward navigation")
    await render(fixture({ step: 1 }))
    await click("next")
    assert.equal(changes.at(-1), 2)
    assert.equal(api.value, 1, "controlled state stays owned by the caller")
    await act(() => api.setStep(99))
    assert.equal(changes.at(-1), 2)
    await render(fixture({ step: 1, unmountOnExit: true }))
    assert.equal(tree.root.findAllByType("TextInput").length, 1)
    assert.equal(tree.root.findByType("TextInput").props.testID, "input-1")
    await render(h("View"))
    await render(fixture({ lazyMount: true }))
    assert.equal(tree.root.findAllByType("TextInput").length, 1)
    await click("next")
    assert.equal(tree.root.findAllByType("TextInput").length, 2)
    await click("previous")
    assert.equal(tree.root.findAllByType("TextInput").length, 2)
    await render(fixture({ orientation: "vertical" }))
    const separators = tree.root
      .findAllByType("View")
      .filter((node) => flatten(node.props.style).width === 1 && flatten(node.props.style).height === 24)
    assert.equal(separators.length, 2, "vertical separators stop before the last item")
  }
  {
    let chunks
    const collect = (node) =>
      typeof node === "string" || typeof node === "number" ? String(node) : (node?.children ?? []).map(collect).join("")
    function Probe(props) {
      const result = useHighlight(props)
      React.useEffect(() => {
        chunks = result
      }, [result])
      return h(Highlight.Root, props)
    }
    const text = "Ark UI components, components and C++ tools."
    await render(h(Probe, { text, query: "components" }))
    assert.equal(chunks.filter((chunk) => chunk.match).length, 1)
    assert.equal(chunks.map((chunk) => chunk.text).join(""), text)
    await render(h(Probe, { text, query: ["components", "C++"] }))
    assert.deepEqual(
      chunks.filter((chunk) => chunk.match).map((chunk) => chunk.text),
      ["components", "components", "C++"]
    )
    await render(
      h(Probe, { text: "cat category CAT", query: "cat", exactMatch: true, ignoreCase: true, matchAll: true })
    )
    assert.deepEqual(
      chunks.filter((chunk) => chunk.match).map((chunk) => chunk.text),
      ["cat", "CAT"]
    )
    await render(h(Probe, { text, query: "" }))
    assert.equal(collect(tree.toJSON()), text)
    await render(h(Probe, { text, query: "absent" }))
    assert.equal(chunks.filter((chunk) => chunk.match).length, 0)
    await render(
      h(NativeThemeProvider, { colorScheme: "dark" }, h(Highlight.Root, { text: "highlight", query: "highlight" }))
    )
    const spans = tree.root.findAllByType("Text")
    assert.equal(flatten(spans[0].props.style).color, nativeColors.dark.foreground)
    assert.equal(flatten(spans[1].props.style).color, nativeColors.dark.foreground)
    const { getHighlightSegments } = await import("../packages/react-native/src/lib/highlight-layout.ts")
    const line = (text, y = 0) => ({ text, x: 0, y, width: 100, height: 20, ascender: 12, descender: 4 })
    const segments = getHighlightSegments(
      [
        { text: "a ", match: false },
        { text: "long matching phrase", match: true },
        { text: "!", match: false },
      ],
      [line("a long "), line("matching ", 20), line("phrase!", 40)]
    )
    assert.deepEqual(
      segments.map(({ before, through }) => [before, through]),
      [
        ["a ", "a long "],
        ["", "matching "],
        ["", "phrase"],
      ]
    )
    assert.deepEqual(getHighlightSegments([{ text: "absent", match: false }], [line("absent")]), [])
    await act(() => spans[0].props.onTextLayout({ nativeEvent: { lines: [line("highlight")] } }))
    const measurements = tree.root.findAllByType("Text").filter((node) => flatten(node.props.style).opacity === 0)
    assert.equal(measurements.length, 1)
    await act(() => measurements[0].props.onTextLayout({ nativeEvent: { lines: [{ width: 60 }] } }))
    const background = tree.root.findAllByType("View").find((node) => flatten(node.props.style).width === 60)
    assert.ok(flatten(background.props.style).borderRadius > 0)
    assert.equal(flatten(background.props.style).height, 16)
    assert.equal(flatten(background.props.style).top, 2)
    const darkMarkColor = flatten(background.props.style).backgroundColor
    await act(() =>
      tree.update(
        h(NativeThemeProvider, { colorScheme: "light" }, h(Highlight.Root, { text: "highlight", query: "highlight" }))
      )
    )
    const lightBackground = tree.root.findAllByType("View").find((node) => flatten(node.props.style).width === 60)
    assert.ok(lightBackground, "Changing theme retains native line measurements")
    assert.notEqual(flatten(lightBackground.props.style).backgroundColor, darkMarkColor)
    await render(h("Text", null, h(Format.Number, { value: 1234.56, locale: "de-DE" })))
    assert.equal(collect(tree.toJSON()), "1.234,56")
    await render(
      h(
        Format.LocaleProvider,
        { locale: "de-DE" },
        h("Text", null, h(Format.Number, { value: 49.99, style: "currency", currency: "USD", locale: "en-US" }))
      )
    )
    assert.equal(collect(tree.toJSON()), "$49.99")
    await render(h(Format.LocaleProvider, { locale: "de-DE" }, h("Text", null, h(Format.Number, { value: 49.99 }))))
    assert.equal(collect(tree.toJSON()), "49,99")
    await render(h("Text", null, h(Format.Byte, { value: 1_450_000, locale: "en-US" })))
    assert.equal(collect(tree.toJSON()), "1.45 MB")
    await render(h("Text", null, h(Format.Byte, { value: 1024, unitSystem: "binary", locale: "en-US" })))
    assert.equal(collect(tree.toJSON()), "1 kB")
    await render(h("Text", null, h(Format.Time, { value: "14:35:09", locale: "en-GB", withSeconds: true })))
    assert.equal(collect(tree.toJSON()), "14:35:09")
    await render(h("Text", null, h(Format.Time, { value: "14:35", format: "12h", pmLabel: "pm", locale: "en-US" })))
    assert.match(collect(tree.toJSON()), /^2:35\s+pm$/u)
    await render(h("Text", null, h(Format.Time, { value: "25:00", locale: "en-US" })))
    assert.equal(collect(tree.toJSON()), "")
    await render(
      h("Text", null, h(Format.RelativeTime, { value: new Date(Date.now() - 3 * 3600000), locale: "en-US" }))
    )
    assert.equal(collect(tree.toJSON()), "3 hours ago")
    await render(
      h("Text", null, h(Format.RelativeTime, { value: new Date(Date.now() + 3 * 86400000 + 1000), locale: "en-US" }))
    )
    assert.equal(collect(tree.toJSON()), "in 3 days")
  }
  {
    let api
    const changes = []
    const errors = []
    function TagsProbe(props) {
      const state = useTagsInput(props)
      React.useEffect(() => {
        api = state
      })
      return h(
        TagsInput.RootProvider,
        { value: state },
        h(TagsInput.Label, null, "Topics"),
        h(
          TagsInput.Control,
          null,
          ...state.value.map((value, index) =>
            h(
              TagsInput.Item,
              { key: index, index, value },
              h(TagsInput.ItemPreview, null, h(TagsInput.ItemText, null), h(TagsInput.ItemDeleteTrigger)),
              h(TagsInput.ItemInput)
            )
          ),
          h(TagsInput.Input, { placeholder: "Add a topic" })
        )
      )
    }
    const props = {
      defaultValue: ["react"],
      onValueChange: ({ value }) => changes.push(value),
      onValueInvalid: (error) => errors.push(error),
      max: 3,
    }
    await render(h(TagsProbe, props))
    assert.equal(tree.root.findByType("TextInput").props.accessibilityLabel, "Topics")
    await act(() => {
      api.change("fast")
      api.commit("fast")
    })
    assert.deepEqual(api.value, ["react", "fast"])
    assert.equal(api.inputValue, "", "same-batch change and submit clears the native draft")
    await act(() => api.remove(1))

    await act(() => api.change(" expo "))
    await act(() => api.commit())
    assert.deepEqual(api.value, ["react", "expo"])
    assert.equal(api.inputValue, "")
    await act(() => api.change("expo"))
    await act(() => api.commit())
    assert.equal(api.inputValue, "expo", "rejected entries stay editable")
    assert.equal(errors.at(-1).reason, "duplicate")
    await act(() => api.change("native,"))
    assert.deepEqual(api.value, ["react", "expo", "native"])
    await act(() => api.change("fourth"))
    await act(() => api.commit())
    assert.equal(errors.at(-1).reason, "max")
    await act(() => api.change(""))
    await act(() => api.backspace())
    assert.equal(api.highlightedIndex, 2)
    assert.equal(api.value.length, 3)
    await act(() => api.backspace())
    assert.deepEqual(api.value, ["react", "expo"])
    await act(() => api.edit(0))
    await act(() => api.changeEdit("ark"))
    await act(() => api.commitEdit())
    assert.deepEqual(api.value, ["ark", "expo"])
    await act(() => api.edit(0))
    await act(() => api.changeEdit("expo"))
    await act(() => api.commitEdit())
    assert.ok(api.editing, "invalid edits remain open for correction")
    await act(() => api.cancelEdit())
    assert.equal(api.value[0], "ark")
    await act(() => api.edit(0))
    await act(() => api.changeEdit(""))
    await act(() => api.commitEdit())
    assert.deepEqual(api.value, ["expo"])
    await render(h(TagsProbe, { ...props, addOnPaste: true }))
    await act(() => api.change("a,b,c"))
    assert.deepEqual(api.value, ["expo", "a", "b"])
    assert.equal(api.inputValue, "c", "overflow from bulk insertion is retained")
    await render(h(TagsProbe, { ...props, value: ["controlled"] }))
    await act(() => api.addValue("proposed"))
    assert.deepEqual(changes.at(-1), ["controlled", "proposed"])
    assert.deepEqual(api.value, ["controlled"])
    await render(h(TagsProbe, { ...props, value: ["controlled"], readOnly: true }))
    const count = changes.length
    await act(() => {
      api.clearValue()
      api.remove(0)
      api.addValue("blocked")
      api.edit(0)
      api.change("blocked")
    })
    assert.equal(changes.length, count)
    assert.equal(api.editing, null)
    assert.equal(tree.root.findByType("TextInput").props.editable, false)
    await render(h(TagsProbe, { ...props, value: ["controlled"], disabled: true }))
    assert.equal(tree.root.findByType("TextInput").props.accessibilityState.disabled, true)
    await render(h(TagsProbe, { ...props, value: [], validate: ({ inputValue }) => inputValue.startsWith("@") }))
    await act(() => api.addValue("invalid"))
    assert.equal(errors.at(-1).reason, "validate")
    await render(h(TagsProbe, { ...props, value: ["controlled"], inputValue: "draft", blurBehavior: "add" }))
    await act(() => api.blur())
    assert.deepEqual(changes.at(-1), ["controlled", "draft"])
    assert.equal(api.inputValue, "draft", "controlled draft remains parent-owned")
    await render(h(TagsProbe, { ...props, value: [], inputValue: "" }))
    await act(() => tree.root.findByType("TextInput").props.onSubmitEditing({ nativeEvent: { text: "fast-entry" } }))
    assert.deepEqual(changes.at(-1), ["fast-entry"], "submit uses native text even before the JS draft update")
  }
  {
    const changes = []
    const fixture = (Root = Dialog.Root, options = {}) =>
      h(
        Root,
        { onOpenChange: ({ open }) => changes.push(open), ...options },
        h(Dialog.Trigger, { testID: "open-dialog" }, "Open"),
        h(
          Dialog.Content,
          null,
          h(Dialog.Title, null, "Test dialog"),
          h(Dialog.Description, null, "Description"),
          h(Dialog.CloseTrigger, { testID: "close-dialog" }, "Close")
        )
      )
    await render(fixture())
    assert.equal(tree.root.findByType("Modal").props.visible, false)
    await act(() =>
      tree.root
        .findAllByType("Pressable")
        .find((node) => node.props.testID === "open-dialog")
        .props.onPress({ defaultPrevented: false })
    )
    assert.equal(changes.at(-1), true)
    assert.equal(tree.root.findByType("Modal").props.visible, true)
    await act(() => tree.root.findByType("Modal").props.onRequestClose())
    assert.equal(changes.at(-1), false)
    assert.equal(tree.root.findByType("Modal").props.visible, true, "exit remains mounted for its animation")
    await act(() => new Promise((resolve) => setTimeout(resolve, 140)))
    assert.equal(tree.root.findByType("Modal").props.visible, false)
    await render(fixture(AlertDialog.Root, { open: true }))
    const outside = tree.root.findAllByType("Pressable").find((node) => node.props.accessible === false)
    const count = changes.length
    await act(() => outside.props.onPress())
    assert.equal(changes.length, count, "alerts ignore outside presses")
    await render(fixture(Dialog.Root, { open: true, closeOnEscape: false }))
    await act(() => tree.root.findByType("Modal").props.onRequestClose())
    assert.equal(changes.length, count, "escape can be disabled")
    await act(() =>
      tree.root
        .findAllByType("Pressable")
        .find((node) => node.props.accessible === false)
        .props.onPress()
    )
    assert.equal(changes.at(-1), false)
    assert.equal(tree.root.findByType("Modal").props.visible, true, "controlled visibility stays parent-owned")
  }
  {
    for (const side of ["left", "right", "top", "bottom"]) {
      const changes = []
      await render(
        h(
          NativeThemeProvider,
          { reducedMotion: false },
          h(
            Sheet.Root,
            {
              defaultOpen: true,
              onOpenChange: ({ open }) => changes.push(open),
              safeAreaInsets: { top: 24, bottom: 20, left: 0, right: 0 },
            },
            h(
              Sheet.Content,
              { side },
              h(Sheet.Header, null, h(Sheet.Title, null, "Panel")),
              h(Sheet.Footer, null, h(Sheet.CloseTrigger, null, "Done"))
            )
          )
        )
      )
      await act(() => new Promise((resolve) => setTimeout(resolve, 30)))
      const surface = () =>
        flatten(tree.root.findAllByType("View").find((node) => node.props.role === "dialog").props.style)
      assert.equal(surface().opacity, 1)
      assert.equal(surface().borderRadius, 0)
      assert.equal(surface().transitionDuration, 200)
      assert.equal(surface().width, ["left", "right"].includes(side) ? "75%" : "100%")
      assert.equal(surface().paddingTop, side === "bottom" ? 0 : 24)
      await act(() => tree.root.findByType("Modal").props.onRequestClose())
      await act(() => new Promise((resolve) => setTimeout(resolve, 10)))
      assert.equal(changes.at(-1), false)
      assert.deepEqual(surface().transform, [
        side === "left" || side === "right"
          ? { translateX: side === "left" ? -40 : 40 }
          : { translateY: side === "top" ? -40 : 40 },
      ])
      await act(() => new Promise((resolve) => setTimeout(resolve, 130)))
      assert.equal(tree.root.findByType("Modal").props.visible, true, "sheet must outlive the shorter dialog exit")
      await act(() => new Promise((resolve) => setTimeout(resolve, 110)))
      assert.equal(tree.root.findByType("Modal").props.visible, false)
      await render(h("View"))
    }
  }
  console.log(
    "test-native: controlled state, panel lifecycles, image failures, accessibility, and shared behavior pass"
  )
} finally {
  if (tree) await act(() => tree.unmount())
}

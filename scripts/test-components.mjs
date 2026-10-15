import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL(`packages/react/src/${specifier.slice(2)}`, root))
      const file = [base, `${base}.tsx`, `${base}.ts`].find(existsSync)
      if (!file) throw new Error(`Cannot resolve ${specifier}`)
      return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    if (specifier.startsWith(".") && context.parentURL?.includes("/packages/")) {
      const base = fileURLToPath(new URL(specifier, context.parentURL))
      const file = [`${base}.tsx`, `${base}.ts`].find(existsSync)
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    // Atlaskit publishes subpath directories with package.json entry points, not ESM exports.
    if (specifier.startsWith("@atlaskit/")) {
      const entry = nextResolve(`${specifier}/package.json`, context)
      const manifest = JSON.parse(readFileSync(fileURLToPath(entry.url), "utf8"))
      return nextResolve(new URL(manifest.main, entry.url).href, context)
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
const { Card } = await import("@multicomma/arkcn-react/ui/card")
const { ButtonGroup } = await import("@multicomma/arkcn-react/ui/button-group")
const { Checkbox } = await import("@multicomma/arkcn-react/ui/checkbox")
const { Button } = await import("@multicomma/arkcn-react/ui/button")
const { Input } = await import("@multicomma/arkcn-react/ui/input")
const { Accordion } = await import("@multicomma/arkcn-react/ui/accordion")
const { Switch } = await import("@multicomma/arkcn-react/ui/switch")
const { Field } = await import("@multicomma/arkcn-react/ui/field")
const { Fieldset } = await import("@multicomma/arkcn-react/ui/fieldset")
const { TransferList } = await import("@multicomma/arkcn-react/ui/transfer-list")
const { AppShell } = await import("@multicomma/arkcn-react/ui/app-shell")
const { DownloadTrigger } = await import("@multicomma/arkcn-react/ui/download-trigger")
const h = React.createElement
const render = (component, props, child) => renderToStaticMarkup(h(component, props, child))
assert.equal(typeof Card, "object")
assert.equal(Card.Root.name, "CardRoot")
assert.equal(Accordion.ItemTrigger.name, "AccordionItemTrigger")
assert.equal(AppShell.NotificationItem.name, "AppShellNotificationItem")
const shellMain = render(AppShell.Main, {}, "Main content")
assert.match(shellMain, /^<main[^>]*id="content"[^>]*tabindex="-1"/)
const shellContent = render(AppShell.Content, {}, h(AppShell.Main, null, "Main content"))
assert.match(shellContent, /^<div/)
assert.equal((shellContent.match(/<main/g) ?? []).length, 1)
const customShellContent = render(AppShell.Content, { asChild: true }, h("section", null, "Custom content"))
assert.match(customShellContent, /^<section/)
assert.match(render(AppShell.TopNavLink, { active: true, href: "/inbox" }, "Inbox"), /aria-current="page"/)
assert.equal(typeof Button, "function")
assert.equal("Root" in Button, false)
const download = render(
  DownloadTrigger.Root,
  { asChild: true, data: "report", fileName: "report.txt", mimeType: "text/plain" },
  h(Button, null, "Download")
)
const { Spreadsheet } = await import("@multicomma/arkcn-react/ui/spreadsheet")
const sheetMarkup = render(
  Spreadsheet.Root,
  {
    data: [["Header"], ["Value"]],
    defaultRowHeights: { 1: 52 },
    frozenRows: 1,
  },
  h(Spreadsheet.Container, null, h(Spreadsheet.Header), h(Spreadsheet.Body))
)
assert.match(sheetMarkup, /data-slot="spreadsheet-row"[^>]*data-row="1"[^>]*style="[^"]*height:52px/)
assert.match(sheetMarkup, /aria-label="Resize row 2"[^>]*aria-valuemin="24"[^>]*aria-valuenow="52"/)
// Exercise both viewport axes with a wide sheet, variable column widths, and a frozen pane.
const { act, create } = await import("react-test-renderer")
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const originalResizeObserver = globalThis.ResizeObserver
let resizeViewport
const viewport = {
  clientWidth: 448,
  clientHeight: 240,
  scrollLeft: 0,
  scrollTop: 0,
  focus() {},
  querySelector() {
    return null
  },
}
globalThis.ResizeObserver = class {
  constructor(callback) {
    resizeViewport = callback
  }
  observe() {}
  disconnect() {}
}
let wideSheet
await act(() => {
  wideSheet = create(
    h(
      Spreadsheet.Root,
      {
        data: [],
        rowCount: 10000,
        columnCount: 1000,
        frozenRows: 1,
        frozenColumns: 1,
        columnWidth: 100,
        rowHeaderWidth: 48,
        overscan: 1,
        defaultColumnWidths: { 1: 200 },
      },
      h(Spreadsheet.Container, null, h(Spreadsheet.Header, null, h(Spreadsheet.HeaderRow)), h(Spreadsheet.Body))
    ),
    {
      createNodeMock: (element) => (element.props["data-slot"] === "spreadsheet-container" ? viewport : null),
    }
  )
})
const sheetNodes = (slot) =>
  wideSheet.root.findAll((node) => typeof node.type === "string" && node.props["data-slot"] === slot)
const columns = () => sheetNodes("spreadsheet-column-header").map((node) => node.props["data-column"])
const scrollSheet = async (left, top = 0) => {
  viewport.scrollLeft = left
  viewport.scrollTop = top
  await act(() => sheetNodes("spreadsheet-container")[0].props.onScroll({ currentTarget: viewport }))
}
assert.deepEqual(columns(), [0, 1, 2, 3, 4], "initial viewport uses variable column widths")
assert.ok(sheetNodes("spreadsheet-cell").length < 100, "10,000 by 1,000 sheet mounts only its visible window")
await scrollSheet(5000)
assert.deepEqual(columns(), [0, 49, 50, 51, 52, 53, 54])
assert.equal(sheetNodes("spreadsheet-cell").find((node) => node.props["data-column"] === 50).props.style.gridColumn, 52)
assert.ok(
  sheetNodes("spreadsheet-cell").some((node) => node.props["data-row"] === 0 && node.props["data-column"] === 50),
  "frozen rows use the same column window"
)
const editTarget = sheetNodes("spreadsheet-cell").find(
  (node) => node.props["data-row"] === 1 && node.props["data-column"] === 50
)
await act(() => editTarget.props.onDoubleClick({ defaultPrevented: false }))
await scrollSheet(9000, 2000)
assert.ok(
  sheetNodes("spreadsheet-cell").some(
    (node) => node.props["data-row"] === 1 && node.props["data-column"] === 50 && node.props["data-editing"] === ""
  ),
  "editor survives scrolling on both axes"
)
assert.ok(columns().includes(0) && columns().includes(90) && !columns().includes(49))
viewport.clientWidth = 748
await act(() => resizeViewport())
assert.ok(columns().includes(97), "viewport resize expands the column window")
await act(() => wideSheet.unmount())
globalThis.ResizeObserver = originalResizeObserver
const plainButton = render(Button, {}, "Download")
assert.equal(download.match(/class="([^"]*)"/)?.[1], plainButton.match(/class="([^"]*)"/)?.[1])
assert.equal((download.match(/<button/g) ?? []).length, 1)
const card = render(
  Card.Root,
  { asChild: true, className: "outer", "data-test": "card" },
  h("article", { className: "inner" }, "Content")
)
assert.match(card, /^<article/)
assert.match(card, /outer inner/)
assert.match(card, /data-slot="card"/)
assert.match(card, /data-test="card"/)
const link = render(Button, { asChild: true, variant: "outline" }, h("a", { href: "#target" }, "Open"))
assert.match(link, /^<a/)
assert.doesNotMatch(link, /<button/)
assert.match(link, /href="#target"/)
const input = render(Input.Root, { asChild: true, defaultValue: "Alex" }, h("input", { "aria-label": "Name" }))
assert.match(input, /value="Alex"/)
assert.doesNotMatch(input, /asChild/)
const switchMarkup = render(Switch.Root, { defaultChecked: true }, [
  h(Switch.Control, { key: "control", asChild: true }, h("span", null, h(Switch.Thumb))),
  h(Switch.HiddenInput, { key: "input", name: "notifications" }),
])
assert.match(switchMarkup, /data-state="checked"/)
assert.match(switchMarkup, /data-size="default"/)
assert.match(switchMarkup, /name="notifications"/)
assert.match(switchMarkup, /<span[^>]*data-part="control"/)
const notification = render(
  AppShell.NotificationItem,
  { asChild: true, unread: true },
  h("button", { type: "button", className: "custom-notification" }, "New message")
)
assert.match(notification, /^<li[^>]*><button/)
assert.match(notification, /<button[^>]*data-slot="app-shell-notification-item-surface"/)
assert.match(notification, /<button[^>]*data-unread=""/)
assert.match(
  notification,
  /<button[^>]*class="[^"]*group\/notification[^"]*flex[^"]*text-start[^"]*custom-notification/
)
const field = render(
  Field.Root,
  { id: "email", ids: { helperText: "help", errorText: "error" }, invalid: true, required: true },
  [
    h(Field.Label, { key: "label" }, "Email"),
    h(Field.Input, { key: "input" }),
    h(Field.HelperText, { key: "help" }, "Work email"),
    h(Field.ErrorText, { key: "error" }, "Invalid email"),
  ]
)
assert.match(field, /for="email"/)
assert.match(field, /aria-invalid="true"/)
assert.match(field, /required=""/)
const disabled = render(Fieldset.Root, { disabled: true }, h(Field.Root, null, h(Field.Input)))
assert.match(disabled, /disabled=""/)
const accordion = render(
  Accordion.Root,
  { asChild: true },
  h(
    "section",
    null,
    h(Accordion.Item, { value: "one" }, [
      h(Accordion.ItemTrigger, { key: "trigger", asChild: true }, h("button", null, "Open")),
      h(Accordion.ItemContent, { key: "content" }, "Body"),
    ])
  )
)
assert.match(accordion, /^<section/)
assert.doesNotMatch(accordion, /<button[^>]*>.*<button/)
const transfer = render(
  TransferList.Root,
  { items: [{ value: "read", label: "Read" }] },
  h(
    TransferList.Panel,
    { side: "source" },
    h(TransferList.Items, { asChild: true }, h("section", { "data-test": "custom-list" }, "Custom rows"))
  )
)
assert.match(transfer, /<section[^>]*data-test="custom-list"/)
assert.match(transfer, /<section[^>]*role="listbox"/)
assert.match(transfer, /Custom rows/)
console.log(
  "test-components: namespace APIs, custom elements, merged attributes, field semantics, and composed Ark controls pass"
)

const groupText = render(ButtonGroup.Text, { asChild: true }, h("label", { htmlFor: "amount" }, "Amount"))
assert.match(groupText, /^<label/)
assert.match(groupText, /data-slot="button-group-text"/, "custom text segments participate in group edge styling")
assert.match(groupText, /for="amount"/)
assert.match(render(ButtonGroup.Root, {}, h(Button, null, "Action")), /data-orientation="horizontal"/)
const mixed = render(Checkbox.Root, { checked: "indeterminate", invalid: true }, h(Checkbox.Control))
assert.match(mixed, /data-state="indeterminate"/)
assert.match(mixed, /data-invalid=""/)
assert.match(mixed, /dark:data-\[state=indeterminate\]:bg-primary/, "mixed controls keep a filled surface in dark mode")

// Compound fields must preserve standalone input styling and Ark semantics.
for (const [part, tag, baseline] of [
  [Field.Input, "input", render(Input.Root, {})],
  [Field.Textarea, "textarea", render((await import("@multicomma/arkcn-react/ui/textarea")).Textarea.Root, {})],
]) {
  const markup = render(
    Field.Root,
    { invalid: true, disabled: true, required: true },
    h(part, { "data-test": "field-control" })
  )
  const control = markup.match(new RegExp(`<${tag}[^>]*data-test="field-control"[^>]*>`))?.[0]
  assert.ok(control, `Field.${tag} renders one semantic control`)
  assert.match(control, /aria-invalid="true"/)
  assert.match(control, /disabled=""/)
  assert.match(control, /required=""/)
  assert.equal(
    control.match(/class="([^"]*)"/)?.[1],
    baseline.match(/class="([^"]*)"/)?.[1],
    "compound and standalone controls share the complete style recipe"
  )
}
const { Command, createListCollection } = await import("@multicomma/arkcn-react/ui/command")
const commandCollection = createListCollection({
  items: [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
  ],
})
const commandMarkup = render(
  Command.Root,
  { collection: commandCollection },
  commandCollection.items.map((item) => h(Command.Item, { key: item.value, item }, item.label))
)
assert.match(
  commandMarkup,
  /data-current=""[^>]*data-value="one"|data-value="one"[^>]*data-current=""/,
  "initial command highlight is visible before focus"
)
assert.equal((commandMarkup.match(/data-current=""/g) ?? []).length, 1)

// Default composed triggers must merge Ark attributes onto the actual styled button.
// Wrapping that child in a Fragment silently drops disabled state, slot selectors, and event handlers.
for (const [module, namespace, parts] of [
  ["clipboard", "Clipboard", ["Trigger"]],
  ["color-picker", "ColorPicker", ["EyeDropperTrigger", "FormatTrigger"]],
  ["file-upload", "FileUpload", ["Trigger", "ClearTrigger"]],
  ["floating-panel", "FloatingPanel", ["CloseTrigger"]],
  ["signature-pad", "SignaturePad", ["ClearTrigger"]],
]) {
  const ui = (await import(`@multicomma/arkcn-react/ui/${module}`))[namespace]
  for (const part of parts) {
    const markup = render(ui.Root, {}, h(ui[part], { "data-test": "composed-trigger", className: "custom-trigger" }))
    const button = markup.match(/<button[^>]*data-test="composed-trigger"[^>]*>/)?.[0]
    assert.ok(button, `${namespace}.${part} forwards attributes to its default button`)
    assert.match(button, /data-scope=/, `${namespace}.${part} retains primitive semantics`)
    assert.match(button, /custom-trigger/, `${namespace}.${part} retains caller styles`)
    assert.match(button, /group\/button/, `${namespace}.${part} retains the shared Button recipe`)
  }
}
const { Combobox } = await import("@multicomma/arkcn-react/ui/combobox")
const comboProps = { collection: createListCollection({ items: ["English", "French"] }), defaultValue: ["English"] }
const clearCombo = render(Combobox.Root, comboProps, h(Combobox.Input, { showClear: true }))
assert.match(clearCombo, /<button[^>]*data-slot="combobox-clear"/, "clear button participates in chevron replacement")
assert.match(clearCombo, /data-part="clear-trigger"/, "clear button retains its Ark action")
const disabledCombo = render(Combobox.Root, { ...comboProps, disabled: true }, h(Combobox.Input))
assert.match(disabledCombo, /<input[^>]*disabled=""/, "input inherits disabled state from its combobox")
assert.match(disabledCombo, /<button[^>]*disabled=""/, "trigger inherits disabled state from its combobox")

// RootProvider must preserve the size selectors used by fallback text and status badges.
const { Avatar, useAvatar } = await import("@multicomma/arkcn-react/ui/avatar")
const { ScrollArea, useScrollArea } = await import("@multicomma/arkcn-react/ui/scroll-area")
function ProviderAvatar({ size }) {
  const value = useAvatar()
  return h(Avatar.RootProvider, { value, size }, h(Avatar.Fallback, null, "AB"))
}
for (const size of [undefined, "sm", "lg"]) {
  const direct = render(Avatar.Root, { size }, h(Avatar.Fallback, null, "AB"))
  const provider = render(ProviderAvatar, { size })
  assert.equal(provider.match(/data-size="([^"]+)"/)?.[1], direct.match(/data-size="([^"]+)"/)?.[1])
}
function ProviderScrollArea() {
  const value = useScrollArea({ id: "custom-scroll" })
  return h(ScrollArea.RootProvider, { value }, h(ScrollArea.Viewport, null, h(ScrollArea.Content, null, "Content")))
}
assert.match(render(ScrollArea.Root, {}, "Content"), /data-slot="scroll-area-viewport"/)
assert.match(render(ProviderScrollArea), /custom-scroll/)

// Read-only/disabled signature pads must block clearing through either public composition.
const { SignaturePad, useSignaturePad } = await import("@multicomma/arkcn-react/ui/signature-pad")
const signaturePaths = ["M 0 0 L 20 20 Z"]
function ProviderSignature(props) {
  const value = useSignaturePad({ defaultPaths: signaturePaths, ...props })
  return h(
    SignaturePad.RootProvider,
    { value },
    h(SignaturePad.ClearTrigger, { asChild: true }, h("button", null, "Clear"))
  )
}
for (const props of [{ readOnly: true }, { disabled: true }, {}]) {
  const direct = render(SignaturePad.Root, { defaultPaths: signaturePaths, ...props }, h(SignaturePad.ClearTrigger))
  const provider = render(ProviderSignature, props)
  for (const markup of [direct, provider]) {
    assert.equal(/<button[^>]*disabled=""/.test(markup), !!(props.readOnly || props.disabled))
    assert.doesNotMatch(markup, /signature-undefined/, "default signature ids are generated")
  }
}
for (const Component of [SignaturePad.Root, ProviderSignature]) {
  const inherited = render(
    Field.Root,
    { readOnly: true },
    h(Component, { defaultPaths: signaturePaths }, h(SignaturePad.ClearTrigger))
  )
  assert.match(inherited, /<button[^>]*disabled=""/, "signature clear inherits Field read-only state")
  const editable = render(
    Field.Root,
    { readOnly: true },
    h(Component, { defaultPaths: signaturePaths, readOnly: false }, h(SignaturePad.ClearTrigger))
  )
  assert.doesNotMatch(
    editable,
    /<button[^>]*disabled=""/,
    "an explicit editable signature overrides Field read-only state"
  )
}

// Non-draggable Kanban items must disable their explicit keyboard handles too.
const { Kanban } = await import("@multicomma/arkcn-react/ui/kanban")
for (const draggable of [false, true]) {
  const markup = render(
    Kanban.Root,
    {},
    h(
      Kanban.Column,
      { value: "todo", draggable },
      h(Kanban.ColumnHandle, { disabled: false }),
      h(Kanban.Card, { value: "task", draggable }, h(Kanban.CardHandle, { disabled: false }))
    )
  )
  for (const slot of ["kanban-column-handle", "kanban-card-handle"]) {
    const tag = markup.match(new RegExp(`<button[^>]*data-slot="${slot}"[^>]*>`))?.[0]
    assert.ok(tag)
    assert.equal(tag.includes('disabled=""'), !draggable, `${slot} respects parent draggable`)
  }
}

// Gantt zoom controls expose their limits to keyboard and assistive technology.
const { Gantt } = await import("@multicomma/arkcn-react/ui/gantt")
for (const dayWidth of [12, 24, 48]) {
  const markup = render(
    Gantt.Root,
    { start: new Date(2026, 9, 1), end: new Date(2026, 9, 31), dayWidth, minDayWidth: 12, maxDayWidth: 48 },
    h(React.Fragment, null, h(Gantt.ZoomOutTrigger), h(Gantt.ZoomInTrigger))
  )
  for (const [name, disabled] of [
    ["out", dayWidth === 12],
    ["in", dayWidth === 48],
  ]) {
    const tag = markup.match(new RegExp(`<button[^>]*data-slot="gantt-zoom-${name}-trigger"[^>]*>`))?.[0]
    assert.ok(tag)
    assert.equal(tag.includes('disabled=""'), disabled, `Gantt zoom ${name} at ${dayWidth}`)
  }
}

// Today belongs to the matching header period, never to a task bar or an out-of-range period.
for (const scale of ["day", "week", "month"]) {
  for (const today of [new Date(2026, 9, 14), new Date(2026, 10, 1)]) {
    const header = render(
      Gantt.Root,
      { start: new Date(2026, 9, 10), end: new Date(2026, 9, 30), scale },
      h(Gantt.Header, { today, label: "Work items" })
    )
    assert.match(header, /Work items/)
    assert.equal((header.match(/data-slot="gantt-today-label"/g) ?? []).length, today.getMonth() === 9 ? 1 : 0)
  }
}
const todayLine = render(
  Gantt.Root,
  { start: new Date(2026, 9, 10), end: new Date(2026, 9, 30) },
  h(Gantt.Today, { date: new Date(2026, 9, 14) })
)
assert.match(todayLine, /data-slot="gantt-today"/)
assert.doesNotMatch(todayLine, />Today</)

// Node Graph zoom limits remain disabled even when a caller passes disabled=false.
const { NodeGraph } = await import("@multicomma/arkcn-react/ui/node-graph")
for (const zoom of [0.25, 1, 2]) {
  const markup = render(
    NodeGraph.Root,
    { viewport: { x: 0, y: 0, zoom } },
    h(
      React.Fragment,
      null,
      h(NodeGraph.ZoomOutTrigger, { disabled: false }),
      h(NodeGraph.ZoomInTrigger, { disabled: false })
    )
  )
  for (const [name, disabled] of [
    ["out", zoom === 0.25],
    ["in", zoom === 2],
  ]) {
    const tag = markup.match(new RegExp(`<button[^>]*data-slot="node-graph-zoom-${name}-trigger"[^>]*>`))?.[0]
    assert.ok(tag)
    assert.equal(tag.includes('disabled=""'), disabled, `Node Graph zoom ${name} at ${zoom}`)
  }
}

// Nested matching remains explicit while unfinished rules are omitted and disclosed.
const { QueryBuilder, describeQuery, pruneQuery } = await import("@multicomma/arkcn-react/ui/query-builder")
const queryFields = [{ name: "name", label: "Name", type: "text" }]
const queryValue = {
  id: "root",
  match: "all",
  rules: [
    { id: "outer", field: "name", operator: "contains", value: "Ada" },
    {
      id: "nested",
      match: "any",
      rules: [
        { id: "one", field: "name", operator: "is", value: "Grace" },
        { id: "two", field: "name", operator: "is", value: "Lin" },
        { id: "pending", field: "name", operator: "is", value: "" },
      ],
    },
  ],
}
assert.equal(
  describeQuery(queryValue, { fields: queryFields }),
  "Name contains “Ada” and either (Name is “Grace”, or Name is “Lin”)"
)
assert.equal(pruneQuery(queryValue).rules[1].rules.length, 2)
assert.match(
  render(QueryBuilder.Root, { fields: queryFields, value: queryValue }, h(QueryBuilder.Summary)),
  /1 incomplete condition not applied/
)
const pendingQuery = { id: "root", match: "all", rules: [{ id: "pending", field: "name", operator: "is" }] }
const pendingSummary = render(QueryBuilder.Root, { fields: queryFields, value: pendingQuery }, h(QueryBuilder.Summary))
assert.match(pendingSummary, /No complete conditions yet/)
assert.doesNotMatch(pendingSummary, /Showing everything/)

// Date values use the toolkit DatePicker (two separate pickers for a range) and keep
// incomplete/reversed/invalid ranges editable without Intl throwing.
for (const value of [[], ["2026-10-01"], ["2026-10-14", "2026-10-01"], ["invalid", "2026-10-01"]]) {
  const rule = { id: "date", field: "date", operator: "between", value }
  const markup = render(
    QueryBuilder.Root,
    { fields: [{ name: "date", label: "Date", type: "date" }] },
    h(QueryBuilder.Rule, { rule }, h(QueryBuilder.ValueEditor))
  )
  assert.equal((markup.match(/data-slot="date-picker"/g) ?? []).length, 2)
  assert.match(markup, /aria-label="From"/)
  assert.match(markup, /aria-label="To"/)
  assert.doesNotMatch(markup, /type="date"|Invalid Date/)
}

const datedQuery = {
  id: "dated",
  match: "all",
  rules: [
    { id: "date", field: "date", operator: "between", value: ["2026-10-01", "2026-10-14"] },
    {
      id: "plans",
      match: "any",
      rules: [
        { id: "plan", field: "plan", operator: "anyOf", value: ["free", "pro"] },
        { id: "seats", field: "seats", operator: "atLeast", value: 10 },
      ],
    },
  ],
}
const datedFields = [
  { name: "date", label: "Signed up", type: "date" },
  {
    name: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
    ],
  },
  { name: "seats", label: "Seats", type: "number" },
]
const datedDescription = describeQuery(datedQuery, { fields: datedFields })
assert.match(datedDescription, /Oct/)
assert.doesNotMatch(datedDescription, /2026-10|any of/)
assert.match(datedDescription, /either \(Plan is “Free” or “Pro”, or Seats is at least 10\)/)
const datedMarkup = render(QueryBuilder.Root, { fields: datedFields, value: datedQuery }, h(QueryBuilder.Summary))
assert.match(datedMarkup, /<strong[^>]*whitespace-nowrap[^>]*>“Free”<\/strong>/)
assert.match(datedMarkup, /<strong[^>]*whitespace-nowrap[^>]*>Oct/)

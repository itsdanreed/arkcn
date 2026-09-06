# UI Toolkit — shadcn/ui ported to Ark UI

Vite + React 19 + TypeScript + Tailwind v4. Components live in `src/components/ui/`.
Baseline is shadcn `radix-nova` style (Radix-backed). Goal: port every Radix-backed
component to `@ark-ui/react` as its backing primitive, one component at a time.

## Porting rules
- **Feature parity** with the shadcn original: same exported names, same props surface
  where Ark supports it, same visual result, same variants.
- **Ark's tree wins** where the structure differs (e.g. `Positioner` wrappers,
  `Control`/`HiddenInput` splits, `ItemGroup`/`ItemGroupLabel`, `Backdrop` vs `Overlay`).
  Export the extra Ark parts as their own composable pieces; do not fold them away.
- **Stay compositional.** Every part is its own exported component. No collapsing
  parts into a single "smart" component, no dropping sub-parts to simplify.
- **Styling:** `cn` from `@/lib/utils` and `cva` from `class-variance-authority`.
  Style state via Ark's data attributes (`data-state`, `data-open`, `data-disabled`,
  `data-highlighted`, `data-placement`, `data-orientation`, ...). Keep `data-slot`
  attributes on every part, as shadcn does.
- `command.tsx` runs on Ark's Listbox and `drawer.tsx` on Ark's Drawer; `cmdk`, `vaul`,
  `radix-ui`, `@base-ui/react`, and every shadcn package (`shadcn` CLI, `@shadcn/react`,
  `cn`) are removed. Do not reintroduce them. `cn` is clsx + tailwind-merge in
  `src/lib/utils.ts`. Base variants, keyframes, and utilities live in `src/index.css`
  (keyframes at the end of the `@theme inline` block); there is no `components.json`.
- `questionnaire.tsx` and `message-scroller.tsx` were removed because they depended on
  the `@shadcn/react` runtime. Rebuild from scratch if they are wanted.
- Components with no Ark equivalent (calendar, carousel, chart, resizable, input-otp,
  sonner/toast) keep their current libraries. Separator, Label, AspectRatio, Direction
  are plain React.

## Workflow per component
1. Read the shadcn original and the matching Ark UI component's anatomy + data attrs.
2. Rewrite the file in place using `@ark-ui/react`.
3. `npx tsc -p tsconfig.app.json --noEmit` must pass.
4. Note any parity gaps explicitly.

## Ark-only components (no shadcn origin)
Added 2026-09-05, styled to match shadcn: number-input, password-input, tags-input,
editable, rating-group, angle-slider, segment-group, date-input, clipboard, format,
file-upload, signature-pad, image-cropper, floating-panel, tree-view, json-tree-view,
marquee, steps, swap, toc, qr-code, timer, tour, color-picker. Same rules apply:
every Ark part exported with `data-slot`, `cn`/`cva`, Ark data attributes. Triggers
that render a `Button` via `asChild` must forward `children` into the Button.

## Naming and polymorphism
Clickable parts are named `*Trigger` (`KanbanAddTrigger`, `ChatBackTrigger`,
`ChatComposerSendTrigger`, `DataTableBulkActionTrigger`, `PopconfirmConfirmTrigger`,
`InputGroupTrigger`, ...), never `*Button`/`*Action`. Drag handles stay `*Handle`;
`CalendarDayButton` is a react-day-picker slot and is exempt. Every trigger/handle is
polymorphic via `asChild`: `<KanbanAddTrigger asChild><Button>Add</Button></KanbanAddTrigger>`.
When `asChild` is set the part renders the child unchanged (no injected default icon, sr-only
text, or badge); otherwise it renders its defaults when `children` is omitted. Raw `<button>`
parts use `ark.button` so `asChild` works there too. `DataTableRowActions` takes a `trigger`
element instead of the default ellipsis button.
`src/app.tsx` is a gallery that mounts all of them.

## Data table
`src/lib/table.ts` is a dependency-free headless table engine (columns, sorting, global +
column filters with faceted counts, pagination, row selection, visibility). Column config is
data only: `{ id | accessorKey | accessorFn, label, enableSorting, enableHiding, filterFn,
sortingFn }`. No render functions and no markup in column definitions.
`src/components/ui/data-table.tsx` builds compositional parts on the source-agnostic
`DataTableInstance` contract in `src/lib/data-table-adapter.ts`: toolbar, search, faceted
filter, reset, view options, `DataTableTable` > `DataTableHeader` (one `DataTableHead
column="id"` per column; sortable columns get the sort/hide menu with `children` as the title)
+ `DataTableBody` (`children` is `(row) => cells`; wrap in `DataTableRow` or return a fragment
of `DataTableCell column="id"` cells), `DataTableEmpty`, select-all/select-row cells, row
actions, pagination pieces, bulk actions. Heads and cells keyed by a hidden column render
nothing, so visibility toggles need no extra wiring. The toolkit must not know about specific
table libraries (no TanStack). `src/demo/tasks/` and `src/demo/users/` are the reference
consumers: `columns.tsx` is pure config, `*-table.tsx` composes the markup.

## Rich text editor
`src/components/ui/rich-text-editor.tsx` is a compositional editor on **tiptap** (`@tiptap/react`,
StarterKit with link/underline, `@tiptap/extensions` Placeholder + CharacterCount, task list,
highlight, text align, image, TableKit; `extensions` appends more, `editorOptions` is the escape
hatch). The root owns the tiptap `Editor`: `defaultContent`/`content` (HTML, controlled content
replaces the doc only when it differs), `onChange({ html, json, text })`, `placeholder`,
`editable`, `autofocus`, `characterLimit`; context exposes `useRichTextEditor()` → `{ editor,
editable }`. Controls read the editor from context and re-render via `useEditorState`:
`RichTextEditorToggle name=` (pressed controls: bold/italic/underline/strike/code/highlight,
paragraph/heading1-3, bulletList/orderedList/taskList, blockquote/codeBlock, alignLeft/Center/
Right/Justify, unsetLink) and `RichTextEditorTrigger name=` (one-shot: undo/redo/horizontalRule/
clearFormatting/insertTable); both take `isActive`/`canRun`/`onToggle`/`label`/`shortcut` for
custom actions, wrap themselves in a Tooltip with a `Kbd` shortcut (`tooltip={false}` inside the
bubble menu), and are polymorphic via `asChild`. The registry is exported as `richTextActions`.
Other parts: `RichTextEditorToolbar` (role toolbar, arrow-key roving) > `ToolbarGroup` /
`ToolbarSeparator`, `RichTextEditorBlockSelect` (toolkit Select: text/headings/quote/code block),
`RichTextEditorLinkTrigger` (Popover with a URL form; empty removes), `RichTextEditorImageTrigger`
(URL form), `RichTextEditorContent` (`EditorContent` with `prose prose-sm dark:prose-invert` from
`@tailwindcss/typography`; placeholder, task list, highlight, table and selection styles live in
`src/index.css` scoped to `[data-slot="rich-text-editor-content"] .tiptap`),
`RichTextEditorBubbleMenu` (tiptap `BubbleMenu` over text selections; compose the same toggles),
`RichTextEditorFooter` + `RichTextEditorCharacterCount` (words · characters / limit, `data-over`).
`src/demo/rich-text/` is the reference (`/documents`, "Documents"): full toolbar, bubble menu,
read-only switch, reset, and an HTML/JSON/Text output card.

## Data grid
`src/components/ui/data-grid.tsx` is an editable, keyboard-driven grid on the same source-agnostic
`DataTableInstance` contract as the data table (`useDataTable` with a huge `pageSize` feeds it every
row; `DataTable` toolbar parts can wrap it). Column behaviour is a separate data-only `columns` prop
keyed by column id: `{ id, type: text|number|boolean|select|date, editable, options, width, minWidth,
pinned: left|right, format, parse }`. Edits are intents: `onCellChange({ row, columnId, value,
previous })`; the consumer owns the data. Parts (div-based, `role="grid"`): `DataGrid` (context:
layout, focus, range, editing, virtual window; `columnSizing` controllable) > `DataGridContainer`
(scroll viewport) > `DataGridHeader` > `DataGridHeaderRow` > `DataGridHead column=` (sort button
when sortable) or `DataGridHeadWithResize` (adds `DataGridResizeHandle`; double-click resets),
`DataGridBody` (`children: (row, index) => cells`, renders only the visible window plus
`overscan`, fixed `rowHeight`) > `DataGridRow` > `DataGridCell column=` (roving tabindex,
`data-focused/selected/editing/pinned/editable`; `editable` and `editor` render-prop overrides;
default editors by type, native `<select>` for select columns), `DataGridSelectAll` /
`DataGridSelectRow` (Checkbox cells for the `select` column), `DataGridEmpty`. Editors never use
native form controls: select columns open the toolkit `Select` (with `SelectTrigger
variant="unstyled"`, focus moved to the listbox content via the root `ids`), booleans render a
`Checkbox`, text/number/date use a borderless input; the cell owns the single focus ring. Pinned columns
are sticky with computed offsets. Keyboard: arrows move, Shift+arrows extend the range,
Home/End and Ctrl+Home/End jump, PageUp/Down, Enter/F2/typing edits, Enter commits + moves down,
Tab commits + moves right, Escape cancels, Space toggles booleans, Delete clears the range, ⌘C/⌘V
copy/paste TSV; a live region announces clears/copies. `src/demo/data-grid/` is the reference
(`/contacts`, "Contacts"): 500 users, pinned select + username, per-type editors, and tracked
changes with Undo / Discard / Save in a `FloatingToolbar`.

## Floating toolbar
`src/components/ui/floating-toolbar.tsx` is the snackbar-style bar that floats at the bottom of a
page (`open`, `onEscape`, arrow/Home/End roving between its buttons, Escape ignored while focus is
in a nested menu). `DataTableBulkActions` renders on it; the data grid demo uses it for unsaved
changes. Use it for any "N things pending" action bar instead of a new fixed div.

## Chat
`src/components/ui/chat.tsx` is a compositional, data-agnostic chat layout primitive
(sidebar with search and conversation list, panel with header/messages/composer, empty
state). `Chat` owns only the selected conversation id (`value`/`onValueChange`) and the
mobile list-vs-panel state; data, filtering, grouping, and sending are the consumer's.
Messages render newest-first inside a reversed column so the stream stays pinned to the
bottom. `src/demo/chat/` is the reference implementation (chats page from shadcn-admin).
`src/app.tsx` mounts the chat demo at the `/inbox` hash route inside the app shell.

## Apps
`src/demo/apps/apps-view.tsx` (demo-only, not a toolkit primitive) is a compositional "app integrations" view
(shadcn-admin apps page). `Apps` owns only the query state, each controllable
(`search`/`filter`/`sort` + `default*` + `on*Change`); items and filtering are the
consumer's (`applyAppsQuery` is an optional helper). Parts: `AppsHeader/Title/Description`,
`AppsToolbar/ToolbarGroup`, `AppsSearch`, `AppsFilter` (Select over `options`),
`AppsSort` (icon-trigger Select, asc/desc by default), `AppsSeparator`, `AppsGrid`
(scrolls inside a fixed main with `scroll-fade-b`), `AppsEmpty`, and
`AppCard/Header/Logo/Action/Body/Title/Description` (`connected` drives the
highlighted action and a `data-connected` attribute). `src/demo/apps/` is the reference
(brand icons copied from shadcn-admin) and `src/app.tsx` mounts it at `/integrations` with
`AppShellMain fixed`.

## Settings
`src/demo/settings/settings-layout.tsx` (demo-only, not a toolkit primitive) is a compositional, router-agnostic settings layout
(shadcn-admin settings pages). `Settings` owns only the active section id
(`value`/`onValueChange`, usually the href). Parts: `SettingsHeader/Title/Description`,
`SettingsSeparator`, `SettingsBody`, `SettingsNav` with `SettingsNavSelect` (Select over
`options`, shown below `md`) and `SettingsNavList` (horizontal scroller that stacks
vertically at `lg`) + `SettingsNavLink` (`value`, `asChild` anchor, sets active) +
`SettingsNavIcon`, `SettingsContent`, and `SettingsSection/Header/Title/Description/
Separator/Body` (scrolling, `scroll-fade-b`) + `SettingsSectionContent` (`lg:max-w-xl`).
Forms are the consumer's: `src/demo/settings/` rebuilds the five reference forms
(profile, account, appearance, notifications, display) on `Field*` parts with a tiny
local `useForm` helper (no react-hook-form/zod dependency) and `showSubmittedData`
(sonner). `src/app.tsx` mounts it for every `/settings*` hash route with `AppShellMain fixed`.
`SelectTrigger` has `variant="unstyled"` (layout only, no chrome) for hosts that draw their own
frame, e.g. a grid cell. Never render a native `<select>`.
Gotcha: never pass `id` to an Ark part (e.g. `ComboboxInput`, `SelectTrigger`); it breaks
Ark's internal DOM lookups. Use the root's `ids` prop (`ids={{ input, trigger, hiddenInput }}`)
when a label needs an `htmlFor` target.

## Kanban
`src/components/ui/kanban.tsx` is a compositional, data-agnostic board on
`@atlaskit/pragmatic-drag-and-drop` (+ `-hitbox` closest-edge/reorder index, `-auto-scroll`).
The consumer owns columns/cards state; `Kanban` only wires dragging and reports intents via
`onCardMove({ cardId, fromColumnId, toColumnId, fromIndex, toIndex })` and
`onColumnMove({ columnId, fromIndex, toIndex })`. `moveCard`/`moveColumn` apply those to a
`{ id, cards: { id }[] }[]` shape. Parts: `KanbanBoard` (horizontal scroller, auto-scroll),
`KanbanColumn` (`value`, drop target for cards and columns, `draggable` by its
`KanbanColumnHandle` or header), `KanbanColumnHeader/Title/Count/Actions/Content/Footer`,
`KanbanAddTrigger`, `KanbanEmpty`, `KanbanCard` (`value`, draggable + drop target with
top/bottom edges, optional `KanbanCardHandle`), `KanbanCardHeader/Title/Description/Footer`,
`KanbanDropSlot` (outlined placeholder sized like the dragged card; the root computes the
landing spot live via `preview` in context, cards render the slot before themselves and
`KanbanColumnContent` renders it at the end) and `KanbanDropIndicator` (edge line, used for
column reordering). While a landing spot exists the source card collapses (`data-collapsed`,
height 0 rather than `display:none`, which would cancel Chrome's native drag); with no
landing spot it stays in place as a dashed outline. State via `data-dragging`, `data-over`,
`data-target`, `data-edge` on the root/column/card. Indices are derived from DOM order at drop time, so cards need no index
prop. Keyboard reordering is not provided (Pragmatic leaves it to the consumer).
Keyboard: cards (and `KanbanCardHandle`/`KanbanColumnHandle`) are focusable; Space/Enter
picks up (`data-grabbed`, `aria-pressed`), arrows move within/between columns via the same
`onCardMove`/`onColumnMove` intents, Space/Enter drops, Escape cancels, focus follows the
moved item, and a visually hidden live region announces each step. Native drag previews are
crisp clones via `cloneDragPreview` in `src/lib/drag-preview.ts`.
`src/demo/kanban/` is the reference (tasks data, route `/projects/board`, `AppShellMain fixed`).

## Mock pages (demo only, no new primitives)
- `src/demo/import/`: a reusable import-mapping system with dedicated, linkable routes:
  `/import` (upload flow), `/import/mappings` (library), `/import/mappings/new` and
  `/import/mappings/:id` (editor page with back link), `/import/history` (table), and
  `/import/history/:id` (import details page with back link). The master view only hosts the
  three lists; details and the editor are their own pages so notifications can deep-link
  (see `src/demo/shell/notifications.tsx`). The sidebar keeps `/import` active for nested
  paths via the prefix rule in `src/demo/shell/router.tsx`.
  A **mapping** (`SavedMapping`, in-memory store with `useMappings`/`saveMapping`) is built
  once from a sample CSV in an editor (sample file → structure → columns → save) and remembers
  the file's header signature plus the structure: `Instance`s assembled from `objectDefs`
  (identity field, allowed parents; the same object can appear twice, e.g. a "Secondary
  contact" detected by `detectExtraCopies`; rows sharing an identity collapse into one record).
  The **Import** tab uploads a file, `matchMappings` scores saved mappings by matched headers,
  the best (≥60%) is applied with a read-only `StructureSummary`, missing/extra columns and
  estimated counts, and required gaps block the import; otherwise it offers to create a mapping
  from that file. Import is a three-step flow (select file with preview → mapping → status with
  a simulated progress run and created/updated results). The **History** tab lists every
  import with file, mapping, actor, time, rows, result, status, and a 24h Undo (Popconfirm);
  records live in the same in-memory store (`useImportHistory`, `addImport`, `updateImport`).
  Clicking a history row (or "View results" after a run) opens the **import details page**
  (`/import/history/:id`): summary stats, a per-object created/updated table, **Conflicts**
  (rows whose identity matched an existing record but differ; each field shows Existing vs
  Imported as radio-style value options, per-conflict "Keep all"/"Use imported", global
  "Use imported for all", and "Apply" commits fully decided conflicts via
  `chooseConflict`/`applyResolutions`; existing values stay until applied), and **Skipped**
  rows with reasons. Mock conflicts come from `mockConflicts` and attach when a run completes.
  No live tree preview (the user rejected it). Ark gotcha hit here: `DropdownMenuLabel` must
  be inside `DropdownMenuGroup` or opening the menu throws.
- `src/demo/tickets/` (`/tickets`, fixed main): queue list (Inbox/Mine/Unassigned/Closed
  segment views, search, status dot, unread weight, escalated-priority badge only) + one
  conversation at a time (status select in the header, customer/agent/internal-note thread,
  Reply vs Internal note composer with Send and Send & solve, ⌘↵), properties in a right
  aside at `xl` or a Sheet below, list-vs-detail on mobile, and a New ticket dialog.
Both are designed to minimise cognitive load: one decision per row, defaults filled in, only
exceptions surfaced.

## Shared hooks
`src/lib/history.ts` exports `useHistory(initial, limit)` → `{ present, set(next, { commit }),
checkpoint, undo, redo, reset, canUndo, canRedo }`; the node graph and form builder use it. Never
add a local copy. There is no native `<select>` component any more (`native-select.tsx` was
removed); always use `Select`.

## Forms
`src/lib/form.ts` exports `useForm(defaultValues, validate, onSubmit, { mode })`: a small,
dependency-free hook (values, per-field errors, validating submit) that pairs with the
`Field*` parts. It is the toolkit's one form approach; do not add react-hook-form/zod. All
demo forms use it. Shared demo-only helpers live in `src/demo/lib/` (`showSubmittedData`,
`DatePicker`).

## Conventions
- Files and directories are kebab-case (`src/app.tsx`, `csv-import-page.tsx`).
- Prettier with `prettier-plugin-tailwindcss` (`.prettierrc`: no semicolons, double quotes
  everywhere including JSX, trailing commas es5, width 120; Tailwind classes are sorted, and
  `cn`/`cva` arguments are treated as class lists). Template literals only where `${}`
  interpolation is needed; `scripts/check-quotes.mjs` enforces that since Prettier won't.
  `npm run format` writes; `npm run lint` includes `format:check`. Run format after edits.

## Guards
- Tailwind classes are linted by `eslint-plugin-better-tailwindcss` loaded as an oxlint
  `jsPlugins` entry in `.oxlintrc.json` (`entryPoint: src/index.css`): canonical classes
  (same logic as IntelliSense's `suggestCanonicalClasses`, which `.vscode/settings.json` turns
  off to avoid duplicates), no unknown/deprecated/duplicate/conflicting classes, no stray
  whitespace. `npx oxlint --fix` autofixes the canonical/deprecated ones. Class order and
  wrapping stay with Prettier.
- `npm run lint` runs oxlint, `scripts/check-slots.mjs` (fails if app/demo code sets
  `data-slot` on a toolkit part, which would override the part's own slot),
  `scripts/check-quotes.mjs`, `scripts/check-ark-parts.mjs` (fails when an Ark-backed file
  does not use every part of the Ark component it wraps, so new Ark parts surface on upgrade;
  compositions over our own wrappers are listed as exceptions in the script), and Prettier's check.
- Parts whose ids Ark looks up internally (Combobox input/trigger/content, Select
  trigger/content, Checkbox/Switch roots + control + hidden input, RadioGroup item parts,
  PasswordInput/NumberInput/TagsInput inputs, Slider thumb/hidden input) omit `id` from their
  props at the type level; use the root's `ids` prop instead.
- `npm test` runs Playwright smoke tests in `tests/` (Chromium; starts the Vite dev server on
  port 5174) covering the command dialog, kanban keyboard moves, form builder drops, and the
  notifications menu.

## Popconfirm
`src/components/ui/popconfirm.tsx` is an inline confirmation on the Popover (no modal):
`Popconfirm` (placement `top`), `PopconfirmTrigger`, `PopconfirmContent` (`role="alertdialog"`,
arrow by default), `PopconfirmHeader` > `PopconfirmIcon` (destructive triangle by default) +
`PopconfirmTitle` + `PopconfirmDescription`, `PopconfirmFooter` > `PopconfirmCancelTrigger` (closes)
+ `PopconfirmConfirmTrigger` (`onConfirm`, destructive by default, closes unless the handler calls
`preventDefault`). The form builder uses it for field removal.

## Canvas
`src/components/ui/canvas.tsx` is a compositional, data-agnostic drag-and-drop layout surface
on Pragmatic drag and drop. `Canvas` owns nothing but drag state; it reports every drop as an
intent via `onDrop({ source, target })` where `source` is `{ type: "palette", data }` (from a
`CanvasPaletteItem`, `data` passed back untouched) or `{ type: "node", id }`, and `target` is
`{ type: "node", id, edge }` (closest of top/bottom/left/right) or `{ type: "area" }`. Parts:
`CanvasPalette/PaletteItem`, `CanvasArea` (drop surface, `data-over`, auto-scroll),
`CanvasEmpty`, `CanvasRow` (flex row; node `width` is a flex-grow weight), `CanvasNode`
(`value`, `width`, `selected`, draggable via optional `CanvasNodeHandle`, four-edge drop
target with `data-edge` + `CanvasDropIndicator`), `CanvasNodeHeader/Title/Actions`, and
`CanvasResizeHandle` (pointer-driven; calls `onResize(deltaFraction)` relative to the row
width; place it between siblings). While a handle is dragged, `CanvasRow` sets
`data-resizing` and every node in that row (only that row) renders `CanvasNodeOverlay`: a
blurring overlay with a pill showing its percentage share, computed from rendered widths. Stacks palette above the area below `lg`. Keyboard: nodes (or their handle) pick up with
Space/Enter; ArrowUp/Down emit a top/bottom-edge drop on the row's first/last node (or hop
to the adjacent row when alone), ArrowLeft/Right emit a left/right-edge drop on the
neighbour; palette items are focusable and Enter/Space drops them on the area. Same live
region + clone preview approach as Kanban.
`src/demo/form-builder/` is the reference (route `/forms`), a composition only: `model.ts`
(schema `{ title, description, rows: { fields }[] }`, field types text/email/url/phone/number/
textarea/date/select/multiselect/radio/checkbox/switch + heading/paragraph/divider, `name` key
slugified from the label until edited, `options`, `validation` min/max/minLength/maxLength/
pattern, `width`, `condition: QueryGroup | null`; `applyDrop`, `resizeRow`, `updateField`,
`removeField`, `duplicateField`, `findProblems`, `serializeSchema`/`parseSchema`,
`conditionFields` mapping other fields to query-builder fields), `form-builder-page.tsx` (Canvas
with a grouped palette, node actions edit/duplicate/remove, a Drawer inspector with Basics /
Options editor / Validation (format presets or custom regex) / Visibility built from the
QueryBuilder parts, Build|Preview `SegmentGroup`, undo/redo on `src/lib/history.ts`, Import
dialog + Export/Copy JSON, problem badges) and `form-renderer.tsx` (renders a schema on the
toolkit controls with `useForm`, live conditions via the query-builder demo interpreter, hidden
fields dropped from the submission). Nothing here is use-case specific in `components/ui`.

## Node graph
`src/components/ui/node-graph.tsx` is a compositional, data-agnostic node editor (visual
scripting style). The consumer owns nodes and edges; `NodeGraph` owns only the viewport
(`viewport`/`onViewportChange`, pan/zoom), the selection (`selection`/`onSelectionChange`,
`{ nodes, edges }`), and in-flight interactions. Intents: `onNodesMove` (live) +
`onNodesMoveEnd` (once per drag/nudge), `onConnect({ source, target })` (source is always the
output side), `onConnectEnd({ source, position, client })` when released on empty space,
`onDelete(selection)`, `onDisconnect(port)` (alt+click on a pin), and `onPane/Node/Edge/PortContextMenu`
(right-click without a drag; a right-click on a node selects it first). `edgeAt(port)` enables
re-routing: return the other end of the single link on a pin and dragging that pin picks the link
up. `isValidConnection` overrides the built-in check (sides differ, nodes differ, port `type`s
match or are `any`). Parts: `NodeGraphViewport` (pane, keyboard target: Delete/Backspace,
Escape, ⌘A, arrows nudge by `snapGrid`, ⌘+/−/0; wheel zooms, pinch/ctrl always zooms,
`panOnScroll` flips plain wheel to pan; middle/right/alt drag, Space+drag, or a single touch
pans, left drag on empty space is a marquee), `NodeGraphBackground` (`dots`/`lines`),
`NodeGraphSurface` (transformed layer), `NodeGraphEdges` > `NodeGraphEdge` (`value`, `source`,
`target`, render-prop children get the midpoint; `data-type` from the source port),
`NodeGraphConnectionLine` (`data-type`, `data-valid`/`data-invalid`), `NodeGraphSelectionBox`,
`NodeGraphNode` (`value`, `position`; draggable anywhere except interactive descendants,
focusable, Space/Enter toggles selection, double-click zooms to it; extra `data-*` props pass
through, e.g. `data-active` for simulation highlights) with
`Header/Title/Subtitle/Body/Inputs/Outputs/Footer` and `NodeGraphNodeActions` (header slot for
buttons, revealed on hover/selection, never starts a drag), `NodeGraphPort` (`value`, `side`,
`type`, `connected`) > `NodeGraphPortPin` (`variant` `circle`|`exec`, colored via `text-*`,
exposes `data-node-id/port-id/side/type/connected/target`) + `NodeGraphPortLabel`,
`NodeGraphControls` > `NodeGraphZoomIn/ZoomOut/FitViewTrigger` + `NodeGraphZoomValue`,
`NodeGraphMinimap` (click/drag to pan), `NodeGraphEmpty`, and `useNodeGraph()` (viewport,
selection, `screenToGraph`, `fitView`, `zoomTo`, `centerOn`, ...). Port positions are measured
from the DOM into an internal layout store; edges subscribe to it, so nodes need no size props.
`src/demo/node-graph/` is the reference ("Automations", route `/automations`): typed pins
(exec/number/string/boolean), category-tinted headers, literal inputs on unconnected data pins,
palette (click or native drag), add-node Command popover from a dropped connection (filtered to
compatible nodes, auto-connects) or right-click on the pane, DropdownMenu context menus for nodes
(run from here, duplicate ⌘D, break all links, delete), links (break) and pins (break, reset to
default) anchored via `positioning.getAnchorRect`, a header "more" button on every node, undo/redo
history on `src/lib/history.ts`, and a **simulator** (`simulate.ts`: async generator that walks
exec pins from an event node, pulls data pins lazily, pure nodes evaluated on demand) driving
`data-active` highlights (`--animate-node-graph-flow` dashes on the live edge), per-pin value
badges, a Delay progress bar, and an Output/Variables panel with Run/Stop and speed.

## Query builder
`src/components/ui/query-builder.tsx` is a compositional filter builder designed for low cognitive
load: it reads like a sentence instead of the usual AND/OR toggles per row. One `QueryBuilderMatch`
("Match all/any of the following") per group is the only combinator control, each condition reads
field → plain-language operator → value (`is`, `is not`, `contains`, `is after`, `is any of`,
`is empty`, ...), negation lives in the operator wording (no NOT toggle), order never matters (no
drag-reorder), and incomplete conditions are flagged with `data-incomplete` and dropped by
`pruneQuery` instead of erroring. **The primitive never interprets the tree**: SQL, API payloads,
and in-memory evaluation are the consumer's job (the demo's `interpret.ts` has `toSql`, `toJson`,
`matches`). The consumer owns the tree (`value`/`onValueChange`,
`QueryGroup = { id, match: "all"|"any", rules: (QueryRule|QueryGroup)[] }`) and renders parts
recursively; the root applies edits. Fields are data (`{ name, label, type: text|number|date|
boolean|select, options, operators, placeholder }`); operators are `{ name, label, arity:
none|one|two|many, types }` with `defaultOperators` exported. Parts: `QueryBuilderGroup` (`group`,
`data-match`/`data-depth`, nested groups get a dashed panel), `GroupHeader` > `QueryBuilderMatch`
(`before`/`after` text) + `QueryBuilderRemoveTrigger` (removes the enclosing rule, or group when
used in a header), `GroupBody` (guide line), `QueryBuilderRule` (`rule`) > `FieldSelect`
(changing the field resets operator/value) + `OperatorSelect` (keeps the value when the arity
matches) + `ValueEditor` (by type/arity: text/number/date inputs, two inputs for "between",
single/multiple Select for select fields, comma list for free-text lists; render-prop child
overrides, return `undefined` to fall back) + `RuleActions` (hover-revealed), `GroupFooter` >
`AddRuleTrigger` / `AddGroupTrigger` (hidden past `maxDepth`; a new nested group starts with the
opposite match), `QueryBuilderSummary` (natural-language sentence; `prefix` prop, default
"Showing results where "), `QueryBuilderEmpty`. Helpers: `createRule`, `createGroup`, `isGroup`,
`isComplete`, `operatorsFor`, `describeQuery(tree, { fields })`, `pruneQuery`. The form builder
reuses these parts for per-field visibility conditions. `src/demo/query-builder/` is the reference
(`/segments`): filters the users dataset with quick-start presets, the sentence summary, a
live matching-rows table, and SQL/JSON output.

## Gantt
`src/components/ui/gantt.tsx` is a compositional, data-agnostic timeline. The consumer owns rows,
bars and dependency links; the root owns the time scale (`start`/`end` dates, `dayWidth`
controllable + `onDayWidthChange`, `scale` day|week|month derived from `dayWidth` unless set,
`rowHeight`, `sidebarWidth`, `editable`), the drag/resize interaction, keyboard moves, and
reports `onBarChange({ id, start, end })` snapped to whole days. Parts: `GanttViewport` (one
scroll container for both axes) > `GanttHeader` (sticky two-tier date header, tiers by scale;
`GanttHeaderCorner` is the sticky cell over the sidebar) + `GanttBody` (`GanttGridLines` with
weekend shading, `GanttToday`, `GanttRows` > `GanttRow value=` > `GanttRowLabel` (sticky sidebar
cell) + `GanttRowTrack` > `GanttBar value= start end progress` (draggable, focusable; `data-dragging`
= move|resize-start|resize-end, `data-grabbed`; children: `GanttBarLabel`, `GanttBarResizeHandle
side=start|end`) or `GanttMilestone value= date` (diamond), `GanttDependencies links=[{ from, to }]`
(orthogonal arrows measured from the registered bar elements through a small external store, so
collapsed groups and custom row order need no bookkeeping), `GanttEmpty`), `GanttControls` >
`GanttZoomIn/ZoomOutTrigger` (zoom keeps the centre date) + `GanttTodayTrigger`, and `useGantt()`
(`xOf`, `dateAt`, `scrollToDate`, ...). Keyboard on a bar: Space/Enter picks up, ←/→ move a day,
Shift+←/→ change the end, Alt+←/→ change the start, Escape cancels; a live region announces.
Gotcha: bars register with a memo keyed on timestamps; never key registrations on `Date` identity.
`src/demo/gantt/` is the reference (`/projects/timeline`, "Timeline"): phases with collapsible groups and
summary spans, milestones, dependency arrows toggle, day/week/month `SegmentGroup`, undo/redo on
`useHistory`, editable toggle, scroll to today on mount.

## Activity feed and comments
`src/components/ui/activity-feed.tsx` is a compositional timeline of events on the WAI-ARIA feed
pattern (`role="feed"`, focusable articles, PageUp/PageDown move, Ctrl+Home/End jump):
`ActivityFeed` > `ActivityFeedGroup` > `ActivityFeedGroupLabel` + `ActivityFeedItems` (draws the
connector line) > `ActivityFeedItem value=` > `ActivityFeedItemMarker` (dot by default; pass an
icon or an Avatar) + `ActivityFeedItemContent` > `ActivityFeedItemHeader` > `ActivityFeedItemActor`,
`ActivityFeedItemTime date=` (`<time>` with a relative label from `src/lib/time.ts`
`formatRelativeTime`; full date in the title), `ActivityFeedItemBody`, `ActivityFeedItemActions`;
plus `ActivityFeedLoadMoreTrigger` and `ActivityFeedEmpty`. Data, grouping and read state are the
consumer's.
`src/components/ui/comment-thread.tsx` is compositional comments with replies, reactions and a
mentions composer. `CommentThread { people, currentUserId, replyTo/onReplyToChange }` owns only
which comment is being replied to or edited (`useCommentThread()` → `replyTo`, `editing`, setters).
Parts: `CommentList` > `Comment value= authorId=` (`data-own/replying/editing/depth`) >
`CommentAvatar` (initials from `people`) + `CommentContent` > `CommentHeader` > `CommentAuthor`,
`CommentTime date=`, `CommentMeta`; `CommentBody text=` (plain text with `@Full Name` mentions
highlighted as `CommentMention`, `data-self` for the current user); `CommentReactions` >
`CommentReaction emoji= count= active=`; `CommentActions` (hover-revealed) > `CommentReplyTrigger`,
`CommentEditTrigger`; `CommentReplies` (nested list with a guide line); `CommentEmpty`.
`CommentComposer { people, value/onValueChange, onSubmit({ text, mentions }), onCancel }` >
`CommentComposerReplyingTo` (render prop gets the comment id), `CommentComposerInput` (a
contenteditable, not a textarea: picked mentions become atomic grey chips
`[data-slot=comment-mention-chip]` that one Backspace removes, while `value` stays plain
`@Full Name` text and `defaultValue`/`value` text is hydrated back into chips;
`@query` at the caret opens `CommentComposerMentionList` (a portaled Popover anchored to the input, focus stays in the textarea, so no `overflow-hidden` ancestor clips it and nothing shifts), arrows/Enter/Tab pick, Escape closes,
⌘/Ctrl+Enter submits, `aria-activedescendant` wired), `CommentComposerFooter` >
`CommentComposerHint`, `CommentComposerCancelTrigger`, `CommentComposerSubmitTrigger`. Mentions are
plain `@Full Name` text; `extractMentions(text, people)` returns ids. The same composer edits in
place (`defaultValue`, Save). `src/demo/activity/` is the reference (`/activity`): grouped feed
with All/Mentions/Comments filter, unread dots, load more, and a ticket thread with nested
replies, reactions, edit/delete of own comments (Popconfirm), and posting that also prepends a
feed item.

## Scheduler (calendar)
`src/components/ui/scheduler.tsx` is a compositional, data-agnostic calendar. The consumer owns
events and renders them with the parts; the root owns the anchor `date` and `view`
(day|week|month, both controllable), the time-grid geometry (`hourHeight`, `slotMinutes`,
`minHour`/`maxHour`, `weekStartsOn`), the interactions, and reports `onEventChange({ id, start,
end })` and `onCreate({ start, end })` snapped to `slotMinutes`. Parts: `SchedulerToolbar` >
`Prev/Next/TodayTrigger`, `SchedulerTitle`, `SchedulerViewSelect` (SegmentGroup);
`SchedulerTimeGrid` > `SchedulerTimeGridHeader` > `SchedulerDayHeadings` (click a day → day view)
+ `SchedulerAllDayRow` (render prop per day) and `SchedulerTimeGridBody` (scrolls to 8am on mount)
> `SchedulerTimeGutter` + `SchedulerDayColumns` > `SchedulerDayColumn date= events=` (render-prop
children per event; computes side-by-side lanes for overlaps via `layoutLanes`; pointer-down on
empty time starts drag-to-create) > `SchedulerEvent value= start= end=` (absolute by time;
draggable to another time/day, `data-dragging` move|resize, `data-grabbed`) > `SchedulerEventTitle`,
`SchedulerEventTime` (reflects the live drag), `SchedulerEventResizeHandle`; `SchedulerNowIndicator`,
`SchedulerCreatePreview`. `SchedulerMonthGrid` > `SchedulerMonthHeader` + `SchedulerMonthBody` >
`SchedulerMonthCell date=` (`data-today`/`data-outside`, day number → day view) > `SchedulerMonthEvent`
(chip draggable between cells; shifts by whole days) + `SchedulerMonthMore`. Keyboard on an event:
Space/Enter picks up, ↑/↓ move by a slot, ←/→ move a day, Shift+↑/↓ change the end, Escape cancels;
a live region announces. Event parts spread `props` first so an `asChild` wrapper (e.g.
`PopoverTrigger`) cannot override their `data-slot` or pointer handlers. `useScheduler()` exposes
`days`, `range`, `timeToY`, `setDate`, `setView`. `src/demo/calendar/` is the reference
(`/projects/calendar`): categories with colors, all-day strip, overlapping meetings in lanes, event popover
(title, category, delete), new-event dialog from drag-to-create or the toolbar, undo/redo.

## Dashboard widgets (rows and columns on Canvas)
There is no separate widget-grid primitive or widgets page: the dashboard's Overview tab is a
customizable widget board using the same rows-and-columns model as the form builder, on the
`Canvas` primitive (drop above/below a widget for a new row, beside it for a column,
`CanvasResizeHandle` between siblings; a vertical keyboard move on a node with siblings pulls it
out into its own row). The pure layout helpers live in `src/lib/row-layout.ts`
(`applyRowDrop(rows, details, { create, rowId })`, `resizeRowItems`, `removeRowItem`; a layout
is `{ id, items: { id, width }[] }[]`) and are shared by the form builder model and
`src/demo/dashboard/widgets.tsx` (`DashboardWidgets`): a widget catalog as the palette,
`CanvasNode` cards with a header (handle, title, remove), a Customize switch (`Canvas` palette
and handles only when on), and Save / Reset persisted in `localStorage` (demo only).

## Tree select and cascader
Both live on Ark's `TreeCollection` (`createTreeCollection`, re-exported) and a Popover, and own
only the open state, the search query, and the value (`value`/`defaultValue`/`onValueChange`,
always a `string[]`); the trigger is a focusable `div[role=combobox]` via `PopoverTrigger asChild`
so chips and clear buttons inside it stay real buttons. Both use `src/lib/controllable.ts`
`useControllable(controlled, default, onChange)` (the shared controllable-state hook; prefer it
over local copies).
`src/components/ui/tree-select.tsx`: `TreeSelect { collection, multiple, selectableBranches,
closeOnSelect, expandedValue…, open…, disabled, readOnly, invalid }` > `TreeSelectTrigger`
(`size`, `variant="unstyled"`; Enter/Space/ArrowDown open, Backspace removes the last chip) >
`TreeSelectValue` (labels joined, render-prop child gets the nodes) or `TreeSelectChips` >
`TreeSelectChip node=` (remove button), `TreeSelectClearTrigger`, `TreeSelectIndicator`;
`TreeSelectContent` (same width as the trigger) > `TreeSelectSearch` (filters the collection with
ancestors kept and auto-expands matches; ArrowDown moves into the tree), `TreeSelectTree`
(renders the toolkit `TreeView` parts recursively through `TreeSelectNode`; render-prop child
customises the row label), `TreeSelectEmpty`; `TreeSelectHiddenInput name=`. Multiple mode is
Ark checkbox semantics: `value` holds leaf values only, a branch toggles all its leaves, and
`collapseValues(collection, value)` (used by the value/chips) shows a fully selected branch as one
chip. Single mode ignores branch picks unless `selectableBranches`. `useTreeSelect()` exposes it all.
`src/components/ui/cascader.tsx`: `Cascader { collection, changeOnSelect, expandTrigger:
click|hover, open…, disabled, readOnly, invalid }` > `CascaderTrigger` > `CascaderValue`
(the path as "A / B / C", `separator`, render-prop child gets the path nodes), `CascaderClearTrigger`,
`CascaderIndicator`; `CascaderContent` (owns the keyboard: ↑/↓ within a column, → opens a branch,
← back to the parent, Home/End, Enter/Space activates) > `CascaderSearch` (matches every level,
flat results replace the columns), `CascaderColumns` (`role="tree"`, `aria-activedescendant`;
column `i + 1` lists the children of `expandedPath[i]`; render-prop child customises items) >
`CascaderColumn depth=` > `CascaderItem node=` (`data-branch/expanded/selected/highlighted/disabled`)
> `CascaderItemText` + `CascaderItemIndicator` (chevron on branches, check on the selected leaf),
`CascaderSearchResults` > `CascaderSearchResult path=`, `CascaderEmpty`, `CascaderHiddenInput`.
Picking a leaf closes; a branch opens the next column and, with `changeOnSelect`, is itself the
value. Opening starts from the current value's path. `useCascader()` exposes it all.
`src/demo/pickers/` is the reference (`/access`, "Roles & access"): folder picker with branches selectable and
icons, people/teams multi-select with chips, hover-expanding location cascader with search, and a
change-on-select category cascader.

## Transfer list
`src/components/ui/transfer-list.tsx` moves items between two lists. `TransferList { items,
itemToValue, itemToString, itemDisabled, value/defaultValue/onValueChange({ value, items, moved,
direction }), filter, disabled, titles }` owns the per-side search, selection (ticks), and focus;
`value` is the target side and is always kept in catalog order (moving never reorders). Parts:
`TransferListPanel side="source"|"target"` > `TransferListPanelHeader` > `TransferListSelectAll`
(toolkit Checkbox over the visible enabled rows, indeterminate) + `TransferListPanelTitle` +
`TransferListPanelCount` ("selected / total"), `TransferListSearch` (per side; select-all and
move-all respect it), `TransferListItems` (`role="listbox"`, roving focus; ↑/↓, Shift+↑/↓ and
Shift+click extend, Space ticks, Enter or double-click moves the focused item across, ⌘/Ctrl+A
ticks all visible; render-prop child customises the label) > `TransferListItem item=`
(`data-selected/disabled`) > `TransferListItemIndicator` (checkbox-styled span) +
`TransferListItemText`, `TransferListEmpty`; `TransferListControls` > `TransferListMoveTrigger
direction="right"|"left"` (selected items; disabled when nothing is ticked) and
`TransferListMoveAllTrigger` (all visible), both polymorphic via `asChild`; a live region announces
moves. Disabled items never move. `/access` has the reference (permissions with group badges).

## Virtual list
`src/components/ui/virtual-list.tsx` is a dependency-free windowed list. `VirtualList { count,
estimateSize (number or per index), overscan, gap, paddingStart/End, getItemKey, onRangeChange }`
owns scroll offset, viewport size, and measured row heights (prefix sums + binary search; rows
measure themselves with a ResizeObserver and estimates are replaced as rows appear). Parts:
`VirtualListViewport` (the scroll container; **the consumer gives it a height**, it must never be
`flex-1` in an auto-height column or it grows to the whole content and renders every row) >
`VirtualListContent` (sized to `totalSize`) > `VirtualListItems` (render-prop child gets
`{ index, key, start, size, measured }` and returns a `VirtualListItem index=`, absolutely
positioned via translateY, `data-index`), `VirtualListEmpty`. `useVirtualList()` exposes `items`,
`range`, `totalSize`, `scrollToIndex(index, { align: auto|start|center|end })` (re-aims a few times
while estimated rows get measured) and `scrollToOffset`. Keyboard is the consumer's: keep focus on
the viewport with `aria-activedescendant` and call `scrollToIndex` for the active row, as the
contacts listbox in `src/demo/virtual-list/` does (`/audit-log`, "Audit log": a 100k-line log with mixed
heights and go-to-line, and a 10k-contact listbox with search).

## Shared infrastructure
- `src/lib/controllable.ts` `useControllable(controlled, default, onChange)` is the one
  controllable-state hook (updater functions accepted; `onChange` fires in both modes, not on
  no-op sets). Every primitive and demo composition uses it (chat, menubar, comment thread, gantt,
  scheduler, data grid, query builder, tree select, cascader, transfer list, the table engine,
  apps view, settings layout). Never hand-roll `valueProp ?? internal` again.
- `src/components/ui/live-region.tsx`: `useLiveRegion({ clearAfter })` → `{ message, announce }`
  (re-fires identical text) and `<LiveRegion message= assertive? />` (sr-only `role="status"`).
  Kanban, canvas, gantt, scheduler, node graph, data grid, data table bulk actions, and transfer
  list all announce through it; a primitive renders its own `LiveRegion` (with its `data-slot`)
  so it works without any provider.
- `src/components/ui/hotkeys.tsx`: `HotkeysProvider` (one document keydown listener; chords like
  `mod+k` where `mod` is ⌘ on Mac and Ctrl elsewhere, sequences like `g d` with a 1s window,
  ignores typing in inputs unless `allowInInput`, built-in `?` toggles the dialog;
  `dialogHotkey={null}` disables), `useHotkey(hotkey, handler, { label, group, enabled,
  allowInInput })` registers for the component's lifetime (labelled ones appear in the dialog),
  `useHotkeys()` (grouped list), `HotkeysDialog` (the cheat sheet on `Dialog`; `useHotkeysDialog()`
  opens it), `HotkeyKbd hotkey=` (platform-aware `Kbd` caps, "then" between sequence steps),
  `formatHotkey`/`parseHotkey`. The shell demo wraps everything in the provider with
  `AppShell searchShortcut={false}` and registers ⌘K, ⌘J (theme), and `g` + letter navigation in
  `ShellHotkeys`; the user menu has a "Keyboard shortcuts" item. Pages register their own with
  `useHotkey` and a `group`.

## Demo app structure (SaaS layout)
The demo is organised as a product, not a component list. Nav groups in `src/demo/shell/nav-data.tsx`
and routes in `src/app.tsx`: **Home** Dashboard `/`; **Work** Projects (collapsible: Tasks
`/projects/tasks`, Board `/projects/board`, Timeline `/projects/timeline`, Calendar
`/projects/calendar`), Documents `/documents` (rich text), Forms `/forms` (form builder),
Automations `/automations` (node graph); **Customers** Contacts `/contacts` (data grid), Segments
`/segments` (query builder), Inbox `/inbox` (chat), Tickets `/tickets`, Activity `/activity`;
**Data** Import `/import…`, Integrations `/integrations` (apps), Audit log `/audit-log` (virtual
list); **Organization** Members `/members` (users table), Roles & access `/access` (tree select,
cascader, transfer list), Settings `/settings…`; **Other** Help Center, auth and error pages.
`src/demo/auth/` holds the sign in, sign up, and forgot password pages (`/sign-in`, `/sign-up`,
`/forgot-password`), rendered outside the shell in `AuthLayout` (centered card, brand mark, terms
footer) on `Field*` + `Input` + `PasswordInput` with `useForm`; sign in and sign up navigate home
on success, forgot password flips to a "check your inbox" state, and the user menu's Sign out goes
to `/sign-in`. `src/demo/errors/` holds the full-page error states on one `ErrorPage` composition (code, title,
description, optional icon and extra actions, Go back + Back to home): 401 `/errors/unauthorized`
(Sign in), 403 `/errors/forbidden` (Request access), 404 `/errors/not-found`, 500
`/errors/internal-server-error` (Try again), 503 `/errors/maintenance-error` (View status). Any
path outside `knownExact`/`knownPrefixes` in `src/app.tsx` renders the 404 with the path; add new
routes there. `legacyRoutes` in `src/app.tsx` redirects the old component-named paths (`/kanban`, `/pickers`,
…) so bookmarks and docs keep working; `fixedRoutes` lists the viewport-height pages. Page
headings use the product names. The command menu is generated from the nav, notifications
deep-link into `/inbox`, `/members`, `/projects/tasks`, and `/import/...`, and `g` + letter
hotkeys go to dashboard, tasks, board, calendar, import, settings.

## App shell
`src/components/ui/app-shell.tsx` is a compositional, router-agnostic shell built on
`sidebar.tsx` (shadcn-admin layout): `AppShell` (context: sidebar variant/collapsible,
search open state, `searchShortcut` for cmd/ctrl+K), `AppShellSidebar` + `AppShellBrand*`,
`AppShellNav*` (groups, links with `active`, badges, `AppShellNavCollapsible` that becomes
a dropdown flyout when the sidebar is icon-collapsed), `AppShellUser*`, `AppShellContent`,
`AppShellHeader` (fixed/sticky with scroll shadow, includes the sidebar trigger),
`AppShellHeaderActions`, `AppShellMain` (`fixed` = viewport-height, `fluid` = full width),
`AppShellTopNav*`, `AppShellSearch` + `AppShellCommandDialog` (bound to shell search
state; nest a `Command` inside), `AppShellNotifications*` (Popover-based bell with a `count`
badge on the trigger; header/title/action, list, `AppShellNotificationItem` with `unread` +
`asChild` surface, icon/content/title/description/time/indicator, empty, footer; data and read
state are the consumer's), and `AppShellThemeToggle` (`theme`/`onThemeChange`, no theme
library assumed). Header icon buttons use `size="icon-lg"` (size-9, `scale-95 rounded-full`)
and `AppShellHeaderActions` uses the header's `gap-3 sm:gap-4` to match shadcn-admin. Navigation is plain anchors with `asChild` so any router works.
`src/demo/shell/` is the reference (nav data, hash router, team/user menus, command menu)
and `src/app.tsx` wraps every demo route in it. `AppShellDemo` takes `headerStart` for
page-specific header content (the dashboard passes its `AppShellTopNav` + `AppShellTopNavMenu`).

## Dashboard
`src/demo/dashboard/` is the shadcn-admin dashboard at `/`: top nav in the header, a
`SegmentGroup` switcher (Overview / Analytics, two disabled) driving controlled `Tabs` content; Overview is the `DashboardWidgets` board (see below), Analytics uses `StatCard`s on `Card`, an Overview bar chart and an
Analytics area chart on `ChartContainer` (`var(--color-*)` from `ChartConfig`, `ChartTooltip`,
`ChartLegend`), recent sales list on `Avatar`, and simple CSS bar lists. Data is seeded
(deterministic) in `data.ts`. No new primitives were needed.

## Scope of `src/components/ui`
Only reusable primitives live there. Page-shaped compositions (settings layout, apps view)
live under `src/demo/<page>/`. `chat.tsx` stays in the toolkit as reusable parts imported by
the chat demo page. Do not mention shadcn, shadcn-admin, or its author in code comments or
demo markup; the demo persona is "Alex Morgan" (alex.morgan@example.com, initials AM) and the
demo brand is "UI Toolkit".

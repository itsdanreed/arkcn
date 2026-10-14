/** Extensions use independent upstream patterns, not same-name component counterparts. */
export const relatedPatterns: Record<string, { source: string; sourcePath?: string; label: string }> = {
  scheduler: {
    source: "item",
    label:
      "Button + Tabs + Item; calendar layout is a fixture, scheduling, overlap, creation, and resizing are arkcn extensions",
  },
  "rich-text-editor": {
    source: "toggle",
    label: "Toggle + Button + Select + Separator; document layout is a fixture, editing and selection use tiptap",
  },
  "query-builder": {
    source: "select",
    label:
      "Select + Input + Button controls; recursive groups, guide lines, summary, and incomplete rules are arkcn extensions",
  },
  "node-graph": {
    source: "item",
    label:
      "Item outline and typography + Button zoom controls; graph layout, ports, edges, minimap, and selection are arkcn extensions",
  },
  kanban: {
    source: "item",
    label:
      "Item outline and typography + Button drag handles + Badge counts; board surfaces, drag slots, and reorder behavior are arkcn extensions",
  },
  "image-cropper": {
    source: "slider",
    label:
      "Button + Slider controls and thumb treatment; image viewport, crop mask, grid, and resize geometry are Ark extensions",
  },
  gantt: {
    source: "table",
    label:
      "Button toolbar + Table row typography and hover; time scale, task bars, progress overlays, milestones, and dependencies are Ark extensions",
  },
  canvas: {
    source: "resizable",
    label:
      "Button palette and drag handles + Item title + Resizable grip; node surfaces, layout, drop indicators, and drag behavior are Ark extensions",
  },
  "app-shell": {
    source: "sidebar",
    sourcePath: "apps/v4/registry/bases/base/blocks/sidebar-07/page.tsx",
    label:
      "Sidebar-07 recipes + raw Button, Command, Popover, and Item controls; search layout and notification composition are fixture adaptations, unread decoration is an Ark extension",
  },
  "data-grid": {
    source: "table",
    sourcePath: "apps/v4/registry/bases/base/blocks/dashboard-01/components/data-table.tsx",
    label:
      "Dashboard Table/Input + raw Checkbox, Button, and Select; cell ranges, compact editing, pinning, resize, and virtualization are Ark extensions",
  },
  "data-table": {
    source: "table",
    sourcePath: "apps/v4/app/(app)/examples/tasks/components/data-table.tsx",
    label:
      "Shadcn task-table controls + dashboard drag-handle styling; bulk toolbar, numbered pagination, and reorder behavior are Ark extensions",
  },
  frame: {
    source: "chart-iframe",
    sourcePath: "apps/v4/components/chart-iframe.tsx",
    label:
      "Shadcn ChartIframe appearance and entry fade + isolated Input/Button; React portals and head injection are Ark extensions",
  },
  highlight: {
    source: "input",
    label:
      "Input + Label query controls and plain-text baseline; inline marks and matching are Ark extensions, with no shadcn counterpart",
  },
  toc: {
    source: "docs-toc",
    sourcePath: "apps/v4/components/docs-toc.tsx",
    label: "Shadcn docs TOC list; moving indicator and multiple active headings are Ark extensions",
  },
  "activity-feed": {
    source: "item",
    label:
      "Item typography and focus treatment + Empty + Button; timeline, markers, and event layout are arkcn extensions",
  },
  "json-tree-view": {
    source: "sidebar",
    label:
      "Compact Sidebar rows and focus states; JSON typography, syntax colors, indentation, and tree motion are Ark extensions",
  },
  "virtual-list": {
    source: "item",
    label: "Item rows + Empty + Button; measured windowing and native scrolling are arkcn extensions",
  },
  chat: {
    source: "input-group",
    label:
      "Input Group + Item + Empty + Bubble + Message footer typography; timestamp placement and responsive panes are arkcn extensions",
  },
  "comment-thread": {
    source: "input-group",
    label: "Input Group composer + Avatar + Button; replies, reactions, and mentions are arkcn extensions",
  },
  marquee: {
    source: "badge",
    label: "Badge content + Button controls; scrolling, repetition, and edge fades are Ark extensions",
  },
  swap: {
    source: "button",
    label: "Button icon, pressed, disabled, and focus states; icon crossfade is an Ark extension",
  },
  tour: {
    source: "dialog",
    label: "Dialog and Popover surfaces + Button; spotlight, targeting, and step navigation are Ark extensions",
  },
  "qr-code": {
    source: "button",
    label: "Button download states; QR matrix, frame, overlay, and encoding are Ark extensions",
  },
  "signature-pad": {
    source: "textarea",
    label: "Label + Textarea surface states + Button; signature strokes, guide, and canvas geometry are Ark extensions",
  },
  timer: {
    source: "button",
    label: "Button action states; timer digits, countdown, and control visibility are Ark extensions",
  },
  "floating-panel": {
    source: "popover",
    label: "Popover surface + Title + Button; panel layout, dragging, resizing, and stages are Ark extensions",
  },
  steps: {
    source: "progress",
    label: "Button + Progress + Separator; step indicators and flow layout are Ark extensions",
  },
  "floating-toolbar": {
    source: "popover",
    label:
      "Popover surface + Button + Input + Separator; floating position and keyboard navigation are arkcn extensions",
  },
  "angle-slider": {
    source: "slider",
    label: "Label + Slider thumb; circular track, markers, and rotation are Ark extensions",
  },
  "rating-group": {
    source: "radio-group",
    label: "Label + Radio Group focus treatment; stars, half-ratings, and preview are Ark extensions",
  },
  "color-picker": {
    source: "input-group",
    label: "Label + Input Group + Popover + Button; color area and gradients are Ark extensions",
  },
  cascader: {
    source: "select",
    label: "Select trigger + Input Group + Popover + Combobox Empty; cascading paths are an arkcn extension",
  },
  "transfer-list": {
    source: "checkbox",
    label:
      "Checkbox + Input Group + Button + navigation rows; dual-panel layout and transfer behavior are arkcn extensions",
  },
  "tree-view": {
    source: "sidebar",
    label: "Sidebar navigation rows + Checkbox + Input + Label; hierarchy and mixed state are arkcn extensions",
  },
  "tree-select": {
    source: "combobox",
    label: "Select trigger + Combobox chips + Popover; tree selection is an arkcn extension",
  },
  hotkeys: { source: "kbd", label: "Kbd + Dialog; shortcut registration and grouped layout are arkcn extensions" },
  splitter: { source: "resizable", label: "Resizable dividers and grips; panel sizing uses Ark Splitter" },
  "number-input": { source: "input", label: "Input + Label; stepper is an arkcn extension" },
  "password-input": { source: "input-group", label: "Input Group + Label + icon button" },
  editable: { source: "input", label: "Input + Label while editing; preview is an arkcn extension" },
  "tags-input": {
    source: "combobox",
    label: "Combobox chips + Label; free-form entry and editing are arkcn extensions",
  },
  "segment-group": {
    source: "tabs",
    label: "Tabs selected surfaces; radio semantics and moving indicator are arkcn extensions",
  },
  "pin-input": { source: "input", label: "Input + Label; digit navigation is an arkcn extension" },
  clipboard: { source: "input", label: "Input + Label + outline icon button; copied state is an arkcn extension" },
  fieldset: { source: "field", label: "FieldSet + FieldLegend + FieldDescription + FieldError" },
  "download-trigger": { source: "button", label: "Button; file creation and download are Ark behavior" },
  "file-upload": { source: "attachment", label: "Attachment + Label + Button + Empty; upload behavior uses Ark" },
  "date-picker": {
    source: "calendar",
    label: "Calendar + Input Group + Label + Popover; Ark date navigation and anchoring",
  },
  "date-input": { source: "input", label: "Input + Label field styling; segmented editing is an Ark extension" },
  listbox: { source: "command", label: "Command list and items + Input + Label; multi-selection uses Ark semantics" },
  popconfirm: {
    source: "popover",
    label: "Popover + confirmation buttons; anchored confirmation is an arkcn extension",
  },
}

/** Source-reviewed helpers with no visible default component styling. Not behavior certification. */
export const nonvisualControls: Record<string, string> = {
  "client-only": "Controls when children mount; appearance comes from its children.",
  "focus-trap": "Controls focus containment; supplies no visual classes.",
  format: "Returns locale-formatted text; typography is inherited from the caller.",
  "live-region": "Uses sr-only to hide announcements visually; screen-reader behavior needs separate validation.",
  portal: "Changes where children mount; appearance comes from its children.",
  presence: "Controls mounting and presence; animation styles are supplied by the caller.",
}

import index from "../../registry/index.json"

export type RegistryEntry = {
  name: string
  type: "ui" | "lib" | "hook"
  description: string
  ark?: string
  exports: string[]
  dependencies: string[]
  registryDependencies: string[]
  files: string[]
  css: boolean
}
export type PropDoc = {
  name: string
  type: string
  required: boolean
  default?: string
  description?: string
  from: string
}
export type PartDoc = { name: string; props: PropDoc[] }
export type RegistryItem = Omit<RegistryEntry, "files" | "dependencies" | "css"> & {
  parts?: PartDoc[]
  files: { path: string; content: string }[]
  dependencies: Record<string, string>
  css?: string
  docs?: string
}

export const registry = index as unknown as {
  name: string
  version: string
  baseDependencies: Record<string, string>
  items: RegistryEntry[]
}
export const version = registry.version

const itemModules = import.meta.glob<{ default: RegistryItem }>("../../registry/items/**/*.json")

export async function loadItem(name: string): Promise<RegistryItem | null> {
  const loader = itemModules[`../../registry/items/${name}.json`]
  if (!loader) return null
  return (await loader()).default
}

/** Sidebar grouping. Anything not listed lands in "Other". */
export const groups: { title: string; names: string[] }[] = [
  {
    title: "Layout",
    names: [
      "accordion",
      "aspect-ratio",
      "card",
      "collapsible",
      "resizable",
      "splitter",
      "scroll-area",
      "separator",
      "sidebar",
      "app-shell",
      "tabs",
      "table",
      "item",
      "empty",
      "kbd",
    ],
  },
  {
    title: "Forms",
    names: [
      "button",
      "button-group",
      "checkbox",
      "color-picker",
      "combobox",
      "date-input",
      "date-picker",
      "editable",
      "field",
      "fieldset",
      "file-upload",
      "form",
      "input",
      "input-group",
      "listbox",
      "input-otp",
      "label",
      "number-input",
      "password-input",
      "pin-input",
      "radio-group",
      "rating-group",
      "segment-group",
      "select",
      "slider",
      "angle-slider",
      "switch",
      "tags-input",
      "textarea",
      "toggle",
      "toggle-group",
      "signature-pad",
    ],
  },
  {
    title: "Overlays",
    names: [
      "alert-dialog",
      "dialog",
      "drawer",
      "sheet",
      "popover",
      "popconfirm",
      "hover-card",
      "tooltip",
      "dropdown-menu",
      "context-menu",
      "menubar",
      "command",
      "floating-panel",
      "tour",
    ],
  },
  {
    title: "Navigation",
    names: ["breadcrumb", "navigation-menu", "pagination", "steps", "toc", "tree-view"],
  },
  {
    title: "Feedback",
    names: [
      "alert",
      "badge",
      "progress",
      "skeleton",
      "sonner",
      "toast",
      "spinner",
      "timer",
      "marquee",
      "swap",
      "avatar",
      "clipboard",
      "format",
      "qr-code",
      "image-cropper",
      "json-tree-view",
      "carousel",
      "chart",
      "calendar",
      "bubble",
      "message",
      "attachment",
      "marker",
    ],
  },
  {
    title: "Pickers",
    names: ["tree-select", "cascader", "transfer-list", "virtual-list"],
  },
  {
    title: "Data",
    names: [
      "data-table",
      "data-grid",
      "kanban",
      "gantt",
      "scheduler",
      "query-builder",
      "activity-feed",
      "comment-thread",
      "chat",
      "rich-text-editor",
      "node-graph",
      "canvas",
      "floating-toolbar",
    ],
  },
  {
    title: "Infrastructure",
    names: [
      "hotkeys",
      "live-region",
      "direction",
      "client-only",
      "download-trigger",
      "focus-trap",
      "frame",
      "highlight",
      "portal",
      "presence",
    ],
  },
]

export function groupedComponents() {
  const ui = registry.items.filter((i) => i.type === "ui")
  const placed = new Set<string>()
  const out = groups.map((g) => ({
    title: g.title,
    items: g.names
      .map((n) => ui.find((i) => i.name === n))
      .filter((i): i is RegistryEntry => !!i)
      .map((i) => {
        placed.add(i.name)
        return i
      }),
  }))
  const rest = ui.filter((i) => !placed.has(i.name))
  if (rest.length) out.push({ title: "Other", items: rest })
  return out.filter((g) => g.items.length)
}

export const title = (name: string) =>
  name
    .split("-")
    .map((w) =>
      w === "ui" || w === "otp" || w === "qr" || w === "json" || w === "toc"
        ? w.toUpperCase()
        : w[0].toUpperCase() + w.slice(1)
    )
    .join(" ")

import * as React from "react"
import {
  ActivityIcon,
  CreditCardIcon,
  DollarSignIcon,
  LayoutGridIcon,
  ListTodoIcon,
  RotateCcwIcon,
  SaveIcon,
  StickyNoteIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Canvas,
  CanvasArea,
  CanvasEmpty,
  CanvasNode,
  CanvasNodeActions,
  CanvasNodeHandle,
  CanvasNodeHeader,
  CanvasNodeTitle,
  CanvasPalette,
  CanvasPaletteItem,
  CanvasResizeHandle,
  CanvasRow,
} from "@/components/ui/canvas"
import { Checkbox } from "@/components/ui/checkbox"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Analytics } from "./analytics"
import { Overview } from "./overview"
import { RecentSales } from "./recent-sales"
import { applyRowDrop, removeRowItem, resizeRowItems, type Row } from "@/lib/row-layout"
import { cn } from "@/lib/utils"

/* ------------------------------- catalog -------------------------------- */

type WidgetDef = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  render: () => React.ReactNode
}

function Stat({ value, hint }: { value: string; hint: string }) {
  return (
    <div className="flex flex-col justify-center py-1">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

const tasks = [
  { id: "t1", title: "Ship widget rows", done: true },
  { id: "t2", title: "Review calendar PR", done: false },
  { id: "t3", title: "Write release notes", done: false },
  { id: "t4", title: "Plan tree select", done: false },
]

function TasksWidget() {
  const [done, setDone] = React.useState(() => new Set(tasks.filter((t) => t.done).map((t) => t.id)))
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-center gap-2">
          <Checkbox
            checked={done.has(t.id)}
            onCheckedChange={({ checked }) =>
              setDone((prev) => {
                const next = new Set(prev)
                if (checked === true) next.add(t.id)
                else next.delete(t.id)
                return next
              })
            }
            aria-label={t.title}
          />
          <span className={cn(done.has(t.id) && "text-muted-foreground line-through")}>{t.title}</span>
        </li>
      ))}
    </ul>
  )
}

const catalog: WidgetDef[] = [
  {
    id: "revenue",
    title: "Total revenue",
    icon: DollarSignIcon,
    render: () => <Stat value="$45,231.89" hint="+20.1% from last month" />,
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    icon: UsersIcon,
    render: () => <Stat value="+2,350" hint="+180.1% from last month" />,
  },
  {
    id: "sales",
    title: "Sales",
    icon: CreditCardIcon,
    render: () => <Stat value="+12,234" hint="+19% from last month" />,
  },
  {
    id: "active",
    title: "Active now",
    icon: ActivityIcon,
    render: () => <Stat value="+573" hint="+201 since last hour" />,
  },
  { id: "overview", title: "Overview", icon: ActivityIcon, render: () => <Overview /> },
  { id: "recent", title: "Recent sales", icon: UsersIcon, render: () => <RecentSales /> },
  { id: "analytics", title: "Analytics", icon: ActivityIcon, render: () => <Analytics /> },
  { id: "tasks", title: "My tasks", icon: ListTodoIcon, render: () => <TasksWidget /> },
  {
    id: "notes",
    title: "Notes",
    icon: StickyNoteIcon,
    render: () => (
      <Textarea
        defaultValue="Follow up with Acme about the export limit before Friday."
        className="min-h-24 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        aria-label="Notes"
      />
    ),
  },
]
const defById = (id: string) => catalog.find((w) => w.id === id)

/* -------------------------------- layout -------------------------------- */

type Widget = { id: string; width: number }
type Layout = Row<Widget>[]

let seq = 0
const rowId = () => `row-${Date.now().toString(36)}-${(seq++).toString(36)}`

const defaultLayout = (): Layout => [
  {
    id: rowId(),
    items: [
      { id: "revenue", width: 1 },
      { id: "subscriptions", width: 1 },
      { id: "sales", width: 1 },
      { id: "active", width: 1 },
    ],
  },
  {
    id: rowId(),
    items: [
      { id: "overview", width: 1.4 },
      { id: "recent", width: 1 },
    ],
  },
  {
    id: rowId(),
    items: [
      { id: "tasks", width: 1 },
      { id: "notes", width: 1 },
    ],
  },
]

const STORAGE_KEY = "ui-toolkit.dashboard.layout"

function loadLayout(): Layout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultLayout()
    const parsed = JSON.parse(raw) as Layout
    const valid =
      Array.isArray(parsed) && parsed.every((r) => Array.isArray(r.items) && r.items.every((i) => defById(i.id)))
    return valid ? parsed : defaultLayout()
  } catch {
    return defaultLayout()
  }
}

const serialize = (layout: Layout) =>
  JSON.stringify(layout.map((r) => r.items.map((i) => [i.id, Number(i.width.toFixed(3))])))

/* --------------------------------- page --------------------------------- */

/** Customizable widget board for the dashboard's Overview tab (rows and columns on `Canvas`). */
export function DashboardWidgets() {
  const [layout, setLayout] = React.useState<Layout>(loadLayout)
  const [saved, setSaved] = React.useState(() => serialize(loadLayout()))
  const [customize, setCustomize] = React.useState(false)
  const dirty = serialize(layout) !== saved
  const placed = new Set(layout.flatMap((r) => r.items.map((i) => i.id)))
  const available = catalog.filter((w) => !placed.has(w.id))

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
      setSaved(serialize(layout))
      toast.success("Layout saved")
    } catch {
      toast.error("Could not save the layout")
    }
  }
  const reset = () => {
    const next = defaultLayout()
    setLayout(next)
    setSaved(serialize(next))
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    toast("Layout reset")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {customize
            ? "Drop a widget above or below another for a new row, beside it for a column, and drag the divider between columns to adjust widths."
            : "Turn on Customize to rearrange, resize, add, or remove widgets."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && !customize && <Badge variant="secondary">Unsaved changes</Badge>}
          {customize && (
            <>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcwIcon /> Reset
              </Button>
              <Button size="sm" onClick={save} disabled={!dirty}>
                <SaveIcon /> Save layout
              </Button>
            </>
          )}
          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={customize} onCheckedChange={({ checked }) => setCustomize(checked)} />
            Customize
          </label>
        </div>
      </div>

      <Canvas
        onDrop={(details) =>
          setLayout((prev) =>
            applyRowDrop(prev, details, {
              create: (data) => (typeof data === "string" && defById(data) ? { id: data, width: 1 } : null),
              rowId,
            })
          )
        }
        className={cn(!customize && "lg:grid-cols-1")}
      >
        {customize && (
          <CanvasPalette>
            <p className="w-full px-1 pb-1 text-xs font-medium text-muted-foreground">Available widgets</p>
            {available.length === 0 && (
              <p className="px-1 text-xs text-muted-foreground">Everything is on the board.</p>
            )}
            {available.map((w) => (
              <CanvasPaletteItem key={w.id} data={w.id}>
                <w.icon />
                {w.title}
              </CanvasPaletteItem>
            ))}
          </CanvasPalette>
        )}
        <CanvasArea className={cn(!customize && "border-transparent bg-transparent p-0")}>
          {layout.length === 0 && (
            <CanvasEmpty>
              <LayoutGridIcon />
              Drop a widget here to start
            </CanvasEmpty>
          )}
          {layout.map((row, rowIndex) => (
            <CanvasRow key={row.id}>
              {row.items.map((item, index) => {
                const def = defById(item.id)
                if (!def) return null
                return (
                  <React.Fragment key={item.id}>
                    {index > 0 && customize && (
                      <CanvasResizeHandle
                        onResize={(delta) =>
                          setLayout((prev) =>
                            prev.map((r, i) => (i === rowIndex ? resizeRowItems(r, index - 1, delta) : r))
                          )
                        }
                      />
                    )}
                    <CanvasNode value={item.id} width={item.width} draggable={customize} className="bg-card shadow-sm">
                      <CanvasNodeHeader className="border-b-0 pb-0">
                        {customize && <CanvasNodeHandle />}
                        <def.icon className="size-4 text-muted-foreground" />
                        <CanvasNodeTitle className="text-sm font-medium text-foreground">{def.title}</CanvasNodeTitle>
                        {customize && (
                          <CanvasNodeActions>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Remove ${def.title}`}
                              onClick={() => setLayout((prev) => removeRowItem(prev, item.id))}
                            >
                              <XIcon />
                            </Button>
                          </CanvasNodeActions>
                        )}
                      </CanvasNodeHeader>
                      <div className="min-w-0 px-3 pb-3">{def.render()}</div>
                    </CanvasNode>
                  </React.Fragment>
                )
              })}
            </CanvasRow>
          ))}
        </CanvasArea>
      </Canvas>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {placed.size} of {catalog.length} widgets · {layout.length} row{layout.length === 1 ? "" : "s"}
        </span>
        {customize && (
          <span className="ml-auto hidden items-center gap-3 md:flex">
            <KbdGroup>
              <Kbd>Space</Kbd>
              <span>pick up</span>
            </KbdGroup>
            <KbdGroup>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span>new row</span>
            </KbdGroup>
            <KbdGroup>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
              <span>column</span>
            </KbdGroup>
          </span>
        )}
      </div>
    </div>
  )
}

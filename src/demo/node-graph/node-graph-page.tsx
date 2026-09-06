import * as React from "react"
import { useFilter, useListCollection } from "@ark-ui/react"
import {
  ActivityIcon,
  BracesIcon,
  CalculatorIcon,
  CopyIcon,
  GitBranchIcon,
  MoreHorizontalIcon,
  PlayIcon,
  PlusIcon,
  Redo2Icon,
  RotateCcwIcon,
  SquareIcon,
  TerminalIcon,
  TrashIcon,
  TypeIcon,
  Undo2Icon,
  UnlinkIcon,
  VariableIcon,
  ZapIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  NodeGraph,
  NodeGraphBackground,
  NodeGraphConnectionLine,
  NodeGraphControls,
  NodeGraphEdge,
  NodeGraphEdges,
  NodeGraphEmpty,
  NodeGraphFitViewTrigger,
  NodeGraphMinimap,
  NodeGraphNode,
  NodeGraphNodeActions,
  NodeGraphNodeBody,
  NodeGraphNodeHeader,
  NodeGraphNodeInputs,
  NodeGraphNodeOutputs,
  NodeGraphNodeSubtitle,
  NodeGraphNodeTitle,
  NodeGraphPort,
  NodeGraphPortLabel,
  NodeGraphPortPin,
  NodeGraphSelectionBox,
  NodeGraphSurface,
  NodeGraphViewport,
  NodeGraphZoomInTrigger,
  NodeGraphZoomOutTrigger,
  NodeGraphZoomValue,
  useNodeGraph,
  type NodeGraphPortDetails,
  type NodeGraphSelection,
} from "@/components/ui/node-graph"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useHistory } from "@/lib/history"
import { cn } from "@/lib/utils"
import {
  buildGraph,
  categories,
  compatibleDefs,
  connect,
  createNode,
  disconnectNode,
  disconnectPort,
  duplicateNodes,
  firstPin,
  getDef,
  moveNodes,
  nodeDefs,
  removeItems,
  setValue,
  type Category,
  type Graph,
  type GraphNode,
  type NodeDef,
  type PinType,
} from "./data"
import {
  defaultVariables,
  execute,
  formatValue,
  isEventNode,
  type SimStep,
  type SimValue,
  type SimVariables,
} from "./simulate"

/* ----------------------------- styling maps ----------------------------- */

const pinColor: Record<PinType, string> = {
  exec: "text-foreground",
  number: "text-emerald-500",
  string: "text-fuchsia-500",
  boolean: "text-rose-500",
}

const categoryIcon: Record<Category, React.ComponentType<{ className?: string }>> = {
  Events: ZapIcon,
  "Flow control": GitBranchIcon,
  Math: CalculatorIcon,
  String: TypeIcon,
  Variables: VariableIcon,
}

const categoryDot: Record<Category, string> = {
  Events: "bg-rose-500",
  "Flow control": "bg-slate-500",
  Math: "bg-emerald-500",
  String: "bg-fuchsia-500",
  Variables: "bg-sky-500",
}

const categoryHeader: Record<Category, string> = {
  Events: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "Flow control": "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  Math: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  String: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  Variables: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
}

const activeNodeClass =
  "data-active:border-amber-500 data-active:ring-2 data-active:ring-amber-500/50 data-active:shadow-[0_0_24px_-4px_var(--color-amber-500)]"
const activeEdgeClass =
  "data-active:text-amber-500 data-active:[stroke-dasharray:8_8] data-active:animate-node-graph-flow"

/* ------------------------------ simulator ------------------------------- */

type LogEntry = { id: number; time: number; nodeId: string; text: string; level: "info" | "error" | "system" }
type SimStatus = "idle" | "running" | "done" | "error"
type Speed = "slow" | "normal" | "fast"
const stepDelay: Record<Speed, number> = { slow: 900, normal: 350, fast: 60 }
const waitScale: Record<Speed, number> = { slow: 1, normal: 0.5, fast: 0.1 }

function useSimulator(graphRef: React.RefObject<Graph>) {
  const [status, setStatus] = React.useState<SimStatus>("idle")
  const [activeNode, setActiveNode] = React.useState<string | null>(null)
  const [activeEdge, setActiveEdge] = React.useState<string | null>(null)
  const [waiting, setWaiting] = React.useState<{ nodeId: string; ms: number } | null>(null)
  const [log, setLog] = React.useState<LogEntry[]>([])
  const [vars, setVars] = React.useState<SimVariables>(defaultVariables)
  const [values, setValues] = React.useState<Map<string, SimValue>>(() => new Map())
  const [speed, setSpeed] = React.useState<Speed>("normal")
  const runId = React.useRef(0)
  const speedRef = React.useRef(speed)
  React.useEffect(() => {
    speedRef.current = speed
  }, [speed])
  const varsRef = React.useRef(vars)
  React.useEffect(() => {
    varsRef.current = vars
  }, [vars])
  const counter = React.useRef(0)

  const append = React.useCallback((entry: Omit<LogEntry, "id" | "time">) => {
    setLog((prev) => [...prev.slice(-199), { ...entry, id: counter.current++, time: Date.now() }])
  }, [])

  const stop = React.useCallback(() => {
    runId.current++
    setStatus((s) => (s === "running" ? "idle" : s))
    setActiveNode(null)
    setActiveEdge(null)
    setWaiting(null)
  }, [])

  const run = React.useCallback(
    async (startNodeId: string) => {
      const id = ++runId.current
      const alive = () => runId.current === id
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
      const snapshot = { vars: { ...varsRef.current }, values: new Map<string, SimValue>() }
      setStatus("running")
      setValues(new Map())
      setActiveEdge(null)
      const graph = graphRef.current
      const start = graph.nodes.find((n) => n.id === startNodeId)
      append({ nodeId: startNodeId, text: `▶ ${start ? getDef(start.type).title : startNodeId}`, level: "system" })

      const applyStep = async (step: SimStep) => {
        switch (step.kind) {
          case "enter":
            setActiveEdge(null)
            setActiveNode(step.nodeId)
            setValues(new Map(snapshot.values))
            await sleep(stepDelay[speedRef.current])
            break
          case "edge":
            setActiveEdge(step.edgeId)
            await sleep(stepDelay[speedRef.current] * 0.6)
            break
          case "log":
            append({ nodeId: step.nodeId, text: step.text, level: "info" })
            break
          case "wait": {
            const ms = Math.min(step.ms, 3000) * waitScale[speedRef.current]
            setWaiting({ nodeId: step.nodeId, ms })
            await sleep(ms)
            setWaiting(null)
            break
          }
          case "error":
            append({ nodeId: step.nodeId, text: step.message, level: "error" })
            break
          case "done":
            setVars({ ...snapshot.vars })
            setValues(new Map(snapshot.values))
            append({ nodeId: startNodeId, text: `Finished in ${step.steps} steps`, level: "system" })
            break
        }
      }

      let outcome: SimStatus = "done"
      for await (const step of execute(graph, startNodeId, snapshot)) {
        if (!alive()) return
        await applyStep(step)
        if (!alive()) return
        if (step.kind === "error") outcome = "error"
      }
      if (!alive()) return
      setStatus(outcome)
      setActiveNode(null)
      setActiveEdge(null)
    },
    [graphRef, append]
  )

  const clear = React.useCallback(() => {
    setLog([])
    setValues(new Map())
    setStatus("idle")
  }, [])

  const resetVars = React.useCallback(() => setVars(defaultVariables()), [])

  return { status, activeNode, activeEdge, waiting, log, vars, values, speed, setSpeed, run, stop, clear, resetVars }
}

/* ------------------------------- add menu ------------------------------- */

type Pending = {
  position: { x: number; y: number }
  client: { x: number; y: number }
  /** When set, the menu is filtered to compatible nodes and the new node is auto-connected. */
  from?: NodeGraphPortDetails & { type: PinType }
}

function AddNodeMenu({
  pending,
  onClose,
  onAdd,
}: {
  pending: Pending | null
  onClose: () => void
  onAdd: (def: NodeDef, pending: Pending) => void
}) {
  const rect = pending?.client
  return (
    <Popover
      open={!!pending}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
      positioning={{
        placement: "bottom-start",
        gutter: 2,
        getAnchorRect: () => (rect ? { x: rect.x, y: rect.y, width: 0, height: 0 } : null),
      }}
      autoFocus
    >
      <PopoverContent className="w-72 p-0" onPointerDown={(event) => event.stopPropagation()}>
        {pending && (
          <AddNodeList
            key={pending.from ? `${pending.from.nodeId}:${pending.from.portId}` : "all"}
            pending={pending}
            onSelect={(def) => {
              onAdd(def, pending)
              onClose()
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

function AddNodeList({ pending, onSelect }: { pending: Pending; onSelect: (def: NodeDef) => void }) {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection<NodeDef>({
    initialItems: pending.from ? compatibleDefs(pending.from.side, pending.from.type) : nodeDefs,
    itemToString: (d) => `${d.title} ${d.keywords ?? ""}`,
    itemToValue: (d) => d.type,
    groupBy: (d) => d.category,
    filter: contains,
  })
  return (
    <Command
      collection={collection}
      onSelect={({ value }) => {
        const def = nodeDefs.find((d) => d.type === value)
        if (def) onSelect(def)
      }}
    >
      <CommandInput
        placeholder={pending.from ? `Nodes with a ${pending.from.type} pin…` : "Search nodes…"}
        onValueChange={filter}
      />
      <CommandList className="max-h-72">
        <CommandEmpty>No matching nodes.</CommandEmpty>
        {collection.group().map(([group, defs], index) => {
          const Icon = categoryIcon[group as Category]
          return (
            <React.Fragment key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {defs.map((def) => (
                  <CommandItem key={def.type} item={def} onSelect={() => undefined}>
                    <Icon className="text-muted-foreground" />
                    {def.title}
                    {def.subtitle && <span className="ml-auto text-xs text-muted-foreground">{def.subtitle}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          )
        })}
      </CommandList>
    </Command>
  )
}

/* ----------------------------- context menus ---------------------------- */

type GraphActions = {
  run: (nodeId: string) => void
  duplicate: (ids: string[]) => void
  breakNodeLinks: (nodeId: string) => void
  breakPortLinks: (ref: NodeGraphPortDetails) => void
  resetPort: (ref: NodeGraphPortDetails) => void
  deleteNodes: (ids: string[]) => void
  deleteEdge: (id: string) => void
  isConnected: (ref: NodeGraphPortDetails) => boolean
}

type ContextTarget =
  | { kind: "node"; id: string; client: { x: number; y: number } }
  | { kind: "edge"; id: string; client: { x: number; y: number } }
  | { kind: "port"; port: NodeGraphPortDetails; client: { x: number; y: number } }

/** The node menu body, shared by the right-click menu and the header "more" button. */
function NodeMenuItems({
  node,
  selectedIds,
  actions,
}: {
  node: GraphNode
  selectedIds: string[]
  actions: GraphActions
}) {
  const ids = selectedIds.includes(node.id) ? selectedIds : [node.id]
  const many = ids.length > 1
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="text-xs text-muted-foreground">
        {many ? `${ids.length} nodes` : getDef(node.type).title}
      </DropdownMenuLabel>
      {isEventNode(node) && !many && (
        <DropdownMenuItem value="run" onSelect={() => actions.run(node.id)}>
          <PlayIcon /> Run from here
        </DropdownMenuItem>
      )}
      <DropdownMenuItem value="duplicate" onSelect={() => actions.duplicate(ids)}>
        <CopyIcon /> Duplicate
        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem value="break" onSelect={() => ids.forEach((id) => actions.breakNodeLinks(id))}>
        <UnlinkIcon /> Break all links
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem value="delete" variant="destructive" onSelect={() => actions.deleteNodes(ids)}>
        <TrashIcon /> Delete
        <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
  )
}

function GraphContextMenu({
  target,
  graph,
  selectedIds,
  actions,
  onClose,
}: {
  target: ContextTarget | null
  graph: Graph
  selectedIds: string[]
  actions: GraphActions
  onClose: () => void
}) {
  const client = target?.client
  const node = target?.kind === "node" ? graph.nodes.find((n) => n.id === target.id) : undefined
  return (
    <DropdownMenu
      open={!!target}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
      positioning={{
        placement: "bottom-start",
        gutter: 2,
        getAnchorRect: () => (client ? { x: client.x, y: client.y, width: 0, height: 0 } : null),
      }}
    >
      <DropdownMenuContent className="min-w-48" onPointerDown={(event) => event.stopPropagation()}>
        {target?.kind === "node" && node && <NodeMenuItems node={node} selectedIds={selectedIds} actions={actions} />}
        {target?.kind === "edge" && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Connection</DropdownMenuLabel>
            <DropdownMenuItem value="delete-edge" variant="destructive" onSelect={() => actions.deleteEdge(target.id)}>
              <UnlinkIcon /> Break link
              <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        {target?.kind === "port" && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {target.port.side === "input" ? "Input" : "Output"} · {target.port.type}
            </DropdownMenuLabel>
            <DropdownMenuItem
              value="break-port"
              disabled={!actions.isConnected(target.port)}
              onSelect={() => actions.breakPortLinks(target.port)}
            >
              <UnlinkIcon /> Break link{target.port.side === "output" ? "s" : ""}
              <DropdownMenuShortcut>⌥ click</DropdownMenuShortcut>
            </DropdownMenuItem>
            {target.port.side === "input" && target.port.type !== "exec" && (
              <DropdownMenuItem value="reset-port" onSelect={() => actions.resetPort(target.port)}>
                <RotateCcwIcon /> Reset to default
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------- nodes --------------------------------- */

function LiteralInput({
  type,
  value,
  onChange,
}: {
  type: PinType
  value: number | string | boolean | undefined
  onChange: (value: number | string | boolean) => void
}) {
  if (type === "boolean") {
    return (
      <Checkbox
        checked={!!value}
        onCheckedChange={({ checked }) => onChange(checked === true)}
        aria-label="Default value"
        className="size-3.5"
      />
    )
  }
  if (type === "number") {
    return (
      <Input
        type="number"
        value={String(value ?? 0)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Default value"
        className="h-5 w-14 px-1.5 text-xs! tabular-nums md:text-xs"
      />
    )
  }
  if (type === "string") {
    return (
      <Input
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Default value"
        className="h-5 w-24 px-1.5 text-xs! md:text-xs"
      />
    )
  }
  return null
}

function ScriptNode({
  node,
  connected,
  values,
  active,
  waiting,
  selectedIds,
  actions,
  onValueChange,
  onValueCommit,
}: {
  node: GraphNode
  connected: Set<string>
  values: Map<string, SimValue>
  active: boolean
  waiting: { nodeId: string; ms: number } | null
  selectedIds: string[]
  actions: GraphActions
  onValueChange: (pinId: string, value: number | string | boolean) => void
  onValueCommit: () => void
}) {
  const def = getDef(node.type)
  const Icon = categoryIcon[def.category]
  const isWaiting = waiting?.nodeId === node.id
  return (
    <NodeGraphNode
      value={node.id}
      position={node.position}
      aria-label={def.title}
      data-active={active ? "" : undefined}
      className={activeNodeClass}
    >
      <NodeGraphNodeHeader className={categoryHeader[def.category]}>
        <Icon className="size-4 shrink-0 opacity-80" />
        <div className="min-w-0 flex-1">
          <NodeGraphNodeTitle>{def.title}</NodeGraphNodeTitle>
          {def.subtitle && <NodeGraphNodeSubtitle className="text-current/70">{def.subtitle}</NodeGraphNodeSubtitle>}
        </div>
        <NodeGraphNodeActions>
          {isEventNode(node) && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Run from here"
              className="hover:bg-foreground/10"
              onClick={() => actions.run(node.id)}
            >
              <PlayIcon />
            </Button>
          )}
          <DropdownMenu positioning={{ placement: "bottom-end" }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Node actions" className="hover:bg-foreground/10">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-48">
              <NodeMenuItems node={node} selectedIds={selectedIds} actions={actions} />
            </DropdownMenuContent>
          </DropdownMenu>
        </NodeGraphNodeActions>
      </NodeGraphNodeHeader>
      <NodeGraphNodeBody className={cn(def.inputs.length === 0 && "grid-cols-1")}>
        {def.inputs.length > 0 && (
          <NodeGraphNodeInputs>
            {def.inputs.map((pin) => {
              const isConnected = connected.has(`${node.id}:${pin.id}`)
              return (
                <NodeGraphPort key={pin.id} value={pin.id} side="input" type={pin.type} connected={isConnected}>
                  <NodeGraphPortPin variant={pin.type === "exec" ? "exec" : "circle"} className={pinColor[pin.type]} />
                  {pin.label && <NodeGraphPortLabel>{pin.label}</NodeGraphPortLabel>}
                  {!isConnected && pin.type !== "exec" && (
                    <span onBlur={onValueCommit} className="flex items-center">
                      <LiteralInput
                        type={pin.type}
                        value={node.values[pin.id]}
                        onChange={(v) => onValueChange(pin.id, v)}
                      />
                    </span>
                  )}
                </NodeGraphPort>
              )
            })}
          </NodeGraphNodeInputs>
        )}
        {def.outputs.length > 0 && (
          <NodeGraphNodeOutputs className={cn(def.inputs.length === 0 && "col-start-1")}>
            {def.outputs.map((pin) => {
              const value = values.get(`${node.id}:${pin.id}`)
              return (
                <NodeGraphPort
                  key={pin.id}
                  value={pin.id}
                  side="output"
                  type={pin.type}
                  connected={connected.has(`${node.id}:${pin.id}`)}
                >
                  <NodeGraphPortPin variant={pin.type === "exec" ? "exec" : "circle"} className={pinColor[pin.type]} />
                  {pin.label && <NodeGraphPortLabel>{pin.label}</NodeGraphPortLabel>}
                  {value !== undefined && (
                    <span
                      className={cn(
                        "max-w-24 truncate rounded-sm bg-muted px-1 font-mono text-[10px]/4",
                        pinColor[pin.type]
                      )}
                      title={formatValue(value)}
                    >
                      {formatValue(value)}
                    </span>
                  )}
                </NodeGraphPort>
              )
            })}
          </NodeGraphNodeOutputs>
        )}
      </NodeGraphNodeBody>
      {isWaiting && (
        <div className="border-t px-3 py-1.5">
          <span className="block h-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full origin-left animate-node-graph-wait bg-amber-500"
              style={{ animationDuration: `${waiting.ms}ms` }}
            />
          </span>
        </div>
      )}
    </NodeGraphNode>
  )
}

/* ------------------------------- palette -------------------------------- */

const DRAG_TYPE = "application/x-node-type"

function Palette({ onAdd }: { onAdd: (type: string) => void }) {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const visible = nodeDefs.filter((d) => !q || `${d.title} ${d.keywords ?? ""} ${d.category}`.toLowerCase().includes(q))
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex" aria-label="Node palette">
      <Input placeholder="Filter nodes…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8" />
      <div className="min-h-0 flex-1 scroll-fade-b overflow-y-auto pr-1">
        {categories.map((category) => {
          const defs = visible.filter((d) => d.category === category)
          if (!defs.length) return null
          const Icon = categoryIcon[category]
          return (
            <div key={category} className="mb-3">
              <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
                <Icon className="size-3.5" />
                {category}
              </div>
              <ul className="flex flex-col gap-0.5">
                {defs.map((def) => (
                  <li key={def.type}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(DRAG_TYPE, def.type)
                        event.dataTransfer.effectAllowed = "copy"
                      }}
                      onClick={() => onAdd(def.type)}
                      className="group/palette-item flex w-full cursor-grab items-center gap-2 rounded-md border border-transparent px-2 py-1 text-left text-sm hover:border-border hover:bg-muted active:cursor-grabbing"
                    >
                      <span className={cn("size-2 shrink-0 rounded-full", categoryDot[category])} />
                      <span className="truncate">{def.title}</span>
                      <PlusIcon className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover/palette-item:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {visible.length === 0 && <p className="px-1 text-sm text-muted-foreground">No nodes match.</p>}
      </div>
      <p className="text-xs text-muted-foreground">Click or drag a node onto the graph.</p>
    </aside>
  )
}

/* ------------------------------ output panel ---------------------------- */

function OutputPanel({
  log,
  vars,
  status,
  onClear,
  onResetVars,
  nodeTitle,
}: {
  log: LogEntry[]
  vars: SimVariables
  status: SimStatus
  onClear: () => void
  onResetVars: () => void
  nodeTitle: (id: string) => string
}) {
  const scroller = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [log])
  return (
    <div
      data-output-panel
      className="grid h-40 shrink-0 grid-cols-[1fr_auto] overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2 border-b px-3 py-1.5 text-xs font-medium">
          <TerminalIcon className="size-3.5 text-muted-foreground" />
          Output
          <Badge
            variant={status === "error" ? "destructive" : status === "running" ? "default" : "secondary"}
            className="h-4 px-1.5 text-[10px] capitalize"
          >
            {status}
          </Badge>
          <Button variant="ghost" size="xs" className="ml-auto" onClick={onClear} disabled={!log.length}>
            Clear
          </Button>
        </div>
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-1.5 font-mono text-xs">
          {log.length === 0 ? (
            <p className="text-muted-foreground">Run an event node to see Print String output here.</p>
          ) : (
            log.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex gap-2 py-px",
                  entry.level === "error" && "text-destructive",
                  entry.level === "system" && "text-muted-foreground"
                )}
              >
                <span className="shrink-0 text-muted-foreground/60 tabular-nums">
                  {new Date(entry.time).toLocaleTimeString(undefined, { hour12: false })}
                </span>
                {entry.level === "info" && (
                  <span className="shrink-0 text-muted-foreground">[{nodeTitle(entry.nodeId)}]</span>
                )}
                <span className="min-w-0 wrap-break-word">{entry.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex w-52 flex-col border-l">
        <div className="flex items-center gap-2 border-b px-3 py-1.5 text-xs font-medium">
          <VariableIcon className="size-3.5 text-muted-foreground" />
          Variables
          <Button variant="ghost" size="xs" className="ml-auto" onClick={onResetVars}>
            Reset
          </Button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-3 py-2 text-xs">
          <dt className="text-muted-foreground">Score</dt>
          <dd className={cn("truncate font-mono", pinColor.number)}>{formatValue(vars.score)}</dd>
          <dt className="text-muted-foreground">Player name</dt>
          <dd className={cn("truncate font-mono", pinColor.string)}>{formatValue(vars.playerName)}</dd>
          <dt className="text-muted-foreground">Alive</dt>
          <dd className={cn("truncate font-mono", pinColor.boolean)}>{formatValue(vars.alive)}</dd>
        </dl>
      </div>
    </div>
  )
}

/* --------------------------------- page --------------------------------- */

/** Bridges graph context (drop position, keyboard shortcuts) to page-level handlers. */
function GraphInteractions({
  onDropType,
  onUndo,
  onRedo,
  onDuplicate,
}: {
  onDropType: (type: string, position: { x: number; y: number }) => void
  onUndo: () => void
  onRedo: () => void
  onDuplicate: () => void
}) {
  const { screenToGraph, viewportRef } = useNodeGraph()
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const over = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes(DRAG_TYPE)) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy"
      }
    }
    const drop = (event: DragEvent) => {
      const type = event.dataTransfer?.getData(DRAG_TYPE)
      if (!type) return
      event.preventDefault()
      onDropType(type, screenToGraph({ x: event.clientX, y: event.clientY }))
    }
    const key = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if ((event.target as HTMLElement).closest("input, textarea")) return
      const k = event.key.toLowerCase()
      if (k === "z") {
        event.preventDefault()
        if (event.shiftKey) onRedo()
        else onUndo()
      } else if (k === "d") {
        event.preventDefault()
        onDuplicate()
      }
    }
    el.addEventListener("dragover", over)
    el.addEventListener("drop", drop)
    el.addEventListener("keydown", key)
    return () => {
      el.removeEventListener("dragover", over)
      el.removeEventListener("drop", drop)
      el.removeEventListener("keydown", key)
    }
  }, [viewportRef, screenToGraph, onDropType, onUndo, onRedo, onDuplicate])
  return null
}

function FitOnMount() {
  const { fitView } = useNodeGraph()
  React.useEffect(() => {
    const id = requestAnimationFrame(() => fitView({ padding: 48 }))
    return () => cancelAnimationFrame(id)
  }, [fitView])
  return null
}

export function NodeGraphPage() {
  const history = useHistory<Graph>(buildGraph)
  const graph = history.present
  const graphRef = React.useRef(graph)
  React.useEffect(() => {
    graphRef.current = graph
  }, [graph])
  const [selection, setSelection] = React.useState<NodeGraphSelection>({ nodes: [], edges: [] })
  const [pending, setPending] = React.useState<Pending | null>(null)
  const [context, setContext] = React.useState<ContextTarget | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const sim = useSimulator(graphRef)

  const connected = React.useMemo(() => {
    const set = new Set<string>()
    for (const edge of graph.edges) {
      set.add(`${edge.source.nodeId}:${edge.source.portId}`)
      set.add(`${edge.target.nodeId}:${edge.target.portId}`)
    }
    return set
  }, [graph.edges])

  const addNode = React.useCallback(
    (def: NodeDef, position: { x: number; y: number }, from?: Pending["from"]) => {
      const node = createNode(def.type, { x: Math.round(position.x / 20) * 20, y: Math.round(position.y / 20) * 20 })
      history.set((g) => {
        let next: Graph = { ...g, nodes: [...g.nodes, node] }
        if (from) {
          const pin = firstPin(def, from.side === "output" ? "input" : "output", from.type)
          if (pin) {
            const mine = { nodeId: node.id, portId: pin.id }
            const theirs = { nodeId: from.nodeId, portId: from.portId }
            next = connect(
              next,
              from.side === "output" ? { source: theirs, target: mine } : { source: mine, target: theirs }
            )
          }
        }
        return next
      })
      setSelection({ nodes: [node.id], edges: [] })
    },
    [history]
  )

  const addAtCenter = React.useCallback(
    (type: string) => {
      // Place near the middle of whatever is visible; the graph snaps it to the grid.
      const el = rootRef.current?.querySelector<HTMLElement>("[data-slot=node-graph-viewport]")
      const rect = el?.getBoundingClientRect()
      const surface = el?.querySelector<HTMLElement>("[data-slot=node-graph-surface]")
      const m = surface ? new DOMMatrix(getComputedStyle(surface).transform) : new DOMMatrix()
      const cx = ((rect?.width ?? 0) / 2 - m.e) / (m.a || 1) - 110
      const cy = ((rect?.height ?? 0) / 2 - m.f) / (m.d || 1) - 40
      addNode(getDef(type), { x: cx + Math.random() * 40, y: cy + Math.random() * 40 })
    },
    [addNode]
  )

  const onDropType = React.useCallback(
    (type: string, position: { x: number; y: number }) =>
      addNode(getDef(type), { x: position.x - 110, y: position.y - 20 }),
    [addNode]
  )

  const deleteItems = React.useCallback(
    (sel: NodeGraphSelection) => {
      if (!sel.nodes.length && !sel.edges.length) return
      history.set((g) => removeItems(g, sel))
      setSelection({ nodes: [], edges: [] })
    },
    [history]
  )

  const duplicate = React.useCallback(
    (ids: string[]) => {
      if (!ids.length) return
      const result = duplicateNodes(graphRef.current, ids)
      history.set(result.graph)
      setSelection({ nodes: result.ids, edges: [] })
    },
    [history]
  )

  const { run } = sim
  const actions = React.useMemo<GraphActions>(
    () => ({
      run,
      duplicate,
      breakNodeLinks: (nodeId) => history.set((g) => disconnectNode(g, nodeId)),
      breakPortLinks: (ref) => history.set((g) => disconnectPort(g, ref)),
      resetPort: (ref) =>
        history.set((g) => {
          const node = g.nodes.find((n) => n.id === ref.nodeId)
          const pin = node && getDef(node.type).inputs.find((p) => p.id === ref.portId)
          return pin?.default !== undefined ? setValue(disconnectPort(g, ref), ref.nodeId, ref.portId, pin.default) : g
        }),
      deleteNodes: (ids) => deleteItems({ nodes: ids, edges: [] }),
      deleteEdge: (id) => deleteItems({ nodes: [], edges: [id] }),
      isConnected: (ref) => connected.has(`${ref.nodeId}:${ref.portId}`),
    }),
    [run, duplicate, history, deleteItems, connected]
  )

  const nodeTitle = React.useCallback(
    (id: string) => {
      const node = graph.nodes.find((n) => n.id === id)
      return node ? getDef(node.type).title : id
    },
    [graph.nodes]
  )

  const selectedNode = selection.nodes.length === 1 ? graph.nodes.find((n) => n.id === selection.nodes[0]) : undefined
  const eventNodes = graph.nodes.filter(isEventNode)
  const beginPlay = eventNodes.find((n) => n.type === "event.begin-play") ?? eventNodes[0]

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automations</h2>
          <p className="text-muted-foreground">
            Drag pins to connect, drop on empty space to add a compatible node. Right-click nodes, pins, and links for
            actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {sim.status === "running" ? (
            <Button variant="destructive" onClick={sim.stop}>
              <SquareIcon /> Stop
            </Button>
          ) : (
            <DropdownMenu positioning={{ placement: "bottom-end" }}>
              <div className="flex">
                <Button
                  className="rounded-r-none"
                  disabled={!beginPlay}
                  onClick={() => beginPlay && sim.run(beginPlay.id)}
                >
                  <PlayIcon /> Run
                </Button>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    aria-label="Run options"
                    className="rounded-l-none border-l border-l-primary-foreground/20"
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Fire event</DropdownMenuLabel>
                  {eventNodes.length === 0 && (
                    <DropdownMenuItem value="none" disabled>
                      No event nodes
                    </DropdownMenuItem>
                  )}
                  {eventNodes.map((n) => (
                    <DropdownMenuItem key={n.id} value={n.id} onSelect={() => sim.run(n.id)}>
                      <ZapIcon /> {getDef(n.type).title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Speed</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sim.speed} onValueChange={({ value }) => sim.setSpeed(value as Speed)}>
                    <DropdownMenuRadioItem value="slow">Slow</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="normal">Normal</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="fast">Fast</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Separator orientation="vertical" className="mx-1 h-6!" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Undo"
                disabled={!history.canUndo}
                onClick={history.undo}
              >
                <Undo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <Kbd>⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Redo"
                disabled={!history.canRedo}
                onClick={history.redo}
              >
                <Redo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <Kbd>⇧⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Delete selection"
                disabled={!selection.nodes.length && !selection.edges.length}
                onClick={() => deleteItems(selection)}
              >
                <TrashIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Delete <Kbd>⌫</Kbd>
            </TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            onClick={() =>
              toast("Graph exported", {
                description: `${graph.nodes.length} nodes, ${graph.edges.length} connections copied as JSON.`,
              })
            }
          >
            <BracesIcon /> Export
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              sim.stop()
              sim.clear()
              history.reset(buildGraph())
              setSelection({ nodes: [], edges: [] })
            }}
          >
            <RotateCcwIcon /> Reset
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <Palette onAdd={addAtCenter} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <NodeGraph
            className="min-w-0"
            selection={selection}
            onSelectionChange={setSelection}
            onNodesMove={(moves) => history.set((g) => moveNodes(g, moves), { commit: false })}
            onNodesMoveEnd={(moves) => {
              // Commit once per drag: the live updates never grew the history.
              history.checkpoint()
              history.set((g) => moveNodes(g, moves), { commit: false })
            }}
            onConnect={(c) => history.set((g) => connect(g, c))}
            onConnectEnd={({ source, position, client }) =>
              setPending({ position, client, from: { ...source, type: source.type as PinType } })
            }
            onDisconnect={(ref) => actions.breakPortLinks(ref)}
            edgeAt={(port) => {
              // Dragging a connected pin picks its link up (data inputs and exec outputs hold one link).
              const edge =
                port.side === "input"
                  ? graph.edges.find((e) => e.target.nodeId === port.nodeId && e.target.portId === port.portId)
                  : port.type === "exec"
                    ? graph.edges.find((e) => e.source.nodeId === port.nodeId && e.source.portId === port.portId)
                    : undefined
              if (!edge) return null
              const other = port.side === "input" ? edge.source : edge.target
              return { ...other, side: port.side === "input" ? "output" : "input", type: port.type }
            }}
            onDelete={deleteItems}
            onPaneContextMenu={({ position, client }) => setPending({ position, client })}
            onNodeContextMenu={({ id, client }) => setContext({ kind: "node", id, client })}
            onEdgeContextMenu={({ id, client }) => setContext({ kind: "edge", id, client })}
            onPortContextMenu={({ client, position: _position, ...port }) => setContext({ kind: "port", port, client })}
          >
            <NodeGraphViewport>
              <NodeGraphBackground />
              <NodeGraphSurface>
                <NodeGraphEdges>
                  {graph.edges.map((edge) => {
                    const source = graph.nodes.find((n) => n.id === edge.source.nodeId)
                    const type = source
                      ? getDef(source.type).outputs.find((p) => p.id === edge.source.portId)?.type
                      : undefined
                    return (
                      <NodeGraphEdge
                        key={edge.id}
                        value={edge.id}
                        source={edge.source}
                        target={edge.target}
                        data-active={sim.activeEdge === edge.id ? "" : undefined}
                        className={cn(type && pinColor[type], type === "exec" && "text-foreground/70", activeEdgeClass)}
                      />
                    )
                  })}
                </NodeGraphEdges>
                <NodeGraphConnectionLine className="data-[type=boolean]:text-rose-500 data-[type=number]:text-emerald-500 data-[type=string]:text-fuchsia-500" />
                {graph.nodes.map((node) => (
                  <ScriptNode
                    key={node.id}
                    node={node}
                    connected={connected}
                    values={sim.values}
                    active={sim.activeNode === node.id}
                    waiting={sim.waiting}
                    selectedIds={selection.nodes}
                    actions={actions}
                    onValueChange={(pinId, value) =>
                      history.set((g) => setValue(g, node.id, pinId, value), { commit: false })
                    }
                    onValueCommit={() => history.checkpoint()}
                  />
                ))}
              </NodeGraphSurface>
              <NodeGraphSelectionBox />
              {graph.nodes.length === 0 && (
                <NodeGraphEmpty>
                  <p className="font-medium text-foreground">Empty graph</p>
                  <p>Right-click anywhere or pick a node from the palette.</p>
                </NodeGraphEmpty>
              )}
              <NodeGraphControls>
                <NodeGraphZoomOutTrigger />
                <NodeGraphZoomValue />
                <NodeGraphZoomInTrigger />
                <Separator orientation="vertical" className="mx-0.5 h-5!" />
                <NodeGraphFitViewTrigger />
              </NodeGraphControls>
              <NodeGraphMinimap className="hidden sm:block" />
            </NodeGraphViewport>
            <GraphInteractions
              onDropType={onDropType}
              onUndo={history.undo}
              onRedo={history.redo}
              onDuplicate={() => duplicate(selection.nodes)}
            />
            <FitOnMount />
            <AddNodeMenu
              pending={pending}
              onClose={() => setPending(null)}
              onAdd={(def, p) =>
                addNode(
                  def,
                  p.from
                    ? { x: p.position.x - (p.from.side === "output" ? 0 : 224), y: p.position.y - 16 }
                    : p.position,
                  p.from
                )
              }
            />
            <GraphContextMenu
              target={context}
              graph={graph}
              selectedIds={selection.nodes}
              actions={actions}
              onClose={() => setContext(null)}
            />
          </NodeGraph>
          <OutputPanel
            log={sim.log}
            vars={sim.vars}
            status={sim.status}
            onClear={sim.clear}
            onResetVars={sim.resetVars}
            nodeTitle={nodeTitle}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {graph.nodes.length} nodes · {graph.edges.length} connections
        </span>
        {selectedNode ? (
          <span>
            Selected: <span className="text-foreground">{getDef(selectedNode.type).title}</span>
          </span>
        ) : selection.nodes.length + selection.edges.length > 0 ? (
          <span>
            Selected: {selection.nodes.length} nodes, {selection.edges.length} connections
          </span>
        ) : null}
        <span className="ml-auto hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-1">
            <ActivityIcon className="size-3.5" /> Scroll to zoom
          </span>
          <span>Middle or right drag to pan</span>
          <KbdGroup>
            <Kbd>⌥</Kbd>
            <span>click pin to break links</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌫</Kbd>
            <span>delete</span>
          </KbdGroup>
        </span>
      </div>
    </div>
  )
}

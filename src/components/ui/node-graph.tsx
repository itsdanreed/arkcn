import * as React from "react"
import { ark } from "@ark-ui/react"
import { cva, type VariantProps } from "class-variance-authority"
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

/**
 * NodeGraph — a compositional, data-agnostic node editor in the spirit of
 * visual scripting graphs. The consumer owns nodes and edges; the graph owns
 * only the viewport (pan/zoom), the selection, and in-flight interactions
 * (dragging nodes, drawing a connection, marquee selection). Everything else
 * is reported as an intent: `onNodesMove`, `onConnect`, `onConnectEnd`,
 * `onDisconnect` (alt+click on a pin), `onDelete`, `onSelectionChange`, and
 * `onPane/Node/Edge/PortContextMenu` (right-click without a drag).
 *
 * Anatomy:
 *   NodeGraph
 *     NodeGraphViewport            pan/zoom pane, keyboard target
 *       NodeGraphBackground        dotted/lined grid that follows the viewport
 *       NodeGraphSurface           the transformed layer
 *         NodeGraphEdges           svg layer with NodeGraphEdge children
 *         NodeGraphConnectionLine  the edge being drawn
 *         NodeGraphNode*           absolutely positioned nodes
 *           NodeGraphNodeHeader/Title/Subtitle/Body/Inputs/Outputs/Footer
 *           NodeGraphPort > NodeGraphPortPin + NodeGraphPortLabel
 *       NodeGraphSelectionBox      marquee
 *       NodeGraphControls          zoom in/out/fit triggers + NodeGraphZoomValue
 *       NodeGraphMinimap
 *       NodeGraphEmpty
 */

type XY = { x: number; y: number }
type NodeGraphViewportState = { x: number; y: number; zoom: number }
type NodeGraphPortRef = { nodeId: string; portId: string }
type NodeGraphPortSide = "input" | "output"
type NodeGraphConnection = { source: NodeGraphPortRef; target: NodeGraphPortRef }
type NodeGraphSelection = { nodes: string[]; edges: string[] }
type NodeGraphNodeMove = { id: string; position: XY }
type NodeGraphConnectingState = {
  source: NodeGraphPortRef & { side: NodeGraphPortSide; type: string }
  /** Cursor position in graph coordinates. */
  position: XY
  target: (NodeGraphPortRef & { side: NodeGraphPortSide; type: string }) | null
  valid: boolean
}
type NodeGraphRect = { x: number; y: number; width: number; height: number }
type NodeGraphPortDetails = NodeGraphPortRef & { side: NodeGraphPortSide; type: string }

const EMPTY_SELECTION: NodeGraphSelection = { nodes: [], edges: [] }
const INTERACTIVE = "input, textarea, select, button, a, [contenteditable], [data-slot=node-graph-port-pin]"

/* ---------------------------------------------------------------------------
 * Layout store: node positions/sizes and port offsets, measured from the DOM.
 * Edges and the minimap subscribe to it instead of re-measuring themselves.
 * ------------------------------------------------------------------------- */

type PortLayout = { side: NodeGraphPortSide; type: string; el: HTMLElement | null; offset: XY }
type NodeLayout = { position: XY; width: number; height: number; ports: Map<string, PortLayout> }

function createLayoutStore() {
  const nodes = new Map<string, NodeLayout>()
  const listeners = new Set<() => void>()
  let version = 0
  const emit = () => {
    version++
    listeners.forEach((l) => l())
  }
  return {
    nodes,
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    getVersion: () => version,
    emit,
    ensure(id: string) {
      let node = nodes.get(id)
      if (!node) {
        node = { position: { x: 0, y: 0 }, width: 0, height: 0, ports: new Map() }
        nodes.set(id, node)
      }
      return node
    },
    getPortPosition(ref: NodeGraphPortRef): XY | null {
      const node = nodes.get(ref.nodeId)
      const port = node?.ports.get(ref.portId)
      if (!node || !port) return null
      return { x: node.position.x + port.offset.x, y: node.position.y + port.offset.y }
    },
    getPort(ref: NodeGraphPortRef) {
      return nodes.get(ref.nodeId)?.ports.get(ref.portId) ?? null
    },
    getBounds(ids?: Iterable<string>): NodeGraphRect | null {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const id of ids ?? nodes.keys()) {
        const node = nodes.get(id)
        if (!node) continue
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + node.width)
        maxY = Math.max(maxY, node.position.y + node.height)
      }
      if (!Number.isFinite(minX)) return null
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    },
  }
}

type LayoutStore = ReturnType<typeof createLayoutStore>

/* ---------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------- */

type NodeGraphContextValue = {
  store: LayoutStore
  viewport: NodeGraphViewportState
  setViewport: (next: NodeGraphViewportState | ((prev: NodeGraphViewportState) => NodeGraphViewportState)) => void
  viewportRef: React.RefObject<HTMLDivElement | null>
  size: { width: number; height: number }
  minZoom: number
  maxZoom: number
  snapGrid: number
  selection: NodeGraphSelection
  setSelection: (next: NodeGraphSelection) => void
  connecting: NodeGraphConnectingState | null
  marquee: NodeGraphRect | null
  draggingNodes: boolean
  panning: boolean
  spaceHeld: boolean
  /** Convert a client (screen) point to graph coordinates. */
  screenToGraph: (client: XY) => XY
  graphToScreen: (point: XY) => XY
  zoomIn: () => void
  zoomOut: () => void
  zoomTo: (zoom: number, client?: XY) => void
  fitView: (options?: { padding?: number; ids?: string[]; maxZoom?: number }) => void
  centerOn: (point: XY) => void
  announce: (message: string) => void
  // internal interaction hooks used by parts
  startNodeDrag: (nodeId: string, event: React.PointerEvent) => void
  startConnection: (source: NodeGraphConnectingState["source"], event: React.PointerEvent) => void
  disconnect: (details: NodeGraphPortDetails) => void
  edgeAt: (details: NodeGraphPortDetails) => NodeGraphPortDetails | null
  deleteSelection: () => void
  nudgeSelection: (delta: XY, focusedNodeId?: string) => void
  selectAll: () => void
  onNodeClick: (nodeId: string, event: React.MouseEvent | React.KeyboardEvent) => void
  onEdgeClick: (edgeId: string, event: React.MouseEvent) => void
}

const NodeGraphContext = React.createContext<NodeGraphContextValue | null>(null)

/** Access the graph (viewport, selection, coordinate helpers) from any part or consumer code inside `NodeGraph`. */
function useNodeGraph() {
  const ctx = React.useContext(NodeGraphContext)
  if (!ctx) throw new Error("NodeGraph parts must be used within <NodeGraph>")
  return ctx
}

/** Re-render when node/port layout changes. */
function useLayoutVersion(store: LayoutStore) {
  return React.useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion)
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const snap = (value: number, grid: number) => (grid > 0 ? Math.round(value / grid) * grid : value)
const sameSelection = (a: NodeGraphSelection, b: NodeGraphSelection) =>
  a.nodes.length === b.nodes.length &&
  a.edges.length === b.edges.length &&
  a.nodes.every((id, i) => b.nodes[i] === id) &&
  a.edges.every((id, i) => b.edges[i] === id)

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal
  // Tracks the latest value synchronously so back-to-back functional updates (wheel zoom) compose.
  const ref = React.useRef(current)
  React.useLayoutEffect(() => {
    ref.current = current
  }, [current])
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(ref.current) : next
      ref.current = resolved
      if (!controlled) setInternal(resolved)
      onChangeRef.current?.(resolved)
    },
    [controlled]
  )
  return [current, set] as const
}

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

type NodeGraphProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  viewport?: NodeGraphViewportState
  defaultViewport?: NodeGraphViewportState
  onViewportChange?: (viewport: NodeGraphViewportState) => void
  selection?: NodeGraphSelection
  defaultSelection?: NodeGraphSelection
  onSelectionChange?: (selection: NodeGraphSelection) => void
  minZoom?: number
  maxZoom?: number
  /** Grid size nodes snap to while dragging and nudging. `0` disables snapping. */
  snapGrid?: number
  /** Live position updates while nodes are dragged or nudged. */
  onNodesMove?: (moves: NodeGraphNodeMove[]) => void
  /** Fired once when a drag or nudge finishes, with the final positions. */
  onNodesMoveEnd?: (moves: NodeGraphNodeMove[]) => void
  /** A connection was completed on a valid port. `source` is always the output side. */
  onConnect?: (connection: NodeGraphConnection) => void
  /** A connection was released on empty space; `position` is in graph coordinates. */
  onConnectEnd?: (details: { source: NodeGraphConnectingState["source"]; position: XY; client: XY }) => void
  /** Override the built-in check (sides differ, nodes differ, port types match or are "any"). */
  isValidConnection?: (connection: NodeGraphConnection & { sourceType: string; targetType: string }) => boolean
  /** Delete/Backspace with a selection. */
  onDelete?: (selection: NodeGraphSelection) => void
  /** Right-click on empty space (a right-drag pans instead). */
  onPaneContextMenu?: (details: { position: XY; client: XY }) => void
  /** Right-click on a node (selects it first unless already selected). */
  onNodeContextMenu?: (details: { id: string; position: XY; client: XY }) => void
  /** Right-click on an edge. */
  onEdgeContextMenu?: (details: { id: string; position: XY; client: XY }) => void
  /** Right-click on a port pin. */
  onPortContextMenu?: (details: NodeGraphPortDetails & { position: XY; client: XY }) => void
  /** Alt+click on a port pin: the conventional "break links" gesture. */
  onDisconnect?: (details: NodeGraphPortDetails) => void
  /**
   * Enables re-routing: return the other end of the single link attached to `port` (or null).
   * Dragging from such a pin then calls `onDisconnect(port)` and continues the drag from that other end.
   */
  edgeAt?: (port: NodeGraphPortDetails) => NodeGraphPortDetails | null
}

function NodeGraph({
  viewport: viewportProp,
  defaultViewport = { x: 0, y: 0, zoom: 1 },
  onViewportChange,
  selection: selectionProp,
  defaultSelection = EMPTY_SELECTION,
  onSelectionChange,
  minZoom = 0.25,
  maxZoom = 2,
  snapGrid = 20,
  onNodesMove,
  onNodesMoveEnd,
  onConnect,
  onConnectEnd,
  isValidConnection,
  onDelete,
  onPaneContextMenu,
  onNodeContextMenu,
  onEdgeContextMenu,
  onPortContextMenu,
  onDisconnect,
  edgeAt,
  className,
  children,
  ...props
}: NodeGraphProps) {
  const store = React.useMemo(() => createLayoutStore(), [])
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [viewport, setViewportState] = useControllable(viewportProp, defaultViewport, onViewportChange)
  const [selection, setSelectionState] = useControllable(selectionProp, defaultSelection, onSelectionChange)
  const [size, setSize] = React.useState({ width: 0, height: 0 })
  const [connecting, setConnecting] = React.useState<NodeGraphConnectingState | null>(null)
  const [marquee, setMarquee] = React.useState<NodeGraphRect | null>(null)
  const [draggingNodes, setDraggingNodes] = React.useState(false)
  const [panning, setPanning] = React.useState(false)
  const [spaceHeld, setSpaceHeld] = React.useState(false)
  const { message: announcement, announce } = useLiveRegion()
  const spaceRef = React.useRef(false)
  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key !== " " || event.repeat) return
      const target = event.target as HTMLElement
      if (target.closest("input, textarea, select, button, [contenteditable]")) return
      if (!viewportRef.current?.contains(target) && target !== document.body) return
      spaceRef.current = true
      setSpaceHeld(true)
    }
    const up = (event: KeyboardEvent) => {
      if (event.key !== " ") return
      spaceRef.current = false
      setSpaceHeld(false)
    }
    const blur = () => {
      spaceRef.current = false
      setSpaceHeld(false)
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", blur)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", blur)
    }
  }, [])

  const latest = React.useRef({
    viewport,
    selection,
    size,
    onNodesMove,
    onNodesMoveEnd,
    onConnect,
    onConnectEnd,
    onPaneContextMenu,
    onNodeContextMenu,
    onEdgeContextMenu,
    onPortContextMenu,
    onDisconnect,
    edgeAt,
  })
  React.useEffect(() => {
    latest.current = {
      viewport,
      selection,
      size,
      onNodesMove,
      onNodesMoveEnd,
      onConnect,
      onConnectEnd,
      onPaneContextMenu,
      onNodeContextMenu,
      onEdgeContextMenu,
      onPortContextMenu,
      onDisconnect,
      edgeAt,
    }
  })

  const setViewport = React.useCallback(
    (next: NodeGraphViewportState | ((prev: NodeGraphViewportState) => NodeGraphViewportState)) =>
      setViewportState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next
        return { ...resolved, zoom: clamp(resolved.zoom, minZoom, maxZoom) }
      }),
    [setViewportState, minZoom, maxZoom]
  )
  const setSelection = React.useCallback(
    (next: NodeGraphSelection) => {
      if (!sameSelection(latest.current.selection, next)) setSelectionState(next)
    },
    [setSelectionState]
  )

  const screenToGraph = React.useCallback((client: XY): XY => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const vp = latest.current.viewport
    return {
      x: (client.x - (rect?.left ?? 0) - vp.x) / vp.zoom,
      y: (client.y - (rect?.top ?? 0) - vp.y) / vp.zoom,
    }
  }, [])
  const graphToScreen = React.useCallback((point: XY): XY => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const vp = latest.current.viewport
    return { x: point.x * vp.zoom + vp.x + (rect?.left ?? 0), y: point.y * vp.zoom + vp.y + (rect?.top ?? 0) }
  }, [])

  /** Zoom keeping the graph point under `client` (defaults to the pane centre) fixed. */
  const zoomTo = React.useCallback(
    (zoom: number, client?: XY) => {
      const rect = viewportRef.current?.getBoundingClientRect()
      const cx = client ? client.x - (rect?.left ?? 0) : latest.current.size.width / 2
      const cy = client ? client.y - (rect?.top ?? 0) : latest.current.size.height / 2
      setViewport((prev) => {
        const next = clamp(zoom, minZoom, maxZoom)
        const gx = (cx - prev.x) / prev.zoom
        const gy = (cy - prev.y) / prev.zoom
        return { x: cx - gx * next, y: cy - gy * next, zoom: next }
      })
    },
    [setViewport, minZoom, maxZoom]
  )
  const zoomIn = React.useCallback(() => zoomTo(latest.current.viewport.zoom * 1.2), [zoomTo])
  const zoomOut = React.useCallback(() => zoomTo(latest.current.viewport.zoom / 1.2), [zoomTo])
  const fitView = React.useCallback(
    (options?: { padding?: number; ids?: string[]; maxZoom?: number }) => {
      const bounds = store.getBounds(options?.ids)
      const { width, height } = latest.current.size
      if (!bounds || !width || !height) return
      const padding = options?.padding ?? 40
      const zoom = clamp(
        Math.min(
          (width - padding * 2) / Math.max(bounds.width, 1),
          (height - padding * 2) / Math.max(bounds.height, 1)
        ),
        minZoom,
        options?.maxZoom ?? 1
      )
      setViewport({
        x: (width - bounds.width * zoom) / 2 - bounds.x * zoom,
        y: (height - bounds.height * zoom) / 2 - bounds.y * zoom,
        zoom,
      })
    },
    [store, setViewport, minZoom]
  )
  const centerOn = React.useCallback(
    (point: XY) =>
      setViewport((prev) => ({
        ...prev,
        x: latest.current.size.width / 2 - point.x * prev.zoom,
        y: latest.current.size.height / 2 - point.y * prev.zoom,
      })),
    [setViewport]
  )

  // Pane size for fitView / minimap.
  React.useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* ----- pointer interactions: they attach move/up listeners to the window ----- */

  const track = React.useCallback((onMove: (event: PointerEvent) => void, onUp: (event: PointerEvent) => void) => {
    const up = (event: PointerEvent) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      onUp(event)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }, [])

  const startNodeDrag = React.useCallback(
    (nodeId: string, event: React.PointerEvent) => {
      const startClient = { x: event.clientX, y: event.clientY }
      const current = latest.current.selection
      const additive = event.shiftKey || event.metaKey || event.ctrlKey
      const wasSelected = current.nodes.includes(nodeId)
      // Selection resolves on pointer down so a drag moves the whole group.
      const nodes = wasSelected ? current.nodes : additive ? [...current.nodes, nodeId] : [nodeId]
      if (!wasSelected) setSelection({ nodes, edges: additive ? current.edges : [] })
      const starts = new Map(nodes.map((id) => [id, { ...store.ensure(id).position }]))
      let moved = false
      let lastMoves: NodeGraphNodeMove[] = []
      track(
        (e) => {
          const zoom = latest.current.viewport.zoom
          const dx = (e.clientX - startClient.x) / zoom
          const dy = (e.clientY - startClient.y) / zoom
          if (!moved && Math.hypot(dx * zoom, dy * zoom) < 3) return
          if (!moved) {
            moved = true
            setDraggingNodes(true)
          }
          lastMoves = [...starts].map(([id, start]) => ({
            id,
            position: { x: snap(start.x + dx, snapGrid), y: snap(start.y + dy, snapGrid) },
          }))
          latest.current.onNodesMove?.(lastMoves)
        },
        () => {
          if (moved) {
            setDraggingNodes(false)
            latest.current.onNodesMoveEnd?.(lastMoves)
          } else if (wasSelected && additive) {
            setSelection({ nodes: current.nodes.filter((id) => id !== nodeId), edges: current.edges })
          } else if (wasSelected && current.nodes.length > 1) {
            setSelection({ nodes: [nodeId], edges: [] })
          }
        }
      )
    },
    [store, track, setSelection, snapGrid]
  )

  const validate = React.useCallback(
    (a: NodeGraphConnectingState["source"], b: NodeGraphConnectingState["source"]) => {
      if (a.side === b.side || a.nodeId === b.nodeId) return false
      const [source, target] = a.side === "output" ? [a, b] : [b, a]
      if (isValidConnection) {
        return isValidConnection({
          source: { nodeId: source.nodeId, portId: source.portId },
          target: { nodeId: target.nodeId, portId: target.portId },
          sourceType: source.type,
          targetType: target.type,
        })
      }
      return source.type === target.type || source.type === "any" || target.type === "any"
    },
    [isValidConnection]
  )

  const startConnection = React.useCallback(
    (source: NodeGraphConnectingState["source"], event: React.PointerEvent) => {
      const position = screenToGraph({ x: event.clientX, y: event.clientY })
      let state: NodeGraphConnectingState = { source, position, target: null, valid: false }
      setConnecting(state)
      track(
        (e) => {
          const el = document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest<HTMLElement>("[data-slot=node-graph-port-pin]")
          const target =
            el && el.dataset.nodeId && el.dataset.portId
              ? {
                  nodeId: el.dataset.nodeId,
                  portId: el.dataset.portId,
                  side: (el.dataset.side as NodeGraphPortSide) ?? "input",
                  type: el.dataset.type ?? "any",
                }
              : null
          const anchored = target && validate(source, target) ? store.getPortPosition(target) : null
          state = {
            source,
            position: anchored ?? screenToGraph({ x: e.clientX, y: e.clientY }),
            target,
            valid: !!anchored,
          }
          setConnecting(state)
        },
        (e) => {
          setConnecting(null)
          if (state.target && state.valid) {
            const [from, to] = source.side === "output" ? [source, state.target] : [state.target, source]
            latest.current.onConnect?.({
              source: { nodeId: from.nodeId, portId: from.portId },
              target: { nodeId: to.nodeId, portId: to.portId },
            })
          } else if (!state.target) {
            latest.current.onConnectEnd?.({
              source,
              position: screenToGraph({ x: e.clientX, y: e.clientY }),
              client: { x: e.clientX, y: e.clientY },
            })
          }
        }
      )
    },
    [screenToGraph, store, track, validate]
  )

  /** Pointer down on the pane itself: pan (middle/right button, space, or alt) or marquee (left). */
  const onPanePointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      const target = event.target as HTMLElement
      if (target.closest("[data-slot=node-graph-controls], [data-slot=node-graph-minimap]")) return
      const pin = target.closest<HTMLElement>("[data-slot=node-graph-port-pin]")
      const nodeEl = target.closest<HTMLElement>("[data-slot=node-graph-node]")
      const edgeEl = target.closest<HTMLElement>("[data-slot=node-graph-edge]")
      const startClient = { x: event.clientX, y: event.clientY }
      const touch = event.pointerType === "touch"
      const isPan =
        event.button === 1 ||
        event.button === 2 ||
        spaceRef.current ||
        ((event.altKey || touch) && !nodeEl && !edgeEl && !pin)
      if (!isPan && (nodeEl || edgeEl)) return
      if (isPan) {
        event.preventDefault()
        const startViewport = latest.current.viewport
        let moved = false
        setPanning(true)
        // Right-click selects the node under the cursor like a left click would.
        const nodeId = nodeEl?.dataset.value
        if (event.button === 2 && nodeId && !latest.current.selection.nodes.includes(nodeId)) {
          setSelection({ nodes: [nodeId], edges: [] })
        }
        track(
          (e) => {
            const dx = e.clientX - startClient.x
            const dy = e.clientY - startClient.y
            if (!moved && Math.hypot(dx, dy) < 3) return
            moved = true
            setViewport({ ...startViewport, x: startViewport.x + dx, y: startViewport.y + dy })
          },
          (e) => {
            setPanning(false)
            if (!moved && event.button === 2) {
              const client = { x: e.clientX, y: e.clientY }
              const position = screenToGraph(client)
              const handlers = latest.current
              if (pin && pin.dataset.nodeId && pin.dataset.portId) {
                handlers.onPortContextMenu?.({
                  nodeId: pin.dataset.nodeId,
                  portId: pin.dataset.portId,
                  side: (pin.dataset.side as NodeGraphPortSide) ?? "input",
                  type: pin.dataset.type ?? "any",
                  position,
                  client,
                })
              } else if (nodeId) {
                handlers.onNodeContextMenu?.({ id: nodeId, position, client })
              } else if (edgeEl?.dataset.value) {
                handlers.onEdgeContextMenu?.({ id: edgeEl.dataset.value, position, client })
              } else {
                handlers.onPaneContextMenu?.({ position, client })
              }
            }
          }
        )
        return
      }
      if (event.button !== 0) return
      const additive = event.shiftKey || event.metaKey || event.ctrlKey
      const base = additive ? latest.current.selection : EMPTY_SELECTION
      if (!additive) setSelection(EMPTY_SELECTION)
      const origin = screenToGraph(startClient)
      let box: NodeGraphRect | null = null
      track(
        (e) => {
          const point = screenToGraph({ x: e.clientX, y: e.clientY })
          if (!box && Math.hypot(e.clientX - startClient.x, e.clientY - startClient.y) < 3) return
          box = {
            x: Math.min(origin.x, point.x),
            y: Math.min(origin.y, point.y),
            width: Math.abs(point.x - origin.x),
            height: Math.abs(point.y - origin.y),
          }
          setMarquee(box)
          const hits: string[] = []
          for (const [id, node] of store.nodes) {
            const intersects =
              node.position.x < box.x + box.width &&
              node.position.x + node.width > box.x &&
              node.position.y < box.y + box.height &&
              node.position.y + node.height > box.y
            if (intersects) hits.push(id)
          }
          setSelection({ nodes: [...new Set([...base.nodes, ...hits])], edges: base.edges })
        },
        () => setMarquee(null)
      )
    },
    [track, setViewport, setSelection, screenToGraph, store]
  )

  const disconnect = React.useCallback(
    (details: NodeGraphPortDetails) => {
      latest.current.onDisconnect?.(details)
      announce(`Broke links on ${details.side} ${details.portId}.`)
    },
    [announce]
  )

  const edgeAtStable = React.useCallback(
    (details: NodeGraphPortDetails) => latest.current.edgeAt?.(details) ?? null,
    []
  )

  const deleteSelection = React.useCallback(() => {
    const current = latest.current.selection
    if (!current.nodes.length && !current.edges.length) return
    onDelete?.(current)
    setSelection(EMPTY_SELECTION)
    announce(
      `Deleted ${current.nodes.length} node${current.nodes.length === 1 ? "" : "s"} and ${current.edges.length} connection${current.edges.length === 1 ? "" : "s"}.`
    )
  }, [onDelete, setSelection, announce])

  const nudgeSelection = React.useCallback(
    (delta: XY, focusedNodeId?: string) => {
      const current = latest.current.selection
      const ids = current.nodes.length ? current.nodes : focusedNodeId ? [focusedNodeId] : []
      if (!ids.length) return
      const moves = ids.map((id) => {
        const { position } = store.ensure(id)
        return { id, position: { x: position.x + delta.x, y: position.y + delta.y } }
      })
      latest.current.onNodesMove?.(moves)
      latest.current.onNodesMoveEnd?.(moves)
      announce(
        `Moved ${ids.length} node${ids.length === 1 ? "" : "s"} ${delta.x < 0 ? "left" : delta.x > 0 ? "right" : delta.y < 0 ? "up" : "down"}.`
      )
    },
    [store, announce]
  )

  const selectAll = React.useCallback(
    () => setSelection({ nodes: [...store.nodes.keys()], edges: latest.current.selection.edges }),
    [store, setSelection]
  )

  const onNodeClick = React.useCallback(
    (nodeId: string, event: React.MouseEvent | React.KeyboardEvent) => {
      const current = latest.current.selection
      const additive = event.shiftKey || event.metaKey || event.ctrlKey
      if (additive) {
        setSelection({
          nodes: current.nodes.includes(nodeId)
            ? current.nodes.filter((id) => id !== nodeId)
            : [...current.nodes, nodeId],
          edges: current.edges,
        })
      } else {
        setSelection({ nodes: [nodeId], edges: [] })
      }
    },
    [setSelection]
  )
  const onEdgeClick = React.useCallback(
    (edgeId: string, event: React.MouseEvent) => {
      const current = latest.current.selection
      const additive = event.shiftKey || event.metaKey || event.ctrlKey
      if (additive) {
        setSelection({
          nodes: current.nodes,
          edges: current.edges.includes(edgeId)
            ? current.edges.filter((id) => id !== edgeId)
            : [...current.edges, edgeId],
        })
      } else {
        setSelection({ nodes: [], edges: [edgeId] })
      }
    },
    [setSelection]
  )

  const ctx = React.useMemo<NodeGraphContextValue>(
    () => ({
      store,
      viewport,
      setViewport,
      viewportRef,
      size,
      minZoom,
      maxZoom,
      snapGrid,
      selection,
      setSelection,
      connecting,
      marquee,
      draggingNodes,
      panning,
      spaceHeld,
      screenToGraph,
      graphToScreen,
      zoomIn,
      zoomOut,
      zoomTo,
      fitView,
      centerOn,
      announce,
      startNodeDrag,
      startConnection,
      disconnect,
      edgeAt: edgeAtStable,
      deleteSelection,
      nudgeSelection,
      selectAll,
      onNodeClick,
      onEdgeClick,
    }),
    [
      store,
      viewport,
      setViewport,
      size,
      minZoom,
      maxZoom,
      snapGrid,
      selection,
      setSelection,
      connecting,
      marquee,
      draggingNodes,
      panning,
      spaceHeld,
      screenToGraph,
      graphToScreen,
      zoomIn,
      zoomOut,
      zoomTo,
      fitView,
      centerOn,
      announce,
      startNodeDrag,
      startConnection,
      disconnect,
      edgeAtStable,
      deleteSelection,
      nudgeSelection,
      selectAll,
      onNodeClick,
      onEdgeClick,
    ]
  )

  return (
    <NodeGraphContext.Provider value={ctx}>
      <PanePointerDownContext.Provider value={onPanePointerDown}>
        <div
          data-slot="node-graph"
          data-connecting={connecting ? "" : undefined}
          data-dragging={draggingNodes ? "" : undefined}
          data-panning={panning ? "" : undefined}
          className={cn("relative flex min-h-0 flex-1 flex-col", className)}
          {...props}
        >
          {children}
          <LiveRegion data-slot="node-graph-live-region" message={announcement} />
        </div>
      </PanePointerDownContext.Provider>
    </NodeGraphContext.Provider>
  )
}

const PanePointerDownContext = React.createContext<((event: React.PointerEvent) => void) | null>(null)

/* ---------------------------------------------------------------------------
 * Viewport
 * ------------------------------------------------------------------------- */

function NodeGraphViewport({
  className,
  children,
  panOnScroll = false,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  /** Plain wheel pans instead of zooming (pinch / ctrl+wheel always zooms). */
  panOnScroll?: boolean
}) {
  const ctx = useNodeGraph()
  const onPanePointerDown = React.useContext(PanePointerDownContext)
  const { viewportRef, setViewport, zoomTo, connecting, panning, spaceHeld } = ctx
  const ctxRef = React.useRef(ctx)
  React.useEffect(() => {
    ctxRef.current = ctx
  })

  // Wheel must be non-passive to prevent page scroll.
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const zooming = event.ctrlKey || event.metaKey || !panOnScroll
      if (zooming) {
        const factor = Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.002))
        zoomTo(ctxRef.current.viewport.zoom * factor, { x: event.clientX, y: event.clientY })
      } else {
        setViewport((prev) => ({ ...prev, x: prev.x - event.deltaX, y: prev.y - event.deltaY }))
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [viewportRef, setViewport, zoomTo, panOnScroll])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const target = event.target as HTMLElement
    if (target.closest("input, textarea, select, [contenteditable]")) return
    const focusedNode = target.closest<HTMLElement>("[data-slot=node-graph-node]")?.dataset.value
    const step = (event.shiftKey ? 10 : 1) * (ctx.snapGrid || 10)
    const meta = event.metaKey || event.ctrlKey
    switch (event.key) {
      case " ":
        if (!focusedNode) event.preventDefault()
        break
      case "Delete":
      case "Backspace":
        event.preventDefault()
        ctx.deleteSelection()
        break
      case "Escape":
        ctx.setSelection(EMPTY_SELECTION)
        break
      case "a":
      case "A":
        if (meta) {
          event.preventDefault()
          ctx.selectAll()
        }
        break
      case "ArrowLeft":
        event.preventDefault()
        ctx.nudgeSelection({ x: -step, y: 0 }, focusedNode)
        break
      case "ArrowRight":
        event.preventDefault()
        ctx.nudgeSelection({ x: step, y: 0 }, focusedNode)
        break
      case "ArrowUp":
        event.preventDefault()
        ctx.nudgeSelection({ x: 0, y: -step }, focusedNode)
        break
      case "ArrowDown":
        event.preventDefault()
        ctx.nudgeSelection({ x: 0, y: step }, focusedNode)
        break
      case "=":
      case "+":
        if (meta) {
          event.preventDefault()
          ctx.zoomIn()
        }
        break
      case "-":
        if (meta) {
          event.preventDefault()
          ctx.zoomOut()
        }
        break
      case "0":
        if (meta) {
          event.preventDefault()
          ctx.fitView()
        }
        break
    }
  }

  return (
    <div
      ref={viewportRef}
      data-slot="node-graph-viewport"
      tabIndex={0}
      role="application"
      aria-label="Node graph"
      data-connecting={connecting ? "" : undefined}
      data-panning={panning ? "" : undefined}
      data-space={spaceHeld ? "" : undefined}
      className={cn(
        "relative min-h-0 flex-1 touch-none overflow-hidden rounded-xl border bg-muted/30 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "data-connecting:cursor-crosshair data-panning:cursor-grabbing data-space:cursor-grab",
        className
      )}
      onPointerDown={(event) => onPanePointerDown?.(event)}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Background grid
 * ------------------------------------------------------------------------- */

function NodeGraphBackground({
  className,
  variant = "dots",
  gap = 20,
  ...props
}: React.ComponentProps<"svg"> & { variant?: "dots" | "lines"; gap?: number }) {
  const { viewport } = useNodeGraph()
  const id = React.useId()
  const size = gap * viewport.zoom
  const major = size * 5
  return (
    <svg
      data-slot="node-graph-background"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full text-foreground/60", className)}
      {...props}
    >
      <pattern
        id={`${id}-minor`}
        x={viewport.x % size}
        y={viewport.y % size}
        width={size}
        height={size}
        patternUnits="userSpaceOnUse"
      >
        {variant === "dots" ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={Math.max(0.6, viewport.zoom * 0.9)}
            fill="currentColor"
            opacity={0.28}
          />
        ) : (
          <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.08} />
        )}
      </pattern>
      <pattern
        id={`${id}-major`}
        x={viewport.x % major}
        y={viewport.y % major}
        width={major}
        height={major}
        patternUnits="userSpaceOnUse"
      >
        <path d={`M ${major} 0 L 0 0 0 ${major}`} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.1} />
      </pattern>
      <rect width="100%" height="100%" fill={`url(#${id}-minor)`} />
      <rect width="100%" height="100%" fill={`url(#${id}-major)`} />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
 * Surface (transformed layer), edges, connection line, marquee
 * ------------------------------------------------------------------------- */

function NodeGraphSurface({ className, style, ...props }: React.ComponentProps<"div">) {
  const { viewport } = useNodeGraph()
  return (
    <div
      data-slot="node-graph-surface"
      className={cn("absolute top-0 left-0 origin-top-left", className)}
      style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, ...style }}
      {...props}
    />
  )
}

function NodeGraphEdges({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="node-graph-edges"
      className={cn("pointer-events-none absolute top-0 left-0 size-px overflow-visible", className)}
      {...props}
    />
  )
}

/** Cubic path between two points; horizontal handles scale with distance like a scripting graph. */
function getBezierPath(source: XY, target: XY) {
  const dx = target.x - source.x
  const offset = clamp(Math.abs(dx) * 0.5, 40, 240) + (dx < 0 ? Math.min(Math.abs(dx) * 0.25, 120) : 0)
  return `M ${source.x} ${source.y} C ${source.x + offset} ${source.y}, ${target.x - offset} ${target.y}, ${target.x} ${target.y}`
}

function NodeGraphEdge({
  value,
  source,
  target,
  selected: selectedProp,
  className,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"g">, "children" | "target"> & {
  value: string
  source: NodeGraphPortRef
  target: NodeGraphPortRef
  selected?: boolean
  /** Render prop for labels; receives the path midpoint. */
  children?: (details: { midpoint: XY; from: XY; to: XY }) => React.ReactNode
}) {
  const { store, selection, onEdgeClick } = useNodeGraph()
  useLayoutVersion(store)
  const from = store.getPortPosition(source)
  const to = store.getPortPosition(target)
  if (!from || !to) return null
  const selected = selectedProp ?? selection.edges.includes(value)
  const d = getBezierPath(from, to)
  const midpoint = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
  const type = store.getPort(source)?.type
  return (
    <g
      data-slot="node-graph-edge"
      data-value={value}
      data-selected={selected ? "" : undefined}
      data-type={type}
      className={cn("group/edge pointer-events-auto cursor-pointer text-muted-foreground", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) onEdgeClick(value, event)
      }}
      {...props}
    >
      <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="transition-[stroke-width] group-hover/edge:stroke-3 group-data-selected/edge:stroke-3 group-data-selected/edge:drop-shadow-[0_0_4px_currentColor]"
      />
      {children?.({ midpoint, from, to })}
    </g>
  )
}

/** The edge being drawn from a pin. Renders nothing when idle. */
function NodeGraphConnectionLine({ className, ...props }: React.ComponentProps<"svg">) {
  const { store, connecting } = useNodeGraph()
  useLayoutVersion(store)
  if (!connecting) return null
  const from = store.getPortPosition(connecting.source)
  if (!from) return null
  const [a, b] = connecting.source.side === "output" ? [from, connecting.position] : [connecting.position, from]
  return (
    <svg
      data-slot="node-graph-connection-line"
      data-type={connecting.source.type}
      data-valid={connecting.valid ? "" : undefined}
      data-invalid={connecting.target && !connecting.valid ? "" : undefined}
      className={cn(
        "pointer-events-none absolute top-0 left-0 size-px overflow-visible text-foreground data-invalid:text-destructive",
        className
      )}
      {...props}
    >
      <path
        d={getBezierPath(a, b)}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray={connecting.valid ? undefined : "6 4"}
      />
      <circle cx={b.x} cy={b.y} r={3} fill="currentColor" />
    </svg>
  )
}

/** Marquee selection rectangle. Renders nothing when idle. */
function NodeGraphSelectionBox({ className, style, ...props }: React.ComponentProps<"div">) {
  const { marquee, viewport } = useNodeGraph()
  if (!marquee) return null
  return (
    <div
      data-slot="node-graph-selection-box"
      className={cn("pointer-events-none absolute rounded-sm border border-primary/60 bg-primary/10", className)}
      style={{
        left: marquee.x * viewport.zoom + viewport.x,
        top: marquee.y * viewport.zoom + viewport.y,
        width: marquee.width * viewport.zoom,
        height: marquee.height * viewport.zoom,
        ...style,
      }}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Nodes
 * ------------------------------------------------------------------------- */

type NodeContextValue = {
  value: string
  registerPort: (portId: string, layout: PortLayout) => () => void
  measure: () => void
}
const NodeContext = React.createContext<NodeContextValue | null>(null)

function useNodeGraphNode() {
  const ctx = React.useContext(NodeContext)
  if (!ctx) throw new Error("Node parts must be used within <NodeGraphNode>")
  return ctx
}

function NodeGraphNode({
  value,
  position,
  selected: selectedProp,
  className,
  style,
  onPointerDown,
  onKeyDown,
  onDoubleClick,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string; position: XY; selected?: boolean }) {
  const graph = useNodeGraph()
  const { store, selection, draggingNodes, startNodeDrag, onNodeClick } = graph
  const ref = React.useRef<HTMLDivElement>(null)
  const selected = selectedProp ?? selection.nodes.includes(value)
  const zoomRef = React.useRef(graph.viewport.zoom)
  React.useLayoutEffect(() => {
    zoomRef.current = graph.viewport.zoom
  }, [graph.viewport.zoom])

  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const zoom = zoomRef.current || 1
    const rect = el.getBoundingClientRect()
    const node = store.ensure(value)
    node.width = rect.width / zoom
    node.height = rect.height / zoom
    for (const port of node.ports.values()) {
      const pin = port.el?.getBoundingClientRect()
      if (!pin) continue
      port.offset = {
        x: (pin.left + pin.width / 2 - rect.left) / zoom,
        y: (pin.top + pin.height / 2 - rect.top) / zoom,
      }
    }
    store.emit()
  }, [store, value])

  // Position from props is the source of truth; keep the store in sync for edges/minimap.
  React.useLayoutEffect(() => {
    const node = store.ensure(value)
    node.position = position
    store.emit()
  }, [store, value, position])
  React.useLayoutEffect(() => {
    measure()
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => measure())
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure])
  React.useEffect(
    () => () => {
      store.nodes.delete(value)
      store.emit()
    },
    [store, value]
  )

  const nodeCtx = React.useMemo<NodeContextValue>(
    () => ({
      value,
      registerPort: (portId, layout) => {
        const node = store.ensure(value)
        node.ports.set(portId, layout)
        measure()
        return () => {
          node.ports.delete(portId)
          store.emit()
        }
      },
      measure,
    }),
    [store, value, measure]
  )

  return (
    <NodeContext.Provider value={nodeCtx}>
      <div
        ref={ref}
        data-slot="node-graph-node"
        data-value={value}
        data-selected={selected ? "" : undefined}
        data-dragging={draggingNodes && selected ? "" : undefined}
        tabIndex={0}
        className={cn(
          "group/node absolute top-0 left-0 flex w-56 flex-col rounded-lg border bg-card text-card-foreground shadow-md outline-none",
          "cursor-grab data-dragging:cursor-grabbing data-dragging:shadow-xl",
          "focus-visible:ring-2 focus-visible:ring-ring/50 data-selected:border-primary data-selected:ring-2 data-selected:ring-primary/40",
          className
        )}
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, ...style }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest(INTERACTIVE)) return
          if (graph.spaceHeld) return
          event.stopPropagation()
          startNodeDrag(value, event)
        }}
        onDoubleClick={(event) => {
          onDoubleClick?.(event)
          if (!event.defaultPrevented) graph.fitView({ ids: [value], padding: 80, maxZoom: 1.5 })
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || event.target !== event.currentTarget) return
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault()
            onNodeClick(value, event)
          }
        }}
        {...props}
      >
        {children}
      </div>
    </NodeContext.Provider>
  )
}

/** Header slot for buttons (menus, run triggers). Revealed on hover/selection; clicks never start a drag. */
function NodeGraphNodeActions({ className, onPointerDown, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-node-actions"
      className={cn(
        "ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within/node:opacity-100 group-hover/node:opacity-100 group-data-selected/node:opacity-100",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        event.stopPropagation()
      }}
      {...props}
    />
  )
}

function NodeGraphNodeHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-node-header"
      className={cn(
        "flex items-center gap-2 rounded-t-[inherit] border-b bg-muted/60 px-3 py-2 text-sm font-medium [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NodeGraphNodeTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="node-graph-node-title" className={cn("truncate leading-tight", className)} {...props} />
}

function NodeGraphNodeSubtitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-node-subtitle"
      className={cn("truncate text-xs font-normal text-muted-foreground", className)}
      {...props}
    />
  )
}

function NodeGraphNodeBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="node-graph-node-body" className={cn("grid grid-cols-2 gap-x-2 py-2", className)} {...props} />
}

function NodeGraphNodeInputs({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="node-graph-node-inputs" className={cn("flex flex-col gap-1", className)} {...props} />
}

function NodeGraphNodeOutputs({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-node-outputs"
      className={cn("col-start-2 flex flex-col items-end gap-1", className)}
      {...props}
    />
  )
}

function NodeGraphNodeFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-node-footer"
      className={cn("rounded-b-[inherit] border-t px-3 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Ports
 * ------------------------------------------------------------------------- */

type PortContextValue = { value: string; side: NodeGraphPortSide; type: string; connected: boolean }
const PortContext = React.createContext<PortContextValue | null>(null)

function NodeGraphPort({
  value,
  side,
  type = "any",
  connected = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string; side: NodeGraphPortSide; type?: string; connected?: boolean }) {
  const ctx = React.useMemo(() => ({ value, side, type, connected }), [value, side, type, connected])
  return (
    <PortContext.Provider value={ctx}>
      <div
        data-slot="node-graph-port"
        data-side={side}
        data-type={type}
        data-connected={connected ? "" : undefined}
        className={cn(
          "flex min-h-6 items-center gap-1.5 text-xs",
          side === "input" ? "pr-2 pl-0" : "flex-row-reverse pr-0 pl-2",
          className
        )}
        {...props}
      />
    </PortContext.Provider>
  )
}

const pinVariants = cva(
  "relative z-10 box-content shrink-0 cursor-crosshair border-2 border-current bg-background transition-transform hover:scale-125 data-connected:bg-current data-target:scale-125 data-target:ring-2 data-target:ring-current/40",
  {
    variants: {
      variant: {
        circle: "size-2.5 rounded-full",
        exec: "size-3 border-0 bg-current opacity-45 [clip-path:polygon(0_0,60%_0,100%_50%,60%_100%,0_100%)] data-connected:opacity-100",
      },
    },
    defaultVariants: { variant: "circle" },
  }
)

/** The connection handle. Sits on the node's edge: inputs are pulled left, outputs right. */
function NodeGraphPortPin({
  className,
  variant,
  onPointerDown,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof pinVariants>) {
  const graph = useNodeGraph()
  const node = useNodeGraphNode()
  const port = React.useContext(PortContext)
  if (!port) throw new Error("NodeGraphPortPin must be used within <NodeGraphPort>")
  const ref = React.useRef<HTMLDivElement>(null)
  const { registerPort } = node
  React.useLayoutEffect(
    () => registerPort(port.value, { side: port.side, type: port.type, el: ref.current, offset: { x: 0, y: 0 } }),
    [registerPort, port.value, port.side, port.type]
  )
  const connecting = graph.connecting
  const isTarget = connecting?.target?.nodeId === node.value && connecting.target.portId === port.value
  const isSource = connecting?.source.nodeId === node.value && connecting.source.portId === port.value
  return (
    <div
      ref={ref}
      data-slot="node-graph-port-pin"
      data-node-id={node.value}
      data-port-id={port.value}
      data-side={port.side}
      data-type={port.type}
      data-connected={port.connected || isSource ? "" : undefined}
      data-target={isTarget ? (connecting?.valid ? "valid" : "invalid") : undefined}
      aria-label={`${port.side} ${port.value}`}
      className={cn(
        pinVariants({ variant }),
        port.side === "input" ? "-ml-1.75" : "-mr-1.75",
        isTarget && !connecting?.valid && "cursor-not-allowed text-destructive",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        event.stopPropagation()
        event.preventDefault()
        const details = { nodeId: node.value, portId: port.value, side: port.side, type: port.type }
        if (event.altKey) {
          graph.disconnect(details)
          return
        }
        const other = port.connected ? graph.edgeAt(details) : null
        if (other) {
          // Pick the existing link up: drop it, then keep dragging from its far end.
          graph.disconnect(details)
          graph.startConnection(other, event)
          return
        }
        graph.startConnection(details, event)
      }}
      {...props}
    />
  )
}

function NodeGraphPortLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="node-graph-port-label" className={cn("truncate", className)} {...props} />
}

/* ---------------------------------------------------------------------------
 * Controls, minimap, empty
 * ------------------------------------------------------------------------- */

function NodeGraphControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-controls"
      className={cn(
        "absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-lg border bg-background/90 p-1 shadow-sm backdrop-blur-sm",
        className
      )}
      onPointerDown={(event) => event.stopPropagation()}
      {...props}
    />
  )
}

type ControlTriggerProps = React.ComponentProps<typeof Button>

function NodeGraphZoomInTrigger({ asChild, children, onClick, ...props }: ControlTriggerProps) {
  const { zoomIn } = useNodeGraph()
  return (
    <Button
      data-slot="node-graph-zoom-in-trigger"
      variant="ghost"
      size="icon-sm"
      asChild={asChild}
      aria-label="Zoom in"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) zoomIn()
      }}
      {...props}
    >
      {asChild ? children : (children ?? <PlusIcon />)}
    </Button>
  )
}

function NodeGraphZoomOutTrigger({ asChild, children, onClick, ...props }: ControlTriggerProps) {
  const { zoomOut } = useNodeGraph()
  return (
    <Button
      data-slot="node-graph-zoom-out-trigger"
      variant="ghost"
      size="icon-sm"
      asChild={asChild}
      aria-label="Zoom out"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) zoomOut()
      }}
      {...props}
    >
      {asChild ? children : (children ?? <MinusIcon />)}
    </Button>
  )
}

function NodeGraphFitViewTrigger({ asChild, children, onClick, ...props }: ControlTriggerProps) {
  const { fitView } = useNodeGraph()
  return (
    <Button
      data-slot="node-graph-fit-view-trigger"
      variant="ghost"
      size="icon-sm"
      asChild={asChild}
      aria-label="Fit view"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) fitView()
      }}
      {...props}
    >
      {asChild ? children : (children ?? <MaximizeIcon />)}
    </Button>
  )
}

/** Current zoom as a percentage; click resets to 100%. */
function NodeGraphZoomValue({
  className,
  asChild,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof ark.button>) {
  const { viewport, zoomTo } = useNodeGraph()
  return (
    <ark.button
      data-slot="node-graph-zoom-value"
      type="button"
      asChild={asChild}
      aria-label="Reset zoom"
      className={cn(
        "h-7 min-w-12 rounded-md px-2 text-xs font-medium text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) zoomTo(1)
      }}
      {...props}
    >
      {asChild ? children : (children ?? `${Math.round(viewport.zoom * 100)}%`)}
    </ark.button>
  )
}

function NodeGraphMinimap({
  className,
  width = 180,
  height = 120,
  ...props
}: React.ComponentProps<"svg"> & { width?: number; height?: number }) {
  const { store, viewport, size, selection, centerOn } = useNodeGraph()
  useLayoutVersion(store)
  const nodes = [...store.nodes]
  const view = {
    x: -viewport.x / viewport.zoom,
    y: -viewport.y / viewport.zoom,
    width: size.width / viewport.zoom,
    height: size.height / viewport.zoom,
  }
  const bounds = store.getBounds() ?? view
  const minX = Math.min(bounds.x, view.x)
  const minY = Math.min(bounds.y, view.y)
  const maxX = Math.max(bounds.x + bounds.width, view.x + view.width)
  const maxY = Math.max(bounds.y + bounds.height, view.y + view.height)
  const pad = Math.max(maxX - minX, maxY - minY) * 0.05
  const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
  const scale = (maxX - minX + pad * 2) / width

  // Match "meet" scaling: the viewBox is centred inside the svg box.
  const pointToGraph = (svg: SVGSVGElement, client: XY) => {
    const rect = svg.getBoundingClientRect()
    const vbW = maxX - minX + pad * 2
    const vbH = maxY - minY + pad * 2
    const s = Math.max(vbW / rect.width, vbH / rect.height)
    const offsetX = (rect.width * s - vbW) / 2
    const offsetY = (rect.height * s - vbH) / 2
    return { x: minX - pad - offsetX + (client.x - rect.left) * s, y: minY - pad - offsetY + (client.y - rect.top) * s }
  }

  return (
    <svg
      data-slot="node-graph-minimap"
      viewBox={viewBox}
      width={width}
      height={height}
      className={cn(
        "absolute right-3 bottom-3 z-20 cursor-pointer rounded-lg border bg-background/90 shadow-sm backdrop-blur-sm",
        className
      )}
      onPointerDown={(event) => {
        event.stopPropagation()
        event.preventDefault()
        const svg = event.currentTarget
        centerOn(pointToGraph(svg, { x: event.clientX, y: event.clientY }))
        const move = (e: PointerEvent) => centerOn(pointToGraph(svg, { x: e.clientX, y: e.clientY }))
        const up = () => {
          window.removeEventListener("pointermove", move)
          window.removeEventListener("pointerup", up)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
      }}
      {...props}
    >
      {nodes.map(([id, node]) => (
        <rect
          key={id}
          data-slot="node-graph-minimap-node"
          data-selected={selection.nodes.includes(id) ? "" : undefined}
          x={node.position.x}
          y={node.position.y}
          width={node.width}
          height={node.height}
          rx={4 * scale}
          className="fill-muted-foreground/40 data-selected:fill-primary"
        />
      ))}
      <rect
        data-slot="node-graph-minimap-viewport"
        x={view.x}
        y={view.y}
        width={view.width}
        height={view.height}
        className="fill-primary/10 stroke-primary/60"
        strokeWidth={scale}
      />
    </svg>
  )
}

function NodeGraphEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="node-graph-empty"
      className={cn(
        "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  NodeGraph,
  NodeGraphViewport,
  NodeGraphBackground,
  NodeGraphSurface,
  NodeGraphEdges,
  NodeGraphEdge,
  NodeGraphConnectionLine,
  NodeGraphSelectionBox,
  NodeGraphNode,
  NodeGraphNodeHeader,
  NodeGraphNodeActions,
  NodeGraphNodeTitle,
  NodeGraphNodeSubtitle,
  NodeGraphNodeBody,
  NodeGraphNodeInputs,
  NodeGraphNodeOutputs,
  NodeGraphNodeFooter,
  NodeGraphPort,
  NodeGraphPortPin,
  NodeGraphPortLabel,
  NodeGraphControls,
  NodeGraphZoomInTrigger,
  NodeGraphZoomOutTrigger,
  NodeGraphFitViewTrigger,
  NodeGraphZoomValue,
  NodeGraphMinimap,
  NodeGraphEmpty,
  useNodeGraph,
  getBezierPath,
  type NodeGraphViewportState,
  type NodeGraphPortRef,
  type NodeGraphPortDetails,
  type NodeGraphPortSide,
  type NodeGraphConnection,
  type NodeGraphSelection,
  type NodeGraphNodeMove,
}

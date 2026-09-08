import * as React from "react"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { attachClosestEdge, extractClosestEdge, type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { ark } from "@ark-ui/react"
import { GripVerticalIcon } from "lucide-react"
import { cloneDragPreview } from "@/lib/drag-preview"
import { cn } from "@/lib/utils"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

/**
 * Canvas — a compositional, data-agnostic drag-and-drop layout surface on
 * Pragmatic drag and drop. Items come from a palette (`CanvasPaletteItem`,
 * carrying arbitrary `data`) or are existing nodes (`CanvasNode`). Nodes are
 * drop targets on all four edges; the empty area is a target too. The canvas
 * reports every drop as an intent (`onDrop`) and leaves layout state to the
 * consumer, which renders rows/nodes from it. `CanvasResizeHandle` reports
 * pointer resizes between siblings as a fraction of the row width.
 */

type CanvasSource = { type: "palette"; data: unknown } | { type: "node"; id: string }
type CanvasTarget = { type: "node"; id: string; edge: Edge } | { type: "area" }
type CanvasDropDetails = { source: CanvasSource; target: CanvasTarget }

type DragData =
  { instanceId: symbol; type: "palette"; data: unknown } | { instanceId: symbol; type: "node"; id: string }

const NODE_TARGET = "canvas-node-target"
const AREA_TARGET = "canvas-area-target"

type CanvasDirection = "up" | "down" | "left" | "right"

type CanvasContextValue = {
  instanceId: symbol
  dragging: { type: "palette" | "node"; id?: string } | null
  /** Keyboard "pick up" state for nodes; arrows emit drop intents. */
  grabbed: string | null
  grab: (nodeId: string | null) => void
  moveByKey: (nodeId: string, direction: CanvasDirection) => void
  /** Keyboard activation of a palette item: drops it onto the area. */
  dropFromPalette: (data: unknown) => void
}

/** Focus the first selector that matches, after React has committed. */
const focusLater = (...selectors: string[]) =>
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      for (const selector of selectors) {
        const el = document.querySelector<HTMLElement>(selector)
        if (el) {
          el.focus()
          return
        }
      }
    })
  )

const cssEscape = (value: string) => (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value)

const CanvasContext = React.createContext<CanvasContextValue | null>(null)

function useCanvas() {
  const ctx = React.useContext(CanvasContext)
  if (!ctx) throw new Error("Canvas parts must be used within <Canvas>")
  return ctx
}

const isOwnData = (instanceId: symbol, data: Record<string | symbol, unknown>): data is DragData =>
  data.instanceId === instanceId && (data.type === "palette" || data.type === "node")

function CanvasRoot({ onDrop, className, children, ...props }: CanvasRootProps) {
  const [instanceId] = React.useState(() => Symbol("canvas"))
  const [dragging, setDragging] = React.useState<CanvasContextValue["dragging"]>(null)
  const [grabbed, setGrabbed] = React.useState<string | null>(null)
  const { message: announcement, announce: setAnnouncement } = useLiveRegion()
  const ref = React.useRef<HTMLDivElement>(null)
  const onDropRef = React.useRef(onDrop)
  React.useEffect(() => {
    onDropRef.current = onDrop
  })

  const grab = React.useCallback(
    (nodeId: string | null) => {
      setGrabbed(nodeId)
      setAnnouncement(
        nodeId
          ? `Picked up ${nodeId}. Arrow up or down moves it to its own row, left or right moves it beside a neighbour. Space or Enter drops, Escape cancels.`
          : "Dropped."
      )
    },
    [setAnnouncement]
  )

  const moveByKey = React.useCallback(
    (nodeId: string, direction: CanvasDirection) => {
      const root = ref.current
      const node = root?.querySelector<HTMLElement>(`[data-slot=canvas-node][data-value="${cssEscape(nodeId)}"]`)
      const row = node?.closest<HTMLElement>("[data-slot=canvas-row]")
      if (!root || !node || !row) return
      const siblings = Array.from(row.querySelectorAll<HTMLElement>(":scope > [data-slot=canvas-node]"))
      const index = siblings.indexOf(node)
      let target: CanvasTarget | null = null
      if (direction === "up") {
        const first = siblings[0]
        // Already alone at the top of its row: hop above the previous row instead.
        if (siblings.length === 1) {
          const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=canvas-row]"))
          const prev = rows[rows.indexOf(row) - 1]?.querySelector<HTMLElement>("[data-slot=canvas-node]")
          if (!prev) return
          target = { type: "node", id: prev.dataset.value ?? "", edge: "top" }
        } else target = { type: "node", id: first.dataset.value ?? "", edge: "top" }
      } else if (direction === "down") {
        const last = siblings[siblings.length - 1]
        if (siblings.length === 1) {
          const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=canvas-row]"))
          const next = rows[rows.indexOf(row) + 1]?.querySelector<HTMLElement>("[data-slot=canvas-node]")
          if (!next) return
          target = { type: "node", id: next.dataset.value ?? "", edge: "bottom" }
        } else target = { type: "node", id: last.dataset.value ?? "", edge: "bottom" }
      } else {
        const neighbour = siblings[direction === "left" ? index - 1 : index + 1]
        if (!neighbour) return
        target = { type: "node", id: neighbour.dataset.value ?? "", edge: direction }
      }
      // A vertical drop on the node itself means "pull me out into a new row"; horizontal is a no-op.
      if (target.type === "node" && target.id === nodeId && (target.edge === "left" || target.edge === "right")) return
      onDropRef.current?.({ source: { type: "node", id: nodeId }, target })
      setAnnouncement(`Moved ${nodeId} ${direction}.`)
      const nodeSelector = `[data-slot=canvas-node][data-value="${cssEscape(nodeId)}"]`
      focusLater(`${nodeSelector} [data-slot=canvas-node-handle]`, nodeSelector)
    },
    [setAnnouncement]
  )

  const dropFromPalette = React.useCallback(
    (data: unknown) => {
      onDropRef.current?.({ source: { type: "palette", data }, target: { type: "area" } })
      setAnnouncement("Added to the canvas.")
    },
    [setAnnouncement]
  )

  React.useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => isOwnData(instanceId, source.data),
        onDragStart: ({ source }) => {
          const data = source.data as DragData
          setDragging(data.type === "node" ? { type: "node", id: data.id } : { type: "palette" })
        },
        /** Called with `{ source, target }` for every drop: a palette item or node onto a node edge or the empty area. */
        onDrop: ({ source, location }) => {
          setDragging(null)
          const data = source.data as DragData
          const targets = location.current.dropTargets
          const nodeTarget = targets.find((t) => t.data[NODE_TARGET] === true)
          const areaTarget = targets.find((t) => t.data[AREA_TARGET] === true)
          const src: CanvasSource =
            data.type === "node" ? { type: "node", id: data.id } : { type: "palette", data: data.data }
          if (nodeTarget) {
            const id = String(nodeTarget.data.id)
            if (src.type === "node" && src.id === id) return
            const edge = extractClosestEdge(nodeTarget.data) ?? "bottom"
            onDropRef.current?.({ source: src, target: { type: "node", id, edge } })
          } else if (areaTarget) {
            onDropRef.current?.({ source: src, target: { type: "area" } })
          }
        },
      }),
    [instanceId]
  )

  const ctx = React.useMemo(
    () => ({ instanceId, dragging, grabbed, grab, moveByKey, dropFromPalette }),
    [instanceId, dragging, grabbed, grab, moveByKey, dropFromPalette]
  )
  return (
    <CanvasContext.Provider value={ctx}>
      <ark.div
        ref={ref}
        data-slot="canvas"
        data-dragging={dragging ? dragging.type : undefined}
        data-grabbed={grabbed ? "" : undefined}
        className={cn("flex min-h-0 flex-1 flex-col gap-4 lg:flex-row", className)}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {children}
            <LiveRegion.Root data-slot="canvas-live-region" message={announcement} />
          </>
        )}
      </ark.div>
    </CanvasContext.Provider>
  )
}

/** Keyboard handling shared by nodes and their handles. */
function useCanvasKeyboard(nodeId: string) {
  const { grabbed, grab, moveByKey } = useCanvas()
  const isGrabbed = grabbed === nodeId
  const onKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key
    if (key === " " || key === "Enter") {
      event.preventDefault()
      grab(isGrabbed ? null : nodeId)
      return
    }
    if (!isGrabbed) return
    if (key === "Escape") {
      event.preventDefault()
      grab(null)
      return
    }
    const direction = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[key] as
      CanvasDirection | undefined
    if (!direction) return
    event.preventDefault()
    moveByKey(nodeId, direction)
  }
  return { isGrabbed, onKeyDown, onBlur: () => isGrabbed && grab(null) }
}

/* -------------------------------------------------------------------------- */
/*  Palette                                                                   */
/* -------------------------------------------------------------------------- */

function CanvasPalette({ className, ...props }: CanvasPaletteProps) {
  return (
    <ark.div
      data-slot="canvas-palette"
      className={cn(
        "flex shrink-0 flex-row flex-wrap gap-1 lg:w-56 lg:flex-col lg:flex-nowrap lg:overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

/** A draggable source. `data` is handed back untouched in `onDrop`. */
function CanvasPaletteItem({ data, className, onKeyDown, ...props }: CanvasPaletteItemProps) {
  const { instanceId, dropFromPalette } = useCanvas()
  const ref = React.useRef<HTMLDivElement>(null)
  const dataRef = React.useRef(data)
  React.useEffect(() => {
    dataRef.current = data
  })
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return draggable({
      element: el,
      getInitialData: (): DragData => ({ instanceId, type: "palette", data: dataRef.current }),
      onGenerateDragPreview: (args) => cloneDragPreview(args),
      onDragStart: () => setIsDragging(true),
      /** Called with `{ source, target }` for every drop: a palette item or node onto a node edge or the empty area. */
      onDrop: () => setIsDragging(false),
    })
  }, [instanceId])

  return (
    <ark.div
      ref={ref}
      data-slot="canvas-palette-item"
      data-dragging={isDragging ? "" : undefined}
      tabIndex={0}
      role="button"
      aria-roledescription="draggable palette item"
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          dropFromPalette(dataRef.current)
        }
      }}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-sm shadow-xs transition-colors outline-none select-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing data-dragging:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Area + rows                                                               */
/* -------------------------------------------------------------------------- */

/** The drop surface. Dropping here (not on a node) reports `{ type: "area" }`. */
function CanvasArea({ className, ...props }: CanvasAreaProps) {
  const { instanceId } = useCanvas()
  const ref = React.useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return combine(
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) => isOwnData(instanceId, source.data),
        getData: () => ({ [AREA_TARGET]: true }),
        onDragEnter: ({ self, location }) => setIsOver(location.current.dropTargets[0]?.element === self.element),
        onDrag: ({ self, location }) => {
          const over = location.current.dropTargets[0]?.element === self.element
          setIsOver((prev) => (prev === over ? prev : over))
        },
        onDragLeave: () => setIsOver(false),
        /** Called with `{ source, target }` for every drop: a palette item or node onto a node edge or the empty area. */
        onDrop: () => setIsOver(false),
      }),
      autoScrollForElements({ element: el, canScroll: ({ source }) => isOwnData(instanceId, source.data) })
    )
  }, [instanceId])

  return (
    <ark.div
      ref={ref}
      data-slot="canvas-area"
      data-over={isOver ? "" : undefined}
      className={cn(
        "flex min-h-40 min-w-0 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-dashed bg-muted/30 p-4 transition-colors data-over:border-primary/50 data-over:bg-primary/5",
        className
      )}
      {...props}
    />
  )
}

function CanvasEmpty({ className, ...props }: CanvasEmptyProps) {
  return (
    <ark.div
      data-slot="canvas-empty"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-16 text-center text-sm text-muted-foreground [&_svg]:mb-1 [&_svg]:size-6",
        className
      )}
      {...props}
    />
  )
}

type RowContextValue = {
  ref: React.RefObject<HTMLDivElement | null>
  /** True while a `CanvasResizeHandle` in this row is being dragged. */
  resizing: boolean
  setResizing: (resizing: boolean) => void
}
const RowContext = React.createContext<RowContextValue | null>(null)

/** A horizontal row of nodes. Node widths are `flex-grow` weights. */
function CanvasRow({ className, ...props }: CanvasRowProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = React.useState(false)
  const ctx = React.useMemo(() => ({ ref, resizing, setResizing }), [resizing])
  return (
    <RowContext.Provider value={ctx}>
      <ark.div
        ref={ref}
        data-slot="canvas-row"
        data-resizing={resizing ? "" : undefined}
        className={cn("flex items-stretch gap-3", className)}
        {...props}
      />
    </RowContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Node                                                                      */
/* -------------------------------------------------------------------------- */

type NodeContextValue = { handleRef: React.RefObject<HTMLElement | null>; isDragging: boolean; value: string }
const NodeContext = React.createContext<NodeContextValue | null>(null)

function CanvasNode({
  value,
  width = 1,
  draggable: isDraggable = true,
  selected,
  className,
  children,
  style,
  onKeyDown,
  onBlur,
  ...props
}: CanvasNodeProps) {
  const { instanceId } = useCanvas()
  const keyboard = useCanvasKeyboard(value)
  const row = React.useContext(RowContext)
  const ref = React.useRef<HTMLDivElement>(null)
  const handleRef = React.useRef<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [closestEdge, setClosestEdge] = React.useState<Edge | null>(null)
  const [percent, setPercent] = React.useState<number | null>(null)
  const resizing = row?.resizing ?? false

  // While the row is being resized, show this node's share of the row.
  React.useLayoutEffect(() => {
    const el = ref.current
    const rowEl = row?.ref.current
    if (!resizing || !el || !rowEl) {
      setPercent(null)
      return
    }
    const siblings = Array.from(rowEl.querySelectorAll<HTMLElement>(":scope > [data-slot=canvas-node]"))
    const total = siblings.reduce((sum, n) => sum + n.getBoundingClientRect().width, 0)
    setPercent(total ? Math.round((el.getBoundingClientRect().width / total) * 100) : null)
  }, [resizing, width, row])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const cleanups = [
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) =>
          isOwnData(instanceId, source.data) && !(source.data.type === "node" && source.data.id === value),
        getIsSticky: () => true,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { [NODE_TARGET]: true, id: value },
            { element, input, allowedEdges: ["top", "bottom", "left", "right"] }
          ),
        onDragEnter: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDrag: ({ self }) => {
          const edge = extractClosestEdge(self.data)
          setClosestEdge((prev) => (prev === edge ? prev : edge))
        },
        onDragLeave: () => setClosestEdge(null),
        /** Called with `{ source, target }` for every drop: a palette item or node onto a node edge or the empty area. */
        onDrop: () => setClosestEdge(null),
      }),
    ]
    if (isDraggable) {
      cleanups.push(
        draggable({
          element: el,
          dragHandle: handleRef.current ?? undefined,
          getInitialData: (): DragData => ({ instanceId, type: "node", id: value }),
          onGenerateDragPreview: (args) => cloneDragPreview(args),
          onDragStart: () => setIsDragging(true),
          /** Called with `{ source, target }` for every drop: a palette item or node onto a node edge or the empty area. */
          onDrop: () => setIsDragging(false),
        })
      )
    }
    return combine(...cleanups)
  }, [instanceId, value, isDraggable])

  const [hasHandle, setHasHandle] = React.useState(false)
  React.useEffect(() => setHasHandle(!!handleRef.current), [])
  const ctx = React.useMemo(() => ({ handleRef, isDragging, value }), [isDragging, value])
  return (
    <NodeContext.Provider value={ctx}>
      <ark.div
        ref={ref}
        data-slot="canvas-node"
        data-value={value}
        data-dragging={isDragging ? "" : undefined}
        data-edge={closestEdge ?? undefined}
        data-selected={selected ? "" : undefined}
        data-grabbed={keyboard.isGrabbed ? "" : undefined}
        tabIndex={isDraggable && !hasHandle ? 0 : undefined}
        aria-roledescription={isDraggable && !hasHandle ? "draggable item" : undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented && !hasHandle && event.target === event.currentTarget) keyboard.onKeyDown(event)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (!hasHandle && event.target === event.currentTarget) keyboard.onBlur()
        }}
        style={{ flexGrow: width, flexBasis: 0, ...style }}
        className={cn(
          "group/canvas-node relative flex min-w-0 flex-col rounded-lg border bg-card p-3 text-sm shadow-xs transition-[opacity,box-shadow,border-color] outline-none hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50 data-dragging:opacity-40 data-grabbed:border-primary data-grabbed:ring-3 data-grabbed:ring-primary/30 data-selected:border-primary data-selected:ring-3 data-selected:ring-primary/20",
          className
        )}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {children}
            {closestEdge && <CanvasDropIndicator edge={closestEdge} />}
            {percent !== null && <CanvasNodeOverlay>{percent}%</CanvasNodeOverlay>}
          </>
        )}
      </ark.div>
    </NodeContext.Provider>
  )
}

/** Optional explicit drag handle; without it the whole node is the handle. */
function CanvasNodeHandle({ className, children, onKeyDown, onBlur, asChild, ...props }: CanvasNodeHandleProps) {
  const ctx = React.useContext(NodeContext)
  const keyboard = useCanvasKeyboard(ctx?.value ?? "")
  return (
    <ark.button
      asChild={asChild}
      ref={(el: HTMLElement | null) => {
        if (ctx) ctx.handleRef.current = el
      }}
      type="button"
      data-slot="canvas-node-handle"
      data-grabbed={keyboard.isGrabbed ? "" : undefined}
      aria-label="Drag"
      aria-pressed={keyboard.isGrabbed}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (!event.defaultPrevented) {
          keyboard.onKeyDown(event)
          event.stopPropagation()
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        keyboard.onBlur()
      }}
      className={cn(
        "flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing data-grabbed:bg-primary data-grabbed:text-primary-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {asChild ? children : (children ?? <GripVerticalIcon />)}
    </ark.button>
  )
}

function CanvasNodeHeader({ className, ...props }: CanvasNodeHeaderProps) {
  return <ark.div data-slot="canvas-node-header" className={cn("mb-2 flex items-center gap-1", className)} {...props} />
}

function CanvasNodeTitle({ className, ...props }: CanvasNodeTitleProps) {
  return (
    <ark.span
      data-slot="canvas-node-title"
      className={cn("min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

/** A blurring overlay with a centered pill, e.g. the node's width share while resizing. */
function CanvasNodeOverlay({ className, children, ...props }: CanvasNodeOverlayProps) {
  return (
    <ark.div
      data-slot="canvas-node-overlay"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/50 backdrop-blur-xs",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <span
            data-slot="canvas-node-overlay-pill"
            className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background tabular-nums shadow-md"
          >
            {children}
          </span>
        </>
      )}
    </ark.div>
  )
}

/** Actions revealed on hover/selection. */
function CanvasNodeActions({ className, ...props }: CanvasNodeActionsProps) {
  return (
    <ark.div
      data-slot="canvas-node-actions"
      className={cn(
        "ms-auto flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/canvas-node:opacity-100 group-hover/canvas-node:opacity-100 group-data-selected/canvas-node:opacity-100",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Resize handle                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Place between two nodes in a `CanvasRow`. Pointer drags call `onResize`
 * with the horizontal movement as a fraction of the row width (signed).
 */
function CanvasResizeHandle({ onResize, onResizeStart, onResizeEnd, className, ...props }: CanvasResizeHandleProps) {
  const row = React.useContext(RowContext)
  const [active, setActive] = React.useState(false)
  const handlers = React.useRef({ onResize, onResizeStart, onResizeEnd })
  React.useEffect(() => {
    handlers.current = { onResize, onResizeStart, onResizeEnd }
  })

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const rowEl = row?.ref.current
    if (!rowEl) return
    event.preventDefault()
    const target = event.currentTarget
    try {
      target.setPointerCapture(event.pointerId)
    } catch {
      // Synthetic pointers can't be captured; moves still arrive via bubbling.
    }
    let lastX = event.clientX
    setActive(true)
    row.setResizing(true)
    handlers.current.onResizeStart?.()
    const move = (e: PointerEvent) => {
      const width = rowEl.getBoundingClientRect().width
      if (!width) return
      const delta = (e.clientX - lastX) / width
      lastX = e.clientX
      if (delta !== 0) handlers.current.onResize(delta)
    }
    const up = () => {
      target.removeEventListener("pointermove", move)
      target.removeEventListener("pointerup", up)
      target.removeEventListener("pointercancel", up)
      setActive(false)
      row.setResizing(false)
      handlers.current.onResizeEnd?.()
    }
    target.addEventListener("pointermove", move)
    target.addEventListener("pointerup", up)
    target.addEventListener("pointercancel", up)
  }

  return (
    <ark.div
      role="separator"
      aria-orientation="vertical"
      data-slot="canvas-resize-handle"
      data-active={active ? "" : undefined}
      onPointerDown={onPointerDown}
      className={cn(
        "group/resize relative -mx-2 flex w-4 shrink-0 cursor-col-resize touch-none items-center justify-center select-none",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <span className="h-8 w-1 rounded-full bg-border transition-colors group-hover/resize:bg-primary/60 group-data-active/resize:bg-primary" />
        </>
      )}
    </ark.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Drop indicator                                                            */
/* -------------------------------------------------------------------------- */

function CanvasDropIndicator({ edge, gap = "0.75rem", className, style, ...props }: CanvasDropIndicatorProps) {
  const horizontal = edge === "top" || edge === "bottom"
  return (
    <ark.div
      data-slot="canvas-drop-indicator"
      data-edge={edge}
      aria-hidden
      style={{ ["--canvas-gap" as string]: gap, ...style }}
      className={cn(
        "pointer-events-none absolute z-10 rounded-full bg-primary",
        "before:absolute before:size-2 before:rounded-full before:border-2 before:border-primary before:bg-background",
        horizontal
          ? "inset-x-0 h-0.5 before:top-1/2 before:-left-1 before:-translate-y-1/2"
          : "inset-y-0 w-0.5 before:-top-1 before:left-1/2 before:-translate-x-1/2",
        edge === "top" && "top-[calc(-1*var(--canvas-gap)/2-1px)]",
        edge === "bottom" && "bottom-[calc(-1*var(--canvas-gap)/2-1px)]",
        edge === "left" && "left-[calc(-1*var(--canvas-gap)/2-1px)]",
        edge === "right" && "right-[calc(-1*var(--canvas-gap)/2-1px)]",
        className
      )}
      {...props}
    />
  )
}

type CanvasRootProps = Omit<React.ComponentProps<typeof ark.div>, "onDrop"> & {
  onDrop?: (details: CanvasDropDetails) => void
}

type CanvasAreaProps = React.ComponentProps<typeof ark.div>

type CanvasDropIndicatorProps = React.ComponentProps<typeof ark.div> & { edge: Edge; gap?: string }

type CanvasEmptyProps = React.ComponentProps<typeof ark.div>

type CanvasNodeProps = React.ComponentProps<typeof ark.div> & {
  value: string
  /** Relative width within the row (flex-grow weight). */
  width?: number
  draggable?: boolean
  selected?: boolean
}

type CanvasNodeActionsProps = React.ComponentProps<typeof ark.div>

type CanvasNodeHandleProps = React.ComponentProps<typeof ark.button>

type CanvasNodeHeaderProps = React.ComponentProps<typeof ark.div>

type CanvasNodeOverlayProps = React.ComponentProps<typeof ark.div>

type CanvasNodeTitleProps = React.ComponentProps<typeof ark.span>

type CanvasPaletteProps = React.ComponentProps<typeof ark.div>

type CanvasPaletteItemProps = React.ComponentProps<typeof ark.div> & { data: unknown }

type CanvasResizeHandleProps = Omit<React.ComponentProps<typeof ark.div>, "onResize"> & {
  /** Called while dragging with the width change as a fraction of the row width. */
  onResize: (deltaFraction: number) => void
  /** Called once when the resize drag starts. */
  onResizeStart?: () => void
  /** Called once when the resize drag ends. */
  onResizeEnd?: () => void
}

type CanvasRowProps = React.ComponentProps<typeof ark.div>

const Canvas = {
  Root: CanvasRoot,
  Area: CanvasArea,
  DropIndicator: CanvasDropIndicator,
  Empty: CanvasEmpty,
  Node: CanvasNode,
  NodeActions: CanvasNodeActions,
  NodeHandle: CanvasNodeHandle,
  NodeHeader: CanvasNodeHeader,
  NodeOverlay: CanvasNodeOverlay,
  NodeTitle: CanvasNodeTitle,
  Palette: CanvasPalette,
  PaletteItem: CanvasPaletteItem,
  ResizeHandle: CanvasResizeHandle,
  Row: CanvasRow,
}

export {
  Canvas,
  useCanvas,
  type CanvasDropDetails,
  type CanvasSource,
  type CanvasTarget,
  type CanvasRootProps,
  type CanvasAreaProps,
  type CanvasDropIndicatorProps,
  type CanvasEmptyProps,
  type CanvasNodeProps,
  type CanvasNodeActionsProps,
  type CanvasNodeHandleProps,
  type CanvasNodeHeaderProps,
  type CanvasNodeOverlayProps,
  type CanvasNodeTitleProps,
  type CanvasPaletteProps,
  type CanvasPaletteItemProps,
  type CanvasResizeHandleProps,
  type CanvasRowProps,
}

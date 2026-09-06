import * as React from "react"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { attachClosestEdge, extractClosestEdge, type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { ark } from "@ark-ui/react"
import { GripVerticalIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cloneDragPreview } from "@/lib/drag-preview"
import { cn } from "@/lib/utils"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

/**
 * Kanban — a compositional, data-agnostic board on Pragmatic drag and drop.
 * The consumer owns columns and cards and re-renders them from its own state;
 * the primitive wires dragging and reports intents through `onCardMove` and
 * `onColumnMove`. `moveCard`/`moveColumn` are optional helpers for the common
 * `{ id, cards: { id }[] }[]` shape.
 */

type KanbanCardMoveDetails = {
  cardId: string
  fromColumnId: string
  toColumnId: string
  fromIndex: number
  toIndex: number
}

type KanbanColumnMoveDetails = {
  columnId: string
  fromIndex: number
  toIndex: number
}

type DragData =
  | { instanceId: symbol; type: "card"; cardId: string; columnId: string }
  | { instanceId: symbol; type: "column"; columnId: string }

const CARD_TARGET = "kanban-card-target"
const COLUMN_TARGET = "kanban-column-target"

type KanbanDragging = { type: "card" | "column"; id: string; columnId?: string; height: number }
/** Where a dragged card would land: before `beforeCardId`, or at the end when null. */
type KanbanPreview = { columnId: string; beforeCardId: string | null }

type KanbanGrabbed = { type: "card" | "column"; id: string }

type KanbanContextValue = {
  instanceId: symbol
  dragging: KanbanDragging | null
  preview: KanbanPreview | null
  /** Keyboard "pick up" state; arrows move the grabbed card/column. */
  grabbed: KanbanGrabbed | null
  grab: (item: KanbanGrabbed | null) => void
  moveByKey: (item: KanbanGrabbed, direction: "up" | "down" | "left" | "right") => void
}

const focusLater = (selector: string) =>
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus()))

const cssEscape = (value: string) => (typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : value)

const KanbanContext = React.createContext<KanbanContextValue | null>(null)

function useKanban() {
  const ctx = React.useContext(KanbanContext)
  if (!ctx) throw new Error("Kanban parts must be used within <Kanban>")
  return ctx
}

const isOwnData = (instanceId: symbol, data: Record<string | symbol, unknown>): data is DragData =>
  data.instanceId === instanceId && (data.type === "card" || data.type === "column")

function cardsOf(columnEl: Element) {
  return Array.from(columnEl.querySelectorAll<HTMLElement>(":scope [data-slot=kanban-card]"))
}

type DropTargetLike = { data: Record<string | symbol, unknown> }

/** Resolve a card drag against the current drop targets into a concrete destination. */
function resolveCardDrop(root: HTMLElement, data: Extract<DragData, { type: "card" }>, targets: DropTargetLike[]) {
  const columnTarget = targets.find((t) => t.data[COLUMN_TARGET] === true)
  if (!columnTarget) return null
  const toColumnId = String(columnTarget.data.columnId)
  const columnEls = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=kanban-column]"))
  const fromColumnEl = columnEls.find((el) => el.dataset.value === data.columnId)
  const toColumnEl = columnEls.find((el) => el.dataset.value === toColumnId)
  if (!fromColumnEl || !toColumnEl) return null
  const fromIndex = cardsOf(fromColumnEl).findIndex((el) => el.dataset.value === data.cardId)
  const toCards = cardsOf(toColumnEl)
  const cardTarget = targets.find((t) => t.data[CARD_TARGET] === true)
  const sameColumn = data.columnId === toColumnId

  let toIndex: number
  if (cardTarget && String(cardTarget.data.cardId) !== data.cardId) {
    const indexOfTarget = toCards.findIndex((el) => el.dataset.value === String(cardTarget.data.cardId))
    const edge = extractClosestEdge(cardTarget.data)
    toIndex = sameColumn
      ? getReorderDestinationIndex({
          startIndex: fromIndex,
          indexOfTarget,
          closestEdgeOfTarget: edge,
          axis: "vertical",
        })
      : edge === "bottom"
        ? indexOfTarget + 1
        : indexOfTarget
  } else if (cardTarget) {
    // Hovering the dragged card itself: no move.
    toIndex = fromIndex
  } else {
    toIndex = sameColumn ? toCards.length - 1 : toCards.length
  }
  const noop = sameColumn && toIndex === fromIndex
  const remaining = toCards.filter((el) => el.dataset.value !== data.cardId)
  const beforeCardId = remaining[toIndex]?.dataset.value ?? null
  return { toColumnId, toIndex, fromIndex, sameColumn, noop, beforeCardId }
}

function Kanban({
  onCardMove,
  onColumnMove,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  onCardMove?: (details: KanbanCardMoveDetails) => void
  onColumnMove?: (details: KanbanColumnMoveDetails) => void
}) {
  const [instanceId] = React.useState(() => Symbol("kanban"))
  const [dragging, setDragging] = React.useState<KanbanDragging | null>(null)
  const [preview, setPreviewState] = React.useState<KanbanPreview | null>(null)
  const [grabbed, setGrabbed] = React.useState<KanbanGrabbed | null>(null)
  const { message: announcement, announce: setAnnouncement } = useLiveRegion()
  const previewKey = React.useRef<string | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)
  const callbacks = React.useRef({ onCardMove, onColumnMove })
  callbacks.current = { onCardMove, onColumnMove }

  const grab = React.useCallback((item: KanbanGrabbed | null) => {
    setGrabbed(item)
    setAnnouncement(
      item
        ? `Picked up ${item.type} ${item.id}. Use the arrow keys to move, Space or Enter to drop, Escape to cancel.`
        : "Dropped."
    )
  }, [])

  const moveByKey = React.useCallback((item: KanbanGrabbed, direction: "up" | "down" | "left" | "right") => {
    const root = ref.current
    if (!root) return
    const columnEls = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=kanban-column]"))
    const columnIds = columnEls.map((el) => el.dataset.value ?? "")
    const columnName = (el: HTMLElement) =>
      el.querySelector("[data-slot=kanban-column-title]")?.textContent ?? el.dataset.value

    if (item.type === "column") {
      const fromIndex = columnIds.indexOf(item.id)
      const toIndex = direction === "left" ? fromIndex - 1 : direction === "right" ? fromIndex + 1 : fromIndex
      if (fromIndex < 0 || toIndex === fromIndex || toIndex < 0 || toIndex >= columnIds.length) return
      callbacks.current.onColumnMove?.({ columnId: item.id, fromIndex, toIndex })
      setAnnouncement(`Moved column to position ${toIndex + 1} of ${columnIds.length}.`)
      focusLater(`[data-slot=kanban-column][data-value="${cssEscape(item.id)}"] [data-slot=kanban-column-handle]`)
      return
    }

    const fromColumnEl = columnEls.find((el) => cardsOf(el).some((c) => c.dataset.value === item.id))
    if (!fromColumnEl) return
    const fromColumnId = fromColumnEl.dataset.value ?? ""
    const fromCards = cardsOf(fromColumnEl)
    const fromIndex = fromCards.findIndex((c) => c.dataset.value === item.id)
    let toColumnId = fromColumnId
    let toIndex = fromIndex
    if (direction === "up" || direction === "down") {
      toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1
      if (toIndex < 0 || toIndex >= fromCards.length) return
    } else {
      const ci = columnIds.indexOf(fromColumnId)
      const targetEl = columnEls[direction === "left" ? ci - 1 : ci + 1]
      if (!targetEl) return
      toColumnId = targetEl.dataset.value ?? ""
      toIndex = Math.min(fromIndex, cardsOf(targetEl).length)
    }
    callbacks.current.onCardMove?.({ cardId: item.id, fromColumnId, toColumnId, fromIndex, toIndex })
    const targetEl = columnEls[columnIds.indexOf(toColumnId)]
    const count = toColumnId === fromColumnId ? fromCards.length : cardsOf(targetEl).length + 1
    setAnnouncement(`Moved to ${columnName(targetEl)}, position ${toIndex + 1} of ${count}.`)
    focusLater(`[data-slot=kanban-card][data-value="${cssEscape(item.id)}"]`)
  }, [])

  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    const setPreview = (next: KanbanPreview | null) => {
      const key = next ? `${next.columnId}::${next.beforeCardId ?? ""}` : null
      if (key === previewKey.current) return
      previewKey.current = key
      setPreviewState(next)
    }
    const updatePreview = (data: DragData, targets: DropTargetLike[]) => {
      if (data.type !== "card") return
      const resolved = resolveCardDrop(root, data, targets)
      setPreview(
        resolved && !resolved.noop ? { columnId: resolved.toColumnId, beforeCardId: resolved.beforeCardId } : null
      )
    }
    return monitorForElements({
      canMonitor: ({ source }) => isOwnData(instanceId, source.data),
      onDragStart: ({ source }) => {
        const data = source.data as DragData
        setDragging({
          type: data.type,
          id: data.type === "card" ? data.cardId : data.columnId,
          columnId: data.type === "card" ? data.columnId : undefined,
          height: source.element.getBoundingClientRect().height,
        })
      },
      onDrag: ({ source, location }) => updatePreview(source.data as DragData, location.current.dropTargets),
      onDropTargetChange: ({ source, location }) =>
        updatePreview(source.data as DragData, location.current.dropTargets),
      onDrop: ({ source, location }) => {
        setDragging(null)
        setPreview(null)
        const data = source.data as DragData
        const targets = location.current.dropTargets
        const columnEls = Array.from(root.querySelectorAll<HTMLElement>("[data-slot=kanban-column]"))
        const columnIds = columnEls.map((el) => el.dataset.value ?? "")

        if (data.type === "column") {
          const target = targets.find((t) => t.data[COLUMN_TARGET] === true)
          if (!target) return
          const targetId = String(target.data.columnId)
          const fromIndex = columnIds.indexOf(data.columnId)
          const indexOfTarget = columnIds.indexOf(targetId)
          if (fromIndex < 0 || indexOfTarget < 0) return
          const toIndex = getReorderDestinationIndex({
            startIndex: fromIndex,
            indexOfTarget,
            closestEdgeOfTarget: extractClosestEdge(target.data),
            axis: "horizontal",
          })
          if (toIndex === fromIndex) return
          callbacks.current.onColumnMove?.({ columnId: data.columnId, fromIndex, toIndex })
          return
        }

        const resolved = resolveCardDrop(root, data, targets)
        if (!resolved || resolved.noop) return
        callbacks.current.onCardMove?.({
          cardId: data.cardId,
          fromColumnId: data.columnId,
          toColumnId: resolved.toColumnId,
          fromIndex: resolved.fromIndex,
          toIndex: resolved.toIndex,
        })
      },
    })
  }, [instanceId])

  const ctx = React.useMemo(
    () => ({ instanceId, dragging, preview, grabbed, grab, moveByKey }),
    [instanceId, dragging, preview, grabbed, grab, moveByKey]
  )
  return (
    <KanbanContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="kanban"
        data-dragging={dragging ? dragging.type : undefined}
        data-grabbed={grabbed ? grabbed.type : undefined}
        className={cn("flex min-h-0 flex-1 flex-col", className)}
        {...props}
      >
        {children}
        <LiveRegion data-slot="kanban-live-region" message={announcement} />
      </div>
    </KanbanContext.Provider>
  )
}

/** Keyboard handling shared by cards and column handles. */
function useKanbanKeyboard(item: KanbanGrabbed) {
  const { grabbed, grab, moveByKey } = useKanban()
  const isGrabbed = grabbed?.type === item.type && grabbed.id === item.id
  const onKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key
    if (key === " " || key === "Enter") {
      event.preventDefault()
      grab(isGrabbed ? null : item)
      return
    }
    if (!isGrabbed) return
    if (key === "Escape") {
      event.preventDefault()
      grab(null)
      return
    }
    const direction = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[key] as
      "up" | "down" | "left" | "right" | undefined
    if (!direction) return
    event.preventDefault()
    moveByKey(item, direction)
  }
  return { isGrabbed, onKeyDown, onBlur: () => isGrabbed && grab(null) }
}

/* -------------------------------------------------------------------------- */
/*  Board                                                                     */
/* -------------------------------------------------------------------------- */

function KanbanBoard({ className, ...props }: React.ComponentProps<"div">) {
  const { instanceId } = useKanban()
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return autoScrollForElements({
      element: el,
      canScroll: ({ source }) => isOwnData(instanceId, source.data),
    })
  }, [instanceId])
  return (
    <div
      ref={ref}
      data-slot="kanban-board"
      className={cn("flex min-h-0 flex-1 items-start gap-4 overflow-x-auto p-1 pb-4", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Column                                                                    */
/* -------------------------------------------------------------------------- */

type ColumnContextValue = {
  value: string
  handleRef: React.RefObject<HTMLElement | null>
  headerRef: React.RefObject<HTMLElement | null>
  isOver: boolean
  isDragging: boolean
}

const ColumnContext = React.createContext<ColumnContextValue | null>(null)

function useKanbanColumn() {
  const ctx = React.useContext(ColumnContext)
  if (!ctx) throw new Error("Kanban column parts must be used within <KanbanColumn>")
  return ctx
}

function KanbanColumn({
  value,
  draggable: isDraggable = true,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  value: string
  /** Allow the column itself to be reordered (drag by its handle or header). */
  draggable?: boolean
}) {
  const { instanceId, dragging, preview } = useKanban()
  const ref = React.useRef<HTMLElement>(null)
  const handleRef = React.useRef<HTMLElement | null>(null)
  const headerRef = React.useRef<HTMLElement | null>(null)
  const [isOver, setIsOver] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [closestEdge, setClosestEdge] = React.useState<Edge | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const cleanups = [
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) => isOwnData(instanceId, source.data),
        getIsSticky: () => true,
        getData: ({ source, input, element }) => {
          const base = { [COLUMN_TARGET]: true, columnId: value }
          if ((source.data as DragData).type === "column") {
            return attachClosestEdge(base, { element, input, allowedEdges: ["left", "right"] })
          }
          return base
        },
        onDragEnter: ({ source, self }) => {
          const data = source.data as DragData
          if (data.type === "card") setIsOver(true)
          else if (data.columnId !== value) setClosestEdge(extractClosestEdge(self.data))
        },
        onDrag: ({ source, self }) => {
          const data = source.data as DragData
          if (data.type === "column" && data.columnId !== value) {
            const edge = extractClosestEdge(self.data)
            setClosestEdge((prev) => (prev === edge ? prev : edge))
          }
        },
        onDragLeave: () => {
          setIsOver(false)
          setClosestEdge(null)
        },
        onDrop: () => {
          setIsOver(false)
          setClosestEdge(null)
        },
      }),
    ]
    if (isDraggable) {
      cleanups.push(
        draggable({
          element: el,
          dragHandle: handleRef.current ?? headerRef.current ?? undefined,
          getInitialData: (): DragData => ({ instanceId, type: "column", columnId: value }),
          onGenerateDragPreview: (args) => cloneDragPreview(args),
          onDragStart: () => setIsDragging(true),
          onDrop: () => setIsDragging(false),
        })
      )
    }
    return combine(...cleanups)
  }, [instanceId, value, isDraggable])

  const ctx = React.useMemo(() => ({ value, handleRef, headerRef, isOver, isDragging }), [value, isOver, isDragging])
  return (
    <ColumnContext.Provider value={ctx}>
      <section
        ref={ref}
        data-slot="kanban-column"
        data-value={value}
        data-over={isOver && dragging?.type === "card" ? "" : undefined}
        data-target={preview?.columnId === value ? "" : undefined}
        data-dragging={isDragging ? "" : undefined}
        data-edge={closestEdge ?? undefined}
        className={cn(
          "group/kanban-column relative flex max-h-full w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors data-dragging:opacity-40 data-target:border-primary/30",
          className
        )}
        {...props}
      >
        {children}
        {closestEdge && <KanbanDropIndicator edge={closestEdge} />}
      </section>
    </ColumnContext.Provider>
  )
}

function KanbanColumnHeader({ className, ...props }: React.ComponentProps<"header">) {
  const { headerRef } = useKanbanColumn()
  return (
    <header
      ref={headerRef as React.RefObject<HTMLElement>}
      data-slot="kanban-column-header"
      className={cn("flex items-center gap-2 px-3 py-2.5", className)}
      {...props}
    />
  )
}

function KanbanColumnHandle({
  className,
  children,
  onKeyDown,
  onBlur,
  asChild,
  ...props
}: React.ComponentProps<typeof ark.button>) {
  const { handleRef, value } = useKanbanColumn()
  const keyboard = useKanbanKeyboard({ type: "column", id: value })
  return (
    <ark.button
      asChild={asChild}
      ref={handleRef as React.RefObject<HTMLButtonElement>}
      type="button"
      data-slot="kanban-column-handle"
      data-grabbed={keyboard.isGrabbed ? "" : undefined}
      aria-label="Drag column"
      aria-pressed={keyboard.isGrabbed}
      aria-describedby={undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (!event.defaultPrevented) keyboard.onKeyDown(event)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        keyboard.onBlur()
      }}
      className={cn(
        "-ms-1 flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing data-grabbed:bg-primary data-grabbed:text-primary-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {asChild ? children : (children ?? <GripVerticalIcon />)}
    </ark.button>
  )
}

function KanbanColumnTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="kanban-column-title" className={cn("truncate text-sm font-semibold", className)} {...props} />
}

function KanbanColumnCount({ className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      data-slot="kanban-column-count"
      variant="secondary"
      className={cn("h-5 min-w-5 justify-center px-1.5 tabular-nums", className)}
      {...props}
    />
  )
}

function KanbanColumnActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="kanban-column-actions" className={cn("ms-auto flex items-center gap-1", className)} {...props} />
  )
}

/** The scrolling list of cards. Renders the landing slot at the end when a card would be appended. */
function KanbanColumnContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { instanceId, dragging, preview } = useKanban()
  const column = useKanbanColumn()
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    return autoScrollForElements({
      element: el,
      canScroll: ({ source }) => isOwnData(instanceId, source.data),
    })
  }, [instanceId])
  return (
    <div
      ref={ref}
      data-slot="kanban-column-content"
      className={cn(
        "no-scrollbar flex min-h-16 flex-1 flex-col gap-(--kanban-gap) overflow-y-auto px-2 pb-2 [--kanban-gap:0.5rem]",
        className
      )}
      {...props}
    >
      {children}
      {dragging?.type === "card" && preview?.columnId === column.value && preview.beforeCardId === null && (
        <KanbanDropSlot height={dragging.height} />
      )}
    </div>
  )
}

function KanbanColumnFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer data-slot="kanban-column-footer" className={cn("flex items-center px-2 pb-2", className)} {...props} />
}

/** A ghost-style full-width trigger for the footer, e.g. "Add card". Polymorphic via `asChild`. */
function KanbanAddTrigger({
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="kanban-add-trigger"
      variant={variant}
      size={size}
      className={cn("w-full justify-start text-muted-foreground hover:text-foreground", className)}
      {...props}
    />
  )
}

function KanbanEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kanban-empty"
      className={cn(
        "flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

type CardContextValue = { handleRef: React.RefObject<HTMLElement | null>; value: string }
const CardContext = React.createContext<CardContextValue | null>(null)

function KanbanCard({
  value,
  draggable: isDraggable = true,
  className,
  children,
  onKeyDown,
  onBlur,
  ...props
}: React.ComponentProps<"article"> & { value: string; draggable?: boolean }) {
  const { instanceId, dragging, preview } = useKanban()
  const column = useKanbanColumn()
  const keyboard = useKanbanKeyboard({ type: "card", id: value })
  const ref = React.useRef<HTMLElement>(null)
  const handleRef = React.useRef<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const isSlotBefore = dragging?.type === "card" && preview?.columnId === column.value && preview.beforeCardId === value
  // The dragged card stays as an outlined placeholder until a landing spot exists, then collapses.
  const isCollapsed = isDragging && preview !== null

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const cleanups = [
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) => isOwnData(instanceId, source.data) && (source.data as DragData).type === "card",
        getIsSticky: () => true,
        getData: ({ input, element }) =>
          attachClosestEdge(
            { [CARD_TARGET]: true, cardId: value, columnId: column.value },
            {
              element,
              input,
              allowedEdges: ["top", "bottom"],
            }
          ),
      }),
    ]
    if (isDraggable) {
      cleanups.push(
        draggable({
          element: el,
          dragHandle: handleRef.current ?? undefined,
          getInitialData: (): DragData => ({ instanceId, type: "card", cardId: value, columnId: column.value }),
          onGenerateDragPreview: (args) => cloneDragPreview(args),
          onDragStart: () => setIsDragging(true),
          onDrop: () => setIsDragging(false),
        })
      )
    }
    return combine(...cleanups)
  }, [instanceId, value, column.value, isDraggable])

  const ctx = React.useMemo(() => ({ handleRef, value }), [value])
  return (
    <CardContext.Provider value={ctx}>
      {isSlotBefore && dragging && <KanbanDropSlot height={dragging.height} />}
      <article
        ref={ref}
        data-slot="kanban-card"
        data-value={value}
        data-dragging={isDragging ? "" : undefined}
        data-collapsed={isCollapsed ? "" : undefined}
        data-grabbed={keyboard.isGrabbed ? "" : undefined}
        tabIndex={isDraggable ? 0 : undefined}
        aria-roledescription={isDraggable ? "draggable card" : undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (!event.defaultPrevented && event.target === event.currentTarget) keyboard.onKeyDown(event)
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (event.target === event.currentTarget) keyboard.onBlur()
        }}
        className={cn(
          "group/kanban-card relative flex cursor-grab flex-col gap-2 rounded-lg border bg-card p-3 text-sm text-card-foreground shadow-xs transition-shadow outline-none hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing data-grabbed:border-primary data-grabbed:ring-3 data-grabbed:ring-primary/30",
          "data-dragging:border-dashed data-dragging:border-primary/40 data-dragging:bg-primary/5 data-dragging:shadow-none data-dragging:*:invisible",
          // Collapse (not `display:none`): removing the dragged element from layout cancels a native drag in Chrome.
          "data-collapsed:pointer-events-none data-collapsed:-mb-(--kanban-gap) data-collapsed:h-0 data-collapsed:min-h-0 data-collapsed:overflow-hidden data-collapsed:border-0 data-collapsed:p-0 data-collapsed:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </article>
    </CardContext.Provider>
  )
}

/** Optional explicit drag handle; without it the whole card is the handle. */
function KanbanCardHandle({
  className,
  children,
  onKeyDown,
  onBlur,
  asChild,
  ...props
}: React.ComponentProps<typeof ark.button>) {
  const ctx = React.useContext(CardContext)
  const keyboard = useKanbanKeyboard({ type: "card", id: ctx?.value ?? "" })
  return (
    <ark.button
      asChild={asChild}
      ref={(el: HTMLElement | null) => {
        if (ctx) ctx.handleRef.current = el
      }}
      type="button"
      data-slot="kanban-card-handle"
      data-grabbed={keyboard.isGrabbed ? "" : undefined}
      aria-label="Drag card"
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

function KanbanCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kanban-card-header"
      className={cn("flex items-start justify-between gap-2", className)}
      {...props}
    />
  )
}

function KanbanCardTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="kanban-card-title" className={cn("leading-snug font-medium", className)} {...props} />
}

function KanbanCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="kanban-card-description"
      className={cn("line-clamp-3 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function KanbanCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kanban-card-footer"
      className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Drop slot + indicator                                                     */
/* -------------------------------------------------------------------------- */

/** An outlined placeholder the size of the dragged card, marking where it will land. */
function KanbanDropSlot({ height, className, style, ...props }: React.ComponentProps<"div"> & { height?: number }) {
  return (
    <div
      data-slot="kanban-drop-slot"
      aria-hidden
      style={{ height, ...style }}
      className={cn(
        "shrink-0 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5",
        height === undefined && "min-h-16",
        className
      )}
      {...props}
    />
  )
}

/** A line on the given edge of its (relative) parent, with a terminal dot. */
function KanbanDropIndicator({
  edge,
  gap = "0.5rem",
  className,
  ...props
}: React.ComponentProps<"div"> & { edge: Edge; gap?: string }) {
  const horizontal = edge === "top" || edge === "bottom"
  return (
    <div
      data-slot="kanban-drop-indicator"
      data-edge={edge}
      aria-hidden
      style={{ ["--kanban-gap" as string]: gap }}
      className={cn(
        "pointer-events-none absolute z-10 bg-primary",
        "before:absolute before:size-2 before:rounded-full before:border-2 before:border-primary before:bg-background",
        horizontal
          ? "inset-x-0 h-0.5 before:top-1/2 before:-left-1 before:-translate-y-1/2"
          : "inset-y-0 w-0.5 before:-top-1 before:left-1/2 before:-translate-x-1/2",
        edge === "top" && "top-[calc(-1*var(--kanban-gap)/2-1px)]",
        edge === "bottom" && "bottom-[calc(-1*var(--kanban-gap)/2-1px)]",
        edge === "left" && "left-[calc(-1*var(--kanban-gap)/2-1px)]",
        edge === "right" && "right-[calc(-1*var(--kanban-gap)/2-1px)]",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type KanbanColumnLike<TCard extends { id: string }> = { id: string; cards: TCard[] }

/** Apply an `onCardMove` intent to a `{ id, cards }[]` state shape. */
function moveCard<TCard extends { id: string }, TColumn extends KanbanColumnLike<TCard>>(
  columns: TColumn[],
  { cardId, fromColumnId, toColumnId, toIndex }: KanbanCardMoveDetails
): TColumn[] {
  const from = columns.find((c) => c.id === fromColumnId)
  const card = from?.cards.find((c) => c.id === cardId)
  if (!from || !card) return columns
  return columns.map((column) => {
    if (column.id === fromColumnId && column.id === toColumnId) {
      const startIndex = column.cards.indexOf(card)
      return { ...column, cards: reorder({ list: column.cards, startIndex, finishIndex: toIndex }) }
    }
    if (column.id === fromColumnId) return { ...column, cards: column.cards.filter((c) => c !== card) }
    if (column.id === toColumnId) {
      const cards = [...column.cards]
      cards.splice(toIndex, 0, card)
      return { ...column, cards }
    }
    return column
  })
}

/** Apply an `onColumnMove` intent to a column array. */
function moveColumn<TColumn extends { id: string }>(
  columns: TColumn[],
  { fromIndex, toIndex }: KanbanColumnMoveDetails
): TColumn[] {
  return reorder({ list: columns, startIndex: fromIndex, finishIndex: toIndex })
}

export {
  Kanban,
  KanbanAddTrigger,
  KanbanBoard,
  KanbanCard,
  KanbanCardDescription,
  KanbanCardFooter,
  KanbanCardHandle,
  KanbanCardHeader,
  KanbanCardTitle,
  KanbanColumn,
  KanbanColumnActions,
  KanbanColumnContent,
  KanbanColumnCount,
  KanbanColumnFooter,
  KanbanColumnHandle,
  KanbanColumnHeader,
  KanbanColumnTitle,
  KanbanDropIndicator,
  KanbanDropSlot,
  KanbanEmpty,
  moveCard,
  moveColumn,
  useKanban,
  useKanbanColumn,
  type KanbanCardMoveDetails,
  type KanbanColumnMoveDetails,
}

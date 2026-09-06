import * as React from "react"
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { CalendarIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

/**
 * Gantt — a compositional, data-agnostic timeline. The consumer owns rows,
 * bars and dependencies and renders them with the parts; the root owns only
 * the time scale (`start`/`end`, `dayWidth`, header `scale`), the drag/resize
 * interaction and keyboard moves, and reports `onBarChange({ id, start, end })`.
 * Dates snap to whole days.
 *
 * Anatomy:
 *   Gantt { start, end, dayWidth, scale, onBarChange }
 *     GanttControls > GanttZoomOutTrigger / GanttZoomInTrigger / GanttTodayTrigger
 *     GanttViewport                    single scroll container (x and y)
 *       GanttHeader                    sticky two-tier date header (+ GanttHeaderCorner over the sidebar)
 *       GanttBody
 *         GanttRow value=…             sidebar cell (GanttRowLabel, sticky) + track
 *           GanttBar value=… start end progress  > GanttBarLabel, GanttBarResizeHandle side=…
 *           GanttMilestone value=… date
 *         GanttDependencies            svg arrows between registered bars
 *         GanttToday                   vertical marker
 *     GanttEmpty
 *
 * Keyboard on a bar: Space/Enter picks up, ←/→ move a day, Shift+←/→ change
 * the end, Alt+←/→ change the start, Space/Enter drops, Escape cancels.
 */

type GanttScale = "day" | "week" | "month"
type GanttBarChange = { id: string; start: Date; end: Date }
type BarRegistration = { id: string; el: HTMLElement | null; start: Date; end: Date; milestone?: boolean }

/** Registered bars, outside React state so registering never re-renders the root. */
function createBarStore() {
  const bars = new Map<string, BarRegistration>()
  const listeners = new Set<() => void>()
  let version = 0
  const notify = () => {
    version++
    listeners.forEach((l) => l())
  }
  return {
    bars,
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    getVersion: () => version,
    register(bar: BarRegistration) {
      bars.set(bar.id, bar)
      notify()
      return () => {
        if (bars.get(bar.id) === bar) bars.delete(bar.id)
        notify()
      }
    },
  }
}
type BarStore = ReturnType<typeof createBarStore>

type Interaction = {
  id: string
  type: "move" | "resize-start" | "resize-end"
  start: Date
  end: Date
}

type GanttContextValue = {
  start: Date
  end: Date
  days: number
  dayWidth: number
  rowHeight: number
  sidebarWidth: number
  scale: GanttScale
  editable: boolean
  interaction: Interaction | null
  grabbed: string | null
  viewportRef: React.RefObject<HTMLDivElement | null>
  xOf: (date: Date) => number
  dateAt: (x: number) => Date
  registerBar: (bar: BarRegistration) => () => void
  barStore: BarStore
  startInteraction: (bar: BarRegistration, type: Interaction["type"], event: React.PointerEvent) => void
  grab: (id: string | null) => void
  cancelGrab: () => void
  nudge: (bar: BarRegistration, deltaDays: number, part: "both" | "start" | "end") => void
  zoomIn: () => void
  zoomOut: () => void
  scrollToDate: (date: Date, options?: { behavior?: ScrollBehavior }) => void
  announce: (message: string) => void
}

const GanttContext = React.createContext<GanttContextValue | null>(null)
const RowContext = React.createContext<{ value: string } | null>(null)

function useGantt() {
  const ctx = React.useContext(GanttContext)
  if (!ctx) throw new Error("Gantt parts must be used within <Gantt>")
  return ctx
}
function useGanttRow() {
  const ctx = React.useContext(RowContext)
  if (!ctx) throw new Error("Row parts must be used within <GanttRow>")
  return ctx
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

function Gantt({
  start: startProp,
  end: endProp,
  dayWidth: dayWidthProp,
  defaultDayWidth = 40,
  onDayWidthChange,
  minDayWidth = 8,
  maxDayWidth = 160,
  scale: scaleProp,
  rowHeight = 40,
  sidebarWidth = 240,
  editable = true,
  onBarChange,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  start: Date
  end: Date
  /** Pixels per day; controllable. Zooming changes it. */
  dayWidth?: number
  defaultDayWidth?: number
  onDayWidthChange?: (dayWidth: number) => void
  minDayWidth?: number
  maxDayWidth?: number
  /** Header tiers. Defaults from `dayWidth`: month below 16px, week below 32px, else day. */
  scale?: GanttScale
  rowHeight?: number
  sidebarWidth?: number
  editable?: boolean
  onBarChange?: (change: GanttBarChange) => void
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const start = React.useMemo(() => startOfDay(startProp), [startProp])
  const end = React.useMemo(() => startOfDay(endProp), [endProp])
  const days = Math.max(1, differenceInCalendarDays(end, start) + 1)

  const [dayWidth, setDayWidthState] = useControllable(dayWidthProp, defaultDayWidth, onDayWidthChange)
  const setDayWidth = React.useCallback(
    (next: number) => setDayWidthState(clamp(next, minDayWidth, maxDayWidth)),
    [setDayWidthState, minDayWidth, maxDayWidth]
  )
  const scale: GanttScale = scaleProp ?? (dayWidth < 16 ? "month" : dayWidth < 32 ? "week" : "day")

  const xOf = React.useCallback(
    (date: Date) => differenceInCalendarDays(startOfDay(date), start) * dayWidth,
    [start, dayWidth]
  )
  const dateAt = React.useCallback((x: number) => addDays(start, Math.round(x / dayWidth)), [start, dayWidth])

  /* Bar registry for dependency lines */
  const barStore = React.useMemo(() => createBarStore(), [])
  const registerBar = React.useCallback((bar: BarRegistration) => barStore.register(bar), [barStore])

  /* Interaction */
  const [interaction, setInteraction] = React.useState<Interaction | null>(null)
  const [grabbed, setGrabbed] = React.useState<string | null>(null)
  const { message: announcement, announce } = useLiveRegion()
  const onBarChangeRef = React.useRef(onBarChange)
  React.useEffect(() => {
    onBarChangeRef.current = onBarChange
  }, [onBarChange])
  const grabOrigin = React.useRef<{ id: string; start: Date; end: Date } | null>(null)

  const startInteraction = React.useCallback(
    (bar: BarRegistration, type: Interaction["type"], event: React.PointerEvent) => {
      if (!editable) return
      event.preventDefault()
      event.stopPropagation()
      const origin = event.clientX
      let current: Interaction = { id: bar.id, type, start: bar.start, end: bar.end }
      setInteraction(current)
      const move = (e: PointerEvent) => {
        const deltaDays = Math.round((e.clientX - origin) / dayWidth)
        const duration = differenceInCalendarDays(bar.end, bar.start)
        if (type === "move") {
          current = { id: bar.id, type, start: addDays(bar.start, deltaDays), end: addDays(bar.end, deltaDays) }
        } else if (type === "resize-end") {
          current = { id: bar.id, type, start: bar.start, end: addDays(bar.end, Math.max(deltaDays, -duration)) }
        } else {
          current = { id: bar.id, type, start: addDays(bar.start, Math.min(deltaDays, duration)), end: bar.end }
        }
        setInteraction(current)
      }
      const up = () => {
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
        window.removeEventListener("pointercancel", up)
        setInteraction(null)
        if (!isSameDay(current.start, bar.start) || !isSameDay(current.end, bar.end)) {
          onBarChangeRef.current?.({ id: bar.id, start: current.start, end: current.end })
        }
      }
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", up)
      window.addEventListener("pointercancel", up)
    },
    [editable, dayWidth]
  )

  const grab = React.useCallback(
    (id: string | null) => {
      if (id) {
        const bar = barStore.bars.get(id)
        grabOrigin.current = bar ? { id, start: bar.start, end: bar.end } : null
        setGrabbed(id)
        announce(
          "Picked up. Arrow keys move by a day, Shift changes the end, Alt the start. Space drops, Escape cancels."
        )
      } else {
        setGrabbed(null)
        grabOrigin.current = null
        announce("Dropped.")
      }
    },
    [barStore, announce]
  )
  const cancelGrab = React.useCallback(() => {
    const origin = grabOrigin.current
    if (origin) onBarChangeRef.current?.(origin)
    setGrabbed(null)
    grabOrigin.current = null
    announce("Cancelled.")
  }, [announce])

  const nudge = React.useCallback(
    (bar: BarRegistration, deltaDays: number, part: "both" | "start" | "end") => {
      const duration = differenceInCalendarDays(bar.end, bar.start)
      const next =
        part === "both"
          ? { start: addDays(bar.start, deltaDays), end: addDays(bar.end, deltaDays) }
          : part === "end"
            ? { start: bar.start, end: addDays(bar.end, Math.max(deltaDays, -duration)) }
            : { start: addDays(bar.start, Math.min(deltaDays, duration)), end: bar.end }
      onBarChangeRef.current?.({ id: bar.id, ...next })
      announce(`${format(next.start, "MMM d")} to ${format(next.end, "MMM d")}.`)
    },
    [announce]
  )

  const scrollToDate = React.useCallback(
    (date: Date, options?: { behavior?: ScrollBehavior }) => {
      const el = viewportRef.current
      if (!el) return
      const x = xOf(date)
      el.scrollTo({
        left: Math.max(0, x - (el.clientWidth - sidebarWidth) / 2),
        behavior: options?.behavior ?? "smooth",
      })
    },
    [xOf, sidebarWidth]
  )

  /** Zoom keeping the date at the viewport centre in place. */
  const zoomBy = React.useCallback(
    (factor: number) => {
      const el = viewportRef.current
      const centreX = el ? el.scrollLeft + (el.clientWidth - sidebarWidth) / 2 : 0
      const centreDays = centreX / dayWidth
      const next = clamp(dayWidth * factor, minDayWidth, maxDayWidth)
      setDayWidth(next)
      requestAnimationFrame(() => {
        if (el) el.scrollLeft = Math.max(0, centreDays * next - (el.clientWidth - sidebarWidth) / 2)
      })
    },
    [dayWidth, minDayWidth, maxDayWidth, setDayWidth, sidebarWidth]
  )
  const zoomIn = React.useCallback(() => zoomBy(1.5), [zoomBy])
  const zoomOut = React.useCallback(() => zoomBy(1 / 1.5), [zoomBy])

  const ctx = React.useMemo<GanttContextValue>(
    () => ({
      start,
      end,
      days,
      dayWidth,
      rowHeight,
      sidebarWidth,
      scale,
      editable,
      interaction,
      grabbed,
      viewportRef,
      xOf,
      dateAt,
      registerBar,
      barStore,
      startInteraction,
      grab,
      cancelGrab,
      nudge,
      zoomIn,
      zoomOut,
      scrollToDate,
      announce,
    }),
    [
      start,
      end,
      days,
      dayWidth,
      rowHeight,
      sidebarWidth,
      scale,
      editable,
      interaction,
      grabbed,
      xOf,
      dateAt,
      registerBar,
      barStore,
      startInteraction,
      grab,
      cancelGrab,
      nudge,
      zoomIn,
      zoomOut,
      scrollToDate,
      announce,
    ]
  )

  return (
    <GanttContext.Provider value={ctx}>
      <div
        data-slot="gantt"
        data-scale={scale}
        data-editable={editable ? "" : undefined}
        data-interacting={interaction?.type}
        className={cn("relative flex min-h-0 flex-1 flex-col", className)}
        style={{ ["--gantt-sidebar" as string]: `${sidebarWidth}px`, ["--gantt-row" as string]: `${rowHeight}px` }}
        {...props}
      >
        {children}
        <LiveRegion data-slot="gantt-live-region" message={announcement} />
      </div>
    </GanttContext.Provider>
  )
}

/* ---------------------------------------------------------------------------
 * Viewport, header, body
 * ------------------------------------------------------------------------- */

function GanttViewport({ className, ...props }: React.ComponentProps<"div">) {
  const { viewportRef } = useGantt()
  return (
    <div
      ref={viewportRef}
      data-slot="gantt-viewport"
      className={cn("relative min-h-0 flex-1 overflow-auto rounded-xl border bg-background text-sm", className)}
      {...props}
    />
  )
}

/** Two-tier sticky header; the tiers depend on the scale. */
function GanttHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { start, end, days, dayWidth, scale, sidebarWidth } = useGantt()
  const width = days * dayWidth
  const tiers = React.useMemo(() => {
    const clampX = (date: Date) => clamp(differenceInCalendarDays(date, start), 0, days)
    const span = (from: Date, to: Date) => ({
      left: clampX(from) * dayWidth,
      width: (clampX(addDays(to, 1)) - clampX(from)) * dayWidth,
    })
    const months = eachMonthOfInterval({ start, end }).map((m) => ({
      key: m.toISOString(),
      label: format(m, scale === "month" ? "MMMM yyyy" : "MMM yyyy"),
      ...span(startOfMonth(m), endOfMonth(m)),
    }))
    if (scale === "day") {
      const dayCells = eachDayOfInterval({ start, end }).map((d) => ({
        key: d.toISOString(),
        label: dayWidth >= 40 ? format(d, "EEEEE d") : format(d, "d"),
        weekend: isWeekend(d),
        today: isSameDay(d, new Date()),
        ...span(d, d),
      }))
      return { top: months, bottom: dayCells }
    }
    if (scale === "week") {
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((w) => ({
        key: w.toISOString(),
        label: format(w, "d MMM"),
        weekend: false,
        today: false,
        ...span(startOfWeek(w, { weekStartsOn: 1 }), endOfWeek(w, { weekStartsOn: 1 })),
      }))
      return { top: months, bottom: weeks }
    }
    const years = Array.from(new Set(months.map((m) => m.label.slice(-4)))).map((y) => {
      const first = new Date(Number(y), 0, 1)
      const last = new Date(Number(y), 11, 31)
      return { key: y, label: y, ...span(first, last) }
    })
    return {
      top: years,
      bottom: months.map((m) => ({ ...m, label: format(new Date(m.key), "MMM"), weekend: false, today: false })),
    }
  }, [start, end, days, dayWidth, scale])

  return (
    <div
      data-slot="gantt-header"
      className={cn("sticky top-0 z-30 flex bg-muted text-xs text-muted-foreground", className)}
      style={{ width: sidebarWidth + width }}
      {...props}
    >
      <GanttHeaderCorner />
      <div className="relative shrink-0" style={{ width }}>
        <div className="flex h-7 border-b">
          {tiers.top.map((cell) => (
            <div
              key={cell.key}
              className="absolute inset-y-0 flex items-center truncate border-e px-2 font-medium"
              style={{ left: cell.left, width: cell.width }}
            >
              {cell.label}
            </div>
          ))}
        </div>
        <div className="flex h-7 border-b">
          {tiers.bottom.map((cell) => (
            <div
              key={cell.key}
              data-weekend={cell.weekend ? "" : undefined}
              data-today={cell.today ? "" : undefined}
              className="absolute flex h-7 items-center justify-center truncate border-e data-today:font-semibold data-today:text-foreground data-weekend:bg-foreground/3"
              style={{ left: cell.left, width: cell.width, top: 28 }}
            >
              {cell.width >= 18 ? cell.label : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The sticky cell above the sidebar; put a title or a search box in it. */
function GanttHeaderCorner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gantt-header-corner"
      className={cn(
        "sticky left-0 z-40 flex h-14 shrink-0 items-end border-e border-b bg-muted px-3 pb-2 font-medium",
        className
      )}
      style={{ width: "var(--gantt-sidebar)" }}
      {...props}
    />
  )
}

function GanttBody({ className, style, ...props }: React.ComponentProps<"div">) {
  const { days, dayWidth, sidebarWidth } = useGantt()
  return (
    <div
      data-slot="gantt-body"
      className={cn("relative", className)}
      style={{ width: sidebarWidth + days * dayWidth, ...style }}
      {...props}
    />
  )
}

/** Vertical day/week lines and weekend shading behind the bars. */
function GanttGridLines({ className, ...props }: React.ComponentProps<"div">) {
  const { start, end, dayWidth, scale, sidebarWidth } = useGantt()
  const cells = React.useMemo(() => {
    if (scale === "month")
      return eachMonthOfInterval({ start, end }).map((d) => ({ date: startOfMonth(d), weekend: false }))
    if (scale === "week")
      return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((d) => ({ date: d, weekend: false }))
    return eachDayOfInterval({ start, end }).map((d) => ({ date: d, weekend: isWeekend(d) }))
  }, [start, end, scale])
  return (
    <div
      data-slot="gantt-grid-lines"
      aria-hidden
      className={cn("pointer-events-none absolute inset-y-0", className)}
      style={{ left: sidebarWidth, right: 0 }}
      {...props}
    >
      {cells.map((cell) => (
        <div
          key={cell.date.toISOString()}
          data-weekend={cell.weekend ? "" : undefined}
          className="absolute inset-y-0 border-e border-border/60 data-weekend:bg-foreground/2.5"
          style={{
            left: differenceInCalendarDays(cell.date, start) * dayWidth,
            width: scale === "day" ? dayWidth : undefined,
          }}
        />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Rows
 * ------------------------------------------------------------------------- */

/** Groups the rows; keep bars inside so dependency lines can find them. */
function GanttRows({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="gantt-rows" className={cn("relative", className)} {...props} />
}

function GanttRow({ value, className, children, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const { rowHeight } = useGantt()
  const ctx = React.useMemo(() => ({ value }), [value])
  return (
    <RowContext.Provider value={ctx}>
      <div
        data-slot="gantt-row"
        data-value={value}
        className={cn("group/row flex border-b hover:bg-muted/30", className)}
        style={{ height: rowHeight }}
        {...props}
      >
        {children}
      </div>
    </RowContext.Provider>
  )
}

/** Sticky sidebar cell for the row. */
function GanttRowLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gantt-row-label"
      className={cn(
        "sticky left-0 z-20 flex shrink-0 items-center gap-2 border-e bg-background px-3 text-sm transition-colors",
        "group-hover/row:bg-[color-mix(in_oklab,var(--color-muted)_30%,var(--color-background))]",
        className
      )}
      style={{ width: "var(--gantt-sidebar)" }}
      {...props}
    />
  )
}

/** The timeline part of a row; bars are positioned inside it. */
function GanttRowTrack({ className, ...props }: React.ComponentProps<"div">) {
  const { days, dayWidth } = useGantt()
  return (
    <div
      data-slot="gantt-row-track"
      className={cn("relative shrink-0", className)}
      style={{ width: days * dayWidth }}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Bars
 * ------------------------------------------------------------------------- */

const BarContext = React.createContext<BarRegistration | null>(null)

function GanttBar({
  value,
  start,
  end,
  progress,
  className,
  style,
  children,
  onPointerDown,
  onKeyDown,
  onBlur,
  ...props
}: React.ComponentProps<"div"> & { value: string; start: Date; end: Date; progress?: number }) {
  const gantt = useGantt()
  useGanttRow()
  const ref = React.useRef<HTMLDivElement>(null)
  const live = gantt.interaction?.id === value ? gantt.interaction : null
  // Key on timestamps: callers often pass fresh Date objects every render.
  const startMs = (live ? live.start : startOfDay(start)).getTime()
  const endMs = (live ? live.end : startOfDay(end)).getTime()
  const registration = React.useMemo<BarRegistration>(
    () => ({ id: value, el: null, start: new Date(startMs), end: new Date(endMs) }),
    [value, startMs, endMs]
  )
  const shownStart = registration.start
  const shownEnd = registration.end
  const { registerBar } = gantt
  React.useLayoutEffect(() => registerBar({ ...registration, el: ref.current }), [registerBar, registration])
  const left = gantt.xOf(shownStart)
  const width = Math.max(gantt.dayWidth, (differenceInCalendarDays(shownEnd, shownStart) + 1) * gantt.dayWidth)
  const isGrabbed = gantt.grabbed === value

  return (
    <BarContext.Provider value={registration}>
      <div
        ref={ref}
        data-slot="gantt-bar"
        data-value={value}
        data-dragging={live ? live.type : undefined}
        data-grabbed={isGrabbed ? "" : undefined}
        tabIndex={gantt.editable ? 0 : undefined}
        aria-pressed={gantt.editable ? isGrabbed : undefined}
        aria-label={`${format(shownStart, "MMM d")} to ${format(shownEnd, "MMM d")}`}
        className={cn(
          "group/bar absolute top-1/2 z-10 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-md border border-primary/30 bg-primary/15 text-xs text-foreground outline-none select-none",
          gantt.editable && "cursor-grab active:cursor-grabbing",
          "focus-visible:ring-2 focus-visible:ring-ring/50 data-dragging:z-20 data-dragging:shadow-md data-grabbed:ring-2 data-grabbed:ring-primary",
          className
        )}
        style={{ left, width, ...style }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest("[data-slot=gantt-bar-resize-handle], button, a, input")) return
          gantt.startInteraction(registration, "move", event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || !gantt.editable || event.target !== event.currentTarget) return
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault()
            gantt.grab(isGrabbed ? null : value)
            return
          }
          if (!isGrabbed) return
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            const delta = event.key === "ArrowLeft" ? -1 : 1
            gantt.nudge(registration, delta, event.shiftKey ? "end" : event.altKey ? "start" : "both")
          } else if (event.key === "Escape") {
            event.preventDefault()
            gantt.cancelGrab()
          }
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (isGrabbed && !event.currentTarget.contains(event.relatedTarget as Node | null)) gantt.grab(null)
        }}
        {...props}
      >
        {progress !== undefined && (
          <div
            data-slot="gantt-bar-progress"
            aria-hidden
            className="absolute inset-y-0 left-0 bg-primary/30"
            style={{ width: `${clamp(progress, 0, 1) * 100}%` }}
          />
        )}
        {children}
      </div>
    </BarContext.Provider>
  )
}

function GanttBarLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="gantt-bar-label" className={cn("relative z-10 truncate px-2 font-medium", className)} {...props} />
  )
}

function GanttBarResizeHandle({
  side,
  className,
  onPointerDown,
  ...props
}: React.ComponentProps<"div"> & { side: "start" | "end" }) {
  const gantt = useGantt()
  const bar = React.useContext(BarContext)
  if (!gantt.editable || !bar) return null
  return (
    <div
      data-slot="gantt-bar-resize-handle"
      data-side={side}
      role="separator"
      aria-orientation="vertical"
      className={cn(
        "absolute inset-y-0 z-10 w-2 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100",
        side === "start" ? "left-0 rounded-l-md" : "right-0 rounded-r-md",
        "after:absolute after:inset-y-1.5 after:w-0.5 after:rounded-full after:bg-primary/60",
        side === "start" ? "after:left-0.5" : "after:right-0.5",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        gantt.startInteraction(bar, side === "start" ? "resize-start" : "resize-end", event)
      }}
      {...props}
    />
  )
}

/** A single-day marker rendered as a diamond. */
function GanttMilestone({
  value,
  date,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string; date: Date }) {
  const gantt = useGantt()
  useGanttRow()
  const ref = React.useRef<HTMLDivElement>(null)
  const dayMs = startOfDay(date).getTime()
  const registration = React.useMemo<BarRegistration>(
    () => ({ id: value, el: null, start: new Date(dayMs), end: new Date(dayMs), milestone: true }),
    [value, dayMs]
  )
  const day = registration.start
  const { registerBar } = gantt
  React.useLayoutEffect(() => registerBar({ ...registration, el: ref.current }), [registerBar, registration])
  return (
    <div
      ref={ref}
      data-slot="gantt-milestone"
      data-value={value}
      aria-label={format(day, "MMM d")}
      className={cn("absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-2", className)}
      style={{ left: gantt.xOf(day) + gantt.dayWidth / 2 - 8, ...style }}
      {...props}
    >
      <span aria-hidden className="block size-4 rotate-45 rounded-sm bg-foreground" />
      {children && <span className="text-xs font-medium whitespace-nowrap">{children}</span>}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Dependencies, today, empty
 * ------------------------------------------------------------------------- */

/** Arrows from the end of `from` to the start of `to`, measured from the registered bar elements. */
function GanttDependencies({
  links,
  className,
  ...props
}: React.ComponentProps<"svg"> & { links: { from: string; to: string }[] }) {
  const { barStore, dayWidth, xOf, sidebarWidth, rowHeight, days } = useGantt()
  React.useSyncExternalStore(barStore.subscribe, barStore.getVersion, barStore.getVersion)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const id = React.useId()
  // Row centres come from the DOM so collapsed groups and custom row order need no bookkeeping.
  const origin = svgRef.current?.getBoundingClientRect()
  const centreY = (el: HTMLElement | null) => {
    if (!el || !origin) return null
    const r = el.getBoundingClientRect()
    return r.top + r.height / 2 - origin.top
  }
  const paths = links
    .map((link) => {
      const from = barStore.bars.get(link.from)
      const to = barStore.bars.get(link.to)
      if (!from || !to) return null
      const y1 = centreY(from.el)
      const y2 = centreY(to.el)
      if (y1 === null || y2 === null) return null
      const x1 = xOf(from.end) + (from.milestone ? dayWidth / 2 + 8 : dayWidth)
      const x2 = xOf(to.start) + (to.milestone ? dayWidth / 2 - 8 : 0)
      const gap = 10
      const d =
        x2 - gap > x1
          ? `M ${x1} ${y1} H ${x1 + gap} V ${y2} H ${x2}`
          : `M ${x1} ${y1} H ${x1 + gap} V ${y1 + rowHeight / 2 - 4} H ${x2 - gap} V ${y2} H ${x2}`
      return { key: `${link.from}->${link.to}`, d }
    })
    .filter((p): p is { key: string; d: string } => !!p)
  return (
    <svg
      ref={svgRef}
      data-slot="gantt-dependencies"
      aria-hidden
      className={cn("pointer-events-none absolute top-0 z-5 overflow-hidden text-muted-foreground", className)}
      style={{ left: sidebarWidth, width: days * dayWidth, height: "100%" }}
      {...props}
    >
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill="currentColor" />
        </marker>
      </defs>
      {paths.map((p) => (
        <path key={p.key} d={p.d} fill="none" stroke="currentColor" strokeWidth={1.5} markerEnd={`url(#${id}-arrow)`} />
      ))}
    </svg>
  )
}

function GanttToday({ className, date = new Date(), ...props }: React.ComponentProps<"div"> & { date?: Date }) {
  const { xOf, dayWidth, sidebarWidth, start, end } = useGantt()
  const day = startOfDay(date)
  if (day < start || day > end) return null
  return (
    <div
      data-slot="gantt-today"
      aria-hidden
      className={cn("pointer-events-none absolute inset-y-0 w-px bg-destructive", className)}
      style={{ left: sidebarWidth + xOf(day) + dayWidth / 2 }}
      {...props}
    >
      <span className="absolute top-0 left-1 rounded-b bg-destructive px-1 text-[10px]/4 text-white">Today</span>
    </div>
  )
}

function GanttEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gantt-empty"
      className={cn("flex h-32 items-center justify-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Controls
 * ------------------------------------------------------------------------- */

function GanttControls({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="gantt-controls" className={cn("flex items-center gap-1", className)} {...props} />
}

function GanttZoomInTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { zoomIn } = useGantt()
  return (
    <Button
      data-slot="gantt-zoom-in-trigger"
      variant="outline"
      size="icon-sm"
      aria-label="Zoom in"
      asChild={asChild}
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

function GanttZoomOutTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { zoomOut } = useGantt()
  return (
    <Button
      data-slot="gantt-zoom-out-trigger"
      variant="outline"
      size="icon-sm"
      aria-label="Zoom out"
      asChild={asChild}
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

function GanttTodayTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollToDate } = useGantt()
  return (
    <Button
      data-slot="gantt-today-trigger"
      variant="outline"
      size="sm"
      asChild={asChild}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) scrollToDate(new Date())
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <CalendarIcon /> Today
            </>
          ))}
    </Button>
  )
}

export {
  Gantt,
  GanttViewport,
  GanttHeader,
  GanttHeaderCorner,
  GanttBody,
  GanttGridLines,
  GanttRows,
  GanttRow,
  GanttRowLabel,
  GanttRowTrack,
  GanttBar,
  GanttBarLabel,
  GanttBarResizeHandle,
  GanttMilestone,
  GanttDependencies,
  GanttToday,
  GanttEmpty,
  GanttControls,
  GanttZoomInTrigger,
  GanttZoomOutTrigger,
  GanttTodayTrigger,
  useGantt,
  useGanttRow,
  type GanttScale,
  type GanttBarChange,
}

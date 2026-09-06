import * as React from "react"
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"
import { LiveRegion, useLiveRegion } from "@/components/ui/live-region"

/**
 * Scheduler — a compositional, data-agnostic calendar. The consumer owns the
 * events and renders them with the parts; the root owns the anchor `date`,
 * the `view` (day/week/month), the time-grid geometry and the interactions:
 * drag to move, drag the bottom edge to resize, drag on empty time to create,
 * keyboard moves. Everything is reported as intents (`onEventChange`,
 * `onCreate`) snapped to `slotMinutes`.
 *
 * Anatomy:
 *   Scheduler { date, view, onEventChange, onCreate }
 *     SchedulerToolbar > SchedulerPrevTrigger / SchedulerTodayTrigger / SchedulerNextTrigger / SchedulerTitle / SchedulerViewSelect
 *     SchedulerTimeGrid (day, week)
 *       SchedulerTimeGridHeader > SchedulerDayHeading date=…   (+ SchedulerAllDayRow)
 *       SchedulerTimeGridBody > SchedulerTimeGutter + SchedulerDayColumn date= events=
 *         children: (event) => <SchedulerEvent value= start= end=> … <SchedulerEventResizeHandle/> </SchedulerEvent>
 *       SchedulerNowIndicator, SchedulerCreatePreview
 *     SchedulerMonthGrid > SchedulerMonthHeader + SchedulerMonthBody > SchedulerMonthCell date= > SchedulerMonthEvent value=…
 *
 * Keyboard on an event: Space/Enter picks up, ↑/↓ move by a slot, ←/→ move a
 * day, Shift+↑/↓ change the end, Escape cancels.
 */

type SchedulerView = "day" | "week" | "month"
type EventLike = { id: string; start: Date; end: Date; allDay?: boolean }
type SchedulerEventChange = { id: string; start: Date; end: Date }
type Interaction = { id: string; type: "move" | "resize"; start: Date; end: Date }
type CreateState = { start: Date; end: Date } | null

type SchedulerContextValue = {
  date: Date
  setDate: (date: Date) => void
  /** Controlled view: `day`, `week`, or `month`. */
  view: SchedulerView
  setView: (view: SchedulerView) => void
  range: { start: Date; end: Date }
  days: Date[]
  /** First day of the week, 0 for Sunday. */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Pixels per hour in the time grid. */
  hourHeight: number
  /** Snap and keyboard step in minutes. */
  slotMinutes: number
  /** First hour shown in the time grid. */
  minHour: number
  /** Last hour shown in the time grid. */
  maxHour: number
  editable: boolean
  interaction: Interaction | null
  creating: CreateState
  grabbed: string | null
  timeToY: (date: Date) => number
  yToMinutes: (y: number) => number
  bodyRef: React.RefObject<HTMLDivElement | null>
  startMove: (event: EventLike, pointer: React.PointerEvent, columnDates: Date[]) => void
  startResize: (event: EventLike, pointer: React.PointerEvent) => void
  startCreate: (day: Date, pointer: React.PointerEvent, columnDates: Date[]) => void
  startMonthMove: (event: EventLike, pointer: React.PointerEvent) => void
  grab: (id: string | null) => void
  cancelGrab: () => void
  nudge: (event: EventLike, deltaMinutes: number, deltaDays: number, part: "both" | "end") => void
  announce: (message: string) => void
}

const SchedulerContext = React.createContext<SchedulerContextValue | null>(null)
function useScheduler() {
  const ctx = React.useContext(SchedulerContext)
  if (!ctx) throw new Error("Scheduler parts must be used within <Scheduler>")
  return ctx
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes()
const withMinutes = (day: Date, minutes: number) => setMinutes(setHours(startOfDay(day), 0), minutes)

function visibleRange(date: Date, view: SchedulerView, weekStartsOn: SchedulerContextValue["weekStartsOn"]) {
  if (view === "day") return { start: startOfDay(date), end: startOfDay(date) }
  if (view === "week") return { start: startOfWeek(date, { weekStartsOn }), end: endOfWeek(date, { weekStartsOn }) }
  return {
    /** Event start. */
    start: startOfWeek(startOfMonth(date), { weekStartsOn }),
    /** Event end. */
    end: endOfWeek(endOfMonth(date), { weekStartsOn }),
  }
}

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

function Scheduler({
  date: dateProp,
  defaultDate,
  onDateChange,
  view: viewProp,
  defaultView = "week",
  onViewChange,
  weekStartsOn = 1,
  hourHeight = 56,
  slotMinutes = 15,
  minHour = 0,
  maxHour = 24,
  editable = true,
  onEventChange,
  onCreate,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  date?: Date
  /** Initial anchor date when uncontrolled. */
  defaultDate?: Date
  /** Called when the anchor date changes. */
  onDateChange?: (date: Date) => void
  /** Controlled view: `day`, `week`, or `month`. */
  view?: SchedulerView
  /** Initial view when uncontrolled. */
  defaultView?: SchedulerView
  /** Called when the view changes. */
  onViewChange?: (view: SchedulerView) => void
  /** First day of the week, 0 for Sunday. */
  weekStartsOn?: SchedulerContextValue["weekStartsOn"]
  /** Pixels per hour in the time grid. */
  hourHeight?: number
  /** Snap and keyboard step in minutes. */
  slotMinutes?: number
  /** First hour shown in the time grid. */
  minHour?: number
  /** Last hour shown in the time grid. */
  maxHour?: number
  editable?: boolean
  /** Called with `{ id, start, end }` snapped to `slotMinutes` after a move, resize, or keyboard change. */
  onEventChange?: (change: SchedulerEventChange) => void
  /** Drag on empty time (or a month cell click) proposes a new event. */
  onCreate?: (range: { start: Date; end: Date; allDay?: boolean }) => void
}) {
  const [initialDate] = React.useState(() => startOfDay(defaultDate ?? new Date()))
  const [date, setDate] = useControllable(dateProp, initialDate, onDateChange)
  const [view, setView] = useControllable<SchedulerView>(viewProp, defaultView, onViewChange)

  const range = React.useMemo(() => visibleRange(date, view, weekStartsOn), [date, view, weekStartsOn])
  const days = React.useMemo(() => eachDayOfInterval(range), [range])

  const bodyRef = React.useRef<HTMLDivElement>(null)
  const minuteHeight = hourHeight / 60
  const timeToY = React.useCallback(
    (d: Date) => (minutesOfDay(d) - minHour * 60) * minuteHeight,
    [minHour, minuteHeight]
  )
  const yToMinutes = React.useCallback(
    (y: number) =>
      clamp(Math.round((y / minuteHeight + minHour * 60) / slotMinutes) * slotMinutes, minHour * 60, maxHour * 60),
    [minuteHeight, minHour, maxHour, slotMinutes]
  )

  const [interaction, setInteraction] = React.useState<Interaction | null>(null)
  const [creating, setCreating] = React.useState<CreateState>(null)
  const [grabbed, setGrabbed] = React.useState<string | null>(null)
  const { message: announcement, announce } = useLiveRegion()
  const onEventChangeRef = React.useRef(onEventChange)
  const onCreateRef = React.useRef(onCreate)
  React.useEffect(() => {
    onEventChangeRef.current = onEventChange
    onCreateRef.current = onCreate
  }, [onEventChange, onCreate])
  const grabOrigin = React.useRef<SchedulerEventChange | null>(null)

  const track = React.useCallback((onMove: (e: PointerEvent) => void, onUp: (e: PointerEvent) => void) => {
    const up = (e: PointerEvent) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      onUp(e)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }, [])

  /** Which day column a client x falls in, from the column elements' rects. */
  const dayAtX = React.useCallback((x: number, columnDates: Date[]) => {
    const columns = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>("[data-slot=scheduler-day-column]") ?? [])
    for (const [i, col] of columns.entries()) {
      const r = col.getBoundingClientRect()
      if (x >= r.left && x < r.right) return columnDates[i] ?? null
    }
    return null
  }, [])

  const startMove = React.useCallback(
    (event: EventLike, pointer: React.PointerEvent, columnDates: Date[]) => {
      if (!editable) return
      pointer.preventDefault()
      pointer.stopPropagation()
      const originY = pointer.clientY
      const originDay = startOfDay(event.start)
      let current: Interaction = { id: event.id, type: "move", start: event.start, end: event.end }
      let moved = false
      setInteraction(current)
      track(
        (e) => {
          const dy = e.clientY - originY
          const deltaMinutes = Math.round(dy / minuteHeight / slotMinutes) * slotMinutes
          const day = dayAtX(e.clientX, columnDates) ?? originDay
          const dayDelta = differenceInCalendarDays(day, originDay)
          const duration = differenceInMinutes(event.end, event.start)
          const startMin = clamp(minutesOfDay(event.start) + deltaMinutes, minHour * 60, maxHour * 60 - duration)
          const start = addDays(withMinutes(originDay, startMin), dayDelta)
          current = { id: event.id, type: "move", start, end: addMinutes(start, duration) }
          if (Math.abs(dy) > 3 || dayDelta !== 0) moved = true
          setInteraction(current)
        },
        () => {
          setInteraction(null)
          if (
            moved &&
            (current.start.getTime() !== event.start.getTime() || current.end.getTime() !== event.end.getTime())
          ) {
            onEventChangeRef.current?.({ id: event.id, start: current.start, end: current.end })
          }
        }
      )
    },
    [editable, track, dayAtX, minuteHeight, slotMinutes, minHour, maxHour]
  )

  const startResize = React.useCallback(
    (event: EventLike, pointer: React.PointerEvent) => {
      if (!editable) return
      pointer.preventDefault()
      pointer.stopPropagation()
      const originY = pointer.clientY
      let current: Interaction = { id: event.id, type: "resize", start: event.start, end: event.end }
      setInteraction(current)
      track(
        (e) => {
          const deltaMinutes = Math.round((e.clientY - originY) / minuteHeight / slotMinutes) * slotMinutes
          const endMin = clamp(
            minutesOfDay(event.end) + deltaMinutes,
            minutesOfDay(event.start) + slotMinutes,
            maxHour * 60
          )
          current = { ...current, end: withMinutes(event.start, endMin) }
          setInteraction(current)
        },
        () => {
          setInteraction(null)
          if (current.end.getTime() !== event.end.getTime()) {
            onEventChangeRef.current?.({ id: event.id, start: event.start, end: current.end })
          }
        }
      )
    },
    [editable, track, minuteHeight, slotMinutes, maxHour]
  )

  const startCreate = React.useCallback(
    (day: Date, pointer: React.PointerEvent, columnDates: Date[]) => {
      if (!editable || !onCreateRef.current) return
      const column = (pointer.currentTarget as HTMLElement).getBoundingClientRect()
      const originMin = yToMinutes(pointer.clientY - column.top)
      let current: NonNullable<CreateState> = {
        /** Event start. */
        start: withMinutes(day, originMin),
        /** Event end. */
        end: withMinutes(day, originMin + slotMinutes),
      }
      let dragged = false
      setCreating(current)
      track(
        (e) => {
          const min = yToMinutes(e.clientY - column.top)
          const targetDay = dayAtX(e.clientX, columnDates) ?? day
          const a = Math.min(originMin, min)
          const b = Math.max(originMin, min, a + slotMinutes)
          current = { start: withMinutes(targetDay, a), end: withMinutes(targetDay, b) }
          dragged = true
          setCreating(current)
        },
        () => {
          setCreating(null)
          onCreateRef.current?.(dragged ? current : { start: current.start, end: addMinutes(current.start, 60) })
        }
      )
    },
    [editable, track, yToMinutes, slotMinutes, dayAtX]
  )

  /** Month view: drag a chip onto another cell to shift the event by whole days. */
  const startMonthMove = React.useCallback(
    (event: EventLike, pointer: React.PointerEvent) => {
      if (!editable) return
      pointer.preventDefault()
      pointer.stopPropagation()
      const originDay = startOfDay(event.start)
      let current: Interaction = { id: event.id, type: "move", start: event.start, end: event.end }
      let moved = false
      setInteraction(current)
      const cellAt = (x: number, y: number) =>
        document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-slot=scheduler-month-cell]")?.dataset.date
      track(
        (e) => {
          const target = cellAt(e.clientX, e.clientY)
          if (!target) return
          const delta = differenceInCalendarDays(new Date(target), originDay)
          current = { ...current, start: addDays(event.start, delta), end: addDays(event.end, delta) }
          moved = true
          setInteraction(current)
        },
        () => {
          setInteraction(null)
          if (moved && current.start.getTime() !== event.start.getTime()) {
            onEventChangeRef.current?.({ id: event.id, start: current.start, end: current.end })
          }
        }
      )
    },
    [editable, track]
  )

  const grab = React.useCallback(
    (id: string | null) => {
      if (id) {
        setGrabbed(id)
        announce("Picked up. Arrows move; Shift+Up/Down change the end. Space drops, Escape cancels.")
      } else {
        setGrabbed(null)
        grabOrigin.current = null
        announce("Dropped.")
      }
    },
    [announce]
  )
  const cancelGrab = React.useCallback(() => {
    if (grabOrigin.current) onEventChangeRef.current?.(grabOrigin.current)
    setGrabbed(null)
    grabOrigin.current = null
    announce("Cancelled.")
  }, [announce])

  const nudge = React.useCallback(
    (event: EventLike, deltaMinutes: number, deltaDays: number, part: "both" | "end") => {
      if (!grabOrigin.current || grabOrigin.current.id !== event.id) {
        grabOrigin.current = { id: event.id, start: event.start, end: event.end }
      }
      const next =
        part === "end"
          ? {
              /** Event start. */
              start: event.start,
              /** Event end. */
              end: addMinutes(
                event.end,
                Math.max(deltaMinutes, slotMinutes - differenceInMinutes(event.end, event.start))
              ),
            }
          : {
              /** Event start. */
              start: addDays(addMinutes(event.start, deltaMinutes), deltaDays),
              /** Event end. */
              end: addDays(addMinutes(event.end, deltaMinutes), deltaDays),
            }
      onEventChangeRef.current?.({ id: event.id, ...next })
      announce(`${format(next.start, "EEE d, p")} to ${format(next.end, "p")}.`)
    },
    [announce, slotMinutes]
  )

  const ctx = React.useMemo<SchedulerContextValue>(
    () => ({
      date,
      setDate,
      view,
      setView,
      range,
      days,
      weekStartsOn,
      hourHeight,
      slotMinutes,
      minHour,
      maxHour,
      editable,
      interaction,
      creating,
      grabbed,
      timeToY,
      yToMinutes,
      bodyRef,
      startMove,
      startResize,
      startCreate,
      startMonthMove,
      grab,
      cancelGrab,
      nudge,
      announce,
    }),
    [
      date,
      setDate,
      view,
      setView,
      range,
      days,
      weekStartsOn,
      hourHeight,
      slotMinutes,
      minHour,
      maxHour,
      editable,
      interaction,
      creating,
      grabbed,
      timeToY,
      yToMinutes,
      startMove,
      startResize,
      startCreate,
      startMonthMove,
      grab,
      cancelGrab,
      nudge,
      announce,
    ]
  )

  return (
    <SchedulerContext.Provider value={ctx}>
      <div
        data-slot="scheduler"
        data-view={view}
        data-interacting={interaction?.type ?? (creating ? "create" : undefined)}
        className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}
        {...props}
      >
        {children}
        <LiveRegion data-slot="scheduler-live-region" message={announcement} />
      </div>
    </SchedulerContext.Provider>
  )
}

/* ---------------------------------------------------------------------------
 * Toolbar
 * ------------------------------------------------------------------------- */

function SchedulerToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="scheduler-toolbar" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
}

function shift(date: Date, view: SchedulerView, direction: 1 | -1) {
  if (view === "day") return addDays(date, direction)
  if (view === "week") return addWeeks(date, direction)
  return addMonths(date, direction)
}

function SchedulerPrevTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { date, view, setDate } = useScheduler()
  return (
    <Button
      data-slot="scheduler-prev-trigger"
      variant="outline"
      size="icon-sm"
      aria-label={`Previous ${view}`}
      asChild={asChild}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setDate(shift(date, view, -1))
      }}
      {...props}
    >
      {asChild ? children : (children ?? <ChevronLeftIcon />)}
    </Button>
  )
}

function SchedulerNextTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { date, view, setDate } = useScheduler()
  return (
    <Button
      data-slot="scheduler-next-trigger"
      variant="outline"
      size="icon-sm"
      aria-label={`Next ${view}`}
      asChild={asChild}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setDate(shift(date, view, 1))
      }}
      {...props}
    >
      {asChild ? children : (children ?? <ChevronRightIcon />)}
    </Button>
  )
}

function SchedulerTodayTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { setDate } = useScheduler()
  return (
    <Button
      data-slot="scheduler-today-trigger"
      variant="outline"
      size="sm"
      asChild={asChild}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setDate(startOfDay(new Date()))
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

/** "September 2026", "Sep 7 – 13, 2026" or "Mon, Sep 7". */
function SchedulerTitle({ className, children, ...props }: React.ComponentProps<"h2">) {
  const { date, view, range } = useScheduler()
  const text =
    view === "month"
      ? format(date, "MMMM yyyy")
      : view === "day"
        ? format(date, "EEEE, MMM d, yyyy")
        : isSameMonth(range.start, range.end)
          ? `${format(range.start, "MMM d")} – ${format(range.end, "d, yyyy")}`
          : `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}`
  return (
    <h2 data-slot="scheduler-title" className={cn("text-base font-semibold tabular-nums", className)} {...props}>
      {children ?? text}
    </h2>
  )
}

function SchedulerViewSelect({
  className,
  ...props
}: Omit<React.ComponentProps<typeof SegmentGroup>, "value" | "onValueChange">) {
  const { view, setView } = useScheduler()
  return (
    <SegmentGroup
      data-slot="scheduler-view-select"
      value={view}
      onValueChange={({ value }) => value && setView(value as SchedulerView)}
      className={className}
      {...props}
    >
      <SegmentGroupIndicator />
      <SegmentGroupItem value="day">Day</SegmentGroupItem>
      <SegmentGroupItem value="week">Week</SegmentGroupItem>
      <SegmentGroupItem value="month">Month</SegmentGroupItem>
    </SegmentGroup>
  )
}

/* ---------------------------------------------------------------------------
 * Time grid (day / week)
 * ------------------------------------------------------------------------- */

const GUTTER = "3.5rem"

function SchedulerTimeGrid({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scheduler-time-grid"
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background", className)}
      style={{ ["--scheduler-gutter" as string]: GUTTER, ...style }}
      {...props}
    />
  )
}

function SchedulerTimeGridHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scheduler-time-grid-header"
      className={cn("grid shrink-0 border-b bg-muted/50", className)}
      style={{ gridTemplateColumns: "var(--scheduler-gutter) 1fr" }}
      {...props}
    />
  )
}

/** Day headings across the top, one per visible day. */
function SchedulerDayHeadings({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { children?: (day: Date) => React.ReactNode }) {
  const { days, setDate, setView } = useScheduler()
  return (
    <>
      <div aria-hidden className="border-e" />
      <div
        data-slot="scheduler-day-headings"
        className={cn("grid", className)}
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        {...props}
      >
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            data-slot="scheduler-day-heading"
            data-today={isToday(day) ? "" : undefined}
            className="group/heading flex flex-col items-center gap-0.5 border-e py-2 text-xs text-muted-foreground outline-none last:border-e-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
            onClick={() => {
              setDate(day)
              setView("day")
            }}
          >
            {children ? (
              children(day)
            ) : (
              <>
                <span>{format(day, "EEE")}</span>
                <span className="flex size-7 items-center justify-center rounded-full text-base font-semibold text-foreground group-data-today/heading:bg-primary group-data-today/heading:text-primary-foreground">
                  {format(day, "d")}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </>
  )
}

/** Strip under the headings for all-day events; render chips inside per day. */
function SchedulerAllDayRow({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { children: (day: Date) => React.ReactNode }) {
  const { days } = useScheduler()
  return (
    <>
      <div className="flex items-start justify-end border-e border-t px-1.5 py-1 text-[10px] text-muted-foreground uppercase">
        all day
      </div>
      <div
        data-slot="scheduler-all-day-row"
        className={cn("grid border-t", className)}
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        {...props}
      >
        {days.map((day) => (
          <div
            key={day.toISOString()}
            data-slot="scheduler-all-day-cell"
            className="flex min-h-7 flex-col gap-0.5 border-e p-0.5 last:border-e-0"
          >
            {children(day)}
          </div>
        ))}
      </div>
    </>
  )
}

function SchedulerTimeGridBody({ className, children, ...props }: React.ComponentProps<"div">) {
  const { bodyRef, hourHeight, minHour, maxHour } = useScheduler()
  // Scroll to a sensible hour on mount.
  React.useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = Math.max(0, (8 - minHour) * hourHeight - 8)
  }, [bodyRef, hourHeight, minHour])
  return (
    <div
      ref={bodyRef}
      data-slot="scheduler-time-grid-body"
      className={cn("relative min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: "var(--scheduler-gutter) 1fr", height: (maxHour - minHour) * hourHeight }}
      >
        {children}
      </div>
    </div>
  )
}

function SchedulerTimeGutter({ className, ...props }: React.ComponentProps<"div">) {
  const { hourHeight, minHour, maxHour } = useScheduler()
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i)
  return (
    <div data-slot="scheduler-time-gutter" className={cn("relative border-e", className)} {...props}>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute inset-e-1.5 -translate-y-1/2 text-[11px] text-muted-foreground tabular-nums"
          style={{ top: (h - minHour) * hourHeight }}
        >
          {h > minHour ? format(setHours(new Date(), h), "h a") : ""}
        </div>
      ))}
    </div>
  )
}

/** The columns container; hour lines are drawn behind. */
function SchedulerDayColumns({ className, children, ...props }: React.ComponentProps<"div">) {
  const { days, hourHeight, minHour, maxHour } = useScheduler()
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => i)
  return (
    <div
      data-slot="scheduler-day-columns"
      className={cn("relative grid", className)}
      style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      {...props}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {hours.map((i) => (
          <div key={i} className="absolute inset-x-0 border-t border-border/70" style={{ top: i * hourHeight }} />
        ))}
      </div>
      {children}
    </div>
  )
}

/** Side-by-side lanes for overlapping events. */
function layoutLanes(events: EventLike[]) {
  const sorted = [...events]
    .filter((e) => !e.allDay)
    .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime())
  const result = new Map<string, { lane: number; lanes: number }>()
  let cluster: EventLike[] = []
  let clusterEnd = 0
  const flush = () => {
    const laneEnds: number[] = []
    const assigned: { id: string; lane: number }[] = []
    for (const e of cluster) {
      let lane = laneEnds.findIndex((end) => end <= e.start.getTime())
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = e.end.getTime()
      assigned.push({ id: e.id, lane })
    }
    for (const a of assigned) result.set(a.id, { lane: a.lane, lanes: laneEnds.length })
    cluster = []
    clusterEnd = 0
  }
  for (const e of sorted) {
    if (cluster.length && e.start.getTime() >= clusterEnd) flush()
    cluster.push(e)
    clusterEnd = Math.max(clusterEnd, e.end.getTime())
  }
  if (cluster.length) flush()
  return result
}

const ColumnContext = React.createContext<{ day: Date; lanes: Map<string, { lane: number; lanes: number }> } | null>(
  null
)

/** One day. `events` are the ones on this day (for overlap layout); `children` renders each. */
function SchedulerDayColumn<T extends EventLike>({
  date,
  events,
  className,
  children,
  onPointerDown,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  date: Date
  /** Events shown in this column; overlaps are laid out side by side. */
  events: T[]
  children: (event: T) => React.ReactNode
}) {
  const scheduler = useScheduler()
  const lanes = React.useMemo(() => layoutLanes(events), [events])
  const ctx = React.useMemo(() => ({ day: date, lanes }), [date, lanes])
  return (
    <ColumnContext.Provider value={ctx}>
      <div
        data-slot="scheduler-day-column"
        data-date={date.toISOString()}
        data-today={isToday(date) ? "" : undefined}
        className={cn("relative border-e last:border-e-0 data-today:bg-primary/3", className)}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest("[data-slot=scheduler-event]")) return
          scheduler.startCreate(date, event, scheduler.days)
        }}
        {...props}
      >
        {events.map((event) => (
          <React.Fragment key={event.id}>{children(event)}</React.Fragment>
        ))}
      </div>
    </ColumnContext.Provider>
  )
}

const EventContext = React.createContext<EventLike | null>(null)

function SchedulerEvent({
  value,
  start,
  end,
  className,
  style,
  children,
  onPointerDown,
  onKeyDown,
  onBlur,
  ...props
}: React.ComponentProps<"div"> & { value: string; start: Date; end: Date }) {
  const s = useScheduler()
  const column = React.useContext(ColumnContext)
  const live = s.interaction?.id === value ? s.interaction : null
  const shownStart = live ? live.start : start
  const shownEnd = live ? live.end : end
  // While a move crosses days the event stays in its original column but shifts visually.
  const dayOffset = column ? differenceInCalendarDays(startOfDay(shownStart), column.day) : 0
  const lane = column?.lanes.get(value) ?? { lane: 0, lanes: 1 }
  const top = s.timeToY(shownStart)
  const height = Math.max(s.hourHeight / 4, (differenceInMinutes(shownEnd, shownStart) * s.hourHeight) / 60)
  const isGrabbed = s.grabbed === value
  const eventLike = React.useMemo(() => ({ id: value, start, end }), [value, start, end])
  return (
    <EventContext.Provider value={eventLike}>
      <div
        {...props}
        data-slot="scheduler-event"
        data-value={value}
        data-dragging={live?.type}
        data-grabbed={isGrabbed ? "" : undefined}
        tabIndex={s.editable ? 0 : undefined}
        aria-pressed={s.editable ? isGrabbed : undefined}
        aria-label={`${format(shownStart, "EEE d, p")} to ${format(shownEnd, "p")}`}
        className={cn(
          "group/event absolute flex flex-col overflow-hidden rounded-md border border-primary/30 bg-primary/15 px-1.5 py-1 text-xs text-foreground outline-none select-none",
          s.editable && "cursor-grab active:cursor-grabbing",
          "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/50 data-dragging:z-20 data-dragging:shadow-lg data-grabbed:ring-2 data-grabbed:ring-primary",
          className
        )}
        style={{
          top,
          height,
          left: `calc(${(lane.lane / lane.lanes) * 100}% + 2px)`,
          width: `calc(${100 / lane.lanes}% - 4px)`,
          transform: dayOffset ? `translateX(calc(${dayOffset * 100}% + ${dayOffset * 1}px))` : undefined,
          ...style,
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest("[data-slot=scheduler-event-resize-handle], button, a")) return
          s.startMove(eventLike, event, s.days)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || !s.editable || event.target !== event.currentTarget) return
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault()
            s.grab(isGrabbed ? null : value)
            return
          }
          if (!isGrabbed) return
          const step = s.slotMinutes
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault()
            const delta = event.key === "ArrowUp" ? -step : step
            s.nudge(eventLike, delta, 0, event.shiftKey ? "end" : "both")
          } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            s.nudge(eventLike, 0, event.key === "ArrowLeft" ? -1 : 1, "both")
          } else if (event.key === "Escape") {
            event.preventDefault()
            s.cancelGrab()
          }
        }}
        onBlur={(event) => {
          onBlur?.(event)
          if (isGrabbed && !event.currentTarget.contains(event.relatedTarget as Node | null)) s.grab(null)
        }}
      >
        {children}
      </div>
    </EventContext.Provider>
  )
}

function SchedulerEventTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="scheduler-event-title" className={cn("truncate font-medium", className)} {...props} />
}

/** "9:00 – 9:45 AM"; reflects the live drag. */
function SchedulerEventTime({ className, children, ...props }: React.ComponentProps<"div">) {
  const s = useScheduler()
  const e = React.useContext(EventContext)
  if (!e) return null
  const live = s.interaction?.id === e.id ? s.interaction : null
  const start = live ? live.start : e.start
  const end = live ? live.end : e.end
  return (
    <div
      data-slot="scheduler-event-time"
      className={cn("truncate text-[11px] tabular-nums opacity-80", className)}
      {...props}
    >
      {children ?? `${format(start, "h:mm")} – ${format(end, "h:mm a")}`}
    </div>
  )
}

function SchedulerEventResizeHandle({ className, onPointerDown, ...props }: React.ComponentProps<"div">) {
  const s = useScheduler()
  const e = React.useContext(EventContext)
  if (!s.editable || !e) return null
  return (
    <div
      data-slot="scheduler-event-resize-handle"
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "absolute inset-x-0 bottom-0 h-2 cursor-ns-resize touch-none after:absolute after:inset-x-1/2 after:bottom-0.5 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-primary/50 after:opacity-0 group-hover/event:after:opacity-100",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        s.startResize(e, event)
      }}
      {...props}
    />
  )
}

/** Outline of the event being created by dragging; renders nothing when idle. */
function SchedulerCreatePreview({ className, children, ...props }: React.ComponentProps<"div">) {
  const s = useScheduler()
  if (!s.creating) return null
  const index = s.days.findIndex((d) => isSameDay(d, s.creating!.start))
  if (index === -1) return null
  const top = s.timeToY(s.creating.start)
  const height = (differenceInMinutes(s.creating.end, s.creating.start) * s.hourHeight) / 60
  return (
    <div
      data-slot="scheduler-create-preview"
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-20 rounded-md border-2 border-dashed border-primary/60 bg-primary/10 px-1.5 py-1 text-[11px] text-primary tabular-nums",
        className
      )}
      style={{
        top,
        height,
        left: `calc(${(index / s.days.length) * 100}% + 2px)`,
        width: `calc(${100 / s.days.length}% - 4px)`,
      }}
      {...props}
    >
      {children ?? `${format(s.creating.start, "h:mm")} – ${format(s.creating.end, "h:mm a")}`}
    </div>
  )
}

/** Red line at the current time in today's column. */
function SchedulerNowIndicator({ className, ...props }: React.ComponentProps<"div">) {
  const s = useScheduler()
  const [now, setNow] = React.useState(() => new Date())
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  const index = s.days.findIndex((d) => isToday(d))
  if (index === -1) return null
  return (
    <div
      data-slot="scheduler-now-indicator"
      aria-hidden
      className={cn("pointer-events-none absolute z-10 h-px bg-destructive", className)}
      style={{ top: s.timeToY(now), left: `${(index / s.days.length) * 100}%`, width: `${100 / s.days.length}%` }}
      {...props}
    >
      <span className="absolute -top-1 -left-1 size-2 rounded-full bg-destructive" />
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Month grid
 * ------------------------------------------------------------------------- */

function SchedulerMonthGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scheduler-month-grid"
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background", className)}
      {...props}
    />
  )
}

function SchedulerMonthHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { days } = useScheduler()
  return (
    <div
      data-slot="scheduler-month-header"
      className={cn("grid grid-cols-7 border-b bg-muted/50 text-xs text-muted-foreground", className)}
      {...props}
    >
      {days.slice(0, 7).map((d) => (
        <div key={d.toISOString()} className="border-e px-2 py-1.5 text-center font-medium last:border-e-0">
          {format(d, "EEE")}
        </div>
      ))}
    </div>
  )
}

function SchedulerMonthBody({ className, children, ...props }: React.ComponentProps<"div">) {
  const { days } = useScheduler()
  return (
    <div
      data-slot="scheduler-month-body"
      className={cn("grid min-h-0 flex-1 grid-cols-7 overflow-y-auto", className)}
      style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(6rem, 1fr))` }}
      {...props}
    >
      {children}
    </div>
  )
}

function SchedulerMonthCell({
  date,
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"div"> & { date: Date }) {
  const s = useScheduler()
  const outside = !isSameMonth(date, s.date)
  return (
    <div
      data-slot="scheduler-month-cell"
      data-date={date.toISOString()}
      data-today={isToday(date) ? "" : undefined}
      data-outside={outside ? "" : undefined}
      className={cn(
        "group/cell flex min-h-0 flex-col gap-0.5 border-e border-b p-1 text-xs data-outside:bg-muted/30 data-outside:text-muted-foreground nth-[7n]:border-e-0",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if ((event.target as HTMLElement).closest("[data-slot=scheduler-month-event], button, a")) return
        s.setDate(date)
      }}
      {...props}
    >
      <button
        type="button"
        data-slot="scheduler-month-day"
        className="mb-0.5 flex size-6 items-center justify-center self-start rounded-full text-xs font-medium outline-none group-data-today/cell:bg-primary group-data-today/cell:text-primary-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={(event) => {
          event.stopPropagation()
          s.setDate(date)
          s.setView("day")
        }}
      >
        {format(date, "d")}
      </button>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">{children}</div>
    </div>
  )
}

/** Compact chip for the month view; draggable between cells. */
function SchedulerMonthEvent({
  value,
  start,
  end,
  className,
  children,
  onPointerDown,
  ...props
}: React.ComponentProps<"div"> & { value: string; start: Date; end: Date }) {
  const s = useScheduler()
  const live = s.interaction?.id === value ? s.interaction : null
  const eventLike = React.useMemo(() => ({ id: value, start, end }), [value, start, end])
  return (
    <div
      {...props}
      data-slot="scheduler-month-event"
      data-value={value}
      data-dragging={live ? "" : undefined}
      tabIndex={s.editable ? 0 : undefined}
      aria-label={`${format(start, "EEE d, p")}`}
      className={cn(
        "flex cursor-grab items-center gap-1 truncate rounded-sm border border-primary/30 bg-primary/15 px-1.5 py-px text-[11px]/4 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing data-dragging:opacity-50",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        s.startMonthMove(eventLike, event)
      }}
    >
      {children}
    </div>
  )
}

function SchedulerMonthMore({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="scheduler-month-more"
      className={cn(
        "self-start rounded-sm px-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Scheduler,
  SchedulerToolbar,
  SchedulerPrevTrigger,
  SchedulerNextTrigger,
  SchedulerTodayTrigger,
  SchedulerTitle,
  SchedulerViewSelect,
  SchedulerTimeGrid,
  SchedulerTimeGridHeader,
  SchedulerDayHeadings,
  SchedulerAllDayRow,
  SchedulerTimeGridBody,
  SchedulerTimeGutter,
  SchedulerDayColumns,
  SchedulerDayColumn,
  SchedulerEvent,
  SchedulerEventTitle,
  SchedulerEventTime,
  SchedulerEventResizeHandle,
  SchedulerCreatePreview,
  SchedulerNowIndicator,
  SchedulerMonthGrid,
  SchedulerMonthHeader,
  SchedulerMonthBody,
  SchedulerMonthCell,
  SchedulerMonthEvent,
  SchedulerMonthMore,
  useScheduler,
  layoutLanes,
  visibleRange,
  type SchedulerView,
  type SchedulerEventChange,
}

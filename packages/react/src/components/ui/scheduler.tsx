import { ark } from "@ark-ui/react"
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
import { Button } from "./button"
import { SegmentGroup } from "./segment-group"
import { cn } from "../../lib/utils"
import { useControllable } from "../../lib/controllable"
import { LiveRegion, useLiveRegion } from "./live-region"

/**
 * Scheduler — a compositional, data-agnostic calendar. The consumer owns the
 * events and renders them with the parts; the root owns the anchor `date`,
 * the `view` (day/week/month), the time-grid geometry and the interactions:
 * drag to move, drag event edges to resize, drag on empty time to create,
 * keyboard moves and endpoint resizing. Everything is reported as intents (`onEventChange`,
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
  eventLayout: "overlap" | "lanes"
  activeEvent: string | null
  setActiveEvent: (id: string) => void
  interaction: Interaction | null
  creating: CreateState
  grabbed: string | null
  timeToY: (date: Date) => number
  yToMinutes: (y: number) => number
  bodyRef: React.RefObject<HTMLDivElement | null>
  startMove: (event: EventLike, pointer: React.PointerEvent, columnDates: Date[]) => void
  startResize: (event: EventLike, pointer: React.PointerEvent, edge: "start" | "end", axis: "time" | "date") => void
  startCreate: (day: Date, pointer: React.PointerEvent, columnDates: Date[]) => void
  startMonthMove: (event: EventLike, pointer: React.PointerEvent) => void
  grab: (id: string | null) => void
  cancelGrab: () => void
  nudge: (event: EventLike, deltaMinutes: number, deltaDays: number, part: "both" | "start" | "end") => void
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

/** Clip a timed event to the visible part of a day. End dates are exclusive. */
function daySegment(event: Pick<EventLike, "start" | "end">, day: Date, minHour = 0, maxHour = 24) {
  const lower = withMinutes(day, minHour * 60)
  const upper = withMinutes(day, maxHour * 60)
  const start = new Date(Math.max(event.start.getTime(), lower.getTime()))
  const end = new Date(Math.min(event.end.getTime(), upper.getTime()))
  if (end <= start) return null
  const endMinute = isSameDay(end, day) ? minutesOfDay(end) : 1440
  return {
    start,
    end,
    topMinutes: minutesOfDay(start) - minHour * 60,
    durationMinutes: endMinute - minutesOfDay(start),
    continuesBefore: event.start < lower,
    continuesAfter: event.end > upper,
  }
}

/** Week uses one rectangle: date range controls width, clock range controls height. */
function weekSegment(event: Pick<EventLike, "start" | "end">, days: Date[], minHour: number, maxHour: number) {
  if (!days.length || event.end <= event.start) return null
  const startIndex = differenceInCalendarDays(event.start, days[0])
  const endIndex = differenceInCalendarDays(new Date(event.end.getTime() - 1), days[0])
  if (endIndex < 0 || startIndex >= days.length) return null
  const first = Math.max(0, startIndex)
  const last = Math.min(days.length - 1, endIndex)
  const startMinute = minutesOfDay(event.start)
  const endMinute = minutesOfDay(event.end) || 1440
  // A clock range crossing midnight cannot be represented as a single clock band.
  // Keep one full-height block, with the actual date/time range in its label.
  const overnight = endMinute <= startMinute && endIndex > startIndex
  const top = Math.max(minHour * 60, overnight ? minHour * 60 : startMinute)
  const bottom = Math.min(maxHour * 60, overnight ? maxHour * 60 : endMinute)
  if (bottom <= top) return null
  return {
    day: days[first],
    first,
    span: last - first + 1,
    topMinutes: top - minHour * 60,
    durationMinutes: bottom - top,
    continuesBefore: startIndex < 0,
    continuesAfter: endIndex >= days.length,
    clippedTop: !overnight && startMinute < minHour * 60,
    clippedBottom: !overnight && endMinute > maxHour * 60,
  }
}

/** A month event is one bar per calendar row, clipped only at week boundaries. */
function monthSegment(
  event: Pick<EventLike, "start" | "end">,
  day: Date,
  weekStartsOn: SchedulerContextValue["weekStartsOn"]
) {
  if (event.end <= event.start) return null
  const rowStart = startOfWeek(day, { weekStartsOn })
  const rowEnd = addDays(rowStart, 6)
  const first = startOfDay(event.start)
  const last = startOfDay(new Date(event.end.getTime() - 1))
  if (last < rowStart || first > rowEnd) return null
  const owner = first < rowStart ? rowStart : first
  const end = last > rowEnd ? rowEnd : last
  return {
    day: owner,
    span: differenceInCalendarDays(end, owner) + 1,
    continuesBefore: first < rowStart,
    continuesAfter: last > rowEnd,
  }
}

function monthLanes(events: EventLike[], day: Date, weekStartsOn: SchedulerContextValue["weekStartsOn"]) {
  const lanes = new Map<string, number>()
  const ends: number[] = []
  const segments = events
    .flatMap((event) => {
      const segment = monthSegment(event, day, weekStartsOn)
      return segment ? [{ event, segment }] : []
    })
    .sort(
      (a, b) =>
        a.segment.day.getTime() - b.segment.day.getTime() ||
        b.segment.span - a.segment.span ||
        a.event.id.localeCompare(b.event.id)
    )
  for (const { event, segment } of segments) {
    const start = segment.day.getTime()
    let lane = ends.findIndex((end) => end < start)
    if (lane < 0) lane = ends.length
    ends[lane] = addDays(segment.day, segment.span - 1).getTime()
    lanes.set(event.id, lane)
  }
  return lanes
}

function monthCellAt(root: Element | null, x: number, y: number) {
  return Array.from(root?.querySelectorAll<HTMLElement>("[data-slot=scheduler-month-cell]") ?? []).find((el) => {
    const r = el.getBoundingClientRect()
    return x >= r.left && x < r.right && y >= r.top && y < r.bottom
  })
}

/** Keep date resizing on the original clock, and week clock bands from inverting. */
function resizeEndpoint(
  event: Pick<EventLike, "start" | "end">,
  proposed: Date,
  edge: "start" | "end",
  axis: "time" | "date",
  view: SchedulerView,
  slotMinutes: number
) {
  if (axis === "date") {
    let boundary = withMinutes(edge === "start" ? event.end : event.start, minutesOfDay(event[edge]))
    if (edge === "start" && boundary > addMinutes(event.end, -slotMinutes)) boundary = addDays(boundary, -1)
    if (edge === "end" && boundary < addMinutes(event.start, slotMinutes)) boundary = addDays(boundary, 1)
    return new Date(
      edge === "start"
        ? Math.min(proposed.getTime(), boundary.getTime())
        : Math.max(proposed.getTime(), boundary.getTime())
    )
  }
  const endClock = minutesOfDay(event.end) || 1440
  if (view === "week" && endClock > minutesOfDay(event.start)) {
    const boundary =
      edge === "start"
        ? withMinutes(event.start, endClock - slotMinutes)
        : withMinutes(startOfDay(new Date(event.end.getTime() - 1)), minutesOfDay(event.start) + slotMinutes)
    proposed = new Date(
      edge === "start"
        ? Math.min(proposed.getTime(), boundary.getTime())
        : Math.max(proposed.getTime(), boundary.getTime())
    )
  }
  return new Date(
    edge === "start"
      ? Math.min(proposed.getTime(), addMinutes(event.end, -slotMinutes).getTime())
      : Math.max(proposed.getTime(), addMinutes(event.start, slotMinutes).getTime())
  )
}

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

function SchedulerRoot({
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
  eventLayout: layoutProp,
  onEventChange,
  onCreate,
  className,
  children,
  ...props
}: SchedulerRootProps) {
  const [initialDate] = React.useState(() => startOfDay(defaultDate ?? new Date()))
  const [date, setDate] = useControllable(dateProp, initialDate, onDateChange)
  const [view, setView] = useControllable<SchedulerView>(viewProp, defaultView, onViewChange)

  const eventLayout = layoutProp ?? (view === "week" ? "overlap" : "lanes")
  const [activeEvent, setActiveEvent] = React.useState<string | null>(null)

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
      const anchorDay = dayAtX(pointer.clientX, columnDates) ?? originDay
      let current: Interaction = { id: event.id, type: "move", start: event.start, end: event.end }
      let moved = false
      setInteraction(current)
      track(
        (e) => {
          const dy = e.clientY - originY
          const deltaMinutes = Math.round(dy / minuteHeight / slotMinutes) * slotMinutes
          const day = dayAtX(e.clientX, columnDates) ?? anchorDay
          const dayDelta = differenceInCalendarDays(day, anchorDay)
          const duration = differenceInMinutes(event.end, event.start)
          const singleDay = isSameDay(event.start, new Date(event.end.getTime() - 1))
          const clockDuration = (minutesOfDay(event.end) || 1440) - minutesOfDay(event.start)
          const visibleDuration = view === "week" && clockDuration > 0 ? clockDuration : singleDay ? duration : 0
          const startMin =
            visibleDuration > 0 && visibleDuration <= (maxHour - minHour) * 60
              ? clamp(minutesOfDay(event.start) + deltaMinutes, minHour * 60, maxHour * 60 - visibleDuration)
              : minutesOfDay(event.start) + deltaMinutes
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
    [editable, track, dayAtX, minuteHeight, slotMinutes, minHour, maxHour, view]
  )

  const startResize = React.useCallback(
    (event: EventLike, pointer: React.PointerEvent, edge: "start" | "end", axis: "time" | "date") => {
      if (!editable) return
      setActiveEvent(event.id)
      pointer.preventDefault()
      pointer.stopPropagation()
      const originY = pointer.clientY
      const originX = pointer.clientX
      const root = (pointer.currentTarget as HTMLElement).closest("[data-slot=scheduler]")
      const cellSelector = view === "month" ? "[data-slot=scheduler-month-cell]" : "[data-slot=scheduler-day-column]"
      const anchor = (pointer.currentTarget as HTMLElement).closest<HTMLElement>(cellSelector)?.dataset.date
      const pointerCell =
        view === "month" ? monthCellAt(root, pointer.clientX, pointer.clientY)?.dataset.date : undefined
      const anchorDay = pointerCell ? new Date(pointerCell) : anchor ? new Date(anchor) : startOfDay(event[edge])
      const columnWidth =
        root?.querySelector<HTMLElement>("[data-slot=scheduler-day-column]")?.getBoundingClientRect().width ?? 1
      let current: Interaction = { id: event.id, type: "resize", start: event.start, end: event.end }
      setInteraction(current)
      track(
        (e) => {
          let proposed: Date
          if (axis === "time") {
            const delta = Math.round((e.clientY - originY) / minuteHeight / slotMinutes) * slotMinutes
            const day = edge === "end" ? startOfDay(new Date(event.end.getTime() - 1)) : startOfDay(event.start)
            proposed = new Date(
              clamp(
                addMinutes(event[edge], delta).getTime(),
                withMinutes(day, minHour * 60).getTime(),
                withMinutes(day, maxHour * 60).getTime()
              )
            )
          } else if (view === "week") {
            const deltaDays = Math.round((e.clientX - originX) / columnWidth)
            proposed = addDays(event[edge], deltaDays)
          } else {
            const cell = Array.from(root?.querySelectorAll<HTMLElement>(cellSelector) ?? []).find((el) => {
              const r = el.getBoundingClientRect()
              return (
                e.clientX >= r.left &&
                e.clientX < r.right &&
                (view !== "month" || (e.clientY >= r.top && e.clientY < r.bottom))
              )
            })
            if (!cell?.dataset.date) return
            proposed = addDays(event[edge], differenceInCalendarDays(new Date(cell.dataset.date), anchorDay))
          }
          current = { ...current, [edge]: resizeEndpoint(event, proposed, edge, axis, view, slotMinutes) }
          setInteraction(current)
        },
        () => {
          setInteraction(null)
          if (current.start.getTime() !== event.start.getTime() || current.end.getTime() !== event.end.getTime()) {
            onEventChangeRef.current?.({ id: event.id, start: current.start, end: current.end })
          }
        }
      )
    },
    [editable, track, view, minuteHeight, slotMinutes, minHour, maxHour]
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
          const anchor = withMinutes(day, originMin)
          const target = withMinutes(targetDay, min)
          const start = new Date(Math.min(anchor.getTime(), target.getTime()))
          const end = new Date(Math.max(anchor.getTime(), target.getTime(), addMinutes(start, slotMinutes).getTime()))
          current = { start, end }
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
      const root = (pointer.currentTarget as HTMLElement).closest("[data-slot=scheduler]")
      const cellDate = monthCellAt(root, pointer.clientX, pointer.clientY)?.dataset.date
      const originDay = cellDate ? new Date(cellDate) : startOfDay(event.start)
      let current: Interaction = { id: event.id, type: "move", start: event.start, end: event.end }
      let moved = false
      setActiveEvent(event.id)
      setInteraction(current)
      const cellAt = (x: number, y: number) => monthCellAt(root, x, y)?.dataset.date
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
        announce(
          "Picked up. Arrows move; Shift+arrows resize the end along the view’s time axis. Space drops, Escape cancels."
        )
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
    (event: EventLike, deltaMinutes: number, deltaDays: number, part: "both" | "start" | "end") => {
      if (!grabOrigin.current || grabOrigin.current.id !== event.id) {
        grabOrigin.current = { id: event.id, start: event.start, end: event.end }
      }
      const shifted = (date: Date) => addDays(addMinutes(date, deltaMinutes), deltaDays)
      const next =
        part === "start"
          ? {
              start: resizeEndpoint(
                event,
                shifted(event.start),
                "start",
                deltaDays ? "date" : "time",
                view,
                slotMinutes
              ),
              end: event.end,
            }
          : part === "end"
            ? {
                start: event.start,
                end: resizeEndpoint(event, shifted(event.end), "end", deltaDays ? "date" : "time", view, slotMinutes),
              }
            : { start: shifted(event.start), end: shifted(event.end) }
      onEventChangeRef.current?.({ id: event.id, ...next })
      announce(`${format(next.start, "EEE d, p")} to ${format(next.end, "EEE d, p")}.`)
    },
    [announce, slotMinutes, view]
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
      eventLayout,
      activeEvent,
      setActiveEvent,
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
      eventLayout,
      activeEvent,
      setActiveEvent,
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
      <ark.div
        data-slot="scheduler"
        data-view={view}
        data-interacting={interaction?.type ?? (creating ? "create" : undefined)}
        className={cn("@container/scheduler flex min-h-0 flex-1 flex-col gap-3", className)}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {children}
            <LiveRegion.Root data-slot="scheduler-live-region" message={announcement} />
          </>
        )}
      </ark.div>
    </SchedulerContext.Provider>
  )
}

/* ---------------------------------------------------------------------------
 * Toolbar
 * ------------------------------------------------------------------------- */

function SchedulerToolbar({ className, ...props }: SchedulerToolbarProps) {
  return (
    <ark.div data-slot="scheduler-toolbar" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
  )
}

function shift(date: Date, view: SchedulerView, direction: 1 | -1) {
  if (view === "day") return addDays(date, direction)
  if (view === "week") return addWeeks(date, direction)
  return addMonths(date, direction)
}

function SchedulerPrevTrigger({ asChild, children, onClick, ...props }: SchedulerPrevTriggerProps) {
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

function SchedulerNextTrigger({ asChild, children, onClick, ...props }: SchedulerNextTriggerProps) {
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

function SchedulerTodayTrigger({ asChild, children, onClick, ...props }: SchedulerTodayTriggerProps) {
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
function SchedulerTitle({ className, children, ...props }: SchedulerTitleProps) {
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
    <ark.h2
      data-slot="scheduler-title"
      className={cn(
        "min-w-0 flex-1 text-sm/5 font-medium whitespace-normal tabular-nums @min-[40rem]/scheduler:whitespace-nowrap",
        className
      )}
      {...props}
    >
      {props.asChild
        ? React.isValidElement(children)
          ? children
          : null
        : (children ??
          (view === "month" ? (
            <>
              <span className="@min-[40rem]/scheduler:hidden">{format(date, "MMM yyyy")}</span>
              <span className="hidden @min-[40rem]/scheduler:inline">{text}</span>
            </>
          ) : (
            text
          )))}
    </ark.h2>
  )
}

function SchedulerViewSelect({ className, ...props }: SchedulerViewSelectProps) {
  const { view, setView } = useScheduler()
  return (
    <SegmentGroup.Root
      data-slot="scheduler-view-select"
      value={view}
      onValueChange={({ value }) => value && setView(value as SchedulerView)}
      className={cn("ms-auto w-full justify-center @min-[40rem]/scheduler:w-auto", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value="day">Day</SegmentGroup.Item>
          <SegmentGroup.Item value="week">Week</SegmentGroup.Item>
          <SegmentGroup.Item value="month">Month</SegmentGroup.Item>
        </>
      )}
    </SegmentGroup.Root>
  )
}

/* ---------------------------------------------------------------------------
 * Time grid (day / week)
 * ------------------------------------------------------------------------- */

const GUTTER = "4rem"

function SchedulerTimeGrid({ className, style, ...props }: SchedulerTimeGridProps) {
  const { days } = useScheduler()
  return (
    <ark.div
      data-slot="scheduler-time-grid"
      className={cn("flex min-h-0 flex-1 flex-col overflow-auto rounded-xl border bg-background", className)}
      style={
        {
          "--scheduler-gutter": GUTTER,
          "--scheduler-grid-min": days.length > 1 ? `calc(${GUTTER} + ${days.length} * 9rem)` : "100%",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

function SchedulerTimeGridHeader({ className, ...props }: SchedulerTimeGridHeaderProps) {
  return (
    <ark.div
      data-slot="scheduler-time-grid-header"
      className={cn("sticky top-0 z-30 grid min-w-(--scheduler-grid-min) shrink-0 border-b bg-background", className)}
      style={{ gridTemplateColumns: "var(--scheduler-gutter) 1fr" }}
      {...props}
    />
  )
}

/** Day headings across the top, one per visible day. */
function SchedulerDayHeadings({ className, children, ...props }: SchedulerDayHeadingsProps) {
  const { days, view, setDate, setView } = useScheduler()
  return (
    <>
      <div aria-hidden className="sticky inset-s-0 z-10 border-e bg-background" />
      <ark.div
        data-slot="scheduler-day-headings"
        className={cn("grid", className)}
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {days.map((day) => (
              <button
                key={day.toISOString()}
                type="button"
                data-slot="scheduler-day-heading"
                data-today={isToday(day) ? "" : undefined}
                className={cn(
                  "group/heading flex h-10 items-center justify-center gap-1.5 border-e py-1.5 text-xs text-muted-foreground outline-none last:border-e-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  view !== "day" && "data-today:bg-muted/50"
                )}
                onClick={() => {
                  setDate(day)
                  setView("day")
                }}
              >
                {children ? (
                  typeof children === "function" ? (
                    children(day)
                  ) : (
                    children
                  )
                ) : (
                  <>
                    <span>{format(day, "EEE")}</span>
                    <span className="flex size-7 items-center justify-center rounded-lg text-sm font-medium text-foreground">
                      {format(day, "d")}
                    </span>
                  </>
                )}
              </button>
            ))}
          </>
        )}
      </ark.div>
    </>
  )
}

/** Strip under the headings for all-day events; render chips inside per day. */
function SchedulerAllDayRow({ className, children, ...props }: SchedulerAllDayRowProps) {
  const { days, view } = useScheduler()
  return (
    <>
      <div className="sticky inset-s-0 z-10 flex min-h-9 items-center justify-end border-e border-t bg-background px-2 py-1.5 text-xs text-muted-foreground">
        All day
      </div>
      <ark.div
        data-slot="scheduler-all-day-row"
        className={cn("grid border-t", className)}
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                data-slot="scheduler-all-day-cell"
                data-today={isToday(day) ? "" : undefined}
                className={cn(
                  "flex min-h-9 min-w-0 flex-col justify-center gap-1 border-e px-2 py-1.5 last:border-e-0",
                  view !== "day" && "data-today:bg-muted/50",
                  view === "week" && "text-center"
                )}
              >
                {typeof children === "function" ? children(day) : children}
              </div>
            ))}
          </>
        )}
      </ark.div>
    </>
  )
}

function SchedulerTimeGridBody({ className, children, ...props }: SchedulerTimeGridBodyProps) {
  const { bodyRef, hourHeight, minHour, maxHour } = useScheduler()
  // Scroll to a sensible hour on mount.
  React.useEffect(() => {
    const el = bodyRef.current?.closest("[data-slot=scheduler-time-grid]")
    if (el) el.scrollTop = Math.max(0, (8 - minHour) * hourHeight - 8)
  }, [bodyRef, hourHeight, minHour])
  return (
    <ark.div
      ref={bodyRef}
      data-slot="scheduler-time-grid-body"
      className={cn("relative min-w-(--scheduler-grid-min) shrink-0", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div
            className="grid"
            style={{ gridTemplateColumns: "var(--scheduler-gutter) 1fr", height: (maxHour - minHour) * hourHeight }}
          >
            {children}
          </div>
        </>
      )}
    </ark.div>
  )
}

function SchedulerTimeGutter({ className, ...props }: SchedulerTimeGutterProps) {
  const { hourHeight, minHour, maxHour } = useScheduler()
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i)
  return (
    <ark.div
      data-slot="scheduler-time-gutter"
      className={cn("sticky inset-s-0 z-20 border-e bg-background", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          {hours.map((h) => (
            <div
              key={h}
              className="absolute inset-e-2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums first:translate-y-0"
              style={{ top: (h - minHour) * hourHeight }}
            >
              {format(setHours(new Date(), h), "h a")}
            </div>
          ))}
        </>
      )}
    </ark.div>
  )
}

/** The columns container; hour lines are drawn behind. */
function SchedulerDayColumns({ className, children, ...props }: SchedulerDayColumnsProps) {
  const { days, hourHeight, minHour, maxHour } = useScheduler()
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => i)
  return (
    <ark.div
      data-slot="scheduler-day-columns"
      className={cn("relative isolate grid", className)}
      style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {hours.map((i) => (
              <div key={i} className="absolute inset-x-0 border-t border-border/70" style={{ top: i * hourHeight }} />
            ))}
          </div>
          {children}
        </>
      )}
    </ark.div>
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

/** One day. Pass the full event collection; intersecting timed events are clipped and laid out automatically. */
function SchedulerDayColumn<T extends EventLike>({
  date,
  events,
  className,
  children,
  onPointerDown,
  ...props
}: SchedulerDayColumnProps<T>) {
  const scheduler = useScheduler()
  const segments = events
    .filter((event) => !event.allDay)
    .flatMap<{ event: T; segment: Pick<EventLike, "start" | "end"> }>((event) => {
      const live = scheduler.interaction?.id === event.id ? scheduler.interaction : event
      if (scheduler.view === "week") {
        const segment = weekSegment(live, scheduler.days, scheduler.minHour, scheduler.maxHour)
        return segment && isSameDay(segment.day, date) ? [{ event, segment: live }] : []
      }
      const segment = daySegment(live, date, scheduler.minHour, scheduler.maxHour)
      return segment ? [{ event, segment }] : []
    })
  const layout = layoutLanes(
    scheduler.view === "week"
      ? events.map((event) => (scheduler.interaction?.id === event.id ? { ...event, ...scheduler.interaction } : event))
      : segments.map(({ event, segment }) => ({ ...event, start: segment.start, end: segment.end }))
  )
  const lanes =
    scheduler.view === "week"
      ? new Map(
          [...layout.entries()].sort(([a], [b]) => {
            const first = events.find((event) => event.id === a)!
            const second = events.find((event) => event.id === b)!
            return (
              differenceInMinutes(second.end, second.start) - differenceInMinutes(first.end, first.start) ||
              first.start.getTime() - second.start.getTime() ||
              a.localeCompare(b)
            )
          })
        )
      : layout
  const ctx = { day: date, lanes }
  return (
    <ColumnContext.Provider value={ctx}>
      <ark.div
        data-slot="scheduler-day-column"
        data-date={date.toISOString()}
        data-today={isToday(date) ? "" : undefined}
        className={cn(
          "relative border-e last:border-e-0",
          scheduler.view !== "day" && "data-today:bg-muted/50",
          className
        )}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest("[data-slot=scheduler-event]")) return
          scheduler.startCreate(date, event, scheduler.days)
        }}
        {...props}
      >
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            {segments.map(({ event }) => (
              <React.Fragment key={event.id}>
                {typeof children === "function" ? children(event) : children}
              </React.Fragment>
            ))}
          </>
        )}
      </ark.div>
    </ColumnContext.Provider>
  )
}

type SchedulerEventColor = "neutral" | "blue" | "green" | "amber" | "red" | "violet"
const eventColors: Record<SchedulerEventColor, string> = {
  neutral: "",
  blue: "border-blue-500/40 bg-blue-50 text-blue-950 hover:bg-blue-100 dark:border-blue-400/40 dark:bg-blue-950 dark:text-blue-100 dark:hover:bg-blue-900 [&_[data-slot=scheduler-event-time]]:text-current/70 [&_[data-slot=scheduler-event-resize-handle]]:bg-blue-500/40 [&_[data-slot=scheduler-event-resize-handle]]:after:bg-blue-500/60",
  green:
    "border-green-500/40 bg-green-50 text-green-950 hover:bg-green-100 dark:border-green-400/40 dark:bg-green-950 dark:text-green-100 dark:hover:bg-green-900 [&_[data-slot=scheduler-event-time]]:text-current/70 [&_[data-slot=scheduler-event-resize-handle]]:bg-green-500/40 [&_[data-slot=scheduler-event-resize-handle]]:after:bg-green-500/60",
  amber:
    "border-amber-500/40 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900 [&_[data-slot=scheduler-event-time]]:text-current/70 [&_[data-slot=scheduler-event-resize-handle]]:bg-amber-500/40 [&_[data-slot=scheduler-event-resize-handle]]:after:bg-amber-500/60",
  red: "border-red-500/40 bg-red-50 text-red-950 hover:bg-red-100 dark:border-red-400/40 dark:bg-red-950 dark:text-red-100 dark:hover:bg-red-900 [&_[data-slot=scheduler-event-time]]:text-current/70 [&_[data-slot=scheduler-event-resize-handle]]:bg-red-500/40 [&_[data-slot=scheduler-event-resize-handle]]:after:bg-red-500/60",
  violet:
    "border-violet-500/40 bg-violet-50 text-violet-950 hover:bg-violet-100 dark:border-violet-400/40 dark:bg-violet-950 dark:text-violet-100 dark:hover:bg-violet-900 [&_[data-slot=scheduler-event-time]]:text-current/70 [&_[data-slot=scheduler-event-resize-handle]]:bg-violet-500/40 [&_[data-slot=scheduler-event-resize-handle]]:after:bg-violet-500/60",
}
const MonthEventsContext = React.createContext<EventLike[] | null>(null)
const MonthDayContext = React.createContext<{ day: Date; lanes: Map<string, number> } | null>(null)
const translucentEvents: Record<SchedulerEventColor, string> = {
  neutral: "bg-background/60 hover:bg-muted/60",
  blue: "bg-blue-50/60 hover:bg-blue-100/60 dark:bg-blue-950/60 dark:hover:bg-blue-900/60",
  green: "bg-green-50/60 hover:bg-green-100/60 dark:bg-green-950/60 dark:hover:bg-green-900/60",
  amber: "bg-amber-50/60 hover:bg-amber-100/60 dark:bg-amber-950/60 dark:hover:bg-amber-900/60",
  red: "bg-red-50/60 hover:bg-red-100/60 dark:bg-red-950/60 dark:hover:bg-red-900/60",
  violet: "bg-violet-50/60 hover:bg-violet-100/60 dark:bg-violet-950/60 dark:hover:bg-violet-900/60",
}

const EventContext = React.createContext<EventLike | null>(null)

function SchedulerEvent({
  value,
  start,
  end,
  color = "neutral",
  className,
  style,
  children,
  onPointerDown,
  onKeyDown,
  onBlur,
  onFocus,
  ...props
}: SchedulerEventProps) {
  const s = useScheduler()
  const column = React.useContext(ColumnContext)
  const live = s.interaction?.id === value ? s.interaction : null
  const shownStart = live ? live.start : start
  const shownEnd = live ? live.end : end
  const week =
    s.view === "week" ? weekSegment({ start: shownStart, end: shownEnd }, s.days, s.minHour, s.maxHour) : null
  const segment =
    s.view === "week"
      ? week
      : daySegment({ start: shownStart, end: shownEnd }, column?.day ?? startOfDay(shownStart), s.minHour, s.maxHour)
  const lane = column?.lanes.get(value) ?? { lane: 0, lanes: 1 }
  const top = ((segment?.topMinutes ?? 0) * s.hourHeight) / 60
  const height = ((segment?.durationMinutes ?? 0) * s.hourHeight) / 60
  const stackOrder = Array.from(column?.lanes.keys() ?? []).indexOf(value) + 1
  const isGrabbed = s.grabbed === value
  const eventLike = React.useMemo(() => ({ id: value, start, end }), [value, start, end])
  if (!segment) return null
  return (
    <EventContext.Provider value={eventLike}>
      <ark.div
        {...props}
        data-slot="scheduler-event"
        data-value={value}
        data-color={color}
        data-layout={s.eventLayout}
        data-week-span={week?.span}
        data-week={week ? "" : undefined}
        data-active={s.activeEvent === value ? "" : undefined}
        data-dragging={live?.type}
        data-continues-before={segment.continuesBefore ? "" : undefined}
        data-continues-after={segment.continuesAfter ? "" : undefined}
        data-grabbed={isGrabbed ? "" : undefined}
        data-compact={height < 56 ? "" : undefined}
        data-tiny={height < 26 ? "" : undefined}
        data-spacious={height >= 80 ? "" : undefined}
        tabIndex={s.editable ? 0 : undefined}
        aria-pressed={s.editable ? isGrabbed : undefined}
        aria-label={`${format(shownStart, "EEE d, p")} to ${format(shownEnd, "EEE d, p")}`}
        className={cn(
          "group/event @container absolute flex min-w-0 flex-col gap-0.5 rounded-lg border border-border bg-background px-2 py-1.5 text-sm/5 text-foreground outline-none select-none hover:bg-muted data-compact:py-0.5 data-continues-after:rounded-b-none data-continues-before:rounded-t-none data-tiny:py-0 data-week:rounded-lg data-week:data-continues-after:rounded-r-none data-week:data-continues-before:rounded-l-none",
          s.editable && "cursor-grab active:cursor-grabbing",
          "focus-visible:ring-2 focus-visible:ring-ring/50 data-dragging:shadow-lg data-grabbed:ring-2 data-grabbed:ring-ring/50",
          eventColors[color],
          s.view === "week" && translucentEvents[color],
          className
        )}
        style={{
          top,
          height,
          left:
            s.eventLayout === "overlap" || (week && week.span > 1)
              ? 2
              : `calc(${(lane.lane / lane.lanes) * 100}% + 2px)`,
          width:
            week && week.span > 1
              ? `calc(${week.span * 100}% + ${week.span - 1}px - 4px)`
              : s.eventLayout === "overlap"
                ? "calc(100% - 4px)"
                : `calc(${100 / lane.lanes}% - 4px)`,
          zIndex:
            live || isGrabbed
              ? (column?.lanes.size ?? 0) + 3
              : s.activeEvent === value
                ? (column?.lanes.size ?? 0) + 2
                : stackOrder,
          ...style,
        }}
        onFocus={(event) => {
          onFocus?.(event)
          if (!event.defaultPrevented) s.setActiveEvent(value)
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented || event.button !== 0) return
          if ((event.target as HTMLElement).closest("[data-slot=scheduler-event-resize-handle], button, a")) return
          s.setActiveEvent(value)
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
            s.nudge(
              eventLike,
              0,
              event.key === "ArrowLeft" ? -1 : 1,
              event.shiftKey && s.view !== "day" ? "end" : "both"
            )
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
      </ark.div>
    </EventContext.Provider>
  )
}

function SchedulerEventTitle({ className, ...props }: SchedulerEventTitleProps) {
  return (
    <ark.div
      data-slot="scheduler-event-title"
      className={cn(
        "shrink-0 truncate font-medium group-data-spacious/event:line-clamp-2 group-data-spacious/event:whitespace-normal group-data-tiny/event:text-xs/3",
        className
      )}
      {...props}
    />
  )
}

/** "9:00 – 9:45 AM"; reflects the live drag. */
function SchedulerEventTime({ className, children, ...props }: SchedulerEventTimeProps) {
  const s = useScheduler()
  const e = React.useContext(EventContext)
  const column = React.useContext(ColumnContext)
  if (!e) return null
  const live = s.interaction?.id === e.id ? s.interaction : null
  const start = live ? live.start : e.start
  const end = live ? live.end : e.end
  const before = s.view !== "week" && column && start < startOfDay(column.day)
  const after = s.view !== "week" && column && end > addDays(startOfDay(column.day), 1)
  const label =
    s.view === "week" && !isSameDay(start, end)
      ? `${format(start, "MMM d, h:mm a")} – ${format(end, "MMM d, h:mm a")}`
      : before && after
        ? "Continues all day"
        : before
          ? `Until ${format(end, "h:mm a")}`
          : after
            ? `From ${format(start, "h:mm a")}`
            : `${format(start, "h:mm")} – ${format(end, "h:mm a")}`
  return (
    <ark.div
      data-slot="scheduler-event-time"
      className={cn(
        "shrink-0 truncate text-xs text-muted-foreground tabular-nums group-data-compact/event:hidden @max-[8rem]:hidden",
        className
      )}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? label}</>}
    </ark.div>
  )
}

/** Time handles resize top/bottom; date handles resize left/right. Week supports both axes. */
function SchedulerEventResizeHandle({
  edge = "end",
  axis,
  className,
  onPointerDown,
  onKeyDown,
  ...props
}: SchedulerEventResizeHandleProps) {
  const s = useScheduler()
  const e = React.useContext(EventContext)
  const column = React.useContext(ColumnContext)
  const monthDay = React.useContext(MonthDayContext)
  const live = s.interaction?.id === e?.id ? s.interaction : e
  const day = column?.day ?? monthDay?.day
  const resizeAxis = axis ?? (s.view === "day" ? "time" : "date")
  const vertical = resizeAxis === "time"
  const week = live && s.view === "week" ? weekSegment(live, s.days, s.minHour, s.maxHour) : null
  const segment =
    s.view === "week"
      ? week
      : live && day && s.view === "month"
        ? monthSegment(live, day, s.weekStartsOn)
        : live && day
          ? daySegment(live, day, vertical ? s.minHour : 0, vertical ? s.maxHour : 24)
          : null
  const continuation =
    week && vertical
      ? edge === "start"
        ? week.clippedTop
        : week.clippedBottom
      : edge === "start"
        ? segment?.continuesBefore
        : segment?.continuesAfter
  if (
    !s.editable ||
    !e ||
    (vertical && s.view === "month") ||
    (!vertical && s.view === "day") ||
    (day && (!segment || continuation))
  )
    return null
  const resizeValue = vertical ? minutesOfDay(e[edge]) : differenceInCalendarDays(e[edge], s.range.start)
  return (
    <ark.div
      {...props}
      data-slot="scheduler-event-resize-handle"
      data-edge={edge}
      data-axis={resizeAxis}
      role="separator"
      tabIndex={0}
      aria-label={`Resize event ${edge} ${resizeAxis}`}
      aria-orientation={vertical ? "horizontal" : "vertical"}
      aria-valuemin={Math.min(0, resizeValue)}
      aria-valuemax={Math.max(vertical ? 1440 : s.days.length, resizeValue)}
      aria-valuenow={resizeValue}
      aria-valuetext={format(e[edge], "MMM d, p")}
      className={cn(
        "absolute z-10 flex touch-none items-center justify-center bg-border outline-none before:absolute after:shrink-0 after:rounded-lg after:bg-border focus-visible:ring-2 focus-visible:ring-ring",
        vertical
          ? "inset-x-0 h-px cursor-ns-resize before:inset-x-0 before:-inset-y-1 after:h-1 after:w-6 after:max-w-[calc(100%-8px)]"
          : "inset-y-0 w-px cursor-ew-resize before:-inset-1 after:h-6 after:max-h-[calc(100%-8px)] after:w-1",
        vertical ? (edge === "start" ? "-top-px" : "-bottom-px") : edge === "start" ? "-left-px" : "-right-px",
        vertical && s.view === "week" && "inset-x-2",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        s.startResize(e, event, edge, resizeAxis)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        const negative = vertical ? "ArrowUp" : "ArrowLeft"
        const positive = vertical ? "ArrowDown" : "ArrowRight"
        if (event.key !== negative && event.key !== positive) return
        event.preventDefault()
        event.stopPropagation()
        const delta = event.key === negative ? -1 : 1
        const root = event.currentTarget.closest("[data-slot=scheduler]")
        s.nudge(e, vertical ? delta * s.slotMinutes : 0, vertical ? 0 : delta, edge)
        // A date resize can move this endpoint into another rendered day.
        requestAnimationFrame(() => {
          const handle = Array.from(
            root?.querySelectorAll<HTMLElement>("[data-slot=scheduler-event-resize-handle]") ?? []
          ).find(
            (el) =>
              el.dataset.edge === edge && el.dataset.axis === resizeAxis && el.parentElement?.dataset.value === e.id
          )
          const owner = Array.from(
            root?.querySelectorAll<HTMLElement>("[data-slot=scheduler-event], [data-slot=scheduler-month-event]") ?? []
          ).find((el) => el.dataset.value === e.id)
          ;(handle ?? owner)?.focus()
        })
      }}
    />
  )
}

/** Outline of the event being created by dragging; renders nothing when idle. */
function SchedulerCreatePreview({ className, children, ...props }: SchedulerCreatePreviewProps) {
  const s = useScheduler()
  if (!s.creating) return null
  if (s.view === "week") {
    const box = weekSegment(s.creating, s.days, s.minHour, s.maxHour)
    if (!box) return null
    return (
      <ark.div
        {...props}
        data-slot="scheduler-create-preview"
        aria-hidden
        className={cn(
          "pointer-events-none absolute z-20 rounded-md border-2 border-dashed border-primary/60 bg-primary/10 px-1.5 py-1 text-xs text-primary",
          className
        )}
        style={{
          top: (box.topMinutes * s.hourHeight) / 60,
          height: (box.durationMinutes * s.hourHeight) / 60,
          left: `calc(${(box.first / s.days.length) * 100}% + 2px)`,
          width: `calc(${(box.span / s.days.length) * 100}% - 4px)`,
        }}
      >
        {children ?? `${format(s.creating.start, "h:mm")} – ${format(s.creating.end, "h:mm a")}`}
      </ark.div>
    )
  }
  return (
    <>
      {s.days.map((day, index) => {
        const segment = daySegment(s.creating!, day, s.minHour, s.maxHour)
        if (!segment) return null
        return (
          <ark.div
            key={day.toISOString()}
            data-slot="scheduler-create-preview"
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-20 rounded-md border-2 border-dashed border-primary/60 bg-primary/10 px-1.5 py-1 text-xs text-primary tabular-nums",
              className
            )}
            style={{
              top: (segment.topMinutes * s.hourHeight) / 60,
              height: (segment.durationMinutes * s.hourHeight) / 60,
              left: `calc(${(index / s.days.length) * 100}% + 2px)`,
              width: `calc(${100 / s.days.length}% - 4px)`,
            }}
            {...props}
          >
            {props.asChild
              ? React.isValidElement(children)
                ? children
                : null
              : (children ?? `${format(segment.start, "h:mm")} – ${format(segment.end, "h:mm a")}`)}
          </ark.div>
        )
      })}
    </>
  )
}

/** Red line at the current time in today's column. */
function SchedulerNowIndicator({ className, ...props }: SchedulerNowIndicatorProps) {
  const s = useScheduler()
  const [now, setNow] = React.useState(() => new Date())
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  const index = s.days.findIndex((d) => isToday(d))
  if (index === -1) return null
  return (
    <ark.div
      data-slot="scheduler-now-indicator"
      aria-hidden
      className={cn("pointer-events-none absolute z-10 h-px bg-destructive", className)}
      style={{ top: s.timeToY(now), left: `${(index / s.days.length) * 100}%`, width: `${100 / s.days.length}%` }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <span className="absolute -top-1 -left-1 size-2 rounded-full bg-destructive" />
        </>
      )}
    </ark.div>
  )
}

/* ---------------------------------------------------------------------------
 * Month grid
 * ------------------------------------------------------------------------- */

function SchedulerMonthGrid({ className, ...props }: SchedulerMonthGridProps) {
  return (
    <ark.div
      data-slot="scheduler-month-grid"
      className={cn(
        "@container/month flex min-h-0 flex-initial flex-col overflow-hidden rounded-xl border bg-background @min-[40rem]/scheduler:flex-1",
        className
      )}
      {...props}
    />
  )
}

function SchedulerMonthHeader({ className, ...props }: SchedulerMonthHeaderProps) {
  const { days } = useScheduler()
  return (
    <ark.div
      data-slot="scheduler-month-header"
      className={cn("grid grid-cols-7 border-b bg-background text-xs text-muted-foreground", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          {days.slice(0, 7).map((d) => (
            <div
              key={d.toISOString()}
              aria-label={format(d, "EEEE")}
              className="flex aspect-square items-center justify-center border-e text-center font-medium last:border-e-0 @min-[40rem]/month:aspect-auto @min-[40rem]/month:h-10 @min-[40rem]/month:px-2 @min-[40rem]/month:py-1.5"
            >
              <span aria-hidden="true" className="@min-[40rem]/month:hidden">
                {format(d, "EEEEE")}
              </span>
              <span aria-hidden="true" className="hidden @min-[40rem]/month:inline">
                {format(d, "EEE")}
              </span>
            </div>
          ))}
        </>
      )}
    </ark.div>
  )
}

function SchedulerMonthBody({ className, children, events, ...props }: SchedulerMonthBodyProps) {
  const { days } = useScheduler()
  return (
    <MonthEventsContext.Provider value={events ?? null}>
      <ark.div
        data-slot="scheduler-month-body"
        className={cn(
          "grid min-h-0 flex-1 grid-cols-7 content-start overflow-y-auto @min-[40rem]/month:grid-rows-(--scheduler-month-rows) @min-[40rem]/month:content-normal",
          className
        )}
        style={
          {
            "--scheduler-month-rows": `repeat(${Math.ceil(days.length / 7)}, minmax(max-content, 1fr))`,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
        {!props.asChild && (
          <p
            data-slot="scheduler-month-hint"
            className="col-span-7 px-3 py-2 text-center text-xs text-muted-foreground @min-[40rem]/month:hidden"
          >
            Select a day to view its events.
          </p>
        )}
      </ark.div>
    </MonthEventsContext.Provider>
  )
}

function SchedulerMonthCell({ date, className, children, onClick, ...props }: SchedulerMonthCellProps) {
  const s = useScheduler()
  const suppliedEvents = React.useContext(MonthEventsContext)
  const events =
    suppliedEvents ??
    React.Children.toArray(children).flatMap((child) => {
      if (!React.isValidElement<SchedulerMonthEventProps>(child) || child.type !== SchedulerMonthEvent) return []
      return [{ id: child.props.value, start: child.props.start, end: child.props.end }]
    })
  const lanes = monthLanes(
    events.map((event) => (s.interaction?.id === event.id ? { ...event, ...s.interaction } : event)),
    date,
    s.weekStartsOn
  )
  const dayEvents = events.filter((event) => daySegment(event, date))
  const outside = !isSameMonth(date, s.date)
  return (
    <MonthDayContext.Provider value={{ day: date, lanes }}>
      <ark.div
        data-slot="scheduler-month-cell"
        data-date={date.toISOString()}
        data-today={isToday(date) ? "" : undefined}
        data-outside={outside ? "" : undefined}
        className={cn(
          "group/cell flex aspect-square min-h-0 min-w-0 flex-col border-e border-b text-xs data-outside:text-muted-foreground data-today:bg-muted/50 nth-[7n]:border-e-0 @min-[40rem]/month:aspect-auto @min-[40rem]/month:min-h-28 @min-[40rem]/month:gap-1 @min-[40rem]/month:nth-last-[-n+8]:border-b-0",
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
        {props.asChild ? (
          React.isValidElement(children) ? (
            children
          ) : null
        ) : (
          <>
            <button
              type="button"
              data-slot="scheduler-month-day"
              aria-label={`${format(date, "EEEE, MMMM d, yyyy")}, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`}
              className="flex size-full flex-col items-center justify-center gap-0.5 self-start rounded-sm text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset @min-[40rem]/month:mx-1.5 @min-[40rem]/month:mt-1.5 @min-[40rem]/month:mb-0.5 @min-[40rem]/month:size-7 @min-[40rem]/month:rounded-md"
              onClick={(event) => {
                event.stopPropagation()
                s.setDate(date)
                s.setView("day")
              }}
            >
              <span>{format(date, "d")}</span>
              <span
                aria-hidden="true"
                data-slot="scheduler-month-indicators"
                className="pointer-events-none flex h-2 items-center justify-center gap-1 @min-[40rem]/month:hidden"
              >
                {dayEvents.slice(0, 3).map((event) => (
                  <span key={event.id} className="size-1 rounded-full bg-foreground/50" />
                ))}
                {dayEvents.length > 3 && <span className="text-[10px]/2 text-muted-foreground">+</span>}
              </span>
            </button>
            <div
              className="hidden auto-rows-7 grid-cols-1 gap-1 pb-1.5 @min-[40rem]/month:grid"
              style={{ minHeight: lanes.size ? `${(Math.max(...lanes.values()) + 1) * 32 + 2}px` : undefined }}
            >
              {children}
            </div>
          </>
        )}
      </ark.div>
    </MonthDayContext.Provider>
  )
}

/** Continuous month bar, wrapping at calendar rows and draggable from any covered date. */
function SchedulerMonthEvent({
  value,
  start,
  end,
  color = "neutral",
  className,
  children,
  onPointerDown,
  onFocus,
  style,
  ...props
}: SchedulerMonthEventProps) {
  const s = useScheduler()
  const live = s.interaction?.id === value ? s.interaction : null
  const eventLike = React.useMemo(() => ({ id: value, start, end }), [value, start, end])
  const month = React.useContext(MonthDayContext)
  const shown = live ?? eventLike
  const segment = month ? monthSegment(shown, month.day, s.weekStartsOn) : null
  if (month && (!segment || !isSameDay(segment.day, month.day))) return null
  const lane = month?.lanes.get(value) ?? 0
  return (
    <EventContext.Provider value={eventLike}>
      <ark.div
        {...props}
        data-slot="scheduler-month-event"
        data-value={value}
        data-color={color}
        data-dragging={live ? "" : undefined}
        data-month-span={segment?.span}
        data-continues-before={segment?.continuesBefore ? "" : undefined}
        data-continues-after={segment?.continuesAfter ? "" : undefined}
        style={{
          gridRow: lane + 1,
          gridColumn: 1,
          marginInlineStart: 6,
          width: `calc(${(segment?.span ?? 1) * 100}% + ${(segment?.span ?? 1) - 1}px - 12px)`,
          zIndex: live ? 30 : s.activeEvent === value ? 20 : 1,
          ...style,
        }}
        onFocus={(event) => {
          onFocus?.(event)
          s.setActiveEvent(value)
        }}
        tabIndex={s.editable ? 0 : undefined}
        aria-label={`${format(shown.start, "EEE d, p")} to ${format(shown.end, "EEE d, p")}`}
        className={cn(
          "relative flex min-w-0 items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-xs/5 text-foreground outline-none select-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 data-continues-after:rounded-r-none data-continues-before:rounded-l-none",
          s.editable && "cursor-grab active:cursor-grabbing",
          eventColors[color],
          translucentEvents[color],
          className
        )}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            (event.target as HTMLElement).closest("[data-slot=scheduler-event-resize-handle]")
          )
            return
          s.startMonthMove(eventLike, event)
        }}
      >
        {children}
      </ark.div>
    </EventContext.Provider>
  )
}

function SchedulerMonthMore({ className, ...props }: SchedulerMonthMoreProps) {
  return (
    <ark.button
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

type SchedulerRootProps = Omit<React.ComponentProps<typeof ark.div>, "onChange"> & {
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
  /** Week defaults to overlapping stacks; day defaults to side-by-side lanes. */
  eventLayout?: "overlap" | "lanes"
  /** Called with `{ id, start, end }` snapped to `slotMinutes` after a move, resize, or keyboard change. */
  onEventChange?: (change: SchedulerEventChange) => void
  /** Drag on empty time (or a month cell click) proposes a new event. */
  onCreate?: (range: { start: Date; end: Date; allDay?: boolean }) => void
}

type SchedulerToolbarProps = React.ComponentProps<typeof ark.div>

type SchedulerPrevTriggerProps = React.ComponentProps<typeof Button>

type SchedulerNextTriggerProps = React.ComponentProps<typeof Button>

type SchedulerTodayTriggerProps = React.ComponentProps<typeof Button>

type SchedulerTitleProps = React.ComponentProps<typeof ark.h2>

type SchedulerViewSelectProps = Omit<React.ComponentProps<typeof SegmentGroup.Root>, "value" | "onValueChange">

type SchedulerTimeGridProps = React.ComponentProps<typeof ark.div>

type SchedulerTimeGridHeaderProps = React.ComponentProps<typeof ark.div>

type SchedulerDayHeadingsProps = React.ComponentProps<typeof ark.div> & {
  children?: ((day: Date) => React.ReactNode) | React.ReactElement
}

type SchedulerAllDayRowProps = Omit<React.ComponentProps<typeof ark.div>, "children"> & {
  children: ((day: Date) => React.ReactNode) | React.ReactElement
}

type SchedulerTimeGridBodyProps = React.ComponentProps<typeof ark.div>

type SchedulerTimeGutterProps = React.ComponentProps<typeof ark.div>

type SchedulerDayColumnsProps = React.ComponentProps<typeof ark.div>

type SchedulerDayColumnProps<T extends EventLike = EventLike> = Omit<
  React.ComponentProps<typeof ark.div>,
  "children"
> & {
  date: Date
  /** Full event collection; intersecting timed events are clipped and overlaps laid out automatically. */
  events: T[]
  children: ((event: T) => React.ReactNode) | React.ReactElement
}

type SchedulerEventProps = Omit<React.ComponentProps<typeof ark.div>, "color"> & {
  value: string
  start: Date
  end: Date
  color?: SchedulerEventColor
}

type SchedulerEventTitleProps = React.ComponentProps<typeof ark.div>

type SchedulerEventTimeProps = React.ComponentProps<typeof ark.div>

type SchedulerEventResizeHandleProps = React.ComponentProps<typeof ark.div> & {
  edge?: "start" | "end"
  /** Defaults to time in day view and date in week/month. Add both axes in week view. */
  axis?: "time" | "date"
}

type SchedulerCreatePreviewProps = React.ComponentProps<typeof ark.div>

type SchedulerNowIndicatorProps = React.ComponentProps<typeof ark.div>

type SchedulerMonthGridProps = React.ComponentProps<typeof ark.div>

type SchedulerMonthHeaderProps = React.ComponentProps<typeof ark.div>

type SchedulerMonthBodyProps = React.ComponentProps<typeof ark.div> & {
  /** Full collection for consistent spanning lanes, including custom event wrappers. */
  events?: EventLike[]
}

type SchedulerMonthCellProps = React.ComponentProps<typeof ark.div> & { date: Date }

type SchedulerMonthEventProps = SchedulerEventProps

type SchedulerMonthMoreProps = React.ComponentProps<typeof ark.button>

const Scheduler = {
  Root: SchedulerRoot,
  Toolbar: SchedulerToolbar,
  PrevTrigger: SchedulerPrevTrigger,
  NextTrigger: SchedulerNextTrigger,
  TodayTrigger: SchedulerTodayTrigger,
  Title: SchedulerTitle,
  ViewSelect: SchedulerViewSelect,
  TimeGrid: SchedulerTimeGrid,
  TimeGridHeader: SchedulerTimeGridHeader,
  DayHeadings: SchedulerDayHeadings,
  AllDayRow: SchedulerAllDayRow,
  TimeGridBody: SchedulerTimeGridBody,
  TimeGutter: SchedulerTimeGutter,
  DayColumns: SchedulerDayColumns,
  DayColumn: SchedulerDayColumn,
  Event: SchedulerEvent,
  EventTitle: SchedulerEventTitle,
  EventTime: SchedulerEventTime,
  EventResizeHandle: SchedulerEventResizeHandle,
  CreatePreview: SchedulerCreatePreview,
  NowIndicator: SchedulerNowIndicator,
  MonthGrid: SchedulerMonthGrid,
  MonthHeader: SchedulerMonthHeader,
  MonthBody: SchedulerMonthBody,
  MonthCell: SchedulerMonthCell,
  MonthEvent: SchedulerMonthEvent,
  MonthMore: SchedulerMonthMore,
}

export {
  Scheduler,
  useScheduler,
  layoutLanes,
  visibleRange,
  type SchedulerView,
  type SchedulerEventColor,
  type SchedulerEventChange,
  type SchedulerRootProps,
  type SchedulerToolbarProps,
  type SchedulerPrevTriggerProps,
  type SchedulerNextTriggerProps,
  type SchedulerTodayTriggerProps,
  type SchedulerTitleProps,
  type SchedulerViewSelectProps,
  type SchedulerTimeGridProps,
  type SchedulerTimeGridHeaderProps,
  type SchedulerDayHeadingsProps,
  type SchedulerAllDayRowProps,
  type SchedulerTimeGridBodyProps,
  type SchedulerTimeGutterProps,
  type SchedulerDayColumnsProps,
  type SchedulerDayColumnProps,
  type SchedulerEventProps,
  type SchedulerEventTitleProps,
  type SchedulerEventTimeProps,
  type SchedulerEventResizeHandleProps,
  type SchedulerCreatePreviewProps,
  type SchedulerNowIndicatorProps,
  type SchedulerMonthGridProps,
  type SchedulerMonthHeaderProps,
  type SchedulerMonthBodyProps,
  type SchedulerMonthCellProps,
  type SchedulerMonthEventProps,
  type SchedulerMonthMoreProps,
}

import * as React from "react"
import { addDays, addMinutes, format, isSameDay, setHours, setMinutes, startOfDay, startOfWeek } from "date-fns"
import { PlusIcon, Redo2Icon, Trash2Icon, Undo2Icon } from "lucide-react"
import { toast } from "sonner"
import { createListCollection } from "@ark-ui/react/collection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Scheduler,
  SchedulerAllDayRow,
  SchedulerCreatePreview,
  SchedulerDayColumn,
  SchedulerDayColumns,
  SchedulerDayHeadings,
  SchedulerEvent,
  SchedulerEventResizeHandle,
  SchedulerEventTime,
  SchedulerEventTitle,
  SchedulerMonthBody,
  SchedulerMonthCell,
  SchedulerMonthEvent,
  SchedulerMonthGrid,
  SchedulerMonthHeader,
  SchedulerMonthMore,
  SchedulerNextTrigger,
  SchedulerNowIndicator,
  SchedulerPrevTrigger,
  SchedulerTimeGrid,
  SchedulerTimeGridBody,
  SchedulerTimeGridHeader,
  SchedulerTimeGutter,
  SchedulerTitle,
  SchedulerTodayTrigger,
  SchedulerToolbar,
  SchedulerViewSelect,
  useScheduler,
  type SchedulerView,
} from "@/components/ui/scheduler"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useHistory } from "@/lib/history"
import { cn } from "@/lib/utils"

/* -------------------------------- data ---------------------------------- */

type Category = "meeting" | "focus" | "personal" | "deadline"
type CalendarEvent = { id: string; title: string; start: Date; end: Date; category: Category; allDay?: boolean }

const categories: { value: Category; label: string; className: string }[] = [
  { value: "meeting", label: "Meeting", className: "border-sky-500/40 bg-sky-500/15 text-sky-900 dark:text-sky-100" },
  {
    value: "focus",
    label: "Focus",
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100",
  },
  {
    value: "personal",
    label: "Personal",
    className: "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-900 dark:text-fuchsia-100",
  },
  {
    value: "deadline",
    label: "Deadline",
    className: "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100",
  },
]
const categoryClass = (c: Category) => categories.find((x) => x.value === c)?.className ?? ""
const categoryCollection = createListCollection({ items: categories, itemToValue: (c) => c.value })

const today = startOfDay(new Date())
const week = startOfWeek(today, { weekStartsOn: 1 })
const at = (day: Date, h: number, m = 0) => setMinutes(setHours(day, h), m)

let seq = 0
const uid = () => `ev-${Date.now().toString(36)}-${(seq++).toString(36)}`

function buildEvents(): CalendarEvent[] {
  const d = (offset: number) => addDays(week, offset)
  return [
    { id: "standup-1", title: "Team standup", start: at(d(0), 9, 30), end: at(d(0), 9, 45), category: "meeting" },
    { id: "focus-1", title: "Grid keyboard work", start: at(d(0), 10), end: at(d(0), 12), category: "focus" },
    { id: "lunch-1", title: "Lunch with Olivia", start: at(d(0), 12, 30), end: at(d(0), 13, 30), category: "personal" },
    { id: "standup-2", title: "Team standup", start: at(d(1), 9, 30), end: at(d(1), 9, 45), category: "meeting" },
    { id: "review", title: "Design review", start: at(d(1), 14), end: at(d(1), 15), category: "meeting" },
    { id: "sync", title: "Customer sync: Acme", start: at(d(1), 14, 30), end: at(d(1), 15, 30), category: "meeting" },
    { id: "standup-3", title: "Team standup", start: at(d(2), 9, 30), end: at(d(2), 9, 45), category: "meeting" },
    { id: "focus-2", title: "Scheduler polish", start: at(d(2), 13), end: at(d(2), 16), category: "focus" },
    { id: "gym", title: "Gym", start: at(d(2), 18), end: at(d(2), 19), category: "personal" },
    { id: "standup-4", title: "Team standup", start: at(d(3), 9, 30), end: at(d(3), 9, 45), category: "meeting" },
    { id: "planning", title: "Sprint planning", start: at(d(3), 11), end: at(d(3), 12, 30), category: "meeting" },
    { id: "one-on-one", title: "1:1 with Jackson", start: at(d(3), 16), end: at(d(3), 16, 30), category: "meeting" },
    { id: "release", title: "v2.15 release", start: d(4), end: d(4), category: "deadline", allDay: true },
    { id: "standup-5", title: "Team standup", start: at(d(4), 9, 30), end: at(d(4), 9, 45), category: "meeting" },
    { id: "retro", title: "Retro", start: at(d(4), 15), end: at(d(4), 16), category: "meeting" },
    { id: "offsite", title: "Offsite", start: d(7), end: d(8), category: "personal", allDay: true },
    { id: "standup-6", title: "Team standup", start: at(d(7), 9, 30), end: at(d(7), 9, 45), category: "meeting" },
    { id: "deadline-2", title: "Quarterly report due", start: d(10), end: d(10), category: "deadline", allDay: true },
  ]
}

const onDay = (event: CalendarEvent, day: Date) =>
  event.allDay ? startOfDay(event.start) <= day && day <= startOfDay(event.end) : isSameDay(event.start, day)

/* ------------------------------ event popover --------------------------- */

function EventPopover({
  event,
  children,
  onChange,
  onDelete,
}: {
  event: CalendarEvent
  children: React.ReactElement
  onChange: (patch: Partial<CalendarEvent>) => void
  onDelete: () => void
}) {
  return (
    <Popover positioning={{ placement: "right-start", gutter: 8 }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72" onPointerDown={(e) => e.stopPropagation()}>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor={`title-${event.id}`}>Title</FieldLabel>
            <Input
              id={`title-${event.id}`}
              value={event.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="h-8"
            />
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              collection={categoryCollection}
              value={[event.category]}
              onValueChange={({ value }) => value[0] && onChange({ category: value[0] as Category })}
            >
              <SelectControl>
                <SelectTrigger size="sm" className="w-full" aria-label="Category">
                  <SelectValue>{categories.find((c) => c.value === event.category)?.label}</SelectValue>
                </SelectTrigger>
              </SelectControl>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} item={c}>
                    <span className={cn("size-2.5 rounded-full border", c.className)} />
                    <SelectItemText>{c.label}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs text-muted-foreground tabular-nums">
            {event.allDay
              ? `${format(event.start, "EEE, MMM d")}${isSameDay(event.start, event.end) ? "" : ` – ${format(event.end, "EEE, MMM d")}`} · all day`
              : `${format(event.start, "EEE, MMM d · h:mm a")} – ${format(event.end, "h:mm a")}`}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="self-start text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2Icon /> Delete
          </Button>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------- views --------------------------------- */

function TimeView({
  events,
  onChange,
  onDelete,
}: {
  events: CalendarEvent[]
  onChange: (id: string, patch: Partial<CalendarEvent>) => void
  onDelete: (id: string) => void
}) {
  const { days } = useScheduler()
  return (
    <SchedulerTimeGrid>
      <SchedulerTimeGridHeader>
        <SchedulerDayHeadings />
        <SchedulerAllDayRow>
          {(day) =>
            events
              .filter((e) => e.allDay && onDay(e, day))
              .map((e) => (
                <EventPopover
                  key={e.id}
                  event={e}
                  onChange={(patch) => onChange(e.id, patch)}
                  onDelete={() => onDelete(e.id)}
                >
                  <button
                    type="button"
                    data-slot-event={e.id}
                    className={cn(
                      "truncate rounded-sm border px-1.5 text-left text-[11px]/5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      categoryClass(e.category)
                    )}
                  >
                    {e.title}
                  </button>
                </EventPopover>
              ))
          }
        </SchedulerAllDayRow>
      </SchedulerTimeGridHeader>
      <SchedulerTimeGridBody>
        <SchedulerTimeGutter />
        <SchedulerDayColumns>
          {days.map((day) => (
            <SchedulerDayColumn
              key={day.toISOString()}
              date={day}
              events={events.filter((e) => !e.allDay && onDay(e, day))}
            >
              {(e) => (
                <EventPopover event={e} onChange={(patch) => onChange(e.id, patch)} onDelete={() => onDelete(e.id)}>
                  <SchedulerEvent value={e.id} start={e.start} end={e.end} className={categoryClass(e.category)}>
                    <SchedulerEventTitle>{e.title}</SchedulerEventTitle>
                    <SchedulerEventTime />
                    <SchedulerEventResizeHandle />
                  </SchedulerEvent>
                </EventPopover>
              )}
            </SchedulerDayColumn>
          ))}
          <SchedulerNowIndicator />
          <SchedulerCreatePreview />
        </SchedulerDayColumns>
      </SchedulerTimeGridBody>
    </SchedulerTimeGrid>
  )
}

function MonthView({
  events,
  onChange,
  onDelete,
}: {
  events: CalendarEvent[]
  onChange: (id: string, patch: Partial<CalendarEvent>) => void
  onDelete: (id: string) => void
}) {
  const { days, setDate, setView } = useScheduler()
  const limit = 3
  return (
    <SchedulerMonthGrid>
      <SchedulerMonthHeader />
      <SchedulerMonthBody>
        {days.map((day) => {
          const dayEvents = events
            .filter((e) => onDay(e, day))
            .sort((a, b) => Number(!!b.allDay) - Number(!!a.allDay) || a.start.getTime() - b.start.getTime())
          const shown = dayEvents.slice(0, limit)
          return (
            <SchedulerMonthCell key={day.toISOString()} date={day}>
              {shown.map((e) => (
                <EventPopover
                  key={e.id}
                  event={e}
                  onChange={(patch) => onChange(e.id, patch)}
                  onDelete={() => onDelete(e.id)}
                >
                  <SchedulerMonthEvent value={e.id} start={e.start} end={e.end} className={categoryClass(e.category)}>
                    {!e.allDay && <span className="shrink-0 tabular-nums opacity-70">{format(e.start, "h:mm")}</span>}
                    <span className="truncate">{e.title}</span>
                  </SchedulerMonthEvent>
                </EventPopover>
              ))}
              {dayEvents.length > limit && (
                <SchedulerMonthMore
                  onClick={() => {
                    setDate(day)
                    setView("day")
                  }}
                >
                  +{dayEvents.length - limit} more
                </SchedulerMonthMore>
              )}
            </SchedulerMonthCell>
          )
        })}
      </SchedulerMonthBody>
    </SchedulerMonthGrid>
  )
}

/* --------------------------------- page --------------------------------- */

type Draft = { start: Date; end: Date; allDay?: boolean } | null

export function CalendarPage() {
  const history = useHistory<CalendarEvent[]>(buildEvents)
  const events = history.present
  const [view, setView] = React.useState<SchedulerView>("week")
  const [date, setDate] = React.useState(today)
  const [draft, setDraft] = React.useState<Draft>(null)
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftCategory, setDraftCategory] = React.useState<Category>("meeting")
  const [editable, setEditable] = React.useState(true)

  const change = (id: string, patch: Partial<CalendarEvent>) =>
    history.set((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const remove = (id: string) => {
    history.set((prev) => prev.filter((e) => e.id !== id))
    toast("Event deleted")
  }
  const create = () => {
    if (!draft || !draftTitle.trim()) return
    history.set((prev) => [...prev, { id: uid(), title: draftTitle.trim(), category: draftCategory, ...draft }])
    setDraft(null)
    setDraftTitle("")
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return
      if ((event.target as HTMLElement).closest("input, textarea, [contenteditable]")) return
      event.preventDefault()
      if (event.shiftKey) history.redo()
      else history.undo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [history])

  const inView = events.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Drag an event to move it, drag its bottom edge to change the end, or drag on empty time to create one.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={editable} onCheckedChange={({ checked }) => setEditable(checked)} />
            Editable
          </label>
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
          <Button
            onClick={() => {
              const start = setMinutes(setHours(date, Math.min(23, new Date().getHours() + 1)), 0)
              setDraft({ start, end: addMinutes(start, 60) })
            }}
          >
            <PlusIcon /> New event
          </Button>
        </div>
      </div>

      <Scheduler
        date={date}
        onDateChange={setDate}
        view={view}
        onViewChange={setView}
        editable={editable}
        minHour={6}
        maxHour={22}
        onEventChange={({ id, start, end }) => change(id, { start, end })}
        onCreate={(range) => setDraft(range)}
        className="min-h-0"
      >
        <SchedulerToolbar>
          <SchedulerPrevTrigger />
          <SchedulerNextTrigger />
          <SchedulerTodayTrigger />
          <SchedulerTitle className="ms-2" />
          <span className="ms-auto flex items-center gap-2">
            <Badge variant="secondary" className="tabular-nums">
              {inView} events
            </Badge>
            <SchedulerViewSelect />
          </span>
        </SchedulerToolbar>
        {view === "month" ? (
          <MonthView events={events} onChange={change} onDelete={remove} />
        ) : (
          <TimeView events={events} onChange={change} onDelete={remove} />
        )}
      </Scheduler>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          {categories.map((c) => (
            <span key={c.value} className="flex items-center gap-1">
              <span className={cn("size-2.5 rounded-full border", c.className)} />
              {c.label}
            </span>
          ))}
        </span>
        <span className="ml-auto hidden items-center gap-3 md:flex">
          <KbdGroup>
            <Kbd>Space</Kbd>
            <span>pick up</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>15 min</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <span>a day</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⇧</Kbd>
            <span>end</span>
          </KbdGroup>
        </span>
      </div>

      <Dialog open={!!draft} onOpenChange={({ open }) => !open && setDraft(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
            <DialogDescription>
              {draft &&
                (draft.allDay
                  ? `${format(draft.start, "EEE, MMM d")} · all day`
                  : `${format(draft.start, "EEE, MMM d · h:mm a")} – ${format(draft.end, "h:mm a")}`)}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              create()
            }}
          >
            <Field>
              <FieldLabel htmlFor="draft-title">Title</FieldLabel>
              <Input
                id="draft-title"
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="What is it?"
              />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                collection={categoryCollection}
                value={[draftCategory]}
                onValueChange={({ value }) => value[0] && setDraftCategory(value[0] as Category)}
              >
                <SelectControl>
                  <SelectTrigger className="w-full" aria-label="Category">
                    <SelectValue>{categories.find((c) => c.value === draftCategory)?.label}</SelectValue>
                  </SelectTrigger>
                </SelectControl>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} item={c}>
                      <span className={cn("size-2.5 rounded-full border", c.className)} />
                      <SelectItemText>{c.label}</SelectItemText>
                      <SelectItemIndicator />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!draftTitle.trim()}>
                Add event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

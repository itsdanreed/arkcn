import { useState } from "react"
import { isSameDay } from "date-fns"
import { Scheduler, useScheduler, type SchedulerEventColor } from "@/components/ui/scheduler"
import { Button } from "@/components/ui/button"

type Event = { id: string; title: string; start: Date; end: Date; color?: SchedulerEventColor }
const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute)
const initial: Event[] = [
  { id: "standup", color: "blue", title: "Standup", start: at(14, 9), end: at(14, 9, 30) },
  { id: "design", color: "violet", title: "Design review", start: at(14, 10), end: at(14, 11, 30) },
  { id: "research", color: "amber", title: "Research", start: at(14, 10, 30), end: at(14, 11) },
  { id: "offsite", color: "green", title: "Team offsite", start: at(14, 14), end: at(16, 10) },
  { id: "planning", color: "red", title: "Planning", start: at(15, 12), end: at(15, 13) },
]
function Grid({ events }: { events: Event[] }) {
  const { days, view } = useScheduler()
  if (view === "month")
    return (
      <Scheduler.MonthGrid>
        <Scheduler.MonthHeader />
        <Scheduler.MonthBody events={events}>
          {days.map((day) => (
            <Scheduler.MonthCell key={day.toISOString()} date={day}>
              {events.map((e) => (
                <Scheduler.MonthEvent key={e.id} value={e.id} start={e.start} end={e.end} color={e.color}>
                  <span className="min-w-0 truncate">{e.title}</span>
                  <Scheduler.EventResizeHandle edge="start" />
                  <Scheduler.EventResizeHandle edge="end" />
                </Scheduler.MonthEvent>
              ))}
            </Scheduler.MonthCell>
          ))}
        </Scheduler.MonthBody>
      </Scheduler.MonthGrid>
    )
  return (
    <Scheduler.TimeGrid>
      <Scheduler.TimeGridHeader>
        <Scheduler.DayHeadings />
        <Scheduler.AllDayRow>
          {(day) => (isSameDay(day, at(14, 0)) ? <span className="truncate px-1 text-xs">Release day</span> : null)}
        </Scheduler.AllDayRow>
      </Scheduler.TimeGridHeader>
      <Scheduler.TimeGridBody>
        <Scheduler.TimeGutter />
        <Scheduler.DayColumns>
          {days.map((day) => (
            <Scheduler.DayColumn key={day.toISOString()} date={day} events={events}>
              {(e) => (
                <Scheduler.Event value={e.id} start={e.start} end={e.end} color={e.color}>
                  <Scheduler.EventTitle>{e.title}</Scheduler.EventTitle>
                  <Scheduler.EventTime />
                  <Scheduler.EventResizeHandle edge="start" />
                  <Scheduler.EventResizeHandle edge="end" />
                  {view === "week" && (
                    <>
                      <Scheduler.EventResizeHandle edge="start" axis="time" />
                      <Scheduler.EventResizeHandle edge="end" axis="time" />
                    </>
                  )}
                </Scheduler.Event>
              )}
            </Scheduler.DayColumn>
          ))}
          <Scheduler.CreatePreview />
        </Scheduler.DayColumns>
      </Scheduler.TimeGridBody>
    </Scheduler.TimeGrid>
  )
}
export default function Example() {
  const [events, setEvents] = useState(initial)
  const [editable, setEditable] = useState(true)
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditable(!editable)}>
          {editable ? "Read only" : "Edit"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEvents(events.length ? [] : initial)}>
          {events.length ? "Empty" : "Restore events"}
        </Button>
      </div>
      <Scheduler.Root
        defaultDate={at(14, 0)}
        defaultView="day"
        minHour={8}
        maxHour={15}
        hourHeight={56}
        editable={editable}
        className="h-128"
        onEventChange={({ id, start, end }) =>
          setEvents((es) => es.map((e) => (e.id === id ? { ...e, start, end } : e)))
        }
        onCreate={({ start, end }) =>
          setEvents((es) => [...es, { id: String(Date.now()), title: "New event", start, end }])
        }
      >
        <Scheduler.Toolbar>
          <Scheduler.PrevTrigger />
          <Scheduler.NextTrigger />
          <Scheduler.TodayTrigger />
          <Scheduler.Title className="ms-1" />
          <Scheduler.ViewSelect />
        </Scheduler.Toolbar>
        <Grid events={events} />
      </Scheduler.Root>
      <output hidden data-audit-events>
        {JSON.stringify(events)}
      </output>
    </div>
  )
}

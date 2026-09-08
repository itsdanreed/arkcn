import * as React from "react"
import { Scheduler, useScheduler } from "@/components/ui/scheduler"

type Event = { id: string; title: string; start: Date; end: Date }

const today = new Date()
const at = (dayOffset: number, hour: number, minutes = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minutes, 0, 0)
  return d
}
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

function Week({ events }: { events: Event[] }) {
  const { days } = useScheduler()
  return (
    <Scheduler.TimeGrid>
      <Scheduler.TimeGridHeader>
        <Scheduler.DayHeadings />
      </Scheduler.TimeGridHeader>
      <Scheduler.TimeGridBody>
        <Scheduler.TimeGutter />
        <Scheduler.DayColumns>
          {days.map((day) => (
            <Scheduler.DayColumn
              key={day.toISOString()}
              date={day}
              events={events.filter((e) => sameDay(e.start, day))}
            >
              {(e) => (
                <Scheduler.Event value={e.id} start={e.start} end={e.end} className="border-sky-500/40 bg-sky-500/15">
                  <Scheduler.EventTitle>{e.title}</Scheduler.EventTitle>
                  <Scheduler.EventTime />
                  <Scheduler.EventResizeHandle />
                </Scheduler.Event>
              )}
            </Scheduler.DayColumn>
          ))}
          <Scheduler.NowIndicator />
        </Scheduler.DayColumns>
      </Scheduler.TimeGridBody>
    </Scheduler.TimeGrid>
  )
}

export default function SchedulerExample() {
  const [events, setEvents] = React.useState<Event[]>([
    { id: "standup", title: "Standup", start: at(0, 9), end: at(0, 9, 30) },
    { id: "design", title: "Design review", start: at(0, 11), end: at(0, 12) },
    { id: "lunch", title: "Team lunch", start: at(1, 12, 30), end: at(1, 13, 30) },
    { id: "planning", title: "Sprint planning", start: at(2, 14), end: at(2, 15, 30) },
  ])
  return (
    <Scheduler.Root
      defaultView="week"
      minHour={7}
      maxHour={19}
      editable
      onEventChange={({ id, start, end }) =>
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, start, end } : e)))
      }
      className="h-112 w-full"
    >
      <Scheduler.Toolbar>
        <Scheduler.PrevTrigger />
        <Scheduler.NextTrigger />
        <Scheduler.TodayTrigger />
        <Scheduler.Title className="ms-2" />
      </Scheduler.Toolbar>
      <Week events={events} />
    </Scheduler.Root>
  )
}

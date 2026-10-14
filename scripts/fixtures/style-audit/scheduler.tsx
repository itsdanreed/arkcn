// Related shadcn controls, not an upstream scheduler. Calendar layout and event placement are fixture-authored.
import { useState } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Item } from "../ui/item"
const anchor = new Date(2026, 9, 14)
const events = [
  { day: 14, title: "Standup", top: 56, height: 28 },
  { day: 14, title: "Design review", top: 112, height: 84 },
  { day: 14, title: "Research", top: 140, height: 28 },
  { day: 15, title: "Planning", top: 224, height: 56 },
]
export default function Example() {
  const [date, setDate] = useState(anchor)
  const [view, setView] = useState("day")
  const [empty, setEmpty] = useState(false)
  const [editable, setEditable] = useState(true)
  const range =
    view === "day"
      ? [date]
      : eachDayOfInterval({
          start: startOfWeek(view === "month" ? startOfMonth(date) : date, { weekStartsOn: 1 }),
          end: endOfWeek(view === "month" ? endOfMonth(date) : date, { weekStartsOn: 1 }),
        })
  const shift = (amount: number) =>
    setDate(view === "day" ? addDays(date, amount) : view === "week" ? addWeeks(date, amount) : addMonths(date, amount))
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditable(!editable)}>
          {editable ? "Read only" : "Edit"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEmpty(!empty)}>
          {empty ? "Restore events" : "Empty"}
        </Button>
      </div>
      <div className="flex h-128 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label={`Previous ${view}`} onClick={() => shift(-1)}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label={`Next ${view}`} onClick={() => shift(1)}>
            <ChevronRightIcon />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
            <CalendarIcon />
            Today
          </Button>
          <h2 className="ms-1 text-sm font-medium">
            {view === "day"
              ? format(date, "EEEE, MMM d, yyyy")
              : view === "month"
                ? format(date, "MMMM yyyy")
                : `${format(range[0], "MMM d")} – ${format(range[6], "d, yyyy")}`}
          </h2>
          <Tabs value={view} onValueChange={(v) => setView(String(v))}>
            <TabsList>
              {["day", "week", "month"].map((v) => (
                <TabsTrigger value={v} key={v}>
                  {v[0].toUpperCase() + v.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {view === "month" ? (
          <div className="grid min-h-0 flex-1 grid-cols-7 overflow-auto rounded-xl border">
            {range.map((day) => (
              <div key={String(day)} className="min-h-24 min-w-0 border-e border-b p-1">
                <Button
                  variant={isSameDay(day, new Date()) ? "secondary" : "ghost"}
                  size="icon-xs"
                  onClick={() => {
                    setDate(day)
                    setView("day")
                  }}
                >
                  {day.getDate()}
                </Button>
                {!empty &&
                  events
                    .filter((e) => isSameDay(day, new Date(2026, 9, e.day)))
                    .map((e) => (
                      <Item key={e.title} variant="outline" size="xs" className="mt-1 truncate px-1.5 py-px text-xs">
                        {e.title}
                      </Item>
                    ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background">
            <div
              className="grid border-b"
              style={{ gridTemplateColumns: `56px repeat(${range.length},minmax(0,1fr))` }}
            >
              <div className="border-e" />
              {range.map((day) => (
                <div
                  key={String(day)}
                  className="flex flex-col items-center border-e py-2 text-xs text-muted-foreground last:border-e-0"
                >
                  <span>{format(day, "EEE")}</span>
                  <Button
                    variant={isSameDay(day, new Date()) ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => {
                      setDate(day)
                      setView("day")
                    }}
                  >
                    {day.getDate()}
                  </Button>
                </div>
              ))}
            </div>
            <div
              className="grid border-b text-xs"
              style={{ gridTemplateColumns: `56px repeat(${range.length},minmax(0,1fr))` }}
            >
              <span className="border-e px-1.5 py-1 text-muted-foreground">All day</span>
              {range.map((day) => (
                <span key={String(day)} className="truncate border-e p-1 last:border-e-0">
                  {isSameDay(day, anchor) ? "Release day" : ""}
                </span>
              ))}
            </div>
            <div
              className="grid min-h-0 flex-1 overflow-auto"
              style={{ gridTemplateColumns: `56px repeat(${range.length},minmax(0,1fr))` }}
            >
              <div className="relative h-98 border-e">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} className="absolute right-1.5 text-xs text-muted-foreground" style={{ top: i * 56 }}>
                    {format(new Date(2026, 9, 14, 8 + i), "ha")}
                  </span>
                ))}
              </div>
              {range.map((day) => (
                <div key={String(day)} className="relative h-98 border-e last:border-e-0">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className="absolute inset-x-0 border-t" style={{ top: i * 56 }} />
                  ))}
                  {!empty &&
                    events
                      .filter((e) => isSameDay(day, new Date(2026, 9, e.day)))
                      .map((e) => (
                        <Item
                          key={e.title}
                          variant="outline"
                          size="xs"
                          className="absolute overflow-hidden px-1.5 py-1 text-xs"
                          style={{
                            top: e.top,
                            height: e.height,
                            left: e.title === "Research" ? "51%" : 2,
                            width:
                              e.title === "Design review" || e.title === "Research"
                                ? "calc(50% - 4px)"
                                : "calc(100% - 4px)",
                          }}
                        >
                          <span className="truncate font-medium">{e.title}</span>
                        </Item>
                      ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

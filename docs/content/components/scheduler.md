## How it works

The scheduler is a calendar with day, week, and month views. You own the events and render them with the parts; the root owns the anchor `date` and `view` (both controllable), the time-grid geometry (`hourHeight`, `slotMinutes`, `minHour`, `maxHour`, `weekStartsOn`), and the interactions. It reports `onEventChange({ id, start, end })` snapped to `slotMinutes` and `onCreate({ start, end })` when the user drags across empty time.

## Time grid

`Scheduler.TimeGrid` has a header with `Scheduler.DayHeadings` (click a day to open it) and `Scheduler.AllDayRow`, then a time body; the grid scrolls to the morning on mount with `Scheduler.TimeGutter` and `Scheduler.DayColumns`. Render one `SchedulerDayColumn date= events=` per day from `useScheduler().days`; its render-prop child gets each event and returns a `SchedulerEvent value= start= end=` with `Scheduler.EventTitle`, `Scheduler.EventTime`, and `Scheduler.EventResizeHandle`. Pass the full event collection to each column. Day view clips timed events to the visible date and hours, including events that started earlier. Week view renders each event once: one continuous block spans its date columns, while its clock range determines its height. Extending an edge horizontally preserves the clock range. Events extending outside the visible week are clipped to its edges. A range whose ending clock time precedes its starting clock time spans the full visible height; its label shows the actual start/end dates and times. Day view uses side-by-side lanes; week view uses overlapping stacks with aligned left and right edges. Week stacks place longer events behind shorter events, with start time and event ID breaking ties. Day lanes sort chronologically. Focusing or dragging an event brings it to the front. Set `eventLayout="lanes"` or `eventLayout="overlap"` on the root to override the view default. Event end dates are exclusive: an event ending at midnight does not appear on the following day. `Scheduler.NowIndicator` draws the current time line.

## Month grid

`Scheduler.MonthGrid` with `Scheduler.MonthHeader` and `Scheduler.MonthBody events={events}` renders `SchedulerMonthCell date=` cells. Pass the full collection to the body for consistent event lanes, and render the collection as `MonthEvent` parts in each cell using original start/end dates. Each event renders once per calendar row as a continuous bar across its dates; it continues on the next row only when it crosses a week boundary. Overlapping date ranges occupy separate lanes, and busy calendar rows grow to fit them. Direct `MonthEvent` children can also supply lane information when the body’s `events` prop is omitted; pass `events` when using custom wrappers. Bars move by whole days, preserving the date under the pickup point. Only actual endpoints have resize handles. `Scheduler.MonthMore` remains available for consumer-controlled overflow.

## Keyboard

On a focused event: Space or Enter picks it up, up and down move by one slot, left and right move by a day, Shift with up and down changes the end time in day/week views; Shift with left and right changes the end date in week view. Escape cancels a picked-up move. Each resize handle is also focusable: time-axis handles use up/down to adjust an endpoint by `slotMinutes`; date-axis handles use left/right to adjust it by one day. A live region announces the result.

## Notes

- Event parts spread your props first, so a `PopoverTrigger asChild` wrapper cannot override their pointer handlers or `data-slot`.
- The toolbar is composed from `Scheduler.PrevTrigger`, `Scheduler.NextTrigger`, `Scheduler.TodayTrigger`, `Scheduler.Title`, and `Scheduler.ViewSelect`.

## Appearance

Events default to the shared neutral background and border tokens. Both `Event` and `MonthEvent` accept `color="neutral" | "blue" | "green" | "amber" | "red" | "violet"`. Colors include coordinated surfaces, borders, text, hover states, and grips for light and dark themes. Use the same color for an event across views; keep a visible title so color is not its only identifier. `className` remains available for custom palettes. Event titles use 14px text, with two-line wrapping when the event has enough height. Events below 56px, or narrower than 8rem, hide the visual time while retaining their accessible time label. Very short slots use a 12px line without vertical padding so their title fits without changing time geometry.

Render `EventResizeHandle edge="start"` and `EventResizeHandle edge="end"` inside each event or month chip. In day view, the handles sit at the top and bottom and change times in `slotMinutes` increments. In week and month views, they sit at the left and right and change dates by whole days, preserving the endpoint’s time of day. Week view also supports `axis="time"` handles at the top and bottom, so it can expose all four edges. Month view only supports date resizing. Endpoints cannot cross; the minimum duration is one slot. Week time resizing also keeps a forward clock range at least one slot tall.

Handles use Resizable’s 1px divider and 24×4px rounded grip (rotated on vertical edges), with an expanded pointer target and keyboard focus ring. Date handles appear only at visible date endpoints; week time handles resize the clock band. Day continuation boundaries do not expose time handles. Read-only events have no handles or grab cursor. Moving any segment preserves the full duration. Drag across empty day columns to create a multi-day event. All-day strips remain consumer-rendered. Week-view all-day labels are centered.

The all-day label and hourly labels share a 4rem gutter and consistent inset. Week columns have a 9rem minimum width; narrow containers scroll the headings and time grid horizontally together. The time gutter, header corner, and all-day label stay pinned horizontally, and the day header stays pinned vertically. Headers use the background token; only the current day in week and month views has a muted gray surface. Day view keeps a neutral background throughout. Set `--scheduler-grid-min` on `TimeGrid` to override that minimum. Month rows grow with their event lanes above a 7rem minimum height, with more space between date labels and event chips. Month cells retain one outer bottom border, including the last row.

For four-edge resizing in week view, render both axes for each endpoint:

```tsx
<Scheduler.EventResizeHandle edge="start" axis="date" />
<Scheduler.EventResizeHandle edge="end" axis="date" />
<Scheduler.EventResizeHandle edge="start" axis="time" />
<Scheduler.EventResizeHandle edge="end" axis="time" />
```

Week and month event backgrounds use 60% opacity in both themes, including hover states, so grid lines remain visible beneath them. Labels, borders, and resize handles stay fully opaque. Day events retain their solid surfaces.

Below a 40rem calendar width, month view uses matching square weekday headers and date cells with event indicators instead of squeezed event bars. Each date announces its event count and opens day view when selected. Weekday labels shorten visually while retaining their full accessible names. The toolbar places the view selector on its own row and abbreviates the month title; wide calendars retain the spanning bars.

Month view sizes itself to all calendar rows and event lanes, without an internal scrollbar on desktop or mobile. The root uses automatic height in month view; day and week retain their bounded, scrollable time grids.

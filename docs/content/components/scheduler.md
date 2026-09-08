## How it works

The scheduler is a calendar with day, week, and month views. You own the events and render them with the parts; the root owns the anchor `date` and `view` (both controllable), the time-grid geometry (`hourHeight`, `slotMinutes`, `minHour`, `maxHour`, `weekStartsOn`), and the interactions. It reports `onEventChange({ id, start, end })` snapped to `slotMinutes` and `onCreate({ start, end })` when the user drags across empty time.

## Time grid

`Scheduler.TimeGrid` has a header with `Scheduler.DayHeadings` (click a day to open it) and `Scheduler.AllDayRow`, then a body that scrolls to the morning on mount with `Scheduler.TimeGutter` and `Scheduler.DayColumns`. Render one `SchedulerDayColumn date= events=` per day from `useScheduler().days`; its render-prop child gets each event and returns a `SchedulerEvent value= start= end=` with `Scheduler.EventTitle`, `Scheduler.EventTime`, and `Scheduler.EventResizeHandle`. Overlapping events are laid out side by side automatically. `Scheduler.NowIndicator` draws the current time line.

## Month grid

`Scheduler.MonthGrid` with `Scheduler.MonthHeader` and `Scheduler.MonthBody` renders `SchedulerMonthCell date=` cells; `Scheduler.MonthEvent` chips drag between cells and shift by whole days, and `Scheduler.MonthMore` shows the overflow.

## Keyboard

On a focused event: Space or Enter picks it up, up and down move by one slot, left and right move by a day, Shift with up and down changes the end, Escape cancels. A live region announces the result.

## Notes

- Event parts spread your props first, so a `PopoverTrigger asChild` wrapper cannot override their pointer handlers or `data-slot`.
- The toolbar is composed from `Scheduler.PrevTrigger`, `Scheduler.NextTrigger`, `Scheduler.TodayTrigger`, `Scheduler.Title`, and `Scheduler.ViewSelect`.

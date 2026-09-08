## How it works

You own the rows, bars, milestones, and dependency links; the timeline owns the time scale and the interactions. `Gantt.Root` takes the visible range as `start` and `end`, a `dayWidth` that zooming changes (controllable), and reports `onBarChange({ id, start, end })` snapped to whole days after a drag, resize, or keyboard move.

## Parts

`Gantt.Viewport` is the single scroll container for both axes. `Gantt.Header` is the sticky two-tier date header, with tiers chosen by the scale: days under a week row when zoomed in, weeks under months when zoomed out. `Gantt.Body` holds `Gantt.GridLines` with weekend shading, `Gantt.Today`, and `Gantt.Rows`. Each `GanttRow value=` has a sticky `Gantt.RowLabel` and a `Gantt.RowTrack` containing a `GanttBar value= start= end= progress=` with a `Gantt.BarLabel` and `GanttBarResizeHandle side=` on each end, or a `GanttMilestone value= date=`. `GanttDependencies links=` draws orthogonal arrows between bars; positions are measured from the DOM, so collapsed groups and custom row order need no bookkeeping. `Gantt.Controls` holds the zoom and today triggers.

## Keyboard

On a focused bar: Space or Enter picks it up, left and right move it a day, Shift with left and right changes the end, Alt with left and right changes the start, Escape cancels. A live region announces the result.

## Notes

- `useGantt()` exposes `xOf`, `dateAt`, and `scrollToDate` for custom overlays and a scroll-to-today on mount.
- Bars register by timestamp, not by `Date` identity, so re-created dates do not re-register.

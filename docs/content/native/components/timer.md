## How it works

Timer renders the same muted number blocks, monospace typography, spacing, and standard Button controls as the web component. It supports count-up and countdown modes, `startMs`, `targetMs`, `autoStart`, `interval`, `onTick`, and `onComplete`.

`useTimer` exposes `value`, `time`, `formattedTime`, `running`, `paused`, `progressPercent`, and `start`, `pause`, `resume`, `reset`, and `restart`. Use `RootProvider` with this API or `Root` for internal state. `Context` provides render access. `progressPercent` is a fraction from 0 to 1, decreasing for countdowns. An unbounded count-up has no progress target.

`Item type` accepts `days`, `hours`, `minutes`, `seconds`, or `milliseconds`. Days/hours/minutes/seconds are padded to two digits; milliseconds use three. `Area` exposes one accessible timer label, customizable through `translations.areaLabel`; it does not announce every tick. `Separator` is decorative.

`ActionTrigger` hides actions that do not apply: Start while running/paused, Pause while stopped, Resume unless paused, and Reset while idle. Restart is always available. It takes native Button props directly, including `variant`, `size`, `disabled`, and `onPress`; no `asChild` is needed. Reset while running restarts the interval from `startMs` and keeps running, matching web. Reset while paused returns to idle. Changing start, target, or counting direction restarts the timer.

Elapsed time comes from a wall-clock anchor, so delayed JavaScript callbacks do not accumulate drift. A foreground lifecycle event catches up after suspension and reports completion once. Pausing captures the exact elapsed duration between display ticks. Completion is reported at the first update that reaches the target, including the final clamped `onTick`. This is a display timer, not a background alarm: callbacks are not guaranteed while the app is suspended, and state is not persisted after termination.

Both themes use shared tokens. Digits swap directly, matching the web component; Button feedback follows the reduced-motion preference. Native platform monospace fonts are used. Screen-reader behavior and Android visuals still need device verification.

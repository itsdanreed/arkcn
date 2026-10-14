import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL(`packages/react/src/${specifier.slice(2)}`, root))
      const file = [base, `${base}.tsx`, `${base}.ts`].find(existsSync)
      if (!file) throw new Error(`Cannot resolve ${specifier}`)
      return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    if (specifier.startsWith(".") && context.parentURL?.includes("/packages/")) {
      const base = fileURLToPath(new URL(specifier, context.parentURL))
      const file = [`${base}.tsx`, `${base}.ts`].find(existsSync)
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    // Atlaskit publishes subpath directories with package.json entry points, not ESM exports.
    if (specifier.startsWith("@atlaskit/")) {
      const entry = nextResolve(`${specifier}/package.json`, context)
      const manifest = JSON.parse(readFileSync(fileURLToPath(entry.url), "utf8"))
      return nextResolve(new URL(manifest.main, entry.url).href, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url) && !url.includes("node_modules")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 },
      }).outputText
      return { format: "module", source, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
const h = React.createElement
const { Scheduler, useScheduler } = await import("@multicomma/arkcn-react/ui/scheduler")
const at = (day, hour = 0, minute = 0) => new Date(2026, 9, day, hour, minute)
const offsite = { id: "offsite", start: at(14, 14), end: at(16, 10) }
function renderDay(
  day,
  events,
  { minHour = 8, maxHour = 15, editable = true, view = "day", edges = ["end"], timeEdges = [], eventLayout } = {}
) {
  return renderToStaticMarkup(
    h(
      Scheduler.Root,
      { defaultDate: day, defaultView: view, minHour, maxHour, hourHeight: 60, editable, eventLayout },
      h(
        Scheduler.TimeGrid,
        null,
        h(Scheduler.TimeGridHeader, null, h(Scheduler.DayHeadings)),
        h(
          Scheduler.TimeGridBody,
          null,
          h(Scheduler.TimeGutter),
          h(
            Scheduler.DayColumns,
            null,
            h(Scheduler.DayColumn, { date: day, events }, (event) =>
              h(
                Scheduler.Event,
                { value: event.id, start: event.start, end: event.end, color: event.color },
                h(Scheduler.EventTitle, null, event.id),
                h(Scheduler.EventTime),
                ...edges.map((edge) => h(Scheduler.EventResizeHandle, { edge, key: edge })),
                ...timeEdges.map((edge) => h(Scheduler.EventResizeHandle, { edge, axis: "time", key: `time-${edge}` }))
              )
            )
          )
        )
      )
    )
  )
}
const eventTag = (html, id) =>
  html.match(new RegExp(`<div[^>]*data-slot="scheduler-event"[^>]*data-value="${id}"[^>]*>`))?.[0]
const first = renderDay(at(14), [offsite])
const middle = renderDay(at(15), [offsite])
const last = renderDay(at(16), [offsite])
assert.match(eventTag(first, "offsite"), /top:360px;height:60px/)
assert.match(eventTag(middle, "offsite"), /top:0;height:420px/)
assert.match(eventTag(last, "offsite"), /top:0;height:120px/)
assert.doesNotMatch(first, /data-slot="scheduler-event-resize-handle"/)
assert.doesNotMatch(middle, /data-slot="scheduler-event-resize-handle"/)
assert.match(last, /data-slot="scheduler-event-resize-handle"/)
assert.match(first, /From 2:00 PM/)
assert.match(middle, /Continues all day/)
assert.match(last, /Until 10:00 AM/)
assert.equal(eventTag(renderDay(at(17), [offsite]), "offsite"), undefined)
assert.doesNotMatch(renderDay(at(16), [offsite], { editable: false }), /data-slot="scheduler-event-resize-handle"/)
const midnight = { id: "midnight", start: at(14, 23), end: at(15) }
assert.match(eventTag(renderDay(at(14), [midnight], { minHour: 0, maxHour: 24 }), "midnight"), /top:1380px;height:60px/)
assert.equal(eventTag(renderDay(at(15), [midnight], { minHour: 0, maxHour: 24 }), "midnight"), undefined)
const overnight = { id: "overnight", start: at(14, 23), end: at(15, 1) }
assert.match(eventTag(renderDay(at(15), [overnight], { minHour: 0, maxHour: 24 }), "overnight"), /top:0;height:60px/)
const overlap = renderDay(at(15), [offsite, { id: "meeting", start: at(15, 12), end: at(15, 13) }])
assert.match(eventTag(overlap, "offsite"), /width:calc\(50% - 4px\)/)
assert.match(eventTag(overlap, "meeting"), /left:calc\(50% \+ 2px\)/)
assert.equal(eventTag(renderDay(at(14), [{ id: "early", start: at(14, 6), end: at(14, 8) }]), "early"), undefined)
assert.equal(eventTag(renderDay(at(14), [{ ...offsite, allDay: true }]), "offsite"), undefined)
assert.equal(offsite.start.getTime(), at(14, 14).getTime())
assert.equal(offsite.end.getTime(), at(16, 10).getTime())
console.log(
  "scheduler: multi-day clipping, exclusive midnight, overlap lanes, continuation labels and resize endpoints passed"
)

const bothDay = renderDay(at(14), [{ ...offsite, end: at(14, 15), color: "blue" }], { edges: ["start", "end"] })
assert.equal((bothDay.match(/aria-orientation="horizontal"/g) ?? []).length, 2)
assert.match(eventTag(bothDay, "offsite"), /data-color="blue"/)
const bothWeek = renderDay(at(14), [{ ...offsite, end: at(14, 15) }], { view: "week", edges: ["start", "end"] })
assert.equal((bothWeek.match(/aria-orientation="vertical"/g) ?? []).length, 2)
assert.doesNotMatch(bothWeek, /aria-orientation="horizontal"/)
const startDay = renderDay(at(14), [offsite], { view: "week", edges: ["start", "end"] })
assert.match(startDay, /data-edge="start"/)
assert.match(startDay, /data-edge="end"/)
const endDay = renderDay(at(16), [offsite], { view: "week", edges: ["start", "end"] })
assert.doesNotMatch(endDay, /data-edge="start"/)
assert.doesNotMatch(endDay, /data-slot="scheduler-event"/)
const middleDay = renderDay(at(15), [offsite], { view: "week", edges: ["start", "end"] })
assert.doesNotMatch(middleDay, /data-slot="scheduler-event-resize-handle"/)
for (const day of [at(14), at(15), at(16), at(17)]) {
  const month = renderToStaticMarkup(
    h(
      Scheduler.Root,
      { defaultDate: day, defaultView: "month" },
      h(
        Scheduler.MonthCell,
        { date: day },
        h(
          Scheduler.MonthEvent,
          { value: offsite.id, start: offsite.start, end: offsite.end, color: "green" },
          "Offsite",
          h(Scheduler.EventResizeHandle, { edge: "start" }),
          h(Scheduler.EventResizeHandle, { edge: "end" })
        )
      )
    )
  )
  if (day.getDate() !== 14) assert.doesNotMatch(month, /data-slot="scheduler-month-event"/)
  else {
    assert.match(month, /data-color="green"/)
    assert.equal((month.match(/aria-orientation="vertical"/g) ?? []).length, 2)
    assert.doesNotMatch(month, /aria-orientation="horizontal"/)
  }
}
console.log("scheduler: start/end handles, view-specific axes, colors and month boundaries passed")

const weekEvents = [
  { id: "long", start: at(14, 10), end: at(14, 12) },
  { id: "short", start: at(14, 10, 30), end: at(14, 11) },
]
const fourEdges = renderDay(at(14), weekEvents, { view: "week", edges: ["start", "end"], timeEdges: ["start", "end"] })
assert.equal((fourEdges.match(/aria-orientation="horizontal"/g) ?? []).length, 4)
assert.equal((fourEdges.match(/aria-orientation="vertical"/g) ?? []).length, 4)
assert.match(eventTag(fourEdges, "long"), /left:2px;width:calc\(100% - 4px\);z-index:1/)
assert.match(eventTag(fourEdges, "short"), /left:2px;width:calc\(100% - 4px\);z-index:2/)
const weekLanes = renderDay(at(14), weekEvents, { view: "week", eventLayout: "lanes" })
assert.match(eventTag(weekLanes, "long"), /width:calc\(50% - 4px\)/)
assert.doesNotMatch(
  renderDay(at(14), weekEvents, {
    view: "week",
    edges: ["start", "end"],
    timeEdges: ["start", "end"],
    editable: false,
  }),
  /data-slot="scheduler-event-resize-handle"/
)
console.log("scheduler: four-edge week handles, overlapping geometry, z order and lane override passed")

function AllWeekColumns({ events }) {
  const { days } = useScheduler()
  const renderEvent = (event) =>
    h(
      Scheduler.Event,
      { value: event.id, start: event.start, end: event.end },
      h(Scheduler.EventTitle, null, event.id),
      ...["date", "time"].flatMap((axis) =>
        ["start", "end"].map((edge) => h(Scheduler.EventResizeHandle, { axis, edge, key: `${axis}-${edge}` }))
      )
    )
  const columns = days.map((date) => h(Scheduler.DayColumn, { date, events, key: date.toISOString() }, renderEvent))
  return h(
    Scheduler.TimeGrid,
    null,
    h(Scheduler.TimeGridBody, null, h(Scheduler.TimeGutter), h(Scheduler.DayColumns, null, ...columns))
  )
}
function renderWeek(events, anchor = at(14), minHour = 8, maxHour = 15) {
  return renderToStaticMarkup(
    h(
      Scheduler.Root,
      { defaultDate: anchor, defaultView: "week", minHour, maxHour, hourHeight: 60 },
      h(AllWeekColumns, { events })
    )
  )
}
// Each date range owns exactly one DOM event, with a constant clock band.
let rangeCases = 0
for (let startDay = 9; startDay <= 20; startDay++) {
  for (let endDay = startDay; endDay <= 23; endDay++) {
    const html = renderWeek([{ id: "span", start: at(startDay, 10), end: at(endDay, 11, 30) }])
    const visible = endDay >= 12 && startDay <= 18
    assert.equal((html.match(/data-slot="scheduler-event"/g) ?? []).length, visible ? 1 : 0)
    if (visible) {
      const span = Math.min(endDay, 18) - Math.max(startDay, 12) + 1
      assert.match(eventTag(html, "span"), new RegExp(`data-week-span="${span}"`))
      assert.match(eventTag(html, "span"), /top:120px;height:90px/)
      const owner = html.match(
        /data-slot="scheduler-day-column"[^>]*data-date="([^"]+)"[^>]*>(?:(?!data-slot="scheduler-day-column")[\s\S])*?data-value="span"/
      )
      assert.ok(owner)
      if (startDay < 12) assert.doesNotMatch(html, /data-edge="start" data-axis="date"/)
      if (endDay > 18) assert.doesNotMatch(html, /data-edge="end" data-axis="date"/)
    }
    rangeCases++
  }
}
const twoDays = renderWeek([{ id: "two", start: at(14, 10), end: at(15, 11, 30) }])
assert.match(eventTag(twoDays, "two"), /width:calc\(200% \+ 1px - 4px\)/)
const clipped = renderWeek([{ id: "clipped", start: at(9, 10), end: at(22, 11, 30) }])
assert.match(eventTag(clipped, "clipped"), /data-week-span="7"/)
assert.equal((clipped.match(/data-axis="time"/g) ?? []).length, 2)
const midnightWeek = renderWeek([{ id: "midnight", start: at(14, 23), end: at(16) }], at(14), 0, 24)
assert.match(eventTag(midnightWeek, "midnight"), /data-week-span="2"/)
assert.match(eventTag(midnightWeek, "midnight"), /top:1380px;height:60px/)
const overnightWeek = renderWeek([overnight], at(14), 0, 24)
assert.equal((overnightWeek.match(/data-slot="scheduler-event"/g) ?? []).length, 1)
assert.match(eventTag(overnightWeek, "overnight"), /height:1440px/)
console.log(
  `scheduler: ${rangeCases} week ranges, single-node spans, constant clock height, week clipping, midnight and overnight passed`
)

// Exercise the public context's resize intents, including pointer/keyboard parity.
let resizeContext
let changed
function CaptureResizeContext() {
  // Capture the public context for synchronous intent tests; this value never drives rendering.
  // oxlint-disable-next-line react/globals
  resizeContext = useScheduler()
  return null
}
renderToStaticMarkup(
  h(
    Scheduler.Root,
    {
      defaultDate: at(14),
      defaultView: "week",
      minHour: 8,
      maxHour: 15,
      hourHeight: 60,
      onEventChange: (value) => {
        changed = value
      },
    },
    h(CaptureResizeContext)
  )
)
const resizable = { id: "resize", start: at(14, 10), end: at(15, 11, 30) }
resizeContext.nudge(resizable, 180, 0, "start")
assert.equal(changed.start.getTime(), at(14, 11, 15).getTime())
resizeContext.nudge(resizable, -180, 0, "end")
assert.equal(changed.end.getTime(), at(15, 10, 15).getTime())
resizeContext.nudge(resizable, 0, 5, "start")
assert.equal(changed.start.getTime(), at(15, 10).getTime())
resizeContext.nudge(resizable, 0, -5, "end")
assert.equal(changed.end.getTime(), at(14, 11, 30).getTime())
const originalWindow = globalThis.window
const pointerWindow = new EventTarget()
globalThis.window = pointerWindow
const column = { dataset: { date: at(14).toISOString() }, getBoundingClientRect: () => ({ width: 160 }) }
const schedulerElement = { querySelector: () => column }
const pointer = {
  clientX: 400,
  clientY: 200,
  preventDefault() {},
  stopPropagation() {},
  currentTarget: { closest: (selector) => (selector === "[data-slot=scheduler]" ? schedulerElement : column) },
}
function resizeWithPointer(event, edge, axis, dx, dy) {
  changed = undefined
  resizeContext.startResize(event, pointer, edge, axis)
  pointerWindow.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 400 + dx, clientY: 200 + dy }))
  pointerWindow.dispatchEvent(new Event("pointerup"))
  return changed
}
try {
  assert.equal(resizeWithPointer(resizable, "end", "date", 160, 0).end.getTime(), at(16, 11, 30).getTime())
  assert.equal(resizeWithPointer(resizable, "end", "date", 0, 0), undefined)
  assert.equal(resizeWithPointer(resizable, "start", "date", 800, 0).start.getTime(), at(15, 10).getTime())
  assert.equal(resizeWithPointer(resizable, "end", "date", -800, 0).end.getTime(), at(14, 11, 30).getTime())
  assert.equal(resizeWithPointer(resizable, "start", "time", 0, 180).start.getTime(), at(14, 11, 15).getTime())
  assert.equal(resizeWithPointer(resizable, "end", "time", 0, -180).end.getTime(), at(15, 10, 15).getTime())
  resizeContext.startMove(resizable, pointer, [at(14), at(15)])
  pointerWindow.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 400, clientY: 900 }))
  pointerWindow.dispatchEvent(new Event("pointerup"))
  assert.equal(changed.start.getTime(), at(14, 13, 30).getTime())
  assert.equal(changed.end.getTime(), at(15, 15).getTime())
} finally {
  if (originalWindow === undefined) delete globalThis.window
  else globalThis.window = originalWindow
}
console.log("scheduler: pointer and keyboard date/clock resize boundaries and no-movement passed")

function AllMonthCells({ events }) {
  const { days } = useScheduler()
  return h(
    Scheduler.MonthBody,
    { events },
    ...days.map((date) =>
      h(
        Scheduler.MonthCell,
        { date, key: date.toISOString() },
        ...events.map((event) =>
          h(
            Scheduler.MonthEvent,
            { value: event.id, start: event.start, end: event.end, key: event.id },
            event.id,
            h(Scheduler.EventResizeHandle, { edge: "start" }),
            h(Scheduler.EventResizeHandle, { edge: "end" })
          )
        )
      )
    )
  )
}
function renderMonth(events, weekStartsOn = 1) {
  return renderToStaticMarkup(
    h(Scheduler.Root, { defaultDate: at(14), defaultView: "month", weekStartsOn }, h(AllMonthCells, { events }))
  )
}
const monthTags = (html) =>
  [...html.matchAll(/<div[^>]*data-slot="scheduler-month-event"[^>]*>/g)].map((match) => match[0])
let monthCases = 0
for (const weekStartsOn of [0, 1]) {
  for (let first = 1; first <= 26; first += 5) {
    for (let last = first; last <= 35; last += 3) {
      const html = renderMonth([{ id: "span", start: at(first, 10), end: at(last, 11) }], weekStartsOn)
      const tags = monthTags(html)
      // Derive calendar rows directly from rendered cells, independent of layout helpers.
      const dates = [...html.matchAll(/data-slot="scheduler-month-cell"[^>]*data-date="([^"]+)"/g)].map(
        (match) => new Date(match[1])
      )
      const expected = []
      for (let i = 0; i < dates.length; i += 7) {
        const covered = dates.slice(i, i + 7).filter((date) => date >= at(first) && date <= at(last))
        if (covered.length) expected.push(covered.length)
      }
      assert.equal(tags.length, expected.length)
      assert.deepEqual(
        tags.map((tag) => Number(tag.match(/data-month-span="(\d+)"/)[1])),
        expected
      )
      assert.equal((html.match(/data-edge="start"/g) ?? []).length, 1)
      assert.equal((html.match(/data-edge="end"/g) ?? []).length, at(last) <= dates.at(-1) ? 1 : 0)
      monthCases++
    }
  }
}
const monthOverlap = renderMonth([
  { id: "wide", start: at(14, 10), end: at(16, 11) },
  { id: "inside", start: at(15, 10), end: at(15, 11) },
  { id: "after", start: at(17, 10), end: at(17, 11) },
])
const tags = monthTags(monthOverlap)
assert.match(
  tags.find((tag) => tag.includes('data-value="wide"')),
  /grid-row:1/
)
assert.match(
  tags.find((tag) => tag.includes('data-value="inside"')),
  /grid-row:2/
)
assert.match(
  tags.find((tag) => tag.includes('data-value="after"')),
  /grid-row:1/
)
const midnightMonth = renderMonth([{ id: "midnight", start: at(14, 20), end: at(16) }])
assert.equal(monthTags(midnightMonth).length, 1)
assert.match(monthTags(midnightMonth)[0], /data-month-span="2"/)
console.log(
  `scheduler: ${monthCases} month ranges, week wraps, exclusive midnight, endpoint handles and collision-free lanes passed`
)

renderToStaticMarkup(
  h(
    Scheduler.Root,
    {
      defaultDate: at(14),
      defaultView: "month",
      onEventChange: (value) => {
        changed = value
      },
    },
    h(CaptureResizeContext)
  )
)
const monthCells = Array.from({ length: 14 }, (_, i) => ({
  dataset: { date: at(12 + i).toISOString() },
  getBoundingClientRect: () => ({
    left: (i % 7) * 100,
    right: ((i % 7) + 1) * 100,
    top: Math.floor(i / 7) * 100,
    bottom: (Math.floor(i / 7) + 1) * 100,
  }),
}))
const monthRoot = { querySelector: () => null, querySelectorAll: () => monthCells }
function monthPointer(x, y) {
  return {
    clientX: x,
    clientY: y,
    preventDefault() {},
    stopPropagation() {},
    currentTarget: { closest: (selector) => (selector === "[data-slot=scheduler]" ? monthRoot : monthCells[2]) },
  }
}
globalThis.window = pointerWindow
try {
  const event = { id: "month", start: at(14, 10), end: at(16, 11) }
  changed = undefined
  resizeContext.startResize(event, monthPointer(490, 50), "end", "date")
  pointerWindow.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 590, clientY: 50 }))
  pointerWindow.dispatchEvent(new Event("pointerup"))
  assert.equal(changed.end.getTime(), at(17, 11).getTime())
  resizeContext.startResize(event, monthPointer(210, 50), "start", "date")
  pointerWindow.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 110, clientY: 50 }))
  pointerWindow.dispatchEvent(new Event("pointerup"))
  assert.equal(changed.start.getTime(), at(13, 10).getTime())
  resizeContext.startMonthMove(event, monthPointer(350, 50))
  pointerWindow.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 450, clientY: 50 }))
  pointerWindow.dispatchEvent(new Event("pointerup"))
  assert.equal(changed.start.getTime(), at(15, 10).getTime())
  assert.equal(changed.end.getTime(), at(17, 11).getTime())
  resizeContext.startResize({ ...event, end: at(18, 11) }, monthPointer(690, 50), "end", "date")
  pointerWindow.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 50, clientY: 150 }))
  pointerWindow.dispatchEvent(new Event("pointerup"))
  assert.equal(changed.end.getTime(), at(19, 11).getTime())
} finally {
  if (originalWindow === undefined) delete globalThis.window
  else globalThis.window = originalWindow
}
console.log("scheduler: month pointer endpoints, second-day pickup and cross-row resizing passed")

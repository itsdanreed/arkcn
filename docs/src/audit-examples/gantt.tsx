import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
import * as React from "react"
import { Gantt } from "@/components/ui/gantt"

const day = 86_400_000
const at = (offset: number) => new Date(Date.now() + offset * day)

export default function GanttExample() {
  const { trace } = useAuditMotion(
    '[data-slot="gantt-row"], [data-slot="gantt-zoom-in-trigger"], [data-slot="gantt-bar"]'
  )
  const [editable, setEditable] = React.useState(true)
  const [empty, setEmpty] = React.useState(false)
  const [zoom, setZoom] = React.useState(24)
  const [tasks, setTasks] = React.useState([
    { id: "research", title: "Research", start: at(-2), end: at(2), progress: 1 },
    { id: "design", title: "Design", start: at(1), end: at(6), progress: 0.6 },
    { id: "build", title: "Build", start: at(4), end: at(10), progress: 0.1 },
    { id: "launch", title: "Launch", start: at(12), end: at(12), progress: 0, milestone: true },
  ])
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" aria-pressed={!editable} onClick={() => setEditable(!editable)}>
          Read only
        </Button>
        <Button variant="outline" aria-pressed={empty} onClick={() => setEmpty(!empty)}>
          Empty
        </Button>
      </div>
      <Gantt.Root
        start={at(-4)}
        end={at(21)}
        editable={editable}
        sidebarWidth={128}
        dayWidth={zoom}
        onDayWidthChange={setZoom}
        onBarChange={({ id, start, end }) =>
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, start, end } : t)))
        }
        className="h-80 w-full"
      >
        <Gantt.Controls className="mb-2">
          <Gantt.ZoomOutTrigger />
          <Gantt.ZoomInTrigger />
          <Gantt.TodayTrigger />
        </Gantt.Controls>
        <Gantt.Viewport>
          <Gantt.Header />
          <Gantt.Body>
            <Gantt.GridLines />
            <Gantt.Today />
            <Gantt.Rows>
              {empty && <Gantt.Empty>No tasks</Gantt.Empty>}
              {(empty ? [] : tasks).map((task) => (
                <Gantt.Row key={task.id} value={task.id}>
                  <Gantt.RowLabel>{task.title}</Gantt.RowLabel>
                  <Gantt.RowTrack>
                    {task.milestone ? (
                      <Gantt.Milestone value={task.id} date={task.start}>
                        {task.title}
                      </Gantt.Milestone>
                    ) : (
                      <Gantt.Bar value={task.id} start={task.start} end={task.end} progress={task.progress}>
                        <Gantt.BarResizeHandle side="start" />
                        <Gantt.BarLabel>{task.title}</Gantt.BarLabel>
                        <Gantt.BarResizeHandle side="end" />
                      </Gantt.Bar>
                    )}
                  </Gantt.RowTrack>
                </Gantt.Row>
              ))}
            </Gantt.Rows>
            <Gantt.Dependencies
              links={
                empty
                  ? []
                  : [
                      { from: "research", to: "design" },
                      { from: "design", to: "build" },
                      { from: "build", to: "launch" },
                    ]
              }
            />
          </Gantt.Body>
        </Gantt.Viewport>
      </Gantt.Root>
      <output hidden data-audit-motion>
        {trace}
      </output>
      <output hidden data-audit-zoom>
        {zoom}
      </output>
    </div>
  )
}

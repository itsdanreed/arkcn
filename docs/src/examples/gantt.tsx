import * as React from "react"
import { Gantt } from "@/components/ui/gantt"

const day = 86_400_000
const at = (offset: number) => new Date(Date.now() + offset * day)

export default function GanttExample() {
  const [tasks, setTasks] = React.useState([
    { id: "research", title: "Research", start: at(-10), end: at(-4), progress: 100 },
    { id: "design", title: "Design", start: at(-5), end: at(2), progress: 60 },
    { id: "build", title: "Build", start: at(1), end: at(12), progress: 10 },
    { id: "launch", title: "Launch", start: at(14), end: at(14), progress: 0, milestone: true },
  ])
  return (
    <Gantt.Root
      start={at(-14)}
      end={at(21)}
      editable
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
            {tasks.map((task) => (
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
            links={[
              { from: "research", to: "design" },
              { from: "design", to: "build" },
              { from: "build", to: "launch" },
            ]}
          />
        </Gantt.Body>
      </Gantt.Viewport>
    </Gantt.Root>
  )
}

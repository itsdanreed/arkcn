import * as React from "react"
import {
  Gantt,
  GanttBar,
  GanttBarLabel,
  GanttBarResizeHandle,
  GanttBody,
  GanttControls,
  GanttDependencies,
  GanttGridLines,
  GanttHeader,
  GanttMilestone,
  GanttRow,
  GanttRowLabel,
  GanttRowTrack,
  GanttRows,
  GanttToday,
  GanttTodayTrigger,
  GanttViewport,
  GanttZoomInTrigger,
  GanttZoomOutTrigger,
} from "@/components/ui/gantt"

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
    <Gantt
      start={at(-14)}
      end={at(21)}
      editable
      onBarChange={({ id, start, end }) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, start, end } : t)))
      }
      className="h-80 w-full"
    >
      <GanttControls className="mb-2">
        <GanttZoomOutTrigger />
        <GanttZoomInTrigger />
        <GanttTodayTrigger />
      </GanttControls>
      <GanttViewport>
        <GanttHeader />
        <GanttBody>
          <GanttGridLines />
          <GanttToday />
          <GanttRows>
            {tasks.map((task) => (
              <GanttRow key={task.id} value={task.id}>
                <GanttRowLabel>{task.title}</GanttRowLabel>
                <GanttRowTrack>
                  {task.milestone ? (
                    <GanttMilestone value={task.id} date={task.start}>
                      {task.title}
                    </GanttMilestone>
                  ) : (
                    <GanttBar value={task.id} start={task.start} end={task.end} progress={task.progress}>
                      <GanttBarResizeHandle side="start" />
                      <GanttBarLabel>{task.title}</GanttBarLabel>
                      <GanttBarResizeHandle side="end" />
                    </GanttBar>
                  )}
                </GanttRowTrack>
              </GanttRow>
            ))}
          </GanttRows>
          <GanttDependencies
            links={[
              { from: "research", to: "design" },
              { from: "design", to: "build" },
              { from: "build", to: "launch" },
            ]}
          />
        </GanttBody>
      </GanttViewport>
    </Gantt>
  )
}

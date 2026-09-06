import * as React from "react"
import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns"
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, Redo2Icon, RotateCcwIcon, Undo2Icon } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Gantt,
  GanttBar,
  GanttBarLabel,
  GanttBarResizeHandle,
  GanttBody,
  GanttControls,
  GanttDependencies,
  GanttEmpty,
  GanttGridLines,
  GanttHeader,
  GanttMilestone,
  GanttRow,
  GanttRowLabel,
  GanttRows,
  GanttRowTrack,
  GanttToday,
  GanttTodayTrigger,
  GanttViewport,
  GanttZoomInTrigger,
  GanttZoomOutTrigger,
  useGantt,
  type GanttScale,
} from "@/components/ui/gantt"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useHistory } from "@/lib/history"
import { cn } from "@/lib/utils"

/* -------------------------------- data ---------------------------------- */

type Task = {
  id: string
  phase: string
  title: string
  start: Date
  end: Date
  progress: number
  assignee: string
  milestone?: boolean
  dependsOn?: string[]
}

type Phase = { id: string; title: string }

const today = startOfDay(new Date())
const day = (offset: number) => addDays(today, offset)

const phases: Phase[] = [
  { id: "discovery", title: "Discovery" },
  { id: "design", title: "Design" },
  { id: "build", title: "Build" },
  { id: "launch", title: "Launch" },
]

const phaseColor: Record<string, string> = {
  discovery: "border-sky-500/40 bg-sky-500/15 [&_[data-slot=gantt-bar-progress]]:bg-sky-500/35",
  design: "border-fuchsia-500/40 bg-fuchsia-500/15 [&_[data-slot=gantt-bar-progress]]:bg-fuchsia-500/35",
  build: "border-emerald-500/40 bg-emerald-500/15 [&_[data-slot=gantt-bar-progress]]:bg-emerald-500/35",
  launch: "border-amber-500/40 bg-amber-500/15 [&_[data-slot=gantt-bar-progress]]:bg-amber-500/35",
}

function buildTasks(): Task[] {
  return [
    {
      id: "kickoff",
      phase: "discovery",
      title: "Kickoff",
      start: day(-21),
      end: day(-21),
      progress: 1,
      assignee: "AM",
      milestone: true,
    },
    {
      id: "interviews",
      phase: "discovery",
      title: "Customer interviews",
      start: day(-20),
      end: day(-12),
      progress: 1,
      assignee: "JL",
      dependsOn: ["kickoff"],
    },
    {
      id: "audit",
      phase: "discovery",
      title: "Competitive audit",
      start: day(-18),
      end: day(-10),
      progress: 1,
      assignee: "RS",
    },
    {
      id: "brief",
      phase: "discovery",
      title: "Product brief",
      start: day(-9),
      end: day(-6),
      progress: 0.8,
      assignee: "AM",
      dependsOn: ["interviews", "audit"],
    },
    {
      id: "wireframes",
      phase: "design",
      title: "Wireframes",
      start: day(-5),
      end: day(2),
      progress: 0.55,
      assignee: "JL",
      dependsOn: ["brief"],
    },
    {
      id: "visual",
      phase: "design",
      title: "Visual design",
      start: day(1),
      end: day(9),
      progress: 0.1,
      assignee: "JL",
      dependsOn: ["wireframes"],
    },
    {
      id: "prototype",
      phase: "design",
      title: "Clickable prototype",
      start: day(6),
      end: day(11),
      progress: 0,
      assignee: "RS",
      dependsOn: ["visual"],
    },
    {
      id: "design-review",
      phase: "design",
      title: "Design review",
      start: day(12),
      end: day(12),
      progress: 0,
      assignee: "AM",
      milestone: true,
      dependsOn: ["prototype"],
    },
    {
      id: "api",
      phase: "build",
      title: "API and data model",
      start: day(3),
      end: day(16),
      progress: 0.2,
      assignee: "MK",
      dependsOn: ["brief"],
    },
    {
      id: "ui",
      phase: "build",
      title: "UI implementation",
      start: day(13),
      end: day(27),
      progress: 0,
      assignee: "RS",
      dependsOn: ["design-review", "api"],
    },
    {
      id: "qa",
      phase: "build",
      title: "QA and fixes",
      start: day(24),
      end: day(32),
      progress: 0,
      assignee: "MK",
      dependsOn: ["ui"],
    },
    {
      id: "beta",
      phase: "launch",
      title: "Beta with 20 customers",
      start: day(33),
      end: day(44),
      progress: 0,
      assignee: "AM",
      dependsOn: ["qa"],
    },
    {
      id: "docs",
      phase: "launch",
      title: "Docs and release notes",
      start: day(36),
      end: day(42),
      progress: 0,
      assignee: "JL",
    },
    {
      id: "ga",
      phase: "launch",
      title: "General availability",
      start: day(46),
      end: day(46),
      progress: 0,
      assignee: "AM",
      milestone: true,
      dependsOn: ["beta", "docs"],
    },
  ]
}

const scaleWidth: Record<GanttScale, number> = { day: 44, week: 20, month: 10 }

/* -------------------------------- page ---------------------------------- */

export function GanttPage() {
  const history = useHistory<Task[]>(buildTasks)
  const tasks = history.present
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  const [dayWidth, setDayWidth] = React.useState(scaleWidth.day)
  const [showDependencies, setShowDependencies] = React.useState(true)
  const [editable, setEditable] = React.useState(true)

  const scale: GanttScale = dayWidth < 16 ? "month" : dayWidth < 32 ? "week" : "day"
  const range = React.useMemo(() => {
    const starts = tasks.map((t) => t.start.getTime())
    const ends = tasks.map((t) => t.end.getTime())
    const min = new Date(Math.min(...starts, today.getTime()))
    const max = new Date(Math.max(...ends, today.getTime()))
    return { start: addDays(min, -7), end: addDays(max, 14) }
  }, [tasks])

  const links = React.useMemo(
    () => tasks.flatMap((t) => (t.dependsOn ?? []).map((from) => ({ from, to: t.id }))),
    [tasks]
  )

  const toggle = (phase: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(phase)) next.delete(phase)
      else next.add(phase)
      return next
    })

  const addTask = (phase: string) => {
    const id = `task-${Date.now().toString(36)}`
    history.set((prev) => [
      ...prev,
      { id, phase, title: "New task", start: today, end: addDays(today, 4), progress: 0, assignee: "AM" },
    ])
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.delete(phase)
      return next
    })
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return
      if ((event.target as HTMLElement).closest("input, textarea")) return
      event.preventDefault()
      if (event.shiftKey) history.redo()
      else history.undo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [history])

  const done = tasks.filter((t) => t.progress >= 1).length
  const overall = tasks.length ? Math.round((tasks.reduce((s, t) => s + t.progress, 0) / tasks.length) * 100) : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Timeline</h2>
          <p className="text-muted-foreground">
            Drag a bar to move it, drag its edges to change the dates. Arrows connect dependencies.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentGroup
            value={scale}
            onValueChange={({ value }) => value && setDayWidth(scaleWidth[value as GanttScale])}
          >
            <SegmentGroupIndicator />
            <SegmentGroupItem value="day">Day</SegmentGroupItem>
            <SegmentGroupItem value="week">Week</SegmentGroupItem>
            <SegmentGroupItem value="month">Month</SegmentGroupItem>
          </SegmentGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Undo"
                disabled={!history.canUndo}
                onClick={history.undo}
              >
                <Undo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <Kbd>⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Redo"
                disabled={!history.canRedo}
                onClick={history.redo}
              >
                <Redo2Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <Kbd>⇧⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            onClick={() => {
              history.reset(buildTasks())
              toast("Plan reset")
            }}
          >
            <RotateCcwIcon /> Reset
          </Button>
        </div>
      </div>

      <Gantt
        start={range.start}
        end={range.end}
        dayWidth={dayWidth}
        onDayWidthChange={setDayWidth}
        editable={editable}
        onBarChange={({ id, start, end }) =>
          history.set((prev) => prev.map((t) => (t.id === id ? { ...t, start, end } : t)))
        }
        className="min-h-0"
      >
        <div className="flex flex-wrap items-center gap-3 pb-2">
          <GanttControls>
            <GanttZoomOutTrigger />
            <GanttZoomInTrigger />
            <GanttTodayTrigger />
          </GanttControls>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              size="sm"
              checked={showDependencies}
              onCheckedChange={({ checked }) => setShowDependencies(checked)}
            />
            Dependencies
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={editable} onCheckedChange={({ checked }) => setEditable(checked)} />
            Editable
          </label>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {done} of {tasks.length} done · {overall}% overall
          </span>
        </div>
        <ScrollToToday />
        <GanttViewport>
          <GanttHeader />
          <GanttBody>
            <GanttGridLines />
            <GanttToday />
            <GanttRows>
              {phases.map((phase) => {
                const phaseTasks = tasks.filter((t) => t.phase === phase.id)
                const open = !collapsed.has(phase.id)
                const first = phaseTasks.length ? new Date(Math.min(...phaseTasks.map((t) => t.start.getTime()))) : null
                const last = phaseTasks.length ? new Date(Math.max(...phaseTasks.map((t) => t.end.getTime()))) : null
                const progress = phaseTasks.length
                  ? phaseTasks.reduce((s, t) => s + t.progress, 0) / phaseTasks.length
                  : 0
                return (
                  <React.Fragment key={phase.id}>
                    <GanttRow value={`phase-${phase.id}`} className="bg-muted/40 hover:bg-muted/40">
                      <GanttRowLabel className="bg-[color-mix(in_oklab,var(--color-muted)_40%,var(--color-background))] font-medium group-hover/row:bg-[color-mix(in_oklab,var(--color-muted)_40%,var(--color-background))]">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={open ? "Collapse phase" : "Expand phase"}
                          aria-expanded={open}
                          onClick={() => toggle(phase.id)}
                          className="-ms-1.5"
                        >
                          {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        </Button>
                        <span className="truncate">{phase.title}</span>
                        <Badge variant="secondary" className="ms-auto tabular-nums">
                          {phaseTasks.length}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Add task to ${phase.title}`}
                          onClick={() => addTask(phase.id)}
                        >
                          <PlusIcon />
                        </Button>
                      </GanttRowLabel>
                      <GanttRowTrack>
                        {first && last && (
                          <PhaseSpan start={first} end={last} progress={progress} className={phaseColor[phase.id]} />
                        )}
                      </GanttRowTrack>
                    </GanttRow>
                    {open &&
                      phaseTasks.map((task) => (
                        <GanttRow key={task.id} value={task.id}>
                          <GanttRowLabel>
                            <Avatar size="sm" className="size-6 text-[10px]">
                              <AvatarFallback>{task.assignee}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{task.title}</span>
                            <span className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                              {task.milestone
                                ? format(task.start, "MMM d")
                                : `${differenceInCalendarDays(task.end, task.start) + 1}d`}
                            </span>
                          </GanttRowLabel>
                          <GanttRowTrack>
                            {task.milestone ? (
                              <GanttMilestone value={task.id} date={task.start}>
                                {task.title}
                              </GanttMilestone>
                            ) : (
                              <GanttBar
                                value={task.id}
                                start={task.start}
                                end={task.end}
                                progress={task.progress}
                                className={phaseColor[task.phase]}
                              >
                                <GanttBarResizeHandle side="start" />
                                <GanttBarLabel>{task.title}</GanttBarLabel>
                                <GanttBarResizeHandle side="end" />
                              </GanttBar>
                            )}
                          </GanttRowTrack>
                        </GanttRow>
                      ))}
                  </React.Fragment>
                )
              })}
            </GanttRows>
            {showDependencies && <GanttDependencies links={links} />}
          </GanttBody>
          {tasks.length === 0 && <GanttEmpty>No tasks yet.</GanttEmpty>}
        </GanttViewport>
      </Gantt>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {format(range.start, "MMM d")} – {format(range.end, "MMM d, yyyy")}
        </span>
        <span className="ml-auto hidden items-center gap-3 md:flex">
          <KbdGroup>
            <Kbd>Space</Kbd>
            <span>pick up a bar</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
            <span>move a day</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⇧</Kbd>
            <span>end</span>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌥</Kbd>
            <span>start</span>
          </KbdGroup>
        </span>
      </div>
    </div>
  )
}

/** Centre the viewport on today once the timeline has laid out. */
function ScrollToToday() {
  const { scrollToDate } = useGantt()
  React.useEffect(() => {
    scrollToDate(new Date(), { behavior: "auto" })
  }, [scrollToDate])
  return null
}

/** A thin summary bar for a phase row, spanning its tasks. Not interactive. */
function PhaseSpan({
  start,
  end,
  progress,
  className,
}: {
  start: Date
  end: Date
  progress: number
  className?: string
}) {
  return (
    <GanttBar
      value={`phase-span-${start.getTime()}`}
      start={start}
      end={end}
      progress={progress}
      tabIndex={-1}
      onPointerDown={(e) => e.preventDefault()}
      className={cn("h-2 cursor-default border-0 opacity-70", className)}
    />
  )
}

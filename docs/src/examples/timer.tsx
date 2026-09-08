import { Button } from "@/components/ui/button"
import { Timer } from "@/components/ui/timer"

export default function TimerExample() {
  return (
    <Timer.Root startMs={5 * 60 * 1000} countdown>
      <Timer.Area>
        <Timer.Item type="minutes" />
        <Timer.Separator>:</Timer.Separator>
        <Timer.Item type="seconds" />
      </Timer.Area>
      <Timer.Control>
        <Timer.ActionTrigger action="start" asChild>
          <Button size="sm">Start</Button>
        </Timer.ActionTrigger>
        <Timer.ActionTrigger action="pause" asChild>
          <Button size="sm" variant="outline">
            Pause
          </Button>
        </Timer.ActionTrigger>
        <Timer.ActionTrigger action="resume" asChild>
          <Button size="sm">Resume</Button>
        </Timer.ActionTrigger>
        <Timer.ActionTrigger action="reset" asChild>
          <Button size="sm" variant="ghost">
            Reset
          </Button>
        </Timer.ActionTrigger>
      </Timer.Control>
    </Timer.Root>
  )
}

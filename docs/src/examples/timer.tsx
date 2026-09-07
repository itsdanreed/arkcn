import { Button } from "@/components/ui/button"
import { Timer, TimerActionTrigger, TimerArea, TimerControl, TimerItem, TimerSeparator } from "@/components/ui/timer"

export default function TimerExample() {
  return (
    <Timer startMs={5 * 60 * 1000} countdown>
      <TimerArea>
        <TimerItem type="minutes" />
        <TimerSeparator>:</TimerSeparator>
        <TimerItem type="seconds" />
      </TimerArea>
      <TimerControl>
        <TimerActionTrigger action="start" asChild>
          <Button size="sm">Start</Button>
        </TimerActionTrigger>
        <TimerActionTrigger action="pause" asChild>
          <Button size="sm" variant="outline">
            Pause
          </Button>
        </TimerActionTrigger>
        <TimerActionTrigger action="resume" asChild>
          <Button size="sm">Resume</Button>
        </TimerActionTrigger>
        <TimerActionTrigger action="reset" asChild>
          <Button size="sm" variant="ghost">
            Reset
          </Button>
        </TimerActionTrigger>
      </TimerControl>
    </Timer>
  )
}

import { Timer } from "@multicomma/arkcn-react-native/ui/timer"
export default function TimerExample() {
  return (
    <Timer.Root startMs={5 * 60 * 1000} countdown>
      <Timer.Area>
        <Timer.Item type="minutes" />
        <Timer.Separator />
        <Timer.Item type="seconds" />
      </Timer.Area>
      <Timer.Control>
        <Timer.ActionTrigger action="start" variant="default">
          Start
        </Timer.ActionTrigger>
        <Timer.ActionTrigger action="pause">Pause</Timer.ActionTrigger>
        <Timer.ActionTrigger action="resume" variant="default">
          Resume
        </Timer.ActionTrigger>
        <Timer.ActionTrigger action="reset" variant="ghost">
          Reset
        </Timer.ActionTrigger>
      </Timer.Control>
    </Timer.Root>
  )
}

import { Timer } from "@/components/ui/timer"

export default function Example() {
  return (
    <Timer.Root startMs={60000} countdown>
      <Timer.Area>
        <Timer.Item type="minutes" />
        <Timer.Separator />
        <Timer.Item type="seconds" />
      </Timer.Area>
      <Timer.Control data-audit-part="actions">
        <Timer.ActionTrigger action="start">Start</Timer.ActionTrigger>
        <Timer.ActionTrigger action="pause">Pause</Timer.ActionTrigger>
        <Timer.ActionTrigger action="resume">Resume</Timer.ActionTrigger>
        <Timer.ActionTrigger action="reset">Reset</Timer.ActionTrigger>
        <Timer.ActionTrigger action="restart" disabled>
          Unavailable
        </Timer.ActionTrigger>
      </Timer.Control>
    </Timer.Root>
  )
}

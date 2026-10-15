import { useState } from "react"
import { Text, View } from "react-native"
import { Timer } from "@/components/ui/timer"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function TimerValidation() {
  const [completions, setCompletions] = useState(0)
  const [countdown, setCountdown] = useState(true)
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ alignItems: "center", gap: 16 }}>
      <Text style={{ ...typography.medium, color: colors.foreground, fontSize: 14 }}>Ten-second lifecycle check</Text>
      <Timer.Root
        startMs={countdown ? 10000 : 0}
        targetMs={countdown ? 0 : 10000}
        countdown={countdown}
        onComplete={() => setCompletions((value) => value + 1)}
      >
        <Timer.Area>
          <Timer.Item type="seconds" />
          <Timer.Separator />
          <Timer.Item type="milliseconds" />
        </Timer.Area>
        <Timer.Control>
          <Timer.ActionTrigger action="start" variant="default">
            Start check
          </Timer.ActionTrigger>
          <Timer.ActionTrigger action="pause">Pause check</Timer.ActionTrigger>
          <Timer.ActionTrigger action="resume" variant="default">
            Resume check
          </Timer.ActionTrigger>
          <Timer.ActionTrigger action="reset" variant="ghost">
            Reset check
          </Timer.ActionTrigger>
          <Timer.ActionTrigger action="restart">Restart check</Timer.ActionTrigger>
        </Timer.Control>
        <Timer.Context>
          {(api) => (
            <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14 }}>
              {api.running ? "Running" : api.paused ? "Paused" : "Idle"} · {Math.round(api.progressPercent * 100)}%
            </Text>
          )}
        </Timer.Context>
      </Timer.Root>
      <Button variant="outline" onPress={() => setCountdown(!countdown)}>
        {countdown ? "Count up instead" : "Count down instead"}
      </Button>
      <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14 }}>
        Completed: {completions}
      </Text>
    </View>
  )
}

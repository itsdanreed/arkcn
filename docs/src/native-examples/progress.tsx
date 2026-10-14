import { View } from "react-native"
import { useEffect, useState } from "react"
import { Progress } from "@multicomma/arkcn-react-native/ui/progress"
export default function ProgressExample() {
  const [value, setValue] = useState(20)
  useEffect(() => {
    const timer = setInterval(() => setValue((value) => (value >= 100 ? 0 : value + 10)), 800)
    return () => clearInterval(timer)
  }, [])
  return (
    <View style={{ width: 320, maxWidth: "100%", gap: 16 }}>
      <Progress.Root value={value} accessibilityLabel="Progress" style={{ width: 320, maxWidth: "100%" }}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Progress.Root value={value} accessibilityLabel="Circular progress">
        <Progress.Circle>
          <Progress.CircleTrack />
          <Progress.CircleRange />
        </Progress.Circle>
      </Progress.Root>
      <Progress.Root value={null} accessibilityLabel="Loading">
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </View>
  )
}

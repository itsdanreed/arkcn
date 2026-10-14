import * as React from "react"
import { Progress } from "@/components/ui/progress"

export default function ProgressExample() {
  const [value, setValue] = React.useState(20)
  React.useEffect(() => {
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex w-80 max-w-full flex-col gap-4">
      <Progress.Root value={value} className="w-full">
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      <Progress.Root value={value}>
        <Progress.Circle>
          <Progress.CircleTrack />
          <Progress.CircleRange />
        </Progress.Circle>
      </Progress.Root>
      <Progress.Root value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </div>
  )
}

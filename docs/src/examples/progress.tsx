import * as React from "react"
import { Progress } from "@/components/ui/progress"

export default function ProgressExample() {
  const [value, setValue] = React.useState(20)
  React.useEffect(() => {
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 800)
    return () => clearInterval(t)
  }, [])
  return (
    <Progress.Root value={value} className="w-80">
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  )
}

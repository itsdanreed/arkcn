import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const [value, setValue] = useState(25)
  const { trace } = useAuditMotion('[data-slot="progress-indicator"]', 300)
  return (
    <div className="max-w-sm space-y-6">
      {[0, value, 100, null].map((v, i) => (
        <section data-audit-case={String(i)} key={i}>
          <Progress.Root value={v}>
            <Progress.Label>Uploading {i}</Progress.Label>
            <Progress.ValueText />
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </section>
      ))}
      <Button variant="outline" onClick={() => setValue((v) => (v === 25 ? 75 : 25))}>
        Change progress
      </Button>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}

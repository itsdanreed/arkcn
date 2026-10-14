import { useState } from "react"
import { Progress } from "../adapters/progress"
import { Button } from "../adapters/button"
import { useAuditMotion } from "../../src/audit-motion"
export default function Example() {
  const [value, setValue] = useState(25)
  const { trace } = useAuditMotion('[data-slot="progress-indicator"]', 300)
  return (
    <div className="max-w-sm space-y-6">
      {[0, value, 100, null].map((v, i) => (
        <section data-audit-case={String(i)} key={i}>
          <Progress.Root value={v}>
            <Progress.Label>Uploading {i}</Progress.Label>
            <Progress.Value />
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

import { useAuditMotion } from "../../src/audit-motion"
import { useState } from "react"
import { ChartIframe } from "../ui/chart-iframe"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

function Contents() {
  const [count, setCount] = useState(0)
  return (
    <div className="grid gap-3">
      <Label htmlFor="frame-name">Name</Label>
      <Input id="frame-name" placeholder="Inside the frame" />
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <output aria-live="polite">Count: {count}</output>
      </div>
    </div>
  )
}
export default function Example() {
  const { trace } = useAuditMotion('iframe[title="Isolated controls"]', 380)
  const [generation, setGeneration] = useState(0)
  const params = new URLSearchParams(location.search)
  if (params.has("frame-content")) return <Contents />
  params.set("frame-content", "true")
  return (
    <div className="w-full max-w-sm space-y-4">
      <output data-audit-motion hidden>
        {trace}
      </output>
      <Button variant="outline" size="sm" onClick={() => setGeneration(generation + 1)}>
        Reload frame
      </Button>
      <ChartIframe key={generation} src={`./shadcn-reference.html?${params}`} title="Isolated controls" height={240} />
    </div>
  )
}

import { useState } from "react"
import { Button } from "../ui/button"

export default function Example() {
  const [state, setState] = useState("idle")
  return (
    <div className="space-y-4">
      <p>Timer actions</p>
      <div className="flex gap-2" data-audit-part="actions">
        {state === "idle" && (
          <Button variant="outline" size="sm" onClick={() => setState("running")}>
            Start
          </Button>
        )}
        {state === "running" && (
          <Button variant="outline" size="sm" onClick={() => setState("paused")}>
            Pause
          </Button>
        )}
        {state === "paused" && (
          <Button variant="outline" size="sm" onClick={() => setState("running")}>
            Resume
          </Button>
        )}
        {state !== "idle" && (
          <Button variant="outline" size="sm" onClick={() => setState("idle")}>
            Reset
          </Button>
        )}
        <Button variant="outline" size="sm" disabled>
          Unavailable
        </Button>
      </div>
    </div>
  )
}

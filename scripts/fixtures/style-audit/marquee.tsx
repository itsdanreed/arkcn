import { useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export default function Example() {
  const [paused, setPaused] = useState(false)
  const [reverse, setReverse] = useState(false)
  const [vertical, setVertical] = useState(false)
  const [rtl, setRtl] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="outline" size="sm" aria-pressed={reverse} onClick={() => setReverse(!reverse)}>
          Reverse
        </Button>
        <Button variant="outline" size="sm" aria-pressed={vertical} onClick={() => setVertical(!vertical)}>
          Vertical
        </Button>
        <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
          RTL
        </Button>
      </div>
      <div className={vertical ? "flex flex-col items-center gap-4" : "flex items-center gap-4"}>
        {["Acme", "Globex", "Initech"].map((name) => (
          <Badge key={name} variant="secondary">
            {name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

import { useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "../ui/button"

export default function Example() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle sun and moon"
        aria-pressed={on}
        onClick={() => setOn(!on)}
      >
        {on ? <SunIcon /> : <MoonIcon />}
      </Button>
      <Button variant="outline" size="icon" aria-label="Unavailable toggle" disabled>
        <MoonIcon />
      </Button>
    </div>
  )
}

import { useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Swap } from "@/components/ui/swap"
import { useAuditMotion } from "../audit-motion"

export default function Example() {
  const [on, setOn] = useState(false)
  const { trace } = useAuditMotion('[data-slot="swap-indicator"]', 300)
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle sun and moon"
        aria-pressed={on}
        onClick={() => setOn(!on)}
      >
        <Swap.Root swap={on}>
          <Swap.Indicator type="on">
            <SunIcon />
          </Swap.Indicator>
          <Swap.Indicator type="off">
            <MoonIcon />
          </Swap.Indicator>
        </Swap.Root>
      </Button>
      <Button variant="outline" size="icon" aria-label="Unavailable toggle" disabled>
        <Swap.Root>
          <Swap.Indicator type="on">
            <SunIcon />
          </Swap.Indicator>
          <Swap.Indicator type="off">
            <MoonIcon />
          </Swap.Indicator>
        </Swap.Root>
      </Button>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}

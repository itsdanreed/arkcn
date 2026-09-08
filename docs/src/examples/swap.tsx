import * as React from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { Swap } from "@/components/ui/swap"

export default function SwapExample() {
  const [on, setOn] = React.useState(false)
  return (
    <Button variant="outline" size="icon" aria-label="Toggle sun and moon" aria-pressed={on} onClick={() => setOn(!on)}>
      <Swap.Root swap={on} className="text-2xl">
        <Swap.Indicator type="on">
          <SunIcon />
        </Swap.Indicator>
        <Swap.Indicator type="off">
          <MoonIcon />
        </Swap.Indicator>
      </Swap.Root>
    </Button>
  )
}

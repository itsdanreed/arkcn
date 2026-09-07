import * as React from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { Swap, SwapIndicator } from "@/components/ui/swap"

export default function SwapExample() {
  const [on, setOn] = React.useState(false)
  return (
    <Button variant="outline" size="icon" aria-label="Toggle sun and moon" aria-pressed={on} onClick={() => setOn(!on)}>
      <Swap swap={on} className="text-2xl">
        <SwapIndicator type="on">
          <SunIcon />
        </SwapIndicator>
        <SwapIndicator type="off">
          <MoonIcon />
        </SwapIndicator>
      </Swap>
    </Button>
  )
}

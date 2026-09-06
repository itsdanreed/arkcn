import { MoonIcon, SunIcon } from "lucide-react"
import { Swap, SwapIndicator } from "@/components/ui/swap"

export default function SwapExample() {
  return (
    <Swap className="text-2xl">
      <SwapIndicator type="on">
        <SunIcon />
      </SwapIndicator>
      <SwapIndicator type="off">
        <MoonIcon />
      </SwapIndicator>
    </Swap>
  )
}

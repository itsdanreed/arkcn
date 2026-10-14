import { useState } from "react"
import { Maximize2Icon, MinusIcon, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../ui/popover"
import { useAuditMotion } from "../../src/audit-motion"

export default function Example() {
  const [open, setOpen] = useState(false)
  const { trace } = useAuditMotion('[data-slot="popover-content"]')
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>Open panel</PopoverTrigger>
      <PopoverContent align="start">
        <PopoverTitle>Inspector</PopoverTitle>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-xs" aria-label="Minimize">
            <MinusIcon />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Maximize">
            <Maximize2Icon />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Close" onClick={() => setOpen(false)}>
            <XIcon />
          </Button>
        </div>
        <p>Panel details</p>
      </PopoverContent>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </Popover>
  )
}

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { useAuditMotion } from "../../src/audit-motion"
export default function Example() {
  const [open, setOpen] = useState(true)
  const { trace } = useAuditMotion('[data-slot="popover-content"]')
  return (
    <div className="relative h-48">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" size="sm" />}>Toggle toolbar</PopoverTrigger>
        <PopoverContent className="w-max flex-row items-center" align="start">
          <span>3 selected</span>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="sm">
            Archive
          </Button>
          <Button variant="ghost" size="sm" disabled>
            Delete
          </Button>
          <Input aria-label="Filter" className="w-24" defaultValue="abc" />
        </PopoverContent>
      </Popover>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}

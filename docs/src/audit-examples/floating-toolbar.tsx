import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { FloatingToolbar } from "@/components/ui/floating-toolbar"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const [open, setOpen] = useState(true)
  const { trace } = useAuditMotion('[data-slot="floating-toolbar"]')
  return (
    <div className="relative h-48">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        Toggle toolbar
      </Button>
      <FloatingToolbar.Root
        open={open}
        onEscape={() => setOpen(false)}
        className="absolute bottom-4"
        aria-label="Bulk actions"
      >
        <span className="border border-transparent px-2.5">3 selected</span>
        <Separator.Root orientation="vertical" className="h-5 data-vertical:self-center" />
        <Button variant="ghost" size="sm">
          Archive
        </Button>
        <Button variant="ghost" size="sm" disabled>
          Delete
        </Button>
        <Input.Root aria-label="Filter" className="w-24" defaultValue="abc" />
      </FloatingToolbar.Root>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}

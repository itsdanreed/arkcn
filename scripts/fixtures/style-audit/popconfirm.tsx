import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "../ui/popover"
import { Button } from "../ui/button"
import { useAuditMotion } from "../../src/audit-motion"
function Case({ state, onConfirm }: { state: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false)
  const [attempted, setAttempted] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>Open {state}</PopoverTrigger>
      <PopoverContent side="top" sideOffset={8} data-audit-case={state}>
        <PopoverHeader>
          <PopoverTitle>Delete this file?</PopoverTitle>
          <PopoverDescription>It cannot be recovered.</PopoverDescription>
        </PopoverHeader>
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              onConfirm()
              if (state !== "keep-open" || attempted) setOpen(false)
              setAttempted(true)
            }}
          >
            Delete
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
export default function Example() {
  const [status, setStatus] = useState("Ready")
  const { trace } = useAuditMotion('[data-slot="popover-content"]', 300)
  return (
    <div className="flex flex-wrap gap-3 pt-48">
      {["default", "keep-open"].map((state) => (
        <Case key={state} state={state} onConfirm={() => setStatus("Confirmed")} />
      ))}
      <p role="status">{status}</p>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}

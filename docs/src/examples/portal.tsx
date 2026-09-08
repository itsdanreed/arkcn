import * as React from "react"
import { Portal } from "@/components/ui/portal"
import { Button } from "@/components/ui/button"
export default function PortalExample() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show portal content</Button>
      {open && (
        <Portal.Root>
          <div className="fixed right-4 bottom-4 z-50 flex items-center gap-4 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg">
            <span>Rendered outside the preview.</span>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Dismiss portal
            </Button>
          </div>
        </Portal.Root>
      )}
    </>
  )
}

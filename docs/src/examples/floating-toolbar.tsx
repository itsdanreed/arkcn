import { toast } from "sonner"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { FloatingToolbar } from "@/components/ui/floating-toolbar"

export default function FloatingToolbarExample() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="relative flex h-40 w-full max-w-lg items-start justify-center overflow-hidden rounded-lg border p-4">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide" : "Show"} toolbar
      </Button>
      <FloatingToolbar open={open} onEscape={() => setOpen(false)} className="absolute bottom-4">
        <span className="px-2 text-sm">3 selected</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            toast("3 demo items archived")
            setOpen(false)
          }}
        >
          Archive
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            toast("3 demo items deleted")
            setOpen(false)
          }}
        >
          Delete
        </Button>
      </FloatingToolbar>
    </div>
  )
}

import { useAuditMotion } from "../../src/audit-motion"
import { useState } from "react"
import { GripVerticalIcon, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { ItemTitle } from "../ui/item"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable"

// Control reference only: shadcn has no canvas or drag-and-drop layout recipe.
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="button"]')
  const [empty, setEmpty] = useState(false)
  const [grabbed, setGrabbed] = useState<string | null>(null)
  return (
    <div className="space-y-4">
      <output hidden data-audit-motion>
        {trace}
      </output>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEmpty(false)}>
          Reset
        </Button>
        <Button variant="outline" onClick={() => setEmpty(true)}>
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {["Heading", "Paragraph", "Image", "Button"].map((kind) => (
          <Button key={kind} variant="outline" onClick={() => setEmpty(false)}>
            {kind}
          </Button>
        ))}
      </div>
      {empty ? (
        <p className="text-sm text-muted-foreground">Drop a block here</p>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="h-36">
          {["Heading", "Image"]
            .map((kind, index) => (
              <ResizablePanel key={kind} defaultSize="50%" minSize="20%">
                <div className="flex items-center gap-1 p-3">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    aria-label={`Drag ${kind}`}
                    aria-pressed={grabbed === kind}
                    onClick={() => setGrabbed(grabbed === kind ? null : kind)}
                  >
                    <GripVerticalIcon />
                  </Button>
                  <ItemTitle className="min-w-0 flex-1">{kind}</ItemTitle>
                  <Button variant="ghost" size="icon-xs" aria-label={`Remove ${kind}`} onClick={() => setEmpty(true)}>
                    <XIcon />
                  </Button>
                </div>
                {index === 0 && <span className="sr-only">First panel</span>}
              </ResizablePanel>
            ))
            .flatMap((panel, index) =>
              index === 0 ? [panel, <ResizableHandle key="resize" withHandle aria-label="Resize columns" />] : [panel]
            )}
        </ResizablePanelGroup>
      )}
      <p className="text-sm text-muted-foreground">
        Control reference: Button, Item title, and Resizable. Canvas layout and drag states have no shadcn equivalent.
      </p>
    </div>
  )
}

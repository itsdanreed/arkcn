import { Button } from "@/components/ui/button"
import { FloatingPanel } from "@/components/ui/floating-panel"

export default function FloatingPanelExample() {
  return (
    <FloatingPanel.Root>
      <FloatingPanel.Trigger asChild>
        <Button variant="outline">Open panel</Button>
      </FloatingPanel.Trigger>
      <FloatingPanel.Positioner>
        <FloatingPanel.Content>
          <FloatingPanel.DragTrigger>
            <FloatingPanel.Header>
              <FloatingPanel.Title>Inspector</FloatingPanel.Title>
              <FloatingPanel.Control />
            </FloatingPanel.Header>
          </FloatingPanel.DragTrigger>
          <FloatingPanel.Body className="text-sm text-muted-foreground">
            Drag the header, resize from the edges.
          </FloatingPanel.Body>
          <FloatingPanel.ResizeTrigger axis="se" />
        </FloatingPanel.Content>
      </FloatingPanel.Positioner>
    </FloatingPanel.Root>
  )
}

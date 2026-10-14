import { Button } from "@/components/ui/button"
import { FloatingPanel } from "@/components/ui/floating-panel"

export default function FloatingPanelExample() {
  return (
    <FloatingPanel.Root>
      <FloatingPanel.Trigger asChild>
        <Button variant="outline">Open panel</Button>
      </FloatingPanel.Trigger>
      <FloatingPanel.Content>
        <FloatingPanel.Header>
          <FloatingPanel.DragTrigger>
            <FloatingPanel.Title>Inspector</FloatingPanel.Title>
          </FloatingPanel.DragTrigger>
          <FloatingPanel.Control />
        </FloatingPanel.Header>
        <FloatingPanel.Body className="text-sm text-muted-foreground">
          Drag the header, resize from the edges.
        </FloatingPanel.Body>
        <FloatingPanel.ResizeTrigger axis="se" />
      </FloatingPanel.Content>
    </FloatingPanel.Root>
  )
}

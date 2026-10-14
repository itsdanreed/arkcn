import { Button } from "@/components/ui/button"
import { FloatingPanel } from "@/components/ui/floating-panel"
import { useAuditMotion } from "../audit-motion"

export default function Example() {
  const { trace } = useAuditMotion('[data-slot="floating-panel-content"]')
  return (
    <FloatingPanel.Root defaultSize={{ width: 288, height: 200 }} defaultPosition={{ x: 32, y: 68 }}>
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
        <FloatingPanel.Body>Panel details</FloatingPanel.Body>
        <FloatingPanel.ResizeTrigger axis="se" />
      </FloatingPanel.Content>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </FloatingPanel.Root>
  )
}

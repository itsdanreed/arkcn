import { Button } from "@/components/ui/button"
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelContent,
  FloatingPanelControl,
  FloatingPanelDragTrigger,
  FloatingPanelHeader,
  FloatingPanelPositioner,
  FloatingPanelResizeTrigger,
  FloatingPanelTitle,
  FloatingPanelTrigger,
} from "@/components/ui/floating-panel"

export default function FloatingPanelExample() {
  return (
    <FloatingPanel>
      <FloatingPanelTrigger asChild>
        <Button variant="outline">Open panel</Button>
      </FloatingPanelTrigger>
      <FloatingPanelPositioner>
        <FloatingPanelContent>
          <FloatingPanelDragTrigger>
            <FloatingPanelHeader>
              <FloatingPanelTitle>Inspector</FloatingPanelTitle>
              <FloatingPanelControl />
            </FloatingPanelHeader>
          </FloatingPanelDragTrigger>
          <FloatingPanelBody className="text-sm text-muted-foreground">
            Drag the header, resize from the edges.
          </FloatingPanelBody>
          <FloatingPanelResizeTrigger axis="se" />
        </FloatingPanelContent>
      </FloatingPanelPositioner>
    </FloatingPanel>
  )
}

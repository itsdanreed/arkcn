import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"

export default function TooltipExample() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Add to library</Tooltip.Content>
    </Tooltip.Root>
  )
}

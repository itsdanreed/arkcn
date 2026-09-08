import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { ToggleGroup } from "@/components/ui/toggle-group"

export default function ToggleGroupExample() {
  return (
    <ToggleGroup.Root defaultValue={["left"]}>
      <ToggleGroup.Item value="left" aria-label="Align left">
        <AlignLeftIcon />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="center" aria-label="Align center">
        <AlignCenterIcon />
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" aria-label="Align right">
        <AlignRightIcon />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}

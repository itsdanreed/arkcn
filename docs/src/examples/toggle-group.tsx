import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { ToggleGroup } from "@/components/ui/toggle-group"

export default function ToggleGroupExample() {
  return (
    <div className="flex flex-col gap-4">
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
      <ToggleGroup.Root multiple variant="outline" spacing={0} defaultValue={["bold"]}>
        <ToggleGroup.Item value="bold" aria-label="Bold">
          <BoldIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" aria-label="Italic">
          <ItalicIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="underline" aria-label="Underline">
          <UnderlineIcon />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  )
}

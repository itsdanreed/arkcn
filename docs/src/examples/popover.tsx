import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover } from "@/components/ui/popover"

export default function PopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline">Dimensions</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Header>
          <Popover.Title>Dimensions</Popover.Title>
          <Popover.Description>Set the size for the layer.</Popover.Description>
        </Popover.Header>
        <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
          <Label.Root htmlFor="pop-width">Width</Label.Root>
          <Input.Root id="pop-width" defaultValue="100%" />
          <Label.Root htmlFor="pop-height">Height</Label.Root>
          <Input.Root id="pop-height" defaultValue="25px" />
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}

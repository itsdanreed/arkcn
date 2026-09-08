import * as React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu } from "@/components/ui/dropdown-menu"

export default function DropdownMenuExample() {
  const [position, setPosition] = React.useState("bottom")
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.ItemGroup>
          <DropdownMenu.ItemGroupLabel>My account</DropdownMenu.ItemGroupLabel>
          <DropdownMenu.Item value="profile">
            Profile <DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
          </DropdownMenu.Item>
          <DropdownMenu.Item value="billing">Billing</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.RadioItemGroup value={position} onValueChange={({ value }) => setPosition(value)}>
            <DropdownMenu.RadioItem value="top">Top</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="bottom">Bottom</DropdownMenu.RadioItem>
          </DropdownMenu.RadioItemGroup>
        </DropdownMenu.ItemGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

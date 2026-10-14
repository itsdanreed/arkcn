import { useState } from "react"
import { CalendarIcon, UserIcon, LockIcon } from "lucide-react"
import { Command } from "../adapters/command"
import { Button } from "../adapters/button"
const items = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "locked", label: "Locked", icon: LockIcon, disabled: true },
]
function Palette() {
  return (
    <Command.Root className="w-80 border">
      <Command.Input placeholder="Search commands" />
      <Command.Content>
        <Command.Empty>No results found.</Command.Empty>
        <Command.ItemGroup heading="Actions">
          {items.map((item) => (
            <Command.Item
              key={item.value}
              value={item.label}
              disabled={item.disabled}
              data-checked={item.value === "profile"}
            >
              <item.icon />
              {item.label}
              {item.value === "calendar" && <Command.Shortcut>⌘K</Command.Shortcut>}
            </Command.Item>
          ))}
        </Command.ItemGroup>
      </Command.Content>
    </Command.Root>
  )
}
export default function Example() {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-6">
      <section data-audit-case="inline">
        <Palette />
      </section>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open palette
      </Button>
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <section data-audit-case="dialog">
          <Palette />
        </section>
      </Command.Dialog>
    </div>
  )
}

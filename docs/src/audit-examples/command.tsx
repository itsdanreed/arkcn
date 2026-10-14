import { useState } from "react"
import { CalendarIcon, UserIcon, LockIcon } from "lucide-react"
import { Command, useFilter, useListCollection } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
const items = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "locked", label: "Locked", icon: LockIcon, disabled: true },
]
function Palette() {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: items,
    itemToString: (i) => i.label,
    itemToValue: (i) => i.value,
    isItemDisabled: (i) => !!i.disabled,
    filter: contains,
  })
  return (
    <Command.Root collection={collection} className="w-80 border" defaultValue={["profile"]}>
      <Command.Input placeholder="Search commands" onValueChange={filter} />
      <Command.Content>
        <Command.Empty>No results found.</Command.Empty>
        <Command.ItemGroup heading="Actions">
          {collection.items.map((item) => (
            <Command.Item key={item.value} item={item}>
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
      <Command.Dialog open={open} onOpenChange={({ open }) => setOpen(open)}>
        <section data-audit-case="dialog">
          <Palette />
        </section>
      </Command.Dialog>
    </div>
  )
}

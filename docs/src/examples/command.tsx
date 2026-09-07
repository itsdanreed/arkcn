import { CalendarIcon, SmileIcon, UserIcon } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useFilter,
  useListCollection,
} from "@/components/ui/command"

const items = [
  { value: "calendar", label: "Calendar", group: "Suggestions", icon: CalendarIcon },
  { value: "emoji", label: "Search emoji", group: "Suggestions", icon: SmileIcon },
  { value: "profile", label: "Profile", group: "Settings", icon: UserIcon },
]

export default function CommandExample() {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: items,
    itemToString: (i) => i.label,
    itemToValue: (i) => i.value,
    filter: contains,
  })
  return (
    <Command collection={collection} className="w-80 rounded-lg border">
      <CommandInput placeholder="Type a command or search…" onValueChange={filter} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {["Suggestions", "Settings"].map((group) => (
          <CommandGroup key={group} heading={group}>
            {collection.items
              .filter((i) => i.group === group)
              .map((item) => (
                <CommandItem key={item.value} item={item}>
                  <item.icon /> {item.label}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}

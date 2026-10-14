import { useState } from "react"
import { Command, CommandList, CommandGroup, CommandItem, CommandEmpty } from "../ui/command"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
const all = [{ value: "React" }, { value: "Vue" }, { value: "Svelte", disabled: true }, { value: "Solid" }]
export default function Example() {
  const [query, setQuery] = useState("")
  const [value, setValue] = useState(["Vue"])
  const items = all.filter((x) => x.value.toLowerCase().includes(query.toLowerCase()))
  return (
    <section data-audit-case="list" className="flex w-72 max-w-full flex-col gap-2">
      <Label htmlFor="filter">Frameworks</Label>
      <Input id="filter" placeholder="Filter frameworks…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <Command shouldFilter={false} className="h-auto border" tabIndex={0} aria-label="Frameworks">
        <CommandList>
          <CommandEmpty>No frameworks found.</CommandEmpty>
          {items.length > 0 && (
            <CommandGroup heading="Libraries">
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  data-checked={value.includes(item.value)}
                  onSelect={() =>
                    setValue((v) => (v.includes(item.value) ? v.filter((x) => x !== item.value) : [...v, item.value]))
                  }
                >
                  {item.value}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </section>
  )
}

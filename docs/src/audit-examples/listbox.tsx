import { useState } from "react"
import { Listbox, createListCollection } from "@/components/ui/listbox"
import { CheckIcon } from "lucide-react"
const all = [{ value: "React" }, { value: "Vue" }, { value: "Svelte", disabled: true }, { value: "Solid" }]
export default function Example() {
  const [query, setQuery] = useState("")
  const items = all.filter((x) => x.value.toLowerCase().includes(query.toLowerCase()))
  const collection = createListCollection({ items, itemToString: (x) => x.value, itemToValue: (x) => x.value })
  return (
    <section data-audit-case="list" className="w-72 max-w-full">
      <Listbox.Root collection={collection} selectionMode="multiple" defaultValue={["Vue"]}>
        <Listbox.Label>Frameworks</Listbox.Label>
        <Listbox.Input placeholder="Filter frameworks…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Listbox.Content>
          {items.length > 0 && (
            <Listbox.ItemGroup>
              <Listbox.ItemGroupLabel>Libraries</Listbox.ItemGroupLabel>
              {items.map((item) => (
                <Listbox.Item key={item.value} item={item}>
                  <Listbox.ItemText>{item.value}</Listbox.ItemText>
                  <Listbox.ItemIndicator>
                    <CheckIcon />
                  </Listbox.ItemIndicator>
                </Listbox.Item>
              ))}
            </Listbox.ItemGroup>
          )}
          <Listbox.Empty>No frameworks found.</Listbox.Empty>
        </Listbox.Content>
      </Listbox.Root>
    </section>
  )
}

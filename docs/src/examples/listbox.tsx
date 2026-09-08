import { Listbox, useListCollection, useFilter } from "@/components/ui/listbox"
const items = ["React", "Vue", "Svelte", "Solid"]
export default function ListboxExample() {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({ initialItems: items, filter: contains })
  return (
    <Listbox.Root collection={collection} selectionMode="multiple" className="w-72">
      <Listbox.Label>Frameworks</Listbox.Label>
      <Listbox.Input placeholder="Filter frameworks…" onChange={(e) => filter(e.target.value)} />
      <Listbox.Content>
        {collection.items.map((item) => (
          <Listbox.Item key={item} item={item}>
            <Listbox.ItemText>{item}</Listbox.ItemText>
            <Listbox.ItemIndicator>✓</Listbox.ItemIndicator>
          </Listbox.Item>
        ))}
        <Listbox.Empty>No frameworks found.</Listbox.Empty>
      </Listbox.Content>
      <Listbox.ValueText placeholder="Select frameworks" />
    </Listbox.Root>
  )
}

import { Select, createListCollection } from "@/components/ui/select"

const fruits = createListCollection({
  items: [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Blueberry", value: "blueberry" },
    { label: "Grapes", value: "grapes" },
  ],
})

export default function SelectExample() {
  return (
    <Select.Root collection={fruits} defaultValue={["apple"]}>
      <Select.Control>
        <Select.Trigger className="w-48">
          <Select.ValueText placeholder="Pick a fruit" />
        </Select.Trigger>
      </Select.Control>
      <Select.Content>
        <Select.ItemGroup>
          <Select.ItemGroupLabel>Fruits</Select.ItemGroupLabel>
          {fruits.items.map((item) => (
            <Select.Item key={item.value} item={item}>
              {item.label}
            </Select.Item>
          ))}
        </Select.ItemGroup>
      </Select.Content>
    </Select.Root>
  )
}

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
        {fruits.items.map((item) => (
          <Select.Item key={item.value} item={item}>
            <Select.ItemText>{item.label}</Select.ItemText>
            <Select.ItemIndicator />
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from "@/components/ui/select"

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
    <Select collection={fruits} defaultValue={["apple"]}>
      <SelectControl>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {fruits.items.map((item) => (
          <SelectItem key={item.value} item={item}>
            <SelectItemText>{item.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

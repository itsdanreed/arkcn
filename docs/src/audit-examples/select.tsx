import { Select, createListCollection } from "@/components/ui/select"
const collection = createListCollection({
  items: [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Unavailable", value: "disabled", disabled: true },
  ],
})
export default function Example() {
  return (
    <div className="space-y-4">
      {["Placeholder", "Selected", "Invalid", "Disabled", "Small"].map((state) => (
        <section key={state} data-audit-case={state}>
          <Select.Root
            collection={collection}
            defaultValue={state === "Placeholder" ? [] : ["apple"]}
            invalid={state === "Invalid"}
            disabled={state === "Disabled"}
          >
            <Select.Control>
              <Select.Trigger aria-label={state} className="w-48" size={state === "Small" ? "sm" : "default"}>
                <Select.ValueText placeholder="Pick a fruit" />
              </Select.Trigger>
            </Select.Control>
            <Select.Content>
              <Select.ItemGroup>
                <Select.ItemGroupLabel>Fruits</Select.ItemGroupLabel>
                {collection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.ItemGroup>
            </Select.Content>
          </Select.Root>
        </section>
      ))}
    </div>
  )
}

import { Select } from "../adapters/select"
const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Unavailable", value: "disabled", disabled: true },
]
export default function Example() {
  return (
    <div className="space-y-4">
      {["Placeholder", "Selected", "Invalid", "Disabled", "Small"].map((state) => (
        <section key={state} data-audit-case={state}>
          <Select.Root
            items={items}
            defaultValue={state === "Placeholder" ? null : "apple"}
            disabled={state === "Disabled"}
          >
            <Select.Trigger
              aria-invalid={state === "Invalid" || undefined}
              aria-label={state}
              className="w-48"
              size={state === "Small" ? "sm" : "default"}
            >
              <Select.ValueText placeholder="Pick a fruit" />
            </Select.Trigger>
            <Select.Content alignItemWithTrigger={false}>
              <Select.ItemGroup>
                <Select.ItemGroupLabel>Fruits</Select.ItemGroupLabel>
                {items.map((item) => (
                  <Select.Item key={item.value} value={item.value} disabled={item.disabled}>
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

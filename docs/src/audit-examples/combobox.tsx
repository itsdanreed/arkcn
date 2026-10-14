import { Combobox, createListCollection, useComboboxAnchor } from "@/components/ui/combobox"
const languages = ["English", "French", "German", "Japanese", "Spanish"]
const collection = createListCollection({ items: languages })
const cases = ["Default", "Clear", "No trigger", "Disabled", "Invalid", "Custom anchor"]
function Case({ name }: { name: string }) {
  const anchor = useComboboxAnchor()
  return (
    <section data-audit-case={name} className="space-y-2">
      <p className="text-sm">{name}</p>
      <div ref={anchor} className="w-64">
        <Combobox.Root
          collection={collection}
          disabled={name === "Disabled"}
          invalid={name === "Invalid"}
          defaultValue={name === "Clear" ? ["English"] : []}
          openOnClick
          anchor={name === "Custom anchor" ? anchor : undefined}
        >
          <Combobox.Input
            aria-label={name}
            placeholder="Select language"
            className="w-56"
            showTrigger={name !== "No trigger"}
            showClear={name === "Clear"}
          />
          <Combobox.Content>
            <Combobox.List>
              <Combobox.Empty>No language found.</Combobox.Empty>
              {languages.map((language) => (
                <Combobox.Item key={language} item={language}>
                  {language}
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    </section>
  )
}
export default function Example() {
  return (
    <div className="space-y-5">
      {cases.map((name) => (
        <Case key={name} name={name} />
      ))}
    </div>
  )
}

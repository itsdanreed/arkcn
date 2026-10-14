import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
  useComboboxAnchor,
} from "../ui/combobox"
const languages = ["English", "French", "German", "Japanese", "Spanish"]
const cases = ["Default", "Clear", "No trigger", "Disabled", "Invalid", "Custom anchor"]
function Case({ name }: { name: string }) {
  const anchor = useComboboxAnchor()
  return (
    <section data-audit-case={name} className="space-y-2">
      <p className="text-sm">{name}</p>
      <div ref={anchor} className="w-64">
        <Combobox
          items={languages}
          disabled={name === "Disabled"}
          defaultValue={name === "Clear" ? "English" : undefined}
        >
          <ComboboxInput
            disabled={name === "Disabled"}
            aria-label={name}
            aria-invalid={name === "Invalid" || undefined}
            placeholder="Select language"
            className="w-56"
            showTrigger={name !== "No trigger"}
            showClear={name === "Clear"}
          />
          <ComboboxContent anchor={name === "Custom anchor" ? anchor : undefined}>
            <ComboboxEmpty>No language found.</ComboboxEmpty>
            <ComboboxList>
              {(language) => (
                <ComboboxItem key={language} value={language}>
                  {language}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
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

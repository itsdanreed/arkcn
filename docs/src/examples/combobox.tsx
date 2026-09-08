import { useFilter, useListCollection } from "@ark-ui/react"
import { Combobox } from "@/components/ui/combobox"

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Japanese", value: "ja" },
  { label: "Spanish", value: "es" },
]

export default function ComboboxExample() {
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: languages,
    itemToString: (l) => l.label,
    itemToValue: (l) => l.value,
    filter: contains,
  })
  return (
    <Combobox.Root
      collection={collection}
      onInputValueChange={({ inputValue }) => filter(inputValue)}
      onOpenChange={({ open }) => !open && filter("")}
      openOnClick
    >
      <Combobox.Input placeholder="Select language" className="w-56" />
      <Combobox.Content>
        <Combobox.List>
          <Combobox.Empty>No language found.</Combobox.Empty>
          {collection.items.map((language) => (
            <Combobox.Item key={language.value} item={language}>
              {language.label}
            </Combobox.Item>
          ))}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  )
}

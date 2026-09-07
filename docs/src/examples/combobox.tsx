import { useFilter, useListCollection } from "@ark-ui/react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

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
    <Combobox
      collection={collection}
      onInputValueChange={({ inputValue }) => filter(inputValue)}
      onOpenChange={({ open }) => !open && filter("")}
      openOnClick
    >
      <ComboboxInput placeholder="Select language" className="w-56" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No language found.</ComboboxEmpty>
          {collection.items.map((language) => (
            <ComboboxItem key={language.value} item={language}>
              {language.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

import { useFilter, useListCollection } from "@ark-ui/react"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/demo/lib/date-picker"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useForm } from "@/lib/form"

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
]

type AccountFormValues = {
  name: string
  dob: Date | undefined
  language: string
}

function validate(v: AccountFormValues) {
  const errors: Partial<Record<keyof AccountFormValues, string>> = {}
  if (!v.name) errors.name = "Please enter your name."
  else if (v.name.length < 2) errors.name = "Name must be at least 2 characters."
  else if (v.name.length > 30) errors.name = "Name must not be longer than 30 characters."
  if (!v.dob) errors.dob = "Please select your date of birth."
  if (!v.language) errors.language = "Please select a language."
  return errors
}

export function AccountForm() {
  const { values, errors, setValue, handleSubmit } = useForm<AccountFormValues>(
    { name: "", dob: undefined, language: "" },
    validate,
    (data) => showSubmittedData(data)
  )
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection({
    initialItems: languages,
    itemToString: (l) => l.label,
    itemToValue: (l) => l.value,
    filter: contains,
  })

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-8">
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="account-name">Name</FieldLabel>
          <Input
            id="account-name"
            placeholder="Your name"
            value={values.name}
            aria-invalid={!!errors.name || undefined}
            onChange={(e) => setValue("name", e.currentTarget.value)}
          />
          <FieldDescription>This is the name that will be displayed on your profile and in emails.</FieldDescription>
          <FieldError>{errors.name}</FieldError>
        </Field>

        <Field data-invalid={!!errors.dob || undefined}>
          <FieldLabel htmlFor="account-dob">Date of birth</FieldLabel>
          <DatePicker
            id="account-dob"
            selected={values.dob}
            onSelect={(date) => setValue("dob", date)}
            invalid={!!errors.dob}
          />
          <FieldDescription>Your date of birth is used to calculate your age.</FieldDescription>
          <FieldError>{errors.dob}</FieldError>
        </Field>

        <Field data-invalid={!!errors.language || undefined}>
          <FieldLabel htmlFor="account-language">Language</FieldLabel>
          <Combobox
            collection={collection}
            value={values.language ? [values.language] : []}
            onValueChange={({ value }) => setValue("language", value[0] ?? "")}
            onInputValueChange={({ inputValue }) => filter(inputValue)}
            onOpenChange={({ open }) => open && filter("")}
            openOnClick
            invalid={!!errors.language}
            ids={{ input: "account-language" }}
          >
            <ComboboxInput placeholder="Select language" className="w-50" />
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
          <FieldDescription>This is the language that will be used in the dashboard.</FieldDescription>
          <FieldError>{errors.language}</FieldError>
        </Field>

        <div>
          <Button type="submit">Update account</Button>
        </div>
      </FieldGroup>
    </form>
  )
}

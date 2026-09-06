import { Button } from "@/components/ui/button"
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox"
import { FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useForm } from "@/lib/form"

const items = [
  { id: "recents", label: "Recents" },
  { id: "home", label: "Home" },
  { id: "applications", label: "Applications" },
  { id: "desktop", label: "Desktop" },
  { id: "downloads", label: "Downloads" },
  { id: "documents", label: "Documents" },
]

type DisplayFormValues = { items: string[] }

export function DisplayForm() {
  const { values, errors, setValue, handleSubmit } = useForm<DisplayFormValues>(
    { items: ["recents", "home"] },
    (v) => (v.items.length ? {} : { items: "You have to select at least one item." }),
    (data) => showSubmittedData(data)
  )

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-8">
        <FieldSet data-invalid={!!errors.items || undefined}>
          <div className="mb-2">
            <FieldLegend>Sidebar</FieldLegend>
            <FieldDescription>Select the items you want to display in the sidebar.</FieldDescription>
          </div>
          <CheckboxGroup
            value={values.items}
            onValueChange={(next) => setValue("items", next)}
            className="flex flex-col gap-3"
          >
            {items.map((item) => (
              <Checkbox key={item.id} value={item.id}>
                {item.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
          <FieldError>{errors.items}</FieldError>
        </FieldSet>

        <div>
          <Button type="submit">Update display</Button>
        </div>
      </FieldGroup>
    </form>
  )
}

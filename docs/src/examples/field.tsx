import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FieldExample() {
  return (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="field-name">Display name</FieldLabel>
        <Input id="field-name" placeholder="Alex Morgan" />
        <FieldDescription>Shown on your profile and in emails.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="field-email">Email</FieldLabel>
        <Input id="field-email" aria-invalid defaultValue="not-an-email" />
        <FieldError>That does not look like an email address.</FieldError>
      </Field>
    </FieldGroup>
  )
}

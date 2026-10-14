import { UserIcon } from "lucide-react"
import { Field } from "../adapters/field"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
export default function Example() {
  return (
    <div className="space-y-8">
      {(["vertical", "horizontal", "responsive"] as const).map((orientation) => (
        <Field.Group key={orientation} data-audit-case={orientation} className="max-w-lg">
          <Field.Root orientation={orientation}>
            <Field.Label>
              <UserIcon className="size-4" />
              Name
            </Field.Label>
            <Input placeholder="Alex Morgan" />
            <Field.Description>Visible to your team.</Field.Description>
          </Field.Root>
          <Field.Root orientation={orientation} data-disabled="true">
            <Field.Content>
              <Field.Title>Disabled title</Field.Title>
              <Field.Description>Cannot be edited.</Field.Description>
            </Field.Content>
            <Input defaultValue="Locked" disabled />
          </Field.Root>
          <Field.Root orientation={orientation} data-invalid="true">
            <Field.Label>Email</Field.Label>
            <Input defaultValue="invalid" aria-invalid="true" />
            <Field.Error
              errors={[
                { message: "Enter an email." },
                { message: "Use your work address." },
                { message: "Enter an email." },
              ]}
            />
          </Field.Root>
        </Field.Group>
      ))}
      <Field.Group data-audit-case="textarea" className="max-w-lg">
        <Field.Root data-invalid="true">
          <Field.Label>Notes</Field.Label>
          <Textarea defaultValue="Invalid notes" aria-invalid="true" />
          <Field.Error>More detail is required.</Field.Error>
        </Field.Root>
        <Field.Separator>Or</Field.Separator>
      </Field.Group>
    </div>
  )
}

import { UserIcon } from "lucide-react"
import { Field } from "@/components/ui/field"
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
            <Field.Input placeholder="Alex Morgan" />
            <Field.HelperText>Visible to your team.</Field.HelperText>
          </Field.Root>
          <Field.Root orientation={orientation} disabled>
            <Field.Content>
              <Field.Title>Disabled title</Field.Title>
              <Field.HelperText>Cannot be edited.</Field.HelperText>
            </Field.Content>
            <Field.Input defaultValue="Locked" />
          </Field.Root>
          <Field.Root orientation={orientation} invalid>
            <Field.Label>Email</Field.Label>
            <Field.Input defaultValue="invalid" />
            <Field.ErrorText
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
        <Field.Root invalid>
          <Field.Label>Notes</Field.Label>
          <Field.Textarea defaultValue="Invalid notes" />
          <Field.ErrorText>More detail is required.</Field.ErrorText>
        </Field.Root>
        <Field.Separator>Or</Field.Separator>
      </Field.Group>
    </div>
  )
}

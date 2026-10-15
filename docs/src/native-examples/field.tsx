import { Field } from "@multicomma/arkcn-react-native/ui/field"
export default function FieldExample() {
  return (
    <Field.Group style={{ width: 320, maxWidth: "100%" }}>
      <Field.Root required>
        <Field.Label>
          Display name <Field.RequiredIndicator />
        </Field.Label>
        <Field.Input placeholder="Alex Morgan" />
        <Field.HelperText>Shown on your profile and in emails.</Field.HelperText>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Field.Input defaultValue="not-an-email" autoCapitalize="none" keyboardType="email-address" />
        <Field.ErrorText>That does not look like an email address.</Field.ErrorText>
      </Field.Root>
    </Field.Group>
  )
}

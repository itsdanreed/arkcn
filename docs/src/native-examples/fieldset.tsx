import { useState } from "react"
import { View } from "react-native"
import { Fieldset } from "@multicomma/arkcn-react-native/ui/fieldset"
import { Field } from "@multicomma/arkcn-react-native/ui/field"
import { Button } from "@multicomma/arkcn-react-native/ui/button"
export default function FieldsetExample() {
  const [disabled, setDisabled] = useState(false)
  return (
    <View style={{ width: 320, maxWidth: "100%", gap: 16 }}>
      <Fieldset.Root disabled={disabled}>
        <Fieldset.Legend>Contact details</Fieldset.Legend>
        <Fieldset.HelperText>Where we can reach you.</Fieldset.HelperText>
        <Field.Root required>
          <Field.Label>
            Email <Field.RequiredIndicator />
          </Field.Label>
          <Field.Input autoCapitalize="none" keyboardType="email-address" placeholder="alex@example.com" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Message</Field.Label>
          <Field.Textarea placeholder="Your message" />
        </Field.Root>
      </Fieldset.Root>
      <Button variant="outline" onPress={() => setDisabled(!disabled)}>
        {disabled ? "Enable fields" : "Disable fields"}
      </Button>
    </View>
  )
}

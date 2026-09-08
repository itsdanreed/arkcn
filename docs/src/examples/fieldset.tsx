import * as React from "react"
import { Fieldset } from "@/components/ui/fieldset"
import { Field } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
export default function FieldsetExample() {
  const [disabled, setDisabled] = React.useState(false)
  return (
    <div className="flex w-80 flex-col gap-4">
      <Fieldset.Root disabled={disabled}>
        <Fieldset.Legend>Contact details</Fieldset.Legend>
        <Fieldset.HelperText>Where we can reach you.</Fieldset.HelperText>
        <Field.Root required>
          <Field.Label>
            Email <Field.RequiredIndicator />
          </Field.Label>
          <Field.Input type="email" placeholder="alex@example.com" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Message</Field.Label>
          <Field.Textarea placeholder="Your message" />
        </Field.Root>
      </Fieldset.Root>
      <Button variant="outline" onClick={() => setDisabled(!disabled)}>
        {disabled ? "Enable fields" : "Disable fields"}
      </Button>
    </div>
  )
}

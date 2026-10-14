import { Fieldset } from "@/components/ui/fieldset"
import { Input } from "@/components/ui/input"
export default function Example() {
  return (
    <div className="space-y-6">
      {["default", "disabled", "invalid"].map((state) => (
        <section key={state} data-audit-case={state}>
          <Fieldset.Root disabled={state === "disabled"} invalid={state === "invalid"}>
            <Fieldset.Legend>{state} contact details</Fieldset.Legend>
            <Fieldset.HelperText>
              Where we can reach you. <a href="#details">Learn more</a>
            </Fieldset.HelperText>
            <Input.Root
              aria-label={state + " email"}
              placeholder="Email"
              aria-invalid={state === "invalid" || undefined}
            />
            <Fieldset.ErrorText>Please enter a valid email.</Fieldset.ErrorText>
          </Fieldset.Root>
        </section>
      ))}
    </div>
  )
}

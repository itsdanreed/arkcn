import { FieldSet, FieldLegend, FieldDescription, FieldError } from "../ui/field"
import { Input } from "../ui/input"
export default function Example() {
  return (
    <div className="space-y-6">
      {["default", "disabled", "invalid"].map((state) => (
        <section key={state} data-audit-case={state}>
          <FieldSet disabled={state === "disabled"}>
            <FieldLegend>{state} contact details</FieldLegend>
            <FieldDescription>
              Where we can reach you. <a href="#details">Learn more</a>
            </FieldDescription>
            <Input aria-label={state + " email"} placeholder="Email" aria-invalid={state === "invalid" || undefined} />
            {state === "invalid" && <FieldError>Please enter a valid email.</FieldError>}
          </FieldSet>
        </section>
      ))}
    </div>
  )
}

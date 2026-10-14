import { PasswordInput } from "@/components/ui/password-input"
export default function Example() {
  return (
    <div className="space-y-5">
      {(["default", "disabled", "invalid", "readonly", "empty"] as const).map((state) => (
        <section key={state} data-audit-case={state}>
          <PasswordInput.Root
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
          >
            <PasswordInput.Label>{state} password</PasswordInput.Label>
            <PasswordInput.Control data-audit-part="surface">
              <PasswordInput.Input
                data-audit-part="input"
                defaultValue={state === "empty" ? "" : "example123"}
                placeholder="Password"
              />
              <PasswordInput.VisibilityTrigger />
            </PasswordInput.Control>
          </PasswordInput.Root>
        </section>
      ))}
    </div>
  )
}

import { NumberInput } from "@/components/ui/number-input"
export default function Example() {
  return (
    <div className="space-y-5">
      {(["default", "disabled", "invalid", "readonly", "empty"] as const).map((state) => (
        <section key={state} data-audit-case={state}>
          <NumberInput.Root
            defaultValue={state === "empty" ? "" : "5"}
            min={0}
            max={10}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
          >
            <NumberInput.Label>{state} quantity</NumberInput.Label>
            <NumberInput.Control data-audit-part="surface">
              <NumberInput.Input data-audit-part="input" placeholder="Quantity" />
              <NumberInput.Triggers />
            </NumberInput.Control>
          </NumberInput.Root>
        </section>
      ))}
    </div>
  )
}

import { Input } from "../ui/input"
import { Label } from "../ui/label"
export default function Example() {
  return (
    <div className="space-y-5">
      {(["default", "disabled", "invalid", "readonly", "empty"] as const).map((state) => (
        <section key={state} data-audit-case={state}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={state}>{state} quantity</Label>
            <Input
              id={state}
              data-audit-part="surface"
              type="text"
              inputMode="decimal"
              defaultValue={state === "empty" ? "" : "5"}
              disabled={state === "disabled"}
              aria-invalid={state === "invalid"}
              readOnly={state === "readonly"}
              placeholder="Quantity"
            />
          </div>
        </section>
      ))}
    </div>
  )
}

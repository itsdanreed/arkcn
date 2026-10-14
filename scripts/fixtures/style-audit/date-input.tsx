import { Input } from "../ui/input"
import { Label } from "../ui/label"
export default function Example() {
  return (
    <div className="w-72 max-w-full space-y-5">
      {["default", "empty", "disabled", "invalid", "readonly"].map((state) => (
        <section key={state} data-audit-case={state} className="flex flex-col gap-1.5">
          <Label htmlFor={state}>{state} date</Label>
          <Input
            id={state}
            defaultValue={state === "empty" ? "" : "10/13/2026"}
            placeholder="mm/dd/yyyy"
            disabled={state === "disabled"}
            readOnly={state === "readonly"}
            aria-invalid={state === "invalid" || undefined}
          />
        </section>
      ))}
    </div>
  )
}

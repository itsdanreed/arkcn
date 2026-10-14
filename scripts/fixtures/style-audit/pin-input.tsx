import { Input } from "../ui/input"
import { Label } from "../ui/label"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "empty", "disabled", "invalid", "masked"].map((state) => (
        <section key={state} data-audit-case={state} className="flex flex-col gap-1.5">
          <Label htmlFor={state + "0"}>{state} code</Label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                id={state + index}
                aria-label={state + " digit " + (index + 1)}
                className="w-8 px-0 text-center text-sm"
                maxLength={1}
                defaultValue={state === "empty" ? "" : String(index + 1)}
                disabled={state === "disabled"}
                aria-invalid={state === "invalid" || undefined}
                type={state === "masked" ? "password" : "text"}
                placeholder="○"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

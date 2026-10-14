import { XIcon } from "lucide-react"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"

export default function Example() {
  return (
    <div className="w-80 max-w-full space-y-5">
      {["default", "disabled", "readonly", "invalid"].map((state) => (
        <section key={state} data-audit-case={state} className="flex flex-col gap-1.5">
          <Label htmlFor={state}>{state} signature</Label>
          <Textarea
            id={state}
            data-audit-part="surface"
            disabled={state === "disabled"}
            readOnly={state === "readonly"}
            aria-invalid={state === "invalid" || undefined}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Clear ${state}`}
            disabled={state === "disabled" || state === "readonly"}
          >
            <XIcon />
          </Button>
        </section>
      ))}
    </div>
  )
}

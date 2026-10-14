import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
export default function Example() {
  return (
    <div className="space-y-6">
      {["default", "half", "disabled", "readonly"].map((state) => (
        <section key={state} data-audit-case={state} className="flex flex-col gap-1.5">
          <Label id={`rating-${state}`}>{state}</Label>
          <RadioGroup
            aria-labelledby={`rating-${state}`}
            className="flex gap-0.5"
            defaultValue="3"
            disabled={state === "disabled"}
            readOnly={state === "readonly"}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <RadioGroupItem key={value} value={String(value)} aria-label={`${value} stars`} />
            ))}
          </RadioGroup>
        </section>
      ))}
    </div>
  )
}

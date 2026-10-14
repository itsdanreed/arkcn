import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
export default function Example() {
  return (
    <div className="space-y-6">
      {[false, true].map((invalid) => (
        <div key={String(invalid)} data-audit-case={invalid ? "Invalid" : "Default"}>
          <RadioGroup defaultValue="Checked">
            <span className="text-sm font-medium">{invalid ? "Invalid" : "Default"}</span>
            {["Unchecked", "Checked", "Disabled"].map((name) => (
              <label key={name} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={name} disabled={name === "Disabled"} aria-invalid={invalid || undefined} />
                {name}
              </label>
            ))}
          </RadioGroup>
        </div>
      ))}
    </div>
  )
}

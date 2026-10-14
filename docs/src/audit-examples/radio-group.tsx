import { RadioGroup } from "@/components/ui/radio-group"
export default function Example() {
  return (
    <div className="space-y-6">
      {[false, true].map((invalid) => (
        <div key={String(invalid)} data-audit-case={invalid ? "Invalid" : "Default"}>
          <RadioGroup.Root invalid={invalid} defaultValue="Checked">
            <RadioGroup.Label>{invalid ? "Invalid" : "Default"}</RadioGroup.Label>
            {["Unchecked", "Checked", "Disabled"].map((name) => (
              <RadioGroup.Item key={name} value={name} disabled={name === "Disabled"}>
                {name}
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
        </div>
      ))}
    </div>
  )
}

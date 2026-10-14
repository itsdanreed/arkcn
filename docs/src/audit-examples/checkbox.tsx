import { Checkbox } from "@/components/ui/checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
const states = [
  { name: "Unchecked", checked: false },
  { name: "Checked", checked: true },
  { name: "Mixed", checked: "indeterminate" },
  { name: "Invalid", checked: false, invalid: true },
  { name: "Invalid checked", checked: true, invalid: true },
  { name: "Invalid mixed", checked: "indeterminate", invalid: true },
  { name: "Disabled", checked: false, disabled: true },
  { name: "Disabled checked", checked: true, disabled: true },
] as const
export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      {states.map((state) => {
        const disabled = "disabled" in state && state.disabled
        const invalid = "invalid" in state && state.invalid
        return (
          <div key={state.name} data-audit-case={state.name}>
            <Checkbox.Root disabled={disabled} invalid={invalid} defaultChecked={state.checked}>
              <Checkbox.Control>
                <Checkbox.Indicator>
                  <CheckIcon />
                </Checkbox.Indicator>
                <Checkbox.Indicator indeterminate>
                  <MinusIcon />
                </Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>{state.name}</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
          </div>
        )
      })}
    </div>
  )
}

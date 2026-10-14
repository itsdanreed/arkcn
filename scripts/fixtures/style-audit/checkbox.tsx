import { Checkbox } from "../ui/checkbox"
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
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                disabled={disabled}
                aria-invalid={invalid || undefined}
                defaultChecked={state.checked === true}
                indeterminate={state.checked === "indeterminate"}
              />
              {state.name}
            </label>
          </div>
        )
      })}
    </div>
  )
}

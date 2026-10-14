import { Switch } from "../ui/switch"
const states = [
  { name: "Unchecked", checked: false },
  { name: "Checked", checked: true },
  { name: "Invalid", checked: false, invalid: true },
  { name: "Invalid checked", checked: true, invalid: true },
  { name: "Disabled", checked: false, disabled: true },
  { name: "Disabled checked", checked: true, disabled: true },
  { name: "Small", checked: false, size: "sm" },
  { name: "Small checked", checked: true, size: "sm" },
] as const
export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      {states.map((state) => {
        const size = "size" in state ? state.size : "default"
        const disabled = "disabled" in state && state.disabled
        const invalid = "invalid" in state && state.invalid
        return (
          <div key={state.name} data-audit-case={state.name}>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                size={size}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                defaultChecked={state.checked}
              />
              {state.name}
            </label>
          </div>
        )
      })}
    </div>
  )
}

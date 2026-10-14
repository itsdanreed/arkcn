import { Label } from "../adapters/label"
import { Input } from "../adapters/input"
export default function Example() {
  return (
    <div className="grid max-w-sm gap-6">
      {["enabled", "disabled"].map((state) => (
        <div
          data-audit-case={state}
          key={state}
          className="group space-y-2"
          data-disabled={state === "disabled" ? "true" : undefined}
        >
          <Label.Root htmlFor={state}>Group {state}</Label.Root>
          <Input.Root id={state} disabled={state === "disabled"} />
        </div>
      ))}
      {[false, true].map((disabled) => (
        <div data-audit-case={"peer-" + disabled} key={String(disabled)} className="space-y-2">
          <Input.Root className="peer" id={"peer-" + disabled} disabled={disabled} />
          <Label.Root htmlFor={"peer-" + disabled}>Peer label</Label.Root>
        </div>
      ))}
    </div>
  )
}

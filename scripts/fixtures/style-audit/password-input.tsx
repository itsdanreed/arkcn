import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "../ui/input-group"
import { Label } from "../ui/label"
function Password({ state }: { state: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <section data-audit-case={state}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={state}>{state} password</Label>
        <InputGroup data-audit-part="surface">
          <InputGroupInput
            id={state}
            data-audit-part="input"
            type={visible ? "text" : "password"}
            defaultValue={state === "empty" ? "" : "example123"}
            disabled={state === "disabled"}
            aria-invalid={state === "invalid"}
            readOnly={state === "readonly"}
            placeholder="Password"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              disabled={state === "disabled"}
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  )
}
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "disabled", "invalid", "readonly", "empty"].map((state) => (
        <Password key={state} state={state} />
      ))}
    </div>
  )
}

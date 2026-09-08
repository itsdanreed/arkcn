import * as React from "react"
import { Switch } from "@/components/ui/switch"

export default function SwitchExample() {
  const [on, setOn] = React.useState(true)
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch.Root checked={on} onCheckedChange={({ checked }) => setOn(checked)}>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.HiddenInput />
      </Switch.Root>
      Notifications {on ? "on" : "off"}
    </label>
  )
}

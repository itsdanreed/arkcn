import { useState } from "react"
import { Switch } from "@multicomma/arkcn-react-native/ui/switch"
export default function SwitchExample() {
  const [checked, setChecked] = useState(true)
  return (
    <Switch.Root checked={checked} onCheckedChange={({ checked }) => setChecked(checked)}>
      <Switch.Control />
      <Switch.Label style={{ lineHeight: 20 }}>Notifications {checked ? "on" : "off"}</Switch.Label>
    </Switch.Root>
  )
}
